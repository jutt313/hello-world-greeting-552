
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Code2, 
  Database, 
  Smartphone, 
  Globe, 
  Zap, 
  Shield, 
  TestTube,
  GitBranch,
  Activity,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FullStackEngineerStatusProps {
  projectId?: string;
}

const FullStackEngineerStatus: React.FC<FullStackEngineerStatusProps> = ({ projectId }) => {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    activeProjects: 0,
    codeFiles: 0,
    testsWritten: 0,
    bugsfixed: 0,
    performance: 95,
    availability: 100
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAgentStats();
    fetchRecentActivity();
  }, [projectId]);

  const fetchAgentStats = async () => {
    try {
      // Get project assignments
      const { data: assignments } = await supabase
        .from('project_agents')
        .select('*')
        .eq('agent_id', 'fullstack_engineer');

      // Get activity logs
      const { data: activities } = await supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'fullstack_engineer')
        .limit(10);

      // Get memory contexts for learning insights
      const { data: memories } = await supabase
        .from('agent_memory_contexts')
        .select('*')
        .eq('agent_id', 'fullstack_engineer')
        .eq('memory_type', 'learning');

      setStats({
        tasksCompleted: assignments?.reduce((sum, a) => sum + a.tasks_completed, 0) || 0,
        activeProjects: assignments?.filter(a => a.is_assigned).length || 0,
        codeFiles: memories?.filter(m => m.tags?.includes('implementation')).length || 0,
        testsWritten: memories?.filter(m => m.tags?.includes('testing')).length || 0,
        bugsfixed: activities?.filter(a => a.activity_type === 'assigned_task' && 
          a.details?.action === 'debug').length || 0,
        performance: 95,
        availability: 100
      });

    } catch (error) {
      console.error('Error fetching Full-Stack Engineer stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: activities } = await supabase
        .from('agent_activity_logs')
        .select(`
          *,
          projects (name)
        `)
        .eq('agent_id', 'fullstack_engineer')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(activities || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const capabilities = [
    {
      icon: Code2,
      name: "Frontend Development",
      description: "React, Vue, Angular, TypeScript",
      proficiency: 98,
      color: "text-blue-500"
    },
    {
      icon: Database,
      name: "Backend Development", 
      description: "Node.js, Python, Java, Go APIs",
      proficiency: 96,
      color: "text-green-500"
    },
    {
      icon: Database,
      name: "Database Systems",
      description: "PostgreSQL, MongoDB, Redis",
      proficiency: 94,
      color: "text-purple-500"
    },
    {
      icon: Smartphone,
      name: "Mobile Development",
      description: "React Native, Flutter, PWAs",
      proficiency: 92,
      color: "text-orange-500"
    },
    {
      icon: TestTube,
      name: "Testing & QA",
      description: "Unit, Integration, E2E Testing",
      proficiency: 90,
      color: "text-red-500"
    },
    {
      icon: Zap,
      name: "Performance Optimization",
      description: "Code optimization, scalability",
      proficiency: 93,
      color: "text-yellow-500"
    }
  ];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Full-Stack Engineer Agent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-blue-500/20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Code2 className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">Full-Stack Engineer Agent</h3>
              <p className="text-sm text-muted-foreground">Complete Development Specialist</p>
            </div>
            <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-600 border-green-500/20">
              <Activity className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.tasksCompleted}</div>
              <div className="text-xs text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeProjects}</div>
              <div className="text-xs text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.codeFiles}</div>
              <div className="text-xs text-muted-foreground">Files Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.testsWritten}</div>
              <div className="text-xs text-muted-foreground">Tests Written</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Performance Score</span>
              <span className="text-sm text-muted-foreground">{stats.performance}%</span>
            </div>
            <Progress value={stats.performance} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Availability</span>
              <span className="text-sm text-muted-foreground">{stats.availability}%</span>
            </div>
            <Progress value={stats.availability} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Technical Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Technical Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {capabilities.map((capability, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-3">
                  <capability.icon className={`w-4 h-4 ${capability.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{capability.name}</span>
                      <span className="text-xs text-muted-foreground">{capability.proficiency}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{capability.description}</p>
                  </div>
                </div>
                <Progress value={capability.proficiency} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity to display
              </p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.details?.action || 'Task execution'} completed
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Project: {activity.projects?.name || 'Unknown'} • 
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FullStackEngineerStatus;
