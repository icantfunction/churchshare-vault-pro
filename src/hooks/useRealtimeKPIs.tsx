
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
  
  const { profile } = useAuth();

  const fetchKPIs = async () => {
    if (!profile) return;

    try {
      const isAdmin = profile.role === 'Admin' || profile.role === 'Director' || profile.role === 'SuperOrg';
      
      // Base query for files
      let filesQuery = supabase
        .from('files')
        .select('file_size, created_at, uploader_id');

      // If not admin, filter by user's files only
      if (!isAdmin) {
        filesQuery = filesQuery.eq('uploader_id', profile.id);
      }

      const { data: files, error } = await filesQuery;

      if (error) {
        console.error('Error fetching KPI data:', error);
        return;
      }

      // Calculate totals
      const totalFiles = files?.length || 0;
      const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
      
      // Calculate recent files (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentFiles = files?.filter(file => 
        new Date(file.created_at) > oneWeekAgo
      ).length || 0;

      setKpiData({
        totalFiles,
        totalSize,
        recentFiles,
        loading: false,
      });
    } catch (error) {
      console.error('Error in fetchKPIs:', error);
      setKpiData(prev => ({ ...prev, loading: false }));
    }
  };

  const refreshKPIs = () => {
    setKpiData(prev => ({ ...prev, loading: true }));
    fetchKPIs();
  };

  useEffect(() => {
    if (profile) {
      fetchKPIs();
    }
  }, [profile]);

  // Set up real-time subscription
  useEffect(() => {
    if (!profile) return;

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
          fetchKPIs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  return { kpiData, refreshKPIs };
};
