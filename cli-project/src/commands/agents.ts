
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { supabaseService } from '../services/supabase';
import { checkAuthentication } from './auth';
import { CONFIG, AgentRole } from '../config/config';
import fs from 'fs-extra';
import path from 'path';

export const agentCommands = {
  async listAgents() {
    console.log(chalk.blue('🤖 Code-XI AI Development Team\n'));

    if (!await checkAuthentication()) return;

    const spinner = ora('Fetching agents status...').start();

    try {
      const agents = await supabaseService.getAgents();
      spinner.succeed('Agents loaded');

      if (agents.length === 0) {
        console.log(chalk.yellow('⚠️  No agents found. Contact support.'));
        return;
      }

      console.log(chalk.green(`✅ ${agents.length} AI Agents Active\n`));

      agents.forEach((agent, index) => {
        const status = agent.is_active ? chalk.green('●') : chalk.red('●');
        const expertise = agent.expertise ? chalk.gray(`- ${agent.expertise}`) : '';
        
        console.log(`${index + 1}. ${status} ${chalk.blue(agent.role)} ${expertise}`);
        if (agent.current_task) {
          console.log(`   ${chalk.gray('Current:')} ${agent.current_task}`);
        }
      });

      console.log(chalk.cyan('\n💡 Usage Examples:'));
      console.log(chalk.white('  codexi manager "create a React app"'));
      console.log(chalk.white('  codexi architect "design microservices"'));
      console.log(chalk.white('  codexi security "scan for vulnerabilities"'));

    } catch (error) {
      spinner.fail('Failed to load agents');
      console.error(chalk.red('❌ Error:'), error);
    }
  },

  async interactWithAgent(role: string, options: any) {
    console.log(chalk.blue(`🤖 Interacting with ${role} agent`));

    if (!await checkAuthentication()) return;

    const command = options.command || options.prompt;
    if (!command) {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'task',
          message: `What task do you want the ${role} agent to perform?`,
          validate: (input) => input.trim() ? true : 'Task description is required'
        }
      ]);
      command = answer.task;
    }

    const spinner = ora(`${role} agent working...`).start();

    try {
      const result = await supabaseService.executeAgentCommand(role, 'execute_task', {
        task: command,
        projectId: await getProjectId()
      });

      spinner.succeed(`${role} agent completed task`);

      console.log(chalk.green('\n✅ Task Result:'));
      console.log(chalk.white(result.response || result.message || 'Task completed successfully'));
      
      if (result.action_taken) {
        console.log(chalk.blue('\n🔧 Actions Taken:'));
        console.log(chalk.gray(result.action_taken));
      }

      if (result.cost) {
        console.log(chalk.yellow(`💰 Cost: $${result.cost.toFixed(4)}`));
      }

    } catch (error) {
      spinner.fail(`${role} agent failed`);
      console.error(chalk.red('❌ Error:'), error);
    }
  },

  async managerAgent(task: string) {
    return this.executeSpecializedAgent('manager', task, '🏢 Manager Agent');
  },

  async architectAgent(task: string) {
    return this.executeSpecializedAgent('solutions-architect', task, '🏗️ Solutions Architect');
  },

  async fullstackAgent(task: string) {
    return this.executeSpecializedAgent('fullstack-engineer', task, '💻 FullStack Engineer');
  },

  async devopsAgent(task: string) {
    return this.executeSpecializedAgent('devops-engineer', task, '🚀 DevOps Engineer');
  },

  async securityAgent(task: string) {
    return this.executeSpecializedAgent('security-engineer', task, '🔒 Security Engineer');
  },

  async performanceAgent(task: string) {
    return this.executeSpecializedAgent('performance-engineer', task, '⚡ Performance Engineer');
  },

  async qaAgent(task: string) {
    return this.executeSpecializedAgent('qa-engineer', task, '✅ QA Engineer');
  },

  async docsAgent(task: string) {
    return this.executeSpecializedAgent('documentation-specialist', task, '📚 Documentation Specialist');
  },

  async executeSpecializedAgent(agentRole: AgentRole, task: string, displayName: string) {
    console.log(chalk.blue(displayName));

    if (!await checkAuthentication()) return;

    const spinner = ora(`${displayName} working on: ${task}`).start();

    try {
      const result = await supabaseService.executeAgentCommand(agentRole, 'execute_task', {
        task,
        projectId: await getProjectId()
      });

      spinner.succeed(`${displayName} completed task`);

      console.log(chalk.green('\n✅ Task Result:'));
      console.log(chalk.white(result.response || result.message || 'Task completed successfully'));
      
      if (result.files_modified) {
        console.log(chalk.blue('\n📝 Files Modified:'));
        result.files_modified.forEach((file: string) => {
          console.log(chalk.gray(`  • ${file}`));
        });
      }

      if (result.action_taken) {
        console.log(chalk.blue('\n🔧 Actions Taken:'));
        console.log(chalk.gray(result.action_taken));
      }

      if (result.cost) {
        console.log(chalk.yellow(`💰 Cost: $${result.cost.toFixed(4)}`));
      }

    } catch (error) {
      spinner.fail(`${displayName} failed`);
      console.error(chalk.red('❌ Error:'), error);
    }
  },

  async workflowStatus() {
    console.log(chalk.blue('📊 Workflow Status'));

    if (!await checkAuthentication()) return;

    const spinner = ora('Fetching workflow status...').start();

    try {
      const projectId = await getProjectId();
      const workflow = await supabaseService.getWorkflowStatus(projectId);

      spinner.succeed('Workflow status loaded');

      if (!workflow) {
        console.log(chalk.yellow('⚠️  No active workflow found'));
        return;
      }

      console.log(chalk.green(`\n✅ Workflow: ${workflow.name}`));
      console.log(chalk.blue(`Status: ${workflow.status}`));
      console.log(chalk.blue(`Progress: ${workflow.progress_percentage}%`));
      
      if (workflow.tasks && workflow.tasks.length > 0) {
        console.log(chalk.cyan('\n📋 Tasks:'));
        workflow.tasks.forEach((task: any, index: number) => {
          const status = task.status === 'completed' ? chalk.green('✅') : 
                        task.status === 'in_progress' ? chalk.yellow('⏳') : chalk.gray('⏸️');
          console.log(`  ${index + 1}. ${status} ${task.name}`);
        });
      }

    } catch (error) {
      spinner.fail('Failed to load workflow status');
      console.error(chalk.red('❌ Error:'), error);
    }
  }
};

async function getProjectId(): Promise<string> {
  try {
    const configPath = path.join(process.cwd(), CONFIG.PROJECT_CONFIG_FILE);
    
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      return config.projectId;
    }
    
    return 'cli-project';
  } catch (error) {
    return 'cli-project';
  }
}
