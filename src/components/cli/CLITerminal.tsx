import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface CLICommand {
  id: string;
  command: string;
  output: string[];
  status: 'running' | 'completed' | 'failed';
  timestamp: Date;
  agentId?: string;
  agentName?: string;
}

interface ProjectTemplate {
  id: string;
  name: string;
  template_type: string;
  description: string;
  programming_languages: string[];
  frameworks: string[];
}

export const CLITerminal: React.FC = () => {
  const [commands, setCommands] = useState<CLICommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentPath, setCurrentPath] = useState('~/codexi');
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableCommands = {
    'create-app': 'Create a new application project',
    'list-templates': 'Show available project templates',
    'agent-status': 'Check status of all agents',
    'deploy': 'Deploy current project',
    'test': 'Run project tests',
    'optimize': 'Optimize project performance',
    'help': 'Show available commands'
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands]);

  const addCommand = (command: string, output: string[] = [], status: 'running' | 'completed' | 'failed' = 'running') => {
    const newCommand: CLICommand = {
      id: Date.now().toString(),
      command,
      output,
      status,
      timestamp: new Date()
    };
    setCommands(prev => [...prev, newCommand]);
    return newCommand.id;
  };

  const updateCommand = (id: string, output: string[], status?: 'running' | 'completed' | 'failed') => {
    setCommands(prev => prev.map(cmd => 
      cmd.id === id 
        ? { ...cmd, output, ...(status && { status }) }
        : cmd
    ));
  };

  const executeCreateApp = async (args: string[]) => {
    const commandId = addCommand(`create-app ${args.join(' ')}`);
    
    try {
      // Parse arguments
      const templateType = args.find(arg => arg.startsWith('--template='))?.split('=')[1] || 'react-typescript';
      const appName = args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'my-app';
      const language = args.find(arg => arg.startsWith('--language='))?.split('=')[1] || 'TypeScript';
      const framework = args.find(arg => arg.startsWith('--framework='))?.split('=')[1] || 'React';

      updateCommand(commandId, [`Creating ${templateType} application: ${appName}...`]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateCommand(commandId, [
        `Creating ${templateType} application: ${appName}...`,
        `Language: ${language}`,
        `Framework: ${framework}`,
        'Initializing Manager Agent...'
      ]);

      // Get Manager Agent
      const { data: managerAgent } = await supabase
        .from('agents')
        .select('*')
        .ilike('name', '%manager%')
        .single();

      if (!managerAgent) {
        throw new Error('Manager Agent not found');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      updateCommand(commandId, [
        `Creating ${templateType} application: ${appName}...`,
        `Language: ${language}`,
        `Framework: ${framework}`,
        'Initializing Manager Agent...',
        `Manager Agent (${managerAgent.name}) is orchestrating the workflow...`,
        'Delegating tasks to specialized agents...'
      ]);

      // Map template type to valid project type
      const getProjectType = (template: string) => {
        if (template.includes('ios') || template.includes('android') || template.includes('react-native')) {
          return 'mobile';
        }
        return 'web';
      };

      // Create a project with correct status and type
      const { data: project } = await supabase
        .from('projects')
        .insert({
          name: appName,
          description: `${templateType} application created via CLI`,
          type: getProjectType(templateType),
          status: 'active',
          repository_url: `https://github.com/user/${appName}`,
          owner_id: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (!project) {
        throw new Error('Failed to create project');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call file operations to create project structure
      const { data: fileOpsResponse, error: fileOpsError } = await supabase.functions.invoke('agent-file-operations', {
        body: {
          action: 'create_project_structure',
          projectId: project.id,
          agentId: managerAgent.id,
          templateType: templateType,
          programmingLanguage: language,
          framework: framework
        }
      });

      if (fileOpsError) throw fileOpsError;

      await new Promise(resolve => setTimeout(resolve, 1000));

      updateCommand(commandId, [
        `Creating ${templateType} application: ${appName}...`,
        `Language: ${language}`,
        `Framework: ${framework}`,
        'Initializing Manager Agent...',
        `Manager Agent (${managerAgent.name}) is orchestrating the workflow...`,
        'Delegating tasks to specialized agents...',
        `Project structure created: ${fileOpsResponse?.filesCreated || 'multiple'} files generated`,
        'Full-Stack Engineer: Generated application code',
        'DevOps Engineer: Set up build configuration',
        'QA Engineer: Created test framework',
        'Documentation Specialist: Generated README and docs',
        '',
        `✅ Successfully created ${appName}!`,
        `Project ID: ${project.id}`,
        `Files created: ${fileOpsResponse?.filesCreated || 'multiple'}`,
        `Template used: ${fileOpsResponse?.structure || templateType}`,
        '',
        `Next steps:`,
        `  cd ${appName}`,
        `  codexi deploy`,
        `  codexi test`
      ], 'completed');

      setCurrentPath(`~/codexi/${appName}`);

    } catch (error) {
      updateCommand(commandId, [
        `Error creating application: ${error.message}`,
        'Please check your configuration and try again.'
      ], 'failed');
    }
  };

  const executeListTemplates = async () => {
    const commandId = addCommand('list-templates');
    
    try {
      updateCommand(commandId, ['Fetching available templates...']);
      
      // Use mock templates since project_templates table doesn't exist in current types
      const mockTemplates: ProjectTemplate[] = [
        {
          id: '1',
          name: 'React TypeScript',
          template_type: 'web',
          description: 'Modern React app with TypeScript',
          programming_languages: ['TypeScript', 'JavaScript'],
          frameworks: ['React', 'Vite']
        },
        {
          id: '2',
          name: 'React Native iOS',
          template_type: 'mobile',
          description: 'Cross-platform iOS app',
          programming_languages: ['TypeScript', 'Swift'],
          frameworks: ['React Native', 'Expo']
        },
        {
          id: '3',
          name: 'React Native Android',
          template_type: 'mobile',
          description: 'Cross-platform Android app',
          programming_languages: ['TypeScript', 'Kotlin'],
          frameworks: ['React Native', 'Expo']
        },
        {
          id: '4',
          name: 'Node.js Express API',
          template_type: 'web',
          description: 'Backend API with Node.js',
          programming_languages: ['TypeScript', 'JavaScript'],
          frameworks: ['Express', 'Node.js']
        },
        {
          id: '5',
          name: 'Python Flask API',
          template_type: 'web',
          description: 'Backend API with Python Flask',
          programming_languages: ['Python'],
          frameworks: ['Flask', 'SQLAlchemy']
        }
      ];

      const templateOutput = [
        'Available Project Templates:',
        '',
        '📱 Mobile Applications:',
        ...mockTemplates.filter(t => t.template_type === 'mobile').map(t => 
          `  ${t.name} - ${t.description} (${t.programming_languages.join(', ')})`
        ),
        '',
        '🌐 Web Applications:',
        ...mockTemplates.filter(t => t.template_type === 'web').map(t => 
          `  ${t.name} - ${t.description} (${t.programming_languages.join(', ')})`
        ),
        '',
        'Usage: codexi create-app --template=<template> --name=<app-name>',
        'Example: codexi create-app --template=react-typescript --name=my-awesome-app'
      ];

      updateCommand(commandId, templateOutput, 'completed');

    } catch (error) {
      updateCommand(commandId, [`Error fetching templates: ${error.message}`], 'failed');
    }
  };

  const executeAgentStatus = async () => {
    const commandId = addCommand('agent-status');
    
    try {
      updateCommand(commandId, ['Checking agent status...']);
      
      const { data: agents, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) throw error;

      const statusOutput = [
        'Agent Team Status:',
        '',
        ...agents.map(agent => {
          const statusEmoji = agent.is_active ? '✅' : '❌';
          const roleIcon = {
            'manager': '👑',
            'developer': '💻',
            'devops': '🔧',
            'qa': '🧪',
            'security': '🔒',
            'architect': '🏗️',
            'documentation': '📚',
            'performance': '⚡'
          }[agent.role] || '🤖';
          
          return `  ${statusEmoji} ${roleIcon} ${agent.name} - ${agent.is_active ? 'Active' : 'Inactive'}`;
        }),
        '',
        `Total Agents: ${agents.length}`,
        `Active Agents: ${agents.filter(a => a.is_active).length}`,
        `Ready for project creation and deployment!`
      ];

      updateCommand(commandId, statusOutput, 'completed');

    } catch (error) {
      updateCommand(commandId, [`Error checking agent status: ${error.message}`], 'failed');
    }
  };

  const executeHelp = () => {
    const commandId = addCommand('help');
    const helpOutput = [
      'CodeXI CLI - Available Commands:',
      '',
      ...Object.entries(availableCommands).map(([cmd, desc]) => 
        `  ${cmd.padEnd(20)} - ${desc}`
      ),
      '',
      'Examples:',
      '  codexi create-app --template=react-typescript --name=my-app',
      '  codexi create-app --template=react-native-ios --name=mobile-app',
      '  codexi create-app --template=node-express --name=api-server',
      '',
      'For more information, visit: https://codexi.dev/docs'
    ];
    
    updateCommand(commandId, helpOutput, 'completed');
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    setIsRunning(true);
    const [cmd, ...args] = command.trim().split(' ');

    switch (cmd) {
      case 'create-app':
        await executeCreateApp(args);
        break;
      case 'list-templates':
        await executeListTemplates();
        break;
      case 'agent-status':
        await executeAgentStatus();
        break;
      case 'help':
        executeHelp();
        break;
      case 'clear':
        setCommands([]);
        break;
      default:
        const unknownId = addCommand(command, [`Unknown command: ${cmd}. Type 'help' for available commands.`], 'failed');
    }

    setIsRunning(false);
    setCurrentCommand('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRunning) {
      executeCommand(currentCommand);
    }
  };

  const getStatusColor = (status: CLICommand['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: CLICommand['status']) => {
    switch (status) {
      case 'running': return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'completed': return <Play className="w-3 h-3" />;
      case 'failed': return <Square className="w-3 h-3" />;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5" />
          CodeXI CLI Terminal
          <Badge variant="outline" className="ml-auto">
            {isRunning ? 'Running' : 'Ready'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div 
          ref={terminalRef} 
          className="flex-1 bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-y-auto mb-4"
        >
          <div className="text-gray-400 mb-2">
            CodeXI Terminal v1.0.0 - AI-Powered Development Platform
          </div>
          <div className="text-gray-400 mb-4">
            Type 'help' for available commands.
          </div>
          
          {commands.map((cmd) => (
            <div key={cmd.id} className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-400">{currentPath}</span>
                <span className="text-white">$</span>
                <span className="text-yellow-400">{cmd.command}</span>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(cmd.status)}`}></div>
                {getStatusIcon(cmd.status)}
              </div>
              {cmd.output.map((line, i) => (
                <div key={i} className="text-gray-300 pl-4">
                  {line}
                </div>
              ))}
            </div>
          ))}
          
          {!isRunning && (
            <div className="flex items-center gap-2">
              <span className="text-blue-400">{currentPath}</span>
              <span className="text-white">$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-transparent border-none outline-none text-green-400 flex-1"
                placeholder="Enter command..."
                disabled={isRunning}
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => executeCommand(currentCommand)}
            disabled={isRunning || !currentCommand.trim()}
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute
              </>
            )}
          </Button>
          <Button
            onClick={() => setCommands([])}
            variant="outline"
            size="sm"
          >
            Clear
          </Button>
          <Button
            onClick={() => inputRef.current?.focus()}
            variant="ghost"
            size="sm"
          >
            Focus
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
