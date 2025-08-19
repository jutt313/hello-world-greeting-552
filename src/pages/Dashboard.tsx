
import React, { useState } from "react";
import { Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import LLMProvidersPopup from "@/components/llm/LLMProvidersPopup";
import DocumentationPopup from "@/components/popups/DocumentationPopup";
import CLISetupPopup from "@/components/popups/CLISetupPopup";
import SettingsPopup from "@/components/popups/SettingsPopup";
import TeamPopup from "@/components/popups/TeamPopup";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [llmProvidersOpen, setLlmProvidersOpen] = useState(false);
  const [documentationOpen, setDocumentationOpen] = useState(false);
  const [cliSetupOpen, setCLISetupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const menuItems = [
    { label: 'LLM Providers', action: () => setLlmProvidersOpen(true) },
    { label: 'Documentation', action: () => setDocumentationOpen(true) },
    { label: 'CLI Setup', action: () => setCLISetupOpen(true) },
    { label: 'Settings', action: () => setSettingsOpen(true) },
    { label: 'Team', action: () => setTeamOpen(true) },
    { label: 'Sign Out', action: handleSignOut },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        {/* Minimal Header */}
        <header className="flex items-center justify-between p-6 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CodeXI
            </h1>
            <p className="text-slate-400 text-sm">
              Build, deploy, and scale AI-powered applications effortlessly
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-white" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  {menuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-6 space-y-8">
          <MetricCards />
          <ChartsSection />
          <ProjectsTable />
        </main>
      </div>

      {/* Popups */}
      <LLMProvidersPopup 
        isOpen={llmProvidersOpen} 
        onClose={() => setLlmProvidersOpen(false)} 
      />
      <DocumentationPopup 
        isOpen={documentationOpen} 
        onClose={() => setDocumentationOpen(false)} 
      />
      <CLISetupPopup 
        isOpen={cliSetupOpen} 
        onClose={() => setCLISetupOpen(false)} 
      />
      <SettingsPopup 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      <TeamPopup 
        isOpen={teamOpen} 
        onClose={() => setTeamOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
