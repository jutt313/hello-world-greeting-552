
import React from 'react';
import { AgentsSection } from '@/components/agents/AgentsSection';
import { AgentWorkflowCard } from '@/components/agents/AgentWorkflowCard';
import ManagerAgentStatus from '@/components/agents/ManagerAgentStatus';
import FullStackEngineerStatus from '@/components/agents/FullStackEngineerStatus';
import DevOpsEngineerStatus from '@/components/agents/DevOpsEngineerStatus';

export const AgentsOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <ManagerAgentStatus />
      <FullStackEngineerStatus />
      <DevOpsEngineerStatus />
      <AgentsSection />
      <AgentWorkflowCard />
    </div>
  );
};
