
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
}

export const useAgentCommunication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const agentEndpoints = {
    manager: 'manager-agent-execution',
    architect: 'solutions-architect-execution',
    fullstack: 'fullstack-engineer-execution',
    devops: 'devops-engineer-execution',
    security: 'security-engineer-execution',
    qa: 'qa-engineer-execution',
    performance: 'performance-engineer-execution',
    docs: 'documentation-specialist-execution'
  };

  const communicateWithAgent = async (
    agentName: string, 
    message: string,
    projectId?: string
  ): Promise<AgentResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const endpoint = agentEndpoints[agentName as keyof typeof agentEndpoints];
      if (!endpoint) {
        throw new Error(`Unknown agent: ${agentName}`);
      }

      const response = await fetch(`https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'chat',
          user_id: user.user.id,
          project_id: projectId || 'terminal-session',
          message: message,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Failed to communicate with ${agentName} agent`);
      }

      return result;
    } catch (error) {
      console.error(`Error communicating with ${agentName} agent:`, error);
      toast({
        title: 'Communication Error',
        description: error instanceof Error ? error.message : `Failed to communicate with ${agentName} agent`,
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableAgents = () => {
    return Object.keys(agentEndpoints);
  };

  return {
    communicateWithAgent,
    getAvailableAgents,
    isLoading,
  };
};
