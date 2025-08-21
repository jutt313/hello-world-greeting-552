
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import open from 'open';
import { CONFIG } from '../config/config';
import { supabaseService } from '../services/supabase';
import { AuthServer } from '../services/authServer';

export async function initializeAuth() {
  console.log(chalk.blue('🔐 Code-XI Authentication'));
  console.log(chalk.gray('Connect your CLI to the Code-XI platform\n'));

  const authServer = new AuthServer();

  try {
    console.log(chalk.yellow('🔄 Starting authentication process...'));
    console.log(chalk.gray('1. Starting local authentication server...'));
    
    // Start the local server (non-blocking promise)
    const authPromise = authServer.start();

    // Give the server a moment to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(chalk.gray('2. Opening browser for authentication...'));
    
    // Generate the authentication URL with CLI parameter
    const authUrl = `https://preview--hello-world-greeting-552.lovable.app/auth?cli=true&redirect=${encodeURIComponent(CONFIG.CLI_REDIRECT_URL)}`;
    
    // Open the browser
    await open(authUrl);

    console.log(chalk.blue('🌐 Browser opened for authentication'));
    console.log(chalk.cyan('Please complete the authentication in your browser...'));
    console.log(chalk.gray('If the browser doesn\'t open automatically, visit:'));
    console.log(chalk.white(`   ${authUrl}`));
    console.log(chalk.yellow('\n⏳ Waiting for authentication...'));

    // Wait for authentication to complete
    const token = await authPromise;

    // Verify the token works
    console.log(chalk.yellow('🔄 Verifying authentication...'));
    const user = await supabaseService.authenticate(token);

    console.log(chalk.green('✅ Authentication successful!'));
    console.log(chalk.blue(`👤 Logged in as: ${user?.email || 'User'}`));
    console.log(chalk.gray(`🔑 Token saved to: ${CONFIG.AUTH_TOKEN_FILE}`));
    console.log(chalk.cyan('\n🚀 You can now use Code-XI CLI commands:'));
    console.log(chalk.white('  codexi init                 # Initialize project'));
    console.log(chalk.white('  codexi agents              # List all agents'));
    console.log(chalk.white('  codexi manager "create app" # Start development'));

  } catch (error) {
    console.error(chalk.red('❌ Authentication failed:'), error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('EADDRINUSE')) {
        console.log(chalk.yellow('💡 Tip: Close any applications using port 3000 and try again.'));
      } else if (error.message.includes('timeout')) {
        console.log(chalk.yellow('💡 Tip: The authentication process timed out. Please try again.'));
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log(chalk.yellow('💡 Tip: Check your internet connection and try again.'));
      }
    }
    
    // Clean up the server
    authServer.close();
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
