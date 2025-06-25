
-- 1. Drop stale objects
DROP TRIGGER IF EXISTS on_auth_user_created    ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.current_user_role();
DROP POLICY   IF EXISTS users_select_self       ON public.users;
DROP POLICY   IF EXISTS users_update_self       ON public.users;
DROP POLICY   IF EXISTS users_insert_self       ON public.users;
DROP POLICY   IF EXISTS files_select_ministry   ON public.files;
DROP POLICY   IF EXISTS files_write_elevated    ON public.files;
DROP POLICY   IF EXISTS ministries_select_all   ON public.ministries;
DROP POLICY   IF EXISTS ministries_write_elevated ON public.ministries;

-- 2. Alter tables
ALTER TABLE public.users
  DROP COLUMN IF EXISTS organisation_id CASCADE,
  DROP COLUMN IF EXISTS is_director    CASCADE,
  DROP COLUMN IF EXISTS dob            CASCADE,
  ADD COLUMN  IF NOT EXISTS date_of_birth date,
  ADD COLUMN  IF NOT EXISTS created_at   timestamptz DEFAULT now();

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check,
  ADD CONSTRAINT users_role_check 
    CHECK(role IN ('Member','MinistryLeader','Director','SuperOrg','Admin'));

CREATE TABLE IF NOT EXISTS public.ministries (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text    NOT NULL,
  description text
);

ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS uploader_id uuid REFERENCES public.users(id);

-- 3. Helper function for RLS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text STABLE LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 4. Auto‐profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users(id,email,first_name,last_name,date_of_birth,role,ministry_id)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    (new.raw_user_meta_data ->> 'date_of_birth')::date,
    COALESCE(new.raw_user_meta_data ->> 'role','Member'),
    (new.raw_user_meta_data ->> 'ministry_id')::uuid
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Enable RLS & policies
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_self ON public.users
  FOR SELECT USING ( id = auth.uid() );

CREATE POLICY users_update_self ON public.users
  FOR UPDATE USING ( id = auth.uid() );

CREATE POLICY users_insert_self ON public.users
  FOR INSERT WITH CHECK ( id = auth.uid() );

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

CREATE POLICY ministries_select_all ON public.ministries
  FOR SELECT USING ( true );

CREATE POLICY ministries_write_elevated ON public.ministries
  FOR ALL USING (
    public.current_user_role() IN ('Director','SuperOrg','Admin')
  );

-- 6. Seed demo data
INSERT INTO public.ministries(id,name,description) VALUES
  ('11111111-1111-1111-1111-111111111111','Youth Ministry','Photos and videos from youth events'),
  ('22222222-2222-2222-2222-222222222222','Worship Team','Performance recordings & photography')
ON CONFLICT (id) DO NOTHING;
