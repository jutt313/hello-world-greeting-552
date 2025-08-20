
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Brain, Settings, TrendingUp, Users, Zap, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentStats {
  total_projects: number;
  total_conversations: number;
  total_tokens_used: number;
  total_cost: number;
  memories_count: number;
  expertise_patterns_count: number;
  task_assignments_count: number;
}

interface ManagerAgentStatusProps {
  projectId?: string;
}

const ManagerAgentStatus: React.FC<ManagerAgentStatusProps> = ({ projectId }) => {
  const [stats, setStats] = useState<AgentStats>({
    total_projects: 0,
    total_conversations: 0,
    total_tokens_used: 0,
    total_cost: 0,
    memories_count: 0,
    expertise_patterns_count: 0,
    task_assignments_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchManagerStats();
  }, [projectId]);

  const fetchManagerStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get project-specific or user-wide stats
      let projectFilter = {};
      if (projectId) {
        projectFilter = { project_id: projectId };
      }

      // Fetch memories count
      const { data: memories, error: memoriesError } = await supabase
        .from('agent_memory_contexts')
        .select('id', { count: 'exact' })
        .eq('agent_id', 'manager_supreme')
        .match(projectFilter);

      if (memoriesError) throw memoriesError;

      // Fetch expertise patterns count
      const { data: expertisePatterns, error: expertiseError } = await supabase
        .from('agent_expertise_patterns')
        .select('id', { count: 'exact' })
        .eq('agent_id', 'manager_supreme');

      if (expertiseError) throw expertiseError;

      // Fetch task assignments count
      const { data: taskAssignments, error: taskError } = await supabase
        .from('agent_task_assignments')
        .select('id', { count: 'exact' })
        .eq('assigned_by_agent_id', 'manager_supreme')
        .match(projectFilter);

      if (taskError) throw taskError;

      // Fetch chat messages for conversation stats
      let chatQuery = supabase
        .from('chat_messages')
        .select('tokens_used, cost', { count: 'exact' })
        .eq('sender_agent_id', 'manager_supreme');

      if (projectId) {
        chatQuery = chatQuery.eq('session_id', projectId);
      }

      const { data: chatMessages, error: chatError } = await chatQuery;
      if (chatError) throw chatError;

      // Calculate totals
      const totalTokens = chatMessages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0;
      const totalCost = chatMessages?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;

      // Get project count (only if not filtering by specific project)
      let projectCount = 0;
      if (!projectId) {
        const { data: projects, error: projectsError } = await supabase
          .from('project_agents')
          .select('project_id', { count: 'exact' })
          .eq('agent_id', 'manager_supreme');

        if (projectsError) throw projectsError;
        projectCount = projects?.length || 0;
      } else {
        projectCount = 1; // Current project
      }

      setStats({
        total_projects: projectCount,
        total_conversations: chatMessages?.length || 0,
        total_tokens_used: totalTokens,
        total_cost: totalCost,
        memories_count: memories?.length || 0,
        expertise_patterns_count: expertisePatterns?.length || 0,
        task_assignments_count: taskAssignments?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching manager stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Manager Agent statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const optimizeMemories = async () => {
    if (!projectId) return;

    try {
      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/manager-agent-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'optimize_memory',
          projectId: projectId,
          agentId: 'manager_supreme',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Memory Optimized',
          description: `Compressed ${result.compressed} old memories`,
        });
        fetchManagerStats(); // Refresh stats
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: 'Optimization Failed',
        description: 'Failed to optimize Manager Agent memories',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="w-4 h-4 animate-pulse" />
            Loading Manager Agent status...
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
            <Crown className="w-5 h-5 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Manager Agent Status
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Supreme Authority
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_projects}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Projects
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_conversations}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Activity className="w-3 h-3" />
              Conversations
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_tokens_used.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              Tokens Used
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">${stats.total_cost.toFixed(4)}</div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </div>

        {/* Intelligence Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.memories_count}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Brain className="w-3 h-3" />
              Stored Memories
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.expertise_patterns_count}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Expertise Patterns
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.task_assignments_count}</div>
            <div className="text-sm text-muted-foreground">Task Assignments</div>
          </div>
        </div>

        {/* Agent Capabilities */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Supreme Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">User Communication</Badge>
            <Badge variant="secondary">Project Control</Badge>
            <Badge variant="secondary">Agent Orchestration</Badge>
            <Badge variant="secondary">Technology Decisions</Badge>
            <Badge variant="secondary">Resource Allocation</Badge>
            <Badge variant="secondary">Quality Control</Badge>
            <Badge variant="secondary">Final Authority</Badge>
          </div>
        </div>

        {/* Actions */}
        {projectId && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={optimizeMemories}>
              <Settings className="w-4 h-4 mr-2" />
              Optimize Memory
            </Button>
            <Button variant="outline" size="sm" onClick={fetchManagerStats}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh Stats
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-accent/20 rounded p-3">
          <strong>Manager Agent Authority:</strong> As the supreme orchestrator, I have exclusive 
          user communication rights and final decision-making authority over all project aspects. 
          I coordinate 7 specialized agents to deliver exceptional results that exceed expectations.
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerAgentStatus;
