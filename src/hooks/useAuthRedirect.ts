
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

  console.log('[DEBUG-301] useAuthRedirect: Initial state', {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    hasRedirected: hasRedirectedRef.current,
    toastShown: toastShownRef.current
  });

  // Reset redirect flag when location changes or user changes
  useEffect(() => {
    console.log('[DEBUG-302] useAuthRedirect: Location/user change effect triggered');
    
    if (location.pathname !== "/auth" && location.pathname !== "/login") {
      console.log('[DEBUG-303] useAuthRedirect: Resetting redirect flags (location change)');
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
    }
  }, [location.pathname]);

  useEffect(() => {
    console.log('[DEBUG-304] useAuthRedirect: User change effect triggered');
    
    if (!user) {
      console.log('[DEBUG-305] useAuthRedirect: Resetting redirect flags (no user)');
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
    }
  }, [user?.id]);

  // Handle redirect logic with strict guards
  useEffect(() => {
    console.log('[DEBUG-306] useAuthRedirect: Main redirect effect triggered');
    console.log('[DEBUG-307] useAuthRedirect: Guard conditions check', {
      hasRedirected: hasRedirectedRef.current,
      authLoading,
      hasUser: !!user,
      pathname: location.pathname,
      isAuthPage: location.pathname === "/auth" || location.pathname === "/login"
    });
    
    // Strict guards to prevent infinite loops
    if (
      hasRedirectedRef.current || 
      authLoading || 
      !user || 
      (location.pathname !== "/auth" && location.pathname !== "/login")
    ) {
      console.log('[DEBUG-308] useAuthRedirect: Early return due to guard conditions');
      return;
    }

    console.log('[DEBUG-309] useAuthRedirect: User authenticated, processing redirect');
    console.log('[DEBUG-901] State transition: Unauthenticated → Authenticated');
    hasRedirectedRef.current = true;
    
    // Show welcome toast only once
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
          title: "Signed in with limited profile",
          description: "Some profile information couldn't be loaded. You can still use the app.",
          variant: "destructive",
        });
      }
    }

    // Use setTimeout to prevent immediate re-render issues
    const timeoutId = setTimeout(() => {
      console.log('[DEBUG-311] useAuthRedirect: Executing navigation timeout');
      if (hasRedirectedRef.current) {
        console.log('[DEBUG-312] useAuthRedirect: Navigating to dashboard');
        console.time('[DEBUG-804] Navigation timing');
        navigate('/dashboard', { replace: true });
        console.timeEnd('[DEBUG-804] Navigation timing');
      }
    }, 100);

    return () => {
      console.log('[DEBUG-313] useAuthRedirect: Cleaning up timeout');
      clearTimeout(timeoutId);
    };
  }, [user, authLoading, location.pathname, navigate, toast, profile, profileError]);

  const returnValue = {
    authLoading,
    profileError,
    shouldShowAuthForm: !authLoading && !user && !hasRedirectedRef.current
  };

  console.log('[DEBUG-314] useAuthRedirect: Returning value', returnValue);
  return returnValue;
};
