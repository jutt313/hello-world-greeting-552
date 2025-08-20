
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Send, User, Bot, Loader2, AlertTriangle, CheckCircle, Eye, FileText } from 'lucide-react';
import { useSecurityEngineer } from '@/hooks/useSecurityEngineer';
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

interface SecurityEngineerChatProps {
  projectId: string;
}

export const SecurityEngineerChat: React.FC<SecurityEngineerChatProps> = ({ projectId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    sendMessageToSecurityEngineer,
    performSecurityAssessment,
    performVulnerabilityScan,
    performComplianceCheck,
    performThreatModeling,
    isLoading
  } = useSecurityEngineer(projectId);

  useEffect(() => {
    fetchMessages();
  }, [projectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', projectId)
        .or('sender_agent_id.eq.security_engineer,sender_agent_id.eq.manager_supreme,sender_type.eq.user')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_agent_id === 'security_engineer' ? 'agent' : msg.sender_type as 'user' | 'agent',
        sender_agent_id: msg.sender_agent_id || undefined,
        created_at: msg.created_at,
        tokens_used: msg.tokens_used || 0,
        cost: msg.cost || 0,
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const message = newMessage.trim();
    setNewMessage('');

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      sender_type: 'user',
      created_at: new Date().toISOString(),
      tokens_used: 0,
      cost: 0,
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to Security Engineer
    const response = await sendMessageToSecurityEngineer(message);
    
    if (response) {
      // Refresh messages to get the actual stored messages
      await fetchMessages();
    }
  };

  const handleQuickAction = async (action: string) => {
    let response;
    
    switch (action) {
      case 'security_assessment':
        response = await performSecurityAssessment('comprehensive');
        break;
      case 'vulnerability_scan':
        response = await performVulnerabilityScan();
        break;
      case 'compliance_check':
        response = await performComplianceCheck(['OWASP', 'NIST']);
        break;
      case 'threat_modeling':
        response = await performThreatModeling('application');
        break;
    }
    
    if (response) {
      await fetchMessages();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoadingMessages) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading Security Engineer chat...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            Security Engineer Chat
          </span>
          <Badge variant="outline" className="ml-auto">
            Cybersecurity Specialist
          </Badge>
        </CardTitle>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('security_assessment')}
            disabled={isLoading}
            className="text-xs"
          >
            <Shield className="w-3 h-3 mr-1" />
            Security Assessment
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('vulnerability_scan')}
            disabled={isLoading}
            className="text-xs"
          >
            <AlertTriangle className="w-3 h-3 mr-1" />
            Vulnerability Scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('compliance_check')}
            disabled={isLoading}
            className="text-xs"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Compliance Check
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('threat_modeling')}
            disabled={isLoading}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Threat Modeling
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the Security Engineer</p>
                <p className="text-sm">Ask about security assessments, vulnerabilities, or compliance</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.sender_type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {message.sender_type === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender_type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                        <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                        {message.tokens_used > 0 && (
                          <span>• {message.tokens_used} tokens • ${message.cost.toFixed(4)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-4 border-t">
          <Textarea
            placeholder="Ask about security assessments, vulnerabilities, compliance..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-2 text-center">
          Security Engineer specializes in cybersecurity, compliance, and risk management
        </div>
      </CardContent>
    </Card>
  );
};
