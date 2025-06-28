
-- Add file_size column to files table
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS file_size BIGINT DEFAULT 0 NOT NULL;

-- Add watermark_url column to ministries table
ALTER TABLE public.ministries ADD COLUMN IF NOT EXISTS watermark_url TEXT;

-- Create support_requests table
CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time INTERVAL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on support_requests
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for support_requests
CREATE POLICY "Users can view their own support requests" 
  ON public.support_requests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support requests" 
  ON public.support_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support requests" 
  ON public.support_requests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support requests" 
  ON public.support_requests 
  FOR SELECT 
  USING (public.current_user_role() IN ('Admin', 'Director', 'SuperOrg'));

CREATE POLICY "Admins can update all support requests" 
  ON public.support_requests 
  FOR UPDATE 
  USING (public.current_user_role() IN ('Admin', 'Director', 'SuperOrg'));

-- Create indexes for support_requests
CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON public.support_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests(created_at);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_support_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_support_request_updated_at_trigger ON public.support_requests;
CREATE TRIGGER update_support_request_updated_at_trigger
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_support_request_updated_at();
