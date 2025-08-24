
import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';
import { StatCards } from '@/components/dashboard/StatCards';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { LLMProvidersPopup } from '@/components/popups/LLMProvidersPopup';

const Dashboard = () => {
  const [showLLMProviders, setShowLLMProviders] = useState(false);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <AppSidebar />
        
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to Code-XI
              </h1>
              <p className="text-muted-foreground mt-2">
                Your AI-powered development platform
              </p>
            </div>
            <ProfileDropdown />
          </div>

          <div className="space-y-8">
            <StatCards />
            <AnalyticsCharts />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setShowLLMProviders(true)}
              className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              <h3 className="font-medium text-cyan-400 mb-2">LLM Providers</h3>
              <p className="text-sm text-muted-foreground">Configure AI models</p>
            </button>
          </div>
        </main>

        <LLMProvidersPopup 
          isOpen={showLLMProviders} 
          onClose={() => setShowLLMProviders(false)} 
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
