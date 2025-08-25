
import React, { useState } from 'react';
import { User, Settings, FileText, MessageCircle, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import ManagerAgentChatDialog from '@/components/agents/ManagerAgentChatDialog';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleChatWithManager = () => {
    setIsChatOpen(true);
    setIsOpen(false);
  };

  const menuItems = [
    { icon: MessageCircle, label: 'Chat with Manager', action: handleChatWithManager },
    { icon: Settings, label: 'LLM Providers', action: () => console.log('LLM Providers') },
    { icon: FileText, label: 'Documentation', action: () => console.log('Documentation') },
    { icon: Settings, label: 'Settings', action: () => console.log('Settings') },
    { icon: LogOut, label: 'Sign Out', action: handleSignOut },
  ];

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-lg bg-sidebar hover:bg-sidebar-accent transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-4 h-4 text-sidebar-foreground" />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-[9999]">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ManagerAgentChatDialog
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
      />
    </>
  );
};

export default ProfileDropdown;
