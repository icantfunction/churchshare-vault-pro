
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  sizeBytes: number;
}

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
      console.log('[DEBUG-MYFILES] Fetching files for user:', user?.id);
      
      const { data: filesData, error } = await supabase
        .from('files')
        .select(`
          id,
          file_name,
          file_type,
          file_size,
          file_url,
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

      console.log('[DEBUG-MYFILES] Raw files data:', filesData);

      const transformedFiles: FileData[] = (filesData || []).map(file => {
        const ministryName = (file.ministries && file.ministries.length > 0) 
          ? file.ministries[0]?.name || 'Unassigned Ministry'
          : 'Unassigned Ministry';
          
        return {
          id: file.id,
          name: file.file_name || 'Untitled',
          type: getFileType(file.file_type || ''),
          ministry: ministryName,
          ministry_id: file.ministry_id || '',
          eventDate: file.event_date || new Date().toISOString().split('T')[0],
          uploadedBy: 'User',
          size: formatFileSize(file.file_size || 0),
          thumbnail: file.file_url,
          sizeBytes: file.file_size || 0,
        };
      });

      console.log('[DEBUG-MYFILES] Transformed files:', transformedFiles);
      setFiles(transformedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchFiles();
    }
  }, [user, profile]);

  return { files, loading, refetch: fetchFiles };
};
