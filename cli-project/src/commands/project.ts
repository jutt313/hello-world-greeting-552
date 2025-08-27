
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config/config';
import { supabaseService } from '../services/supabase';
import { checkAuthentication } from './auth';
import ora from 'ora';

interface ProjectOptions {
  name?: string;
  type?: string;
  language?: string;
  framework?: string;
}

export async function initProject(options: ProjectOptions = {}) {
  console.log(chalk.blue('🚀 Initialize Code-XI Project'));
  
  if (!await checkAuthentication()) {
    return;
  }

  const spinner = ora('Setting up project...').start();

  try {
    // Get project details
    const projectConfig = await getProjectConfig(options);
    
    // Create project in database
    const project = await supabaseService.createProject({
      title: projectConfig.name,
      type: projectConfig.type,
      language: projectConfig.language,
      framework: projectConfig.framework,
      description: projectConfig.description,
      status: 'active'
    });

    // Create local config file
    const configPath = path.join(process.cwd(), CONFIG.PROJECT_CONFIG_FILE);
    await fs.writeJson(configPath, {
      projectId: project.id,
      ...projectConfig,
      createdAt: new Date().toISOString()
    }, { spaces: 2 });

    spinner.succeed('Project initialized successfully!');

    console.log(chalk.green('\n✅ Code-XI Project Ready!'));
    console.log(chalk.blue(`📦 Project: ${projectConfig.name}`));
    console.log(chalk.blue(`🏗️  Type: ${projectConfig.type}`));
    console.log(chalk.blue(`⚙️  Framework: ${projectConfig.framework}`));
    console.log(chalk.blue(`🆔 ID: ${project.id}`));

    console.log(chalk.cyan('\n🤖 Available Commands:'));
    console.log(chalk.white('  codexi agents                    # List all agents'));
    console.log(chalk.white('  codexi manager "setup project"   # Start with manager'));
    console.log(chalk.white('  codexi architect "design system" # Architecture planning'));
    console.log(chalk.white('  codexi analyze ./src            # Analyze code'));

  } catch (error) {
    spinner.fail('Project initialization failed');
    console.error(chalk.red('❌ Error:'), error);
  }
}

async function getProjectConfig(options: ProjectOptions) {
  const currentDir = path.basename(process.cwd());
  
  if (options.name) {
    return {
      name: options.name,
      type: options.type || 'web',
      language: options.language || 'typescript',
      framework: options.framework || 'react',
      description: `${options.name} - Built with Code-XI AI Development Team`
    };
  }

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: currentDir,
      validate: (input) => input.trim() ? true : 'Project name is required'
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: [
        { name: '🌐 Web Application', value: 'web' },
        { name: '📱 Mobile App', value: 'mobile' },
        { name: '🔌 API/Backend', value: 'api' },
        { name: '🚀 Full-Stack', value: 'fullstack' },
        { name: '🎮 Game', value: 'game' },
        { name: '🤖 AI/ML Project', value: 'ai-ml' }
      ],
      default: 'web'
    },
    {
      type: 'list',
      name: 'language',
      message: 'Programming language:',
      choices: [
        'TypeScript',
        'JavaScript', 
        'Python',
        'Java',
        'C#',
        'Go',
        'Rust',
        'Swift'
      ],
      default: 'TypeScript'
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Framework/Library:',
      choices: (answers) => {
        if (answers.type === 'web') {
          return ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js'];
        } else if (answers.type === 'mobile') {
          return ['React Native', 'Flutter', 'Swift UI', 'Kotlin'];
        } else if (answers.type === 'api') {
          return ['Express.js', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Gin', 'Actix'];
        }
        return ['Custom'];
      },
      default: 'React'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: (answers) => `${answers.name} - Built with Code-XI AI Development Team`
    }
  ]);

  return answers;
}
