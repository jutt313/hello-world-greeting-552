
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Server, 
  Cloud, 
  Shield, 
  Activity,
  Settings,
  Database,
  Monitor,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DevOpsEngineerStatus: React.FC = () => {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'devops_engineer')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error fetching DevOps Engineer activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to load DevOps Engineer activity',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getActionFromDetails = (details: any): string => {
    if (typeof details === 'object' && details !== null) {
      return details.action || 'general_task';
    }
    if (typeof details === 'string') {
      try {
        const parsed = JSON.parse(details);
        return parsed.action || 'general_task';
      } catch {
        return 'general_task';
      }
    }
    return 'general_task';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'plan_infrastructure':
        return <Server className="w-4 h-4" />;
      case 'deploy':
        return <Cloud className="w-4 h-4" />;
      case 'monitor':
        return <Monitor className="w-4 h-4" />;
      case 'optimize':
        return <Zap className="w-4 h-4" />;
      case 'secure':
        return <Shield className="w-4 h-4" />;
      case 'scale':
        return <Activity className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'plan_infrastructure':
        return 'Infrastructure Planning';
      case 'deploy':
        return 'Deployment';
      case 'monitor':
        return 'Monitoring Setup';
      case 'optimize':
        return 'Performance Optimization';
      case 'secure':
        return 'Security Implementation';
      case 'scale':
        return 'Scaling Operations';
      default:
        return 'General Task';
    }
  };

  const capabilities = [
    {
      icon: <Cloud className="w-5 h-5" />,
      title: 'Cloud Platforms',
      description: 'AWS, GCP, Azure expertise',
      status: 'active'
    },
    {
      icon: <Server className="w-5 h-5" />,
      title: 'Container Orchestration',
      description: 'Docker, Kubernetes, service mesh',
      status: 'active'
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: 'Infrastructure as Code',
      description: 'Terraform, CloudFormation, Ansible',
      status: 'active'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'CI/CD Pipelines',
      description: 'GitHub Actions, GitLab CI, Jenkins',
      status: 'active'
    },
    {
      icon: <Monitor className="w-5 h-5" />,
      title: 'Monitoring & Observability',
      description: 'Prometheus, Grafana, ELK Stack',
      status: 'active'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Security & Compliance',
      description: 'Network security, compliance frameworks',
      status: 'active'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agent Identity Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-orange-500/20">
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white">
                <Server className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-bold">
                  DevOps Engineer Agent
                </span>
                <Badge variant="outline" className="text-xs">
                  Infrastructure Specialist
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Deployment & Operations Excellence
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-xs text-muted-foreground">Infrastructure Monitoring</div>
            </div>
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime Target</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Core Capabilities</h4>
            <div className="grid grid-cols-1 gap-2">
              {capabilities.slice(0, 3).map((capability, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="text-orange-500">{capability.icon}</div>
                  <span className="font-medium">{capability.title}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {capability.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Recent Infrastructure Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const action = getActionFromDetails(activity.details);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-orange-500 mt-0.5">
                        {getActionIcon(action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {getActionLabel(action)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {activity.activity_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-4 text-orange-500/50" />
                <h3 className="font-semibold mb-2">No Infrastructure Operations Yet</h3>
                <p className="text-sm">
                  DevOps Engineer is ready to plan, deploy, and monitor your infrastructure.
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Extended Capabilities */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            DevOps & Infrastructure Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((capability, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-orange-500">{capability.icon}</div>
                  <h4 className="font-semibold">{capability.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {capability.description}
                </p>
                <Badge 
                  variant={capability.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {capability.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevOpsEngineerStatus;
