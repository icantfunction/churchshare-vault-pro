
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';
import { fetchUserProfile } from './profileService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileRetryCount, setProfileRetryCount] = useState(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const fetchProfileWithRetry = useCallback(async (userId: string, retryCount = 0) => {
    console.log(`[DEBUG-PROFILE] Attempting to fetch profile for user ${userId}, retry ${retryCount}`);
    
    try {
      const userProfile = await fetchUserProfile(userId);
      console.log('[DEBUG-PROFILE] Profile fetched successfully:', userProfile);
      setProfile(userProfile);
      setProfileError(null);
      setProfileRetryCount(0);
      return userProfile;
    } catch (error) {
      console.error(`[DEBUG-PROFILE] Profile fetch failed (attempt ${retryCount + 1}):`, error);
      
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`[DEBUG-PROFILE] Retrying profile fetch in ${RETRY_DELAY}ms...`);
        setProfileRetryCount(retryCount + 1);
        
        setTimeout(() => {
          fetchProfileWithRetry(userId, retryCount + 1);
        }, RETRY_DELAY);
      } else {
        console.error('[DEBUG-PROFILE] Max retry attempts reached, giving up');
        setProfile(null);
        const errorMessage = error instanceof Error ? error.message : 'Profile fetch failed after retries';
        setProfileError(errorMessage);
        setProfileRetryCount(0);
      }
    }
  }, []);

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('[DEBUG-114] AuthProvider: Auth state change event:', event, 'Session exists:', !!session);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      console.log('[DEBUG-117] AuthProvider: User authenticated, fetching profile...');
      
      try {
        setProfileError(null);
        setProfileRetryCount(0);
        
        // Add timeout to profile fetching to prevent infinite loading
        const profilePromise = fetchProfileWithRetry(session.user.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
        );
        
        await Promise.race([profilePromise, timeoutPromise]);
        console.log('[DEBUG-119] AuthProvider: Profile loaded successfully');
      } catch (error) {
        console.error('[DEBUG-120] AuthProvider: Profile fetch failed:', error);
        // Don't clear profile immediately - let retry logic handle it
        const errorMessage = error instanceof Error ? error.message : 'Profile fetch failed';
        setProfileError(errorMessage);
        
        // Continue without profile - don't block user access
        console.log('[DEBUG-121] AuthProvider: Continuing without profile due to error');
      } finally {
        // Always set loading to false, regardless of profile success/failure
        console.log('[DEBUG-122] AuthProvider: Setting loading to false');
        setLoading(false);
      }
    } else {
      console.log('[DEBUG-123] AuthProvider: No user session, clearing profile');
      setProfile(null);
      setProfileError(null);
      setProfileRetryCount(0);
      setLoading(false);
    }
  }, [fetchProfileWithRetry]);

  const signOut = useCallback(async () => {
    console.log('[DEBUG-129] AuthProvider: Sign out initiated');
    
    try {
      // Clear state immediately to prevent conflicts
      setLoading(true);
      setProfile(null);
      setProfileError(null);
      setProfileRetryCount(0);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[DEBUG-707] AuthProvider: Sign out error:', error);
      } else {
        console.log('[DEBUG-130] AuthProvider: Successfully signed out');
      }
    } catch (error) {
      console.error('[DEBUG-708] AuthProvider: Exception in signOut:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Monitor profile state changes for debugging
  useEffect(() => {
    console.log('[DEBUG-PROFILE-STATE] Profile state changed:', {
      hasProfile: !!profile,
      profileRole: profile?.role,
      profileError,
      profileRetryCount,
      loading
    });
  }, [profile, profileError, profileRetryCount, loading]);

  return {
    user,
    profile,
    session,
    loading,
    profileError,
    profileRetryCount,
    signOut,
    handleAuthStateChange,
    refreshProfile: useCallback(() => {
      if (user?.id) {
        console.log('[DEBUG-PROFILE] Manual profile refresh requested');
        fetchProfileWithRetry(user.id);
      }
    }, [user?.id, fetchProfileWithRetry])
  };
};
