
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if this is a CLI authentication request
  const isCLIAuth = searchParams.get('cli') === 'true';
  const cliRedirectUrl = searchParams.get('redirect');

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Handle CLI authentication
          if (isCLIAuth && cliRedirectUrl) {
            try {
              // Generate CLI token for authenticated user
              const { data, error } = await supabase.functions.invoke('cli-auth-token', {
                body: { 
                  userId: session.user.id,
                  session: session
                }
              });

              if (error) throw error;

              // Redirect to CLI with the token
              const redirectUrl = `${cliRedirectUrl}?token=${encodeURIComponent(data.token)}`;
              window.location.href = redirectUrl;
              return;
            } catch (error) {
              console.error('CLI token generation failed:', error);
              const redirectUrl = `${cliRedirectUrl}?error=${encodeURIComponent('Token generation failed')}`;
              window.location.href = redirectUrl;
              return;
            }
          } else {
            // Normal web authentication - redirect to dashboard
            navigate('/dashboard');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Handle CLI authentication for existing session
        if (isCLIAuth && cliRedirectUrl) {
          // Generate CLI token and redirect (same logic as above)
          supabase.functions.invoke('cli-auth-token', {
            body: { 
              userId: session.user.id,
              session: session
            }
          }).then(({ data, error }) => {
            if (error) {
              const redirectUrl = `${cliRedirectUrl}?error=${encodeURIComponent('Token generation failed')}`;
              window.location.href = redirectUrl;
            } else {
              const redirectUrl = `${cliRedirectUrl}?token=${encodeURIComponent(data.token)}`;
              window.location.href = redirectUrl;
            }
          });
          return;
        } else {
          navigate('/dashboard');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isCLIAuth, cliRedirectUrl]);

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
      if (!isCLIAuth) {
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in.",
        });
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const redirectUrl = isCLIAuth && cliRedirectUrl 
      ? `${window.location.origin}/auth?cli=true&redirect=${encodeURIComponent(cliRedirectUrl)}`
      : `${window.location.origin}/`;
    
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
    const redirectUrl = isCLIAuth && cliRedirectUrl 
      ? `${window.location.origin}/auth?cli=true&redirect=${encodeURIComponent(cliRedirectUrl)}`
      : `${window.location.origin}/auth`;
    
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
          <h1 className="auth-logo">Code-XI</h1>
          <p className="auth-subtitle">
            {isCLIAuth ? 'CLI Authentication' : 'AI-Powered Development Assistant'}
          </p>
          {isCLIAuth && (
            <p className="text-sm text-muted-foreground mt-2">
              Please sign in to authenticate your CLI tool
            </p>
          )}
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
