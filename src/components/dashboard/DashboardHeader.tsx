
import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "./ProfileDropdown";

interface DashboardHeaderProps {
  onLlmProvidersClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onLlmProvidersClick }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:bg-white/10" />
        <div className="hidden md:block">
          <h2 className="font-semibold text-white">CodeXI Platform</h2>
          <p className="text-sm text-slate-400">AI-Powered Development Environment</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
          <Bell className="w-4 h-4" />
        </Button>
        <ProfileDropdown onLlmProvidersClick={onLlmProvidersClick || (() => {})} />
      </div>
    </header>
  );
};

export default DashboardHeader;
