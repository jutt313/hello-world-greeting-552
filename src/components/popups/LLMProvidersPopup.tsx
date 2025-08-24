
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

interface LLMProvidersPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LLMProvidersPopup: React.FC<LLMProvidersPopupProps> = ({ isOpen, onClose }) => {
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configure AI Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set up your preferred Large Language Model providers for AI agent interactions.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">OpenAI</h4>
                    <p className="text-sm text-muted-foreground">GPT-4, GPT-3.5 Turbo</p>
                  </div>
                  <Badge variant="outline">Not Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Anthropic</h4>
                    <p className="text-sm text-muted-foreground">Claude 3.5 Sonnet, Claude 3 Haiku</p>
                  </div>
                  <Badge variant="outline">Not Configured</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Google AI</h4>
                    <p className="text-sm text-muted-foreground">Gemini Pro, Gemini Flash</p>
                  </div>
                  <Badge variant="outline">Not Configured</Badge>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Configure API keys and model preferences to enable AI agent functionality.
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LLMProvidersPopup;
