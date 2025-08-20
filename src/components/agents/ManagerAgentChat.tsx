
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Send, Bot, User, Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'agent';
  sender_agent_id?: string;
  created_at: string;
  tokens_used: number;
  cost: number;
}

interface ManagerAgentChatProps {
  projectId: string;
  projectName: string;
}

const ManagerAgentChat: React.FC<ManagerAgentChatProps> = ({
  projectId,
  projectName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    fetchChatHistory();
  }, [projectId]);

  const fetchChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform database messages to match our interface
      const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_type === 'manager' ? 'agent' : msg.sender_type as 'user' | 'agent',
        sender_agent_id: msg.sender_agent_id || undefined,
        created_at: msg.created_at,
        tokens_used: msg.tokens_used || 0,
        cost: msg.cost || 0,
      }));

      setMessages(transformedMessages);
      
      // Calculate totals
      const tokens = transformedMessages.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0);
      const cost = transformedMessages.reduce((sum, msg) => sum + (msg.cost || 0), 0);
      setTotalTokens(tokens);
      setTotalCost(cost);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI immediately
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
          project_id: projectId,
          message: userMessage,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to get response from Manager Agent');
      }

      // Remove temp message and fetch updated chat history
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
      
      // Remove temp message on error
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

  return (
    <Card className="h-[800px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Manager Agent
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Supreme Orchestrator
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Project: {projectName}</span>
          <span>•</span>
          <span>Tokens: {totalTokens.toLocaleString()}</span>
          <span>•</span>
          <span>Cost: ${totalCost.toFixed(4)}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 p-4">
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
        <div className="flex gap-2">
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

        <div className="text-xs text-muted-foreground text-center">
          Manager Agent uses your project's selected LLM provider for intelligent responses.
          All conversations are stored and used for continuous learning and improvement.
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerAgentChat;
