
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config/config';
import chalk from 'chalk';

export class SupabaseService {
  private client;

  constructor() {
    this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }

  async authenticate(token: string) {
    try {
      const { data, error } = await this.client.auth.setSession({
        access_token: token,
        refresh_token: '',
      });

      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error(chalk.red('❌ Authentication failed:'), error);
      throw error;
    }
  }

  async executeAgentCommand(agentRole: string, command: string, parameters: any = {}) {
    try {
      const { data: user } = await this.client.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated. Please run "codexi auth" first.');
      }

      const { data, error } = await this.client.functions.invoke(`${agentRole}-execution`, {
        body: {
          command,
          parameters,
          userId: user.user.id,
          projectId: parameters.projectId || 'cli-project'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(chalk.red(`❌ Agent command failed:`), error);
      throw error;
    }
  }

  async getAgents() {
    try {
      const { data, error } = await this.client
        .from('agents')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(chalk.red('❌ Failed to fetch agents:'), error);
      return [];
    }
  }

  async createProject(projectData: any) {
    try {
      const { data: user } = await this.client.auth.getUser();
      
      if (!user.user) {
        throw new Error('Not authenticated. Please run "codexi auth" first.');
      }

      const { data, error } = await this.client
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(chalk.red('❌ Failed to create project:'), error);
      throw error;
    }
  }

  async getWorkflowStatus(projectId: string) {
    try {
      const { data, error } = await this.client
        .from('agent_workflows')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(chalk.red('❌ Failed to get workflow status:'), error);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
