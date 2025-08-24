
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Send, Bot, User, Loader2, Brain, Settings, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'agent';
  created_at: string;
  tokens_used: number;
  cost: number;
}

interface LLMProvider {
  id: string;
  provider_name: string;
  selected_models: string[];
  provider_config: {
    credential_name: string;
  };
}

interface DatabaseProvider {
  id: string;
  provider_name: string;
  selected_models: any;
  provider_config: any;
}

interface ManagerAgentChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ManagerAgentChatPopup: React.FC<ManagerAgentChatPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
      fetchChatHistory();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('llm_providers')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const transformedProviders: LLMProvider[] = (data as DatabaseProvider[])?.map(provider => ({
        id: provider.id,
        provider_name: provider.provider_name,
        selected_models: Array.isArray(provider.selected_models) 
          ? provider.selected_models.filter((model): model is string => typeof model === 'string')
          : [],
        provider_config: typeof provider.provider_config === 'object' && provider.provider_config !== null 
          ? provider.provider_config as { credential_name: string }
          : { credential_name: 'Unknown' }
      })) || [];

      setProviders(transformedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', 'manager-chat')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_type === 'manager' ? 'agent' : msg.sender_type as 'user' | 'agent',
        created_at: msg.created_at,
        tokens_used: msg.tokens_used || 0,
        cost: msg.cost || 0,
      }));

      setMessages(transformedMessages);
      
      const tokens = transformedMessages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0);
      const cost = transformedMessages.reduce((sum, msg) => sum + (msg.cost || 0), 0);
      setTotalTokens(tokens);
      setTotalCost(cost);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!selectedProvider || !selectedModel) {
      toast({
        title: 'LLM Selection Required',
        description: 'Please select an LLM provider and model before sending a message',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      sender_type: 'user',
      created_at: new Date().toISOString(),
      tokens_used: 0,
      cost: 0,
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/manager-agent-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'chat',
          user_id: user.user.id,
          project_id: 'manager-chat',
          message: userMessage,
          llm_provider: selectedProvider,
          model: selectedModel,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get response from Manager Agent');
      }

      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      await fetchChatHistory();

      toast({
        title: 'Manager Agent Response',
        description: `Used ${result.tokens_used} tokens (Cost: $${result.cost.toFixed(4)})`,
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFolderUpload = () => {
    toast({
      title: 'Folder Upload',
      description: 'Folder upload feature will be implemented in the next phase',
    });
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col rounded-xl">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Manager Agent Chat
              </span>
            </div>
            <Badge variant="outline" className="ml-auto">
              Supreme Orchestrator
            </Badge>
          </DialogTitle>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Tokens: {totalTokens.toLocaleString()}</span>
            <span>•</span>
            <span>Cost: ${totalCost.toFixed(4)}</span>
          </div>
        </DialogHeader>

        {/* LLM Selection */}
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <Select value={selectedProvider} onValueChange={setSelectedProvider}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select LLM Provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.provider_config.credential_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProviderData && (
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {selectedProviderData.selected_models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button onClick={handleFolderUpload} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Folder
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 text-primary/50" />
                <h3 className="font-semibold mb-2">Welcome to Manager Agent</h3>
                <p className="text-sm">
                  I'm your supreme orchestrator, ready to transform your ideas into comprehensive project plans.
                  Share your requirements, and I'll coordinate the entire development team to deliver excellence.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender_type === 'agent' && (
                  <Avatar className="w-8 h-8 border-2 border-yellow-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs">
                      <Crown className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {message.sender_type === 'agent' && (message.tokens_used > 0 || message.cost > 0) && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20 text-xs text-muted-foreground">
                      <Bot className="w-3 h-3" />
                      <span>{message.tokens_used} tokens</span>
                      <span>•</span>
                      <span>${message.cost.toFixed(4)}</span>
                    </div>
                  )}
                </div>

                {message.sender_type === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 border-2 border-yellow-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs">
                    <Crown className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Manager Agent is analyzing and orchestrating...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2 pt-4">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your project requirements or ask the Manager Agent anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2">
          Manager Agent uses your selected LLM provider for intelligent responses.
          All conversations are stored and used for continuous learning and improvement.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerAgentChatPopup;
