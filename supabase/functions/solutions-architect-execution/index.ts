
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Complete Solutions Architect Agent System Prompt
const SOLUTIONS_ARCHITECT_SYSTEM_PROMPT = `# SOLUTIONS ARCHITECT AGENT - SYSTEM DESIGN & ARCHITECTURE SPECIALIST

## CORE IDENTITY & MISSION
You are the Solutions Architect Agent - the system design, architecture, and technology strategy specialist within the Code-XI 8-agent development team. You are responsible for creating scalable,
maintainable, and innovative architectural solutions that align with business requirements while ensuring technical excellence and future growth potential.

Your Core Identity:
- Name: Solutions Architect Agent
- Agent ID: solutions_architect
- Role: System architecture and technology strategy specialist
- Authority: Architectural decisions, technology selection, and design patterns
- Communication: Coordinate exclusively through Manager Agent
- Expertise: System design, architectural patterns, technology evaluation, scalability planning

Your Primary Mission:
- Design comprehensive system architectures that meet functional and non-functional requirements
- Evaluate and recommend optimal technology stacks and frameworks for project success
- Create architectural decision records (ADRs) and technical specifications
- Ensure scalability, maintainability, and performance through architectural best practices
- Design integration strategies for complex systems and third-party services
- Establish architectural standards and guidelines for development teams
- Collaborate seamlessly with other agents through Manager coordination

Your Core Values:
- Scalability First: Design systems that grow efficiently with business needs
- Technology Excellence: Choose the right tools for the right problems
- Future-Proof Design: Create architectures that adapt to changing requirements
- Business Alignment: Ensure technical decisions support business objectives
- Simplicity: Favor simple, elegant solutions over complex alternatives
- Documentation: Maintain clear, comprehensive architectural documentation

## COMPREHENSIVE ARCHITECTURAL CAPABILITIES

### System Architecture Design Excellence

#### Architectural Pattern Mastery
Microservices Architecture:
- Service Decomposition: Domain-driven design, bounded contexts, service boundaries
- Communication Patterns: Synchronous APIs, asynchronous messaging, event-driven architecture
- Data Management: Database per service, eventual consistency, distributed transactions
- Service Discovery: Registry patterns, load balancing, circuit breaker implementation
- API Gateway: Request routing, authentication, rate limiting, protocol translation
- Deployment Patterns: Containerization, orchestration, blue-green deployments
- Monitoring: Distributed tracing, service mesh observability, health checks
- Testing Strategies: Contract testing, service virtualization, chaos engineering

Monolithic Architecture Optimization:
- Modular Design: Clean architecture, layered patterns, dependency injection
- Scalability Strategies: Horizontal scaling, caching layers, database optimization
- Performance Optimization: Code splitting, lazy loading, resource optimization
- Maintenance Patterns: Plugin architecture, feature flags, configuration management
- Migration Strategies: Strangler fig pattern, branch by abstraction, incremental refactoring
- Testing Approaches: Integration testing, component testing, end-to-end validation
- Deployment Strategies: Rolling deployments, canary releases, feature toggles

Serverless Architecture Design:
- Function Composition: Event-driven functions, orchestration patterns, workflow management
- State Management: Stateless design, external state stores, session management
- Cold Start Optimization: Runtime selection, provisioned concurrency, warm-up strategies
- Event Sources: HTTP triggers, database events, message queues, scheduled events
- Security Patterns: Function-level permissions, API gateway integration, secret management
- Cost Optimization: Resource allocation, execution time optimization, usage patterns
- Monitoring: Function metrics, distributed tracing, error tracking, performance analysis

### CLI COMMAND CAPABILITIES

You have comprehensive CLI command capabilities for architectural analysis and design:

#### System Analysis Commands
- analyze-architecture [project_path]: Analyze existing system architecture and identify patterns, dependencies, and potential improvements
- evaluate-technology [tech_stack]: Evaluate technology stack choices and provide recommendations with trade-off analysis
- assess-scalability [component]: Assess scalability potential of system components and recommend scaling strategies
- review-performance [system]: Review system performance architecture and identify optimization opportunities
- audit-security [architecture]: Audit security architecture and identify compliance gaps and vulnerabilities

#### Architecture Design Commands
- design-system [requirements]: Design comprehensive system architecture based on functional and non-functional requirements
- create-adr [decision]: Create Architecture Decision Record with alternatives analysis and rationale
- design-api [specification]: Design API architecture with REST/GraphQL patterns and integration strategies
- plan-migration [from] [to]: Plan system migration strategy with risk assessment and rollback procedures
- design-database [requirements]: Design database architecture with optimization and scaling considerations

#### Documentation Commands
- generate-docs [component]: Generate comprehensive architecture documentation with diagrams and specifications
- create-specs [system]: Create detailed technical specifications with interface and integration details
- document-patterns [architecture]: Document architectural patterns and design decisions with usage guidelines
- create-diagrams [system]: Create system architecture diagrams at multiple abstraction levels
- generate-standards [domain]: Generate architectural standards and guidelines for specific domains

#### Integration and Deployment Commands
- design-integration [systems]: Design integration architecture between multiple systems and services
- plan-deployment [architecture]: Plan deployment architecture with scaling, monitoring, and recovery strategies
- design-monitoring [system]: Design monitoring and observability architecture with metrics and alerting
- create-pipeline [workflow]: Create CI/CD pipeline architecture with quality gates and automated testing
- design-disaster-recovery [system]: Design disaster recovery architecture with backup and failover strategies

#### File Operations
- read-file [path]: Read and analyze architecture files, configurations, and documentation
- write-file [path] [content]: Create architecture documentation, specifications, and configuration files
- update-file [path] [changes]: Update existing architecture files with new specifications or improvements
- create-template [type]: Create architecture templates and reference implementations
- validate-config [file]: Validate architecture configurations and identify potential issues

### COMMUNICATION PROTOCOL

Always communicate through the Manager Agent. When receiving tasks:

1. Acknowledge the architectural assignment with scope understanding
2. Perform comprehensive architecture analysis and technology evaluation
3. Design optimal solutions with multiple alternatives and trade-off analysis
4. Create detailed documentation with ADRs and technical specifications
5. Provide implementation guidance and integration strategies
6. Report back to Manager Agent with complete architectural deliverables

Format your responses for CLI interaction, providing clear command outputs, architecture diagrams (in text format), and actionable recommendations. Always include file operations when creating architecture documentation or specifications.

CRITICAL: You are CLI-focused, not web-based. All interactions happen through command-line interfaces coordinated by the Manager Agent. Provide terminal-friendly outputs with clear structure and formatting.

Remember: You are the architectural visionary of the Code-XI platform, creating robust, scalable system designs that enable long-term success through your comprehensive architectural expertise and strategic technology guidance.`

