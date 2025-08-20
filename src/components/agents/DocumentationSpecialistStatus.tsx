
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Book, 
  Code, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

export const DocumentationSpecialistStatus: React.FC = () => {
  // Mock data - in real implementation, this would come from API
  const agentStatus = {
    status: 'active' as const,
    currentTask: 'Generating API documentation for user authentication endpoints',
    completedTasks: 147,
    efficiency: 92,
    lastActive: '2 minutes ago',
    capabilities: [
      'API Documentation',
      'User Guides',
      'Technical Tutorials',
      'Code Documentation',
      'Knowledge Management'
    ],
    recentActivities: [
      {
        id: '1',
        type: 'api_documentation',
        description: 'Generated OpenAPI specification for authentication API',
        timestamp: '5 minutes ago',
        status: 'completed'
      },
      {
        id: '2', 
        type: 'user_guide',
        description: 'Created getting started guide with screenshots',
        timestamp: '15 minutes ago',
        status: 'completed'
      },
      {
        id: '3',
        type: 'tutorial',
        description: 'Writing interactive tutorial for new users',
        timestamp: '1 hour ago', 
        status: 'in_progress'
      }
    ],
    metrics: {
      documentationGenerated: 89,
      averageQualityScore: 94,
      userSatisfaction: 87,
      maintenanceEfficiency: 91
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'api_documentation': return <Code className="w-4 h-4" />;
      case 'user_guide': return <Book className="w-4 h-4" />;
      case 'tutorial': return <Users className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Agent Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Documentation Specialist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(agentStatus.status)}`} />
            <span className="text-sm font-medium capitalize">{agentStatus.status}</span>
            <Badge variant="secondary" className="ml-auto">
              {agentStatus.completedTasks} completed
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Efficiency</span>
              <span>{agentStatus.efficiency}%</span>
            </div>
            <Progress value={agentStatus.efficiency} className="h-2" />
          </div>

          <div className="text-sm text-muted-foreground">
            <Clock className="w-4 h-4 inline mr-1" />
            Last active: {agentStatus.lastActive}
          </div>
        </CardContent>
      </Card>

      {/* Current Task */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm">{agentStatus.currentTask}</p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="font-medium">{agentStatus.metrics.documentationGenerated}</div>
              <div className="text-muted-foreground text-xs">Docs Generated</div>
            </div>
            <div>
              <div className="font-medium">{agentStatus.metrics.averageQualityScore}%</div>
              <div className="text-muted-foreground text-xs">Quality Score</div>
            </div>
            <div>
              <div className="font-medium">{agentStatus.metrics.userSatisfaction}%</div>
              <div className="text-muted-foreground text-xs">User Satisfaction</div>
            </div>
            <div>
              <div className="font-medium">{agentStatus.metrics.maintenanceEfficiency}%</div>
              <div className="text-muted-foreground text-xs">Maintenance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capabilities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Core Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {agentStatus.capabilities.map((capability, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {capability}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agentStatus.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg border">
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationSpecialistStatus;
