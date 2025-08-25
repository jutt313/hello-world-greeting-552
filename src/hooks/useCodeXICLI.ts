
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAgents } from '@/hooks/useAgents';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useEnhancedManagerAgent } from '@/hooks/useEnhancedManagerAgent';
import { supabase } from '@/integrations/supabase/client';

interface CLICommand {
  command: string;
  args: string[];
  description: string;
  category: 'agent' | 'project' | 'operation' | 'status' | 'utility';
}

export const useCodeXICLI = (projectId: string) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { agents, isLoading: agentsLoading } = useAgents();
  const { templates, isLoading: templatesLoading } = useProjectTemplates();
  const { orchestrateProject, workflow, isOrchestrating } = useEnhancedManagerAgent(projectId);

  const availableCommands: CLICommand[] = [
    // Agent Commands
    { command: 'agents', args: [], description: 'List all AI agents with status', category: 'agent' },
    { command: 'agent-status', args: ['<role>'], description: 'Show detailed agent status', category: 'agent' },
    
    // Project Commands
    { command: 'templates', args: ['[type]'], description: 'List project templates', category: 'project' },
    { command: 'create-app', args: ['<type>', '<lang>', '<framework>', '[description]'], description: 'Create new application', category: 'project' },
    
    // Operation Commands
    { command: 'deploy', args: ['[service]'], description: 'Deploy with DevOps agent', category: 'operation' },
    { command: 'test', args: ['[type]'], description: 'Run tests with QA engineer', category: 'operation' },
    { command: 'security-scan', args: ['[target]'], description: 'Security analysis', category: 'operation' },
    { command: 'optimize', args: ['[component]'], description: 'Performance optimization', category: 'operation' },
    { command: 'docs', args: ['[action]'], description: 'Documentation management', category: 'operation' },
    
    // Status Commands
    { command: 'workflow-status', args: [], description: 'Show workflow progress', category: 'status' },
    { command: 'database-status', args: [], description: 'Database connectivity status', category: 'status' },
    
    // Utility Commands
    { command: 'help', args: [], description: 'Show help message', category: 'utility' },
    { command: 'clear', args: [], description: 'Clear terminal', category: 'utility' },
    { command: 'version', args: [], description: 'Show CLI version', category: 'utility' },
  ];

  const executeAgentCommand = useCallback(async (agentRole: string, command: string, params: any = {}) => {
    try {
      const agent = agents.find(a => a.role === agentRole);
      if (!agent) {
        throw new Error(`Agent with role '${agentRole}' not found`);
      }

      // Call the appropriate agent execution function
      const { data, error } = await supabase.functions.invoke(`${agentRole}-execution`, {
        body: {
          projectId,
          command,
          parameters: params,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Agent command execution failed:`, error);
      throw error;
    }
  }, [agents, projectId]);

  const executeProjectCommand = useCallback(async (command: string, args: string[]) => {
    switch (command) {
      case 'create-app':
        if (args.length < 3) {
          throw new Error('Usage: create-app <type> <language> <framework> [description]');
        }
        const [type, language, framework, ...descParts] = args;
        const description = descParts.join(' ') || 'New application';
        return await orchestrateProject(type as any, language, framework, description);
      
      default:
        throw new Error(`Unknown project command: ${command}`);
    }
  }, [orchestrateProject]);

  const getCommandSuggestions = useCallback((input: string) => {
    return availableCommands
      .filter(cmd => cmd.command.startsWith(input.toLowerCase()))
      .slice(0, 5);
  }, [availableCommands]);

  const addToHistory = useCallback((command: string) => {
    setCommandHistory(prev => [...prev, command].slice(-50)); // Keep last 50 commands
  }, []);

  const getSystemStatus = useCallback(() => {
    return {
      agents: {
        total: agents.length,
        active: agents.filter(a => a.is_active).length,
        loading: agentsLoading
      },
      templates: {
        total: templates.length,
        loading: templatesLoading
      },
      workflow: workflow ? {
        status: workflow.status,
        progress: workflow.progress_percentage,
        tasksTotal: workflow.tasks.length,
        tasksCompleted: workflow.tasks.filter(t => t.status === 'completed').length
      } : null,
      database: {
        connected: true // We'll enhance this with actual connectivity checks
      }
    };
  }, [agents, agentsLoading, templates, templatesLoading, workflow]);

  return {
    // State
    isExecuting,
    commandHistory,
    availableCommands,
    
    // Data
    agents,
    templates,
    workflow,
    isOrchestrating,
    
    // Functions
    executeAgentCommand,
    executeProjectCommand,
    getCommandSuggestions,
    addToHistory,
    getSystemStatus,
    
    // Loading states
    agentsLoading,
    templatesLoading
  };
};
