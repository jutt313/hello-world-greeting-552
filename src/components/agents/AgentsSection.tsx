
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  is_active: boolean;
  permissions: any;
}

export const AgentsSection: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('name');

      if (error) throw error;
      setAgents(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const iconMap: Record<string, string> = {
      'project_manager': '👨‍💼',
      'full_stack_engineer': '💻',
      'devops_infrastructure': '🔧',
      'security_engineer': '🔒',
      'qa_engineer': '🧪',
      'solutions_architect': '🏗️',
      'documentation_specialist': '📚',
      'performance_engineer': '⚡'
    };
    return iconMap[role] || '🤖';
  };

  const formatRoleName = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            AI Agent Team
          </CardTitle>
          <CardDescription>Loading your specialized AI agents...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
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
          <Users className="w-5 h-5" />
          AI Agent Team
          <Badge variant="outline" className="ml-auto">
            {agents.filter(a => a.is_active).length} Active
          </Badge>
        </CardTitle>
        <CardDescription>
          Your specialized 8-agent team ready to build, test, and deploy applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">{getRoleIcon(agent.role)}</div>
                {agent.is_active ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
              </div>
              
              <h3 className="font-semibold text-sm mb-1">{agent.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {agent.description}
              </p>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {formatRoleName(agent.role)}
                </Badge>
                <Activity className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
