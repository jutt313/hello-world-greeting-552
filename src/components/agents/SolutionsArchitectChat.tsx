
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, Send, User, Bot, Loader2 } from 'lucide-react';
import { useSolutionsArchitect } from '@/hooks/useSolutionsArchitect';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'agent';
  sender_agent_id?: string;
  created_at: string;
  tokens_used?: number;
  cost?: number;
}

interface SolutionsArchitectChatProps {
  projectId: string;
}

const SolutionsArchitectChat: React.FC<SolutionsArchitectChatProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    sendMessage, 
    analyzeArchitecture, 
    designSystem, 
    evaluateTechnology, 
    createADR, 
    isLoading 
  } = useSolutionsArchitect(projectId);

  useEffect(() => {
    fetchMessages();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', projectId)
        .or('sender_agent_id.eq.solutions_architect,sender_type.eq.user')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Filter and map the messages to match our Message interface
      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_type === 'user' ? 'user' : 'agent',
        sender_agent_id: msg.sender_agent_id,
        created_at: msg.created_at,
        tokens_used: msg.tokens_used,
        cost: msg.cost,
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage;
    setInputMessage('');

    // Add user message to UI immediately
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      content: userMessage,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Send to Solutions Architect
    const response = await sendMessage(userMessage);
    
    if (response) {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender_type: 'agent',
        sender_agent_id: 'solutions_architect',
        created_at: new Date().toISOString(),
        tokens_used: response.tokens_used,
        cost: response.cost,
      };
      
      setMessages(prev => [...prev.slice(0, -1), tempUserMessage, agentMessage]);
    }
  };

  const handleQuickAction = async (action: string, prompt: string) => {
    if (isLoading) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    let response;
    switch (action) {
      case 'analyze':
        response = await analyzeArchitecture('./');
        break;
      case 'design':
        response = await designSystem('Scalable web application with microservices architecture');
        break;
      case 'evaluate':
        response = await evaluateTechnology('React, Node.js, PostgreSQL, Docker');
        break;
      case 'adr':
        response = await createADR('Microservices vs Monolithic architecture decision');
        break;
      default:
        response = await sendMessage(prompt);
    }

    if (response) {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender_type: 'agent',
        sender_agent_id: 'solutions_architect',
        created_at: new Date().toISOString(),
        tokens_used: response.tokens_used,
        cost: response.cost,
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }
  };

  if (isLoadingMessages) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading Solutions Architect chat...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            Solutions Architect Chat
          </span>
          <Badge variant="outline" className="ml-auto">
            System Design Expert
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('analyze', 'Analyze the current project architecture')}
            disabled={isLoading}
          >
            Analyze Architecture
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('design', 'Design a scalable system architecture')}
            disabled={isLoading}
          >
            Design System
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('evaluate', 'Evaluate current technology stack')}
            disabled={isLoading}
          >
            Evaluate Tech
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('adr', 'Create architectural decision record')}
            disabled={isLoading}
          >
            Create ADR
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with the Solutions Architect</p>
              <p className="text-sm mt-2">Ask about system design, architecture patterns, technology evaluation, or creating ADRs</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender_type === 'agent' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender_type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                    {message.tokens_used && (
                      <span>• {message.tokens_used} tokens</span>
                    )}
                    {message.cost && (
                      <span>• ${message.cost.toFixed(4)}</span>
                    )}
                  </div>
                </div>

                {message.sender_type === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <div className="bg-accent rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Solutions Architect is analyzing and designing...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 space-y-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about system architecture, technology evaluation, design patterns, or creating ADRs..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionsArchitectChat;
