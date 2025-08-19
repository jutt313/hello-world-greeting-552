
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FolderOpen, Activity, Phone, Gem } from 'lucide-react';

interface MetricData {
  totalProjects: number;
  activeSessions: number;
  dailyApiCalls: number;
  platformCredits: number;
}

export const MetricCards: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData>({
    totalProjects: 0,
    activeSessions: 0,
    dailyApiCalls: 0,
    platformCredits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState<MetricData>({
    totalProjects: 0,
    activeSessions: 0,
    dailyApiCalls: 0,
    platformCredits: 0,
  });

  useEffect(() => {
    fetchMetrics();
    setupRealtimeUpdates();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [projectsRes, sessionsRes, analyticsRes, profileRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact' }),
        supabase.from('chat_sessions').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('project_analytics').select('api_calls_count').eq('date', new Date().toISOString().split('T')[0]),
        supabase.from('users_profiles').select('credits_remaining').single()
      ]);

      const dailyCalls = analyticsRes.data?.reduce((sum, record) => sum + (record.api_calls_count || 0), 0) || 0;

      const newMetrics = {
        totalProjects: projectsRes.count || 0,
        activeSessions: sessionsRes.count || 0,
        dailyApiCalls: dailyCalls,
        platformCredits: profileRes.data?.credits_remaining || 0,
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
    const duration = 1500;
    const steps = 60;
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

  const getCreditColor = (credits: number) => {
    if (credits > 500) return 'hsl(120, 60%, 50%)';
    if (credits > 100) return 'hsl(45, 100%, 60%)';
    return 'hsl(0, 70%, 60%)';
  };

  const cards = [
    {
      title: 'TOTAL PROJECTS',
      value: animatedValues.totalProjects,
      subtitle: '+2 this week',
      icon: FolderOpen,
      color: 'hsl(195, 100%, 50%)',
    },
    {
      title: 'ACTIVE SESSIONS',
      value: animatedValues.activeSessions,
      subtitle: '2 running',
      icon: Activity,
      color: 'hsl(120, 60%, 50%)',
      pulse: true,
    },
    {
      title: 'DAILY API CALLS',
      value: animatedValues.dailyApiCalls,
      subtitle: '+23 today',
      icon: Phone,
      color: 'hsl(260, 60%, 60%)',
    },
    {
      title: 'PLATFORM CREDITS',
      value: animatedValues.platformCredits,
      subtitle: 'remaining',
      icon: Gem,
      color: getCreditColor(animatedValues.platformCredits),
      sparkle: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl p-6 animate-pulse"
               style={{
                 background: 'hsla(230, 30%, 15%, 0.7)',
                 backdropFilter: 'blur(20px)',
                 border: '1px solid hsla(220, 40%, 30%, 0.3)',
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
             className="group rounded-xl p-6 cursor-pointer transition-all duration-300 hover:scale-105"
             style={{
               background: 'hsla(230, 30%, 15%, 0.7)',
               backdropFilter: 'blur(20px)',
               border: '1px solid hsla(220, 40%, 30%, 0.3)',
               animationDelay: `${index * 100}ms`,
             }}
             onMouseEnter={(e) => {
               e.currentTarget.style.boxShadow = `0 0 50px hsla(195, 100%, 50%, 0.3)`;
               e.currentTarget.style.borderColor = 'hsla(195, 100%, 50%, 0.5)';
             }}
             onMouseLeave={(e) => {
               e.currentTarget.style.boxShadow = 'none';
               e.currentTarget.style.borderColor = 'hsla(220, 40%, 30%, 0.3)';
             }}>
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium tracking-wider" 
                style={{ color: 'hsl(220, 15%, 70%)' }}>
              {card.title}
            </h3>
            <div className={`p-2 rounded-lg ${card.pulse ? 'animate-pulse' : ''}`}
                 style={{ 
                   background: `${card.color}20`,
                   color: card.color,
                 }}>
              <card.icon size={20} className={card.sparkle ? 'animate-bounce' : ''} />
            </div>
          </div>

          <div className="mb-2">
            <span className="text-3xl font-bold tabular-nums" 
                  style={{ color: 'hsl(0, 0%, 95%)' }}>
              {card.value.toLocaleString()}
            </span>
          </div>

          <p className="text-sm" style={{ color: 'hsl(220, 15%, 70%)' }}>
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
};
