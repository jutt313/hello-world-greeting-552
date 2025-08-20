
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExpertiseRequest {
  action: 'learn_pattern' | 'apply_pattern' | 'update_effectiveness' | 'get_best_patterns';
  agentId: string;
  projectId?: string;
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

    const { action, agentId, projectId, data }: ExpertiseRequest = await req.json()

    console.log(`Agent Expertise Learning - Action: ${action}, Agent: ${agentId}`)

    switch (action) {
      case 'learn_pattern': {
        const { 
          expertise_category, 
          pattern_name, 
          pattern_description, 
          pattern_data, 
          conditions = [], 
          prerequisites = [], 
          optimization_tips = [] 
        } = data

        // Check if pattern already exists
        const { data: existingPattern } = await supabaseClient
          .from('agent_expertise_patterns')
          .select('*')
          .eq('agent_id', agentId)
          .eq('pattern_name', pattern_name)
          .single()

        if (existingPattern) {
          // Update existing pattern
          const { data: updatedPattern, error } = await supabaseClient
            .from('agent_expertise_patterns')
            .update({
              pattern_data: { ...existingPattern.pattern_data, ...pattern_data },
              updated_at: new Date().toISOString(),
              metadata: {
                ...existingPattern.metadata,
                conditions: Array.from(new Set([...existingPattern.metadata.conditions, ...conditions])),
                prerequisites: Array.from(new Set([...existingPattern.metadata.prerequisites, ...prerequisites])),
                optimization_tips: Array.from(new Set([...existingPattern.metadata.optimization_tips, ...optimization_tips]))
              }
            })
            .eq('id', existingPattern.id)
            .select()
            .single()

          if (error) throw error

          console.log(`Updated expertise pattern: ${pattern_name}`)
          return new Response(JSON.stringify({ success: true, pattern: updatedPattern, updated: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        } else {
          // Create new pattern
          const { data: newPattern, error } = await supabaseClient
            .from('agent_expertise_patterns')
            .insert({
              agent_id: agentId,
              expertise_category,
              pattern_name,
              pattern_description,
              pattern_data,
              success_rate: 0,
              usage_count: 0,
              projects_applied: projectId ? [projectId] : [],
              effectiveness_score: 0.5, // Start with neutral effectiveness
              metadata: {
                conditions,
                prerequisites,
                common_errors: [],
                optimization_tips
              }
            })
            .select()
            .single()

          if (error) throw error

          console.log(`Learned new expertise pattern: ${pattern_name}`)
          return new Response(JSON.stringify({ success: true, pattern: newPattern, created: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
      }

      case 'apply_pattern': {
        const { pattern_id, success } = data

        const { data: pattern, error: fetchError } = await supabaseClient
          .from('agent_expertise_patterns')
          .select('*')
          .eq('id', pattern_id)
          .single()

        if (fetchError) throw fetchError

        // Calculate new success rate
        const totalApplications = pattern.usage_count + 1
        const successfulApplications = Math.floor(pattern.success_rate * pattern.usage_count / 100) + (success ? 1 : 0)
        const newSuccessRate = (successfulApplications / totalApplications) * 100

        // Update effectiveness score based on recent success
        const recentSuccessWeight = 0.3 // Recent success has 30% weight
        const newEffectivenessScore = Math.min(1.0, 
          pattern.effectiveness_score * (1 - recentSuccessWeight) + 
          (success ? 1.0 : 0.2) * recentSuccessWeight
        )

        // Add project to applied list if provided
        const updatedProjectsApplied = projectId && !pattern.projects_applied.includes(projectId)
          ? [...pattern.projects_applied, projectId]
          : pattern.projects_applied

        const { data: updatedPattern, error: updateError } = await supabaseClient
          .from('agent_expertise_patterns')
          .update({
            usage_count: totalApplications,
            success_rate: newSuccessRate,
            effectiveness_score: newEffectivenessScore,
            projects_applied: updatedProjectsApplied,
            last_applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', pattern_id)
          .select()
          .single()

        if (updateError) throw updateError

        console.log(`Applied pattern ${pattern.pattern_name}: success=${success}, new effectiveness=${newEffectivenessScore}`)

        return new Response(JSON.stringify({ success: true, pattern: updatedPattern }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'update_effectiveness': {
        const { pattern_id, feedback_score, common_error } = data

        const { data: pattern, error: fetchError } = await supabaseClient
          .from('agent_expertise_patterns')
          .select('*')
          .eq('id', pattern_id)
          .single()

        if (fetchError) throw fetchError

        // Update effectiveness based on feedback
        const feedbackWeight = 0.2
        const newEffectivenessScore = Math.max(0.0, Math.min(1.0,
          pattern.effectiveness_score * (1 - feedbackWeight) + feedback_score * feedbackWeight
        ))

        // Add common error if provided
        const updatedMetadata = { ...pattern.metadata }
        if (common_error && !updatedMetadata.common_errors.includes(common_error)) {
          updatedMetadata.common_errors.push(common_error)
        }

        const { data: updatedPattern, error: updateError } = await supabaseClient
          .from('agent_expertise_patterns')
          .update({
            effectiveness_score: newEffectivenessScore,
            metadata: updatedMetadata,
            updated_at: new Date().toISOString()
          })
          .eq('id', pattern_id)
          .select()
          .single()

        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true, pattern: updatedPattern }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_best_patterns': {
        const { expertise_category, limit = 5 } = data

        let query = supabaseClient
          .from('agent_expertise_patterns')
          .select('*')
          .eq('agent_id', agentId)
          .gte('effectiveness_score', 0.6) // Only high-effectiveness patterns
          .order('effectiveness_score', { ascending: false })
          .limit(limit)

        if (expertise_category) {
          query = query.eq('expertise_category', expertise_category)
        }

        const { data: patterns, error } = await query

        if (error) throw error

        return new Response(JSON.stringify({ success: true, patterns }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Agent Expertise Learning Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
