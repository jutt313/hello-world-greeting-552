
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Complete QA Engineer Agent System Prompt
const QA_ENGINEER_SYSTEM_PROMPT = `# QA ENGINEER AGENT - QUALITY ASSURANCE & TESTING SPECIALIST

## CORE IDENTITY & MISSION
You are the QA Engineer Agent - the quality assurance, testing, and validation specialist within the Code-XI 8-agent development team. You are responsible for ensuring software quality, reliability, and user experience excellence through comprehensive testing strategies, automated testing frameworks, and continuous quality improvement processes.

Your Core Identity:
- Name: QA Engineer Agent
- Agent ID: qa_engineer
- Role: Quality assurance and testing specialist
- Authority: Quality gates, testing standards, and release readiness decisions
- Communication: Coordinate exclusively through Manager Agent
- Expertise: Test automation, manual testing, performance testing, quality frameworks

Your Primary Mission:
- Design and implement comprehensive testing strategies across all application layers
- Create and maintain automated testing frameworks for continuous quality assurance
- Execute manual testing for user experience, usability, and edge case validation
- Establish quality gates and release criteria for production deployments
- Perform performance, security, and accessibility testing to ensure compliance
- Collaborate with development teams to improve code quality and testability
- Provide actionable feedback and quality metrics to drive continuous improvement

Your Core Values:
- Quality First: Never compromise on software quality and user experience
- Test Early, Test Often: Integrate testing throughout the development lifecycle
- Automation Excellence: Maximize test coverage through intelligent automation
- User-Centric Testing: Focus on real-world usage scenarios and user needs
- Continuous Improvement: Learn from defects and optimize testing processes
- Comprehensive Coverage: Test functionality, performance, security, and accessibility

## RESPONSE PROTOCOLS

### Task Acceptance Response Format
When accepting a task from Manager Agent:

QA ENGINEER AGENT - TASK ACCEPTED

Task ID: [Generated unique identifier]
Testing Scope: [Comprehensive description of testing requirements]
Quality Standards: [Defined quality criteria and acceptance standards]
Testing Approach: [Selected testing strategy and methodology]
Resource Requirements: [Tools, environments, and time estimates]
Risk Assessment: [Identified quality risks and mitigation strategies]
Deliverables: [Expected testing deliverables and quality reports]
Timeline: [Testing phases with milestones and completion estimates]

CLARIFICATION REQUESTS:
[Any specific questions about requirements, scope, or constraints]

STATUS: READY TO COMMENCE QUALITY ASSURANCE

### Progress Update Response Format
QA ENGINEER AGENT - PROGRESS UPDATE

Task ID: [Reference to ongoing task]
Testing Progress: [Current phase completion status]
Quality Metrics: [Coverage, defect rates, performance metrics]
Key Findings: [Important quality issues or insights discovered]
Risk Status: [Current risk assessment and mitigation effectiveness]
Next Steps: [Upcoming testing activities and focus areas]
Blockers: [Any impediments requiring Manager Agent coordination]

DELIVERABLES COMPLETED:
- [List of completed testing deliverables]

QUALITY ASSESSMENT: [Overall quality status and recommendations]

### Task Completion Response Format
QA ENGINEER AGENT - TASK COMPLETED

Task ID: [Reference to completed task]
Quality Summary: [Overall quality assessment and validation results]
Testing Coverage: [Comprehensive coverage analysis and metrics]
Quality Metrics: [Final quality metrics, trends, and comparisons]
Issues Identified: [Defects found, severity analysis, resolution status]
Performance Results: [Performance testing outcomes and recommendations]
Security Validation: [Security testing results and compliance status]
Accessibility Status: [Accessibility compliance and validation results]

DELIVERABLES PROVIDED:
- [Complete list of testing deliverables and quality artifacts]

QUALITY VERDICT: [Release readiness assessment and recommendations]
CONTINUOUS IMPROVEMENT: [Lessons learned and process optimization suggestions]

STATUS: TESTING COMPLETED - QUALITY ASSURED

Remember: You are the quality guardian of the Code-XI autonomous development platform. Your comprehensive testing expertise ensures that all software meets the highest standards of functionality, performance, security, and user experience.`

interface QAEngineerRequest {
  action: 'test_strategy' | 'create_tests' | 'run_tests' | 'analyze_code' | 'performance_test' | 'security_test' | 'accessibility_test' | 'chat';
  user_id: string;
  project_id: string;
  message?: string;
  context?: any;
  files_to_analyze?: string[];
  test_requirements?: any;
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

    const { action, user_id, project_id, message, context, files_to_analyze, test_requirements }: QAEngineerRequest = await req.json()

    console.log(`QA Engineer Agent - Action: ${action}, User: ${user_id}, Project: ${project_id}`)

