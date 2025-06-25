
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
      console.log('Auth page: User authenticated and profile ready, redirecting to dashboard');
      redirectAttempted.current = true;
      
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to ChurchShare",
      });
    }
  }, [canRedirect, toast]);

  return {
    shouldRedirect,
    canRedirect,
    authLoading,
    profileError
  };
};
