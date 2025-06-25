
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  role: 'Admin' | 'MinistryLeader' | 'Member' | 'Director' | 'SuperOrg';
  ministry_id: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  created_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
}

console.log('[DEBUG-100] AuthContext: Module loading started');

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  console.log('[DEBUG-101] AuthContext: useAuth hook called');
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('[DEBUG-702] AuthContext: useAuth called outside AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  console.log('[DEBUG-102] AuthContext: useAuth returning context', { 
    hasUser: !!context.user, 
    loading: context.loading,
    hasProfile: !!context.profile 
  });
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[DEBUG-103] AuthProvider: Component initialization started');
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  console.log('[DEBUG-104] AuthProvider: Initial state set', { loading });

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    console.log('[DEBUG-105] AuthProvider: fetchUserProfile started for userId:', userId);
    console.time('[DEBUG-801] Profile fetch timing');
    
    try {
      setProfileError(null);
      console.log('[DEBUG-106] AuthProvider: Making Supabase profile query');
      console.log('[DEBUG-150] AuthProvider: Database connection check starting');
      
      // Test database connection first
      const { error: connectionError } = await supabase.from('users').select('count').limit(1);
      if (connectionError) {
        console.error('[DEBUG-151] AuthProvider: Database connection failed:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }
      console.log('[DEBUG-152] AuthProvider: Database connection successful');
      
      console.log('[DEBUG-153] AuthProvider: Executing user profile query');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.timeEnd('[DEBUG-801] Profile fetch timing');

      if (error) {
        console.error('[DEBUG-703] AuthProvider: Profile fetch error:', error);
        console.log('[DEBUG-154] AuthProvider: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        if (error.code === 'PGRST116') {
          console.log('[DEBUG-155] AuthProvider: No user record found in database');
          setProfileError('User profile not found. Please contact administrator.');
        } else if (error.code === '42501') {
          console.log('[DEBUG-156] AuthProvider: RLS policy blocking access');
          setProfileError('Access denied. Please check permissions.');
        } else {
          setProfileError(error.message);
        }
        return null;
      }

      if (!data) {
        console.log('[DEBUG-157] AuthProvider: No data returned from query');
        setProfileError('User profile not found');
        return null;
      }

      console.log('[DEBUG-107] AuthProvider: Profile fetched successfully:', data);
      const profile = {
        id: data.id,
        email: data.email,
        role: data.role as 'Admin' | 'MinistryLeader' | 'Member' | 'Director' | 'SuperOrg',
        ministry_id: data.ministry_id,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        created_at: data.created_at
      } as UserProfile;
      
      return profile;
    } catch (error) {
      console.timeEnd('[DEBUG-801] Profile fetch timing');
      console.error('[DEBUG-704] AuthProvider: Exception in fetchUserProfile:', error);
      console.log('[DEBUG-158] AuthProvider: Full error object:', JSON.stringify(error, null, 2));
      setProfileError('Failed to load user profile');
      return null;
    }
  }, []);

  useEffect(() => {
    console.log('[DEBUG-108] AuthProvider: Main useEffect started');
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout;
    
    // Failsafe timeout to prevent infinite loading
    const setLoadingTimeout = () => {
      console.log('[DEBUG-159] AuthProvider: Setting failsafe loading timeout');
      loadingTimeout = setTimeout(() => {
        if (mounted) {
          console.warn('[DEBUG-160] AuthProvider: Loading timeout reached, forcing loading to false');
          setLoading(false);
        }
      }, 10000); // 10 second timeout
    };
    
    const clearLoadingTimeout = () => {
      if (loadingTimeout) {
        console.log('[DEBUG-161] AuthProvider: Clearing loading timeout');
        clearTimeout(loadingTimeout);
      }
    };
    
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('[DEBUG-109] AuthProvider: Auth state change event:', event, 'Session exists:', !!session);
      
      if (!mounted) {
        console.log('[DEBUG-110] AuthProvider: Component unmounted, skipping auth state change');
        return;
      }
      
      clearLoadingTimeout();
      
      console.log('[DEBUG-111] AuthProvider: Setting session and user state');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('[DEBUG-112] AuthProvider: User authenticated, fetching profile...');
        console.log('[DEBUG-162] AuthProvider: Starting profile fetch with timeout protection');
        
        try {
          const userProfile = await Promise.race([
            fetchUserProfile(session.user.id),
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
            )
          ]);
          
          if (mounted) {
            console.log('[DEBUG-113] AuthProvider: Setting profile state:', !!userProfile);
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('[DEBUG-163] AuthProvider: Profile fetch failed or timed out:', error);
          if (mounted) {
            setProfile(null);
            setProfileError(error instanceof Error ? error.message : 'Profile fetch failed');
          }
        }
      } else {
        console.log('[DEBUG-114] AuthProvider: No user session, clearing profile');
        if (mounted) {
          setProfile(null);
          setProfileError(null);
        }
      }
      
      if (mounted) {
        console.log('[DEBUG-115] AuthProvider: Setting loading to false');
        console.log('[DEBUG-900] State transition: Loading → Loaded');
        setLoading(false);
      }
    };

    console.log('[DEBUG-116] AuthProvider: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    const initializeAuth = async () => {
      console.log('[DEBUG-117] AuthProvider: Initializing auth...');
      console.time('[DEBUG-802] Initial session fetch timing');
      
      setLoadingTimeout();
      
      try {
        console.log('[DEBUG-164] AuthProvider: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.timeEnd('[DEBUG-802] Initial session fetch timing');
        
        if (error) {
          console.error('[DEBUG-705] AuthProvider: Error getting session:', error);
        } else {
          console.log('[DEBUG-118] AuthProvider: Initial session retrieved:', !!session);
        }

        if (mounted) {
          console.log('[DEBUG-119] AuthProvider: Processing initial session');
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.timeEnd('[DEBUG-802] Initial session fetch timing');
        console.error('[DEBUG-706] AuthProvider: Exception in initializeAuth:', error);
        if (mounted) {
          console.log('[DEBUG-120] AuthProvider: Setting loading to false due to error');
          clearLoadingTimeout();
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('[DEBUG-121] AuthProvider: Cleanup started');
      mounted = false;
      clearLoadingTimeout();
      subscription.unsubscribe();
      console.log('[DEBUG-122] AuthProvider: Cleanup complete');
    };
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    console.log('[DEBUG-123] AuthProvider: Sign out initiated');
    console.time('[DEBUG-803] Sign out timing');
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      console.timeEnd('[DEBUG-803] Sign out timing');
      
      if (error) {
        console.error('[DEBUG-707] AuthProvider: Sign out error:', error);
      } else {
        console.log('[DEBUG-124] AuthProvider: Successfully signed out');
      }
    } catch (error) {
      console.timeEnd('[DEBUG-803] Sign out timing');
      console.error('[DEBUG-708] AuthProvider: Exception in signOut:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = {
    user,
    profile,
    session,
    loading,
    profileError,
    signOut
  };

  console.log('[DEBUG-125] AuthProvider: Rendering with context value', {
    hasUser: !!user,
    hasProfile: !!profile,
    hasSession: !!session,
    loading,
    profileError
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
