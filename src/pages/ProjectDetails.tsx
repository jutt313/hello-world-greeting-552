
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Project Details
        </h1>
        <p className="text-muted-foreground">
          Project ID: {id}
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Project details will be displayed here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;