    // Get user's selected LLM provider for this project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        *,
        llm_providers (
          provider_name,
          api_key,
          provider_config,
          selected_models
        )
      `)
      .eq('id', project_id)
      .eq('owner_id', user_id)
      .single()

    if (projectError || !project) {
      throw new Error('Project not found or access denied')
    }

    // Get project context and memory for intelligent testing decisions
    const { data: memories } = await supabaseClient
      .from('agent_memory_contexts')
      .select('*')
      .eq('project_id', project_id)
      .eq('agent_id', 'qa_engineer')
      .order('relevance_score', { ascending: false })
      .limit(10)

    const { data: expertisePatterns } = await supabaseClient
      .from('agent_expertise_patterns')
      .select('*')
      .eq('agent_id', 'qa_engineer')
      .gte('effectiveness_score', 0.7)
      .order('effectiveness_score', { ascending: false })
      .limit(5)

    // Prepare context for LLM with file content if analyzing code
    let fileContents = ''
    if (files_to_analyze && files_to_analyze.length > 0) {
      // In a real implementation, this would read actual file contents
      // For now, we'll include file names and simulate content analysis
      fileContents = `Files to analyze: ${files_to_analyze.join(', ')}`
    }

    const contextualInfo = {
      project_details: project,
      relevant_memories: memories || [],
      expertise_patterns: expertisePatterns || [],
      current_time: new Date().toISOString(),
      action_type: action,
      test_requirements: test_requirements || {},
      files_to_analyze: files_to_analyze || [],
      file_contents: fileContents,
      available_testing_tools: [
        'Jest', 'Cypress', 'Playwright', 'JMeter', 'k6', 'Artillery',
        'Postman/Newman', 'REST Assured', 'Supertest', 'Selenium',
        'Appium', 'TestContainers', 'axe-core', 'Lighthouse'
      ]
    }

    // Build messages for LLM
    const messages = [
      {
        role: 'system',
        content: QA_ENGINEER_SYSTEM_PROMPT + `\n\nCurrent Testing Context:\n${JSON.stringify(contextualInfo, null, 2)}`
      }
    ]

    // Add conversation history for chat actions
    if (action === 'chat') {
      const { data: chatHistory } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('session_id', project_id)
        .order('created_at', { ascending: true })
        .limit(20)

      if (chatHistory) {
        chatHistory.forEach(msg => {
          messages.push({
            role: msg.sender_type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })
        })
      }
    }

    // Add current message/request
    let currentMessage = message || ''
    if (action !== 'chat') {
      currentMessage = `Action: ${action}. ${message || 'Please proceed with the specified testing action.'}`
      if (test_requirements) {
        currentMessage += `\n\nTest Requirements: ${JSON.stringify(test_requirements, null, 2)}`
      }
    }

    messages.push({
      role: 'user',
      content: currentMessage
    })

    // Get LLM configuration
    const llmProvider = project.llm_providers
    if (!llmProvider) {
      throw new Error('No LLM provider configured for this project')
    }

    let response = ''
    let tokens_used = 0
    let cost = 0

    // Call appropriate LLM based on provider
    if (llmProvider.provider_name === 'openai') {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmProvider.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: llmProvider.selected_models?.[0] || 'gpt-4',
          messages: messages,
          temperature: 0.3, // Lower temperature for more consistent testing approaches
          max_tokens: 4000,
        }),
      })

      const data = await openaiResponse.json()
      
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
      }

      response = data.choices[0]?.message?.content || 'No response generated'
      tokens_used = data.usage?.total_tokens || 0
      cost = (tokens_used / 1000) * 0.002
    } else if (llmProvider.provider_name === 'anthropic') {
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': llmProvider.api_key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: llmProvider.selected_models?.[0] || 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: messages.filter(m => m.role !== 'system'),
          system: messages.find(m => m.role === 'system')?.content,
          temperature: 0.3
        }),
      })

      const data = await anthropicResponse.json()
      
      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`)
      }

      response = data.content[0]?.text || 'No response generated'
      tokens_used = data.usage?.input_tokens + data.usage?.output_tokens || 0
      cost = (tokens_used / 1000) * 0.003
    } else {
      throw new Error(`Unsupported LLM provider: ${llmProvider.provider_name}`)
    }

    // Store the conversation in chat_messages for chat actions
    if (action === 'chat' && message) {
      await supabaseClient
        .from('chat_messages')
        .insert({
          session_id: project_id,
          content: message,
          sender_type: 'user',
          tokens_used: 0,
          cost: 0,
        })

      await supabaseClient
        .from('chat_messages')
        .insert({
          session_id: project_id,
          content: response,
          sender_type: 'agent',
          sender_agent_id: 'qa_engineer',
          tokens_used: tokens_used,
          cost: cost,
        })
    }

    // Log activity
    await supabaseClient
      .from('agent_activity_logs')
      .insert({
        agent_id: 'qa_engineer',
        project_id: project_id,
        activity_type: 'assigned_task',
        details: {
          action: action,
          action_type: action,
          timestamp: new Date().toISOString(),
          tokens_used: tokens_used,
          cost: cost,
          files_analyzed: files_to_analyze?.length || 0,
          test_requirements: test_requirements ? Object.keys(test_requirements).length : 0
        }
      })

    // Update project analytics
    await supabaseClient
      .from('projects')
      .update({
        total_tokens_used: project.total_tokens_used + tokens_used,
        total_api_calls: project.total_api_calls + 1,
        total_cost: project.total_cost + cost,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', project_id)

    // Store important testing insights as memories
    if (response.length > 500) {
      await supabaseClient
        .from('agent_memory_contexts')
        .insert({
          agent_id: 'qa_engineer',
          project_id: project_id,
          memory_type: 'task',
          context_key: `qa_task_${action}_${Date.now()}`,
          context_data: {
            action: action,
            response_summary: response.substring(0, 1000),
            test_coverage: test_requirements,
            timestamp: new Date().toISOString(),
            tokens_used: tokens_used
          },
          relevance_score: 0.8,
          tags: ['qa_task', action, 'testing_strategy']
        })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response,
      tokens_used,
      cost,
      agent_id: 'qa_engineer',
      action: action,
      files_analyzed: files_to_analyze?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('QA Engineer Agent Execution Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
