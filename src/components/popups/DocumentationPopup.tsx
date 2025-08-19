
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Terminal, Code, Settings } from 'lucide-react';

interface DocumentationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentationPopup: React.FC<DocumentationPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            CodeXI Documentation
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-8">
            {/* Getting Started */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Code className="w-4 h-4" />
                Getting Started
              </h2>
              <div className="space-y-3 text-sm">
                <p>Welcome to CodeXI, the AI-powered development platform that helps you build, deploy, and scale applications effortlessly.</p>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Quick Setup Steps:</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Configure your LLM providers in the profile dropdown</li>
                    <li>Install the CodeXI CLI tool</li>
                    <li>Authenticate your CLI with the web platform</li>
                    <li>Start your first AI-powered project</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* CLI Setup */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                CLI Installation
              </h2>
              <div className="space-y-3 text-sm">
                <p>The CodeXI CLI allows you to interact with AI agents directly from your terminal.</p>
                
                <div className="bg-card border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Installation:</h3>
                  <div className="bg-muted rounded p-3 font-mono text-xs">
                    npm install -g @codexi/cli
                  </div>
                </div>

                <div className="bg-card border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Authentication:</h3>
                  <div className="bg-muted rounded p-3 font-mono text-xs">
                    codexi auth login
                  </div>
                </div>
              </div>
            </section>

            {/* AI Agents */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-4 h-4" />
                AI Agents
              </h2>
              <div className="space-y-3 text-sm">
                <p>CodeXI provides specialized AI agents for different development tasks:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Management & Coordination</h3>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Product Manager</li>
                      <li>• Business Analyst</li>
                      <li>• Manager</li>
                      <li>• Assistant</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Development</h3>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Front-end Developer</li>
                      <li>• Back-end Developer</li>
                      <li>• Full-stack Developer</li>
                      <li>• Mobile Developer</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Design</h3>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• UI Designer</li>
                      <li>• UX Designer</li>
                    </ul>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Quality & Operations</h3>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• QA Testing Engineer</li>
                      <li>• DevOps Engineer</li>
                      <li>• Security Engineer</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Project Workflow */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Project Workflow</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Typical Project Flow:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    <li><strong>Project Creation:</strong> Use CLI to link local repo/folder to CodeXI</li>
                    <li><strong>Agent Selection:</strong> Choose appropriate AI agents for your project</li>
                    <li><strong>LLM Configuration:</strong> Select and configure your preferred language models</li>
                    <li><strong>Development:</strong> Agents read/write code, analyze repositories, generate documentation</li>
                    <li><strong>Analytics:</strong> Monitor API usage, token consumption, and costs</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Best Practices</h2>
              <div className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <h3 className="font-medium text-green-500 mb-1">✓ Do</h3>
                    <ul className="text-xs space-y-1">
                      <li>• Test your API keys before saving providers</li>
                      <li>• Monitor your token usage and costs regularly</li>
                      <li>• Use specific, clear prompts with agents</li>
                      <li>• Keep your projects organized and well-documented</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <h3 className="font-medium text-red-500 mb-1">✗ Don't</h3>
                    <ul className="text-xs space-y-1">
                      <li>• Share API keys or expose them in code</li>
                      <li>• Run agents on sensitive production systems</li>
                      <li>• Ignore cost monitoring and usage limits</li>
                      <li>• Mix different project contexts in same session</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Support */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Support & Resources</h2>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Community</h3>
                    <p className="text-xs text-muted-foreground">Join our Discord server for community support and discussions.</p>
                  </div>
                  
                  <div className="bg-card border rounded-lg p-4">
                    <h3 className="font-medium mb-2">API Reference</h3>
                    <p className="text-xs text-muted-foreground">Comprehensive API documentation for advanced integrations.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentationPopup;
