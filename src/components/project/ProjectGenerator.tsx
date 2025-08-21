
import React, { useState, useEffect } from 'react';
import { Rocket, Code, Smartphone, Globe, Server, Database, Shield, TestTube } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { CLITerminal } from '@/components/cli/CLITerminal';
import { AgentCoordination } from '@/components/agents/AgentCoordination';

interface ProjectTemplate {
  id: string;
  name: string;
  template_type: string;
  description: string;
  programming_languages: string[];
  frameworks: string[];
  template_config: any;
}

export const ProjectGenerator: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedFramework, setSelectedFramework] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generator' | 'terminal' | 'coordination'>('generator');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .order('template_type', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const getTemplateIcon = (templateType: string) => {
    if (templateType === 'ios') return <Smartphone className="w-5 h-5 text-blue-500" />;
    if (templateType === 'android') return <Smartphone className="w-5 h-5 text-green-500" />;
    if (templateType === 'web') return <Globe className="w-5 h-5 text-purple-500" />;
    return <Code className="w-5 h-5 text-gray-500" />;
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const createProject = async () => {
    if (!selectedTemplate || !projectName.trim() || !selectedLanguage || !selectedFramework) {
      return;
    }

    setIsCreating(true);
    try {
      // Get Manager Agent
      const { data: managerAgent } = await supabase
        .from('agents')
        .select('*')
        .ilike('name', '%manager%')
        .single();

      if (!managerAgent) {
        throw new Error('Manager Agent not found');
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: `${selectedTemplateData?.name} application created via Project Generator`,
          project_type: selectedTemplateData?.template_type || 'web',
          status: 'in_progress',
          repository_url: `https://github.com/user/${projectName}`,
          tech_stack: [selectedLanguage, selectedFramework]
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Create project file structure
      const { data: fileOpsResponse, error: fileOpsError } = await supabase.functions.invoke('agent-file-operations', {
        body: {
          action: 'create_project_structure',
          projectId: project.id,
          agentId: managerAgent.id,
          templateType: `${selectedFramework.toLowerCase()}-${selectedLanguage.toLowerCase()}`,
          programmingLanguage: selectedLanguage,
          framework: selectedFramework
        }
      });

      if (fileOpsError) throw fileOpsError;

      // Initialize workflow coordination
      const { data: coordinationResponse, error: coordinationError } = await supabase.functions.invoke('agent-coordination', {
        body: {
          action: 'delegate_task',
          projectId: project.id,
          initiatorAgentId: managerAgent.id,
          targetAgentId: managerAgent.id, // Manager coordinates the whole workflow
          coordinationType: 'delegate',
          message: `Initialize ${selectedTemplateData?.name} project: ${projectName}`,
          taskData: {
            workflowType: selectedTemplateData?.template_type === 'web' ? 'create_web_app' : 'create_mobile_app',
            projectName,
            template: selectedTemplateData?.name,
            language: selectedLanguage,
            framework: selectedFramework
          }
        }
      });

      if (coordinationError) throw coordinationError;

      setCreatedProjectId(project.id);
      setActiveTab('coordination');

    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'generator' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('generator')}
          className="flex items-center gap-2"
        >
          <Rocket className="w-4 h-4" />
          Project Generator
        </Button>
        <Button
          variant={activeTab === 'terminal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('terminal')}
          className="flex items-center gap-2"
        >
          <Code className="w-4 h-4" />
          CLI Terminal
        </Button>
        <Button
          variant={activeTab === 'coordination' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('coordination')}
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Agent Coordination
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Create New Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter your project name..."
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <Label>Choose Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setSelectedLanguage('');
                        setSelectedFramework('');
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {getTemplateIcon(template.template_type)}
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.programming_languages.slice(0, 2).map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                        {template.programming_languages.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.programming_languages.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language & Framework Selection */}
              {selectedTemplateData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Programming Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
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

                  <div className="space-y-2">
                    <Label>Framework</Label>
                    <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select framework" />
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
                </div>
              )}

              {/* Create Button */}
              <Button
                onClick={createProject}
                disabled={!selectedTemplate || !projectName.trim() || !selectedLanguage || !selectedFramework || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Database className="w-4 h-4 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Create Project with AI Agents
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'terminal' && <CLITerminal />}
      
      {activeTab === 'coordination' && <AgentCoordination projectId={createdProjectId} />}
    </div>
  );
};
