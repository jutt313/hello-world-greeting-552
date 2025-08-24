
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Agents = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          AI Agents
        </h1>
        <p className="text-muted-foreground">
          Monitor and interact with your AI development team
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Agent Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Use "Chat with Platform Agent" from your profile menu to communicate with the AI team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agents;
