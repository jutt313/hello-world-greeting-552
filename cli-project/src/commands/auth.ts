
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { CONFIG } from '../config/config';
import { supabaseService } from '../services/supabase';

export async function initializeAuth() {
  console.log(chalk.blue('🔐 Code-XI Authentication'));
  console.log(chalk.gray('Connect your CLI to the Code-XI platform\n'));

  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'authToken',
        message: 'Enter your Code-XI authentication token:',
        validate: (input) => {
          if (!input.trim()) {
            return 'Authentication token is required';
          }
          return true;
        }
      }
    ]);

    console.log(chalk.yellow('🔄 Authenticating...'));

    // Authenticate with Supabase
    const user = await supabaseService.authenticate(answers.authToken);

    // Save token to local file
    const tokenPath = path.join(process.cwd(), CONFIG.AUTH_TOKEN_FILE);
    await fs.writeFile(tokenPath, answers.authToken);

    console.log(chalk.green('✅ Authentication successful!'));
    console.log(chalk.blue(`👤 Logged in as: ${user?.email || 'User'}`));
    console.log(chalk.gray(`🔑 Token saved to: ${CONFIG.AUTH_TOKEN_FILE}`));
    console.log(chalk.cyan('\n🚀 You can now use Code-XI CLI commands:'));
    console.log(chalk.white('  codexi init                 # Initialize project'));
    console.log(chalk.white('  codexi agents              # List all agents'));
    console.log(chalk.white('  codexi manager "create app" # Start development'));

  } catch (error) {
    console.error(chalk.red('❌ Authentication failed:'), error);
    process.exit(1);
  }
}

export async function checkAuthentication(): Promise<boolean> {
  try {
    const tokenPath = path.join(process.cwd(), CONFIG.AUTH_TOKEN_FILE);
    
    if (!await fs.pathExists(tokenPath)) {
      console.log(chalk.red('❌ Not authenticated. Please run "codexi auth" first.'));
      return false;
    }

    const token = await fs.readFile(tokenPath, 'utf-8');
    await supabaseService.authenticate(token.trim());
    
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Authentication expired. Please run "codexi auth" to login again.'));
    return false;
  }
}
