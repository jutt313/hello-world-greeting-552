
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DevOpsEngineerResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
  action: string;
}

interface InfrastructureRequirements {
  compute_requirements: string;
  storage_requirements: string;
  network_requirements: string;
  security_requirements: string;
  scalability_requirements: string;
  compliance_requirements: string[];
  budget_constraints: string;
  timeline: string;
}

interface DeploymentConfig {
  environment: string;
  deployment_strategy: string;
  infrastructure_type: string;
  automation_level: string;
  monitoring_requirements: string;
  rollback_strategy: string;
  health_checks: string[];
}

interface MonitoringSetup {
  metrics_collection: string[];
  alerting_rules: string[];
  dashboard_requirements: string;
  log_aggregation: string;
  performance_monitoring: string;
  compliance_monitoring: string;
}

export const useDevOpsEngineer = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executeTask = async (
    action: 'plan_infrastructure' | 'deploy' | 'monitor' | 'optimize' | 'secure' | 'scale',
    message: string,
    infrastructureRequirements?: InfrastructureRequirements,
    deploymentConfig?: DeploymentConfig,
    monitoringSetup?: MonitoringSetup
  ): Promise<DevOpsEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/devops-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action,
          user_id: user.user.id,
          project_id: projectId,
          message,
          infrastructure_requirements: infrastructureRequirements,
          deployment_config: deploymentConfig,
          monitoring_setup: monitoringSetup,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to execute DevOps Engineer task');
      }

      return result;
    } catch (error) {
      console.error('Error communicating with DevOps Engineer:', error);
      toast({
        title: 'DevOps Engineer Error',
        description: error instanceof Error ? error.message : 'Failed to execute task',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const planInfrastructure = async (
    message: string,
    requirements?: InfrastructureRequirements
  ): Promise<DevOpsEngineerResponse | null> => {
    return executeTask('plan_infrastructure', message, requirements);
  };

  const deployInfrastructure = async (
    message: string,
    deploymentConfig?: DeploymentConfig
  ): Promise<DevOpsEngineerResponse | null> => {
    return executeTask('deploy', message, undefined, deploymentConfig);
  };

  const setupMonitoring = async (
    message: string,
    monitoringSetup?: MonitoringSetup
  ): Promise<DevOpsEngineerResponse | null> => {
    return executeTask('monitor', message, undefined, undefined, monitoringSetup);
  };

  const optimizeInfrastructure = async (
    message: string
  ): Promise<DevOpsEngineerResponse | null> => {
    return executeTask('optimize', message);
  };

  const secureInfrastructure = async (
    message: string
  ): Promise<DevOpsEngineerResponse | null> => {
    return executeTask('secure', message);
  };

  const scaleInfrastructure = async (
    message: string
  ): Promise<DevOpsEngineerResponse | null> => {
    return executeTask('scale', message);
  };

  return {
    executeTask,
    planInfrastructure,
    deployInfrastructure,
    setupMonitoring,
    optimizeInfrastructure,
    secureInfrastructure,
    scaleInfrastructure,
    isLoading,
  };
};
