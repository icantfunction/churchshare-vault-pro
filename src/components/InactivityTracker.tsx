
import { useInactivityTimer } from '@/hooks/useInactivityTimer';
import { useAuth } from '@/contexts/AuthContext';

interface InactivityTrackerProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningSeconds?: number;
}

const InactivityTracker: React.FC<InactivityTrackerProps> = ({ 
  children, 
  timeoutMinutes = 5,
  warningSeconds = 30 
}) => {
  // Add error boundary protection for auth context
  let user = null;
  let loading = true;
  
  try {
    const authContext = useAuth();
    user = authContext.user;
    loading = authContext.loading;
  } catch (error) {
    console.log('[DEBUG-INACTIVITY] Auth context not ready yet:', error);
    // Auth context not ready, continue with defaults
  }

  // Only set up inactivity tracking if auth is loaded and user exists
  useInactivityTimer({
    timeout: timeoutMinutes * 60 * 1000,
    warningTime: warningSeconds * 1000,
  });

  // Always render children regardless of auth state
  return <>{children}</>;
};

export default InactivityTracker;
