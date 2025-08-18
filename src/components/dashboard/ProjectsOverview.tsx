
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderGit2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  last_accessed_at: string;
}

interface ProjectsOverviewProps {
  projects: Project[];
}

export function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'archived': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FolderGit2 className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Projects Overview</h2>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderGit2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Get started by creating your first Code-XI project. Connect a repository or start from scratch.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Card key={project.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(project.type)}
                    <div>
                      <CardTitle className="text-lg text-foreground">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{project.type} project</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    Last accessed {format(new Date(project.last_accessed_at), 'MMM d, yyyy')}
                  </div>
                  <Button variant="outline" size="sm">
                    Open Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
