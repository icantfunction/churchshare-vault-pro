
-- Fix the infinite recursion in RLS policy by using the security definer function
DROP POLICY IF EXISTS "Ministry leaders can view ministry users" ON public.users;

-- Create a corrected policy that doesn't cause infinite recursion
CREATE POLICY "Ministry leaders can view ministry users" 
  ON public.users 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'MinistryLeader' 
    AND ministry_id = public.get_current_user_org()
  );

-- Also ensure we have the missing organization_id column referenced in get_current_user_org
-- The function references organisation_id but the users table might not have it
-- Let's check if we need to add it or update the function to use ministry_id instead
CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ministry_id FROM public.users WHERE id = auth.uid();
$$;
