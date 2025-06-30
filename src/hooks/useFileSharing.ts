
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareLink {
  id: string;
  shareUrl: string;
  secret: string;
  expiresAt: string | null;
  fileName: string;
  createdAt: string;
}

export const useFileSharing = () => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createShareLink = useCallback(async (
    fileId: string, 
    expiresIn: '30min' | '24h' | '7days' | 'never' = '24h'
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-share-link', {
        body: {
          fileId,
          expiresIn
        }
      });

      if (error) throw error;

      const newShareLink: ShareLink = {
        id: data.shareId,
        shareUrl: data.shareUrl,
        secret: data.secret,
        expiresAt: data.expiresAt,
        fileName: data.fileName,
        createdAt: new Date().toISOString()
      };

      setShareLinks(prev => [newShareLink, ...prev]);
      
      toast({
        title: "Share link created",
        description: `Link ${expiresIn === 'never' ? 'never expires' : `expires in ${expiresIn}`}`,
      });

      return newShareLink;
    } catch (error) {
      console.error('Share creation error:', error);
      toast({
        title: "Error creating share link",
        description: "Please try again",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchShareLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_shares')
        .select(`
          id,
          secret,
          expires_at,
          created_at,
          files (
            file_name,
            file_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLinks: ShareLink[] = data.map(share => ({
        id: share.id,
        shareUrl: `${window.location.origin}/share/${share.secret}`,
        secret: share.secret,
        expiresAt: share.expires_at,
        fileName: share.files?.file_name || 'Unknown',
        createdAt: share.created_at
      }));

      setShareLinks(formattedLinks);
    } catch (error) {
      console.error('Error fetching share links:', error);
      toast({
        title: "Error loading share links",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const deleteShareLink = useCallback(async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('file_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      setShareLinks(prev => prev.filter(link => link.id !== shareId));
      
      toast({
        title: "Share link deleted",
        description: "The share link has been removed",
      });
    } catch (error) {
      console.error('Error deleting share link:', error);
      toast({
        title: "Error deleting share link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  }, [toast]);

  const copyToClipboard = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    shareLinks,
    isLoading,
    createShareLink,
    fetchShareLinks,
    deleteShareLink,
    copyToClipboard
  };
};
