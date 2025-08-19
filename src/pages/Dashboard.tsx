
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { ProjectsTable } from '@/components/dashboard/ProjectsTable';
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{
             background: 'radial-gradient(ellipse at top right, hsl(230, 85%, 15%) 0%, hsl(230, 90%, 8%) 40%, hsl(230, 95%, 6%) 60%, hsl(230, 85%, 15%) 100%)'
           }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p style={{ color: 'hsl(220, 15%, 70%)' }}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden"
         style={{
           background: 'radial-gradient(ellipse at top right, hsl(230, 85%, 15%) 0%, hsl(230, 90%, 8%) 40%, hsl(230, 95%, 6%) 60%, hsl(230, 85%, 15%) 100%)'
         }}>
      
      {/* Animated background orbs - positioned for corners */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-right lighter glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-25 animate-pulse"
             style={{
               background: 'radial-gradient(circle, hsl(195, 100%, 50%) 0%, hsl(180, 100%, 60%) 30%, transparent 70%)',
               filter: 'blur(60px)',
               animationDuration: '4s'
             }}></div>
        
        {/* Bottom-left lighter glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-20 animate-pulse"
             style={{
               background: 'radial-gradient(circle, hsl(180, 100%, 60%) 0%, hsl(195, 100%, 50%) 30%, transparent 70%)',
               filter: 'blur(50px)',
               animationDuration: '6s',
               animationDelay: '2s'
             }}></div>

        {/* Center darker area enhancement */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full opacity-30"
             style={{
               background: 'radial-gradient(circle, transparent 0%, hsl(230, 95%, 6%) 60%, transparent 100%)',
               filter: 'blur(100px)'
             }}></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Simple Logo Header */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                   style={{ 
                     background: 'linear-gradient(135deg, hsl(195, 100%, 50%), hsl(180, 100%, 60%))',
                     boxShadow: '0 0 25px hsla(195, 100%, 50%, 0.4)'
                   }}>
                <span className="text-white font-bold text-lg">XI</span>
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'hsl(0, 0%, 95%)' }}>
                Code-XI
              </h1>
            </div>
            
            <button
              onClick={handleSignOut}
              className="text-sm px-4 py-2 rounded-lg transition-colors hover:bg-opacity-80"
              style={{ 
                color: 'hsl(220, 15%, 70%)',
                background: 'hsla(230, 30%, 18%, 0.6)',
                border: '1px solid hsla(220, 40%, 30%, 0.4)'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <main className="container mx-auto px-6 py-4 space-y-6">
          <MetricCards />
          <ChartsSection />
          <ProjectsTable />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
