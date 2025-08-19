
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

type AuthMode = 'signin' | 'signup' | 'reset';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate('/dashboard');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "You have successfully signed in.",
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });
      setMode('signin');
    }
    setLoading(false);
  };

  const handleResetPassword = async (email: string) => {
    setLoading(true);
    const redirectUrl = `${window.location.origin}/auth`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Reset Link Sent!",
        description: "Check your email for the password reset link.",
      });
      setMode('signin');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
      </div>
      
      {/* Main Content */}
      <div className="auth-container">
        {/* Logo and Title */}
        <div className="auth-header">
          <h1 className="auth-logo">CodeXI</h1>
          <p className="auth-subtitle">AI-Powered Development Assistant</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {mode === 'signin' && (
            <SignInForm
              onSubmit={handleSignIn}
              onSwitchToSignUp={() => setMode('signup')}
              onSwitchToReset={() => setMode('reset')}
              loading={loading}
            />
          )}
          
          {mode === 'signup' && (
            <SignUpForm
              onSubmit={handleSignUp}
              onSwitchToSignIn={() => setMode('signin')}
              loading={loading}
            />
          )}
          
          {mode === 'reset' && (
            <ResetPasswordForm
              onSubmit={handleResetPassword}
              onBackToSignIn={() => setMode('signin')}
              loading={loading}
            />
          )}
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p>Secure authentication powered by Supabase</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
