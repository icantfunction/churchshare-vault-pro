
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { SupportRequest, SupportRequestInsert } from '@/types/database';

export const useSupportRequests = () => {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching support requests:', error);
      toast({
        title: "Error",
        description: "Failed to load support requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequest = async (requestData: Omit<SupportRequestInsert, 'user_id'>) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to create a support request",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_id: profile.id,
          ...requestData
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Support request created successfully"
      });

      await fetchRequests();
      return true;
    } catch (error) {
      console.error('Error creating support request:', error);
      toast({
        title: "Error",
        description: "Failed to create support request",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    createRequest,
    refetch: fetchRequests
  };
};
