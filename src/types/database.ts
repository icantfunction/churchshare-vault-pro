
import type { Database } from '@/integrations/supabase/types';

// Custom type extensions that work with the auto-generated types
export type SupportRequest = Database['public']['Tables']['support_requests']['Row'];
export type SupportRequestInsert = Database['public']['Tables']['support_requests']['Insert'];
export type SupportRequestUpdate = Database['public']['Tables']['support_requests']['Update'];

// Helper type for ministry data from joins
export type MinistryJoinResult = {
  name: string;
  description?: string;
};

// File data with proper ministry typing
export interface FileWithMinistry {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  ministry_id: string;
  uploader_id: string;
  event_date: string;
  created_at: string;
  ministries: MinistryJoinResult | null;
}
