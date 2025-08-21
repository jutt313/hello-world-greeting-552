
#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { initializeAuth } from './commands/auth';
import { initProject } from './commands/project';
import { agentCommands } from './commands/agents';
import { deployCommands } from './commands/deploy';
import { analysisCommands } from './commands/analysis';
import { CONFIG } from './config/config';

const program = new Command();

// ASCII Art Banner
console.log(
  chalk.cyan(
    figlet.textSync('Code-XI', { horizontalLayout: 'full' })
  )
);

console.log(chalk.green('🚀 Professional AI Development Team CLI'));
console.log(chalk.gray('8 Specialized Agents • Real-time Collaboration • Production Ready\n'));

program
  .name('codexi')
  .description('Code-XI AI Development CLI - Professional 8-agent development team')
  .version(CONFIG.VERSION);

// Authentication Commands
program
  .command('auth')
  .description('Authenticate with Code-XI platform')
  .action(initializeAuth);

program
  .command('login')
  .description('Login to Code-XI platform')
  .action(initializeAuth);

// Project Management Commands
program
  .command('init')
  .description('Initialize Code-XI in current directory')
  .option('-t, --type <type>', 'Project type (web, mobile, api, fullstack)', 'web')
  .option('-f, --framework <framework>', 'Framework (react, vue, angular, express)', 'react')
  .action(initProject);

program
  .command('create-project <name>')
  .description('Create new project with AI agents')
  .option('-t, --type <type>', 'Project type', 'web')
  .option('-l, --language <language>', 'Programming language', 'typescript')
  .option('-f, --framework <framework>', 'Framework', 'react')
  .action((name, options) => initProject({ name, ...options }));

// Agent Commands
program
  .command('agents')
  .description('List all available AI agents')
  .action(agentCommands.listAgents);

program
  .command('agent <role>')
  .description('Interact with specific agent')
  .option('-c, --command <command>', 'Command to execute')
  .option('-p, --prompt <prompt>', 'Prompt for agent')
  .action(agentCommands.interactWithAgent);

// Specialized Agent Commands
program
  .command('manager <task>')
  .description('Coordinate project with Manager Agent')
  .action((task) => agentCommands.managerAgent(task));

program
  .command('architect <task>')
  .description('Solutions architecture with Architect Agent')
  .action((task) => agentCommands.architectAgent(task));

program
  .command('fullstack <task>')
  .description('Full-stack development with FullStack Agent')
  .action((task) => agentCommands.fullstackAgent(task));

program
  .command('devops <task>')
  .description('DevOps operations with DevOps Agent')
  .action((task) => agentCommands.devopsAgent(task));

program
  .command('security <task>')
  .description('Security analysis with Security Agent')
  .action((task) => agentCommands.securityAgent(task));

program
  .command('performance <task>')
  .description('Performance optimization with Performance Agent')
  .action((task) => agentCommands.performanceAgent(task));

program
  .command('qa <task>')
  .description('Quality assurance with QA Agent')
  .action((task) => agentCommands.qaAgent(task));

program
  .command('docs <task>')
  .description('Documentation with Documentation Agent')
  .action((task) => agentCommands.docsAgent(task));

// Analysis Commands
program
  .command('analyze <path>')
  .description('Analyze code files or repositories')
  .option('-a, --agent <agent>', 'Specific agent for analysis', 'manager')
  .action(analysisCommands.analyzeCode);

program
  .command('read <path>')
  .description('Read and understand code structure')
  .action(analysisCommands.readCode);

program
  .command('write <path>')
  .description('Generate or modify code files')
  .option('-p, --prompt <prompt>', 'Description of what to write')
  .action(analysisCommands.writeCode);

// Deployment Commands
program
  .command('deploy')
  .description('Deploy project with DevOps agent')
  .option('-e, --env <environment>', 'Target environment', 'production')
  .option('-s, --service <service>', 'Specific service to deploy')
  .action(deployCommands.deploy);

program
  .command('test')
  .description('Run tests with QA engineer')
  .option('-t, --type <type>', 'Test type (unit, integration, e2e)', 'unit')
  .action(deployCommands.runTests);

// Status Commands
program
  .command('status')
  .description('Show project and agents status')
  .action(() => {
    console.log(chalk.green('✅ Code-XI CLI Status'));
    console.log(chalk.blue('🔗 Backend: Connected'));
    console.log(chalk.yellow('🤖 Agents: 8 Active'));
    console.log(chalk.cyan('📊 Ready for development'));
  });

program
  .command('workflow')
  .description('Show current workflow status')
  .action(agentCommands.workflowStatus);

// Help and Version
program
  .command('help-agents')
  .description('Detailed help for all agents')
  .action(() => {
    console.log(chalk.green('\n🤖 Code-XI AI Agents:'));
    console.log(chalk.blue('Manager Agent:') + ' Project coordination, task assignment');
    console.log(chalk.blue('Solutions Architect:') + ' System design, architecture planning');
    console.log(chalk.blue('FullStack Engineer:') + ' Frontend + Backend development');
    console.log(chalk.blue('DevOps Engineer:') + ' Deployment, CI/CD, infrastructure');
    console.log(chalk.blue('Security Engineer:') + ' Security analysis, vulnerability scanning');
    console.log(chalk.blue('Performance Engineer:') + ' Optimization, load testing, monitoring');
    console.log(chalk.blue('QA Engineer:') + ' Testing, quality assurance, bug detection');
    console.log(chalk.blue('Documentation Specialist:') + ' Documentation, guides, API docs');
  });

// Error handling
program.exitOverride();

program.parse();
