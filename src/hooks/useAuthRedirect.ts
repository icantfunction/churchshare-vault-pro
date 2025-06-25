
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, profileError } = useAuth();
  const hasRedirectedRef = useRef(false);
  const toastShownRef = useRef(false);

  // Reset redirect flag when location changes or user changes
  useEffect(() => {
    if (location.pathname !== "/auth" && location.pathname !== "/login") {
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      hasRedirectedRef.current = false;
      toastShownRef.current = false;
    }
  }, [user?.id]);

  // Handle redirect logic with strict guards
  useEffect(() => {
    // Strict guards to prevent infinite loops
    if (
      hasRedirectedRef.current || 
      authLoading || 
      !user || 
      (location.pathname !== "/auth" && location.pathname !== "/login")
    ) {
      return;
    }

    console.log('Auth redirect: User authenticated, redirecting to dashboard');
    hasRedirectedRef.current = true;
    
    // Show welcome toast only once
    if (!toastShownRef.current) {
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
      if (hasRedirectedRef.current) {
        navigate('/dashboard', { replace: true });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [user, authLoading, location.pathname, navigate, toast, profile, profileError]);

  return {
    authLoading,
    profileError,
    shouldShowAuthForm: !authLoading && !user && !hasRedirectedRef.current
  };
};
