
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

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    console.log('[DEBUG-114] AuthProvider: Auth state change event:', event, 'Session exists:', !!session);
    
    setSession(session);
    setUser(session?.user ?? null);
    
    if (session?.user) {
      console.log('[DEBUG-117] AuthProvider: User authenticated, fetching profile...');
      
      try {
        setProfileError(null);
        const userProfile = await fetchUserProfile(session.user.id);
        setProfile(userProfile);
        console.log('[DEBUG-119] AuthProvider: Profile loaded successfully:', !!userProfile);
      } catch (error) {
        console.error('[DEBUG-120] AuthProvider: Profile fetch failed:', error);
        setProfile(null);
        const errorMessage = error instanceof Error ? error.message : 'Profile fetch failed';
        setProfileError(errorMessage);
        
        // Don't block user access for profile issues
        console.log('[DEBUG-121] AuthProvider: Continuing without profile due to error');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('[DEBUG-122] AuthProvider: No user session, clearing profile');
      setProfile(null);
      setProfileError(null);
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    console.log('[DEBUG-129] AuthProvider: Sign out initiated');
    
    try {
      // Clear state immediately to prevent conflicts
      setLoading(true);
      setProfile(null);
      setProfileError(null);
      
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

  return {
    user,
    profile,
    session,
    loading,
    profileError,
    signOut,
    handleAuthStateChange
  };
};
