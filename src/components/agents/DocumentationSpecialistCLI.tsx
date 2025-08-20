
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Terminal, Play, Copy, BookOpen, Globe, Users, CheckCircle } from 'lucide-react';
import { useDocumentationSpecialist } from '@/hooks/useDocumentationSpecialist';
import { useToast } from '@/hooks/use-toast';

interface DocumentationSpecialistCLIProps {
  projectId: string;
  projectName: string;
}

const DocumentationSpecialistCLI: React.FC<DocumentationSpecialistCLIProps> = ({
  projectId,
  projectName,
}) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const { 
    createDocumentation, 
    generateApiDocs, 
    createUserGuide, 
    writeTutorial, 
    documentArchitecture, 
    auditDocumentation,
    translateDocs,
    isLoading 
  } = useDocumentationSpecialist(projectId);
  const { toast } = useToast();

  const commands = [
    { cmd: 'create-docs [type] [path]', desc: 'Create comprehensive documentation for specified component' },
    { cmd: 'generate-api-docs [spec]', desc: 'Generate interactive API documentation from OpenAPI/GraphQL specs' },
    { cmd: 'create-user-guide [audience] [complexity]', desc: 'Develop user guides for specific audiences' },
    { cmd: 'write-tutorial [topic] [format]', desc: 'Create step-by-step tutorials with interactive elements' },
    { cmd: 'document-architecture [system]', desc: 'Generate system architecture and technical specifications' },
    { cmd: 'create-adr [decision]', desc: 'Document architecture decision records with context' },
    { cmd: 'audit-docs [path]', desc: 'Perform comprehensive documentation quality assessment' },
    { cmd: 'translate-docs [language] [path]', desc: 'Localize documentation for specified language' },
    { cmd: 'optimize-content [path]', desc: 'Optimize content for accessibility, SEO, and UX' },
    { cmd: 'generate-changelog [version]', desc: 'Create detailed changelog and migration guides' }
  ];

  const documentationTypes = [
    { value: 'api', label: 'API Documentation' },
    { value: 'user_guide', label: 'User Guide' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'architecture', label: 'Architecture Documentation' },
    { value: 'technical_spec', label: 'Technical Specification' },
    { value: 'troubleshooting', label: 'Troubleshooting Guide' }
  ];

  const audiences = [
    { value: 'developers', label: 'Developers' },
    { value: 'end_users', label: 'End Users' },
    { value: 'administrators', label: 'System Administrators' },
    { value: 'beginners', label: 'Beginners' },
    { value: 'advanced', label: 'Advanced Users' },
    { value: 'technical_writers', label: 'Technical Writers' }
  ];

  const formats = [
    { value: 'markdown', label: 'Markdown' },
    { value: 'interactive', label: 'Interactive HTML' },
    { value: 'video', label: 'Video Tutorial' },
    { value: 'pdf', label: 'PDF Guide' },
    { value: 'slides', label: 'Presentation Slides' },
    { value: 'api_spec', label: 'API Specification' }
  ];

  const languages = [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' }
  ];

  const addOutput = (text: string) => {
    setOutput(prev => [...prev, text]);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    addOutput(`$ ${command}`);
    const args = command.trim().split(' ');
    const baseCommand = args[0];

    try {
      let result;
      
      switch (baseCommand) {
        case 'create-docs':
          result = await createDocumentation(args[1] || selectedDocType, args[2]);
          break;
        case 'generate-api-docs':
          result = await generateApiDocs(args[1] || 'openapi.yaml');
          break;
        case 'create-user-guide':
          result = await createUserGuide(args[1] || selectedAudience, args[2] || 'intermediate');
          break;
        case 'write-tutorial':
          result = await writeTutorial(args[1] || 'getting-started', args[2] || selectedFormat);
          break;
        case 'document-architecture':
          result = await documentArchitecture(args[1] || 'system');
          break;
        case 'audit-docs':
          result = await auditDocumentation(args[1]);
          break;
        case 'translate-docs':
          result = await translateDocs(args[1] || selectedLanguage, args[2]);
          break;
        case 'help':
          addOutput('Available Commands:');
          commands.forEach(cmd => {
            addOutput(`  ${cmd.cmd.padEnd(35)} ${cmd.desc}`);
          });
          break;
        case 'clear':
          setOutput([]);
          return;
        default:
          addOutput(`Unknown command: ${baseCommand}. Type 'help' for available commands.`);
          return;
      }

      if (result) {
        addOutput('✅ Documentation task completed successfully!');
        addOutput(`📊 Performance: ${result.tokens_used} tokens, $${result.cost.toFixed(4)} cost`);
        if (result.files_created && result.files_created.length > 0) {
          addOutput(`📁 Files created: ${result.files_created.join(', ')}`);
        }
        addOutput(''); // Empty line for spacing
        
        toast({
          title: 'Documentation Task Completed',
          description: `Successfully executed ${baseCommand} command`,
        });
      }
    } catch (error) {
      addOutput(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast({
        title: 'Command Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }

    setCommand('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    toast({
      title: 'Command Copied',
      description: 'Command has been copied to clipboard',
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* CLI Terminal */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-500" />
            Documentation Specialist CLI
            <Badge variant="outline" className="ml-auto">
              {projectName}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Terminal Output */}
          <div className="bg-black text-green-400 rounded-lg p-4 font-mono text-sm">
            <ScrollArea className="h-64">
              <div className="space-y-1">
                <div className="text-cyan-400">Documentation Specialist Agent v2.0.0</div>
                <div className="text-yellow-400">Project: {projectName}</div>
                <div className="text-gray-400">Type 'help' for available commands</div>
                <div>---</div>
                {output.map((line, index) => (
                  <div key={index} className={line.startsWith('$') ? 'text-cyan-400' : 'text-green-400'}>
                    {line}
                  </div>
                ))}
                {isLoading && (
                  <div className="text-yellow-400 animate-pulse">
                    Executing documentation task...
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Command Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-mono">
                $
              </span>
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter documentation command..."
                disabled={isLoading}
                className="pl-8 font-mono"
              />
            </div>
            <Button 
              onClick={executeCommand} 
              disabled={!command.trim() || isLoading}
              size="icon"
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Command Reference and Options */}
      <div className="space-y-6">
        {/* Quick Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Documentation Type</label>
              <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Target Audience</label>
              <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Output Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Command Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available Commands</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {commands.map((command, index) => (
                  <div key={index} className="p-2 rounded border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <code className="text-xs font-mono text-primary">
                        {command.cmd}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCommand(command.cmd.split(' ')[0])}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {command.desc}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Documentation Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentation Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-blue-500" />
                <span>API Documentation</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-green-500" />
                <span>User Guides</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-purple-500" />
                <span>Internationalization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-orange-500" />
                <span>Accessibility</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentationSpecialistCLI;
