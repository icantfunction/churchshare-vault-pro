
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { FileWithMinistry } from '@/types/database';

export interface FileData {
  id: string;
  name: string;
  type: string;
  ministry: string;
  ministry_id: string;
  eventDate: string;
  uploadedBy: string;
  size: string;
  thumbnail?: string;
  downloadUrl?: string;
  sizeBytes: number;
}

const isDevelopment = import.meta.env.DEV;

const debugLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(`[DEBUG-MYFILES] ${message}`, ...args);
  }
};

export const useFiles = () => {
  const { user, profile } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);

  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  const fetchFiles = async () => {
    try {
      setLoading(true);
      debugLog('Fetching files for user:', user?.id, 'role:', profile?.role);
      
      // Test current_user_role function first
      const { data: roleData, error: roleError } = await supabase.rpc('current_user_role');
      debugLog('current_user_role():', roleData, roleError);
      
      const { data: filesData, error } = await supabase
        .from('files')
        .select(`
          id,
          file_name,
          file_type,
          file_size,
          file_url,
          preview_key,
          event_date,
          uploader_id,
          ministry_id,
          notes,
          created_at,
          ministries!left(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[DEBUG-MYFILES] Error fetching files:', error);
        throw error;
      }

      debugLog('Raw files data:', filesData);
      debugLog('Files count:', filesData?.length || 0);

      // Log each file's visibility criteria
      if (filesData && isDevelopment) {
        filesData.forEach((file, index) => {
          debugLog(`File ${index + 1}:`, {
            id: file.id,
            name: file.file_name,
            ministry_id: file.ministry_id,
            uploader_id: file.uploader_id,
            user_ministry: profile?.ministry_id,
            is_uploader: file.uploader_id === user?.id,
            user_role: profile?.role
          });
        });
      }

      const transformedFiles: FileData[] = (filesData || []).map((file: FileWithMinistry) => {
        // Handle ministry data - it should be an object, not an array
        const ministryName = file.ministries?.name || 'Unassigned Ministry';
          
        return {
          id: file.id,
          name: file.file_name || 'Untitled',
          type: getFileType(file.file_type || ''),
          ministry: ministryName,
          ministry_id: file.ministry_id || '',
          eventDate: file.event_date || new Date().toISOString().split('T')[0],
          uploadedBy: 'User',
          size: formatFileSize(file.file_size || 0),
          // Remove thumbnail and downloadUrl - these will be generated by the edge function
          sizeBytes: file.file_size || 0,
        };
      });

      debugLog('Transformed files:', transformedFiles);
      debugLog('Final count:', transformedFiles.length);
      setFiles(transformedFiles);
    } catch (error) {
      console.error('[DEBUG-MYFILES] Error in fetchFiles:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      debugLog('Starting fetchFiles...');
      fetchFiles();
    } else {
      debugLog('No user or profile, skipping fetch');
      setLoading(false);
    }
  }, [user, profile]);

  return { files, loading, refetch: fetchFiles };
};
