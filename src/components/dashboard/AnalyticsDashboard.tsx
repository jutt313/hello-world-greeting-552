
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

const mockData = [
  { name: 'Jan', apiCalls: 120, tokenUsage: 45000, cost: 12.50 },
  { name: 'Feb', apiCalls: 180, tokenUsage: 62000, cost: 18.75 },
  { name: 'Mar', apiCalls: 250, tokenUsage: 78000, cost: 25.20 },
  { name: 'Apr', apiCalls: 320, tokenUsage: 95000, cost: 32.10 },
  { name: 'May', apiCalls: 280, tokenUsage: 88000, cost: 28.90 },
  { name: 'Jun', apiCalls: 350, tokenUsage: 102000, cost: 36.40 },
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* API Calls Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Area 
                  type="monotone" 
                  dataKey="apiCalls" 
                  stroke="#06b6d4" 
                  fill="rgba(6, 182, 212, 0.2)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token Usage Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Line 
                  type="monotone" 
                  dataKey="tokenUsage" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Analysis Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Monthly Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="cost" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
