
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
    loading: true,
  });
  
  const { profile, user } = useAuth();

  const fetchKPIs = async () => {
    if (!profile || !user) return;

    try {
      console.log('[DEBUG-KPI] Fetching KPIs for user:', user.id, 'role:', profile.role);
      
      // Use the same query logic as useFiles to ensure consistency
      const { data: files, error } = await supabase
        .from('files')
        .select('file_size, created_at, uploader_id, ministry_id');

      if (error) {
        console.error('[DEBUG-KPI] Error fetching KPI data:', error);
        return;
      }

      console.log('[DEBUG-KPI] Files for KPI calculation:', files?.length || 0);

      // Calculate totals based on the files the user can actually see
      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      
      // Calculate recent files (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentFiles = files?.filter(file => 
        new Date(file.created_at) > oneWeekAgo
      ).length || 0;

      console.log('[DEBUG-KPI] Calculated KPIs:', { totalFiles, totalSize, recentFiles });

      setKpiData({
        totalFiles,
        totalSize,
        recentFiles,
        loading: false,
      });
    } catch (error) {
      console.error('[DEBUG-KPI] Error in fetchKPIs:', error);
      setKpiData(prev => ({ ...prev, loading: false }));
    }
  };

  const refreshKPIs = () => {
    setKpiData(prev => ({ ...prev, loading: true }));
    fetchKPIs();
  };

  useEffect(() => {
    if (profile && user) {
      fetchKPIs();
    }
  }, [profile, user]);

  // Set up real-time subscription
  useEffect(() => {
    if (!profile || !user) return;

    const channel = supabase
      .channel('kpi-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files'
        },
        () => {
          console.log('[DEBUG-KPI] Real-time update triggered');
          fetchKPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, user]);

  return { kpiData, refreshKPIs };
};
