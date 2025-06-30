
-- 1. Create system_logs table FIRST (before functions that reference it)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on system_logs (admin only access)
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_logs_admin_only" ON public.system_logs
  FOR ALL USING (public.get_current_user_role() IN ('Director','SuperOrg','Admin'));

-- Create index on system_logs for efficient date queries
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);

-- 2. Create file shares table with basic constraints (no CHECK with now())
CREATE TABLE IF NOT EXISTS public.file_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  shared_by uuid NOT NULL REFERENCES public.users(id),
  secret text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Enforce 32-character secret token length
  CONSTRAINT chk_secret_length CHECK (char_length(secret) = 32)
);

-- 3. Enable RLS on file_shares table
ALTER TABLE public.file_shares ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enabled on files table as well
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- 4. Create validation trigger function for expires_at (instead of CHECK constraint)
CREATE OR REPLACE FUNCTION public.validate_file_share_expires_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  -- Validate that expires_at is not in the past when set
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= now() THEN
    RAISE EXCEPTION 'expires_at cannot be in the past';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the validation trigger
CREATE OR REPLACE TRIGGER validate_file_share_expires_at_trigger
  BEFORE INSERT OR UPDATE ON public.file_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_file_share_expires_at();

-- 5. Create improved RLS policies for file_shares
CREATE POLICY "file_shares_select" ON public.file_shares
  FOR SELECT USING (
    shared_by = auth.uid() OR
    public.get_current_user_role() IN ('Director','SuperOrg','Admin')
  );

CREATE POLICY "file_shares_insert" ON public.file_shares
  FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "file_shares_update" ON public.file_shares
  FOR UPDATE USING (
    shared_by = auth.uid() OR
    public.get_current_user_role() IN ('Director','SuperOrg','Admin')
  );

CREATE POLICY "file_shares_delete" ON public.file_shares
  FOR DELETE USING (
    shared_by = auth.uid() OR
    public.get_current_user_role() IN ('Director','SuperOrg','Admin')
  );

-- 6. Add enhanced columns to files table with proper defaults
ALTER TABLE public.files
  ADD COLUMN IF NOT EXISTS preview_key text,
  ADD COLUMN IF NOT EXISTS compression_ratio decimal(3,2),
  ADD COLUMN IF NOT EXISTS needs_reencode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Update file_size to be NOT NULL with default if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'files' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE public.files ADD COLUMN file_size bigint NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 7. Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER update_files_updated_at
  BEFORE UPDATE ON public.files
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Create comprehensive indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_file_shares_secret_unique ON public.file_shares(secret);
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON public.file_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON public.file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by ON public.file_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_files_preview_key ON public.files(preview_key);
CREATE INDEX IF NOT EXISTS idx_files_updated_at ON public.files(updated_at);

-- 9. Create function to clean up expired shares (NOW AFTER system_logs table exists)
CREATE OR REPLACE FUNCTION public.cleanup_expired_shares()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Only allow admin roles to execute this function
  IF public.get_current_user_role() NOT IN ('Director','SuperOrg','Admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  DELETE FROM public.file_shares 
  WHERE expires_at IS NOT NULL AND expires_at <= now();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup activity (removed ON CONFLICT since there are no unique constraints)
  INSERT INTO public.system_logs (action, details, created_at)
  VALUES ('cleanup_expired_shares', 
          format('Deleted %s expired file shares', deleted_count),
          now());
  
  RETURN deleted_count;
END;
$$;

-- 10. Add comment documentation
COMMENT ON TABLE public.file_shares IS 'Stores shareable links for files with expiration and access control';
COMMENT ON COLUMN public.file_shares.secret IS 'Random 32-character token used in share URLs';
COMMENT ON COLUMN public.file_shares.expires_at IS 'When the share link expires (NULL = never expires)';
COMMENT ON FUNCTION public.cleanup_expired_shares() IS 'Removes expired file shares and returns count of deleted rows (admin only)';
COMMENT ON TABLE public.system_logs IS 'System activity logs for monitoring and auditing';
COMMENT ON FUNCTION public.validate_file_share_expires_at() IS 'Validates that expires_at is not set to a past date';

-- Note: To enable automated cleanup, run this in your Supabase SQL editor:
-- SELECT cron.schedule('cleanup-expired-shares', '0 * * * *', $$SELECT public.cleanup_expired_shares();$$);
