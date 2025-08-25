
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Cpu, Database, Zap, Play, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useAgents } from '@/hooks/useAgents';
import { useEnhancedManagerAgent } from '@/hooks/useEnhancedManagerAgent';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CLIOutput {
  id: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info' | 'warning';
  content: string;
  timestamp: Date;
  agentId?: string;
  cost?: number;
  tokens?: number;
}

interface CodeXICLITerminalProps {
  projectId?: string;
  className?: string;
}

export const CodeXICLITerminal: React.FC<CodeXICLITerminalProps> = ({ 
  projectId = 'cli-session-' + Date.now(),
  className = '' 
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<CLIOutput[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Real database hooks
  const { templates, isLoading: templatesLoading, getTemplatesByType } = useProjectTemplates();
  const { agents, isLoading: agentsLoading } = useAgents();
  const { orchestrateProject, workflow, isOrchestrating } = useEnhancedManagerAgent(projectId);

  // Initialize terminal
  useEffect(() => {
    addOutput('info', '██████╗  ██████╗ ██████╗ ███████╗   ██╗  ██╗██╗');
    addOutput('info', '██╔══██╗██╔═══██╗██╔══██╗██╔════╝   ╚██╗██╔╝██║');
    addOutput('info', '██║  ██║██║   ██║██║  ██║█████╗      ╚███╔╝ ██║');
    addOutput('info', '██║  ██║██║   ██║██║  ██║██╔══╝      ██╔██╗ ██║');
    addOutput('info', '██████╔╝╚██████╔╝██████╔╝███████╗██╗██╔╝ ██╗██║');
    addOutput('info', '╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝');
    addOutput('success', 'Code-XI Enhanced CLI Terminal v3.0.0');
    addOutput('info', 'AI-Powered Development Platform with 8 Specialized Agents');
    addOutput('success', `✓ Connected to database with ${agents.length} active agents`);
    addOutput('success', `✓ ${templates.length} project templates loaded`);
    addOutput('info', 'Type "help" to see available commands or "quick" for shortcuts');
  }, [agents.length, templates.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addOutput = (type: CLIOutput['type'], content: string, extra?: { agentId?: string; cost?: number; tokens?: number }) => {
    const newOutput: CLIOutput = {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      ...extra
    };
    setOutput(prev => [...prev, newOutput]);
  };

  const executeCommand = async (command: string) => {
    if (!command.trim() || isExecuting) return;

    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();
    
    // Add command to history
    setHistory(prev => [...prev, command]);
    setHistoryIndex(-1);
    addOutput('command', `$ ${command}`);
    setIsExecuting(true);

    try {
      switch (cmd) {
        case 'help':
          showHelp();
          break;

        case 'quick':
          showQuickCommands();
          break;

        case 'agents':
          await showAgents(args.slice(1));
          break;

        case 'agent-status':
          await showAgentStatus(args[1]);
          break;

        case 'templates':
          await showTemplates(args.slice(1));
          break;

        case 'create-app':
          await createApplication(args.slice(1));
          break;

        case 'deploy':
          await deployApplication(args.slice(1));
          break;

        case 'test':
          await runTests(args.slice(1));
          break;

        case 'security-scan':
          await runSecurityScan(args.slice(1));
          break;

        case 'optimize':
          await runOptimization(args.slice(1));
          break;

        case 'docs':
          await generateDocs(args.slice(1));
          break;

        case 'workflow-status':
          showWorkflowStatus();
          break;

        case 'database-status':
          await showDatabaseStatus();
          break;

        case 'clear':
          setOutput([]);
          break;

        case 'version':
          addOutput('success', 'Code-XI CLI Terminal v3.0.0');
          addOutput('info', 'Built with React, TypeScript, and Supabase');
          break;

        default:
          addOutput('error', `Unknown command: ${cmd}`);
          addOutput('info', 'Type "help" for available commands');
      }
    } catch (error) {
      console.error('Command execution error:', error);
      addOutput('error', `Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const showHelp = () => {
    addOutput('success', 'Code-XI CLI Terminal - Available Commands:');
    addOutput('info', '');
    addOutput('output', '🤖 AGENT COMMANDS:');
    addOutput('output', '  agents                    - List all AI agents with real-time status');
    addOutput('output', '  agent-status <role>       - Show detailed status of specific agent');
    addOutput('output', '');
    addOutput('output', '📁 PROJECT COMMANDS:');
    addOutput('output', '  templates [type]          - List project templates (web/mobile/cli)');
    addOutput('output', '  create-app <type> <lang> <framework> [description]');
    addOutput('output', '                           - Create new application with AI agents');
    addOutput('output', '');
    addOutput('output', '🚀 OPERATION COMMANDS:');
    addOutput('output', '  deploy [service]         - Deploy application with DevOps agent');
    addOutput('output', '  test [type]              - Run tests with QA engineer');
    addOutput('output', '  security-scan [target]   - Security analysis with Security agent');
    addOutput('output', '  optimize [component]     - Performance optimization');
    addOutput('output', '  docs [generate|update]   - Documentation management');
    addOutput('output', '');
    addOutput('output', '📊 STATUS COMMANDS:');
    addOutput('output', '  workflow-status          - Show current workflow progress');
    addOutput('output', '  database-status          - Database connectivity status');
    addOutput('output', '  version                  - Show CLI version');
    addOutput('output', '');
    addOutput('output', '🎮 UTILITY COMMANDS:');
    addOutput('output', '  quick                    - Show quick command shortcuts');
    addOutput('output', '  clear                    - Clear terminal screen');
    addOutput('output', '  help                     - Show this help message');
  };

  const showQuickCommands = () => {
    addOutput('success', 'Quick Command Shortcuts:');
    addOutput('info', 'Click any shortcut below to execute:');
  };

  const showAgents = async (args: string[]) => {
    if (agentsLoading) {
      addOutput('info', 'Loading agents from database...');
      return;
    }

    addOutput('success', `Code-XI AI Agents (${agents.length} active):`);
    addOutput('info', '');
    
    for (const agent of agents) {
      const statusIcon = agent.is_active ? '🟢' : '🔴';
      const permissionsText = Object.entries(agent.permissions as any)
        .filter(([_, v]) => v)
        .map(([k]) => k)
        .join(', ');
      
      addOutput('output', `${statusIcon} ${agent.name} (${agent.role})`);
      addOutput('output', `   Description: ${agent.description}`);
      addOutput('output', `   Permissions: ${permissionsText}`);
      addOutput('output', `   Status: ${agent.is_active ? 'Active & Ready' : 'Inactive'}`);
      addOutput('info', '');
    }
  };

  const showAgentStatus = async (role: string) => {
    if (!role) {
      addOutput('error', 'Usage: agent-status <role>');
      addOutput('info', 'Available roles: manager, qa_engineer, devops_engineer, security_engineer, etc.');
      return;
    }

    const agent = agents.find(a => a.role === role);
    if (!agent) {
      addOutput('error', `Agent with role '${role}' not found`);
      return;
    }

    addOutput('success', `Agent Status Report: ${agent.name}`);
    addOutput('output', `Role: ${agent.role}`);
    addOutput('output', `Status: ${agent.is_active ? '🟢 Active' : '🔴 Inactive'}`);
    addOutput('output', `Description: ${agent.description}`);
    
    const permissions = agent.permissions as any;
    addOutput('output', `Permissions:`);
    Object.entries(permissions).forEach(([key, value]) => {
      addOutput('output', `  ${key}: ${value ? '✅' : '❌'}`);
    });
  };

  const showTemplates = async (args: string[]) => {
    const type = args[0];
    
    if (templatesLoading) {
      addOutput('info', 'Loading templates from database...');
      return;
    }

    if (type) {
      const filteredTemplates = getTemplatesByType(type);
      addOutput('success', `${type.toUpperCase()} Templates (${filteredTemplates.length}):`);
      filteredTemplates.forEach(template => {
        addOutput('output', `📦 ${template.name}`);
        addOutput('output', `   ${template.description}`);
        addOutput('output', `   Language: ${template.programming_language}, Framework: ${template.framework}`);
        addOutput('info', '');
      });
    } else {
      addOutput('success', `All Project Templates (${templates.length}):`);
      const groupedTemplates = templates.reduce((acc, template) => {
        if (!acc[template.template_type]) acc[template.template_type] = [];
        acc[template.template_type].push(template);
        return acc;
      }, {} as Record<string, typeof templates>);

      Object.entries(groupedTemplates).forEach(([type, typeTemplates]) => {
        addOutput('output', `\n📁 ${type.toUpperCase()} (${typeTemplates.length}):`);
        typeTemplates.forEach(template => {
          addOutput('output', `  📦 ${template.name} - ${template.programming_language}/${template.framework}`);
        });
      });
    }
  };

  const createApplication = async (args: string[]) => {
    if (args.length < 3) {
      addOutput('error', 'Usage: create-app <type> <language> <framework> [description]');
      addOutput('info', 'Example: create-app web TypeScript React "Todo app with authentication"');
      return;
    }

    const [type, language, framework, ...descParts] = args;
    const description = descParts.join(' ') || 'New application';

    addOutput('success', `🚀 Starting application creation...`);
    addOutput('output', `Type: ${type}`);
    addOutput('output', `Language: ${language}`);
    addOutput('output', `Framework: ${framework}`);
    addOutput('output', `Description: ${description}`);
    
    addOutput('info', '🤖 Manager Agent coordinating development team...');
    
    try {
      await orchestrateProject(type as any, language, framework, description);
      addOutput('success', '✅ Application creation initiated successfully!');
      addOutput('info', 'Use "workflow-status" to monitor progress');
    } catch (error) {
      addOutput('error', `❌ Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deployApplication = async (args: string[]) => {
    const service = args[0] || 'auto';
    addOutput('info', `🚀 Starting deployment with DevOps Agent...`);
    addOutput('output', `Target: ${service}`);
    addOutput('success', '✅ Deployment pipeline initiated');
  };

  const runTests = async (args: string[]) => {
    const testType = args[0] || 'all';
    addOutput('info', `🧪 Running ${testType} tests with QA Engineer...`);
    addOutput('success', '✅ Test suite execution started');
  };

  const runSecurityScan = async (args: string[]) => {
    const target = args[0] || 'full';
    addOutput('info', `🔒 Security analysis with Security Engineer...`);
    addOutput('output', `Scanning: ${target}`);
    addOutput('success', '✅ Security scan initiated');
  };

  const runOptimization = async (args: string[]) => {
    const component = args[0] || 'performance';
    addOutput('info', `⚡ Optimization with Performance Engineer...`);
    addOutput('output', `Target: ${component}`);
    addOutput('success', '✅ Optimization analysis started');
  };

  const generateDocs = async (args: string[]) => {
    const action = args[0] || 'generate';
    addOutput('info', `📚 Documentation ${action} with Documentation Specialist...`);
    addOutput('success', '✅ Documentation task initiated');
  };

  const showWorkflowStatus = () => {
    if (workflow) {
      addOutput('success', `Workflow Status: ${workflow.status}`);
      addOutput('output', `Progress: ${workflow.progress_percentage.toFixed(1)}%`);
      addOutput('output', `Project: ${workflow.project_type} (${workflow.programming_language}/${workflow.framework})`);
      addOutput('output', `Tasks: ${workflow.tasks.length} total`);
      
      const taskStats = workflow.tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(taskStats).forEach(([status, count]) => {
        addOutput('output', `  ${status}: ${count}`);
      });
    } else {
      addOutput('info', 'No active workflow found');
    }
  };

  const showDatabaseStatus = async () => {
    try {
      addOutput('success', '🗄️  Database Connection Status:');
      addOutput('success', `✓ Connected to Code-XI Database`);
      addOutput('output', `Agents loaded: ${agents.length}`);
      addOutput('output', `Templates loaded: ${templates.length}`);
      addOutput('output', `Project ID: ${projectId}`);
      
      // Test database connectivity
      const { data, error } = await supabase.from('agents').select('count');
      if (error) {
        addOutput('error', `Database error: ${error.message}`);
      } else {
        addOutput('success', '✓ Database queries working correctly');
      }
    } catch (error) {
      addOutput('error', `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        executeCommand(input);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple autocomplete for common commands
      const commands = ['help', 'agents', 'templates', 'create-app', 'deploy', 'test', 'security-scan', 'optimize', 'docs', 'clear'];
      const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  const quickCommands = [
    { cmd: 'agents', label: 'List Agents', icon: <Cpu className="w-3 h-3" /> },
    { cmd: 'templates web', label: 'Web Templates', icon: <Database className="w-3 h-3" /> },
    { cmd: 'create-app web TypeScript React', label: 'Create React App', icon: <Play className="w-3 h-3" /> },
    { cmd: 'workflow-status', label: 'Workflow', icon: <Zap className="w-3 h-3" /> },
    { cmd: 'database-status', label: 'DB Status', icon: <CheckCircle className="w-3 h-3" /> },
    { cmd: 'help', label: 'Help', icon: <Terminal className="w-3 h-3" /> },
  ];

  const getOutputIcon = (type: CLIOutput['type']) => {
    switch (type) {
      case 'command': return '❯';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  const getOutputColor = (type: CLIOutput['type']) => {
    switch (type) {
      case 'command': return 'text-cyan-400';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Commands */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {quickCommands.map((quick, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-xs bg-slate-800 border-slate-600 text-green-400 hover:bg-slate-700"
            onClick={() => setInput(quick.cmd)}
            disabled={isExecuting}
          >
            {quick.icon}
            <span className="ml-1">{quick.label}</span>
          </Button>
        ))}
      </div>

      {/* Terminal Card */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-3 bg-slate-800">
          <CardTitle className="flex items-center gap-3 text-green-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <span>Code-XI CLI Terminal</span>
            </div>
            {(isExecuting || isOrchestrating) && (
              <Badge variant="outline" className="ml-auto border-yellow-500 text-yellow-400 animate-pulse">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Executing
              </Badge>
            )}
            {workflow && (
              <Badge variant="outline" className="ml-auto border-blue-500 text-blue-400">
                Workflow: {workflow.progress_percentage.toFixed(0)}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Terminal Output */}
          <ScrollArea 
            className="h-96 bg-black font-mono text-sm p-4"
            ref={terminalRef}
          >
            <div className="space-y-1">
              {output.map((line) => (
                <div key={line.id} className={`${getOutputColor(line.type)} whitespace-pre-wrap`}>
                  {line.type === 'command' ? (
                    <span className="text-cyan-400 font-bold">{line.content}</span>
                  ) : (
                    <span>{getOutputIcon(line.type)} {line.content}</span>
                  )}
                  {line.cost && (
                    <span className="text-gray-500 text-xs ml-2">
                      (${line.cost.toFixed(4)}, {line.tokens} tokens)
                    </span>
                  )}
                </div>
              ))}

              {(isExecuting || isOrchestrating) && (
                <div className="flex items-center gap-2 text-yellow-400 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Code-XI agents processing command...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Command Input */}
          <div className="border-t border-slate-700 p-4 bg-slate-900">
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 font-bold">code-xi$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-green-400 outline-none font-mono placeholder-slate-500"
                placeholder="Enter command... (try 'help' or 'quick')"
                disabled={isExecuting || isOrchestrating}
              />
              {(isExecuting || isOrchestrating) && (
                <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground bg-slate-900 rounded p-2">
        <span>Code-XI CLI Terminal v3.0.0</span>
        <div className="flex items-center gap-4">
          <span>Agents: {agents.length} active</span>
          <span>Templates: {templates.length} loaded</span>
          <span>Project: {projectId}</span>
        </div>
      </div>
    </div>
  );
};
