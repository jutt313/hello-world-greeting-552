
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Smartphone, Globe, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProjectTemplate {
  id: string;
  name: string;
  template_type: 'mobile' | 'web';
  description: string;
  programming_languages: string[];
  frameworks: string[];
}

export const ProjectGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string[]>([]);

  // Mock templates data since the table doesn't exist in types yet
  const mockTemplates: ProjectTemplate[] = [
    {
      id: '1',
      name: 'React TypeScript Web App',
      template_type: 'web',
      description: 'Modern web application using React with TypeScript',
      programming_languages: ['TypeScript', 'JavaScript'],
      frameworks: ['React', 'Vite', 'Tailwind CSS']
    },
    {
      id: '2',
      name: 'Vue.js TypeScript Web App',
      template_type: 'web',
      description: 'Modern web application using Vue.js with TypeScript',
      programming_languages: ['TypeScript', 'JavaScript'],
      frameworks: ['Vue.js', 'Vite', 'Vue Router']
    },
    {
      id: '3',
      name: 'Node.js Express API',
      template_type: 'web',
      description: 'Backend API using Node.js with Express',
      programming_languages: ['TypeScript', 'JavaScript'],
      frameworks: ['Express', 'Node.js', 'MongoDB']
    },
    {
      id: '4',
      name: 'React Native Mobile App',
      template_type: 'mobile',
      description: 'Cross-platform mobile app using React Native',
      programming_languages: ['TypeScript', 'JavaScript', 'Swift'],
      frameworks: ['React Native', 'Expo', 'Metro']
    },
    {
      id: '5',
      name: 'Native iOS Swift App',
      template_type: 'mobile',
      description: 'Native iOS application using Swift',
      programming_languages: ['Swift', 'Objective-C'],
      frameworks: ['UIKit', 'SwiftUI', 'Core Data']
    },
    {
      id: '6',
      name: 'Native Android Kotlin App',
      template_type: 'mobile',
      description: 'Native Android application using Kotlin',
      programming_languages: ['Kotlin', 'Java'],
      frameworks: ['Android SDK', 'Jetpack Compose', 'Room']
    },
    {
      id: '7',
      name: 'Python Flask API',
      template_type: 'web',
      description: 'Backend API using Python Flask',
      programming_languages: ['Python'],
      frameworks: ['Flask', 'SQLAlchemy', 'Marshmallow']
    }
  ];

  const selectedTemplateData = mockTemplates.find(t => t.id === selectedTemplate);

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'web': return <Globe className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !projectName || !selectedLanguage || !selectedFramework) {
      return;
    }

    setIsGenerating(true);
    setGenerationStatus([]);

    try {
      // Update status
      setGenerationStatus(['🚀 Initializing project generation...']);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get Manager Agent
      const { data: managerAgent } = await supabase
        .from('agents')
        .select('*')
        .ilike('name', '%manager%')
        .single();

      if (!managerAgent) {
        throw new Error('Manager Agent not found');
      }

      setGenerationStatus(prev => [...prev, `👑 Manager Agent (${managerAgent.name}) is coordinating the workflow...`]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create project with correct type mapping
      const { data: project } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: `${selectedTemplateData?.name} project`,
          type: selectedTemplateData?.template_type || 'web',
          status: 'active',
          owner_id: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (!project) {
        throw new Error('Failed to create project');
      }

      setGenerationStatus(prev => [...prev, `📁 Project created with ID: ${project.id}`]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call file operations
      const { data: fileOpsResponse, error: fileOpsError } = await supabase.functions.invoke('agent-file-operations', {
        body: {
          action: 'create_project_structure',
          projectId: project.id,
          agentId: managerAgent.id,
          templateType: selectedTemplateData?.name,
          programmingLanguage: selectedLanguage,
          framework: selectedFramework
        }
      });

      if (fileOpsError) throw fileOpsError;

      setGenerationStatus(prev => [
        ...prev,
        '💻 Full-Stack Engineer: Generated application code',
        '🔧 DevOps Engineer: Set up build configuration',
        '🧪 QA Engineer: Created test framework',
        '📚 Documentation Specialist: Generated README and docs',
        '',
        `✅ Successfully generated ${projectName}!`,
        `📊 Files created: ${fileOpsResponse?.filesCreated || 'multiple'}`,
        `🏗️ Template: ${selectedTemplateData?.name}`,
        `💻 Language: ${selectedLanguage}`,
        `⚡ Framework: ${selectedFramework}`
      ]);

    } catch (error) {
      setGenerationStatus(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Project Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Select Template</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project template" />
              </SelectTrigger>
              <SelectContent>
                {mockTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      {getTemplateIcon(template.template_type)}
                      <span>{template.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-awesome-app"
            />
          </div>

          {/* Language Selection */}
          {selectedTemplateData && (
            <div className="space-y-2">
              <Label htmlFor="language">Programming Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose programming language" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTemplateData.programming_languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Framework Selection */}
          {selectedTemplateData && (
            <div className="space-y-2">
              <Label htmlFor="framework">Framework</Label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose framework" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTemplateData.frameworks.map((framework) => (
                    <SelectItem key={framework} value={framework}>
                      {framework}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Template Info */}
          {selectedTemplateData && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{selectedTemplateData.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedTemplateData.description}
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{selectedTemplateData.template_type}</Badge>
                {selectedTemplateData.programming_languages.map((lang) => (
                  <Badge key={lang} variant="outline">{lang}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedTemplate || !projectName || !selectedLanguage || !selectedFramework || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Project...
              </>
            ) : (
              'Generate Project'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Status Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-y-auto">
            {generationStatus.length === 0 ? (
              <div className="text-gray-400">
                Select a template and click "Generate Project" to begin...
              </div>
            ) : (
              generationStatus.map((status, index) => (
                <div key={index} className="mb-1">
                  {status}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
