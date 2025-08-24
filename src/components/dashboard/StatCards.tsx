
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, DollarSign, Activity } from 'lucide-react';

export const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Total Projects</CardTitle>
          <Activity className="h-4 w-4 text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">12</div>
          <p className="text-xs text-slate-400">+2 from last month</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Chat Sessions</CardTitle>
          <MessageSquare className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">847</div>
          <p className="text-xs text-slate-400">+15% from last week</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Active Agents</CardTitle>
          <Users className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">21</div>
          <p className="text-xs text-slate-400">All systems operational</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-200">Total Cost</CardTitle>
          <DollarSign className="h-4 w-4 text-violet-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">$24.67</div>
          <p className="text-xs text-slate-400">This month</p>
        </CardContent>
      </Card>
    </div>
  );
};
