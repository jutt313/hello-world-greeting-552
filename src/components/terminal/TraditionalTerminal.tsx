
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTerminalEngine } from '@/hooks/useTerminalEngine';
import { useAgentCommunication } from '@/hooks/useAgentCommunication';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export const TraditionalTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Code-XI Terminal v1.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'Type "help" for available commands or "codexi help" for AI agent commands.',
      timestamp: new Date()
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('~');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  const { executeCommand, getCompletions } = useTerminalEngine();
  const { communicateWithAgent } = useAgentCommunication();

  const addToHistory = useCallback((content: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, newLine]);
  }, []);

  const handleCommand = async (command: string) => {
    if (!command.trim()) return;

    // Add command to history
    addToHistory(`${currentPath} $ ${command}`, 'command');
    setCommandHistory(prev => [command, ...prev].slice(0, 100));
    setIsProcessing(true);

    try {
      if (command.startsWith('codexi ')) {
        // AI Agent commands
        const parts = command.split(' ');
        const agentName = parts[1];
        const agentCommand = parts.slice(2).join(' ').replace(/['"]/g, '');
        
        if (agentName === 'help') {
          addToHistory('Available AI Agents:', 'output');
          addToHistory('  codexi manager "your request"     - Project management and coordination', 'output');
          addToHistory('  codexi architect "your request"   - System architecture and design', 'output');
          addToHistory('  codexi fullstack "your request"   - Full-stack development', 'output');
          addToHistory('  codexi devops "your request"      - DevOps and infrastructure', 'output');
          addToHistory('  codexi security "your request"    - Security analysis and fixes', 'output');
          addToHistory('  codexi qa "your request"          - Quality assurance and testing', 'output');
          addToHistory('  codexi performance "your request" - Performance optimization', 'output');
          addToHistory('  codexi docs "your request"        - Documentation generation', 'output');
          addToHistory('', 'output');
          addToHistory('Example: codexi manager "analyze this repository structure"', 'output');
        } else {
          addToHistory(`Communicating with ${agentName} agent...`, 'output');
          const response = await communicateWithAgent(agentName, agentCommand);
          if (response) {
            addToHistory(`[${agentName.toUpperCase()}]: ${response.response}`, 'output');
            if (response.tokens_used) {
              addToHistory(`Tokens used: ${response.tokens_used} | Cost: $${response.cost.toFixed(4)}`, 'output');
            }
          } else {
            addToHistory(`Error: Failed to communicate with ${agentName} agent`, 'error');
          }
        }
      } else {
        // Regular terminal commands
        const result = await executeCommand(command, currentPath);
        
        if (result.output) {
          result.output.split('\n').forEach(line => {
            if (line.trim()) addToHistory(line, 'output');
          });
        }
        
        if (result.error) {
          addToHistory(result.error, 'error');
        }
        
        if (result.newPath) {
          setCurrentPath(result.newPath);
        }
      }
    } catch (error) {
      addToHistory(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completions = getCompletions(input);
      if (completions.length === 1) {
        setInput(completions[0]);
      } else if (completions.length > 1) {
        addToHistory(completions.join('  '), 'output');
      }
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      addToHistory(`${currentPath} $ ${input}^C`, 'command');
      setInput('');
      setIsProcessing(false);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([
        {
          id: Date.now().toString(),
          type: 'output',
          content: 'Code-XI Terminal v1.0.0',
          timestamp: new Date()
        }
      ]);
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="h-full bg-black text-green-400 font-mono text-sm flex flex-col">
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line) => (
          <div key={line.id} className="flex">
            <span className={`${
              line.type === 'command' ? 'text-cyan-400' :
              line.type === 'error' ? 'text-red-400' :
              'text-green-400'
            }`}>
              {line.content}
            </span>
          </div>
        ))}
        
        <div className="flex items-center">
          <span className="text-cyan-400">{currentPath} $ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-green-400 ml-1"
            disabled={isProcessing}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="animate-pulse text-green-400">|</span>
        </div>
        
        {isProcessing && (
          <div className="text-yellow-400">Processing...</div>
        )}
      </div>
    </div>
  );
};
