
-- Create organisations table
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invites table
CREATE TABLE public.invites (
  code TEXT PRIMARY KEY,
  organisation_id UUID REFERENCES public.organisations(id),
  role TEXT DEFAULT 'Member',
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  max_uses INT DEFAULT 1,
  uses INT DEFAULT 0
);

-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT,
ADD COLUMN dob DATE,
ADD COLUMN organisation_id UUID REFERENCES public.organisations(id),
ADD COLUMN is_director BOOLEAN DEFAULT false;

-- Add organisation_id to ministries table
ALTER TABLE public.ministries 
ADD COLUMN organisation_id UUID REFERENCES public.organisations(id);

-- Add organisation_id to files table  
ALTER TABLE public.files 
ADD COLUMN organisation_id UUID REFERENCES public.organisations(id);

-- Enable RLS on new tables
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organisations
CREATE POLICY "Users can view their organisation" 
  ON public.organisations 
  FOR SELECT 
  USING (id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for users (same org access)
CREATE POLICY "Users can view same org users" 
  ON public.users 
  FOR SELECT 
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- RLS Policies for invites
CREATE POLICY "Anyone can view invites" 
  ON public.invites 
  FOR SELECT 
  USING (true);

CREATE POLICY "Directors can manage invites" 
  ON public.invites 
  FOR ALL 
  USING (
    (SELECT is_director FROM public.users WHERE id = auth.uid()) = true
    AND organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid())
  );

-- Update existing RLS policies for ministries to include organisation access
DROP POLICY IF EXISTS "Users can view their ministry" ON public.ministries;
CREATE POLICY "Users can view org ministries" 
  ON public.ministries 
  FOR SELECT 
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- Update existing RLS policies for files to include organisation access  
DROP POLICY IF EXISTS "Users can view files from their ministry" ON public.files;
CREATE POLICY "Users can view org files" 
  ON public.files 
  FOR SELECT 
  USING (organisation_id = (SELECT organisation_id FROM public.users WHERE id = auth.uid()));

-- Enable realtime for files table
ALTER TABLE public.files REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.files;

-- Insert demo data
INSERT INTO public.organisations (id, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Church');

-- Update existing demo ministries to belong to the demo organisation
UPDATE public.ministries SET organisation_id = '11111111-1111-1111-1111-111111111111' 
WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

-- Create a demo invite
INSERT INTO public.invites (code, organisation_id, role, max_uses) VALUES 
  ('DEMO123', '11111111-1111-1111-1111-111111111111', 'Member', 5);
