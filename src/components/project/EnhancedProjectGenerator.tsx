
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useEnhancedManagerAgent } from '@/hooks/useEnhancedManagerAgent';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Rocket, Code, Smartphone, Terminal, Globe } from 'lucide-react';

export const EnhancedProjectGenerator: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'web' | 'ios' | 'android' | 'cli'>('web');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [requirements, setRequirements] = useState('');
  const [projectId] = useState('project-' + Date.now());
  
  const { templates, isLoading: templatesLoading, getTemplatesByType } = useProjectTemplates();
  const { orchestrateProject, workflow, isOrchestrating } = useEnhancedManagerAgent(projectId);
  const { toast } = useToast();

  const typeIcons = {
    web: <Globe className="w-4 h-4" />,
    ios: <Smartphone className="w-4 h-4" />,
    android: <Smartphone className="w-4 h-4" />,
    cli: <Terminal className="w-4 h-4" />,
  };

  const typeDescriptions = {
    web: 'Create modern web applications with React, Vue, or Angular',
    ios: 'Build native iOS apps with Swift or cross-platform with React Native',
    android: 'Develop Android apps with Kotlin/Java or React Native',
    cli: 'Build command-line tools with Node.js, Python, or Go',
  };

  const currentTemplates = getTemplatesByType(selectedType);
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'Template Required',
        description: 'Please select a project template',
        variant: 'destructive',
      });
      return;
    }

    if (!requirements.trim()) {
      toast({
        title: 'Requirements Required',
        description: 'Please provide project requirements',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTemplateData) {
      toast({
        title: 'Template Error',
        description: 'Selected template not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await orchestrateProject(
        selectedType,
        selectedTemplateData.programming_language,
        selectedTemplateData.framework,
        requirements
      );
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate project',
        variant: 'destructive',
      });
    }
  };

  if (templatesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading project templates from database...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Rocket className="w-5 h-5 text-primary" />
            <span>Enhanced Project Generator</span>
            <Badge variant="secondary">8 AI Agents Ready</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Project Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['web', 'ios', 'android', 'cli'] as const).map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  className="flex flex-col items-center space-y-2 h-auto py-4"
                  onClick={() => {
                    setSelectedType(type);
                    setSelectedTemplate('');
                  }}
                >
                  {typeIcons[type]}
                  <span className="capitalize">{type}</span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {typeDescriptions[selectedType]}
            </p>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Template ({currentTemplates.length} available)
            </label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template..." />
              </SelectTrigger>
              <SelectContent>
                {currentTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4" />
                      <span>{template.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {template.programming_language}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.framework}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTemplateData && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {selectedTemplateData.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{selectedTemplateData.programming_language}</Badge>
                  <Badge variant="secondary">{selectedTemplateData.framework}</Badge>
                  <Badge variant="outline">
                    {selectedTemplateData.dependencies.length} dependencies
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Project Requirements */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Project Requirements</label>
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Describe what you want to build... (e.g., 'A todo app with user authentication, real-time updates, and dark mode support')"
              className="min-h-[100px]"
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!selectedTemplate || !requirements.trim() || isOrchestrating}
            className="w-full"
            size="lg"
          >
            {isOrchestrating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Manager Agent Orchestrating...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Generate Project with 8 AI Agents
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Workflow Status */}
      {workflow && (
        <Card>
          <CardHeader>
            <CardTitle>Project Workflow Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {workflow.progress_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${workflow.progress_percentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">Status</div>
                  <div className="text-muted-foreground capitalize">{workflow.status}</div>
                </div>
                <div>
                  <div className="font-medium">Tasks</div>
                  <div className="text-muted-foreground">{workflow.tasks.length} total</div>
                </div>
                <div>
                  <div className="font-medium">Language</div>
                  <div className="text-muted-foreground">{workflow.programming_language}</div>
                </div>
                <div>
                  <div className="font-medium">Framework</div>
                  <div className="text-muted-foreground">{workflow.framework}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm">Task Status</div>
                <div className="grid gap-2">
                  {workflow.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <span className="text-sm">{task.description}</span>
                      <Badge
                        variant={
                          task.status === 'completed' ? 'default' :
                          task.status === 'in_progress' ? 'secondary' :
                          task.status === 'failed' ? 'destructive' : 'outline'
                        }
                      >
                        {task.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
