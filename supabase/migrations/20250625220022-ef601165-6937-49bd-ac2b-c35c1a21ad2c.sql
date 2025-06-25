
-- 1. Drop all dependent policies first (including ones from previous migrations)
DROP POLICY IF EXISTS "files_select_ministry" ON public.files;
DROP POLICY IF EXISTS "files_write_elevated" ON public.files;
DROP POLICY IF EXISTS "ministries_write_elevated" ON public.ministries;
DROP POLICY IF EXISTS "ministries_select_all" ON public.ministries;
DROP POLICY IF EXISTS "users_select_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Ministry leaders can view ministry users" ON public.users;

-- 2. Drop existing objects (safe even if none exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.current_user_role() CASCADE;

-- 3. Remove organisation_id column that was added in previous migrations
ALTER TABLE public.users DROP COLUMN IF EXISTS organisation_id;

-- 4. Create core tables (will be no-op if they exist)
CREATE TABLE IF NOT EXISTS public.ministries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT
);

-- Update users table structure to match our new schema
ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS ministry_id UUID REFERENCES public.ministries(id),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Update role constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users 
  ADD CONSTRAINT users_role_check 
  CHECK(role IN ('Member','MinistryLeader','Director','SuperOrg','Admin'));

-- Update files table to match new schema
ALTER TABLE public.files 
  ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES public.users(id);

-- 5. Enable RLS
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files      ENABLE ROW LEVEL SECURITY;

-- 6. Helper function to read current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 7. Trigger function to auto-insert profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users(id, email, first_name, last_name, date_of_birth, role, ministry_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
    COALESCE(NEW.raw_user_meta_data ->> 'role','Member'),
    (NEW.raw_user_meta_data ->> 'ministry_id')::uuid
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. RLS policies for ministries
CREATE POLICY ministries_select_all ON public.ministries
  FOR SELECT USING ( true );

CREATE POLICY ministries_write_elevated ON public.ministries
  FOR ALL USING (
    public.current_user_role() IN ('Director','SuperOrg','Admin')
  );

-- 9. RLS policies for users
CREATE POLICY users_select_self ON public.users
  FOR SELECT USING ( id = auth.uid() );

CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING ( id = auth.uid() );

CREATE POLICY users_insert_self ON public.users
  FOR INSERT WITH CHECK ( id = auth.uid() );

-- 10. RLS policies for files
CREATE POLICY files_select_ministry ON public.files
  FOR SELECT USING (
    public.current_user_role() IN ('Director','SuperOrg','Admin')
    OR ministry_id IN (
      SELECT ministry_id FROM public.users WHERE id = auth.uid()
    )
  );

CREATE POLICY files_write_elevated ON public.files
  FOR ALL USING (
    public.current_user_role() IN ('MinistryLeader','Director','SuperOrg','Admin')
  );

-- 11. Seed demo data
INSERT INTO public.ministries (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111','Youth Ministry','Photos and videos from youth events'),
  ('22222222-2222-2222-2222-222222222222','Worship Team','Performance recordings & photography')
ON CONFLICT (id) DO NOTHING;
