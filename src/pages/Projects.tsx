
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Projects = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Projects
        </h1>
        <p className="text-muted-foreground">
          Manage and overview your development projects
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Projects will be displayed here. Connect via CLI to start managing projects.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
