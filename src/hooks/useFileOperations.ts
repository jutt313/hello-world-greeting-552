
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileOperation {
  id: string;
  agent_id: string;
  project_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'read';
  file_path: string;
  file_content_before?: string;
  file_content_after?: string;
  operation_status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  programming_language?: string;
  framework?: string;
  tokens_used: number;
  cost: number;
  created_at: string;
  completed_at?: string;
}

interface FileOperationRequest {
  agentId: string;
  projectId: string;
  operationType: 'create' | 'update' | 'delete' | 'read';
  filePath: string;
  fileContent?: string;
  programmingLanguage?: string;
  framework?: string;
}

export const useFileOperations = () => {
  const [operations, setOperations] = useState<FileOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeFileOperation = async (request: FileOperationRequest): Promise<FileOperation | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Call the agent file operations edge function
      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/agent-file-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          user_id: user.user.id,
          agent_id: request.agentId,
          project_id: request.projectId,
          operation: request.operationType,
          file_path: request.filePath,
          file_content: request.fileContent,
          programming_language: request.programmingLanguage,
          framework: request.framework,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to execute file operation');
      }

      // Refresh operations list
      await fetchOperations(request.projectId);
      
      toast({
        title: 'File Operation Completed',
        description: `Successfully ${request.operationType}d ${request.filePath}`,
      });

      return result.operation;
    } catch (error) {
      console.error('Error executing file operation:', error);
      toast({
        title: 'File Operation Failed',
        description: error instanceof Error ? error.message : 'Failed to execute file operation',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOperations = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_file_operations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOperations(data || []);
    } catch (error) {
      console.error('Error fetching file operations:', error);
    }
  };

  const createFile = async (
    agentId: string,
    projectId: string,
    filePath: string,
    content: string,
    programmingLanguage?: string,
    framework?: string
  ) => {
    return executeFileOperation({
      agentId,
      projectId,
      operationType: 'create',
      filePath,
      fileContent: content,
      programmingLanguage,
      framework,
    });
  };

  const updateFile = async (
    agentId: string,
    projectId: string,
    filePath: string,
    content: string,
    programmingLanguage?: string,
    framework?: string
  ) => {
    return executeFileOperation({
      agentId,
      projectId,
      operationType: 'update',
      filePath,
      fileContent: content,
      programmingLanguage,
      framework,
    });
  };

  const deleteFile = async (
    agentId: string,
    projectId: string,
    filePath: string
  ) => {
    return executeFileOperation({
      agentId,
      projectId,
      operationType: 'delete',
      filePath,
    });
  };

  const readFile = async (
    agentId: string,
    projectId: string,
    filePath: string
  ) => {
    return executeFileOperation({
      agentId,
      projectId,
      operationType: 'read',
      filePath,
    });
  };

  return {
    operations,
    isLoading,
    executeFileOperation,
    fetchOperations,
    createFile,
    updateFile,
    deleteFile,
    readFile,
  };
};
