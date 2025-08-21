
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AgentCapability {
  id: string;
  agent_id: string;
  capability_name: string;
  capability_type: string;
  capability_config: Record<string, any>;
  supported_languages: string[];
  supported_frameworks: string[];
  is_active: boolean;
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error loading agents',
        description: error instanceof Error ? error.message : 'Failed to load agents',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCapabilities = async (agentId?: string) => {
    try {
      let query = supabase
        .from('agent_capabilities')
        .select('*')
        .eq('is_active', true);

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setCapabilities(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      return [];
    }
  };

  const getAgentById = (id: string) => {
    return agents.find(agent => agent.id === id);
  };

  const getAgentByRole = (role: string) => {
    return agents.find(agent => agent.role === role);
  };

  const getCapabilitiesForAgent = (agentId: string) => {
    return capabilities.filter(cap => cap.agent_id === agentId);
  };

  const getManagerAgent = () => getAgentByRole('manager');
  const getFullStackEngineer = () => getAgentByRole('fullstack_engineer');
  const getDevOpsEngineer = () => getAgentByRole('devops_engineer');
  const getSecurityEngineer = () => getAgentByRole('security_engineer');
  const getQAEngineer = () => getAgentByRole('qa_engineer');
  const getSolutionsArchitect = () => getAgentByRole('solutions_architect');
  const getDocumentationSpecialist = () => getAgentByRole('documentation_specialist');
  const getPerformanceEngineer = () => getAgentByRole('performance_engineer');

  useEffect(() => {
    fetchAgents();
    fetchCapabilities();
  }, []);

  return {
    agents,
    capabilities,
    isLoading,
    fetchAgents,
    fetchCapabilities,
    getAgentById,
    getAgentByRole,
    getCapabilitiesForAgent,
    getManagerAgent,
    getFullStackEngineer,
    getDevOpsEngineer,
    getSecurityEngineer,
    getQAEngineer,
    getSolutionsArchitect,
    getDocumentationSpecialist,
    getPerformanceEngineer,
  };
};
