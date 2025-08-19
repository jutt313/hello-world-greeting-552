
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  last_accessed_at: string;
  created_at: string;
  total_api_calls: number;
}

export const ProjectsTable: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    setupRealtimeUpdates();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('last_accessed_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProjects(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase.channel('projects-table')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects' 
      }, fetchProjects)
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'hsl(120, 60%, 50%)';
      case 'paused': return 'hsl(45, 100%, 60%)';
      case 'completed': return 'hsl(195, 100%, 50%)';
      default: return 'hsl(220, 15%, 70%)';
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden"
           style={{
             background: 'hsla(230, 30%, 18%, 0.8)',
             border: '1px solid hsla(220, 40%, 30%, 0.3)',
           }}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-left" style={{ color: 'hsl(0, 0%, 95%)' }}>
            Projects
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-600 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden"
         style={{
           background: 'hsla(230, 30%, 18%, 0.8)',
           border: '1px solid hsla(220, 40%, 30, 0.3)',
         }}>
      
      <div className="p-6 border-b" style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}>
        <h3 className="text-lg font-semibold text-left" style={{ color: 'hsl(0, 0%, 95%)' }}>
          Projects
        </h3>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-lg font-medium mb-2" style={{ color: 'hsl(0, 0%, 95%)' }}>
            No recent activity found
          </p>
          <p style={{ color: 'hsl(220, 15%, 70%)' }}>
            Create your first project using the CLI to get started
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}>
              <TableHead style={{ color: 'hsl(220, 15%, 70%)' }}>Type</TableHead>
              <TableHead style={{ color: 'hsl(220, 15%, 70%)' }}>Title</TableHead>
              <TableHead style={{ color: 'hsl(220, 15%, 70%)' }}>Status</TableHead>
              <TableHead style={{ color: 'hsl(220, 15%, 70%)' }}>Created</TableHead>
              <TableHead style={{ color: 'hsl(220, 15%, 70%)' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id} 
                       style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}
                       className="hover:bg-opacity-50 transition-colors"
                       onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(195, 100%, 50%, 0.05)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs font-medium capitalize"
                        style={{ 
                          background: 'hsla(195, 100%, 50%, 0.2)',
                          color: 'hsl(195, 100%, 50%)' 
                        }}>
                    {project.type}
                  </span>
                </TableCell>

                <TableCell>
                  <div>
                    <h4 className="font-medium" style={{ color: 'hsl(0, 0%, 95%)' }}>
                      {project.name}
                    </h4>
                    {project.description && (
                      <p className="text-sm mt-1 line-clamp-1" style={{ color: 'hsl(220, 15%, 70%)' }}>
                        {project.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full"
                         style={{ backgroundColor: getStatusColor(project.status) }}></div>
                    <span className="text-sm capitalize"
                          style={{ color: getStatusColor(project.status) }}>
                      {project.status}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm" style={{ color: 'hsl(220, 15%, 70%)' }}>
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </span>
                </TableCell>

                <TableCell>
                  <button className="text-sm px-3 py-1 rounded transition-colors"
                          style={{ 
                            color: 'hsl(195, 100%, 50%)',
                            background: 'hsla(195, 100%, 50%, 0.1)',
                            border: '1px solid hsla(195, 100%, 50%, 0.3)'
                          }}>
                    View
                  </button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
