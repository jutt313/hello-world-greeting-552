
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import ora from 'ora';
import { supabaseService } from '../services/supabase';
import { checkAuthentication } from './auth';

export const analysisCommands = {
  async analyzeCode(filePath: string, options: any) {
    console.log(chalk.blue(`🔍 Analyzing code: ${filePath}`));

    if (!await checkAuthentication()) return;

    const spinner = ora('Analyzing code structure...').start();

    try {
      const analysisData = await prepareAnalysisData(filePath);
      
      const result = await supabaseService.executeAgentCommand(
        options.agent || 'manager',
        'analyze_code',
        {
          filePath,
          codeContent: analysisData.content,
          fileType: analysisData.type,
          structure: analysisData.structure
        }
      );

      spinner.succeed('Code analysis completed');

      console.log(chalk.green('\n✅ Analysis Results:'));
      console.log(chalk.white(result.response || 'Analysis completed'));

      if (result.insights) {
        console.log(chalk.blue('\n💡 Key Insights:'));
        result.insights.forEach((insight: string, index: number) => {
          console.log(chalk.gray(`  ${index + 1}. ${insight}`));
        });
      }

      if (result.suggestions) {
        console.log(chalk.cyan('\n📝 Suggestions:'));
        result.suggestions.forEach((suggestion: string, index: number) => {
          console.log(chalk.gray(`  ${index + 1}. ${suggestion}`));
        });
      }

    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('❌ Error:'), error);
    }
  },

  async readCode(filePath: string) {
    console.log(chalk.blue(`📖 Reading code: ${filePath}`));

    if (!await checkAuthentication()) return;

    const spinner = ora('Reading and understanding code...').start();

    try {
      const codeData = await prepareAnalysisData(filePath);
      
      const result = await supabaseService.executeAgentCommand(
        'manager',
        'read_code',
        {
          filePath,
          content: codeData.content,
          structure: codeData.structure
        }
      );

      spinner.succeed('Code reading completed');

      console.log(chalk.green('\n✅ Code Understanding:'));
      console.log(chalk.white(result.response || 'Code structure understood'));

      if (result.summary) {
        console.log(chalk.blue('\n📋 Summary:'));
        console.log(chalk.gray(result.summary));
      }

    } catch (error) {
      spinner.fail('Code reading failed');
      console.error(chalk.red('❌ Error:'), error);
    }
  },

  async writeCode(filePath: string, options: any) {
    console.log(chalk.blue(`✍️ Writing code: ${filePath}`));

    if (!await checkAuthentication()) return;

    const prompt = options.prompt || await promptForWriteTask();
    const spinner = ora('Generating code...').start();

    try {
      const result = await supabaseService.executeAgentCommand(
        'fullstack-engineer',
        'write_code',
        {
          filePath,
          prompt,
          requirements: prompt
        }
      );

      spinner.succeed('Code generation completed');

      console.log(chalk.green('\n✅ Code Generated:'));
      console.log(chalk.white(result.response || 'Code written successfully'));

      if (result.code) {
        console.log(chalk.blue('\n📄 Generated Code:'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(result.code);
        console.log(chalk.gray('─'.repeat(50)));

        // Save to file if specified
        if (filePath !== 'stdout') {
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, result.code);
          console.log(chalk.green(`💾 Code saved to: ${filePath}`));
        }
      }

    } catch (error) {
      spinner.fail('Code generation failed');
      console.error(chalk.red('❌ Error:'), error);
    }
  }
};

async function prepareAnalysisData(filePath: string) {
  const stats = await fs.stat(filePath);
  
  if (stats.isDirectory()) {
    // Analyze directory structure
    const files = await glob('**/*', { cwd: filePath, ignore: ['node_modules/**', '.git/**'] });
    const structure = files.slice(0, 50); // Limit for performance
    
    return {
      type: 'directory',
      content: `Directory with ${files.length} files`,
      structure: structure
    };
  } else {
    // Analyze single file
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath);
    
    return {
      type: 'file',
      content: content.slice(0, 10000), // Limit content size
      structure: [filePath],
      extension: ext
    };
  }
}

async function promptForWriteTask(): Promise<string> {
  const inquirer = require('inquirer');
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'task',
      message: 'What code do you want to generate?',
      validate: (input: string) => input.trim() ? true : 'Description is required'
    }
  ]);
  return answer.task;
}