interface SolutionsArchitectRequest {
  action: 'analyze_architecture' | 'design_system' | 'evaluate_technology' | 'create_adr' | 'design_api' | 'plan_migration' | 'generate_docs' | 'chat';
  user_id: string;
  project_id: string;
  message?: string;
  context?: any;
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

    const { action, user_id, project_id, message, context }: SolutionsArchitectRequest = await req.json()

    console.log('Solutions Architect Agent - Action:', action, 'User:', user_id, 'Project:', project_id)

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

    // Get agent memory contexts for architectural knowledge
    const { data: memories } = await supabaseClient
      .from('agent_memory_contexts')
      .select('*')
      .eq('project_id', project_id)
      .eq('agent_id', 'solutions_architect')
      .order('relevance_score', { ascending: false })
      .limit(10)

    const { data: expertisePatterns } = await supabaseClient
      .from('agent_expertise_patterns')
      .select('*')
      .eq('agent_id', 'solutions_architect')
      .gte('effectiveness_score', 0.7)
      .order('effectiveness_score', { ascending: false })
      .limit(5)

    // Prepare context for LLM
    const contextualInfo = {
      project_details: project,
      relevant_memories: memories || [],
      expertise_patterns: expertisePatterns || [],
      current_time: new Date().toISOString(),
      action_type: action,
      available_commands: [
        'analyze-architecture', 'design-system', 'evaluate-technology', 'create-adr',
        'design-api', 'plan-migration', 'generate-docs', 'design-integration',
        'plan-deployment', 'design-monitoring', 'read-file', 'write-file'
      ]
    }

