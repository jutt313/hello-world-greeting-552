
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, TrendingUp, Clock, Tag, Lightbulb, Target } from 'lucide-react';
import { useAgentMemory } from '@/hooks/useAgentMemory';
import type { AgentMemoryContext, AgentExpertisePattern } from '@/types/memory';

interface AgentMemoryInsightsProps {
  projectId: string;
  agentId: string;
  agentName: string;
}

const AgentMemoryInsights: React.FC<AgentMemoryInsightsProps> = ({
  projectId,
  agentId,
  agentName,
}) => {
  const { memories, expertisePatterns, isLoading, updateMemoryAccess } = useAgentMemory(projectId, agentId);
  const [selectedMemory, setSelectedMemory] = useState<AgentMemoryContext | null>(null);

  const handleMemoryClick = async (memory: AgentMemoryContext) => {
    setSelectedMemory(memory);
    await updateMemoryAccess(memory.id);
  };

  const getMemoryTypeColor = (type: string) => {
    const colors = {
      conversation: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      task: 'bg-green-500/10 text-green-400 border-green-500/20',
      code_change: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      decision: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      learning: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  const getExpertiseColor = (category: string) => {
    const colors = {
      frontend: 'bg-blue-500/10 text-blue-400',
      backend: 'bg-green-500/10 text-green-400',
      database: 'bg-purple-500/10 text-purple-400',
      devops: 'bg-orange-500/10 text-orange-400',
      testing: 'bg-cyan-500/10 text-cyan-400',
      security: 'bg-red-500/10 text-red-400',
      performance: 'bg-yellow-500/10 text-yellow-400',
      architecture: 'bg-indigo-500/10 text-indigo-400',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/10 text-gray-400';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Agent Memory - Loading...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          {agentName} Memory & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="memories" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="memories">
              Memories ({memories.length})
            </TabsTrigger>
            <TabsTrigger value="expertise">
              Expertise ({expertisePatterns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memories" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => handleMemoryClick(memory)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getMemoryTypeColor(memory.memory_type)}>
                        {memory.memory_type}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(memory.last_accessed_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-1">{memory.context_key}</h4>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.floor(memory.relevance_score * 5) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Relevance: {Math.round(memory.relevance_score * 100)}%
                      </span>
                    </div>

                    {memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {memory.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {memories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No memories recorded yet</p>
                    <p className="text-sm">Agent will start learning from interactions</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="expertise" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {expertisePatterns.map((pattern) => (
                  <div key={pattern.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getExpertiseColor(pattern.expertise_category)}>
                        {pattern.expertise_category}
                      </Badge>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {Math.round(pattern.success_rate)}% success
                        </div>
                        <div className="flex items-center">
                          <Target className="w-3 h-3 mr-1" />
                          Used {pattern.usage_count} times
                        </div>
                      </div>
                    </div>
                    
                    <h4 className="font-medium mb-1">{pattern.pattern_name}</h4>
                    {pattern.pattern_description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.pattern_description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex -space-x-1">
                        {Array.from({ length: Math.floor(pattern.effectiveness_score * 5) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-green-400 rounded-full" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Effectiveness: {Math.round(pattern.effectiveness_score * 100)}%
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Applied to {pattern.projects_applied.length} projects
                    </div>
                  </div>
                ))}

                {expertisePatterns.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No expertise patterns learned yet</p>
                    <p className="text-sm">Agent will develop expertise through experience</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentMemoryInsights;
