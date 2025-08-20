
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code2, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap, 
  TestTube, 
  Bug, 
  Settings,
  FileCode,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFullStackEngineer } from '@/hooks/useFullStackEngineer';

interface FullStackEngineerChatProps {
  projectId: string;
  projectName: string;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'agent';
  action?: string;
  created_at: string;
  tokens_used: number;
  cost: number;
}

const FullStackEngineerChat: React.FC<FullStackEngineerChatProps> = ({
  projectId,
  projectName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('implement');
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const {
    implementFeature,
    optimizeCode,
    implementTests,
    debugIssue,
    coordinateWithTeam,
    isLoading
  } = useFullStackEngineer(projectId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (action: string) => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      sender_type: 'user',
      action,
      created_at: new Date().toISOString(),
      tokens_used: 0,
      cost: 0,
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      let result = null;

      switch (action) {
        case 'implement':
          result = await implementFeature(userMessage);
          break;
        case 'optimize':
          result = await optimizeCode(userMessage);
          break;
        case 'test':
          result = await implementTests(userMessage);
          break;
        case 'debug':
          result = await debugIssue(userMessage);
          break;
        case 'coordinate':
          result = await coordinateWithTeam(userMessage);
          break;
        default:
          result = await implementFeature(userMessage);
      }

      if (result) {
        // Remove temp message and add both user and agent messages
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
        
        const finalUserMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          content: userMessage,
          sender_type: 'user',
          action,
          created_at: new Date().toISOString(),
          tokens_used: 0,
          cost: 0,
        };

        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          content: result.response,
          sender_type: 'agent',
          action,
          created_at: new Date().toISOString(),
          tokens_used: result.tokens_used,
          cost: result.cost,
        };

        setMessages(prev => [...prev, finalUserMessage, agentMessage]);
        setTotalTokens(prev => prev + result.tokens_used);
        setTotalCost(prev => prev + result.cost);

        toast({
          title: 'Full-Stack Engineer Response',
          description: `${action} completed. Used ${result.tokens_used} tokens (Cost: $${result.cost.toFixed(4)})`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from Full-Stack Engineer',
        variant: 'destructive',
      });
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(activeTab);
    }
  };

  const getActionIcon = (action?: string) => {
    switch (action) {
      case 'implement': return <Code2 className="w-3 h-3" />;
      case 'optimize': return <Zap className="w-3 h-3" />;
      case 'test': return <TestTube className="w-3 h-3" />;
      case 'debug': return <Bug className="w-3 h-3" />;
      case 'coordinate': return <Settings className="w-3 h-3" />;
      default: return <Code2 className="w-3 h-3" />;
    }
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case 'implement': return 'text-blue-500';
      case 'optimize': return 'text-yellow-500';
      case 'test': return 'text-green-500';
      case 'debug': return 'text-red-500';
      case 'coordinate': return 'text-purple-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <Card className="h-[800px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              Full-Stack Engineer Agent
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Complete Development Specialist
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
        {/* Action Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="implement" className="flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              Implement
            </TabsTrigger>
            <TabsTrigger value="optimize" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-1">
              <TestTube className="w-3 h-3" />
              Test
            </TabsTrigger>
            <TabsTrigger value="debug" className="flex items-center gap-1">
              <Bug className="w-3 h-3" />
              Debug
            </TabsTrigger>
            <TabsTrigger value="coordinate" className="flex items-center gap-1">
              <Settings className="w-3 h-3" />
              Coordinate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="implement" className="mt-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Feature implementation, UI/UX development, backend APIs, database integration
            </div>
          </TabsContent>
          <TabsContent value="optimize" className="mt-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Performance optimization, code refactoring, scalability improvements
            </div>
          </TabsContent>
          <TabsContent value="test" className="mt-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Unit tests, integration tests, e2e testing, test automation
            </div>
          </TabsContent>
          <TabsContent value="debug" className="mt-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Bug fixes, error resolution, troubleshooting, code analysis
            </div>
          </TabsContent>
          <TabsContent value="coordinate" className="mt-2">
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              Team collaboration, task coordination, technical communication
            </div>
          </TabsContent>
        </Tabs>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="flex items-center justify-center mb-4">
                  <Avatar className="w-12 h-12 border-2 border-blue-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <Code2 className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h3 className="font-semibold mb-2">Full-Stack Engineer Ready</h3>
                <p className="text-sm">
                  I'm ready to help with implementation, optimization, testing, debugging, and team coordination.
                  Select an action and describe what you need!
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
                  <Avatar className="w-8 h-8 border-2 border-blue-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                      <Code2 className="w-4 h-4" />
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
                  {message.action && (
                    <div className="flex items-center gap-1 mb-1 text-xs opacity-70">
                      <span className={getActionColor(message.action)}>
                        {getActionIcon(message.action)}
                      </span>
                      {message.action.charAt(0).toUpperCase() + message.action.slice(1)}
                    </div>
                  )}
                  
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
                <Avatar className="w-8 h-8 border-2 border-blue-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs">
                    <Code2 className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Full-Stack Engineer is working on your request...
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
            placeholder={`Describe your ${activeTab} requirements...`}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={() => sendMessage(activeTab)} 
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
          Full-Stack Engineer specializes in complete application development across all technology stacks.
          Coordinated through Manager Agent for optimal team collaboration.
        </div>
      </CardContent>
    </Card>
  );
};

export default FullStackEngineerChat;
