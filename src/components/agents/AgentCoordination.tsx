
import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  initiator_agent_id: string;
  target_agent_id: string;
  coordination_type: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'waiting';
  created_at: string;
  initiator: { name: string; role: string };
  target: { name: string; role: string };
  task_data?: any;
}

interface WorkflowStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  failed: number;
}

export const AgentCoordination: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [stats, setStats] = useState<WorkflowStats>({ total: 0, pending: 0, in_progress: 0, completed: 0, failed: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>(projectId || '');

  const fetchWorkflow = async (selectedProjectId: string) => {
    if (!selectedProjectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('agent-coordination', {
        body: {
          action: 'get_project_workflow',
          projectId: selectedProjectId
        }
      });

      if (error) throw error;

      setWorkflow(data.workflow || []);
      setStats(data.stats || { total: 0, pending: 0, in_progress: 0, completed: 0, failed: 0 });
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchWorkflow(selectedProject);
    }
  }, [selectedProject]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (role: string) => {
    const icons = {
      'manager': '👑',
      'developer': '💻',
      'devops': '🔧',
      'qa': '🧪',
      'security': '🔒',
      'architect': '🏗️',
      'documentation': '📚',
      'performance': '⚡'
    };
    return icons[role as keyof typeof icons] || '🤖';
  };

  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Agent Coordination Workflow
          {stats.total > 0 && (
            <Badge variant="outline" className="ml-auto">
              {progressPercentage}% Complete
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workflow Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.in_progress}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        )}

        {/* Workflow Steps */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading workflow...
          </div>
        ) : workflow.length > 0 ? (
          <div className="space-y-3">
            {workflow.map((step, index) => (
              <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{getAgentIcon(step.initiator.role)}</span>
                  <span className="font-medium text-sm truncate">{step.initiator.name}</span>
                </div>
                
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{getAgentIcon(step.target.role)}</span>
                  <span className="font-medium text-sm truncate">{step.target.name}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 truncate">{step.message}</div>
                  {step.task_data?.stepDescription && (
                    <div className="text-xs text-muted-foreground truncate">
                      {step.task_data.stepDescription}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(step.status)}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(step.status)}`}
                  >
                    {step.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No active workflow found.</p>
            <p className="text-sm">Create a new project to see agent coordination in action.</p>
          </div>
        )}

        {selectedProject && (
          <Button 
            onClick={() => fetchWorkflow(selectedProject)} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing
              </>
            ) : (
              'Refresh Workflow'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
