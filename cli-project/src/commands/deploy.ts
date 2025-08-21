
import chalk from 'chalk';
import ora from 'ora';
import { supabaseService } from '../services/supabase';
import { checkAuthentication } from './auth';

export const deployCommands = {
  async deploy(options: any) {
    console.log(chalk.blue('🚀 Deploying with DevOps Agent'));

    if (!await checkAuthentication()) return;

    const environment = options.env || 'production';
    const service = options.service || 'all';
    
    const spinner = ora(`Deploying to ${environment}...`).start();

    try {
      const result = await supabaseService.executeAgentCommand(
        'devops-engineer',
        'deploy',
        {
          environment,
          service,
          autoApprove: false
        }
      );

      spinner.succeed('Deployment completed');

      console.log(chalk.green('\n✅ Deployment Results:'));
      console.log(chalk.white(result.response || 'Deployment successful'));

      if (result.deploymentUrl) {
        console.log(chalk.blue(`🌐 URL: ${result.deploymentUrl}`));
      }

      if (result.services) {
        console.log(chalk.cyan('\n📦 Deployed Services:'));
        result.services.forEach((service: any) => {
          console.log(chalk.gray(`  • ${service.name}: ${service.status}`));
        });
      }

    } catch (error) {
      spinner.fail('Deployment failed');
      console.error(chalk.red('❌ Error:'), error);
    }
  },

  async runTests(options: any) {
    console.log(chalk.blue('🧪 Running tests with QA Engineer'));

    if (!await checkAuthentication()) return;

    const testType = options.type || 'unit';
    const spinner = ora(`Running ${testType} tests...`).start();

    try {
      const result = await supabaseService.executeAgentCommand(
        'qa-engineer',
        'run_tests',
        {
          testType,
          generateReport: true
        }
      );

      spinner.succeed('Tests completed');

      console.log(chalk.green('\n✅ Test Results:'));
      console.log(chalk.white(result.response || 'Tests completed'));

      if (result.testResults) {
        const { passed, failed, total } = result.testResults;
        console.log(chalk.green(`✅ Passed: ${passed}`));
        console.log(chalk.red(`❌ Failed: ${failed}`));
        console.log(chalk.blue(`📊 Total: ${total}`));
      }

      if (result.coverage) {
        console.log(chalk.cyan(`📈 Coverage: ${result.coverage}%`));
      }

    } catch (error) {
      spinner.fail('Tests failed');
      console.error(chalk.red('❌ Error:'), error);
    }
  }
};
