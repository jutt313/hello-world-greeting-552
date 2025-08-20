
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FullStackEngineerResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
  action: string;
}

interface TaskAssignment {
  task_type: string;
  task_id: string;
  project_context: string;
  requirements: any;
  technology_constraints: string[];
  deliverables: string[];
  dependencies: string[];
  timeline: string;
  quality_standards: string;
}

export const useFullStackEngineer = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeTask = async (
    action: 'implement' | 'optimize' | 'test' | 'debug' | 'coordinate',
    message: string,
    taskAssignment?: TaskAssignment,
    files?: any[],
    coordinationRequest?: any
  ): Promise<FullStackEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/fullstack-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action,
          task_assignment: taskAssignment,
          user_id: user.user.id,
          project_id: projectId,
          message,
          files,
          coordination_request: coordinationRequest,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to execute Full-Stack Engineer task');
      }

      return result;
    } catch (error) {
      console.error('Error communicating with Full-Stack Engineer:', error);
      toast({
        title: 'Full-Stack Engineer Error',
        description: error instanceof Error ? error.message : 'Failed to execute task',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const implementFeature = async (
    message: string,
    taskAssignment?: TaskAssignment
  ): Promise<FullStackEngineerResponse | null> => {
    return executeTask('implement', message, taskAssignment);
  };

  const optimizeCode = async (
    message: string,
    files?: any[]
  ): Promise<FullStackEngineerResponse | null> => {
    return executeTask('optimize', message, undefined, files);
  };

  const implementTests = async (
    message: string,
    files?: any[]
  ): Promise<FullStackEngineerResponse | null> => {
    return executeTask('test', message, undefined, files);
  };

  const debugIssue = async (
    message: string,
    files?: any[]
  ): Promise<FullStackEngineerResponse | null> => {
    return executeTask('debug', message, undefined, files);
  };

  const coordinateWithTeam = async (
    message: string,
    coordinationRequest?: any
  ): Promise<FullStackEngineerResponse | null> => {
    return executeTask('coordinate', message, undefined, undefined, coordinationRequest);
  };

  return {
    executeTask,
    implementFeature,
    optimizeCode,
    implementTests,
    debugIssue,
    coordinateWithTeam,
    isLoading,
  };
};
