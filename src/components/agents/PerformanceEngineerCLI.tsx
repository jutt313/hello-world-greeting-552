
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Terminal, 
  Send, 
  Loader2, 
  Target,
  TrendingUp,
  Monitor,
  Database,
  Cpu,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceEngineer } from '@/hooks/usePerformanceEngineer';

interface CLIHistoryEntry {
  id: string;
  type: 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface PerformanceEngineerCLIProps {
  projectId: string;
  projectName: string;
}

const PerformanceEngineerCLI: React.FC<PerformanceEngineerCLIProps> = ({
  projectId,
  projectName,
}) => {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CLIHistoryEntry[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const {
    conductLoadTesting,
    optimizePerformance,
    setupMonitoring,
    planCapacity,
    designCaching,
    analyzeBottlenecks,
    optimizeFrontend,
    optimizeDatabase,
    profileApplication,
    isLoading,
  } = usePerformanceEngineer(projectId);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const addHistoryEntry = (type: 'output' | 'error', content: string) => {
    const entry: CLIHistoryEntry = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setHistory(prev => [...prev, entry]);
  };

  const executeCommand = async () => {
    if (!command.trim() || isExecuting) return;

    const cmd = command.trim();
    setCommand('');
    setIsExecuting(true);

    // Add command to history as output type
    addHistoryEntry('output', `$ ${cmd}`);

    try {
      let result = null;
      const [action, ...args] = cmd.split(' ');
      const description = args.join(' ') || 'CLI execution request';

      switch (action.toLowerCase()) {
        case 'load-test':
          result = await conductLoadTesting(description);
          break;
        case 'optimize':
          result = await optimizePerformance('application', description);
          break;
        case 'monitor':
          result = await setupMonitoring(description);
          break;
        case 'capacity':
          result = await planCapacity(description);
          break;
        case 'cache':
          result = await designCaching(description);
          break;
        case 'bottleneck':
          result = await analyzeBottlenecks(description);
          break;
        case 'frontend':
          result = await optimizeFrontend(description);
          break;
        case 'database':
          result = await optimizeDatabase(description);
          break;
        case 'profile':
          result = await profileApplication(description);
          break;
        case 'help':
          addHistoryEntry('output', `Available commands:
load-test <description>    - Conduct load testing analysis
optimize <description>     - Optimize application performance
monitor <description>      - Setup monitoring systems
capacity <description>     - Perform capacity planning
cache <description>        - Design caching strategy
bottleneck <description>   - Analyze performance bottlenecks
frontend <description>     - Optimize frontend performance
database <description>     - Optimize database performance
profile <description>      - Profile application performance
help                      - Show this help message
clear                     - Clear terminal history`);
          break;
        case 'clear':
          setHistory([]);
          break;
        default:
          addHistoryEntry('error', `Unknown command: ${action}. Type 'help' for available commands.`);
      }

      if (result) {
        addHistoryEntry('output', `✅ Performance task completed successfully`);
        addHistoryEntry('output', `Response: ${result.response}`);
        addHistoryEntry('output', `Action taken: ${result.action_taken}`);
        addHistoryEntry('output', `Tokens used: ${result.tokens_used}, Cost: $${result.cost.toFixed(4)}`);
        
        toast({
          title: 'Performance Task Completed',
          description: `${action} executed successfully`,
        });
      }
    } catch (error) {
      console.error('CLI command error:', error);
      addHistoryEntry('error', `❌ Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      
      toast({
        title: 'Command Error',
        description: 'Failed to execute performance command',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  const quickCommands = [
    { cmd: 'load-test web application', label: 'Load Test', icon: <Target className="w-3 h-3" /> },
    { cmd: 'optimize database queries', label: 'DB Optimize', icon: <Database className="w-3 h-3" /> },
    { cmd: 'monitor system performance', label: 'Monitor', icon: <Monitor className="w-3 h-3" /> },
    { cmd: 'bottleneck api endpoints', label: 'Bottleneck', icon: <Cpu className="w-3 h-3" /> },
    { cmd: 'cache redis strategy', label: 'Cache', icon: <BarChart3 className="w-3 h-3" /> },
    { cmd: 'help', label: 'Help', icon: <Terminal className="w-3 h-3" /> },
  ];

  return (
    <Card className="h-[600px] flex flex-col bg-slate-900 text-green-400 font-mono">
      <CardHeader className="pb-3 bg-slate-800">
        <CardTitle className="flex items-center gap-3 text-green-400">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <Terminal className="w-5 h-5" />
            <span>Performance Engineer CLI</span>
          </div>
          <Badge variant="outline" className="ml-auto border-orange-500 text-orange-400">
            {projectName}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-3 p-4">
        {/* Quick Commands */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {quickCommands.map((quick, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs bg-slate-800 border-slate-600 text-green-400 hover:bg-slate-700"
              onClick={() => setCommand(quick.cmd)}
              disabled={isExecuting}
            >
              {quick.icon}
              <span className="ml-1">{quick.label}</span>
            </Button>
          ))}
        </div>

        {/* Terminal Output */}
        <ScrollArea 
          className="flex-1 bg-black rounded-lg p-3 border border-slate-700"
          ref={terminalRef}
        >
          <div className="space-y-1">
            {history.length === 0 && (
              <div className="text-slate-500">
                <p>Performance Engineer CLI v1.0.0</p>
                <p>Type 'help' for available commands.</p>
                <p>Ready for performance optimization tasks...</p>
              </div>
            )}
            
            {history.map((entry) => (
              <div
                key={entry.id}
                className={`text-sm ${
                  entry.type === 'error' 
                    ? 'text-red-400' 
                    : entry.content.startsWith('$') 
                      ? 'text-yellow-400 font-bold'
                      : 'text-green-400'
                }`}
              >
                {entry.content}
              </div>
            ))}

            {(isExecuting || isLoading) && (
              <div className="flex items-center gap-2 text-orange-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing performance analysis...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Command Input */}
        <div className="flex items-center gap-2 bg-black rounded-lg p-2 border border-slate-700">
          <span className="text-orange-400">$</span>
          <Input
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter performance command..."
            disabled={isExecuting || isLoading}
            className="flex-1 bg-transparent border-none text-green-400 placeholder-slate-500 focus:ring-0"
          />
          <Button 
            onClick={executeCommand}
            disabled={!command.trim() || isExecuting || isLoading}
            size="sm"
            variant="outline"
            className="bg-slate-800 border-slate-600 text-green-400 hover:bg-slate-700"
          >
            {isExecuting || isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-slate-500 text-center">
          Performance Engineer CLI - Load testing, optimization, monitoring, and profiling tools
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceEngineerCLI;
