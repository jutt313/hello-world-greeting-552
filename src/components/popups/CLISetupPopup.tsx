
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Terminal, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CLISetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLISetupPopup: React.FC<CLISetupPopupProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Command copied successfully',
    });
  };

  const commands = {
    install: 'npm install -g @codexi/cli',
    login: 'codexi auth login',
    init: 'codexi init',
    createProject: 'codexi create-project <repo-path>',
    selectLLM: 'codexi select-llm <provider>',
    analyze: 'codexi analyze <file-path>',
    write: 'codexi write <file-path>',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            CLI Setup Guide
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Installation */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">1. Installation</h2>
              <p className="text-sm text-muted-foreground">
                Install the CodeXI CLI globally using npm:
              </p>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Install CLI</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(commands.install)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-muted rounded p-3 font-mono text-sm">
                  {commands.install}
                </div>
              </div>
            </section>

            {/* Authentication */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">2. Authentication</h2>
              <p className="text-sm text-muted-foreground">
                Authenticate your CLI with the CodeXI platform:
              </p>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Login to CodeXI</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(commands.login)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-muted rounded p-3 font-mono text-sm">
                  {commands.login}
                </div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  This will open your browser for authentication and generate a CLI token.
                </p>
              </div>
            </section>

            {/* Project Setup */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">3. Project Setup</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Initialize in existing directory:</h3>
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Initialize Project</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(commands.init)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="bg-muted rounded p-3 font-mono text-sm">
                      {commands.init}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Or create new project:</h3>
                  <div className="bg-card border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Create Project</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(commands.createProject)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="bg-muted rounded p-3 font-mono text-sm">
                      {commands.createProject}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* LLM Configuration */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">4. LLM Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Select your preferred LLM provider for the project:
              </p>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Select LLM Provider</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(commands.selectLLM)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-muted rounded p-3 font-mono text-sm">
                  {commands.selectLLM}
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Make sure you've configured LLM providers in the web dashboard first!
                </p>
              </div>
            </section>

            {/* Common Commands */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">5. Common Commands</h2>
              <div className="space-y-4">
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Analyze Code</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(commands.analyze)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-muted rounded p-3 font-mono text-sm mb-2">
                    {commands.analyze}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analyze and understand existing code files or entire repositories.
                  </p>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Generate Code</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(commands.write)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-muted rounded p-3 font-mono text-sm mb-2">
                    {commands.write}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generate or modify code files based on your requirements.
                  </p>
                </div>
              </div>
            </section>

            {/* Tips */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Tips & Best Practices</h2>
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">✓ Pro Tips</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Use descriptive file paths when analyzing or writing code</li>
                    <li>• Start with small, focused tasks to understand agent capabilities</li>
                    <li>• Monitor token usage and costs in the web dashboard</li>
                    <li>• Keep your project structure organized for better AI understanding</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-2">📋 Remember</h3>
                  <ul className="text-sm space-y-1">
                    <li>• Each project maintains its own agent context and memory</li>
                    <li>• You can switch between different LLM providers per project</li>
                    <li>• All agent activities are logged and tracked in the dashboard</li>
                    <li>• CLI authentication tokens can be refreshed if needed</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CLISetupPopup;
