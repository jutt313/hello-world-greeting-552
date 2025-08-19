
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { ProjectsList } from '@/components/dashboard/ProjectsList';
import { User, Session } from '@supabase/supabase-js';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session?.user) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{
             background: 'radial-gradient(ellipse at center, hsl(230, 85%, 12%) 0%, hsl(230, 90%, 8%) 50%, hsl(230, 95%, 6%) 100%)'
           }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p style={{ color: 'hsl(220, 15%, 70%)' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
         style={{
           background: 'radial-gradient(ellipse at center, hsl(230, 85%, 12%) 0%, hsl(230, 90%, 8%) 50%, hsl(230, 95%, 6%) 100%)'
         }}>
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse"
             style={{
               background: 'radial-gradient(circle, hsl(195, 100%, 50%) 0%, transparent 70%)',
               filter: 'blur(40px)',
               animationDuration: '4s'
             }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 animate-pulse"
             style={{
               background: 'radial-gradient(circle, hsl(180, 100%, 60%) 0%, transparent 70%)',
               filter: 'blur(50px)',
               animationDuration: '6s',
               animationDelay: '2s'
             }}></div>
      </div>

      <div className="relative z-10">
        <DashboardHeader user={user} />
        
        <main className="container mx-auto px-6 py-8 space-y-8">
          <MetricCards />
          <ChartsSection />
          <ProjectsList />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
