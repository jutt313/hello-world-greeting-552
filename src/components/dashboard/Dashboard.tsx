
import React, { useState } from 'react';
import { Bell, Settings, User, BookOpen, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfileDropdown } from '@/components/dashboard/ProfileDropdown';
import { StatCards } from '@/components/dashboard/StatCards';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import LLMProvidersPopup from '@/components/popups/LLMProvidersPopup';

const Dashboard = () => {
  const [llmProvidersOpen, setLlmProvidersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">XI</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Code-XI Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <Bell className="w-4 h-4" />
            </Button>
            
            <ProfileDropdown 
              onLlmProvidersClick={() => setLlmProvidersOpen(true)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <StatCards />

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* Agent Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Active Agents</h3>
              <div className="space-y-3">
                {[
                  { name: 'Manager Agent', status: 'Active', color: 'bg-green-500' },
                  { name: 'Full-Stack Engineer', status: 'Active', color: 'bg-blue-500' },
                  { name: 'DevOps Engineer', status: 'Active', color: 'bg-purple-500' },
                  { name: 'Security Engineer', status: 'Active', color: 'bg-orange-500' },
                ].map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${agent.color}`}></div>
                      <span className="text-slate-200">{agent.name}</span>
                    </div>
                    <span className="text-sm text-green-400">{agent.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Project analysis completed', time: '2 minutes ago', type: 'success' },
                  { action: 'Security scan initiated', time: '5 minutes ago', type: 'info' },
                  { action: 'Code generation finished', time: '8 minutes ago', type: 'success' },
                  { action: 'Performance optimization', time: '12 minutes ago', type: 'warning' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <span className="text-slate-200 text-sm">{activity.action}</span>
                    <span className="text-xs text-slate-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-200 hover:bg-slate-800"
                onClick={() => setLlmProvidersOpen(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                LLM Providers
              </Button>
              
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                <BookOpen className="w-4 h-4 mr-2" />
                Documentation
              </Button>
              
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                <Users className="w-4 h-4 mr-2" />
                Team
              </Button>
              
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                <User className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </Card>
      </main>

      {/* Popups */}
      <LLMProvidersPopup 
        isOpen={llmProvidersOpen}
        onClose={() => setLlmProvidersOpen(false)}
      />
    </div>
  );
};

// Export as both named and default export
export { Dashboard };
export default Dashboard;
