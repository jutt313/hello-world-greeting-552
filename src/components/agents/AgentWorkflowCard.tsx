
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const workflowSteps = [
  {
    id: 1,
    agent: 'Project Manager',
    action: 'Analyzes requirements & creates project plan',
    icon: '👨‍💼',
    status: 'ready'
  },
  {
    id: 2,
    agent: 'Solutions Architect',
    action: 'Designs system architecture & tech stack',
    icon: '🏗️',
    status: 'ready'
  },
  {
    id: 3,
    agent: 'Full-Stack Engineer', 
    action: 'Generates frontend, backend & database code',
    icon: '💻',
    status: 'ready'
  },
  {
    id: 4,
    agent: 'Security Engineer',
    action: 'Performs security scans & compliance checks',
    icon: '🔒',
    status: 'ready'
  },
  {
    id: 5,
    agent: 'QA Engineer',
    action: 'Creates automated tests & quality gates',
    icon: '🧪',
    status: 'ready'
  },
  {
    id: 6,
    agent: 'Performance Engineer',
    action: 'Optimizes performance & monitoring',
    icon: '⚡',
    status: 'ready'
  },
  {
    id: 7,
    agent: 'DevOps Engineer',
    action: 'Sets up CI/CD & deploys application',
    icon: '🔧',
    status: 'ready'
  },
  {
    id: 8,
    agent: 'Documentation Specialist',
    action: 'Creates docs, API specs & user guides',
    icon: '📚',
    status: 'ready'
  }
];

export const AgentWorkflowCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Workflow Process</CardTitle>
        <CardDescription>
          How your 8-agent team collaborates to deliver complete applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <span className="text-lg">{step.icon}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{step.agent}</h4>
                  <Badge variant="outline" className="text-xs">
                    Step {step.id}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {step.action}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium text-sm">Complete Application Delivered</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Fully tested, documented, and deployed application ready for production use
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
