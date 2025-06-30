
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  fileId?: string;
}

interface UploadProgressProps {
  files: File[];
  onUploadComplete: (fileIds: string[]) => void;
  onRemoveFile: (fileId: string) => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ files, onUploadComplete, onRemoveFile }) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const updateFileStatus = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 0 });

      // Step 1: Prepare upload
      const { data: uploadData, error: prepError } = await supabase.functions.invoke('upload-to-s3', {
        body: {
          fileName: uploadFile.file.name,
          fileSize: uploadFile.file.size,
          fileType: uploadFile.file.type,
          ministryId: null, // Could be set based on user context
          notes: ''
        }
      });

      if (prepError) throw prepError;

      updateFileStatus(uploadFile.id, { progress: 25, fileId: uploadData.fileId });

      // Step 2: Upload to S3 (simulated progress)
      const uploadToS3 = async () => {
        // In a real implementation, this would use AWS SDK with progress tracking
        for (let progress = 25; progress <= 90; progress += 5) {
          await new Promise(resolve => setTimeout(resolve, 100));
          updateFileStatus(uploadFile.id, { progress });
        }
      };

      await uploadToS3();
      updateFileStatus(uploadFile.id, { progress: 90, status: 'processing' });

      // Step 3: Complete processing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      updateFileStatus(uploadFile.id, { progress: 100, status: 'completed' });

      return uploadData.fileId;
    } catch (error) {
      console.error('Upload error:', error);
      updateFileStatus(uploadFile.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
      return null;
    }
  };

  const startUploads = useCallback(async () => {
    const newUploadFiles = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadFiles(newUploadFiles);

    const uploadPromises = newUploadFiles.map(uploadFile => uploadFile(uploadFile));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(Boolean) as string[];
    
    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);
      toast({
        title: "Upload completed",
        description: `${successfulUploads.length} file(s) uploaded successfully`,
      });
    }
  }, [files, onUploadComplete, toast]);

  React.useEffect(() => {
    if (files.length > 0 && uploadFiles.length === 0) {
      startUploads();
    }
  }, [files, uploadFiles.length, startUploads]);

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Upload className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: UploadFile['status']) => {
    const variants = {
      pending: { variant: 'outline' as const, label: 'Pending' },
      uploading: { variant: 'default' as const, label: 'Uploading' },
      processing: { variant: 'secondary' as const, label: 'Processing' },
      completed: { variant: 'default' as const, label: 'Completed' },
      error: { variant: 'destructive' as const, label: 'Error' }
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (uploadFiles.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          File Upload Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadFiles.map((uploadFile) => (
          <div key={uploadFile.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {getStatusIcon(uploadFile.status)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(uploadFile.status)}
                <Button
                  onClick={() => onRemoveFile(uploadFile.id)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Progress value={uploadFile.progress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{uploadFile.progress}% complete</span>
                {uploadFile.status === 'error' && uploadFile.error && (
                  <span className="text-red-600">{uploadFile.error}</span>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {uploadFiles.filter(f => f.status === 'completed').length} of {uploadFiles.length} completed
            </span>
            <span className="text-gray-600">
              Total: {formatFileSize(uploadFiles.reduce((sum, f) => sum + f.file.size, 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadProgress;
