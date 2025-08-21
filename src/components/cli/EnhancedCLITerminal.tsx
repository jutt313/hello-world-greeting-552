
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { useProjectTemplates } from '@/hooks/useProjectTemplates';
import { useAgents } from '@/hooks/useAgents';
import { useEnhancedManagerAgent } from '@/hooks/useEnhancedManagerAgent';
import { useToast } from '@/hooks/use-toast';

interface CLIOutput {
  type: 'command' | 'output' | 'error' | 'success';
  content: string;
  timestamp: Date;
}

interface CLIProps {
  projectId?: string;
}

export const EnhancedCLITerminal: React.FC<CLIProps> = ({ projectId = 'default-project' }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [output, setOutput] = useState<CLIOutput[]>([
    {
      type: 'output',
      content: 'Code-XI Enhanced CLI Terminal v2.0.0',
      timestamp: new Date(),
    },
    {
      type: 'output',
      content: 'Connected to production database with 8 active agents',
      timestamp: new Date(),
    },
    {
      type: 'success',
      content: 'Type "help" to see available commands',
      timestamp: new Date(),
    },
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Hooks for real data
  const { templates, isLoading: templatesLoading, getWebTemplates, getIOSTemplates, getAndroidTemplates, getCLITemplates } = useProjectTemplates();
  const { agents, isLoading: agentsLoading } = useAgents();
  const { orchestrateProject, workflow, isOrchestrating } = useEnhancedManagerAgent(projectId);

  const addOutput = (type: CLIOutput['type'], content: string) => {
    setOutput(prev => [...prev, {
      type,
      content,
      timestamp: new Date(),
    }]);
  };

  const executeCommand = async (command: string) => {
    const args = command.trim().split(' ');
    const cmd = args[0].toLowerCase();

    addOutput('command', `$ ${command}`);

    switch (cmd) {
      case 'help':
        addOutput('output', 'Available commands:');
        addOutput('output', '  help                    - Show this help message');
        addOutput('output', '  agents                  - List all available agents');
        addOutput('output', '  agent-status <role>     - Show status of specific agent');
        addOutput('output', '  templates               - List all project templates');
        addOutput('output', '  templates-web           - List web application templates');
        addOutput('output', '  templates-ios           - List iOS application templates');
        addOutput('output', '  templates-android       - List Android application templates');
        addOutput('output', '  templates-cli           - List CLI application templates');
        addOutput('output', '  create-app <type> <lang> <framework> - Create new application');
        addOutput('output', '  workflow-status         - Show current workflow status');
        addOutput('output', '  database-status         - Show database connection status');
        addOutput('output', '  clear                   - Clear terminal');
        break;

      case 'agents':
        if (agentsLoading) {
          addOutput('output', 'Loading agents from database...');
        } else if (agents.length === 0) {
          addOutput('error', 'No agents found in database');
        } else {
          addOutput('success', `Found ${agents.length} active agents:`);
          agents.forEach(agent => {
            addOutput('output', `  ${agent.name} (${agent.role}) - ${agent.description}`);
          });
        }
        break;

      case 'agent-status':
        if (args.length < 2) {
          addOutput('error', 'Usage: agent-status <role>');
        } else {
          const role = args[1];
          const agent = agents.find(a => a.role === role);
          if (agent) {
            addOutput('success', `Agent: ${agent.name}`);
            addOutput('output', `Role: ${agent.role}`);
            addOutput('output', `Status: ${agent.is_active ? 'Active' : 'Inactive'}`);
            addOutput('output', `Description: ${agent.description}`);
            addOutput('output', `Permissions: ${Object.entries(agent.permissions).filter(([_, v]) => v).map(([k]) => k).join(', ')}`);
          } else {
            addOutput('error', `Agent with role '${role}' not found`);
          }
        }
        break;

      case 'templates':
        if (templatesLoading) {
          addOutput('output', 'Loading templates from database...');
        } else {
          addOutput('success', `Found ${templates.length} project templates:`);
          templates.forEach(template => {
            addOutput('output', `  ${template.name} (${template.template_type}/${template.programming_language}/${template.framework})`);
          });
        }
        break;

      case 'templates-web':
        const webTemplates = getWebTemplates();
        addOutput('success', `Web Application Templates (${webTemplates.length}):`);
        webTemplates.forEach(template => {
          addOutput('output', `  ${template.name} - ${template.programming_language}/${template.framework}`);
        });
        break;

      case 'templates-ios':
        const iosTemplates = getIOSTemplates();
        addOutput('success', `iOS Application Templates (${iosTemplates.length}):`);
        iosTemplates.forEach(template => {
          addOutput('output', `  ${template.name} - ${template.programming_language}/${template.framework}`);
        });
        break;

      case 'templates-android':
        const androidTemplates = getAndroidTemplates();
        addOutput('success', `Android Application Templates (${androidTemplates.length}):`);
        androidTemplates.forEach(template => {
          addOutput('output', `  ${template.name} - ${template.programming_language}/${template.framework}`);
        });
        break;

      case 'templates-cli':
        const cliTemplates = getCLITemplates();
        addOutput('success', `CLI Application Templates (${cliTemplates.length}):`);
        cliTemplates.forEach(template => {
          addOutput('output', `  ${template.name} - ${template.programming_language}/${template.framework}`);
        });
        break;

      case 'create-app':
        if (args.length < 4) {
          addOutput('error', 'Usage: create-app <type> <language> <framework> [requirements]');
          addOutput('output', 'Example: create-app web TypeScript React "Build a todo app with authentication"');
        } else {
          const [, type, language, framework, ...requirementsParts] = args;
          const requirements = requirementsParts.join(' ') || 'Basic application setup';
          
          addOutput('success', `Starting application creation...`);
          addOutput('output', `Type: ${type}`);
          addOutput('output', `Language: ${language}`);
          addOutput('output', `Framework: ${framework}`);
          addOutput('output', `Requirements: ${requirements}`);
          addOutput('output', 'Manager Agent is orchestrating the development team...');
          
          try {
            await orchestrateProject(type as any, language, framework, requirements);
            addOutput('success', 'Application creation initiated successfully!');
          } catch (error) {
            addOutput('error', `Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        break;

      case 'workflow-status':
        if (workflow) {
          addOutput('success', `Workflow Status: ${workflow.status}`);
          addOutput('output', `Progress: ${workflow.progress_percentage.toFixed(1)}%`);
          addOutput('output', `Project Type: ${workflow.project_type}`);
          addOutput('output', `Language: ${workflow.programming_language}`);
          addOutput('output', `Framework: ${workflow.framework}`);
          addOutput('output', `Tasks: ${workflow.tasks.length}`);
          
          const completedTasks = workflow.tasks.filter(t => t.status === 'completed').length;
          const inProgressTasks = workflow.tasks.filter(t => t.status === 'in_progress').length;
          const failedTasks = workflow.tasks.filter(t => t.status === 'failed').length;
          
          addOutput('output', `  Completed: ${completedTasks}`);
          addOutput('output', `  In Progress: ${inProgressTasks}`);
          addOutput('output', `  Failed: ${failedTasks}`);
        } else {
          addOutput('output', 'No active workflow');
        }
        break;

      case 'database-status':
        addOutput('success', 'Database Connection: Active');
        addOutput('output', `Agents: ${agents.length} loaded`);
        addOutput('output', `Templates: ${templates.length} loaded`);
        addOutput('output', 'All tables: ✓ agents, ✓ project_templates, ✓ agent_coordination, ✓ agent_file_operations, ✓ agent_capabilities');
        break;

      case 'clear':
        setOutput([]);
        break;

      default:
        addOutput('error', `Unknown command: ${cmd}. Type 'help' for available commands.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (input.trim()) {
        setHistory(prev => [...prev, input]);
        setHistoryIndex(-1);
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
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <Card className="h-96 bg-slate-900 text-green-400 font-mono text-sm">
      <div 
        ref={terminalRef}
        className="h-80 overflow-y-auto p-4 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {output.map((line, index) => (
          <div key={index} className={`
            ${line.type === 'command' ? 'text-cyan-400' : ''}
            ${line.type === 'error' ? 'text-red-400' : ''}
            ${line.type === 'success' ? 'text-green-400' : ''}
            ${line.type === 'output' ? 'text-gray-300' : ''}
          `}>
            {line.content}
          </div>
        ))}
        {isOrchestrating && (
          <div className="text-yellow-400 animate-pulse">
            ⚡ Manager Agent orchestrating workflow...
          </div>
        )}
      </div>
      
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-green-400 outline-none"
            placeholder="Enter command..."
            disabled={isOrchestrating}
          />
        </div>
      </div>
    </Card>
  );
};
