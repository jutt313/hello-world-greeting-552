
import { useState, useEffect } from 'react';
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

export const useRealFileOperations = () => {
  const [operations, setOperations] = useState<FileOperation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchOperations = async (projectId?: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching REAL file operations for project:', projectId);
      
      let query = supabase
        .from('agent_file_operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching file operations:', error);
        throw error;
      }

      console.log(`Loaded ${data?.length || 0} REAL file operations`);
      setOperations(data || []);
      
    } catch (error) {
      console.error('Error fetching file operations:', error);
      toast({
        title: 'Error loading REAL file operations',
        description: error instanceof Error ? error.message : 'Failed to load file operations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRealFileOperation = async (operation: Omit<FileOperation, 'id' | 'created_at'>) => {
    try {
      console.log('Creating REAL file operation:', operation);
      
      const { data, error } = await supabase
        .from('agent_file_operations')
        .insert({
          ...operation,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setOperations(prev => [data, ...prev]);
      
      toast({
        title: 'REAL File Operation Created',
        description: `${operation.operation_type} operation for ${operation.file_path}`,
      });

      return data;
    } catch (error) {
      console.error('Error creating REAL file operation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create REAL file operation',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateOperationStatus = async (operationId: string, status: FileOperation['operation_status'], errorMessage?: string) => {
    try {
      const { error } = await supabase
        .from('agent_file_operations')
        .update({ 
          operation_status: status, 
          error_message: errorMessage,
          completed_at: status === 'completed' ? new Date().toISOString() : undefined
        })
        .eq('id', operationId);

      if (error) throw error;

      setOperations(prev => 
        prev.map(op => 
          op.id === operationId 
            ? { 
                ...op, 
                operation_status: status, 
                error_message: errorMessage,
                completed_at: status === 'completed' ? new Date().toISOString() : op.completed_at
              }
            : op
        )
      );
    } catch (error) {
      console.error('Error updating operation status:', error);
      throw error;
    }
  };

  const getOperationsByAgent = (agentId: string) => {
    return operations.filter(op => op.agent_id === agentId);
  };

  const getOperationsByProject = (projectId: string) => {
    return operations.filter(op => op.project_id === projectId);
  };

  const getOperationsByStatus = (status: FileOperation['operation_status']) => {
    return operations.filter(op => op.operation_status === status);
  };

  const getTotalCost = () => {
    return operations.reduce((total, op) => total + op.cost, 0);
  };

  const getTotalTokensUsed = () => {
    return operations.reduce((total, op) => total + op.tokens_used, 0);
  };

  const getProjectFileStructure = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_file_operations')
        .select('file_path, file_content_after, programming_language, operation_type')
        .eq('project_id', projectId)
        .eq('operation_status', 'completed')
        .order('file_path', { ascending: true });

      if (error) throw error;

      // Build REAL file tree structure
      const fileTree: { [key: string]: any } = {};
      
      data?.forEach(file => {
        if (file.operation_type !== 'delete') {
          const pathParts = file.file_path.split('/');
          let current = fileTree;
          
          pathParts.forEach((part, index) => {
            if (index === pathParts.length - 1) {
              // This is a file
              current[part] = {
                type: 'file',
                content: file.file_content_after,
                language: file.programming_language,
                path: file.file_path
              };
            } else {
              // This is a directory
              if (!current[part]) {
                current[part] = { type: 'directory', children: {} };
              }
              current = current[part].children;
            }
          });
        }
      });

      return fileTree;
    } catch (error) {
      console.error('Error building file structure:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  return {
    operations,
    isLoading,
    fetchOperations,
    createRealFileOperation,
    updateOperationStatus,
    getOperationsByAgent,
    getOperationsByProject,
    getOperationsByStatus,
    getTotalCost,
    getTotalTokensUsed,
    getProjectFileStructure,
  };
};
