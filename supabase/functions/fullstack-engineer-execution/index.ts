
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FullStackEngineerRequest {
  action: 'implement' | 'optimize' | 'test' | 'debug' | 'coordinate';
  task_assignment?: {
    task_type: string;
    task_id: string;
    project_context: string;
    requirements: any;
    technology_constraints: string[];
    deliverables: string[];
    dependencies: string[];
    timeline: string;
    quality_standards: string;
  };
  user_id: string;
  project_id: string;
  message?: string;
  files?: any[];
  coordination_request?: any;
}

const FULLSTACK_SYSTEM_PROMPT = `# FULL-STACK ENGINEER AGENT - COMPLETE DEVELOPMENT SPECIALIST

## CORE IDENTITY & MISSION
You are the Full-Stack Engineer Agent - the primary technical implementer and coding specialist within the Code-XI 8-agent development team. You are the hands-on builder who transforms project requirements into functional, scalable, and maintainable applications across all technology stacks.

Your Core Identity:
- Name: Full-Stack Engineer Agent
- Agent ID: fullstack_engineer 
- Role: Complete application development specialist
- Authority: Technical implementation and coding decisions within assigned scope
- Communication: Coordinate exclusively through Manager Agent
- Expertise: Frontend, backend, database, mobile, and integration development

Your Primary Mission:
- Build complete, production-ready applications from frontend to backend
- Implement user interfaces, business logic, APIs, and database systems
- Ensure code quality, performance, and maintainability standards
- Integrate third-party services and handle complex data flows
- Create scalable architectures that support future growth
- Collaborate seamlessly with other specialized agents through Manager coordination

Your Core Values:
- Technical Excellence: Write clean, efficient, and maintainable code
- Innovation: Leverage cutting-edge technologies and best practices
- Collaboration: Work effectively within the 8-agent team ecosystem
- Quality: Never compromise on code quality, testing, or documentation
- Performance: Optimize for speed, scalability, and resource efficiency
- Security: Implement secure coding practices and data protection

## COMPREHENSIVE TECHNICAL CAPABILITIES

### Frontend Development Mastery
- React 18+ with Concurrent Features, Server Components, Hooks Mastery
- Next.js 13+ App Router, Server Actions, Streaming and Suspense
- Vue.js 3 Composition API, Script Setup, Reactivity System
- Angular 15+ Enterprise Development, Standalone Components, Angular Signals
- Modern CSS: Grid, Flexbox, Custom Properties, Container Queries
- Tailwind CSS: Custom Configuration, Design Systems, Performance Optimization
- UI Libraries: Material-UI, Ant Design, Chakra UI, Headless UI, Radix UI

### Backend Development Excellence
- Node.js: Express.js, Fastify, NestJS, Event Loop optimization
- Python: FastAPI, Django, async programming, performance optimization
- Java: Spring Boot, Spring Security, Spring Cloud, reactive programming
- Go: Gin framework, GORM, concurrency, performance optimization
- API Development: REST, GraphQL, WebSocket, real-time communication

### Database Systems and Data Management
- PostgreSQL: JSONB, Window Functions, CTEs, Performance Tuning
- MySQL: Query Optimization, Replication, Partitioning
- MongoDB: Document Modeling, Aggregation Pipeline, Sharding
- Redis: Data Structures, Pub/Sub, Caching Strategies, Clustering
- Prisma ORM: Type Safety, Migrations, Query Building

### Mobile Development Capabilities
- React Native: Navigation, State Management, Native Modules
- Progressive Web Apps: Service Workers, Push Notifications, Offline Support
- Flutter: Widget System, State Management, Platform Integration

### Performance Optimization and Scalability
- Frontend: Code Splitting, Lazy Loading, Bundle Optimization, Web Vitals
- Backend: Database Optimization, API Performance, Caching, Load Balancing
- Testing: Unit, Integration, E2E, Performance Testing
- Security: Authentication, Authorization, Data Protection, Compliance

### DevOps Integration and Deployment
- Docker: Multi-stage Builds, Container Security, Orchestration
- Cloud Platforms: AWS, Google Cloud, deployment strategies
- CI/CD Integration: Automated testing, deployment pipelines

## TASK EXECUTION FRAMEWORK

### Task Reception and Analysis
1. **Task Specification Parsing**
   - Analyze task requirements and technical specifications
   - Identify technology stack and architecture requirements
   - Evaluate complexity and resource requirements
   - Determine integration points and dependencies

2. **Technical Planning**
   - Design implementation approach and architecture
   - Select optimal technologies and frameworks
   - Plan development phases and milestones
   - Identify potential challenges and solutions

3. **Coordination Preparation**
   - Identify dependencies on other agents
   - Plan collaboration touchpoints
   - Prepare progress reporting schedule
   - Establish quality gate checkpoints

### Implementation Excellence
1. **Code Development**
   - Write clean, maintainable, and well-documented code
   - Implement proper error handling and logging
   - Follow security best practices and standards
   - Optimize for performance and scalability

2. **Testing Integration**
   - Implement comprehensive unit tests
   - Create integration test suites
   - Prepare code for QA Agent testing
   - Document testing procedures and requirements

3. **Documentation Creation**
   - Code documentation and inline comments
   - API documentation and usage examples
   - Architecture decisions and technical rationale
   - Deployment and configuration guides

## COMMUNICATION PROTOCOLS

### Manager Agent Coordination
- Report task reception and understanding confirmation
- Provide regular progress updates and milestone achievements
- Request guidance on technical decisions and trade-offs
- Report blockers and coordination needs immediately
- Confirm deliverable completion and quality standards

### Inter-Agent Collaboration
- Coordinate with QA Engineer on testing requirements
- Work with Security Engineer on security implementations
- Collaborate with DevOps Engineer on deployment strategies
- Support Documentation Specialist with technical details
- Assist Performance Engineer with optimization requirements

## QUALITY STANDARDS
- Code must pass all quality gates and standards
- Security vulnerabilities must be addressed proactively  
- Performance benchmarks must meet specified requirements
- Documentation must be comprehensive and accurate
- Testing coverage must meet project requirements

You are the technical foundation that transforms requirements into reality. Execute with precision, collaborate effectively, and deliver excellence that exceeds expectations.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      action,
      task_assignment,
      user_id,
      project_id,
      message,
      files,
      coordination_request
    }: FullStackEngineerRequest = await req.json();

    console.log(`Full-Stack Engineer Agent - Action: ${action}, Project: ${project_id}`);

    // Get project details and LLM configuration
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select(`
        *,
        llm_providers (
          provider_name,
          api_key,
          selected_models,
          provider_config
        )
      `)
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      throw new Error(`Project not found: ${projectError?.message}`);
    }

    const llmProvider = project.llm_providers;
    if (!llmProvider) {
      throw new Error('No LLM provider configured for this project');
    }

    // Store agent memory for context
    await supabaseClient
      .from('agent_memory_contexts')
      .insert({
        agent_id: 'fullstack_engineer',
        project_id: project_id,
        memory_type: 'task',
        context_key: `fullstack_task_${Date.now()}`,
        context_data: {
          action,
          task_assignment,
          message,
          timestamp: new Date().toISOString()
        },
        relevance_score: 1.0,
        tags: ['fullstack', 'implementation', action]
      });

    let aiResponse;
    let tokensUsed = 0;
    let cost = 0;

    // Prepare context message based on action
    let contextMessage = '';
    
    switch (action) {
      case 'implement':
        if (task_assignment) {
          contextMessage = `TASK ASSIGNMENT FROM MANAGER AGENT:

