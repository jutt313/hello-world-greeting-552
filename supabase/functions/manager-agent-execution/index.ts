
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { 
      action, 
      user_id, 
      project_id, 
      session_id,
      message, 
      llm_provider_id,
      provider_name,
      has_project_context 
    } = await req.json()

    console.log('Manager Agent request:', { action, user_id, project_id, provider_name })

    if (action === 'chat') {
      // Get LLM provider details
      const { data: provider, error: providerError } = await supabaseClient
        .from('llm_providers')
        .select('*')
        .eq('id', llm_provider_id)
        .single()

      if (providerError || !provider) {
        throw new Error('LLM provider not found')
      }

      // Get project context if available
      let projectContext = ''
      if (has_project_context && project_id) {
        const { data: files, error: filesError } = await supabaseClient
          .from('agent_file_operations')
          .select('file_path, file_content_after, programming_language')
          .eq('project_id', project_id)
          .limit(10)

        if (!filesError && files && files.length > 0) {
          projectContext = `\n\nProject Context:\n${files.map(f => 
            `File: ${f.file_path} (${f.programming_language})\nContent:\n${f.file_content_after?.substring(0, 1000)}...`
          ).join('\n\n')}`
        }
      }

      // Save user message first
      if (session_id) {
        await supabaseClient
          .from('chat_messages')
          .insert({
            session_id: session_id,
            content: message,
            sender_type: 'user',
            message_type: 'text',
            tokens_used: 0,
            cost: 0
          })
      }

      const systemPrompt = `You are the Manager Agent - the supreme orchestrator of the Code-XI AI development platform. You are responsible for:

1. PROJECT LEADERSHIP: Leading all software development projects from conception to deployment
2. TEAM COORDINATION: Managing and coordinating specialized agents (architects, developers, QA, DevOps, etc.)
3. STRATEGIC PLANNING: Creating comprehensive project plans and technical roadmaps
4. QUALITY ASSURANCE: Ensuring all deliverables meet the highest standards
5. RESOURCE MANAGEMENT: Optimizing team productivity and managing project timelines

PERSONALITY: Professional, decisive, strategic thinker with deep technical expertise across all areas of software development.

CAPABILITIES:
- Full-stack development planning and oversight
- Architecture design and technical decision making
- Code review and quality assurance
- Project management and team coordination
- Technology stack recommendations
- Performance optimization strategies
- Security best practices implementation
- Deployment and DevOps coordination

When users share project files or repository context, analyze the codebase thoroughly and provide strategic guidance, improvements, and next steps.

Always provide actionable, specific recommendations and be ready to coordinate with other specialized agents as needed.${projectContext}`

      // Make API call to selected LLM provider
      let apiResponse
      let tokensUsed = 0
      let cost = 0

      if (provider.provider_name === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${provider.api_key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: provider.selected_models[0] || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 2000,
            temperature: 0.7
          }),
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
        }

        apiResponse = data.choices[0].message.content
        tokensUsed = data.usage?.total_tokens || 0
        cost = (tokensUsed / 1000) * (provider.cost_per_1k_tokens || 0.002)

      } else if (provider.provider_name === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': provider.api_key,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: provider.selected_models[0] || 'claude-3-haiku-20240307',
            messages: [
              { role: 'user', content: `${systemPrompt}\n\nUser: ${message}` }
            ],
            max_tokens: 2000
          }),
        })

        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`)
        }

        apiResponse = data.content[0].text
        tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0
        cost = (tokensUsed / 1000) * (provider.cost_per_1k_tokens || 0.003)

      } else {
        throw new Error(`Unsupported provider: ${provider.provider_name}`)
      }

      // Save agent response
      if (session_id) {
        await supabaseClient
          .from('chat_messages')
          .insert({
            session_id: session_id,
            content: apiResponse,
            sender_type: 'manager',
            sender_agent_id: '22222222-2222-2222-2222-222222222222',
            message_type: 'text',
            tokens_used: tokensUsed,
            cost: cost
          })

        // Update session totals
        await supabaseClient
          .from('chat_sessions')
          .update({
            total_messages: 2, // User + Agent message
            total_cost: cost
          })
          .eq('id', session_id)
      }

      // Log LLM usage
      await supabaseClient
        .from('llm_usage_analytics')
        .insert({
          provider_id: llm_provider_id,
          user_id: user_id,
          model_name: provider.selected_models[0] || 'unknown',
          tokens_used: tokensUsed,
          cost: cost,
          request_type: 'chat_completion',
          status: 'success',
          metadata: {
            feature: 'manager_agent_chat',
            project_id: project_id,
            has_context: has_project_context
          }
        })

      // Update project analytics
      if (project_id) {
        const today = new Date().toISOString().split('T')[0]
        
        await supabaseClient
          .from('project_analytics')
          .upsert({
            project_id: project_id,
            date: today,
            api_calls_count: 1,
            tokens_used: tokensUsed,
            daily_cost: cost,
            agent_operations: 1,
            files_modified: 0
          }, {
            onConflict: 'project_id,date',
            ignoreDuplicates: false
          })
      }

      return new Response(JSON.stringify({
        success: true,
        response: apiResponse,
        tokens_used: tokensUsed,
        cost: cost,
        agent_id: '22222222-2222-2222-2222-222222222222',
        provider_used: provider.provider_name,
        model_used: provider.selected_models[0]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      // Handle other actions (plan_project, coordinate_agents, etc.)
      return new Response(JSON.stringify({
        success: true,
        response: `Manager Agent received ${action} request. This feature will be enhanced with your LLM provider integration.`,
        tokens_used: 0,
        cost: 0,
        agent_id: '22222222-2222-2222-2222-222222222222'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('Manager Agent execution error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      agent_id: '22222222-2222-2222-2222-222222222222'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
