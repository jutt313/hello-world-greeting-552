
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, TrendingUp, Zap, Share2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAgentMemory } from '@/hooks/useAgentMemory';
import AgentMemoryInsights from './AgentMemoryInsights';
import type { MemoryType, ExpertiseCategory } from '@/types/memory';

interface AgentMemoryManagerProps {
  projectId: string;
  agents: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

const AgentMemoryManager: React.FC<AgentMemoryManagerProps> = ({
  projectId,
  agents,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [memoryForm, setMemoryForm] = useState({
    memory_type: '' as MemoryType,
    context_key: '',
    context_data: '',
    relevance_score: 1.0,
    tags: '',
  });
  
  const [expertiseForm, setExpertiseForm] = useState({
    expertise_category: '' as ExpertiseCategory,
    pattern_name: '',
    pattern_description: '',
    pattern_data: '',
    conditions: '',
    prerequisites: '',
    optimization_tips: '',
  });

  const { addMemory, addExpertisePattern, refetchMemories, refetchExpertise } = useAgentMemory(projectId, selectedAgentId);
  const { toast } = useToast();

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const handleAddMemory = async () => {
    if (!selectedAgentId || !memoryForm.memory_type || !memoryForm.context_key) {
      toast({
        title: 'Missing Information',
        description: 'Please select an agent and fill in memory details',
        variant: 'destructive',
      });
      return;
    }

    try {
      const contextData = memoryForm.context_data ? JSON.parse(memoryForm.context_data) : {};
      const tags = memoryForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      await addMemory({
        agent_id: selectedAgentId,
        memory_type: memoryForm.memory_type,
        context_key: memoryForm.context_key,
        context_data: contextData,
        relevance_score: memoryForm.relevance_score,
        tags,
      });

      // Reset form
      setMemoryForm({
        memory_type: '' as MemoryType,
        context_key: '',
        context_data: '',
        relevance_score: 1.0,
        tags: '',
      });
    } catch (error) {
      toast({
        title: 'Error Adding Memory',
        description: 'Failed to parse context data. Please check JSON format.',
        variant: 'destructive',
      });
    }
  };

  const handleAddExpertise = async () => {
    if (!selectedAgentId || !expertiseForm.expertise_category || !expertiseForm.pattern_name) {
      toast({
        title: 'Missing Information',
        description: 'Please select an agent and fill in expertise details',
        variant: 'destructive',
      });
      return;
    }

    try {
      const patternData = expertiseForm.pattern_data ? JSON.parse(expertiseForm.pattern_data) : {};
      
      await addExpertisePattern({
        agent_id: selectedAgentId,
        expertise_category: expertiseForm.expertise_category,
        pattern_name: expertiseForm.pattern_name,
        pattern_description: expertiseForm.pattern_description,
        pattern_data: patternData,
        metadata: {
          conditions: expertiseForm.conditions.split(',').map(c => c.trim()).filter(Boolean),
          prerequisites: expertiseForm.prerequisites.split(',').map(p => p.trim()).filter(Boolean),
          common_errors: [],
          optimization_tips: expertiseForm.optimization_tips.split(',').map(t => t.trim()).filter(Boolean),
        },
      });

      // Reset form
      setExpertiseForm({
        expertise_category: '' as ExpertiseCategory,
        pattern_name: '',
        pattern_description: '',
        pattern_data: '',
        conditions: '',
        prerequisites: '',
        optimization_tips: '',
      });
    } catch (error) {
      toast({
        title: 'Error Adding Expertise',
        description: 'Failed to parse pattern data. Please check JSON format.',
        variant: 'destructive',
      });
    }
  };

  const optimizeMemories = async () => {
    if (!selectedAgentId) return;

    try {
      const response = await fetch(`https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/manager-agent-memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'optimize_memory',
          projectId,
          agentId: selectedAgentId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Memory Optimized',
          description: `Compressed ${result.compressed} old memories`,
        });
        refetchMemories();
      }
    } catch (error) {
      toast({
        title: 'Optimization Failed',
        description: 'Failed to optimize agent memories',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Agent Memory & Expertise Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAgent && (
            <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
              <Badge variant="outline">{selectedAgent.role}</Badge>
              <span className="font-medium">{selectedAgent.name}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={optimizeMemories}
                className="ml-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                Optimize Memory
              </Button>
            </div>
          )}

          {selectedAgentId && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Memory Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Memory
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Memory Type</Label>
                    <Select 
                      value={memoryForm.memory_type} 
                      onValueChange={(value) => setMemoryForm(prev => ({...prev, memory_type: value as MemoryType}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversation">Conversation</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="code_change">Code Change</SelectItem>
                        <SelectItem value="decision">Decision</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Context Key</Label>
                    <Input
                      placeholder="e.g., task_completion, code_pattern"
                      value={memoryForm.context_key}
                      onChange={(e) => setMemoryForm(prev => ({...prev, context_key: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Context Data (JSON)</Label>
                    <Textarea
                      placeholder='{"description": "Task details...", "outcome": "success"}'
                      value={memoryForm.context_data}
                      onChange={(e) => setMemoryForm(prev => ({...prev, context_data: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (comma separated)</Label>
                    <Input
                      placeholder="important, frontend, react"
                      value={memoryForm.tags}
                      onChange={(e) => setMemoryForm(prev => ({...prev, tags: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Relevance Score (0.0 - 1.0)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={memoryForm.relevance_score}
                      onChange={(e) => setMemoryForm(prev => ({...prev, relevance_score: parseFloat(e.target.value)}))}
                    />
                  </div>

                  <Button onClick={handleAddMemory} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Memory
                  </Button>
                </CardContent>
              </Card>

              {/* Add Expertise Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Add Expertise Pattern
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Expertise Category</Label>
                    <Select 
                      value={expertiseForm.expertise_category} 
                      onValueChange={(value) => setExpertiseForm(prev => ({...prev, expertise_category: value as ExpertiseCategory}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="database">Database</SelectItem>
                        <SelectItem value="devops">DevOps</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                        <SelectItem value="architecture">Architecture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pattern Name</Label>
                    <Input
                      placeholder="e.g., react_component_optimization"
                      value={expertiseForm.pattern_name}
                      onChange={(e) => setExpertiseForm(prev => ({...prev, pattern_name: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Describe the expertise pattern..."
                      value={expertiseForm.pattern_description}
                      onChange={(e) => setExpertiseForm(prev => ({...prev, pattern_description: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pattern Data (JSON)</Label>
                    <Textarea
                      placeholder='{"solution": "...", "steps": [...]}'
                      value={expertiseForm.pattern_data}
                      onChange={(e) => setExpertiseForm(prev => ({...prev, pattern_data: e.target.value}))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Prerequisites (comma separated)</Label>
                    <Input
                      placeholder="React knowledge, TypeScript"
                      value={expertiseForm.prerequisites}
                      onChange={(e) => setExpertiseForm(prev => ({...prev, prerequisites: e.target.value}))}
                    />
                  </div>

                  <Button onClick={handleAddExpertise} className="w-full">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Add Expertise
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Memory Insights */}
      {selectedAgentId && selectedAgent && (
        <AgentMemoryInsights
          projectId={projectId}
          agentId={selectedAgentId}
          agentName={selectedAgent.name}
        />
      )}
    </div>
  );
};

export default AgentMemoryManager;
