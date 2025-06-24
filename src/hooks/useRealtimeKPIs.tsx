
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface KPIData {
  totalFiles: number;
  totalSize: number;
  recentFiles: number;
  loading: boolean;
}

export const useRealtimeKPIs = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalFiles: 0,
    totalSize: 0,
    recentFiles: 0,
    loading: true
  });
  const { profile } = useAuth();

  const refreshKPIs = async () => {
    if (!profile?.organisation_id) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('created_at')
        .eq('organisation_id', profile.organisation_id);

      if (error) throw error;

      const totalFiles = data?.length || 0;
      // Since we don't have file_size column, we'll set totalSize to 0 for now
      const totalSize = 0;
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentFiles = data?.filter(file => 
        new Date(file.created_at) > weekAgo
      ).length || 0;

      setKpiData({
        totalFiles,
        totalSize,
        recentFiles,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setKpiData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!profile?.organisation_id) return;

    // Initial load
    refreshKPIs();

    // Set up realtime subscription
    const channel = supabase
      .channel('files_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
          filter: `organisation_id=eq.${profile.organisation_id}`
        },
        () => {
          console.log('Files changed, refreshing KPIs...');
          refreshKPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organisation_id]);

  return { kpiData, refreshKPIs };
};
