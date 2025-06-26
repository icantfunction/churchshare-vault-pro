
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
  const { user } = useAuth();

  useInactivityTimer({
    timeout: timeoutMinutes * 60 * 1000, // Convert minutes to milliseconds
    warningTime: warningSeconds * 1000, // Convert seconds to milliseconds
  });

  // Only track inactivity for authenticated users
  if (!user) {
    return <>{children}</>;
  }

  return <>{children}</>;
};

export default InactivityTracker;
