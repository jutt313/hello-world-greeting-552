
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  template_type: 'web' | 'ios' | 'android' | 'cli' | 'api' | 'desktop';
  programming_language: string;
  framework: string;
  template_structure: Record<string, any>;
  default_files: Record<string, any>;
  dependencies: string[];
  build_commands: Record<string, string>;
  deployment_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProjectTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async (templateType?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (templateType) {
        query = query.eq('template_type', templateType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching project templates:', error);
      toast({
        title: 'Error loading templates',
        description: error instanceof Error ? error.message : 'Failed to load project templates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplatesByType = (type: string) => {
    return templates.filter(template => template.template_type === type);
  };

  const getWebTemplates = () => getTemplatesByType('web');
  const getIOSTemplates = () => getTemplatesByType('ios');
  const getAndroidTemplates = () => getTemplatesByType('android');
  const getCLITemplates = () => getTemplatesByType('cli');

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    fetchTemplates,
    getTemplatesByType,
    getWebTemplates,
    getIOSTemplates,
    getAndroidTemplates,
    getCLITemplates,
  };
};
