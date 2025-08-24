
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, Download, FolderOpen } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface FileUploadProps {
  onUpload: (files: FileList) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: "", directory: "" } as any)}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Upload Folder
      </Button>
    </div>
  );
};

export const RealTerminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'output',
      content: 'Code-XI Real Terminal v2.0.0',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'output',
      content: 'REAL terminal with actual command execution, file operations, and GitHub integration.',
      timestamp: new Date()
    }
  ]);
  const [currentPath, setCurrentPath] = useState('~');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [projectId, setProjectId] = useState<string>('');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize WebSocket connection to real terminal backend
  useEffect(() => {
    const ws = new WebSocket('wss://akoclehzeocqlgmmbkza.supabase.co/functions/v1/terminal-session');
    
    ws.onopen = () => {
      console.log('Connected to REAL terminal backend');
      addToHistory('✅ Connected to real terminal backend', 'output');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'command_result') {
        if (data.stdout) {
          data.stdout.split('\n').forEach((line: string) => {
            if (line.trim()) addToHistory(line, 'output');
          });
        }
        if (data.stderr) {
          data.stderr.split('\n').forEach((line: string) => {
            if (line.trim()) addToHistory(line, 'error');
          });
        }
        if (data.cwd) {
          setCurrentPath(data.cwd);
        }
      } else if (data.type === 'error') {
        addToHistory(`Error: ${data.message}`, 'error');
      }
      
      setIsProcessing(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from terminal backend');
      addToHistory('❌ Disconnected from terminal backend', 'error');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addToHistory('❌ Terminal connection error', 'error');
    };

    setWebsocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  // Create project for file operations
  useEffect(() => {
    const createProject = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;

        const { data, error } = await supabase
          .from('projects')
          .insert({
            name: `Terminal Session ${sessionId}`,
            description: 'Real terminal session project',
            type: 'web',
            owner_id: user.user.id,
          })
          .select()
          .single();

        if (error) throw error;
        setProjectId(data.id);
        addToHistory(`📁 Created project: ${data.name}`, 'output');
      } catch (error) {
        console.error('Error creating project:', error);
      }
    };

    createProject();
  }, [sessionId]);

  const addToHistory = useCallback((content: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, newLine]);
  }, []);

  const executeRealCommand = async (command: string) => {
    if (!command.trim() || !websocket) return;

    const [cmd, ...args] = command.trim().split(' ');
    addToHistory(`${currentPath} $ ${command}`, 'command');
    setIsProcessing(true);

    try {
      // Handle special commands
      if (command.startsWith('git clone ')) {
        const repoUrl = args[1];
        if (!repoUrl) {
          addToHistory('Error: Repository URL required', 'error');
          setIsProcessing(false);
          return;
        }

        addToHistory('🔄 Cloning repository...', 'output');
        
        const { data, error } = await supabase.functions.invoke('github-clone', {
          body: {
            repositoryUrl: repoUrl,
            projectId: projectId,
            sessionId: sessionId
          }
        });

        if (error) throw error;
        
        if (data.success) {
          addToHistory(`✅ Successfully cloned ${data.repository.name}`, 'output');
          addToHistory(`📁 ${data.filesCount} files imported`, 'output');
          setCurrentPath(data.repository.localPath);
        } else {
          addToHistory(`❌ Clone failed: ${data.error}`, 'error');
        }
        
        setIsProcessing(false);
        return;
      }

      // Send REAL command to backend via WebSocket
      websocket.send(JSON.stringify({
        command: cmd,
        args: args,
        projectId: projectId,
        sessionId: sessionId,
        cwd: currentPath
      }));

    } catch (error) {
      addToHistory(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeRealCommand(input);
      setInput('');
    } else if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      addToHistory(`${currentPath} $ ${input}^C`, 'command');
      setInput('');
      setIsProcessing(false);
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      setHistory([{
        id: Date.now().toString(),
        type: 'output',
        content: 'Code-XI Real Terminal v2.0.0',
        timestamp: new Date()
      }]);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!projectId) {
      toast({
        title: 'Error',
        description: 'Project not ready for file upload',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('sessionId', sessionId);

    Array.from(files).forEach((file, index) => {
      const relativePath = file.webkitRelativePath || file.name;
      formData.append(`file-${relativePath.replace(/\//g, '|')}`, file);
    });

    try {
      addToHistory('📤 Uploading files...', 'output');
      
      const { data, error } = await supabase.functions.invoke('file-transfer', {
        body: formData
      });

      if (error) throw error;

      addToHistory(`✅ Uploaded ${data.filesUploaded} files successfully`, 'output');
      toast({
        title: 'Upload Complete',
        description: `${data.filesUploaded} files uploaded successfully`,
      });
    } catch (error) {
      addToHistory(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Upload failed',
        variant: 'destructive',
      });
    }
  };

  const handleProjectDownload = async () => {
    if (!projectId) {
      toast({
        title: 'Error',
        description: 'No project to download',
        variant: 'destructive',
      });
      return;
    }

    try {
      addToHistory('📥 Preparing project download...', 'output');
      
      const { data, error } = await supabase.functions.invoke('file-transfer?action=download', {
        body: { projectId }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToHistory('✅ Project downloaded successfully', 'output');
      toast({
        title: 'Download Complete',
        description: 'Project files downloaded as ZIP',
      });
    } catch (error) {
      addToHistory(`❌ Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Download failed',
        variant: 'destructive',
      });
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
      <div className="p-4 border-b border-green-500">
        <FileUpload onUpload={handleFileUpload} />
        <div className="flex gap-2">
          <Button
            onClick={handleProjectDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={!projectId}
          >
            <Download className="w-4 h-4" />
            Download Project
          </Button>
        </div>
      </div>
      
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
          <div className="text-yellow-400">Processing real command...</div>
        )}
      </div>
      
      <div className="p-2 border-t border-green-500 text-xs text-gray-500">
        REAL Terminal | Session: {sessionId} | Project: {projectId ? projectId.substring(0, 8) : 'Loading...'}
      </div>
    </div>
  );
};
