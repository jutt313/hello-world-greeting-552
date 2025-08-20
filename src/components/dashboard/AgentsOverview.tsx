
import React from 'react';
import { AgentsSection } from '@/components/agents/AgentsSection';
import { AgentWorkflowCard } from '@/components/agents/AgentWorkflowCard';
import ManagerAgentStatus from '@/components/agents/ManagerAgentStatus';
import FullStackEngineerStatus from '@/components/agents/FullStackEngineerStatus';
import DevOpsEngineerStatus from '@/components/agents/DevOpsEngineerStatus';
import SecurityEngineerStatus from '@/components/agents/SecurityEngineerStatus';
import QAEngineerStatus from '@/components/agents/QAEngineerStatus';
import SolutionsArchitectStatus from '@/components/agents/SolutionsArchitectStatus';
import DocumentationSpecialistStatus from '@/components/agents/DocumentationSpecialistStatus';

export const AgentsOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <ManagerAgentStatus />
      <FullStackEngineerStatus />
      <DevOpsEngineerStatus />
      <SecurityEngineerStatus />
      <QAEngineerStatus />
      <SolutionsArchitectStatus />
      <DocumentationSpecialistStatus />
      <AgentsSection />
      <AgentWorkflowCard />
    </div>
  );
};
