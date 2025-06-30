
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "files_select_ministry" ON public.files;
DROP POLICY IF EXISTS "files_write_elevated" ON public.files;
DROP POLICY IF EXISTS "files_insert_elevated" ON public.files;
DROP POLICY IF EXISTS "files_update_own" ON public.files;
DROP POLICY IF EXISTS "files_delete_elevated" ON public.files;

-- Create corrected policies that ensure consistency
-- Users can view files from their ministry or files they uploaded
CREATE POLICY "files_select_consistent" ON public.files
  FOR SELECT USING (
    -- Admins/Directors can see all files
    public.current_user_role() IN ('Director','SuperOrg','Admin')
    OR
    -- Users can see files they uploaded
    uploader_id = auth.uid()
    OR
    -- Users can see files from their own ministry
    (ministry_id IS NOT NULL AND ministry_id IN (
      SELECT ministry_id FROM public.users WHERE id = auth.uid()
    ))
  );

-- Ministry leaders can only insert files for their OWN ministry
CREATE POLICY "files_insert_own_ministry" ON public.files
  FOR INSERT WITH CHECK (
    public.current_user_role() IN ('MinistryLeader','Director','SuperOrg','Admin')
    AND (
      -- Must be for the user's own ministry
      ministry_id IN (SELECT ministry_id FROM public.users WHERE id = auth.uid())
      OR
      -- Admins/Directors can upload to any ministry
      public.current_user_role() IN ('Director','SuperOrg','Admin')
    )
  );

-- Users can update their own files
CREATE POLICY "files_update_own" ON public.files
  FOR UPDATE USING (uploader_id = auth.uid());

-- Elevated users can delete files
CREATE POLICY "files_delete_elevated" ON public.files
  FOR DELETE USING (
    public.current_user_role() IN ('Director','SuperOrg','Admin')
    OR uploader_id = auth.uid()
  );
