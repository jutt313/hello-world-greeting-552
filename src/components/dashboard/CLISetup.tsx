
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Terminal, Key, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function CLISetup() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newTokenName, setNewTokenName] = useState('');

  const { data: tokens } = useQuery({
    queryKey: ['cli-tokens', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cli_tokens')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const createTokenMutation = useMutation({
    mutationFn: async (sessionType: 'temporary' | 'long_lived') => {
      // Generate a random token
      const token = `cxi_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const tokenHash = btoa(token); // Simple encoding, in production use proper hashing
      
      const expiresAt = sessionType === 'temporary' 
        ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        : null; // No expiration for long-lived

      const { data, error } = await supabase
        .from('cli_tokens')
        .insert({
          user_id: user?.id,
          token_hash: tokenHash,
          session_type: sessionType,
          expires_at: expiresAt?.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, token }; // Return the plain token for display
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cli-tokens'] });
      toast({
        title: "CLI Token Created",
        description: "Your new CLI token has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create CLI token. Please try again.",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Command copied to clipboard",
    });
  };

  const cliInstallCommand = `npm install -g @code-xi/cli`;
  const cliAuthCommand = `code-xi auth --token YOUR_TOKEN_HERE`;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">CLI Setup</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installation Instructions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Terminal className="h-5 w-5 mr-2" />
              Installation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">1. Install the Code-XI CLI globally:</p>
              <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg">
                <code className="flex-1 text-sm font-mono">{cliInstallCommand}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(cliInstallCommand)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">2. Authenticate with your token:</p>
              <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg">
                <code className="flex-1 text-sm font-mono">{cliAuthCommand}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(cliAuthCommand)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">3. Start working with projects:</p>
              <div className="bg-muted/50 p-3 rounded-lg">
                <code className="text-sm font-mono text-foreground">
                  code-xi create my-project<br/>
                  code-xi chat "Help me build a React app"
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Token Management */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Key className="h-5 w-5 mr-2" />
              CLI Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={() => createTokenMutation.mutate('temporary')}
                disabled={createTokenMutation.isPending}
                className="flex-1"
              >
                Generate 24h Token
              </Button>
              <Button
                onClick={() => createTokenMutation.mutate('long_lived')}
                disabled={createTokenMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                Generate Persistent Token
              </Button>
            </div>

            <div className="space-y-3">
              {tokens?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No CLI tokens created yet. Generate one to get started.
                </p>
              ) : (
                tokens?.map((token) => (
                  <div key={token.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div>
                        <Badge variant={token.session_type === 'temporary' ? 'secondary' : 'default'}>
                          {token.session_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(token.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {token.is_active ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400">
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/20 text-gray-400">
                          Expired
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
