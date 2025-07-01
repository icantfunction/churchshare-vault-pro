
-- Create RPC function for KPI aggregation
CREATE OR REPLACE FUNCTION public.get_user_kpis(user_id_param uuid)
RETURNS TABLE (
  total_files bigint,
  total_size bigint,
  recent_files bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
  user_ministry uuid;
BEGIN
  -- Get user role and ministry
  SELECT role, ministry_id INTO user_role, user_ministry
  FROM public.users 
  WHERE id = user_id_param;

  -- Return aggregated KPIs based on user permissions
  RETURN QUERY
  WITH user_files AS (
    SELECT 
      file_size,
      created_at
    FROM public.files f
    WHERE 
      CASE 
        WHEN user_role IN ('Admin', 'Director', 'SuperOrg') THEN true
        ELSE f.ministry_id = user_ministry OR f.uploader_id = user_id_param
      END
  )
  SELECT 
    COUNT(*)::bigint as total_files,
    COALESCE(SUM(file_size), 0)::bigint as total_size,
    COUNT(CASE WHEN created_at > (now() - interval '7 days') THEN 1 END)::bigint as recent_files
  FROM user_files;
END;
$$;

-- Create RPC function for ministry file counts
CREATE OR REPLACE FUNCTION public.get_ministry_file_counts()
RETURNS TABLE (
  ministry_id uuid,
  ministry_name text,
  ministry_description text,
  file_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as ministry_id,
    m.name as ministry_name,
    m.description as ministry_description,
    COALESCE(COUNT(f.id), 0)::bigint as file_count
  FROM public.ministries m
  LEFT JOIN public.files f ON m.id = f.ministry_id
  GROUP BY m.id, m.name, m.description
  ORDER BY m.name;
END;
$$;
