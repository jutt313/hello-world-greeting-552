
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Analytics = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your development metrics and AI usage
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Analytics and metrics will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
