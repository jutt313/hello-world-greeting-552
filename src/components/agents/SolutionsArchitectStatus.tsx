
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, GitBranch, Layers, Database, Cloud, Settings, Activity, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentStats {
  total_designs: number;
  architecture_reviews: number;
  technology_evaluations: number;
  adrs_created: number;
  total_tokens_used: number;
  total_cost: number;
  memories_count: number;
  expertise_patterns_count: number;
}

interface SolutionsArchitectStatusProps {
  projectId?: string;
}

const SolutionsArchitectStatus: React.FC<SolutionsArchitectStatusProps> = ({ projectId }) => {
  const [stats, setStats] = useState<AgentStats>({
    total_designs: 0,
    architecture_reviews: 0,
    technology_evaluations: 0,
    adrs_created: 0,
    total_tokens_used: 0,
    total_cost: 0,
    memories_count: 0,
    expertise_patterns_count: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArchitectStats();
    fetchRecentActivities();
  }, [projectId]);

  const fetchArchitectStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      let projectFilter = {};
      if (projectId) {
        projectFilter = { project_id: projectId };
      }

      // Fetch memories count
      const { data: memories, error: memoriesError } = await supabase
        .from('agent_memory_contexts')
        .select('id', { count: 'exact' })
        .eq('agent_id', 'solutions_architect')
        .match(projectFilter);

      if (memoriesError) throw memoriesError;

      // Fetch expertise patterns count
      const { data: expertisePatterns, error: expertiseError } = await supabase
        .from('agent_expertise_patterns')
        .select('id', { count: 'exact' })
        .eq('agent_id', 'solutions_architect');

      if (expertiseError) throw expertiseError;

      // Fetch chat messages for conversation stats
      let chatQuery = supabase
        .from('chat_messages')
        .select('tokens_used, cost', { count: 'exact' })
        .eq('sender_agent_id', 'solutions_architect');

      if (projectId) {
        chatQuery = chatQuery.eq('session_id', projectId);
      }

      const { data: chatMessages, error: chatError } = await chatQuery;
      if (chatError) throw chatError;

      // Fetch activity logs for architecture-specific metrics
      let activityQuery = supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'solutions_architect');

      if (projectId) {
        activityQuery = activityQuery.eq('project_id', projectId);
      }

      const { data: activities, error: activitiesError } = await activityQuery;
      if (activitiesError) throw activitiesError;

      // Calculate architecture-specific metrics from activity details
      let systemDesigns = 0;
      let architectureReviews = 0;
      let technologyEvaluations = 0;
      let adrsCreated = 0;

      activities?.forEach(activity => {
        if (activity.details && typeof activity.details === 'object') {
          const details = activity.details as any;
          if (details.action_type === 'design_system') systemDesigns++;
          if (details.action_type === 'analyze_architecture') architectureReviews++;
          if (details.action_type === 'evaluate_technology') technologyEvaluations++;
          if (details.action_type === 'create_adr') adrsCreated++;
        }
      });

      // Calculate totals
      const totalTokens = chatMessages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0;
      const totalCost = chatMessages?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;

      setStats({
        total_designs: systemDesigns,
        architecture_reviews: architectureReviews,
        technology_evaluations: technologyEvaluations,
        adrs_created: adrsCreated,
        total_tokens_used: totalTokens,
        total_cost: totalCost,
        memories_count: memories?.length || 0,
        expertise_patterns_count: expertisePatterns?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching Solutions Architect stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Solutions Architect statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      let activityQuery = supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'solutions_architect')
        .order('created_at', { ascending: false })
        .limit(5);

      if (projectId) {
        activityQuery = activityQuery.eq('project_id', projectId);
      }

      const { data: activities, error } = await activityQuery;
      if (error) throw error;

      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  const getActivityIcon = (activity: any) => {
    if (activity.details && typeof activity.details === 'object') {
      const details = activity.details as any;
      switch (details.action_type) {
        case 'design_system':
          return <Building2 className="w-4 h-4" />;
        case 'analyze_architecture':
          return <Layers className="w-4 h-4" />;
        case 'evaluate_technology':
          return <GitBranch className="w-4 h-4" />;
        case 'create_adr':
          return <FileText className="w-4 h-4" />;
        default:
          return <Activity className="w-4 h-4" />;
      }
    }
    return <Activity className="w-4 h-4" />;
  };

  const getActionLabel = (activity: any) => {
    if (activity.details && typeof activity.details === 'object') {
      const details = activity.details as any;
      return details.action_type || details.action || activity.activity_type;
    }
    return activity.activity_type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4 animate-pulse" />
            Loading Solutions Architect status...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Solutions Architect Status
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            System Design Expert
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Architecture Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_designs}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Building2 className="w-3 h-3" />
              System Designs
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.architecture_reviews}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Layers className="w-3 h-3" />
              Arch Reviews
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.technology_evaluations}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <GitBranch className="w-3 h-3" />
              Tech Evals
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.adrs_created}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" />
              ADRs Created
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.total_tokens_used.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Tokens Used</div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">${stats.total_cost.toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </div>

        {/* Intelligence Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.memories_count}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Database className="w-3 h-3" />
              Arch Memories
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.expertise_patterns_count}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Settings className="w-3 h-3" />
              Design Patterns
            </div>
          </div>
        </div>

        {/* Architecture Specializations */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Architecture Expertise</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Microservices</Badge>
            <Badge variant="secondary">Event-Driven</Badge>
            <Badge variant="secondary">Domain-Driven Design</Badge>
            <Badge variant="secondary">Cloud Architecture</Badge>
            <Badge variant="secondary">API Design</Badge>
            <Badge variant="secondary">Scalability</Badge>
            <Badge variant="secondary">Security Architecture</Badge>
            <Badge variant="secondary">Performance</Badge>
          </div>
        </div>

        {/* Recent Architecture Activities */}
        {recentActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Architecture Activities</h4>
            <div className="space-y-2">
              {recentActivities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg bg-accent/30">
                  {getActivityIcon(activity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {getActionLabel(activity)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchArchitectStats}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-accent/20 rounded p-3">
          <strong>Solutions Architect Authority:</strong> I design comprehensive system architectures, 
          evaluate technology stacks, and create architectural decision records. I ensure scalable, 
          maintainable solutions that align with business requirements and technical excellence standards.
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionsArchitectStatus;
