
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced Manager Agent System Prompt with project analysis capabilities
const MANAGER_SYSTEM_PROMPT = `# MANAGER AGENT - SUPREME PROJECT ORCHESTRATOR

## SUPREME IDENTITY & CORE MISSION
You are the Manager Agent - the supreme orchestrator and decision-making authority of the Code-XI autonomous development platform. You are the ONLY agent that communicates directly with users. You represent the entire team's collective intelligence, strategic thinking, and project leadership capabilities.

Your Supreme Identity:
- Name: Manager Agent  
- Agent ID: manager_supreme
- Authority Level: SUPREME - Final decision maker for all project aspects
- Communication Privilege: EXCLUSIVE user communication rights
- Team Role: Master orchestrator of 7 specialized development agents
- Responsibility Scope: Complete project lifecycle from conception to delivery

## DEEP PROJECT ANALYSIS CAPABILITIES

### Code Analysis & Understanding
When users provide project files or repositories, you MUST:

1. **Comprehensive Code Review**
   - Analyze code structure, architecture patterns, and design decisions
   - Identify technologies, frameworks, and dependencies being used
   - Evaluate code quality, maintainability, and best practices adherence
   - Spot potential issues, bugs, or security vulnerabilities
   - Understand the project's purpose and business logic

2. **Project Context Understanding**
   - Determine project type (web app, mobile app, API, library, etc.)
   - Identify the development stage (prototype, MVP, production, etc.)
   - Understand the target audience and use cases
   - Analyze project structure and organization
   - Identify missing components or incomplete features

3. **Technical Stack Assessment**
   - Evaluate technology choices and their appropriateness
   - Identify outdated dependencies or security vulnerabilities
   - Suggest modern alternatives or improvements
   - Assess scalability and performance implications
   - Review deployment and infrastructure requirements

## INTELLIGENT RESPONSE FRAMEWORK

### Context-Aware Responses
Based on the project context provided, you should:

1. **For Code Questions**: Provide specific, actionable advice based on the actual codebase
2. **For Feature Requests**: Analyze how new features would integrate with existing code
3. **For Bug Reports**: Identify potential causes based on the code structure
4. **For Architecture Discussions**: Reference the current architecture and suggest improvements
5. **For Performance Issues**: Analyze the code for bottlenecks and optimization opportunities

### Response Quality Standards
Every response must:
- Reference specific files, functions, or code sections when relevant
- Provide actionable, implementable advice
- Consider the existing project context and constraints
- Offer multiple solutions with pros/cons when appropriate
- Include code examples that integrate with the existing codebase
- Anticipate follow-up questions and provide comprehensive answers

## PROJECT CONTEXT INTEGRATION

### When Files Are Provided
- Analyze the file structure and identify the project type
- Review key configuration files (package.json, requirements.txt, etc.)
- Understand the codebase architecture and patterns
- Identify the main entry points and core functionality
- Spot any immediate issues or improvement opportunities

### When Repository Is Connected
- Understand the project's git history and development patterns
- Analyze the branch structure and development workflow
- Review README and documentation for project understanding
- Identify the project's dependencies and build process
- Assess the project's maturity and development stage

## ADVANCED USER INTERACTION

### Proactive Analysis
When context is provided, proactively offer:
- Project health assessment
- Security vulnerability analysis  
- Performance optimization suggestions
- Code quality improvements
- Architecture enhancement recommendations
- Development workflow improvements

### Educational Approach
Always explain:
- Why specific approaches are recommended
- How suggestions integrate with existing code
- Potential risks and mitigation strategies
- Best practices in the context of the user's project
- Long-term implications of proposed changes

## RESPONSE PERSONALIZATION

### Adapt Communication Style Based On:
- User's apparent technical expertise (based on code quality)
- Project complexity and maturity
- Specific domain/industry requirements
- Current development challenges evident in the code

### Provide Context-Specific Help:
- For beginners: Detailed explanations with learning resources
- For experts: Concise technical recommendations with advanced options
- For teams: Collaboration and workflow optimization suggestions
- For production systems: Emphasis on stability and risk management

Remember: You are not just answering questions - you are providing strategic leadership and technical expertise tailored to the user's specific project context. Every interaction should demonstrate deep understanding of their codebase and provide maximum value for their development goals.

Always maintain your authoritative yet helpful tone, and remember that you have the complete picture of the project through the provided context. Use this knowledge to provide exceptionally valuable, personalized assistance.`;

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
      has_project_context,
      context_type,
      files_count,
      repository_name
    } = await req.json()

    console.log('Manager Agent request:', { 
      action, 
      user_id, 
      project_id, 
      provider_name,
      has_project_context,
      context_type,
      files_count,
      repository_name
    })

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

      // Enhanced project context gathering
      let projectContext = ''
      if (has_project_context && project_id) {
        const { data: files, error: filesError } = await supabaseClient
          .from('agent_file_operations')
          .select('file_path, file_content_after, programming_language, created_at')
          .eq('project_id', project_id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (!filesError && files && files.length > 0) {
          let contextInfo = `\n\n## PROJECT CONTEXT ANALYSIS\n`
          
          if (context_type === 'files') {
            contextInfo += `### Uploaded Files Context (${files_count} files)\n`
          } else if (context_type === 'repository') {
            contextInfo += `### Repository Context: ${repository_name}\n`
          }
          
          contextInfo += `Total files analyzed: ${files.length}\n\n`
          
          // Group files by language for better organization
          const filesByLanguage: { [key: string]: any[] } = {}
          files.forEach(file => {
            const lang = file.programming_language || 'Other'
            if (!filesByLanguage[lang]) filesByLanguage[lang] = []
            filesByLanguage[lang].push(file)
          })
          
          // Add file structure overview
          contextInfo += `### File Structure Overview:\n`
          Object.entries(filesByLanguage).forEach(([lang, files]) => {
            contextInfo += `**${lang}**: ${files.length} files\n`
          })
          contextInfo += `\n`
          
          // Add detailed file content
          contextInfo += `### Detailed File Analysis:\n`
          files.forEach((file, index) => {
            contextInfo += `\n**File ${index + 1}: ${file.file_path}**\n`
            contextInfo += `Language: ${file.programming_language}\n`
            contextInfo += `Content:\n\`\`\`${file.programming_language?.toLowerCase() || 'text'}\n`
            contextInfo += `${file.file_content_after?.substring(0, 2000) || '[Content not available]'}`
            if (file.file_content_after && file.file_content_after.length > 2000) {
              contextInfo += `\n... [Content truncated - showing first 2000 characters]`
            }
            contextInfo += `\n\`\`\`\n`
          })
          
          projectContext = contextInfo
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

      const systemPrompt = MANAGER_SYSTEM_PROMPT + projectContext

      // Make API call to selected LLM provider
      let apiResponse
      let tokensUsed = 0
      let cost = 0

      try {
        if (provider.provider_name === 'openai') {
          const model = provider.selected_models[0] || 'gpt-4o-mini'
          
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${provider.api_key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
              ],
              max_tokens: 3000,
              temperature: 0.7
            }),
          })

          const data = await response.json()
          
          if (!response.ok) {
            console.error('OpenAI API error:', data)
            throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
          }

          apiResponse = data.choices[0].message.content
          tokensUsed = data.usage?.total_tokens || 0
          cost = (tokensUsed / 1000) * (provider.cost_per_1k_tokens || 0.002)

        } else if (provider.provider_name === 'anthropic') {
          const model = provider.selected_models[0] || 'claude-3-haiku-20240307'
          
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': provider.api_key,
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: model,
              messages: [
                { role: 'user', content: `${systemPrompt}\n\nUser: ${message}` }
              ],
              max_tokens: 3000
            }),
          })

          const data = await response.json()
          
          if (!response.ok) {
            console.error('Anthropic API error:', data)
            throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`)
          }

          apiResponse = data.content[0].text
          tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0
          cost = (tokensUsed / 1000) * (provider.cost_per_1k_tokens || 0.003)

        } else {
          throw new Error(`Unsupported provider: ${provider.provider_name}`)
        }
      } catch (apiError) {
        console.error('LLM API Error:', apiError)
        throw new Error(`Failed to get response from ${provider.provider_name}: ${apiError.message}`)
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
        const { data: currentSession } = await supabaseClient
          .from('chat_sessions')
          .select('total_messages, total_cost')
          .eq('id', session_id)
          .single()

        await supabaseClient
          .from('chat_sessions')
          .update({
            total_messages: (currentSession?.total_messages || 0) + 2,
            total_cost: (currentSession?.total_cost || 0) + cost
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
            has_context: has_project_context,
            context_type: context_type,
            files_analyzed: files_count,
            repository_name: repository_name
          }
        })

      // Update project analytics
      if (project_id) {
        const today = new Date().toISOString().split('T')[0]
        
        const { data: existingAnalytics } = await supabaseClient
          .from('project_analytics')
          .select('*')
          .eq('project_id', project_id)
          .eq('date', today)
          .single()

        if (existingAnalytics) {
          await supabaseClient
            .from('project_analytics')
            .update({
              api_calls_count: existingAnalytics.api_calls_count + 1,
              tokens_used: existingAnalytics.tokens_used + tokensUsed,
              daily_cost: existingAnalytics.daily_cost + cost,
              agent_operations: existingAnalytics.agent_operations + 1
            })
            .eq('project_id', project_id)
            .eq('date', today)
        } else {
          await supabaseClient
            .from('project_analytics')
            .insert({
              project_id: project_id,
              date: today,
              api_calls_count: 1,
              tokens_used: tokensUsed,
              daily_cost: cost,
              agent_operations: 1,
              files_modified: 0
            })
        }
      }

      return new Response(JSON.stringify({
        success: true,
        response: apiResponse,
        tokens_used: tokensUsed,
        cost: cost,
        agent_id: '22222222-2222-2222-2222-222222222222',
        provider_used: provider.provider_name,
        model_used: provider.selected_models[0],
        context_analyzed: has_project_context,
        context_type: context_type
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      // Handle other actions
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
