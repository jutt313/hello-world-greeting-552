
import React from 'react';
import { GitBranch, File, Folder, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RepositoryInfo {
  name: string;
  url: string;
  branch: string;
  filesCount: number;
  files: string[];
}

interface RepositoryDisplayProps {
  repository: RepositoryInfo | null;
  onDisconnect: () => void;
}

const RepositoryDisplay: React.FC<RepositoryDisplayProps> = ({
  repository,
  onDisconnect
}) => {
  if (!repository) return null;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Connected Repository</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDisconnect}
          className="text-destructive hover:text-destructive"
        >
          Disconnect
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{repository.name}</span>
          <Badge variant="outline" className="text-xs">
            {repository.branch}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(repository.url, '_blank')}
            className="h-6 p-1"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          {repository.filesCount} files cloned
        </div>

        {repository.files.length > 0 && (
          <div className="max-h-24 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 text-xs">
              {repository.files.slice(0, 10).map((file, index) => (
                <div key={index} className="flex items-center gap-1 text-muted-foreground">
                  {file.includes('/') ? (
                    <Folder className="w-3 h-3 text-blue-400" />
                  ) : (
                    <File className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="truncate">{file}</span>
                </div>
              ))}
              {repository.files.length > 10 && (
                <div className="text-xs text-muted-foreground col-span-2">
                  ... and {repository.files.length - 10} more files
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryDisplay;
