
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, DollarSign, Activity } from 'lucide-react';

export const StatCards = () => {
  const stats = [
    {
      title: 'Total Projects',
      value: '12',
      icon: Users,
      change: '+2 this week',
    },
    {
      title: 'Active Chats',
      value: '8',
      icon: MessageSquare,
      change: '+4 active now',
    },
    {
      title: 'Total Spending',
      value: '$45.32',
      icon: DollarSign,
      change: '$12.50 this week',
    },
    {
      title: 'API Calls',
      value: '2,847',
      icon: Activity,
      change: '+267 today',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-200">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-slate-400 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
