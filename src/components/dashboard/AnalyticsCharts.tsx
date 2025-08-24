
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const sampleData = [
  { name: 'Mon', apiCalls: 0, tokens: 0, cost: 0 },
  { name: 'Tue', apiCalls: 0, tokens: 0, cost: 0 },
  { name: 'Wed', apiCalls: 0, tokens: 0, cost: 0 },
  { name: 'Thu', apiCalls: 0, tokens: 0, cost: 0 },
  { name: 'Fri', apiCalls: 0, tokens: 0, cost: 0 },
  { name: 'Sat', apiCalls: 0, tokens: 0, cost: 0 },
  { name: 'Sun', apiCalls: 0, tokens: 0, cost: 0 },
];

export const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-slate-900/50 to-cyan-900/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm text-cyan-400">API Calls (7 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="apiCalls" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm text-blue-400">Token Usage (7 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-violet-900/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm text-violet-400">Daily Costs (7 days)</CardTitle>
        </CardHeader>
        <CardContent className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
