
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MemoryRequest {
  action: 'add_memory' | 'share_knowledge' | 'optimize_memory' | 'get_relevant_memories';
  projectId: string;
  agentId: string;
  data?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, projectId, agentId, data }: MemoryRequest = await req.json()

    console.log(`Manager Agent Memory - Action: ${action}, Project: ${projectId}, Agent: ${agentId}`)

    switch (action) {
      case 'add_memory': {
        const { memory_type, context_key, context_data, relevance_score = 1.0, tags = [] } = data

        const { data: memory, error } = await supabaseClient
          .from('agent_memory_contexts')
          .insert({
            agent_id: agentId,
            project_id: projectId,
            memory_type,
            context_key,
            context_data,
            relevance_score,
            tags
          })
          .select()
          .single()

        if (error) throw error

        // Log the memory creation
        console.log(`Memory created for agent ${agentId}: ${context_key}`)

        return new Response(JSON.stringify({ success: true, memory }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'share_knowledge': {
        const { source_agent_id, target_agent_id, knowledge_type, knowledge_data, relevance_score = 1.0 } = data

        // Manager Agent shares knowledge between agents
        const { data: sharedKnowledge, error } = await supabaseClient
          .from('agent_knowledge_sharing')
          .insert({
            source_agent_id,
            target_agent_id,
            knowledge_type,
            knowledge_data,
            shared_by_manager: true,
            relevance_score,
            project_context: projectId
          })
          .select()
          .single()

        if (error) throw error

        console.log(`Knowledge shared from ${source_agent_id} to ${target_agent_id}: ${knowledge_type}`)

        return new Response(JSON.stringify({ success: true, sharedKnowledge }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'optimize_memory': {
        // Get old memories for compression
        const { data: oldMemories, error: fetchError } = await supabaseClient
          .from('agent_memory_contexts')
          .select('*')
          .eq('agent_id', agentId)
          .eq('project_id', projectId)
          .lt('last_accessed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 days old
          .order('relevance_score', { ascending: true })

        if (fetchError) throw fetchError

        if (oldMemories && oldMemories.length > 0) {
          // Compress less relevant memories
          const memoriesToCompress = oldMemories.filter(m => m.relevance_score < 0.5)
          
          for (const memory of memoriesToCompress) {
            // Create a compressed summary
            const compressedData = {
              original_context_key: memory.context_key,
              summary: `Compressed memory from ${memory.created_at}`,
              original_relevance: memory.relevance_score,
              compressed_at: new Date().toISOString()
            }

            await supabaseClient
              .from('agent_memory_contexts')
              .update({
                context_data: compressedData,
                relevance_score: memory.relevance_score * 0.5, // Reduce relevance
                tags: [...memory.tags, 'compressed']
              })
              .eq('id', memory.id)
          }

          // Log optimization
          const { error: logError } = await supabaseClient
            .from('agent_memory_optimization')
            .insert({
              agent_id: agentId,
              optimization_type: 'compression',
              memories_processed: oldMemories.length,
              memories_compressed: memoriesToCompress.length,
              space_saved_bytes: memoriesToCompress.length * 1024, // Estimate
              optimization_summary: {
                threshold_days: 30,
                relevance_threshold: 0.5,
                compression_ratio: memoriesToCompress.length / oldMemories.length
              }
            })

          if (logError) console.error('Failed to log optimization:', logError)

          console.log(`Optimized ${memoriesToCompress.length} memories for agent ${agentId}`)

          return new Response(JSON.stringify({ 
            success: true, 
            compressed: memoriesToCompress.length,
            total_processed: oldMemories.length
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify({ success: true, compressed: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_relevant_memories': {
        const { memory_type, tags, limit = 10 } = data

        let query = supabaseClient
          .from('agent_memory_contexts')
          .select('*')
          .eq('agent_id', agentId)
          .eq('project_id', projectId)
          .order('relevance_score', { ascending: false })
          .limit(limit)

        if (memory_type) {
          query = query.eq('memory_type', memory_type)
        }

        if (tags && tags.length > 0) {
          query = query.overlaps('tags', tags)
        }

        const { data: memories, error } = await query

        if (error) throw error

        // Update access times for retrieved memories
        if (memories && memories.length > 0) {
          await supabaseClient
            .from('agent_memory_contexts')
            .update({ last_accessed_at: new Date().toISOString() })
            .in('id', memories.map(m => m.id))
        }

        return new Response(JSON.stringify({ success: true, memories }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Manager Agent Memory Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
