
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UseInactivityTimerOptions {
  timeout?: number; // in milliseconds
  warningTime?: number; // show warning X milliseconds before timeout
  onWarning?: () => void;
  onTimeout?: () => void;
}

export const useInactivityTimer = (options: UseInactivityTimerOptions = {}) => {
  const {
    timeout = 5 * 60 * 1000, // 5 minutes default
    warningTime = 30 * 1000, // 30 seconds warning default
    onWarning,
    onTimeout
  } = options;

  // Add defensive auth context usage
  let signOut = () => Promise.resolve();
  let user = null;
  
  try {
    const authContext = useAuth();
    signOut = authContext.signOut;
    user = authContext.user;
  } catch (error) {
    console.log('[DEBUG-INACTIVITY] Auth context not available, skipping inactivity tracking');
    return { resetTimer: () => {}, clearTimers: () => {} };
  }

  const { toast } = useToast();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const hasShownWarningRef = useRef(false);
  const isSigningOutRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    hasShownWarningRef.current = false;
  }, []);

  const handleAutoSignOut = useCallback(async () => {
    // Prevent multiple sign out attempts
    if (isSigningOutRef.current) {
      console.log('[DEBUG-INACTIVITY] Sign out already in progress, skipping');
      return;
    }

    isSigningOutRef.current = true;
    console.log('[DEBUG-INACTIVITY] Auto sign-out triggered due to inactivity');
    
    toast({
      title: "Signed out due to inactivity",
      description: "You've been automatically signed out for security reasons.",
      variant: "default",
    });

    try {
      await signOut();
      onTimeout?.();
    } catch (error) {
      console.error('[DEBUG-INACTIVITY] Error during auto sign out:', error);
    } finally {
      // Reset flag after a delay to prevent issues
      setTimeout(() => {
        isSigningOutRef.current = false;
      }, 1000);
    }
  }, [signOut, toast, onTimeout]);

  const showWarning = useCallback(() => {
    if (!hasShownWarningRef.current && !isSigningOutRef.current) {
      hasShownWarningRef.current = true;
      console.log('[DEBUG-INACTIVITY] Showing inactivity warning');
      
      toast({
        title: "You'll be signed out soon",
        description: "Move your mouse or click anywhere to stay signed in.",
        variant: "destructive",
      });

      onWarning?.();
    }
  }, [toast, onWarning]);

  const resetTimer = useCallback(() => {
    if (!user || !isActiveRef.current || isSigningOutRef.current) {
      return;
    }

    // Throttle timer resets to prevent excessive logging
    if (timerRef.current) {
      clearTimers();
    }

    console.log('[DEBUG-INACTIVITY] Resetting inactivity timer');

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      showWarning();
    }, timeout - warningTime);

    // Set main timeout timer
    timerRef.current = setTimeout(() => {
      handleAutoSignOut();
    }, timeout);
  }, [user, timeout, warningTime, showWarning, handleAutoSignOut, clearTimers]);

  const handleActivity = useCallback(() => {
    if (!user || isSigningOutRef.current) {
      return;
    }
    
    // Reset warning flag on activity
    hasShownWarningRef.current = false;
    resetTimer();
  }, [user, resetTimer]);

  const handleVisibilityChange = useCallback(() => {
    if (isSigningOutRef.current) {
      return;
    }

    if (document.hidden) {
      console.log('[DEBUG-INACTIVITY] Page hidden, pausing timer');
      isActiveRef.current = false;
      clearTimers();
    } else {
      console.log('[DEBUG-INACTIVITY] Page visible, resuming timer');
      isActiveRef.current = true;
      if (user) {
        resetTimer();
      }
    }
  }, [user, resetTimer, clearTimers]);

  useEffect(() => {
    if (!user) {
      console.log('[DEBUG-INACTIVITY] No user, clearing timers');
      clearTimers();
      isSigningOutRef.current = false;
      return;
    }

    console.log('[DEBUG-INACTIVITY] Setting up inactivity tracking');

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      console.log('[DEBUG-INACTIVITY] Cleaning up inactivity tracking');
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimers();
      isSigningOutRef.current = false;
    };
  }, [user, handleActivity, handleVisibilityChange, resetTimer, clearTimers]);

  return {
    resetTimer: handleActivity,
    clearTimers
  };
};
