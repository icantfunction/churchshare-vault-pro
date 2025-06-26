
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './types';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('[DEBUG-105] AuthProvider: fetchUserProfile started for userId:', userId);
  
  try {
    console.log('[DEBUG-106] AuthProvider: Making Supabase profile query');
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[DEBUG-703] AuthProvider: Profile fetch error:', error);
      
      if (error.code === 'PGRST116') {
        console.log('[DEBUG-107] AuthProvider: No user record found, might be new user - waiting for trigger');
        
        // For new users, wait a moment for the trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try one more time
        const { data: retryData, error: retryError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (retryError || !retryData) {
          console.log('[DEBUG-108] AuthProvider: Still no profile after retry');
          throw new Error('Profile is being created. Please refresh the page in a moment.');
        }
        
        console.log('[DEBUG-109] AuthProvider: Profile found on retry:', retryData);
        return mapUserProfile(retryData);
      } else if (error.code === '42501') {
        console.log('[DEBUG-110] AuthProvider: RLS policy blocking access');
        throw new Error('Access permissions are being set up. Please try again.');
      } else {
        throw new Error(`Profile access error: ${error.message}`);
      }
    }

    if (!data) {
      console.log('[DEBUG-111] AuthProvider: No data returned from query');
      throw new Error('Profile not found');
    }

    console.log('[DEBUG-112] AuthProvider: Profile fetched successfully:', data);
    return mapUserProfile(data);
  } catch (error) {
    console.error('[DEBUG-704] AuthProvider: Exception in fetchUserProfile:', error);
    throw error;
  }
};

const mapUserProfile = (data: any): UserProfile => {
  return {
    id: data.id,
    email: data.email,
    role: data.role as 'Admin' | 'MinistryLeader' | 'Member' | 'Director' | 'SuperOrg',
    ministry_id: data.ministry_id,
    first_name: data.first_name,
    last_name: data.last_name,
    date_of_birth: data.date_of_birth,
    created_at: data.created_at
  };
};
