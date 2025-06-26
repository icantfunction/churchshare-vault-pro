
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "users_no_delete" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Ministry leaders can view ministry users" ON public.users;
DROP POLICY IF EXISTS "files_select_ministry" ON public.files;
DROP POLICY IF EXISTS "files_write_elevated" ON public.files;
DROP POLICY IF EXISTS "files_insert_elevated" ON public.files;
DROP POLICY IF EXISTS "files_update_own" ON public.files;
DROP POLICY IF EXISTS "files_delete_elevated" ON public.files;
DROP POLICY IF EXISTS "ministries_select_all" ON public.ministries;
DROP POLICY IF EXISTS "ministries_write_elevated" ON public.ministries;

-- Recreate the trigger and helper function (ensuring they're correct)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.users(id, email, first_name, last_name, date_of_birth, role, ministry_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'Member'),
    (NEW.raw_user_meta_data ->> 'ministry_id')::uuid
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function for RLS (security definer to avoid infinite recursion)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Enable RLS first, then create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

-- Add performance indexes on foreign-key columns
CREATE INDEX IF NOT EXISTS idx_users_ministry ON public.users(ministry_id);
CREATE INDEX IF NOT EXISTS idx_files_ministry ON public.files(ministry_id);
CREATE INDEX IF NOT EXISTS idx_files_uploader ON public.files(uploader_id);

-- User policies (clean and simple)
CREATE POLICY "users_select_self" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_insert_self" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "users_no_delete" ON public.users
  FOR DELETE USING (false);

-- Ministries policies
CREATE POLICY "ministries_select_all" ON public.ministries
  FOR SELECT USING (true);

CREATE POLICY "ministries_write_elevated" ON public.ministries
  FOR INSERT WITH CHECK (public.current_user_role() IN ('Director','SuperOrg','Admin'));

CREATE POLICY "ministries_update_elevated" ON public.ministries
  FOR UPDATE USING (public.current_user_role() IN ('Director','SuperOrg','Admin'));

CREATE POLICY "ministries_delete_elevated" ON public.ministries
  FOR DELETE USING (public.current_user_role() IN ('Director','SuperOrg','Admin'));

-- Files policies (separated INSERT/UPDATE/DELETE)
CREATE POLICY "files_select_ministry" ON public.files
  FOR SELECT USING (
    public.current_user_role() IN ('Director','SuperOrg','Admin')
    OR ministry_id IN (SELECT ministry_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "files_insert_elevated" ON public.files
  FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('MinistryLeader','Director','SuperOrg','Admin')
    AND ministry_id IN (SELECT ministry_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "files_update_own" ON public.files
  FOR UPDATE
  USING (uploader_id = auth.uid());

CREATE POLICY "files_delete_elevated" ON public.files
  FOR DELETE
  USING (public.current_user_role() IN ('Director','SuperOrg','Admin'));
