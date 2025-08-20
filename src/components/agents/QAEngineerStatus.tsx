
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestTube, CheckCircle, AlertTriangle, BarChart3, Settings, Activity, Bug, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentStats {
  total_tests_created: number;
  test_strategies_developed: number;
  performance_tests_run: number;
  security_tests_executed: number;
  total_tokens_used: number;
  total_cost: number;
  memories_count: number;
  expertise_patterns_count: number;
}

interface QAEngineerStatusProps {
  projectId?: string;
}

const QAEngineerStatus: React.FC<QAEngineerStatusProps> = ({ projectId }) => {
  const [stats, setStats] = useState<AgentStats>({
    total_tests_created: 0,
    test_strategies_developed: 0,
    performance_tests_run: 0,
    security_tests_executed: 0,
    total_tokens_used: 0,
    total_cost: 0,
    memories_count: 0,
    expertise_patterns_count: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchQAStats();
    fetchRecentActivities();
  }, [projectId]);

  const fetchQAStats = async () => {
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
        .eq('agent_id', 'qa_engineer')
        .match(projectFilter);

      if (memoriesError) throw memoriesError;

      // Fetch expertise patterns count
      const { data: expertisePatterns, error: expertiseError } = await supabase
        .from('agent_expertise_patterns')
        .select('id', { count: 'exact' })
        .eq('agent_id', 'qa_engineer');

      if (expertiseError) throw expertiseError;

      // Fetch chat messages for conversation stats
      let chatQuery = supabase
        .from('chat_messages')
        .select('tokens_used, cost', { count: 'exact' })
        .eq('sender_agent_id', 'qa_engineer');

      if (projectId) {
        chatQuery = chatQuery.eq('session_id', projectId);
      }

      const { data: chatMessages, error: chatError } = await chatQuery;
      if (chatError) throw chatError;

      // Fetch activity logs for QA-specific metrics
      let activityQuery = supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'qa_engineer');

      if (projectId) {
        activityQuery = activityQuery.eq('project_id', projectId);
      }

      const { data: activities, error: activitiesError } = await activityQuery;
      if (activitiesError) throw activitiesError;

      // Calculate QA-specific metrics from activity details
      let testsCreated = 0;
      let testStrategies = 0;
      let performanceTests = 0;
      let securityTests = 0;

      activities?.forEach(activity => {
        if (activity.details && typeof activity.details === 'object') {
          const details = activity.details as any;
          if (details.action === 'create_tests') testsCreated++;
          if (details.action === 'test_strategy') testStrategies++;
          if (details.action === 'performance_test') performanceTests++;
          if (details.action === 'security_test') securityTests++;
        }
      });

      // Calculate totals
      const totalTokens = chatMessages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0;
      const totalCost = chatMessages?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;

      setStats({
        total_tests_created: testsCreated,
        test_strategies_developed: testStrategies,
        performance_tests_run: performanceTests,
        security_tests_executed: securityTests,
        total_tokens_used: totalTokens,
        total_cost: totalCost,
        memories_count: memories?.length || 0,
        expertise_patterns_count: expertisePatterns?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching QA stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load QA Engineer statistics',
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
        .eq('agent_id', 'qa_engineer')
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
      switch (details.action) {
        case 'create_tests':
          return <TestTube className="w-4 h-4" />;
        case 'test_strategy':
          return <Target className="w-4 h-4" />;
        case 'performance_test':
          return <BarChart3 className="w-4 h-4" />;
        case 'security_test':
          return <AlertTriangle className="w-4 h-4" />;
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
            Loading QA Engineer status...
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
            <TestTube className="w-5 h-5 text-green-500" />
            <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              QA Engineer Status
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Quality Assurance Specialist
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* QA Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_tests_created}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TestTube className="w-3 h-3" />
              Tests Created
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.test_strategies_developed}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Target className="w-3 h-3" />
              Test Strategies
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.performance_tests_run}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Performance Tests
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.security_tests_executed}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Security Tests
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
              <Bug className="w-3 h-3" />
              Testing Memories
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.expertise_patterns_count}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Settings className="w-3 h-3" />
              Quality Patterns
            </div>
          </div>
        </div>

        {/* Testing Capabilities */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Testing Expertise</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Jest/Cypress</Badge>
            <Badge variant="secondary">Playwright</Badge>
            <Badge variant="secondary">JMeter</Badge>
            <Badge variant="secondary">k6 Performance</Badge>
            <Badge variant="secondary">Accessibility</Badge>
            <Badge variant="secondary">API Testing</Badge>
            <Badge variant="secondary">Mobile Testing</Badge>
            <Badge variant="secondary">Security Testing</Badge>
          </div>
        </div>

        {/* Recent QA Activities */}
        {recentActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Testing Activities</h4>
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
          <Button variant="outline" size="sm" onClick={fetchQAStats}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-accent/20 rounded p-3">
          <strong>QA Engineer Authority:</strong> I ensure software quality through comprehensive testing strategies, 
          automated test frameworks, performance validation, and accessibility compliance. I architect quality 
          into every aspect of the development process.
        </div>
      </CardContent>
    </Card>
  );
};

export default QAEngineerStatus;
