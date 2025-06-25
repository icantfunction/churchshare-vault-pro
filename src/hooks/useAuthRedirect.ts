
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, profileError } = useAuth();
  const hasRedirected = useRef(false);

  // Reset redirect flag when user changes
  useEffect(() => {
    if (!user) {
      hasRedirected.current = false;
    }
  }, [user?.id]);

  // Handle redirect logic
  useEffect(() => {
    // Don't redirect if already redirected, still loading, no user, or already on dashboard
    if (hasRedirected.current || authLoading || !user || location.pathname === "/dashboard") {
      return;
    }

    // Only redirect authenticated users from auth pages
    if (location.pathname === "/auth" || location.pathname === "/login") {
      console.log('Auth redirect: User authenticated, redirecting to dashboard');
      hasRedirected.current = true;
      
      // Show welcome toast
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

      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, profileError, authLoading, location.pathname, navigate, toast]);

  return {
    authLoading,
    profileError,
    shouldShowAuthForm: !authLoading && !user
  };
};
