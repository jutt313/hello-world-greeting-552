
import React from 'react';
import { AgentsSection } from '@/components/agents/AgentsSection';
import { AgentWorkflowCard } from '@/components/agents/AgentWorkflowCard';
import ManagerAgentStatus from '@/components/agents/ManagerAgentStatus';

export const AgentsOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <ManagerAgentStatus />
      <AgentsSection />
      <AgentWorkflowCard />
    </div>
  );
};
