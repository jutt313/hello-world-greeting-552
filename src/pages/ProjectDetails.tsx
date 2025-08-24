
import React from 'react';
import { useParams } from 'react-router-dom';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <AppSidebar />
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Project ID: {id}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ProjectDetails;
