
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, FolderOpen, MessageSquare, DollarSign } from 'lucide-react';

export const StatCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-cyan-400 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">0</div>
          <Badge variant="outline" className="text-green-400 border-green-400 mt-2">
            All Active
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-emerald-900/20 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-emerald-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">0</div>
          <Badge variant="outline" className="text-blue-400 border-blue-400 mt-2">
            Ready
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-violet-900/20 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-violet-400 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">21</div>
          <Badge variant="outline" className="text-green-400 border-green-400 mt-2">
            Online
          </Badge>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-orange-900/20 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-orange-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Total Spent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <Badge variant="outline" className="text-cyan-400 border-cyan-400 mt-2">
            This Month
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
