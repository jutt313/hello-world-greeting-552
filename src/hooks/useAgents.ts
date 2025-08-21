
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
      
      // Map the database response to our interface, ensuring all required fields are present
      const mappedAgents: Agent[] = (data || []).map(agent => ({
        id: agent.id,
        name: agent.name,
        role: agent.role,
        description: agent.description || '',
        permissions: typeof agent.permissions === 'object' ? agent.permissions as Record<string, boolean> : {},
        is_active: agent.is_active,
        created_at: agent.created_at,
      }));
      
      setAgents(mappedAgents);
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
      // Since agent_capabilities table might not be in types yet, we'll handle this gracefully
      console.log('Attempting to fetch capabilities for agent:', agentId);
      
      // For now, return empty array until the types are properly updated
      setCapabilities([]);
      return [];
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
