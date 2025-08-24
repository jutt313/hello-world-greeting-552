
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ManagerAgentChat from '@/components/agents/ManagerAgentChat';
import { Bot } from 'lucide-react';

interface ManagerAgentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export const ManagerAgentPopup: React.FC<ManagerAgentPopupProps> = ({ 
  isOpen, 
  onClose,
  projectId = 'default-project'
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Bot className="w-6 h-6 text-cyan-400" />
            Chat with Platform Agent
          </DialogTitle>
        </DialogHeader>
        
        <div className="h-[70vh]">
          <ManagerAgentChat 
            projectId={projectId} 
            projectName="Platform Communication"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
