
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface KPIData {
  totalFiles: number;
  totalSize: number;
  recentFiles: number;
  loading: boolean;
}

const isDevelopment = import.meta.env.DEV;

const debugLog = (message: string, ...args: any[]) => {
  if (isDevelopment) {
    console.log(`[DEBUG-KPI] ${message}`, ...args);
  }
};

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
      debugLog('Fetching KPIs for user:', user.id, 'role:', profile.role);
      
      // Use the new RPC function for server-side aggregation
      const { data, error } = await supabase
        .rpc('get_user_kpis', { user_id_param: user.id })
        .single();

      if (error) {
        console.error('[DEBUG-KPI] Error fetching KPI data:', error);
        return;
      }

      debugLog('KPI data received:', data);

      const kpiResults = {
        totalFiles: Number(data.total_files) || 0,
        totalSize: Number(data.total_size) || 0,
        recentFiles: Number(data.recent_files) || 0,
        loading: false,
      };

      debugLog('Calculated KPIs:', kpiResults);
      setKpiData(kpiResults);
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
          debugLog('Real-time update triggered');
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
