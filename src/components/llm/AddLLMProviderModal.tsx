
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface AddLLMProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', endpoint: 'https://api.openai.com/v1' },
  { id: 'anthropic', name: 'Anthropic', endpoint: 'https://api.anthropic.com/v1' },
  { id: 'deepseek', name: 'DeepSeek', endpoint: 'https://api.deepseek.com/v1' },
  { id: 'xai', name: 'XAI', endpoint: 'https://api.x.ai/v1' },
  { id: 'gemini', name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1' },
  { id: 'cohere', name: 'Cohere', endpoint: 'https://api.cohere.ai/v1' },
  { id: 'mistral', name: 'Mistral AI', endpoint: 'https://api.mistral.ai/v1' },
];

const AddLLMProviderModal: React.FC<AddLLMProviderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    credentialName: '',
    provider: '',
    apiKey: '',
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiTestPassed, setApiTestPassed] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ credentialName: '', provider: '', apiKey: '' });
      setAvailableModels([]);
      setSelectedModels([]);
      setApiTestPassed(false);
      setTestResult('');
    }
  }, [isOpen]);

  const fetchModels = async () => {
    if (!formData.provider || !formData.apiKey) return;
    
    setIsLoadingModels(true);
    try {
      const response = await supabase.functions.invoke('fetch-llm-models', {
        body: { provider: formData.provider, apiKey: formData.apiKey }
      });
      
      if (response.error) throw new Error(response.error.message);
      setAvailableModels(response.data.models || []);
      
      toast({
        title: 'Models Loaded',
        description: `Found ${response.data.models?.length || 0} available models`,
      });
    } catch (error) {
      toast({
        title: 'Error fetching models',
        description: error instanceof Error ? error.message : 'Failed to fetch models',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const testAPIKey = async () => {
    if (!formData.provider || !formData.apiKey) return;
    
    setIsTesting(true);
    try {
      const response = await supabase.functions.invoke('test-llm-api', {
        body: { 
          provider: formData.provider, 
          apiKey: formData.apiKey,
          message: 'Hello from CodeXI! Please respond briefly to confirm this API key works.'
        }
      });
      
      if (response.error) throw new Error(response.error.message);
      
      setApiTestPassed(true);
      setTestResult(response.data.response);
      
      toast({
        title: 'API Test Successful!',
        description: 'Your API key is working correctly.',
      });
    } catch (error) {
      setApiTestPassed(false);
      setTestResult('');
      
      toast({
        title: 'API Test Failed',
        description: error instanceof Error ? error.message : 'API test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!formData.credentialName || !formData.provider || !formData.apiKey) {
      toast({
        title: 'Missing Information',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    if (!apiTestPassed) {
      toast({
        title: 'API Test Required',
        description: 'Please test your API key before saving',
        variant: 'destructive',
      });
      return;
    }

    if (selectedModels.length === 0) {
      toast({
        title: 'No Models Selected',
        description: 'Please select at least one model',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const selectedProvider = PROVIDERS.find(p => p.id === formData.provider);
      
      const { error } = await supabase
        .from('llm_providers')
        .insert({
          user_id: user.user.id,
          provider_name: formData.provider as any,
          api_key: formData.apiKey,
          selected_models: selectedModels,
          provider_config: {
            credential_name: formData.credentialName,
            endpoint: selectedProvider?.endpoint,
          },
        });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: `${formData.credentialName} has been saved successfully`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error saving provider',
        description: error instanceof Error ? error.message : 'Failed to save provider',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleModelToggle = (model: string, checked: boolean) => {
    if (checked) {
      setSelectedModels([...selectedModels, model]);
    } else {
      setSelectedModels(selectedModels.filter(m => m !== model));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Add LLM Provider</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="credentialName">Credential Name</Label>
            <Input
              id="credentialName"
              placeholder="My OpenAI Key"
              value={formData.credentialName}
              onChange={(e) => setFormData({ ...formData, credentialName: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={formData.provider} onValueChange={(value) => {
              setFormData({ ...formData, provider: value });
              setApiTestPassed(false);
              setTestResult('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={formData.apiKey}
              onChange={(e) => {
                setFormData({ ...formData, apiKey: e.target.value });
                setApiTestPassed(false);
                setTestResult('');
              }}
            />
          </div>

          {formData.provider && formData.apiKey && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  onClick={fetchModels} 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoadingModels}
                >
                  {isLoadingModels ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch Models'}
                </Button>
                <Button 
                  onClick={testAPIKey} 
                  variant="outline" 
                  size="sm"
                  disabled={isTesting}
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test API'}
                </Button>
              </div>

              {apiTestPassed && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">API test passed!</span>
                </div>
              )}

              {testResult && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">API Response:</p>
                  <p className="text-sm font-medium">{testResult}</p>
                </div>
              )}
            </div>
          )}

          {availableModels.length > 0 && (
            <div>
              <Label>Select Models</Label>
              <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
                {availableModels.map((model) => (
                  <div key={model} className="flex items-center space-x-2">
                    <Checkbox
                      id={model}
                      checked={selectedModels.includes(model)}
                      onCheckedChange={(checked) => handleModelToggle(model, !!checked)}
                    />
                    <Label htmlFor={model} className="text-sm">{model}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !apiTestPassed || selectedModels.length === 0}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Provider'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLLMProviderModal;
