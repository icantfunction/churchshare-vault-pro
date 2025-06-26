
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

  console.log('[DEBUG-301] useAuthRedirect: Current state', {
    pathname: location.pathname,
    hasUser: !!user,
    authLoading,
    hasRedirected: hasRedirectedRef.current,
    toastShown: toastShownRef.current,
    profileError
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

  // Reset redirect flags when user changes
  useEffect(() => {
    console.log('[DEBUG-304] useAuthRedirect: User change effect triggered');
    
    if (!user) {
      console.log('[DEBUG-305] useAuthRedirect: Resetting redirect flags (no user)');
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
    }
  }, [user?.id]);

  // Handle redirect logic - key fix: don't wait for profile, just need valid user session
  useEffect(() => {
    console.log('[DEBUG-306] useAuthRedirect: Main redirect effect triggered');
    
    // Guard conditions to prevent infinite loops
    if (
      hasRedirectedRef.current || 
      authLoading || 
      !user || 
      (location.pathname !== "/auth" && location.pathname !== "/login")
    ) {
      console.log('[DEBUG-307] useAuthRedirect: Early return due to guard conditions');
      return;
    }

    console.log('[DEBUG-308] useAuthRedirect: User authenticated, processing redirect');
    hasRedirectedRef.current = true;
    
    // Show appropriate toast based on profile state
    if (!toastShownRef.current) {
      console.log('[DEBUG-309] useAuthRedirect: Showing welcome toast');
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

    // Navigate to dashboard immediately - don't wait for profile
    console.log('[DEBUG-310] useAuthRedirect: Executing navigation');
    navigate('/dashboard', { replace: true });
  }, [user, authLoading, location.pathname, navigate, toast, profile, profileError]);

  const returnValue = {
    authLoading,
    profileError,
    shouldShowAuthForm: !authLoading && !user && !hasRedirectedRef.current
  };

  console.log('[DEBUG-312] useAuthRedirect: Returning value', returnValue);
  return returnValue;
};
