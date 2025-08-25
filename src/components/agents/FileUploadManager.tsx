
import React from 'react';
import { X, File, Folder, Code, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  language: string;
}

interface FileUploadManagerProps {
  files: UploadedFile[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  files,
  onRemoveFile,
  onClearAll
}) => {
  const getFileIcon = (language: string, name: string) => {
    if (name.includes('/')) return <Folder className="w-4 h-4 text-blue-500" />;
    if (['JavaScript', 'TypeScript', 'Python', 'Java'].includes(language)) {
      return <Code className="w-4 h-4 text-green-500" />;
    }
    if (['HTML', 'CSS', 'Markdown'].includes(language)) {
      return <FileText className="w-4 h-4 text-orange-500" />;
    }
    if (language === 'Image') {
      return <Image className="w-4 h-4 text-purple-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">
            Uploaded Files ({files.length})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-destructive hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <div className="max-h-32 overflow-y-auto space-y-1">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-background rounded border"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getFileIcon(file.language, file.name)}
              <span className="text-xs truncate flex-1">{file.path}</span>
              <Badge variant="secondary" className="text-xs">
                {file.language}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFile(index)}
              className="h-6 w-6 p-0 hover:bg-destructive/10"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadManager;
