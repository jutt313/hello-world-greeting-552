
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEngineerResponse {
  success: boolean;
  response: string;
  tokens_used: number;
  cost: number;
  agent_id: string;
  action_performed: string;
}

export const useSecurityEngineer = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const performSecurityAssessment = async (scope: string = 'comprehensive'): Promise<SecurityEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/security-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'security_assessment',
          user_id: user.user.id,
          project_id: projectId,
          security_scope: scope,
          message: `Perform comprehensive security assessment with scope: ${scope}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to perform security assessment');
      }

      return result;
    } catch (error) {
      console.error('Error performing security assessment:', error);
      toast({
        title: 'Security Assessment Error',
        description: error instanceof Error ? error.message : 'Failed to perform security assessment',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const performVulnerabilityScan = async (filePaths?: string[]): Promise<SecurityEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/security-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'vulnerability_scan',
          user_id: user.user.id,
          project_id: projectId,
          file_paths: filePaths,
          message: `Perform vulnerability scan${filePaths ? ` on files: ${filePaths.join(', ')}` : ' on entire project'}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to perform vulnerability scan');
      }

      return result;
    } catch (error) {
      console.error('Error performing vulnerability scan:', error);
      toast({
        title: 'Vulnerability Scan Error',
        description: error instanceof Error ? error.message : 'Failed to perform vulnerability scan',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const performComplianceCheck = async (frameworks: string[]): Promise<SecurityEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/security-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'compliance_check',
          user_id: user.user.id,
          project_id: projectId,
          compliance_frameworks: frameworks,
          message: `Perform compliance check against frameworks: ${frameworks.join(', ')}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to perform compliance check');
      }

      return result;
    } catch (error) {
      console.error('Error performing compliance check:', error);
      toast({
        title: 'Compliance Check Error',
        description: error instanceof Error ? error.message : 'Failed to perform compliance check',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const performThreatModeling = async (scope: string = 'application'): Promise<SecurityEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/security-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'threat_modeling',
          user_id: user.user.id,
          project_id: projectId,
          security_scope: scope,
          message: `Perform threat modeling analysis for scope: ${scope}`,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to perform threat modeling');
      }

      return result;
    } catch (error) {
      console.error('Error performing threat modeling:', error);
      toast({
        title: 'Threat Modeling Error',
        description: error instanceof Error ? error.message : 'Failed to perform threat modeling',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToSecurityEngineer = async (message: string): Promise<SecurityEngineerResponse | null> => {
    setIsLoading(true);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('https://akoclehzeocqlgmmbkza.supabase.co/functions/v1/security-engineer-execution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrb2NsZWh6ZW9jcWxnbW1ia3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjQxMDEsImV4cCI6MjA3MTEwMDEwMX0.XzDI8r_JkwUADi8pcev3irYSMWlCWEKkC0w5UWNX5zk`,
        },
        body: JSON.stringify({
          action: 'chat',
          user_id: user.user.id,
          project_id: projectId,
          message: message,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to communicate with Security Engineer');
      }

      return result;
    } catch (error) {
      console.error('Error communicating with Security Engineer:', error);
      toast({
        title: 'Communication Error',
        description: error instanceof Error ? error.message : 'Failed to communicate with Security Engineer',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    performSecurityAssessment,
    performVulnerabilityScan,
    performComplianceCheck,
    performThreatModeling,
    sendMessageToSecurityEngineer,
    isLoading,
  };
};
