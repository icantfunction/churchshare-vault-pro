
-- Create ministries table
CREATE TABLE public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT
);

-- Create users table (this will work alongside Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'Member' CHECK (role IN ('Admin', 'MinistryLeader', 'Member')),
  ministry_id UUID REFERENCES public.ministries(id)
);

-- Create files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  ministry_id UUID REFERENCES public.ministries(id),
  uploader_id UUID REFERENCES public.users(id),
  event_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ministries (users can see ministries they belong to)
CREATE POLICY "Users can view their ministry" 
  ON public.ministries 
  FOR SELECT 
  USING (id IN (SELECT ministry_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for users
CREATE POLICY "Users can view themselves" 
  ON public.users 
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'Admin');

CREATE POLICY "Users can update themselves"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage users"
  ON public.users
  FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'Admin');

-- RLS Policies for files
CREATE POLICY "Users can view files from their ministry" 
  ON public.files 
  FOR SELECT 
  USING (ministry_id IN (SELECT ministry_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Ministry leaders and admins can insert files" 
  ON public.files 
  FOR INSERT 
  WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) IN ('Admin', 'MinistryLeader'));

CREATE POLICY "Users can update their own files"
  ON public.files
  FOR UPDATE
  USING (uploader_id = auth.uid());

CREATE POLICY "Admins can manage all files"
  ON public.files
  FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'Admin');

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'Member');
  RETURN new;
END;
$$;

-- Trigger to automatically create user profile when someone signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert demo data
INSERT INTO public.ministries (id, name, description) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Youth Ministry', 'Photos and videos from youth events and activities'),
  ('22222222-2222-2222-2222-222222222222', 'Worship Team', 'Performance recordings and event photography');

-- Note: Demo users will be created when they sign up through Supabase Auth
-- The trigger will automatically add them to the users table
