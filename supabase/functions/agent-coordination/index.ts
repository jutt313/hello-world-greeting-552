
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CoordinationRequest {
  action: 'delegate_task' | 'update_task_status' | 'get_project_workflow' | 'agent_handoff';
  projectId: string;
  initiatorAgentId?: string;
  targetAgentId?: string;
  coordinationType: 'delegate' | 'request' | 'update' | 'complete';
  message: string;
  taskData?: any;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

const AGENT_WORKFLOWS = {
  'create_web_app': [
    { agent: 'manager', task: 'Initialize project and coordinate team' },
    { agent: 'solutions_architect', task: 'Design system architecture and database schema' },
    { agent: 'full_stack_engineer', task: 'Generate frontend and backend code' },
    { agent: 'devops_engineer', task: 'Set up deployment pipeline and infrastructure' },
    { agent: 'qa_engineer', task: 'Create and run test suites' },
    { agent: 'security_engineer', task: 'Security audit and vulnerability scanning' },
    { agent: 'performance_engineer', task: 'Performance optimization and benchmarking' },
    { agent: 'documentation_specialist', task: 'Generate comprehensive documentation' }
  ],
  'create_mobile_app': [
    { agent: 'manager', task: 'Initialize mobile project and coordinate team' },
    { agent: 'solutions_architect', task: 'Design mobile architecture and data flow' },
    { agent: 'full_stack_engineer', task: 'Generate React Native/native code' },
    { agent: 'devops_engineer', task: 'Set up CI/CD for mobile deployment' },
    { agent: 'qa_engineer', task: 'Create mobile testing automation' },
    { agent: 'security_engineer', task: 'Mobile security implementation' },
    { agent: 'performance_engineer', task: 'Mobile performance optimization' },
    { agent: 'documentation_specialist', task: 'Generate mobile app documentation' }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, projectId, initiatorAgentId, targetAgentId, coordinationType, message, taskData, status }: CoordinationRequest = await req.json()

    console.log(`Agent Coordination - Action: ${action}, Project: ${projectId}`)

    switch (action) {
      case 'delegate_task': {
        if (!initiatorAgentId || !targetAgentId) {
          throw new Error('Both initiator and target agent IDs are required for task delegation')
        }

        const { data: coordination, error } = await supabaseClient
          .from('agent_coordination')
          .insert({
            project_id: projectId,
            initiator_agent_id: initiatorAgentId,
            target_agent_id: targetAgentId,
            coordination_type: coordinationType,
            message: message,
            task_data: taskData || {},
            status: 'pending'
          })
          .select(`
            *,
            initiator:agents!initiator_agent_id(name, role),
            target:agents!target_agent_id(name, role)
          `)
          .single()

        if (error) throw error

        console.log(`Task delegated from ${coordination.initiator.name} to ${coordination.target.name}`)

        // If this is the Manager Agent delegating, trigger the workflow
        if (coordination.initiator.role === 'manager' && taskData?.workflowType) {
          const workflow = AGENT_WORKFLOWS[taskData.workflowType as keyof typeof AGENT_WORKFLOWS];
          if (workflow) {
            console.log(`Initiating workflow: ${taskData.workflowType}`)
            // Create coordination entries for the entire workflow
            for (let i = 1; i < workflow.length; i++) {
              const step = workflow[i];
              await supabaseClient
                .from('agent_coordination')
                .insert({
                  project_id: projectId,
                  initiator_agent_id: initiatorAgentId,
                  target_agent_id: targetAgentId, // This would need to map to actual agent IDs
                  coordination_type: 'delegate',
                  message: `Workflow step ${i}: ${step.task}`,
                  task_data: { 
                    workflowStep: i, 
                    workflowType: taskData.workflowType,
                    stepDescription: step.task
                  },
                  status: i === 1 ? 'pending' : 'waiting'
                })
            }
          }
        }

        return new Response(JSON.stringify({ success: true, coordination }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'update_task_status': {
        const { data: coordination, error } = await supabaseClient
          .from('agent_coordination')
          .update({
            status: status,
            response: message,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId)
          .eq('target_agent_id', targetAgentId)
          .eq('status', 'pending')
          .select(`
            *,
            initiator:agents!initiator_agent_id(name, role),
            target:agents!target_agent_id(name, role)
          `)
          .single()

        if (error) throw error

        console.log(`Task status updated by ${coordination.target.name}: ${status}`)

        // If task is completed, check if we need to trigger the next step in workflow
        if (status === 'completed' && coordination.task_data?.workflowType) {
          const nextStep = coordination.task_data.workflowStep + 1;
          await supabaseClient
            .from('agent_coordination')
            .update({ status: 'pending' })
            .eq('project_id', projectId)
            .eq('task_data->workflowStep', nextStep)
            .eq('status', 'waiting')
        }

        return new Response(JSON.stringify({ success: true, coordination }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_project_workflow': {
        const { data: workflow, error } = await supabaseClient
          .from('agent_coordination')
          .select(`
            *,
            initiator:agents!initiator_agent_id(name, role),
            target:agents!target_agent_id(name, role)
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })

        if (error) throw error

        const workflowStats = {
          total: workflow.length,
          pending: workflow.filter(w => w.status === 'pending').length,
          in_progress: workflow.filter(w => w.status === 'in_progress').length,
          completed: workflow.filter(w => w.status === 'completed').length,
          failed: workflow.filter(w => w.status === 'failed').length
        };

        console.log(`Retrieved workflow for project ${projectId}: ${workflow.length} tasks`)

        return new Response(JSON.stringify({ 
          success: true, 
          workflow,
          stats: workflowStats
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'agent_handoff': {
        // Create a handoff coordination where one agent passes work to another
        const { data: coordination, error } = await supabaseClient
          .from('agent_coordination')
          .insert({
            project_id: projectId,
            initiator_agent_id: initiatorAgentId,
            target_agent_id: targetAgentId,
            coordination_type: 'handoff',
            message: message,
            task_data: taskData || {},
            status: 'pending'
          })
          .select(`
            *,
            initiator:agents!initiator_agent_id(name, role),
            target:agents!target_agent_id(name, role)
          `)
          .single()

        if (error) throw error

        console.log(`Agent handoff from ${coordination.initiator.name} to ${coordination.target.name}`)

        return new Response(JSON.stringify({ success: true, coordination }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Agent Coordination Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
