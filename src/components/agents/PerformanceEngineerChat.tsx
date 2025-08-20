
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Zap, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Activity,
  Target,
  TrendingUp,
  Monitor,
  Database,
  Cpu,
  BarChart3,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceEngineer } from '@/hooks/usePerformanceEngineer';
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

interface PerformanceEngineerChatProps {
  projectId: string;
  projectName: string;
}

const PerformanceEngineerChat: React.FC<PerformanceEngineerChatProps> = ({
  projectId,
  projectName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const {
    conductLoadTesting,
    optimizePerformance,
    setupMonitoring,
    planCapacity,
    designCaching,
    analyzeBottlenecks,
    optimizeFrontend,
    optimizeDatabase,
    profileApplication,
    sendMessage,
    isLoading,
  } = usePerformanceEngineer(projectId);

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
        .or('sender_agent_id.eq.performance_engineer,sender_type.eq.user')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_agent_id === 'performance_engineer' ? 'agent' : msg.sender_type as 'user' | 'agent',
        sender_agent_id: msg.sender_agent_id || undefined,
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
      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    try {
      const result = await sendMessage(userMessage);
      if (result) {
        await fetchChatHistory();
        toast({
          title: 'Performance Engineer Response',
          description: `Used ${result.tokens_used} tokens (Cost: $${result.cost.toFixed(4)})`,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleQuickAction = async (action: string, description: string) => {
    try {
      let result = null;
      
      switch (action) {
        case 'load_testing':
          result = await conductLoadTesting(description);
          break;
        case 'performance_optimization':
          result = await optimizePerformance('application', description);
          break;
        case 'monitoring_setup':
          result = await setupMonitoring(description);
          break;
        case 'capacity_planning':
          result = await planCapacity(description);
          break;
        case 'caching_strategy':
          result = await designCaching(description);
          break;
        case 'bottleneck_analysis':
          result = await analyzeBottlenecks(description);
          break;
        case 'frontend_optimization':
          result = await optimizeFrontend(description);
          break;
        case 'database_optimization':
          result = await optimizeDatabase(description);
          break;
        case 'application_profiling':
          result = await profileApplication(description);
          break;
      }

      if (result) {
        await fetchChatHistory();
        toast({
          title: 'Performance Task Completed',
          description: `${action.replace(/_/g, ' ')} completed successfully`,
        });
      }
    } catch (error) {
      console.error('Error executing quick action:', error);
      toast({
        title: 'Error',
        description: `Failed to execute ${action.replace(/_/g, ' ')}`,
        variant: 'destructive',
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      action: 'load_testing',
      label: 'Load Testing',
      icon: <Target className="w-4 h-4" />,
      description: 'Comprehensive load testing analysis with Apache JMeter, k6, or Artillery',
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    },
    {
      action: 'performance_optimization',
      label: 'Optimize Performance',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Analyze and optimize application performance across all layers',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      action: 'monitoring_setup',
      label: 'Setup Monitoring',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Design comprehensive monitoring and observability systems',
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      action: 'caching_strategy',
      label: 'Caching Strategy',
      icon: <Database className="w-4 h-4" />,
      description: 'Design multi-level caching architecture for optimal performance',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    {
      action: 'bottleneck_analysis',
      label: 'Analyze Bottlenecks',
      icon: <Cpu className="w-4 h-4" />,
      description: 'Identify and resolve performance bottlenecks',
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    },
    {
      action: 'capacity_planning',
      label: 'Capacity Planning',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Growth projections and scaling strategies',
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
    }
  ];

  return (
    <Card className="h-[800px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Performance Engineer
            </span>
          </div>
          <Badge variant="outline" className="ml-auto">
            Optimization Specialist
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
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              className={`${action.color} border-current`}
              onClick={() => handleQuickAction(action.action, action.description)}
              disabled={isLoading}
            >
              {action.icon}
              <span className="ml-1 text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 text-orange-300" />
                <h3 className="font-semibold mb-2">Welcome to Performance Engineer</h3>
                <p className="text-sm mb-4">
                  I'm your performance optimization specialist, ready to analyze, monitor, and optimize 
                  your application's performance across all layers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left max-w-md mx-auto">
                  <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="font-medium text-sm">Load Testing</span>
                    </div>
                    <p className="text-xs text-orange-700">
                      Comprehensive testing with JMeter, k6, Artillery
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">Optimization</span>
                    </div>
                    <p className="text-xs text-blue-700">
                      Frontend, backend, and database performance
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">Monitoring</span>
                    </div>
                    <p className="text-xs text-green-700">
                      APM, custom dashboards, alerting
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-sm">Caching</span>
                    </div>
                    <p className="text-xs text-purple-700">
                      Multi-level caching architecture
                    </p>
                  </div>
                </div>
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
                  <Avatar className="w-8 h-8 border-2 border-orange-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs">
                      <Zap className="w-4 h-4" />
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
                <Avatar className="w-8 h-8 border-2 border-orange-500/20">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs">
                    <Zap className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Performance Engineer is analyzing and optimizing...
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
            placeholder="Describe performance issues or optimization requirements..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
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
          Performance Engineer provides comprehensive performance analysis, optimization strategies, 
          and monitoring solutions using industry-leading tools and best practices.
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceEngineerChat;
