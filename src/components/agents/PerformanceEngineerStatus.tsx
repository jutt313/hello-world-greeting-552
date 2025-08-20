
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  Clock, 
  Database, 
  Monitor, 
  Target,
  BarChart3,
  Cpu,
  HardDrive,
  Network,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  load_tests_conducted: number;
  optimizations_completed: number;
  monitoring_systems: number;
  bottlenecks_resolved: number;
  cache_implementations: number;
  performance_score: number;
}

interface ActivityLog {
  id: string;
  activity_type: string;
  details: any;
  created_at: string;
  agent_id: string;
  project_id: string;
}

const PerformanceEngineerStatus: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    load_tests_conducted: 0,
    optimizations_completed: 0,
    monitoring_systems: 0,
    bottlenecks_resolved: 0,
    cache_implementations: 0,
    performance_score: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceMetrics();
    fetchRecentActivities();
  }, []);

  const fetchPerformanceMetrics = async () => {
    try {
      const { data: activities, error } = await supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'performance_engineer');

      if (error) throw error;

      const calculatedMetrics: PerformanceMetrics = {
        load_tests_conducted: activities?.filter(a => 
          a.activity_type === 'assigned_task' && 
          JSON.stringify(a.details).includes('load_testing')
        ).length || 0,
        optimizations_completed: activities?.filter(a => 
          a.activity_type === 'assigned_task' && 
          JSON.stringify(a.details).includes('optimization')
        ).length || 0,
        monitoring_systems: activities?.filter(a => 
          a.activity_type === 'assigned_task' && 
          JSON.stringify(a.details).includes('monitoring')
        ).length || 0,
        bottlenecks_resolved: activities?.filter(a => 
          a.activity_type === 'assigned_task' && 
          JSON.stringify(a.details).includes('bottleneck')
        ).length || 0,
        cache_implementations: activities?.filter(a => 
          a.activity_type === 'assigned_task' && 
          JSON.stringify(a.details).includes('caching')
        ).length || 0,
        performance_score: Math.min(95, ((activities?.length || 0) * 5) + 60),
      };

      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_activity_logs')
        .select('*')
        .eq('agent_id', 'performance_engineer')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    if (activityType.includes('load_testing')) return <Target className="w-4 h-4" />;
    if (activityType.includes('optimization')) return <TrendingUp className="w-4 h-4" />;
    if (activityType.includes('monitoring')) return <Monitor className="w-4 h-4" />;
    if (activityType.includes('bottleneck')) return <Cpu className="w-4 h-4" />;
    if (activityType.includes('caching')) return <Database className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const getActivityDescription = (activity: ActivityLog): string => {
    if (activity.details && typeof activity.details === 'object') {
      return activity.details.description || activity.details.task || 'Performance task executed';
    }
    return 'Performance engineering task';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Performance Engineer Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Performance Engineer
          </span>
          <Badge variant="outline" className="ml-auto">
            Optimization Specialist
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="activities">Recent Activities</TabsTrigger>
            <TabsTrigger value="systems">Monitoring Systems</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Load Tests</span>
                </div>
                <div className="text-2xl font-bold text-orange-800">{metrics.load_tests_conducted}</div>
                <div className="text-xs text-orange-600">Conducted</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Optimizations</span>
                </div>
                <div className="text-2xl font-bold text-blue-800">{metrics.optimizations_completed}</div>
                <div className="text-xs text-blue-600">Completed</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Monitoring</span>
                </div>
                <div className="text-2xl font-bold text-green-800">{metrics.monitoring_systems}</div>
                <div className="text-xs text-green-600">Systems Active</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Bottlenecks</span>
                </div>
                <div className="text-2xl font-bold text-purple-800">{metrics.bottlenecks_resolved}</div>
                <div className="text-xs text-purple-600">Resolved</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">Cache Systems</span>
                </div>
                <div className="text-2xl font-bold text-indigo-800">{metrics.cache_implementations}</div>
                <div className="text-xs text-indigo-600">Implemented</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-100">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Performance Score</span>
                </div>
                <div className="text-2xl font-bold text-yellow-800">{metrics.performance_score}%</div>
                <div className="text-xs text-yellow-600">Overall Rating</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-orange-700">Performance Optimization Progress</span>
                  <span className="text-orange-600">{metrics.performance_score}%</span>
                </div>
                <Progress value={metrics.performance_score} className="h-2 bg-orange-100" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-blue-700">Load Testing Coverage</span>
                  <span className="text-blue-600">{Math.min(100, metrics.load_tests_conducted * 25)}%</span>
                </div>
                <Progress value={Math.min(100, metrics.load_tests_conducted * 25)} className="h-2 bg-blue-100" />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-700">Monitoring Coverage</span>
                  <span className="text-green-600">{Math.min(100, metrics.monitoring_systems * 20)}%</span>
                </div>
                <Progress value={Math.min(100, metrics.monitoring_systems * 20)} className="h-2 bg-green-100" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 text-orange-300" />
                <p>No recent performance activities</p>
                <p className="text-sm">Start optimizing to see activities here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="p-1.5 bg-orange-100 rounded-full">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">
                          {activity.activity_type.replace(/_/g, ' ')}
                        </span>
                        <Badge className="text-xs bg-green-500/20 text-green-700 border-green-500/20">
                          completed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{getActivityDescription(activity)}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="systems" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="w-5 h-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">System Performance</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Optimization</span>
                    <span className="text-orange-600">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory Management</span>
                    <span className="text-orange-600">Monitoring</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Disk I/O Analysis</span>
                    <span className="text-orange-600">Optimized</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Network Performance</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CDN Optimization</span>
                    <span className="text-blue-600">Configured</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Compression</span>
                    <span className="text-blue-600">Enabled</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>HTTP/2 Support</span>
                    <span className="text-blue-600">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Database Performance</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Query Optimization</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Index Management</span>
                    <span className="text-green-600">Optimized</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Connection Pooling</span>
                    <span className="text-green-600">Configured</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-800">Caching Systems</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Redis Cache</span>
                    <span className="text-purple-600">Running</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Browser Cache</span>
                    <span className="text-purple-600">Optimized</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CDN Cache</span>
                    <span className="text-purple-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PerformanceEngineerStatus;
