
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddLLMProviderModal from './AddLLMProviderModal';
import LLMProviderCard from './LLMProviderCard';

const LLMProvidersSection = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      toast({
        title: 'Error loading providers',
        description: error instanceof Error ? error.message : 'Failed to load LLM providers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalytics = (provider: any) => {
    // Generate mock analytics data - in real app, this would come from llm_usage_analytics table
    const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
    
    return {
      totalTokens: Math.floor(Math.random() * 50000) + 10000,
      totalCalls: Math.floor(Math.random() * 500) + 50,
      totalExpenses: Math.random() * 100 + 10,
      activeModel: provider.selected_models[0] || 'N/A',
      dailyUsage: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tokens: Math.floor(Math.random() * 5000) + 1000,
        cost: Math.random() * 5 + 1,
      })).reverse(),
      modelDistribution: provider.selected_models.map((model: string, index: number) => ({
        model,
        usage: Math.floor(Math.random() * 100) + 10,
        color: colors[index % colors.length],
      })),
    };
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  if (isLoading) {
    return <div>Loading LLM providers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">LLM Providers</h3>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Provider
        </Button>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">No LLM providers configured yet</p>
          <Button onClick={() => setIsModalOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Provider
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {providers.map((provider) => (
            <LLMProviderCard
              key={provider.id}
              provider={provider}
              analytics={generateMockAnalytics(provider)}
            />
          ))}
        </div>
      )}

      <AddLLMProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProviders}
      />
    </div>
  );
};

export default LLMProvidersSection;
