
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  role: 'Admin' | 'MinistryLeader' | 'Member' | 'Director' | 'SuperOrg';
  ministry_id: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  created_at: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  profileError: string | null;
  profileRetryCount?: number;
  signOut: () => Promise<void>;
  refreshProfile?: () => void;
}
