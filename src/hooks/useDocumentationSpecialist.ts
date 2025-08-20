
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DocumentationSpecialistResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
  files_created?: string[];
  documentation_type?: string;
}

export const useDocumentationSpecialist = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeDocumentationTask = async (
    action: string,
    message: string,
    options?: {
      documentation_type?: string;
      target_audience?: string;
      format?: string;
      language?: string;
      file_path?: string;
      content?: string;
    }
  ): Promise<DocumentationSpecialistResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/documentation-specialist-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action,
          user_id: user.user.id,
          project_id: projectId,
          message,
          ...options
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to execute documentation task');
      }

      return result;
    } catch (error) {
      console.error('Error executing documentation task:', error);
      toast({
        title: 'Documentation Error',
        description: error instanceof Error ? error.message : 'Failed to execute documentation task',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createDocumentation = async (type: string, path?: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('create_docs', `Create ${type} documentation${path ? ` for ${path}` : ''}`, {
      documentation_type: type,
      file_path: path
    });
  };

  const generateApiDocs = async (apiSpec: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('generate_api_docs', `Generate API documentation from ${apiSpec}`, {
      documentation_type: 'api',
      format: 'interactive'
    });
  };

  const createUserGuide = async (audience: string, complexity: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('create_user_guide', `Create user guide for ${audience} with ${complexity} complexity`, {
      documentation_type: 'user_guide',
      target_audience: audience,
      format: 'interactive'
    });
  };

  const writeTutorial = async (topic: string, format: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('write_tutorial', `Create tutorial for ${topic} in ${format} format`, {
      documentation_type: 'tutorial',
      format
    });
  };

  const documentArchitecture = async (system: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('document_architecture', `Document ${system} architecture and specifications`, {
      documentation_type: 'architecture',
      format: 'comprehensive'
    });
  };

  const auditDocumentation = async (path?: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('audit_docs', `Audit documentation${path ? ` in ${path}` : ''}`, {
      documentation_type: 'audit',
      file_path: path
    });
  };

  const translateDocs = async (language: string, path?: string): Promise<DocumentationSpecialistResponse | null> => {
    return executeDocumentationTask('translate_docs', `Translate documentation to ${language}${path ? ` for ${path}` : ''}`, {
      documentation_type: 'translation',
      language,
      file_path: path
    });
  };

  return {
    executeDocumentationTask,
    createDocumentation,
    generateApiDocs,
    createUserGuide,
    writeTutorial,
    documentArchitecture,
    auditDocumentation,
    translateDocs,
    isLoading,
  };
};
