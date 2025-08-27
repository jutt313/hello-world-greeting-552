
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  MessageSquare, 
  DollarSign, 
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { ProjectsList } from './ProjectsList';
import { AnalyticsCharts } from './AnalyticsCharts';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();

  const stats = {
    totalProjects: projects?.length || 0,
    chatSessions: 24,
    totalSpending: 89.42,
    apiCalls: 1250
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Code-XI Dashboard
            </h1>
            <p className="text-xl text-slate-300 mt-2">
              Welcome back, {user?.email?.split('@')[0] || 'Developer'}
            </p>
          </div>
          <Badge variant="outline" className="border-cyan-500 text-cyan-400">
            Professional AI Team
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Projects</CardTitle>
              <Bot className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
              <p className="text-xs text-slate-400">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                Active development
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/50 to-emerald-900/20 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Chat Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.chatSessions}</div>
              <p className="text-xs text-slate-400">
                <Activity className="inline h-3 w-3 mr-1" />
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/50 to-violet-900/20 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalSpending}</div>
              <p className="text-xs text-slate-400">
                <BarChart3 className="inline h-3 w-3 mr-1" />
                Cost efficient
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/50 to-orange-900/20 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">API Calls</CardTitle>
              <Zap className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.apiCalls}</div>
              <p className="text-xs text-slate-400">
                <Users className="inline h-3 w-3 mr-1" />
                8 agents active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-3">
            <AnalyticsCharts />
          </div>
        </div>

        <Separator className="bg-slate-700" />

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Your Projects
            </h2>
            <Button 
              variant="outline" 
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              Create New Project
            </Button>
          </div>
          <ProjectsList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
