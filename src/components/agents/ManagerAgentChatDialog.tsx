import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Send, Upload, GitBranch, User, Bot, Loader2, FolderOpen, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FileUploadManager from './FileUploadManager';
import RepositoryDisplay from './RepositoryDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatMessage {
  id: string;
  content: string;
  sender_type: 'user' | 'manager';
  created_at: string;
  tokens_used?: number;
  cost?: number;
}

interface LLMProvider {
  id: string;
  provider_name: string;
  selected_models: string[];
}

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  language: string;
}

interface RepositoryInfo {
  name: string;
  url: string;
  branch: string;
  filesCount: number;
  files: string[];
}

interface ManagerAgentChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Extend HTMLInputElement to include webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

const ManagerAgentChatDialog: React.FC<ManagerAgentChatDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [llmProviders, setLLMProviders] = useState<LLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [repository, setRepository] = useState<RepositoryInfo | null>(null);
  const [gitRepoUrl, setGitRepoUrl] = useState('');
  const [contextType, setContextType] = useState<'none' | 'files' | 'repository'>('none');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      fetchLLMProviders();
      createNewChatSession();
    }
  }, [open]);

  const fetchLLMProviders = async () => {
    try {
      console.log('Fetching LLM providers...');
      const { data, error } = await supabase
        .from('llm_providers')
        .select('id, provider_name, selected_models')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching LLM providers:', error);
        throw error;
      }
      
      console.log('LLM providers fetched:', data);
      
      const transformedProviders: LLMProvider[] = (data || []).map(provider => ({
        id: provider.id,
        provider_name: provider.provider_name,
        selected_models: Array.isArray(provider.selected_models) 
          ? provider.selected_models as string[]
          : []
      }));
      
      setLLMProviders(transformedProviders);
      if (transformedProviders.length > 0) {
        setSelectedProvider(transformedProviders[0].id);
        console.log('Selected provider:', transformedProviders[0].provider_name);
      } else {
        console.warn('No active LLM providers found');
        toast({
          title: 'No LLM Providers',
          description: 'Please configure at least one LLM provider to use the chat.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load LLM providers',
        variant: 'destructive',
      });
    }
  };

  const createNewChatSession = async () => {
    try {
      console.log('Creating new chat session...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to use the chat functionality.',
          variant: 'destructive',
        });
        return;
      }

      console.log('User authenticated:', user.user.email);

      // Create new project for this chat session
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: `Manager Chat ${new Date().toLocaleDateString()}`,
          type: 'data',
          owner_id: user.user.id,
          description: 'Manager Agent Chat Session'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error creating project:', projectError);
        throw projectError;
      }
      
      console.log('Project created:', project.id);
      setCurrentProjectId(project.id);

      // Create chat session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.user.id,
          project_id: project.id,
          title: 'Manager Agent Chat',
          is_active: true
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating chat session:', sessionError);
        throw sessionError;
      }

      console.log('Chat session created:', session.id);
      setCurrentSessionId(session.id);

    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat session',
        variant: 'destructive',
      });
    }
  };

  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: { [key: string]: string } = {
      'js': 'JavaScript', 'ts': 'TypeScript', 'tsx': 'TypeScript',
      'jsx': 'JavaScript', 'py': 'Python', 'java': 'Java',
      'cpp': 'C++', 'c': 'C', 'cs': 'C#', 'php': 'PHP',
      'rb': 'Ruby', 'go': 'Go', 'rs': 'Rust', 'html': 'HTML',
      'css': 'CSS', 'md': 'Markdown', 'json': 'JSON',
      'yml': 'YAML', 'yaml': 'YAML', 'xml': 'XML'
    };
    return langMap[ext || ''] || 'Text';
  };

  const handleFileUpload = async (files: FileList) => {
    if (!currentProjectId) {
      toast({
        title: 'Error',
        description: 'No active project session',
        variant: 'destructive',
      });
      return;
    }

    // Clear repository if files are being uploaded
    if (repository) {
      setRepository(null);
      setContextType('files');
      toast({
        title: 'Context Switched',
        description: 'Repository disconnected. Using uploaded files as context.',
      });
    }

    setIsUploading(true);
    const fileArray = Array.from(files);
    const newFiles: UploadedFile[] = [];

    try {
      console.log(`Uploading ${fileArray.length} files...`);
      
      for (const file of fileArray) {
        const content = await file.text();
        const language = detectLanguage(file.name);
        
        console.log(`Processing file: ${file.name} (${language})`);
        
        // Store in database
        const { error } = await supabase
          .from('agent_file_operations')
          .insert({
            agent_id: '22222222-2222-2222-2222-222222222222',
            project_id: currentProjectId,
            operation_type: 'create',
            file_path: file.webkitRelativePath || file.name,
            file_content_after: content,
            operation_status: 'completed',
            programming_language: language,
            framework: 'User Upload'
          });

        if (error) {
          console.error('Error storing file:', file.name, error);
          throw error;
        }

        newFiles.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          type: file.type,
          language
        });
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      setContextType('files');

      console.log(`Successfully uploaded ${fileArray.length} files`);
      toast({
        title: 'Files Uploaded',
        description: `${fileArray.length} files uploaded successfully`,
      });

    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGitRepoConnect = async () => {
    if (!gitRepoUrl || !currentProjectId) return;

    // Clear uploaded files if repository is being connected
    if (uploadedFiles.length > 0) {
      setUploadedFiles([]);
      setContextType('repository');
      toast({
        title: 'Context Switched',
        description: 'Uploaded files cleared. Using repository as context.',
      });
    }

    try {
      setIsCloning(true);
      console.log('Connecting to repository:', gitRepoUrl);
      
      const { data, error } = await supabase.functions.invoke('github-clone', {
        body: {
          repositoryUrl: gitRepoUrl,
          projectId: currentProjectId,
          sessionId: Date.now().toString()
        }
      });

      if (error) {
        console.error('GitHub clone function error:', error);
        throw error;
      }

      console.log('GitHub clone response:', data);

      if (data.success && data.repository) {
        setRepository({
          name: data.repository.name,
          url: data.repository.url,
          branch: data.repository.branch,
          filesCount: data.repository.filesCount,
          files: data.files || []
        });
        setContextType('repository');
        
        toast({
          title: 'Repository Connected',
          description: `Successfully cloned ${data.repository.name}`,
        });
        setGitRepoUrl('');
      } else {
        throw new Error(data.error || 'Failed to clone repository');
      }

    } catch (error) {
      console.error('Error connecting repository:', error);
      toast({
        title: 'Connection Error',
        description: error instanceof Error ? error.message : 'Failed to connect repository',
        variant: 'destructive',
      });
    } finally {
      setIsCloning(false);
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    setContextType('none');
    toast({
      title: 'Files Cleared',
      description: 'All uploaded files have been removed',
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      setContextType('none');
    }
  };

  const disconnectRepository = () => {
    setRepository(null);
    setContextType('none');
    toast({
      title: 'Repository Disconnected',
      description: 'Repository has been disconnected from the chat',
    });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId || !selectedProvider) {
      console.warn('Cannot send message: missing requirements', {
        hasMessage: !!inputMessage.trim(),
        hasSession: !!currentSessionId,
        hasProvider: !!selectedProvider
      });
      return;
    }

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      console.log('Sending message to Manager Agent...');
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      const provider = llmProviders.find(p => p.id === selectedProvider);
      if (!provider) {
        console.error('No LLM provider selected or found');
        throw new Error('No LLM provider selected');
      }

      const hasContext = contextType !== 'none';
      
      console.log('Invoking manager-agent-execution with:', {
        provider: provider.provider_name,
        hasContext,
        contextType,
        filesCount: uploadedFiles.length,
        repositoryName: repository?.name
      });

      const { data, error } = await supabase.functions.invoke('manager-agent-execution', {
        body: {
          action: 'chat',
          user_id: user.user.id,
          project_id: currentProjectId,
          session_id: currentSessionId,
          message: userMessage,
          llm_provider_id: selectedProvider,
          provider_name: provider.provider_name,
          has_project_context: hasContext,
          context_type: contextType,
          files_count: uploadedFiles.length,
          repository_name: repository?.name || null
        }
      });

      if (error) {
        console.error('Supabase function invoke error:', error);
        throw error;
      }

      console.log('Manager Agent response:', data);

      if (data.success) {
        // Remove temp message and fetch updated messages
        setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
        
        const { data: updatedMessages, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching updated messages:', messagesError);
        } else if (updatedMessages) {
          console.log('Updated messages fetched:', updatedMessages.length);
          setMessages(updatedMessages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender_type: msg.sender_type === 'manager' ? 'manager' : 'user',
            created_at: msg.created_at,
            tokens_used: msg.tokens_used,
            cost: msg.cost
          })));
        }

        toast({
          title: 'Message Sent',
          description: `Tokens: ${data.tokens_used || 0}, Cost: $${(data.cost || 0).toFixed(4)}`,
        });

      } else {
        console.error('Manager Agent returned error:', data.error);
        throw new Error(data.error || 'Failed to get response');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Chat with Manager Agent
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          {/* LLM Provider Selection */}
          <div className="flex items-center gap-4">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select LLM Provider" />
              </SelectTrigger>
              <SelectContent>
                {llmProviders.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.provider_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isCloning}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Files
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                webkitdirectory=""
                directory=""
              />
            </div>
          </div>

          {/* Git Repository Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter Git repository URL (https://github.com/user/repo)"
              value={gitRepoUrl}
              onChange={(e) => setGitRepoUrl(e.target.value)}
              className="flex-1"
              disabled={isCloning}
            />
            <Button
              onClick={handleGitRepoConnect}
              disabled={!gitRepoUrl || isCloning}
              size="sm"
            >
              {isCloning ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <GitBranch className="w-4 h-4 mr-2" />
              )}
              Connect Repo
            </Button>
          </div>

          {/* Context Management Warning */}
          {contextType !== 'none' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {contextType === 'files' && 'Using uploaded files as project context. '}
                {contextType === 'repository' && 'Using connected repository as project context. '}
                Switching to the other option will clear the current context.
              </AlertDescription>
            </Alert>
          )}

          {/* File Upload Manager */}
          <FileUploadManager
            files={uploadedFiles}
            onRemoveFile={removeUploadedFile}
            onClearAll={clearUploadedFiles}
          />

          {/* Repository Display */}
          <RepositoryDisplay
            repository={repository}
            onDisconnect={disconnectRepository}
          />

          {/* Chat Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-500/50" />
                  <h3 className="font-semibold mb-2">Manager Agent Ready</h3>
                  <p className="text-sm">
                    Upload your project files or connect a Git repository, then start chatting with your AI Manager!
                  </p>
                  {llmProviders.length === 0 && (
                    <p className="text-sm text-destructive mt-2">
                      Please configure at least one LLM provider to start chatting.
                    </p>
                  )}
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender_type === 'manager' && (
                    <Avatar className="w-8 h-8 border-2 border-yellow-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs">
                        <Crown className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    
                    {message.sender_type === 'manager' && (message.tokens_used || message.cost) && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/20 text-xs text-muted-foreground">
                        <Bot className="w-3 h-3" />
                        {message.tokens_used && <span>{message.tokens_used} tokens</span>}
                        {message.cost && (
                          <>
                            <span>•</span>
                            <span>${message.cost.toFixed(4)}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {message.sender_type === 'user' && (
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 border-2 border-yellow-500/20">
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs">
                      <Crown className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Manager Agent is thinking...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your Manager Agent anything about your project..."
              disabled={isLoading || !selectedProvider || llmProviders.length === 0}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading || !selectedProvider || llmProviders.length === 0}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManagerAgentChatDialog;
