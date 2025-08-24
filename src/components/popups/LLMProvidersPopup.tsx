
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Plus } from 'lucide-react';

interface LLMProvidersPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LLMProvidersPopup: React.FC<LLMProvidersPopupProps> = ({ isOpen, onClose }) => {
  const providers = [
    { name: 'OpenAI', status: 'Connected', models: 'GPT-4, GPT-3.5' },
    { name: 'Anthropic', status: 'Not Connected', models: 'Claude-3' },
    { name: 'Google', status: 'Not Connected', models: 'Gemini Pro' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            LLM Providers
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Manage your AI model providers and API keys
            </p>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          </div>

          <div className="space-y-3">
            {providers.map((provider, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    {provider.name}
                    <span className={`text-xs px-2 py-1 rounded ${
                      provider.status === 'Connected' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {provider.status}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Models: {provider.models}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