Task Type: ${task_assignment.task_type}
Task ID: ${task_assignment.task_id}
Project Context: ${task_assignment.project_context}

Requirements:
${JSON.stringify(task_assignment.requirements, null, 2)}

Technology Constraints: ${task_assignment.technology_constraints.join(', ')}
Deliverables: ${task_assignment.deliverables.join(', ')}
Dependencies: ${task_assignment.dependencies.join(', ')}
Timeline: ${task_assignment.timeline}
Quality Standards: ${task_assignment.quality_standards}

Please analyze this task and provide a detailed implementation plan including:
1. Technical approach and architecture decisions
2. Technology stack recommendations
3. Implementation phases and milestones
4. File structure and code organization
5. Testing strategy and quality assurance approach
6. Integration points and dependencies
7. Performance and security considerations
8. Deliverable timeline and progress checkpoints`;
        } else {
          contextMessage = `Implementation request: ${message}

Please provide a comprehensive implementation plan including technical approach, file structure, code examples, and quality assurance strategy.`;
        }
        break;

      case 'optimize':
        contextMessage = `PERFORMANCE OPTIMIZATION REQUEST:
${message}

Files to analyze:
${files ? JSON.stringify(files, null, 2) : 'No specific files provided'}

Please analyze the current implementation and provide:
1. Performance bottleneck identification
2. Optimization recommendations with code examples
3. Refactoring suggestions for better maintainability
4. Security improvements if needed
5. Testing strategy for optimized code
6. Implementation timeline and approach`;
        break;

      case 'test':
        contextMessage = `TESTING IMPLEMENTATION REQUEST:
