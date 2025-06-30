
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDebugFiles = () => {
  const { user, profile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugQuery = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      console.log('[DEBUG-FILES] Starting debug queries...');
      
      // 1. Test current_user_role() function
      const { data: roleData, error: roleError } = await supabase
        .rpc('current_user_role');
      
      console.log('[DEBUG-FILES] current_user_role() result:', roleData, roleError);

      // 2. Get user profile info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      console.log('[DEBUG-FILES] User profile:', userData, userError);

      // 3. Try to get all files (should work for Director)
      const { data: allFiles, error: allFilesError } = await supabase
        .from('files')
        .select('id, file_name, ministry_id, uploader_id, created_at');
      
      console.log('[DEBUG-FILES] All files query:', allFiles, allFilesError);

      // 4. Try to get files with specific conditions
      const { data: userFiles, error: userFilesError } = await supabase
        .from('files')
        .select('id, file_name, ministry_id, uploader_id, created_at')
        .eq('uploader_id', user.id);
      
      console.log('[DEBUG-FILES] User uploaded files:', userFiles, userFilesError);

      // 5. Get ministry info if user has one
      let ministryData = null;
      if (userData?.ministry_id) {
        const { data: ministry, error: ministryError } = await supabase
          .from('ministries')
          .select('*')
          .eq('id', userData.ministry_id)
          .single();
        
        console.log('[DEBUG-FILES] User ministry:', ministry, ministryError);
        ministryData = ministry;
      }

      setDebugInfo({
        userRole: roleData,
        roleError,
        userProfile: userData,
        userError,
        allFiles,
        allFilesError,
        userFiles,
        userFilesError,
        ministry: ministryData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('[DEBUG-FILES] Debug query failed:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      runDebugQuery();
    }
  }, [user, profile]);

  return { debugInfo, loading, runDebugQuery };
};
