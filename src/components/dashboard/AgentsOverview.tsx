
import React from 'react';
import { AgentsSection } from '@/components/agents/AgentsSection';
import { AgentWorkflowCard } from '@/components/agents/AgentWorkflowCard';

export const AgentsOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <AgentsSection />
      <AgentWorkflowCard />
    </div>
  );
};
