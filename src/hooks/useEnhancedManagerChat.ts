
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatSession {
  id: string;
  project_id: string;
  title: string;
  is_active: boolean;
  started_at: string;
  total_messages: number;
  total_cost: number;
}

interface LLMProvider {
  id: string;
  provider_name: string;
  selected_models: string[];
  cost_per_1k_tokens: number;
}

export const useEnhancedManagerChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const { toast } = useToast();

  const createChatSession = async (projectId: string): Promise<ChatSession | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: session, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.user.id,
          project_id: projectId,
          title: `Manager Chat - ${new Date().toLocaleDateString()}`,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(session);
      return session;

    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat session',
        variant: 'destructive',
      });
      return null;
    }
  };

  const createProjectForChat = async (): Promise<string | null> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: `Manager Chat Session - ${new Date().toLocaleDateString()}`,
          type: 'data', // Using valid enum value
          owner_id: user.user.id,
          description: 'Project created for Manager Agent chat session'
        })
        .select('id')
        .single();

      if (error) throw error;
      return project.id;

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project for chat',
        variant: 'destructive',
      });
      return null;
    }
  };

  const getLLMProviders = async (): Promise<LLMProvider[]> => {
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('id, provider_name, selected_models, cost_per_1k_tokens')
        .eq('is_active', true);

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(provider => ({
        id: provider.id,
        provider_name: provider.provider_name,
        selected_models: Array.isArray(provider.selected_models) 
          ? provider.selected_models as string[]
          : [],
        cost_per_1k_tokens: provider.cost_per_1k_tokens || 0.002
      }));

    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      return [];
    }
  };

  const saveFileOperations = async (
    projectId: string,
    files: File[]
  ): Promise<boolean> => {
    try {
      const operations = [];

      for (const file of files) {
        const content = await file.text();
        
        operations.push({
          agent_id: '22222222-2222-2222-2222-222222222222', // Manager Agent ID
          project_id: projectId,
          operation_type: 'create',
          file_path: file.name,
          file_content_after: content,
          operation_status: 'completed',
          programming_language: detectLanguage(file.name),
          framework: 'User Upload'
        });
      }

      const { error } = await supabase
        .from('agent_file_operations')
        .insert(operations);

      if (error) throw error;
      return true;

    } catch (error) {
      console.error('Error saving file operations:', error);
      return false;
    }
  };

  const saveMessage = async (
    sessionId: string,
    content: string,
    senderType: 'user' | 'manager',
    tokensUsed = 0,
    cost = 0
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          content,
          sender_type: senderType,
          tokens_used: tokensUsed,
          cost,
          message_type: 'text'
        });

      if (error) throw error;

      // Update session totals
      const { error: updateError } = await supabase
        .from('chat_sessions')
        .update({
          total_messages: (currentSession?.total_messages || 0) + 1,
          total_cost: (currentSession?.total_cost || 0) + cost
        })
        .eq('id', sessionId);

      if (updateError) console.error('Error updating session totals:', updateError);

      return true;

    } catch (error) {
      console.error('Error saving message:', error);
      return false;
    }
  };

  const logLLMUsage = async (
    providerId: string,
    modelName: string,
    tokensUsed: number,
    cost: number,
    status: string = 'success'
  ): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase
        .from('llm_usage_analytics')
        .insert({
          provider_id: providerId,
          user_id: user.user.id,
          model_name: modelName,
          tokens_used: tokensUsed,
          cost,
          request_type: 'chat_completion',
          status,
          metadata: {
            feature: 'manager_agent_chat',
            timestamp: new Date().toISOString()
          }
        });

    } catch (error) {
      console.error('Error logging LLM usage:', error);
    }
  };

  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript',
      'jsx': 'JavaScript', 'py': 'Python', 'java': 'Java',
      'cpp': 'C++', 'c': 'C', 'cs': 'C#', 'php': 'PHP',
      'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'html': 'HTML',
      'css': 'CSS', 'md': 'Markdown', 'json': 'JSON'
    };
    return langMap[ext || ''] || 'Text';
  };

  return {
    isLoading,
    currentSession,
    createChatSession,
    createProjectForChat,
    getLLMProviders,
    saveFileOperations,
    saveMessage,
    logLLMUsage,
    setIsLoading,
  };
};
