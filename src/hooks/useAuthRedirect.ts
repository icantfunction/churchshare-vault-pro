
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, profileError } = useAuth();
  const redirectAttempted = useRef(false);
  const toastShown = useRef(false);

  // Reset flags when user changes
  useEffect(() => {
    if (!user) {
      redirectAttempted.current = false;
      toastShown.current = false;
    }
  }, [user?.id]);

  // Handle redirect logic - only when we have a user and are not already on dashboard
  useEffect(() => {
    // Don't redirect if already attempted, still loading, no user, or already on dashboard
    if (redirectAttempted.current || authLoading || !user || location.pathname === "/dashboard") {
      return;
    }

    // Only redirect if we have profile data OR profile loading failed
    if (profile || profileError) {
      console.log('Auth page: User authenticated and ready, redirecting to dashboard');
      redirectAttempted.current = true;
      
      // Show appropriate toast
      if (profile && !toastShown.current) {
        toastShown.current = true;
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to ChurchShare",
        });
      } else if (profileError && !toastShown.current) {
        toastShown.current = true;
        toast({
          title: "Signed in with limited profile",
          description: "Some profile information couldn't be loaded. You can still use the app.",
          variant: "destructive",
        });
      }

      // Use setTimeout to prevent immediate navigation issues
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [user, profile, profileError, authLoading, location.pathname, navigate, toast]);

  // Fallback timeout for stuck profile loading
  useEffect(() => {
    if (!user || redirectAttempted.current || authLoading) {
      return;
    }

    const fallbackTimer = setTimeout(() => {
      if (!redirectAttempted.current && !profile && !profileError && location.pathname !== "/dashboard") {
        console.warn('Auth redirect: Profile loading seems stuck, redirecting anyway');
        redirectAttempted.current = true;
        toastShown.current = true;
        
        toast({
          title: "Proceeding with limited profile",
          description: "Profile loading took too long. You can still access the dashboard.",
          variant: "destructive",
        });
        
        navigate('/dashboard', { replace: true });
      }
    }, 8000);

    return () => clearTimeout(fallbackTimer);
  }, [user, profile, profileError, authLoading, location.pathname, navigate, toast]);

  const shouldRedirect = !authLoading && user && location.pathname !== "/dashboard";
  const canRedirect = shouldRedirect && (profile || profileError) && !redirectAttempted.current;

  return {
    shouldRedirect,
    canRedirect,
    authLoading,
    profileError
  };
};