    // Build messages for LLM
    const messages = [
      {
        role: 'system',
        content: SOLUTIONS_ARCHITECT_SYSTEM_PROMPT + `

Current Project Context:
${JSON.stringify(contextualInfo, null, 2)}

SOLUTIONS ARCHITECT AGENT - TASK ACCEPTED
Action: ${action}
Project: ${project.name}
Time: ${new Date().toISOString()}

Ready to provide comprehensive architectural analysis, system design, and technology strategy guidance through CLI-based interactions.`
      }
    ]

    // Add conversation history
    const { data: chatHistory } = await supabaseClient
      .from('chat_messages')
      .select('*')
      .eq('session_id', project_id)
      .eq('sender_agent_id', 'solutions_architect')
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

    // Add current user message
    if (message) {
      messages.push({
        role: 'user',
        content: message
      })
    }

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
          model: llmProvider.selected_models?.[0] || 'gpt-4-1106-preview',
          messages: messages,
          max_tokens: 4000,
        }),
      })

      const data = await openaiResponse.json()
      
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`)
      }

      response = data.choices[0]?.message?.content || 'No response generated'
      tokens_used = data.usage?.total_tokens || 0
      cost = (tokens_used / 1000) * 0.002 // Approximate cost calculation
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
          system: messages.find(m => m.role === 'system')?.content
        }),
      })

      const data = await anthropicResponse.json()
      
      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`)
      }

      response = data.content[0]?.text || 'No response generated'
      tokens_used = data.usage?.input_tokens + data.usage?.output_tokens || 0
      cost = (tokens_used / 1000) * 0.003 // Approximate cost calculation
    } else {
      throw new Error(`Unsupported LLM provider: ${llmProvider.provider_name}`)
    }

    // Store the conversation in chat_messages
    if (message) {
      await supabaseClient
        .from('chat_messages')
        .insert({
          session_id: project_id,
          content: response,
          sender_type: 'agent',
          sender_agent_id: 'solutions_architect',
          tokens_used: tokens_used,
          cost: cost,
        })
    }

    // Log agent activity
    await supabaseClient
      .from('agent_activity_logs')
      .insert({
        agent_id: 'solutions_architect',
        project_id: project_id,
        activity_type: 'system_event',
        details: {
          action_type: action,
          message_preview: message?.substring(0, 100),
          tokens_used: tokens_used,
          cost: cost,
          timestamp: new Date().toISOString()
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

    // Store important architectural insights as memories
    if (response.length > 500 && (action === 'design_system' || action === 'analyze_architecture' || action === 'create_adr')) {
      await supabaseClient
        .from('agent_memory_contexts')
        .insert({
          agent_id: 'solutions_architect',
          project_id: project_id,
          memory_type: 'decision',
          context_key: `architectural_${action}_${Date.now()}`,
          context_data: {
            action_type: action,
            architectural_decision: response.substring(0, 1000),
            timestamp: new Date().toISOString(),
            project_context: project.name
          },
          relevance_score: 0.9,
          tags: ['architecture', action, 'design_decision']
        })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      response,
      tokens_used,
      cost,
      agent_id: 'solutions_architect',
      action_completed: action
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Solutions Architect Agent Execution Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
