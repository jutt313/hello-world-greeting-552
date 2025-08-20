
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SolutionsArchitectResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
  action_completed: string;
}

export const useSolutionsArchitect = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeArchitecture = async (projectPath: string): Promise<SolutionsArchitectResponse | null> => {
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
          action: 'analyze_architecture',
          user_id: user.user.id,
          project_id: projectId,
          message: `Please analyze the architecture of the project at: ${projectPath}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze architecture');
      }

      return result;
    } catch (error) {
      console.error('Error analyzing architecture:', error);
      toast({
        title: 'Analysis Error',
        description: error instanceof Error ? error.message : 'Failed to analyze architecture',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const designSystem = async (requirements: string): Promise<SolutionsArchitectResponse | null> => {
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
          action: 'design_system',
          user_id: user.user.id,
          project_id: projectId,
          message: `Please design a comprehensive system architecture for: ${requirements}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to design system');
      }

      return result;
    } catch (error) {
      console.error('Error designing system:', error);
      toast({
        title: 'Design Error',
        description: error instanceof Error ? error.message : 'Failed to design system',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const evaluateTechnology = async (techStack: string): Promise<SolutionsArchitectResponse | null> => {
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
          action: 'evaluate_technology',
          user_id: user.user.id,
          project_id: projectId,
          message: `Please evaluate this technology stack: ${techStack}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to evaluate technology');
      }

      return result;
    } catch (error) {
      console.error('Error evaluating technology:', error);
      toast({
        title: 'Evaluation Error',
        description: error instanceof Error ? error.message : 'Failed to evaluate technology',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createADR = async (decision: string): Promise<SolutionsArchitectResponse | null> => {
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
          action: 'create_adr',
          user_id: user.user.id,
          project_id: projectId,
          message: `Please create an Architecture Decision Record for: ${decision}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create ADR');
      }

      return result;
    } catch (error) {
      console.error('Error creating ADR:', error);
      toast({
        title: 'ADR Creation Error',
        description: error instanceof Error ? error.message : 'Failed to create ADR',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string): Promise<SolutionsArchitectResponse | null> => {
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
          action: 'chat',
          user_id: user.user.id,
          project_id: projectId,
          message: message,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Communication Error',
        description: error instanceof Error ? error.message : 'Failed to communicate with Solutions Architect',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeArchitecture,
    designSystem,
    evaluateTechnology,
    createADR,
    sendMessage,
    isLoading,
  };
};
