
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ministry {
  id: string;
  name: string;
  description?: string;
}

export const useMinistries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const { data, error } = await supabase
          .from('ministries')
          .select('id, name, description')
          .order('name');

        if (error) throw error;

        setMinistries(data || []);
      } catch (error) {
        console.error('Error fetching ministries:', error);
        toast({
          title: "Error loading ministries",
          description: "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMinistries();
  }, [toast]);

  return { ministries, isLoading };
};
