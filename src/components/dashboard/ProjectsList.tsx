
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { FolderOpen, Clock, Code, Activity } from 'lucide-react';

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

export const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    setupRealtimeUpdates();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
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
    const channel = supabase.channel('projects-list')
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

  const getLanguageIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'web': 'W',
      'mobile': 'M',
      'api': 'A',
      'desktop': 'D',
      'ai': 'AI',
      'data': 'DB',
    };
    return iconMap[type?.toLowerCase()] || 'P';
  };

  if (loading) {
    return (
      <div className="rounded-xl overflow-hidden"
           style={{
             background: 'hsla(230, 30%, 15%, 0.7)',
             backdropFilter: 'blur(20px)',
             border: '1px solid hsla(220, 40%, 30%, 0.3)',
           }}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(0, 0%, 95%)' }}>
            Recent Projects
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-lg animate-pulse"
                   style={{ background: 'hsla(220, 40%, 30%, 0.2)' }}>
                <div className="w-10 h-10 bg-gray-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-600 rounded w-16"></div>
                <div className="h-3 bg-gray-600 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden"
         style={{
           background: 'hsla(230, 30%, 15%, 0.7)',
           backdropFilter: 'blur(20px)',
           border: '1px solid hsla(220, 40%, 30%, 0.3)',
         }}>
      
      <div className="p-6 border-b" style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}>
        <div className="flex items-center space-x-3">
          <FolderOpen size={20} style={{ color: 'hsl(195, 100%, 50%)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'hsl(0, 0%, 95%)' }}>
            Recent Projects
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  background: 'hsla(195, 100%, 50%, 0.2)',
                  color: 'hsl(195, 100%, 50%)' 
                }}>
            {projects.length}
          </span>
        </div>
      </div>

      <div className="divide-y" style={{ borderColor: 'hsla(220, 40%, 30%, 0.3)' }}>
        {projects.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen size={48} className="mx-auto mb-4 opacity-50" 
                        style={{ color: 'hsl(220, 15%, 70%)' }} />
            <p className="text-lg font-medium mb-2" style={{ color: 'hsl(0, 0%, 95%)' }}>
              No Projects Yet
            </p>
            <p style={{ color: 'hsl(220, 15%, 70%)' }}>
              Create your first project using the CLI to get started
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} 
                 className="p-4 hover:bg-opacity-50 transition-all duration-200 cursor-pointer group"
                 onMouseEnter={(e) => e.currentTarget.style.background = 'hsla(195, 100%, 50%, 0.05)'}
                 onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              
              <div className="flex items-center space-x-4">
                
                {/* Project Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm"
                     style={{ 
                       background: 'linear-gradient(135deg, hsl(195, 100%, 50%), hsl(180, 100%, 60%))',
                       color: 'white'
                     }}>
                  {getLanguageIcon(project.type)}
                </div>

                {/* Project Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold truncate" style={{ color: 'hsl(0, 0%, 95%)' }}>
                      {project.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full animate-pulse"
                           style={{ backgroundColor: getStatusColor(project.status) }}></div>
                      <span className="text-xs font-medium capitalize"
                            style={{ color: getStatusColor(project.status) }}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm" 
                       style={{ color: 'hsl(220, 15%, 70%)' }}>
                    <div className="flex items-center space-x-1">
                      <Code size={14} />
                      <span>{project.type}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity size={14} />
                      <span>{project.total_api_calls} calls</span>
                    </div>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm"
                       style={{ color: 'hsl(220, 15%, 70%)' }}>
                    <Clock size={14} />
                    <span>
                      {formatDistanceToNow(new Date(project.last_accessed_at || project.created_at), { 
                        addSuffix: true 
                      })}
                    </span>
                  </div>
                </div>

              </div>

              {project.description && (
                <div className="mt-2 ml-14">
                  <p className="text-sm line-clamp-2" style={{ color: 'hsl(220, 15%, 70%)' }}>
                    {project.description}
                  </p>
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};
