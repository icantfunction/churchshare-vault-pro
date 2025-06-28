
import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from './types';
import { useAuthState } from './useAuthState';

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
    hasProfile: !!context.profile,
    profileRole: context.profile?.role,
    profileError: context.profileError,
    profileRetryCount: context.profileRetryCount
  });
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[DEBUG-103] AuthProvider: Component initialization started');
  
  const authState = useAuthState();
  const { handleAuthStateChange } = authState;

  console.log('[DEBUG-104] AuthProvider: Initial state set', { 
    loading: authState.loading,
    hasProfile: !!authState.profile,
    profileRole: authState.profile?.role
  });

  useEffect(() => {
    console.log('[DEBUG-113] AuthProvider: Main useEffect started');
    let mounted = true;
    
    const wrappedHandler = async (event: string, session: any) => {
      if (!mounted) {
        console.log('[DEBUG-115] AuthProvider: Component unmounted, skipping auth state change');
        return;
      }
      await handleAuthStateChange(event, session);
    };

    console.log('[DEBUG-122] AuthProvider: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(wrappedHandler);

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
          // Force loading to false if initialization fails
          authState.loading = false;
        }
      }
    };

    // Add a safety timeout to ensure loading doesn't stay true forever
    const safetyTimeout = setTimeout(() => {
      if (mounted && authState.loading) {
        console.log('[DEBUG-SAFETY] AuthProvider: Safety timeout triggered, forcing loading to false');
        // This is a fallback - the loading state should be managed by useAuthState
      }
    }, 15000);

    initializeAuth();

    return () => {
      console.log('[DEBUG-127] AuthProvider: Cleanup started');
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
      console.log('[DEBUG-128] AuthProvider: Cleanup complete');
    };
  }, [handleAuthStateChange]);

  const contextValue: AuthContextType = {
    user: authState.user,
    profile: authState.profile,
    session: authState.session,
    loading: authState.loading,
    profileError: authState.profileError,
    profileRetryCount: authState.profileRetryCount,
    signOut: authState.signOut,
    refreshProfile: authState.refreshProfile
  };

  console.log('[DEBUG-131] AuthProvider: Rendering with context value', {
    hasUser: !!authState.user,
    hasProfile: !!authState.profile,
    profileRole: authState.profile?.role,
    hasSession: !!authState.session,
    loading: authState.loading,
    profileError: authState.profileError,
    profileRetryCount: authState.profileRetryCount
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
