
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthRedirect = () => {
  console.log('[DEBUG-300] useAuthRedirect: Hook initialization started');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, profileError } = useAuth();
  const hasRedirectedRef = useRef(false);
  const toastShownRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  console.log('[DEBUG-301] useAuthRedirect: Current state', {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    hasRedirected: hasRedirectedRef.current,
    toastShown: toastShownRef.current,
    profileError,
    lastUserId: lastUserIdRef.current,
    currentUserId: user?.id
  });

  // Reset redirect flags when location changes
  useEffect(() => {
    console.log('[DEBUG-302] useAuthRedirect: Location change effect triggered');
    
    if (location.pathname !== "/auth" && location.pathname !== "/login") {
      console.log('[DEBUG-303] useAuthRedirect: Resetting redirect flags');
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
    }
  }, [location.pathname]);

  // Reset redirect flags when user changes (including sign out)
  useEffect(() => {
    console.log('[DEBUG-304] useAuthRedirect: User change effect triggered');
    
    const currentUserId = user?.id || null;
    const previousUserId = lastUserIdRef.current;
    
    // If user changed (signed out or different user signed in)
    if (currentUserId !== previousUserId) {
      console.log('[DEBUG-305] useAuthRedirect: User ID changed, resetting flags', {
        previous: previousUserId,
        current: currentUserId
      });
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
      lastUserIdRef.current = currentUserId;
    }
  }, [user?.id]);

  // Handle redirect logic - only redirect to dashboard when authenticated and on auth pages
  useEffect(() => {
    console.log('[DEBUG-306] useAuthRedirect: Main redirect effect triggered');
    
    // Only process redirects if we're on auth pages
    const isOnAuthPage = location.pathname === "/auth" || location.pathname === "/login";
    
    if (!isOnAuthPage) {
      console.log('[DEBUG-307] useAuthRedirect: Not on auth page, skipping redirect logic');
      return;
    }

    // Guard conditions to prevent infinite loops
    if (hasRedirectedRef.current || authLoading) {
      console.log('[DEBUG-308] useAuthRedirect: Early return due to guard conditions');
      return;
    }

    // If user is authenticated and on auth page, redirect to dashboard
    if (user && isOnAuthPage) {
      console.log('[DEBUG-309] useAuthRedirect: User authenticated on auth page, processing redirect');
      hasRedirectedRef.current = true;
      
      // Show appropriate toast based on profile state
      if (!toastShownRef.current) {
        console.log('[DEBUG-310] useAuthRedirect: Showing welcome toast');
        toastShownRef.current = true;
        
        if (profile) {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in to ChurchShare",
          });
        } else if (profileError) {
          toast({
            title: "Signed in successfully",
            description: "Your profile is still loading, but you can use the app.",
            variant: "default",
          });
        } else {
          toast({
            title: "Welcome!",
            description: "Successfully signed in to ChurchShare",
          });
        }
      }

      // Navigate to dashboard
      console.log('[DEBUG-311] useAuthRedirect: Executing navigation to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, location.pathname, navigate, toast, profile, profileError]);

  const returnValue = {
    authLoading,
    profileError,
    shouldShowAuthForm: !authLoading && !user && !hasRedirectedRef.current
  };

  console.log('[DEBUG-312] useAuthRedirect: Returning value', returnValue);
  return returnValue;
};
