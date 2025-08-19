
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MetricData {
  totalProjects: number;
  activeSessions: number;
  dailyApiCalls: number;
  platformCredits: number;
  projectsTrend: string;
  sessionsTrend: string;
  callsTrend: string;
}

export const MetricCards: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData>({
    totalProjects: 0,
    activeSessions: 0,
    dailyApiCalls: 0,
    platformCredits: 0,
    projectsTrend: '',
    sessionsTrend: '',
    callsTrend: '',
  });
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState<MetricData>({
    totalProjects: 0,
    activeSessions: 0,
    dailyApiCalls: 0,
    platformCredits: 0,
    projectsTrend: '',
    sessionsTrend: '',
    callsTrend: '',
  });

  useEffect(() => {
    fetchMetrics();
    setupRealtimeUpdates();
  }, []);

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [projectsRes, sessionsRes, analyticsRes, profileRes, lastWeekProjectsRes, yesterdayCallsRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }).eq('owner_id', user.id),
        supabase.from('chat_sessions').select('id', { count: 'exact' }).eq('is_active', true).eq('user_id', user.id),
        supabase.from('project_analytics').select('api_calls_count').eq('date', today),
        supabase.from('users_profiles').select('credits_remaining').eq('id', user.id).single(),
        supabase.from('projects').select('id', { count: 'exact' }).eq('owner_id', user.id).lte('created_at', weekAgo),
        supabase.from('project_analytics').select('api_calls_count').eq('date', yesterday)
      ]);

      const dailyCalls = analyticsRes.data?.reduce((sum, record) => sum + (record.api_calls_count || 0), 0) || 0;
      const yesterdayCalls = yesterdayCallsRes.data?.reduce((sum, record) => sum + (record.api_calls_count || 0), 0) || 0;
      const currentProjects = projectsRes.count || 0;
      const lastWeekProjects = lastWeekProjectsRes.count || 0;
      const weeklyGrowth = currentProjects - lastWeekProjects;
      const callsChange = dailyCalls - yesterdayCalls;

      const newMetrics = {
        totalProjects: currentProjects,
        activeSessions: sessionsRes.count || 0,
        dailyApiCalls: dailyCalls,
        platformCredits: profileRes.data?.credits_remaining || 0,
        projectsTrend: weeklyGrowth > 0 ? `+${weeklyGrowth} this week` : weeklyGrowth < 0 ? `${weeklyGrowth} this week` : 'no change',
        sessionsTrend: `${sessionsRes.count || 0} running`,
        callsTrend: callsChange > 0 ? `+${callsChange} today` : callsChange < 0 ? `${callsChange} today` : 'same as yesterday',
      };

      setMetrics(newMetrics);
      animateCounters(newMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setLoading(false);
    }
  };

  const animateCounters = (targetMetrics: MetricData) => {
    const duration = 1200;
    const steps = 50;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        totalProjects: Math.floor(targetMetrics.totalProjects * easeOutProgress),
        activeSessions: Math.floor(targetMetrics.activeSessions * easeOutProgress),
        dailyApiCalls: Math.floor(targetMetrics.dailyApiCalls * easeOutProgress),
        platformCredits: Math.floor(targetMetrics.platformCredits * easeOutProgress),
        projectsTrend: targetMetrics.projectsTrend,
        sessionsTrend: targetMetrics.sessionsTrend,
        callsTrend: targetMetrics.callsTrend,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targetMetrics);
      }
    }, stepDuration);
  };

  const setupRealtimeUpdates = () => {
    const channel = supabase.channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users_profiles' }, fetchMetrics)
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const cards = [
    {
      title: 'Total Projects',
      value: animatedValues.totalProjects,
      subtitle: animatedValues.projectsTrend,
    },
    {
      title: 'Active Sessions',
      value: animatedValues.activeSessions,
      subtitle: animatedValues.sessionsTrend,
    },
    {
      title: 'Daily API Calls',
      value: animatedValues.dailyApiCalls,
      subtitle: animatedValues.callsTrend,
    },
    {
      title: 'Platform Credits',
      value: animatedValues.platformCredits,
      subtitle: 'remaining',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-6 animate-pulse"
               style={{
                 background: 'hsla(230, 30%, 18%, 0.4)',
                 border: '1px solid hsla(220, 40%, 30%, 0.3)',
                 backdropFilter: 'blur(10px)'
               }}>
            <div className="h-4 bg-gray-600 rounded mb-4"></div>
            <div className="h-8 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={card.title} 
             className="rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-105 text-left relative overflow-hidden"
             style={{
               background: 'hsla(230, 30%, 18%, 0.4)',
               border: '1px solid hsla(220, 40%, 30%, 0.3)',
               backdropFilter: 'blur(10px)',
               animationDelay: `${index * 100}ms`,
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.boxShadow = `0 0 30px hsla(195, 100%, 50%, 0.15)`;
               e.currentTarget.style.borderColor = 'hsla(195, 100%, 50%, 0.4)';
               e.currentTarget.style.background = 'hsla(230, 30%, 18%, 0.6)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.boxShadow = 'none';
               e.currentTarget.style.borderColor = 'hsla(220, 40%, 30%, 0.3)';
               e.currentTarget.style.background = 'hsla(230, 30%, 18%, 0.4)';
             }}>
          
          {/* Background glow effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
               style={{
                 background: 'radial-gradient(circle at center, hsla(195, 100%, 50%, 0.1) 0%, transparent 70%)',
                 filter: 'blur(20px)'
               }}></div>

          <div className="relative z-10">
            <h3 className="text-sm font-medium tracking-wide mb-3" 
                style={{ color: 'hsl(220, 15%, 70%)' }}>
              {card.title}
            </h3>

            <div className="mb-2">
              <span className="text-2xl font-bold tabular-nums" 
                    style={{ color: 'hsl(0, 0%, 95%)' }}>
                {card.value.toLocaleString()}
              </span>
            </div>

            <p className="text-sm" style={{ color: 'hsl(220, 15%, 70%)' }}>
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
