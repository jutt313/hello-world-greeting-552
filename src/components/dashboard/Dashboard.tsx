
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectsTable } from '@/components/dashboard/ProjectsTable';
import { StatCards } from '@/components/dashboard/StatCards';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import LLMProvidersPopup from '@/components/popups/LLMProvidersPopup';
import { Settings, Users, Zap } from 'lucide-react';

const Dashboard = () => {
  const [isLLMProvidersOpen, setIsLLMProvidersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-blue-500/20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your AI-powered development projects
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsLLMProvidersOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              LLM Providers
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatCards />

        {/* Analytics Charts */}
        <AnalyticsCharts />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Agent Team
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  8 Agents Active
                </Badge>
              </div>
              <div className="text-muted-foreground">
                All AI agents ready for project coordination
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/50 to-emerald-900/20 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Platform Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  All Systems Operational
                </Badge>
              </div>
              <div className="text-muted-foreground">
                Database, agents, and APIs running smoothly
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/50 to-violet-900/20 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-violet-400">Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <div className="text-muted-foreground">
                Use "Chat with Platform Agent" from your profile menu to communicate with the AI team
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <ProjectsTable />

        {/* Popups */}
        <LLMProvidersPopup
          isOpen={isLLMProvidersOpen}
          onClose={() => setIsLLMProvidersOpen(false)}
        />
      </div>
    </div>
  );
};

export default Dashboard;
