
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Zap, DollarSign, Activity } from 'lucide-react';

interface Provider {
  id: string;
  provider_name: string;
  selected_models: string[];
  provider_config: {
    credential_name: string;
  };
}

interface LLMProviderAnalyticsProps {
  provider: Provider;
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totalTokens: number;
  totalRequests: number;
  totalCost: number;
  dailyUsage: Array<{
    date: string;
    tokens: number;
    requests: number;
    cost: number;
  }>;
  modelDistribution: Array<{
    model: string;
    usage: number;
    color: string;
  }>;
}

const LLMProviderAnalytics: React.FC<LLMProviderAnalyticsProps> = ({ provider, isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch real analytics data from llm_usage_analytics table
      const { data, error } = await supabase
        .from('llm_usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider_id', provider.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      if (!data || data.length === 0) {
        // If no real data, show empty state
        setAnalytics({
          totalTokens: 0,
          totalRequests: 0,
          totalCost: 0,
          dailyUsage: [],
          modelDistribution: []
        });
        setIsLoading(false);
        return;
      }

      // Process real data
      const totalTokens = data.reduce((sum, record) => sum + (record.tokens_used || 0), 0);
      const totalRequests = data.length; // Each record represents one API request
      const totalCost = data.reduce((sum, record) => sum + (record.cost || 0), 0);

      // Group by date for daily usage
      const dailyMap = new Map();
      data.forEach(record => {
        const date = new Date(record.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { date, tokens: 0, requests: 0, cost: 0 });
        }
        const day = dailyMap.get(date);
        day.tokens += record.tokens_used || 0;
        day.requests += 1;
        day.cost += record.cost || 0;
      });

      const dailyUsage = Array.from(dailyMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Group by model for distribution
      const modelMap = new Map();
      const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#f97316'];
      data.forEach(record => {
        if (!modelMap.has(record.model_name)) {
          modelMap.set(record.model_name, { 
            model: record.model_name, 
            usage: 0, 
            color: colors[modelMap.size % colors.length] 
          });
        }
        modelMap.get(record.model_name).usage += record.tokens_used || 0;
      });

      const modelDistribution = Array.from(modelMap.values());

      setAnalytics({
        totalTokens,
        totalRequests,
        totalCost,
        dailyUsage,
        modelDistribution
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty analytics on error
      setAnalytics({
        totalTokens: 0,
        totalRequests: 0,
        totalCost: 0,
        dailyUsage: [],
        modelDistribution: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchAnalytics();

      // Set up real-time subscription
      const channel = supabase.channel('analytics-updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'llm_usage_analytics',
          filter: `provider_id=eq.${provider.id}`
        }, fetchAnalytics)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, provider.id]);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl rounded-xl">
          <DialogHeader>
            <DialogTitle>Loading Analytics...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {provider.provider_config.credential_name} Analytics
          </DialogTitle>
        </DialogHeader>
        
        {!analytics || (analytics.totalRequests === 0 && analytics.totalTokens === 0) ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Usage Data</h3>
            <p className="text-muted-foreground">
              This provider hasn't been used yet. Start making API calls to see analytics data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-muted-foreground">Total Tokens</span>
                </div>
                <p className="text-2xl font-bold text-cyan-400">
                  {analytics.totalTokens.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">API Requests</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">
                  {analytics.totalRequests.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">
                  ${analytics.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg p-4 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-muted-foreground">Active Models</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {analytics.modelDistribution.length}
                </p>
              </div>
            </div>

            {/* Daily Usage Chart */}
            {analytics.dailyUsage.length > 0 && (
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Daily Usage (Last 30 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area type="monotone" dataKey="tokens" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Model Distribution */}
            {analytics.modelDistribution.length > 0 && (
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Model Usage Distribution</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.modelDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="usage"
                        >
                          {analytics.modelDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {analytics.modelDistribution.map((model, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }}></div>
                        <span className="text-sm font-medium flex-1">{model.model}</span>
                        <span className="text-sm text-muted-foreground">{model.usage.toLocaleString()} tokens</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LLMProviderAnalytics;
