
import React from 'react';
import { useParams } from 'react-router-dom';

const ProjectDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Project Details</h1>
        <p className="text-muted-foreground">Project ID: {id}</p>
      </div>
    </div>
  );
};

export default ProjectDetail;
