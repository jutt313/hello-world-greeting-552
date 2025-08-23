
import React, { useState } from "react";
import { Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { AgentsOverview } from "@/components/dashboard/AgentsOverview";
import LLMProvidersPopup from "@/components/llm/LLMProvidersPopup";
import DocumentationPopup from "@/components/popups/DocumentationPopup";
import CLISetupPopup from "@/components/popups/CLISetupPopup";
import SettingsPopup from "@/components/popups/SettingsPopup";
import TeamPopup from "@/components/popups/TeamPopup";
import NotificationsPopup from "@/components/popups/NotificationsPopup";
import { CLISection } from "@/components/dashboard/CLISection";
import { TraditionalTerminal } from "@/components/terminal/TraditionalTerminal";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [llmProvidersOpen, setLlmProvidersOpen] = useState(false);
  const [documentationOpen, setDocumentationOpen] = useState(false);
  const [cliSetupOpen, setCLISetupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [agentOverviewOpen, setAgentOverviewOpen] = useState(false);
  const [cliTerminalOpen, setCLITerminalOpen] = useState(false);
  const [traditionalTerminalOpen, setTraditionalTerminalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const menuItems = [
    { label: 'Agent Overview', action: () => setAgentOverviewOpen(true) },
    { label: 'CLI Terminal', action: () => setCLITerminalOpen(true) },
    { label: 'Web Terminal', action: () => setTraditionalTerminalOpen(true) },
    { label: 'LLM Providers', action: () => setLlmProvidersOpen(true) },
    { label: 'Documentation', action: () => setDocumentationOpen(true) },
    { label: 'CLI Setup', action: () => setCLISetupOpen(true) },
    { label: 'Settings', action: () => setSettingsOpen(true) },
    { label: 'Team', action: () => setTeamOpen(true) },
    { label: 'Sign Out', action: handleSignOut },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative z-10">
          {/* Header - No border, no navigation tabs */}
          <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Code-XI
              </h1>
              <p className="text-slate-400 text-sm">
                8-Agent AI Development Team - Build, Test, Deploy Complete Applications
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                onClick={() => setNotificationsOpen(true)}
              >
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="p-6 space-y-8">
            <MetricCards />
            <ChartsSection />
            <ProjectsTable />
          </main>
        </div>

        {/* All Popups */}
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
        <NotificationsPopup 
          isOpen={notificationsOpen} 
          onClose={() => setNotificationsOpen(false)} 
        />

        {/* Agent Overview Popup */}
        {agentOverviewOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">Agent Overview</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setAgentOverviewOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              <div className="p-6">
                <AgentsOverview />
              </div>
            </div>
          </div>
        )}

        {/* CLI Terminal Popup */}
        {cliTerminalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">CLI Terminal</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCLITerminalOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              <div className="p-6">
                <CLISection />
              </div>
            </div>
          </div>
        )}

        {/* Traditional Web Terminal Popup */}
        {traditionalTerminalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black border border-green-500 rounded-lg shadow-lg max-w-6xl w-full max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-2 border-b border-green-500 bg-black">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-green-400 text-sm ml-2">Code-XI Terminal</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setTraditionalTerminalOpen(false)}
                  className="text-green-400 hover:text-green-300 h-6 w-6 p-0"
                >
                  ✕
                </Button>
              </div>
              <div className="h-[70vh]">
                <TraditionalTerminal />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Dropdown - Positioned outside main container with highest z-index */}
      <div className="fixed top-6 right-6 z-[99999]">
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronDown className="w-4 h-4 text-white" />
        </button>

        {profileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-[99999] backdrop-blur-sm">
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
    </>
  );
};

export default Dashboard;
