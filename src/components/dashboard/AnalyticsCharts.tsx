
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const apiCallsData = [
  { name: 'Mon', calls: 120 },
  { name: 'Tue', calls: 190 },
  { name: 'Wed', calls: 300 },
  { name: 'Thu', calls: 250 },
  { name: 'Fri', calls: 180 },
  { name: 'Sat', calls: 140 },
  { name: 'Sun', calls: 160 },
];

const tokenUsageData = [
  { name: 'Week 1', tokens: 45000 },
  { name: 'Week 2', tokens: 52000 },
  { name: 'Week 3', tokens: 48000 },
  { name: 'Week 4', tokens: 61000 },
];

const costData = [
  { name: 'GPT-4', value: 45, color: '#06b6d4' },
  { name: 'Claude', value: 30, color: '#3b82f6' },
  { name: 'Gemini', value: 25, color: '#8b5cf6' },
];

export const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="bg-gradient-to-br from-slate-900/50 to-cyan-900/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-cyan-400">API Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={apiCallsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="calls" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-blue-900/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tokenUsageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900/50 to-violet-900/20 border-slate-700">
        <CardHeader>
          <CardTitle className="text-violet-400">Daily Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
