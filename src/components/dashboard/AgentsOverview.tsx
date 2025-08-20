
import React from 'react';
import { AgentsSection } from '@/components/agents/AgentsSection';
import { AgentWorkflowCard } from '@/components/agents/AgentWorkflowCard';
import ManagerAgentStatus from '@/components/agents/ManagerAgentStatus';
import FullStackEngineerStatus from '@/components/agents/FullStackEngineerStatus';

export const AgentsOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <ManagerAgentStatus />
      <FullStackEngineerStatus />
      <AgentsSection />
      <AgentWorkflowCard />
    </div>
  );
};
