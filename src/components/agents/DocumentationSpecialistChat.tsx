import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDocumentationSpecialist } from '@/hooks/useDocumentationSpecialist';
import { Loader2, Send, FileText, Book, Code, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender_type: 'user' | 'agent';
  created_at: string;
}

interface DocumentationSpecialistChatProps {
  projectId: string;
}

export const DocumentationSpecialistChat: React.FC<DocumentationSpecialistChatProps> = ({
  projectId
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { 
    sendMessage, 
    createDocumentation, 
    generateAPIDocumentation,
    isLoading 
  } = useDocumentationSpecialist(projectId);

  useEffect(() => {
    loadChatHistory();
  }, [projectId]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', projectId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (data) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id.toString(),
          content: msg.content,
          sender_type: msg.sender_type === 'user' ? 'user' : 'agent',
          created_at: msg.created_at,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    const response = await sendMessage(messageContent);
    if (response?.success && response.response) {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender_type: 'agent',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, agentMessage]);
    }
  };

  const handleQuickAction = async (action: string, params?: string) => {
    let response;
    switch (action) {
      case 'api-docs':
        response = await generateAPIDocumentation(params || 'openapi');
        break;
      case 'user-guide':
        response = await createDocumentation('user-guide', params || 'getting-started');
        break;
      case 'tutorial':
        response = await createDocumentation('tutorial', params || 'basic-usage');
        break;
      default:
        response = await sendMessage(`Execute ${action} ${params || ''}`.trim());
    }

    if (response?.success && response.response) {
      const agentMessage: Message = {
        id: Date.now().toString(),
        content: response.response,
        sender_type: 'agent',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, agentMessage]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Documentation Specialist Agent</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Technical writing and knowledge management specialist
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b bg-muted/30">
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('api-docs')}
            disabled={isLoading}
          >
            <Code className="w-3 h-3 mr-1" />
            API Docs
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('user-guide')}
            disabled={isLoading}
          >
            <Book className="w-3 h-3 mr-1" />
            User Guide
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleQuickAction('tutorial')}
            disabled={isLoading}
          >
            <Users className="w-3 h-3 mr-1" />
            Tutorial
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about documentation, guides, or tutorials..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !newMessage.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
