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
  ministryId: string;
  eventDate?: string;
  notes?: string;
  onUploadComplete: (fileIds: string[]) => void;
  onRemoveFile: (fileId: string) => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ 
  files, 
  ministryId, 
  eventDate, 
  notes, 
  onUploadComplete, 
  onRemoveFile 
}) => {
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

  const uploadSingleFile = async (uploadFile: UploadFile) => {
    try {
      updateFileStatus(uploadFile.id, { status: 'uploading', progress: 0 });

      console.log('[DEBUG] Starting upload for:', uploadFile.file.name, 'ministry:', ministryId);
      console.log('[DEBUG] File details:', {
        name: uploadFile.file.name,
        size: uploadFile.file.size,
        type: uploadFile.file.type,
        ministryId,
        eventDate,
        notes
      });

      // Step 1: Prepare upload using Edge Function with ministry ID
      const requestBody = {
        fileName: uploadFile.file.name, // This will be the custom filename from FileRename
        fileSize: uploadFile.file.size,
        fileType: uploadFile.file.type,
        ministryId: ministryId,
        eventDate: eventDate,
        notes: notes
      };

      console.log('[DEBUG] Request body being sent to edge function:', requestBody);
      console.log('[DEBUG] Ministry ID details:', {
        ministryId,
        type: typeof ministryId,
        length: ministryId?.length,
        isEmpty: !ministryId || ministryId.trim() === ''
      });

      const { data: uploadData, error: prepError } = await supabase.functions.invoke('upload-to-s3', {
        body: requestBody
      });

      console.log('[DEBUG] Edge function response received:', {
        data: uploadData,
        error: prepError,
        hasData: !!uploadData,
        hasError: !!prepError,
        errorType: prepError?.constructor?.name
      });

      if (prepError) {
        console.error('[DEBUG] Upload preparation error:', prepError);
        console.error('[DEBUG] Full error details:', {
          message: prepError.message,
          details: prepError.details,
          hint: prepError.hint,
          code: prepError.code
        });
        
        let userMessage = 'Upload failed';
        
        try {
          // Try to parse structured error response from edge function
          let errorData = prepError;
          
          // If the error contains JSON, try to parse it
          if (typeof prepError.message === 'string' && prepError.message.includes('{')) {
            try {
              const jsonStart = prepError.message.indexOf('{');
              const jsonPart = prepError.message.substring(jsonStart);
              errorData = JSON.parse(jsonPart);
            } catch (parseError) {
              console.warn('[DEBUG] Could not parse JSON from error message:', parseError);
            }
          }
          
          // Handle specific error codes from the edge function
          if (errorData.code) {
            switch (errorData.code) {
              case 'AWS_CONFIG_MISSING':
                userMessage = 'Server configuration error: AWS credentials not configured. Please contact your administrator.';
                break;
              case 'SUPABASE_CONFIG_MISSING':
                userMessage = 'Server configuration error: Database connection not configured. Please contact your administrator.';
                break;
              case 'PROFILE_FETCH_ERROR':
              case 'PROFILE_NOT_FOUND':
                userMessage = 'User profile error. Please complete your registration or contact support.';
                break;
              case 'INSUFFICIENT_PERMISSIONS':
                userMessage = errorData.userRole === 'Director' ? 
                  'Directors can upload to any ministry. Please select a ministry from the dropdown.' :
                  `You can only upload to your assigned ministry. Your ministry: ${errorData.userMinistry || 'None'}`;
                break;
              case 'MINISTRY_NOT_FOUND':
                userMessage = 'The selected ministry does not exist. Please select a valid ministry.';
                break;
              default:
                userMessage = errorData.message || 'Upload failed';
            }
          } else {
            // Fallback to pattern matching for older error formats
            if (prepError.message.includes('AWS configuration error')) {
              userMessage = 'Server configuration issue: Missing AWS credentials. Please contact support.';
            } else if (prepError.message.includes('Missing authorization')) {
              userMessage = 'Authentication error: Please log out and log back in.';
            } else if (prepError.message.includes('permission')) {
              userMessage = 'Permission denied: You cannot upload to this ministry.';
            } else if (prepError.message.includes('Ministry ID is required')) {
              userMessage = 'Please select a ministry before uploading files.';
            } else if (prepError.message.includes('File name is required')) {
              userMessage = 'Invalid file: File name is required.';
            } else {
              userMessage = prepError.message || 'Upload preparation failed';
            }
          }
        } catch (parseError) {
          console.warn('[DEBUG] Error parsing error response:', parseError);
          userMessage = prepError.message || 'Upload failed';
        }
        
        throw new Error(userMessage);
      }

      console.log('[DEBUG] Upload data received:', uploadData);
      updateFileStatus(uploadFile.id, { progress: 25, fileId: uploadData.fileId });

      // Step 2: Upload to S3 using the presigned URL
      const uploadToS3 = async () => {
        console.log('[DEBUG] Uploading to S3:', uploadData.uploadUrl);
        
        console.log('[DEBUG] Starting S3 upload with URL:', uploadData.uploadUrl);
        console.log('[DEBUG] Upload headers:', {
          'Content-Type': uploadFile.file.type,
        });
        
        const uploadResponse = await fetch(uploadData.uploadUrl, {
          method: 'PUT',
          body: uploadFile.file,
          headers: {
            'Content-Type': uploadFile.file.type,
          },
        });

        console.log('[DEBUG] S3 upload response:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          headers: Array.from(uploadResponse.headers.entries())
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('[DEBUG] S3 upload failed:', {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            errorText,
            url: uploadData.uploadUrl
          });
          throw new Error(`S3 upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
        }

        console.log('[DEBUG] S3 upload successful');
        return uploadResponse;
      };

      await uploadToS3();
      updateFileStatus(uploadFile.id, { progress: 70, status: 'processing' });

      // Step 3: Trigger post-upload processing now that file is in S3
      console.log('[DEBUG] Triggering post-upload processing...');
      const { data: processingData, error: processingError } = await supabase.functions.invoke('trigger-post-upload-processing', {
        body: {
          fileId: uploadData.fileId,
          fileKey: uploadData.fileKey,
          previewKey: uploadData.previewKey,
          fileType: uploadFile.file.type
        }
      });

      if (processingError) {
        console.error('[DEBUG] Post-upload processing error:', processingError);
        // Don't fail the upload for processing errors, just log them
        console.warn('[DEBUG] Upload succeeded but processing failed:', processingError.message);
      } else {
        console.log('[DEBUG] Post-upload processing triggered successfully:', processingData);
      }

      updateFileStatus(uploadFile.id, { progress: 100, status: 'completed' });

      console.log('[DEBUG] Upload completed for:', uploadFile.file.name);
      return uploadData.fileId;
    } catch (error) {
      console.error('[DEBUG] Upload error for', uploadFile.file.name, ':', error);
      updateFileStatus(uploadFile.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
      return null;
    }
  };

  const startUploads = useCallback(async () => {
    if (!ministryId) {
      toast({
        title: "Ministry Required",
        description: "Please select a ministry before uploading files",
        variant: "destructive"
      });
      return;
    }

    const newUploadFiles = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setUploadFiles(newUploadFiles);

    const uploadPromises = newUploadFiles.map(uploadFile => uploadSingleFile(uploadFile));
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(Boolean) as string[];
    
    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);
      toast({
        title: "Upload completed",
        description: `${successfulUploads.length} file(s) uploaded successfully`,
      });
    }
  }, [files, ministryId, eventDate, notes, onUploadComplete, toast]);

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
