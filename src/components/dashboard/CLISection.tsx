
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeXICLITerminal } from '@/components/cli/CodeXICLITerminal';
import { Terminal, Zap } from 'lucide-react';

interface CLISectionProps {
  className?: string;
}

export const CLISection: React.FC<CLISectionProps> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-cyan-400" />
          <Zap className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Code-XI CLI Terminal
          </h2>
          <p className="text-muted-foreground">
            Interact with your AI development team through the command line interface
          </p>
        </div>
      </div>

      <CodeXICLITerminal className="w-full" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-cyan-400">Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="font-mono text-green-400">$ agents</div>
            <div className="text-muted-foreground">List all 8 AI agents</div>
            <div className="font-mono text-green-400">$ templates web</div>
            <div className="text-muted-foreground">Show web templates</div>
            <div className="font-mono text-green-400">$ create-app web TypeScript React</div>
            <div className="text-muted-foreground">Create React application</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/50 to-emerald-900/20 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-emerald-400">Agent Commands</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="font-mono text-green-400">$ deploy production</div>
            <div className="text-muted-foreground">Deploy with DevOps agent</div>
            <div className="font-mono text-green-400">$ test unit</div>
            <div className="text-muted-foreground">Run tests with QA engineer</div>
            <div className="font-mono text-green-400">$ security-scan full</div>
            <div className="text-muted-foreground">Security analysis</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900/50 to-violet-900/20 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-violet-400">Features</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Real-time agent coordination</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>Live database connectivity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Command history & autocomplete</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
