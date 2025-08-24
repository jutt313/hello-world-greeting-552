
import React, { useState } from 'react';
import { User, Settings, BookOpen, Users, LogOut, Crown, MessageSquare } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ManagerAgentChatPopup from '@/components/popups/ManagerAgentChatPopup';

interface ProfileDropdownProps {
  onLlmProvidersClick: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  onLlmProvidersClick,
}) => {
  const [managerChatOpen, setManagerChatOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white">
                U
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="text-slate-200 hover:bg-slate-700"
            onClick={() => setManagerChatOpen(true)}
          >
            <Crown className="mr-2 h-4 w-4 text-yellow-500" />
            <span>Chat with Manager</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="text-slate-200 hover:bg-slate-700"
            onClick={onLlmProvidersClick}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>LLM Providers</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Documentation</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem className="text-slate-200 hover:bg-slate-700">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManagerAgentChatPopup 
        isOpen={managerChatOpen}
        onClose={() => setManagerChatOpen(false)}
      />
    </>
  );
};

export default ProfileDropdown;