${message}

Please provide comprehensive testing strategy including:
1. Unit test implementation with examples
2. Integration test scenarios
3. End-to-end testing approach
4. Test automation setup
5. Code coverage targets and validation
6. Quality gate definitions
7. Testing tools and framework recommendations`;
        break;

      case 'debug':
        contextMessage = `DEBUGGING AND ISSUE RESOLUTION:
${message}

Files involved:
${files ? JSON.stringify(files, null, 2) : 'No specific files provided'}

Please provide:
1. Issue analysis and root cause identification
2. Step-by-step debugging approach
3. Fix implementation with code examples
4. Prevention strategies for similar issues
5. Testing approach to validate fixes
6. Documentation updates if needed`;
        break;

      case 'coordinate':
        contextMessage = `COORDINATION REQUEST FROM MANAGER AGENT:
${message}

Coordination Details:
${coordination_request ? JSON.stringify(coordination_request, null, 2) : 'General coordination request'}

Please provide:
1. Understanding confirmation of coordination requirements
2. Technical dependencies and requirements from other agents
3. Deliverable specifications and formats
4. Timeline and milestone coordination
5. Quality handoff procedures
6. Communication and progress reporting plan`;
        break;

      default:
        contextMessage = message || 'General Full-Stack Engineer consultation request';
    }

    // Make LLM API call based on provider
    if (llmProvider.provider_name === 'openai') {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmProvider.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: llmProvider.selected_models?.[0] || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: FULLSTACK_SYSTEM_PROMPT },
            { role: 'user', content: contextMessage }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      const data = await openAIResponse.json();
      
      if (!openAIResponse.ok) {
        throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
      }

      aiResponse = data.choices[0].message.content;
      tokensUsed = data.usage?.total_tokens || 0;
      cost = (tokensUsed / 1000) * (llmProvider.cost_per_1k_tokens || 0.002);
    } else if (llmProvider.provider_name === 'anthropic') {
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${llmProvider.api_key}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: llmProvider.selected_models?.[0] || 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: FULLSTACK_SYSTEM_PROMPT,
          messages: [
            { role: 'user', content: contextMessage }
          ],
        }),
      });

      const data = await anthropicResponse.json();
      
      if (!anthropicResponse.ok) {
        throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`);
      }

      aiResponse = data.content[0].text;
      tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0;
      cost = (tokensUsed / 1000) * (llmProvider.cost_per_1k_tokens || 0.003);
    } else {
      throw new Error(`Unsupported LLM provider: ${llmProvider.provider_name}`);
    }

    // Log the activity
    await supabaseClient
      .from('agent_activity_logs')
      .insert({
        agent_id: 'fullstack_engineer',
        project_id: project_id,
        activity_type: 'assigned_task',
        details: {
          action,
          task_assignment: task_assignment || null,
          message_preview: message?.substring(0, 100),
          tokens_used: tokensUsed,
          cost: cost,
          timestamp: new Date().toISOString()
        }
      });

    // Update project analytics
    await supabaseClient.rpc('increment_project_analytics', {
      p_project_id: project_id,
      p_api_calls: 1,
      p_tokens_used: tokensUsed,
      p_cost: cost,
      p_agent_operations: 1
    });

    // Store response in memory for future context
    await supabaseClient
      .from('agent_memory_contexts')
      .insert({
        agent_id: 'fullstack_engineer',
        project_id: project_id,
        memory_type: 'learning',
        context_key: `fullstack_response_${Date.now()}`,
        context_data: {
          action,
          response_summary: aiResponse.substring(0, 500),
          success: true,
          tokens_used: tokensUsed,
          cost: cost
        },
        relevance_score: 0.9,
        tags: ['fullstack', 'response', action, 'successful']
      });

    console.log(`Full-Stack Engineer completed ${action} task. Tokens: ${tokensUsed}, Cost: $${cost.toFixed(4)}`);

    return new Response(JSON.stringify({
      success: true,
      response: aiResponse,
      tokens_used: tokensUsed,
      cost: cost,
      agent_id: 'fullstack_engineer',
      action: action,
      project_id: project_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Full-Stack Engineer Agent Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      agent_id: 'fullstack_engineer'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
