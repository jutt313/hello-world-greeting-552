
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from './useAgents';
import { useFileOperations } from './useFileOperations';

interface WorkflowTask {
  id: string;
  type: 'design' | 'development' | 'testing' | 'deployment' | 'documentation';
  agent_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[];
  deliverables: string[];
  estimated_effort: number;
  actual_effort?: number;
}

interface ProjectWorkflow {
  project_id: string;
  project_type: 'web' | 'ios' | 'android' | 'cli';
  programming_language: string;
  framework: string;
  requirements: string;
  tasks: WorkflowTask[];
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  progress_percentage: number;
}

export const useEnhancedManagerAgent = (projectId: string) => {
  const [workflow, setWorkflow] = useState<ProjectWorkflow | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const { toast } = useToast();
  const { agents, getAgentByRole } = useAgents();
  const { createFile, updateFile } = useFileOperations();

  const createProjectWorkflow = async (
    projectType: 'web' | 'ios' | 'android' | 'cli',
    programmingLanguage: string,
    framework: string,
    requirements: string
  ): Promise<ProjectWorkflow> => {
    const managerAgent = getAgentByRole('manager');
    const fullStackEngineer = getAgentByRole('fullstack_engineer');
    const devOpsEngineer = getAgentByRole('devops_engineer');
    const qaEngineer = getAgentByRole('qa_engineer');
    const securityEngineer = getAgentByRole('security_engineer');
    const solutionsArchitect = getAgentByRole('solutions_architect');
    const documentationSpecialist = getAgentByRole('documentation_specialist');
    const performanceEngineer = getAgentByRole('performance_engineer');

    if (!managerAgent || !fullStackEngineer || !devOpsEngineer || !qaEngineer || 
        !securityEngineer || !solutionsArchitect || !documentationSpecialist || !performanceEngineer) {
      throw new Error('Required agents not found in database');
    }

    const tasks: WorkflowTask[] = [
      {
        id: 'architecture-design',
        type: 'design',
        agent_id: solutionsArchitect.id,
        description: `Design system architecture for ${projectType} application using ${programmingLanguage} and ${framework}`,
        status: 'pending',
        dependencies: [],
        deliverables: ['architecture-diagram.md', 'technology-stack.md', 'database-schema.sql'],
        estimated_effort: 2,
      },
      {
        id: 'project-structure',
        type: 'development',
        agent_id: fullStackEngineer.id,
        description: `Create project structure and initial setup for ${projectType} application`,
        status: 'pending',
        dependencies: ['architecture-design'],
        deliverables: ['package.json', 'src/main.*', 'README.md', 'project-structure'],
        estimated_effort: 3,
      },
      {
        id: 'core-functionality',
        type: 'development',
        agent_id: fullStackEngineer.id,
        description: `Implement core functionality based on requirements: ${requirements}`,
        status: 'pending',
        dependencies: ['project-structure'],
        deliverables: ['core-components', 'api-endpoints', 'database-models'],
        estimated_effort: 8,
      },
      {
        id: 'security-implementation',
        type: 'development',
        agent_id: securityEngineer.id,
        description: `Implement security measures, authentication, and authorization`,
        status: 'pending',
        dependencies: ['core-functionality'],
        deliverables: ['auth-system', 'security-config', 'vulnerability-scan.md'],
        estimated_effort: 4,
      },
      {
        id: 'testing-suite',
        type: 'testing',
        agent_id: qaEngineer.id,
        description: `Create comprehensive testing suite including unit, integration, and e2e tests`,
        status: 'pending',
        dependencies: ['core-functionality'],
        deliverables: ['unit-tests', 'integration-tests', 'e2e-tests', 'test-report.md'],
        estimated_effort: 5,
      },
      {
        id: 'performance-optimization',
        type: 'development',
        agent_id: performanceEngineer.id,
        description: `Optimize application performance and setup monitoring`,
        status: 'pending',
        dependencies: ['core-functionality'],
        deliverables: ['performance-report.md', 'monitoring-setup', 'optimization-recommendations.md'],
        estimated_effort: 3,
      },
      {
        id: 'deployment-setup',
        type: 'deployment',
        agent_id: devOpsEngineer.id,
        description: `Setup CI/CD pipeline and deployment infrastructure`,
        status: 'pending',
        dependencies: ['testing-suite', 'security-implementation'],
        deliverables: ['Dockerfile', 'ci-cd-pipeline.yml', 'deployment-config', 'infrastructure-setup.md'],
        estimated_effort: 4,
      },
      {
        id: 'documentation',
        type: 'documentation',
        agent_id: documentationSpecialist.id,
        description: `Create comprehensive documentation for the application`,
        status: 'pending',
        dependencies: ['core-functionality'],
        deliverables: ['api-documentation', 'user-guide.md', 'developer-docs.md', 'deployment-guide.md'],
        estimated_effort: 3,
      },
    ];

    const newWorkflow: ProjectWorkflow = {
      project_id: projectId,
      project_type: projectType,
      programming_language: programmingLanguage,
      framework: framework,
      requirements: requirements,
      tasks: tasks,
      status: 'planning',
      progress_percentage: 0,
    };

    setWorkflow(newWorkflow);
    return newWorkflow;
  };

  const delegateTaskToAgent = async (task: WorkflowTask): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Create coordination record
      const { error: coordError } = await supabase
        .from('agent_coordination')
        .insert({
          project_id: projectId,
          initiator_agent_id: getAgentByRole('manager')?.id,
          target_agent_id: task.agent_id,
          coordination_type: 'delegate',
          message: task.description,
          task_data: {
            task_id: task.id,
            task_type: task.type,
            deliverables: task.deliverables,
            estimated_effort: task.estimated_effort,
            dependencies: task.dependencies,
          },
          status: 'pending',
        });

      if (coordError) throw coordError;

      // Get the appropriate agent execution function
      let executionEndpoint = '';
      const agent = agents.find(a => a.id === task.agent_id);
      
      if (agent) {
        switch (agent.role) {
          case 'fullstack_engineer':
            executionEndpoint = 'fullstack-engineer-execution';
            break;
          case 'devops_engineer':
            executionEndpoint = 'devops-engineer-execution';
            break;
          case 'qa_engineer':
            executionEndpoint = 'qa-engineer-execution';
            break;
          case 'security_engineer':
            executionEndpoint = 'security-engineer-execution';
            break;
          case 'solutions_architect':
            executionEndpoint = 'solutions-architect-execution';
            break;
          case 'documentation_specialist':
            executionEndpoint = 'documentation-specialist-execution';
            break;
          case 'performance_engineer':
            executionEndpoint = 'performance-engineer-execution';
            break;
          default:
            throw new Error(`No execution endpoint for agent role: ${agent.role}`);
        }

        // Execute the task via the agent's edge function
        const response = await fetch(`https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/${executionEndpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
          },
          body: JSON.stringify({
            action: 'execute_task',
            user_id: user.user.id,
            project_id: projectId,
            message: task.description,
            task_data: {
              task_id: task.id,
              task_type: task.type,
              deliverables: task.deliverables,
              programming_language: workflow?.programming_language,
              framework: workflow?.framework,
              requirements: workflow?.requirements,
            },
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          // Update coordination record with success
          await supabase
            .from('agent_coordination')
            .update({
              status: 'completed',
              response: result.response,
              updated_at: new Date().toISOString(),
            })
            .eq('project_id', projectId)
            .eq('target_agent_id', task.agent_id)
            .eq('status', 'pending');

          return true;
        } else {
          throw new Error(result.error || 'Task execution failed');
        }
      }

      return false;
    } catch (error) {
      console.error('Error delegating task:', error);
      
      // Update coordination record with failure
      await supabase
        .from('agent_coordination')
        .update({
          status: 'failed',
          response: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId)
        .eq('target_agent_id', task.agent_id)
        .eq('status', 'pending');

      toast({
        title: 'Task Delegation Failed',
        description: error instanceof Error ? error.message : 'Failed to delegate task to agent',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  const orchestrateProject = async (
    projectType: 'web' | 'ios' | 'android' | 'cli',
    programmingLanguage: string,
    framework: string,
    requirements: string
  ) => {
    setIsOrchestrating(true);
    
    try {
      // Create the workflow
      const newWorkflow = await createProjectWorkflow(
        projectType,
        programmingLanguage,
        framework,
        requirements
      );

      toast({
        title: 'Project Orchestration Started',
        description: `Manager Agent is coordinating ${newWorkflow.tasks.length} tasks across 8 specialized agents`,
      });

      // Execute tasks in dependency order
      const completedTasks: string[] = [];
      let totalTasks = newWorkflow.tasks.length;
      let completedCount = 0;

      while (completedCount < totalTasks) {
        // Find tasks that are ready to execute (dependencies satisfied)
        const readyTasks = newWorkflow.tasks.filter(task => 
          task.status === 'pending' && 
          task.dependencies.every(dep => completedTasks.includes(dep))
        );

        if (readyTasks.length === 0) {
          // No more tasks can be executed
          break;
        }

        // Execute ready tasks in parallel
        const taskPromises = readyTasks.map(async task => {
          task.status = 'in_progress';
          const success = await delegateTaskToAgent(task);
          
          if (success) {
            task.status = 'completed';
            completedTasks.push(task.id);
            completedCount++;
          } else {
            task.status = 'failed';
          }
          
          return { task, success };
        });

        await Promise.all(taskPromises);

        // Update progress
        const progressPercentage = (completedCount / totalTasks) * 100;
        setWorkflow(prev => prev ? { ...prev, progress_percentage: progressPercentage } : null);
      }

      // Final status update
      const finalStatus = completedCount === totalTasks ? 'completed' : 'failed';
      setWorkflow(prev => prev ? { ...prev, status: finalStatus } : null);

      toast({
        title: `Project Orchestration ${finalStatus === 'completed' ? 'Completed' : 'Failed'}`,
        description: `${completedCount}/${totalTasks} tasks completed successfully`,
        variant: finalStatus === 'completed' ? 'default' : 'destructive',
      });

    } catch (error) {
      console.error('Error orchestrating project:', error);
      toast({
        title: 'Orchestration Failed',
        description: error instanceof Error ? error.message : 'Failed to orchestrate project',
        variant: 'destructive',
      });
    } finally {
      setIsOrchestrating(false);
    }
  };

  return {
    workflow,
    isOrchestrating,
    createProjectWorkflow,
    delegateTaskToAgent,
    orchestrateProject,
  };
};
