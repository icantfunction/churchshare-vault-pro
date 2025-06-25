
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  role: 'Admin' | 'MinistryLeader' | 'Member';
  ministry_id: string | null;
  organisation_id: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  is_director: boolean | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      setProfileError(null);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000);
      });

      // Race between the actual fetch and timeout
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('AuthContext: Error fetching user profile:', error);
        setProfileError(error.message);
        return null;
      }

      console.log('AuthContext: Profile fetched successfully:', data);
      const profile = {
        id: data.id,
        email: data.email,
        role: data.role as 'Admin' | 'MinistryLeader' | 'Member',
        ministry_id: data.ministry_id,
        organisation_id: data.organisation_id,
        first_name: data.first_name,
        last_name: data.last_name,
        dob: data.dob,
        is_director: data.is_director
      } as UserProfile;
      
      return profile;
    } catch (error) {
      console.error('AuthContext: Error in fetchUserProfile:', error);
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        setProfileError('Profile fetch timed out. Please try refreshing the page.');
      } else {
        setProfileError('Failed to load user profile');
      }
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let authTimeout: NodeJS.Timeout;
    
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (!mounted) return;
      
      console.log('AuthContext: Auth state changed:', event, !!session);
      
      // Clear any existing timeout
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('AuthContext: User authenticated, fetching profile...');
        try {
          const userProfile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setProfile(userProfile);
            console.log('AuthContext: Profile set:', !!userProfile);
          }
        } catch (error) {
          console.error('AuthContext: Error fetching profile:', error);
          if (mounted) {
            setProfile(null);
            setProfileError('Failed to load user profile');
          }
        }
      } else {
        console.log('AuthContext: No user session, clearing profile');
        if (mounted) {
          setProfile(null);
          setProfileError(null);
        }
      }
      
      if (mounted) {
        setLoading(false);
        console.log('AuthContext: Loading complete');
      }
    };

    // Set up auth state listener
    console.log('AuthContext: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting session:', error);
        } else {
          console.log('AuthContext: Initial session retrieved:', !!session);
        }

        if (mounted) {
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('AuthContext: Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set a maximum timeout for auth loading (15 seconds)
    authTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('AuthContext: Auth loading timeout reached, setting loading to false');
        setLoading(false);
        setProfileError('Authentication check timed out. Please refresh the page.');
      }
    }, 15000);

    initializeAuth();

    return () => {
      console.log('AuthContext: Cleaning up');
      mounted = false;
      if (authTimeout) {
        clearTimeout(authTimeout);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signOut = useCallback(async () => {
    try {
      console.log('AuthContext: Signing out...');
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Error signing out:', error);
      } else {
        console.log('AuthContext: Successfully signed out');
      }
    } catch (error) {
      console.error('AuthContext: Error in signOut:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, profileError, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
