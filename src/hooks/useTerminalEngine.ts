
import { useState, useCallback } from 'react';
import { useGitHubRepository } from './useGitHubRepository';

interface CommandResult {
  output?: string;
  error?: string;
  newPath?: string;
}

interface FileSystemState {
  currentPath: string;
  files: Record<string, string[]>;
  repositories: Record<string, any>;
}

export const useTerminalEngine = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemState>({
    currentPath: '~',
    files: {
      '~': ['Desktop', 'Documents', 'Downloads', 'Projects'],
      '~/Projects': []
    },
    repositories: {}
  });

  const { cloneRepository, getRepositoryStructure } = useGitHubRepository();

  const commands = {
    help: () => ({
      output: `Available commands:
  File Operations:
    ls              - List directory contents
    cd <path>       - Change directory
    pwd             - Print working directory
    mkdir <name>    - Create directory
    cat <file>      - Display file contents
    clear           - Clear terminal

  Git Operations:
    git clone <url> - Clone repository
    git status      - Show git status
    git branch      - List branches
    git log         - Show commit history

  CodeXI Agent Operations:
    codexi <agent> "<command>" - Communicate with AI agents
    codexi help                - Show available agents

  System:
    help            - Show this help
    version         - Show version info`
    }),

    version: () => ({
      output: 'Code-XI Terminal v1.0.0 - AI-Powered Development Environment'
    }),

    clear: () => ({ output: '' }),

    pwd: (currentPath: string) => ({
      output: currentPath
    }),

    ls: (currentPath: string, args: string[]) => {
      const path = args[0] || currentPath;
      const files = fileSystem.files[path] || [];
      const showAll = args.includes('-la') || args.includes('-a');
      
      let output = files.join('  ');
      if (showAll && files.length > 0) {
        output = files.map(file => `drwxr-xr-x  2 user user 4096 ${new Date().toLocaleDateString()} ${file}`).join('\n');
      }
      
      return { output: output || 'Directory is empty' };
    },

    cd: (currentPath: string, args: string[]) => {
      if (!args[0]) return { newPath: '~' };
      
      const target = args[0];
      if (target === '..') {
        const pathParts = currentPath.split('/');
        pathParts.pop();
        const newPath = pathParts.join('/') || '~';
        return { newPath };
      }
      
      const newPath = target.startsWith('/') ? target : `${currentPath}/${target}`;
      
      // Check if directory exists
      if (fileSystem.files[newPath] !== undefined) {
        return { newPath };
      }
      
      return { error: `cd: ${target}: No such file or directory` };
    },

    mkdir: (currentPath: string, args: string[]) => {
      if (!args[0]) return { error: 'mkdir: missing operand' };
      
      const dirName = args[0];
      const newDirPath = `${currentPath}/${dirName}`;
      
      setFileSystem(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [currentPath]: [...(prev.files[currentPath] || []), dirName],
          [newDirPath]: []
        }
      }));
      
      return { output: `Created directory: ${dirName}` };
    }
  };

  const executeCommand = useCallback(async (command: string, currentPath: string): Promise<CommandResult> => {
    const [cmd, ...args] = command.trim().split(' ');
    
    if (cmd === 'git' && args[0] === 'clone') {
      const url = args[1];
      if (!url) return { error: 'git clone: missing repository URL' };
      
      try {
        const result = await cloneRepository(url);
        if (result.success) {
          const repoName = url.split('/').pop()?.replace('.git', '') || 'repository';
          const repoPath = `${currentPath}/${repoName}`;
          
          setFileSystem(prev => ({
            ...prev,
            files: {
              ...prev.files,
              [currentPath]: [...(prev.files[currentPath] || []), repoName],
              [repoPath]: result.files || []
            },
            repositories: {
              ...prev.repositories,
              [repoPath]: result.repository
            }
          }));
          
          return { output: `Cloned repository to ${repoName}/` };
        } else {
          return { error: result.error || 'Failed to clone repository' };
        }
      } catch (error) {
        return { error: `git clone: ${error instanceof Error ? error.message : 'Unknown error'}` };
      }
    }
    
    if (cmd === 'git' && args[0] === 'status') {
      const repo = fileSystem.repositories[currentPath];
      if (!repo) return { error: 'fatal: not a git repository' };
      
      return { output: 'On branch main\nnothing to commit, working tree clean' };
    }
    
    if (commands[cmd as keyof typeof commands]) {
      return commands[cmd as keyof typeof commands](currentPath, args);
    }
    
    return { error: `${cmd}: command not found` };
  }, [fileSystem, cloneRepository]);

  const getCompletions = useCallback((input: string): string[] => {
    const parts = input.split(' ');
    const cmd = parts[0];
    
    if (parts.length === 1) {
      // Command completion
      const availableCommands = [
        ...Object.keys(commands),
        'git',
        'codexi'
      ];
      return availableCommands.filter(c => c.startsWith(cmd));
    }
    
    if (cmd === 'cd' || cmd === 'ls') {
      // Directory completion
      const currentFiles = fileSystem.files[fileSystem.currentPath] || [];
      const partial = parts[parts.length - 1];
      return currentFiles.filter(f => f.startsWith(partial));
    }
    
    if (cmd === 'codexi' && parts.length === 2) {
      // Agent completion
      const agents = ['manager', 'architect', 'fullstack', 'devops', 'security', 'qa', 'performance', 'docs', 'help'];
      return agents.filter(a => a.startsWith(parts[1]));
    }
    
    return [];
  }, [fileSystem]);

  return {
    executeCommand,
    getCompletions,
    fileSystem
  };
};
