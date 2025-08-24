
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const AnalyticsCharts = () => {
  const apiCallsData = [
    { name: 'Mon', calls: 240 },
    { name: 'Tue', calls: 380 },
    { name: 'Wed', calls: 320 },
    { name: 'Thu', calls: 450 },
    { name: 'Fri', calls: 380 },
    { name: 'Sat', calls: 280 },
    { name: 'Sun', calls: 320 },
  ];

  const tokenUsageData = [
    { name: 'Mon', tokens: 12000 },
    { name: 'Tue', tokens: 18000 },
    { name: 'Wed', tokens: 15000 },
    { name: 'Thu', tokens: 22000 },
    { name: 'Fri', tokens: 19000 },
    { name: 'Sat', tokens: 14000 },
    { name: 'Sun', tokens: 16000 },
  ];

  const costData = [
    { name: 'Mon', cost: 2.4 },
    { name: 'Tue', cost: 3.8 },
    { name: 'Wed', cost: 3.2 },
    { name: 'Thu', cost: 4.5 },
    { name: 'Fri', cost: 3.8 },
    { name: 'Sat', cost: 2.8 },
    { name: 'Sun', cost: 3.2 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={apiCallsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Line type="monotone" dataKey="calls" stroke="#06b6d4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={tokenUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="tokens" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-violet-400">Daily Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
