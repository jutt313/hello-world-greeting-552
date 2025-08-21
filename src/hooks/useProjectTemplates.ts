
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

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      // Since project_templates table might not be in types yet, provide fallback templates
      const fallbackTemplates: ProjectTemplate[] = [
        {
          id: '1',
          name: 'React TypeScript Web App',
          description: 'Modern React application with TypeScript, Vite, and Tailwind CSS',
          template_type: 'web',
          programming_language: 'TypeScript',
          framework: 'React',
          template_structure: { src: { components: {}, pages: {}, hooks: {}, utils: {} }, public: {} },
          default_files: {
            'package.json': JSON.stringify({
              name: 'react-app',
              version: '1.0.0',
              scripts: { dev: 'vite', build: 'vite build' },
              dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' }
            }, null, 2)
          },
          dependencies: ['react', 'react-dom', 'typescript', 'vite'],
          build_commands: { dev: 'vite', build: 'vite build' },
          deployment_config: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Vue TypeScript Web App',
          description: 'Vue 3 application with TypeScript and Vite',
          template_type: 'web',
          programming_language: 'TypeScript',
          framework: 'Vue',
          template_structure: { src: { components: {}, views: {}, composables: {} }, public: {} },
          default_files: {
            'package.json': JSON.stringify({
              name: 'vue-app',
              version: '1.0.0',
              scripts: { dev: 'vite', build: 'vite build' },
              dependencies: { vue: '^3.3.0' }
            }, null, 2)
          },
          dependencies: ['vue', '@vitejs/plugin-vue', 'typescript', 'vite'],
          build_commands: { dev: 'vite', build: 'vite build' },
          deployment_config: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Swift iOS App',
          description: 'Native iOS application using Swift and UIKit',
          template_type: 'ios',
          programming_language: 'Swift',
          framework: 'UIKit',
          template_structure: { Sources: { App: {}, Views: {}, Models: {} }, Resources: {} },
          default_files: {
            'Package.swift': '// swift-tools-version: 5.9\nimport PackageDescription\n\nlet package = Package(\n    name: "iOSApp"\n)'
          },
          dependencies: [],
          build_commands: { build: 'swift build', test: 'swift test' },
          deployment_config: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'SwiftUI iOS App',
          description: 'Modern iOS application using SwiftUI',
          template_type: 'ios',
          programming_language: 'Swift',
          framework: 'SwiftUI',
          template_structure: { Sources: { App: {}, Views: {}, Models: {} }, Resources: {} },
          default_files: {
            'Package.swift': '// swift-tools-version: 5.9\nimport PackageDescription\n\nlet package = Package(\n    name: "SwiftUIApp"\n)'
          },
          dependencies: [],
          build_commands: { build: 'swift build', test: 'swift test' },
          deployment_config: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Kotlin Android App',
          description: 'Native Android application using Kotlin',
          template_type: 'android',
          programming_language: 'Kotlin',
          framework: 'Android SDK',
          template_structure: { app: { src: { main: { java: {}, res: {} } } } },
          default_files: {
            'build.gradle': 'plugins {\n    id "com.android.application"\n    id "org.jetbrains.kotlin.android"\n}'
          },
          dependencies: ['androidx.core:core-ktx', 'androidx.appcompat:appcompat'],
          build_commands: { build: './gradlew build', run: './gradlew installDebug' },
          deployment_config: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '6',
          name: 'Node.js CLI App',
          description: 'Command-line application using Node.js and TypeScript',
          template_type: 'cli',
          programming_language: 'TypeScript',
          framework: 'Node.js',
          template_structure: { src: { commands: {}, utils: {} }, bin: {} },
          default_files: {
            'package.json': JSON.stringify({
              name: 'cli-app',
              version: '1.0.0',
              bin: { myapp: './bin/index.js' },
              scripts: { build: 'tsc', start: 'node dist/index.js' },
              dependencies: { commander: '^11.0.0', chalk: '^5.3.0' }
            }, null, 2)
          },
          dependencies: ['commander', 'chalk', 'typescript', '@types/node'],
          build_commands: { build: 'tsc', start: 'node dist/index.js' },
          deployment_config: {},
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      console.log('Using fallback templates until database types are updated');
      setTemplates(fallbackTemplates);
      
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
    getCLITemplates,
  };
};
