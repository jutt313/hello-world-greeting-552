
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  template_type: string;
  programming_language: string;
  framework: string;
  template_structure: Record<string, any>;
  default_files: Record<string, string>;
  dependencies: Record<string, string> | string[];
  build_commands: Record<string, string>;
  deployment_config: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProjectTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error loading templates',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      const processedTemplates: ProjectTemplate[] = data?.map(template => ({
        id: template.id,
        name: template.name || '',
        description: template.description || '',
        template_type: template.template_type || '',
        programming_language: template.programming_language || '',
        framework: template.framework || '',
        template_structure: typeof template.template_structure === 'string' 
          ? JSON.parse(template.template_structure) 
          : (template.template_structure as Record<string, any>) || {},
        default_files: typeof template.default_files === 'string'
          ? JSON.parse(template.default_files)
          : (template.default_files as Record<string, string>) || {},
        dependencies: typeof template.dependencies === 'string' 
          ? JSON.parse(template.dependencies) 
          : (template.dependencies as Record<string, string> | string[]) || {},
        build_commands: typeof template.build_commands === 'string'
          ? JSON.parse(template.build_commands)
          : (template.build_commands as Record<string, string>) || {},
        deployment_config: typeof template.deployment_config === 'string'
          ? JSON.parse(template.deployment_config)
          : (template.deployment_config as Record<string, any>) || {},
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at,
      })) || [];

      setTemplates(processedTemplates);
      console.log(`Successfully loaded ${processedTemplates.length} templates from database`);
      
    } catch (error) {
      console.error('Error fetching templates:', error);
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

  const getTemplatesByLanguage = (language: string) => {
    return templates.filter(template => template.programming_language === language);
  };

  const getTemplateById = (id: string) => {
    return templates.find(template => template.id === id);
  };

  // Add the specific template getters that the CLI expects
  const getWebTemplates = () => getTemplatesByType('web');
  const getIOSTemplates = () => getTemplatesByType('ios');
  const getAndroidTemplates = () => getTemplatesByType('android');
  const getMobileTemplates = () => getTemplatesByType('mobile');
  const getCLITemplates = () => getTemplatesByType('cli');

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    fetchTemplates,
    getTemplatesByType,
    getTemplatesByLanguage,
    getTemplateById,
    getWebTemplates,
    getIOSTemplates,
    getAndroidTemplates,
    getMobileTemplates,
    getCLITemplates,
  };
};
