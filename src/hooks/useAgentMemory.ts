
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AgentMemoryContext, AgentExpertisePattern, MemoryType, ExpertiseCategory } from '@/types/memory';

export const useAgentMemory = (projectId?: string, agentId?: string) => {
  const [memories, setMemories] = useState<AgentMemoryContext[]>([]);
  const [expertisePatterns, setExpertisePatterns] = useState<AgentExpertisePattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMemories = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('agent_memory_contexts')
        .select('*')
        .eq('project_id', projectId)
        .order('last_accessed_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching agent memories:', error);
      toast({
        title: 'Error loading memories',
        description: error instanceof Error ? error.message : 'Failed to load agent memories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExpertisePatterns = async () => {
    if (!agentId) return;
    
    try {
      const { data, error } = await supabase
        .from('agent_expertise_patterns')
        .select('*')
        .eq('agent_id', agentId)
        .order('effectiveness_score', { ascending: false });

      if (error) throw error;
      setExpertisePatterns(data || []);
    } catch (error) {
      console.error('Error fetching expertise patterns:', error);
      toast({
        title: 'Error loading expertise',
        description: error instanceof Error ? error.message : 'Failed to load expertise patterns',
        variant: 'destructive',
      });
    }
  };

  const addMemory = async (memoryData: {
    agent_id: string;
    memory_type: MemoryType;
    context_key: string;
    context_data: Record<string, any>;
    relevance_score?: number;
    tags?: string[];
    related_message_id?: string;
  }) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('agent_memory_contexts')
        .insert({
          ...memoryData,
          project_id: projectId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setMemories(prev => [data, ...prev]);
      toast({
        title: 'Memory saved',
        description: 'Agent memory has been successfully recorded',
      });
      
      return data;
    } catch (error) {
      console.error('Error adding memory:', error);
      toast({
        title: 'Error saving memory',
        description: error instanceof Error ? error.message : 'Failed to save memory',
        variant: 'destructive',
      });
    }
  };

  const addExpertisePattern = async (patternData: {
    agent_id: string;
    expertise_category: ExpertiseCategory;
    pattern_name: string;
    pattern_description?: string;
    pattern_data: Record<string, any>;
    success_rate?: number;
    projects_applied?: string[];
    effectiveness_score?: number;
    metadata?: {
      conditions: string[];
      prerequisites: string[];
      common_errors: string[];
      optimization_tips: string[];
    };
  }) => {
    try {
      const { data, error } = await supabase
        .from('agent_expertise_patterns')
        .insert(patternData)
        .select()
        .single();

      if (error) throw error;
      
      setExpertisePatterns(prev => [data, ...prev]);
      toast({
        title: 'Expertise pattern learned',
        description: 'Agent has successfully learned a new pattern',
      });
      
      return data;
    } catch (error) {
      console.error('Error adding expertise pattern:', error);
      toast({
        title: 'Error learning pattern',
        description: error instanceof Error ? error.message : 'Failed to save expertise pattern',
        variant: 'destructive',
      });
    }
  };

  const updateMemoryAccess = async (memoryId: string) => {
    try {
      const { error } = await supabase
        .from('agent_memory_contexts')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', memoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating memory access:', error);
    }
  };

  const getRelevantMemories = (memoryType?: MemoryType, tags?: string[], limit = 10) => {
    let filtered = memories;
    
    if (memoryType) {
      filtered = filtered.filter(m => m.memory_type === memoryType);
    }
    
    if (tags && tags.length > 0) {
      filtered = filtered.filter(m => 
        tags.some(tag => m.tags.includes(tag))
      );
    }
    
    return filtered
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);
  };

  useEffect(() => {
    fetchMemories();
    fetchExpertisePatterns();
  }, [projectId, agentId]);

  return {
    memories,
    expertisePatterns,
    isLoading,
    addMemory,
    addExpertisePattern,
    updateMemoryAccess,
    getRelevantMemories,
    refetchMemories: fetchMemories,
    refetchExpertise: fetchExpertisePatterns,
  };
};
