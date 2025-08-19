import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Settings, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AddLLMProviderModal from './AddLLMProviderModal';
import LLMProviderAnalytics from './LLMProviderAnalytics';

interface LLMProvidersPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Provider {
  id: string;
  provider_name: string;
  selected_models: string[];
  provider_config: {
    credential_name: string;
  };
  created_at: string;
}

interface DatabaseProvider {
  id: string;
  provider_name: string;
  selected_models: any;
  provider_config: any;
  created_at: string;
}

const LLMProvidersPopup: React.FC<LLMProvidersPopupProps> = ({ isOpen, onClose }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database response to match our interface
      const transformedProviders: Provider[] = (data as DatabaseProvider[])?.map(provider => ({
        id: provider.id,
        provider_name: provider.provider_name,
        selected_models: Array.isArray(provider.selected_models) ? provider.selected_models : [],
        provider_config: typeof provider.provider_config === 'object' && provider.provider_config !== null 
          ? provider.provider_config as { credential_name: string }
          : { credential_name: 'Unknown' },
        created_at: provider.created_at
      })) || [];

      setProviders(transformedProviders);
    } catch (error) {
      toast({
        title: 'Error loading providers',
        description: error instanceof Error ? error.message : 'Failed to load providers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const handleProviderClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setAnalyticsOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl min-h-[70vh] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">LLM Providers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Manage your AI model providers and API keys
              </p>
              <Button onClick={() => setAddModalOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Provider
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground mb-4">No providers configured yet</p>
                <Button onClick={() => setAddModalOpen(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Provider
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleProviderClick(provider)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium capitalize">
                          {provider.provider_config.credential_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {provider.provider_name} • {provider.selected_models.length} models
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">View Analytics</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AddLLMProviderModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          fetchProviders();
          toast({
            title: 'Provider Added',
            description: 'LLM provider has been successfully configured',
          });
        }}
      />

      {selectedProvider && (
        <LLMProviderAnalytics
          provider={selectedProvider}
          isOpen={analyticsOpen}
          onClose={() => {
            setAnalyticsOpen(false);
            setSelectedProvider(null);
          }}
        />
      )}
    </>
  );
};

export default LLMProvidersPopup;
