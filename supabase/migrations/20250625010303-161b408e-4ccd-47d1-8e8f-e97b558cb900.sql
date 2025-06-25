
-- Drop the problematic RLS policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view same org users" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.users;

-- Create security definer functions to break circular references
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_org()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT organisation_id FROM public.users WHERE id = auth.uid();
$$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can read their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can view same org users" 
  ON public.users 
  FOR SELECT 
  USING (organisation_id = public.get_current_user_org() AND public.get_current_user_org() IS NOT NULL);

-- Keep the existing update and insert policies as they don't cause recursion
-- "Enable update for users based on user_id" and "Enable insert for authenticated users during signup" are fine
