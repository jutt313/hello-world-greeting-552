
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Key, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function LLMProviders() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    provider_name: '',
    api_key: '',
    rate_limit_per_minute: '60',
    cost_per_1k_tokens: '0.002'
  });

  const { data: providers } = useQuery({
    queryKey: ['llm-providers', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const addProviderMutation = useMutation({
    mutationFn: async (providerData: typeof formData) => {
      const { data, error } = await supabase
        .from('llm_providers')
        .insert({
          user_id: user?.id,
          provider_name: providerData.provider_name as any,
          api_key: providerData.api_key,
          rate_limit_per_minute: parseInt(providerData.rate_limit_per_minute),
          cost_per_1k_tokens: parseFloat(providerData.cost_per_1k_tokens)
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-providers'] });
      setIsAdding(false);
      setFormData({
        provider_name: '',
        api_key: '',
        rate_limit_per_minute: '60',
        cost_per_1k_tokens: '0.002'
      });
      toast({
        title: "Provider Added",
        description: "LLM provider has been configured successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add LLM provider. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from('llm_providers')
        .delete()
        .eq('id', providerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-providers'] });
      toast({
        title: "Provider Removed",
        description: "LLM provider has been removed successfully.",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProviderMutation.mutate(formData);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'cohere': return '💬';
      default: return '🤖';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">LLM Providers</h2>
        <Button 
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {isAdding && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Add New LLM Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select
                    value={formData.provider_name}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, provider_name: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google AI</SelectItem>
                      <SelectItem value="cohere">Cohere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="password"
                    placeholder="sk-..."
                    value={formData.api_key}
                    onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={formData.rate_limit_per_minute}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate_limit_per_minute: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Cost per 1K tokens</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.001"
                    value={formData.cost_per_1k_tokens}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_per_1k_tokens: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={addProviderMutation.isPending}
                >
                  Add Provider
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers?.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No LLM Providers</h3>
              <p className="text-muted-foreground text-center mb-6">
                Add your first LLM provider to start using Code-XI agents. Configure OpenAI, Anthropic, or other providers.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Provider
              </Button>
            </CardContent>
          </Card>
        ) : (
          providers?.map((provider) => (
            <Card key={provider.id} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getProviderIcon(provider.provider_name)}</span>
                    <div>
                      <CardTitle className="capitalize">{provider.provider_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {provider.rate_limit_per_minute} calls/min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={provider.is_active ? 'default' : 'secondary'}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteProviderMutation.mutate(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p>Cost: ${provider.cost_per_1k_tokens}/1K tokens</p>
                  <p>Added: {new Date(provider.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
