
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const useAuthRedirect = () => {
  const location = useLocation();
  const { toast } = useToast();
  const { user, profile, loading: authLoading, profileError } = useAuth();
  const redirectAttempted = useRef(false);

  // Compute redirect conditions
  const shouldRedirect = !authLoading && user && location.pathname !== "/dashboard";
  const canRedirect = shouldRedirect && (profile || profileError) && !redirectAttempted.current;

  // Reset redirect flag when auth state changes
  useEffect(() => {
    if (!user || !profile) {
      redirectAttempted.current = false;
    }
  }, [user, profile]);

  // Handle redirect logic
  useEffect(() => {
    if (canRedirect) {
      console.log('Auth page: User authenticated and ready, redirecting to dashboard');
      redirectAttempted.current = true;
      
      // Only show success toast if profile loaded successfully
      if (profile) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to ChurchShare",
        });
      } else if (profileError) {
        // Show warning toast if profile failed to load but still redirect
        toast({
          title: "Signed in with limited profile",
          description: "Some profile information couldn't be loaded. You can still use the app.",
          variant: "destructive",
        });
      }
    }
  }, [canRedirect, toast, profile, profileError]);

  // Handle cases where authentication is stuck
  useEffect(() => {
    if (user && authLoading && !profile && !profileError) {
      // If we have a user but loading is stuck, set a fallback timeout
      const fallbackTimeout = setTimeout(() => {
        console.warn('Auth redirect: Profile loading seems stuck, allowing redirect anyway');
        if (!redirectAttempted.current && location.pathname !== "/dashboard") {
          redirectAttempted.current = true;
          toast({
            title: "Proceeding with limited profile",
            description: "Profile loading took too long. You can still access the dashboard.",
            variant: "destructive",
          });
        }
      }, 8000);

      return () => clearTimeout(fallbackTimeout);
    }
  }, [user, authLoading, profile, profileError, location.pathname, toast]);

  return {
    shouldRedirect,
    canRedirect,
    authLoading,
    profileError
  };
};
