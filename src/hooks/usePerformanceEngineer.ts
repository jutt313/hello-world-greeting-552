
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PerformanceEngineerResponse {
  success: boolean;
  response: string;
  action_taken: string;
  performance_metrics: {
    optimization_type: string;
    impact_level: string;
    resource_usage: string;
  };
  tokens_used: number;
  cost: number;
  agent_id: string;
}

export const usePerformanceEngineer = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const executePerformanceTask = async (
    action: string,
    message: string,
    performanceTask?: string
  ): Promise<PerformanceEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/performance-engineer-execution', {
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
          performance_task: performanceTask,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to execute performance task');
      }

      return result;
    } catch (error) {
      console.error('Error executing performance task:', error);
      toast({
        title: 'Performance Task Error',
        description: error instanceof Error ? error.message : 'Failed to execute performance task',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const conductLoadTesting = async (requirements: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'load_testing',
      `Conduct comprehensive load testing analysis: ${requirements}`,
      'load_testing'
    );
  };

  const optimizePerformance = async (area: string, details: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'performance_optimization',
      `Optimize ${area} performance: ${details}`,
      'optimization'
    );
  };

  const setupMonitoring = async (requirements: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'monitoring_setup',
      `Set up monitoring and observability: ${requirements}`,
      'monitoring'
    );
  };

  const planCapacity = async (projections: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'capacity_planning',
      `Perform capacity planning analysis: ${projections}`,
      'capacity_planning'
    );
  };

  const designCaching = async (requirements: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'caching_strategy',
      `Design caching strategy: ${requirements}`,
      'caching'
    );
  };

  const analyzeBottlenecks = async (description: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'bottleneck_analysis',
      `Analyze performance bottlenecks: ${description}`,
      'analysis'
    );
  };

  const optimizeFrontend = async (requirements: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'frontend_optimization',
      `Optimize frontend performance and Core Web Vitals: ${requirements}`,
      'frontend'
    );
  };

  const optimizeDatabase = async (requirements: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'database_optimization',
      `Optimize database performance: ${requirements}`,
      'database'
    );
  };

  const profileApplication = async (requirements: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask(
      'application_profiling',
      `Profile application performance: ${requirements}`,
      'profiling'
    );
  };

  const sendMessage = async (message: string): Promise<PerformanceEngineerResponse | null> => {
    return executePerformanceTask('chat', message);
  };

  return {
    conductLoadTesting,
    optimizePerformance,
    setupMonitoring,
    planCapacity,
    designCaching,
    analyzeBottlenecks,
    optimizeFrontend,
    optimizeDatabase,
    profileApplication,
    sendMessage,
    isLoading,
  };
};
