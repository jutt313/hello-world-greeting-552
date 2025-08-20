
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SolutionsArchitectResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
  action: string;
}

export const useSolutionsArchitect = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeArchitecturalTask = async (
    action: string, 
    message: string,
    options?: {
      files?: any[];
      coordination_request?: any;
      context?: any;
    }
  ): Promise<SolutionsArchitectResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/solutions-architect-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: action,
          user_id: user.user.id,
          project_id: projectId,
          message: message,
          files: options?.files,
          coordination_request: options?.coordination_request,
          context: options?.context,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Failed to execute ${action}`);
      }

      return result;
    } catch (error) {
      console.error(`Error executing ${action}:`, error);
      toast({
        title: 'Execution Error',
        description: error instanceof Error ? error.message : `Failed to execute ${action}`,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeArchitecture = async (projectPath: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('analyze_architecture', `Please analyze the architecture of the project at: ${projectPath}`);
  };

  const designSystem = async (requirements: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('design_system', `Please design a comprehensive system architecture for: ${requirements}`);
  };

  const evaluateTechnology = async (techStack: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('evaluate_technology', `Please evaluate this technology stack: ${techStack}`);
  };

  const createADR = async (decision: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('create_adr', `Please create an Architecture Decision Record for: ${decision}`);
  };

  const designAPI = async (specification: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('design_api', `Please design API architecture for: ${specification}`);
  };

  const planMigration = async (fromSystem: string, toSystem: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('plan_migration', `Please plan migration from ${fromSystem} to ${toSystem}`);
  };

  const generateDocs = async (component: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('generate_docs', `Please generate comprehensive architecture documentation for: ${component}`);
  };

  const designIntegration = async (systems: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('design_integration', `Please design integration architecture for: ${systems}`);
  };

  const planDeployment = async (architecture: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('plan_deployment', `Please plan deployment architecture for: ${architecture}`);
  };

  const assessScalability = async (component: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('assess_scalability', `Please assess scalability of: ${component}`);
  };

  const reviewPerformance = async (system: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('review_performance', `Please review performance architecture of: ${system}`);
  };

  const auditSecurity = async (architecture: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('audit_security', `Please audit security architecture of: ${architecture}`);
  };

  const sendMessage = async (message: string): Promise<SolutionsArchitectResponse | null> => {
    return executeArchitecturalTask('chat', message);
  };

  return {
    executeArchitecturalTask,
    analyzeArchitecture,
    designSystem,
    evaluateTechnology,
    createADR,
    designAPI,
    planMigration,
    generateDocs,
    designIntegration,
    planDeployment,
    assessScalability,
    reviewPerformance,
    auditSecurity,
    sendMessage,
    isLoading,
  };
};
