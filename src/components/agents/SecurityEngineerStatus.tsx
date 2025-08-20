
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, FileX, Settings, Activity, Lock, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgentStats {
  total_assessments: number;
  vulnerabilities_found: number;
  compliance_checks: number;
  threat_models: number;
  total_tokens_used: number;
  total_cost: number;
  memories_count: number;
  expertise_patterns_count: number;
}

interface SecurityEngineerStatusProps {
  projectId?: string;
}

const SecurityEngineerStatus: React.FC<SecurityEngineerStatusProps> = ({ projectId }) => {
  const [stats, setStats] = useState<AgentStats>({
    total_assessments: 0,
    vulnerabilities_found: 0,
    compliance_checks: 0,
    threat_models: 0,
    total_tokens_used: 0,
    total_cost: 0,
    memories_count: 0,
    expertise_patterns_count: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityStats();
    fetchRecentActivities();
  }, [projectId]);

  const fetchSecurityStats = async () => {
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
        .eq('agent_id', 'security_engineer')
        .match(projectFilter);

      if (memoriesError) throw memoriesError;

      // Fetch expertise patterns count
      const { data: expertisePatterns, error: expertiseError } = await supabase
        .from('agent_expertise_patterns')
        .select('id', { count: 'exact' })
        .eq('agent_id', 'security_engineer');

      if (expertiseError) throw expertiseError;

      // Fetch chat messages for conversation stats
      let chatQuery = supabase
        .from('chat_messages')
        .select('tokens_used, cost', { count: 'exact' })
        .eq('sender_agent_id', 'security_engineer');

      if (projectId) {
        chatQuery = chatQuery.eq('session_id', projectId);
      }

      const { data: chatMessages, error: chatError } = await chatQuery;
      if (chatError) throw chatError;

      // Fetch activity logs for security-specific metrics
      let activityQuery = supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'security_engineer');

      if (projectId) {
        activityQuery = activityQuery.eq('project_id', projectId);
      }

      const { data: activities, error: activitiesError } = await activityQuery;
      if (activitiesError) throw activitiesError;

      // Calculate security-specific metrics from activity details
      let securityAssessments = 0;
      let vulnerabilityScans = 0;
      let complianceChecks = 0;
      let threatModels = 0;

      activities?.forEach(activity => {
        if (activity.details && typeof activity.details === 'object') {
          const details = activity.details as any;
          if (details.action_type === 'security_assessment') securityAssessments++;
          if (details.action_type === 'vulnerability_scan') vulnerabilityScans++;
          if (details.action_type === 'compliance_check') complianceChecks++;
          if (details.action_type === 'threat_modeling') threatModels++;
        }
      });

      // Calculate totals
      const totalTokens = chatMessages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 0;
      const totalCost = chatMessages?.reduce((sum, msg) => sum + (msg.cost || 0), 0) || 0;

      setStats({
        total_assessments: securityAssessments,
        vulnerabilities_found: vulnerabilityScans,
        compliance_checks: complianceChecks,
        threat_models: threatModels,
        total_tokens_used: totalTokens,
        total_cost: totalCost,
        memories_count: memories?.length || 0,
        expertise_patterns_count: expertisePatterns?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching security stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Security Engineer statistics',
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
        .eq('agent_id', 'security_engineer')
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
        case 'security_assessment':
          return <Shield className="w-4 h-4" />;
        case 'vulnerability_scan':
          return <AlertTriangle className="w-4 h-4" />;
        case 'compliance_check':
          return <CheckCircle className="w-4 h-4" />;
        case 'threat_modeling':
          return <Eye className="w-4 h-4" />;
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
            Loading Security Engineer status...
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
            <Shield className="w-5 h-5 text-red-500" />
            <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Security Engineer Status
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Cybersecurity Specialist
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.total_assessments}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              Assessments
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.vulnerabilities_found}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Vuln Scans
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.compliance_checks}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Compliance
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.threat_models}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" />
              Threat Models
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
              <Lock className="w-3 h-3" />
              Security Memories
            </div>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 text-center">
            <div className="text-xl font-semibold">{stats.expertise_patterns_count}</div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Settings className="w-3 h-3" />
              Security Patterns
            </div>
          </div>
        </div>

        {/* Security Capabilities */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Security Expertise</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">OWASP Top 10</Badge>
            <Badge variant="secondary">Vulnerability Assessment</Badge>
            <Badge variant="secondary">Threat Modeling</Badge>
            <Badge variant="secondary">Compliance</Badge>
            <Badge variant="secondary">Penetration Testing</Badge>
            <Badge variant="secondary">SIEM/SOAR</Badge>
            <Badge variant="secondary">Zero Trust</Badge>
            <Badge variant="secondary">Incident Response</Badge>
          </div>
        </div>

        {/* Recent Security Activities */}
        {recentActivities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Security Activities</h4>
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
          <Button variant="outline" size="sm" onClick={fetchSecurityStats}>
            <Activity className="w-4 h-4 mr-2" />
            Refresh Stats
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-accent/20 rounded p-3">
          <strong>Security Engineer Authority:</strong> I conduct comprehensive security assessments, 
          vulnerability analysis, and compliance validation. I implement defense-in-depth strategies 
          and ensure zero-trust architecture principles across all Code-XI projects.
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityEngineerStatus;
