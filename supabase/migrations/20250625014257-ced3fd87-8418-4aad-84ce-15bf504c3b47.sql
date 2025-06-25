
-- Drop all remaining problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Ministry leaders can view their ministry users" ON public.users;

-- Create simplified admin policies using security definer functions
CREATE POLICY "Admins can manage all users" 
  ON public.users 
  FOR ALL
  USING (public.get_current_user_role() = 'Admin');

CREATE POLICY "Ministry leaders can view ministry users" 
  ON public.users 
  FOR SELECT 
  USING (
    public.get_current_user_role() = 'MinistryLeader' 
    AND ministry_id = (SELECT ministry_id FROM public.users WHERE id = auth.uid())
  );
