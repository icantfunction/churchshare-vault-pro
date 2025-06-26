
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
    
    try {
      setProfileError(null);
      console.log('[DEBUG-106] AuthProvider: Making Supabase profile query');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[DEBUG-703] AuthProvider: Profile fetch error:', error);
        
        if (error.code === 'PGRST116') {
          console.log('[DEBUG-107] AuthProvider: No user record found, might be new user - waiting for trigger');
          
          // For new users, wait a moment for the trigger to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Try one more time
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (retryError || !retryData) {
            console.log('[DEBUG-108] AuthProvider: Still no profile after retry, user can continue without profile');
            setProfileError('Profile loading delayed. You can still use the application.');
            return null;
          }
          
          console.log('[DEBUG-109] AuthProvider: Profile found on retry:', retryData);
          const profile = {
            id: retryData.id,
            email: retryData.email,
            role: retryData.role as 'Admin' | 'MinistryLeader' | 'Member' | 'Director' | 'SuperOrg',
            ministry_id: retryData.ministry_id,
            first_name: retryData.first_name,
            last_name: retryData.last_name,
            date_of_birth: retryData.date_of_birth,
            created_at: retryData.created_at
          } as UserProfile;
          
          return profile;
        } else if (error.code === '42501') {
          console.log('[DEBUG-110] AuthProvider: RLS policy blocking access');
          setProfileError('Access denied. Please check permissions.');
        } else {
          setProfileError(error.message);
        }
        return null;
      }

      if (!data) {
        console.log('[DEBUG-111] AuthProvider: No data returned from query');
        setProfileError('User profile not found');
        return null;
      }

      console.log('[DEBUG-112] AuthProvider: Profile fetched successfully:', data);
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
      console.error('[DEBUG-704] AuthProvider: Exception in fetchUserProfile:', error);
      setProfileError('Failed to load user profile');
      return null;
    }
  }, []);

  useEffect(() => {
    console.log('[DEBUG-113] AuthProvider: Main useEffect started');
    let mounted = true;
    
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('[DEBUG-114] AuthProvider: Auth state change event:', event, 'Session exists:', !!session);
      
      if (!mounted) {
        console.log('[DEBUG-115] AuthProvider: Component unmounted, skipping auth state change');
        return;
      }
      
      console.log('[DEBUG-116] AuthProvider: Setting session and user state');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('[DEBUG-117] AuthProvider: User authenticated, fetching profile...');
        
        try {
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (mounted) {
            console.log('[DEBUG-118] AuthProvider: Setting profile state:', !!userProfile);
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('[DEBUG-119] AuthProvider: Profile fetch failed:', error);
          if (mounted) {
            setProfile(null);
            setProfileError(error instanceof Error ? error.message : 'Profile fetch failed');
          }
        } finally {
          // Always set loading to false, even if profile fetch fails
          if (mounted) {
            console.log('[DEBUG-120] AuthProvider: Setting loading to false after profile attempt');
            setLoading(false);
          }
        }
      } else {
        console.log('[DEBUG-121] AuthProvider: No user session, clearing profile');
        if (mounted) {
          setProfile(null);
          setProfileError(null);
          setLoading(false);
        }
      }
    };

    console.log('[DEBUG-122] AuthProvider: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    const initializeAuth = async () => {
      console.log('[DEBUG-123] AuthProvider: Initializing auth...');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[DEBUG-705] AuthProvider: Error getting session:', error);
        } else {
          console.log('[DEBUG-124] AuthProvider: Initial session retrieved:', !!session);
        }

        if (mounted) {
          console.log('[DEBUG-125] AuthProvider: Processing initial session');
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('[DEBUG-706] AuthProvider: Exception in initializeAuth:', error);
        if (mounted) {
          console.log('[DEBUG-126] AuthProvider: Setting loading to false due to error');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('[DEBUG-127] AuthProvider: Cleanup started');
      mounted = false;
      subscription.unsubscribe();
      console.log('[DEBUG-128] AuthProvider: Cleanup complete');
    };
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    console.log('[DEBUG-129] AuthProvider: Sign out initiated');
    
    try {
      setLoading(true);
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

  const contextValue = {
    user,
    profile,
    session,
    loading,
    profileError,
    signOut
  };

  console.log('[DEBUG-131] AuthProvider: Rendering with context value', {
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
