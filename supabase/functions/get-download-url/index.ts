
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create client with service role for database access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Create anon client for user authentication
    const anonSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get the user from the Authorization header using anon client
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[DOWNLOAD] No authorization header')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { data: { user }, error: authError } = await anonSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('[DOWNLOAD] Auth error:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { fileId, type } = await req.json()

    if (!fileId) {
      console.error('[DOWNLOAD] No file ID provided')
      return new Response('File ID is required', { status: 400, headers: corsHeaders })
    }

    console.log(`[DOWNLOAD] User ${user.id} requesting ${type || 'download'} URL for file ${fileId}`)

    // Get file information using service role (bypasses RLS)
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, file_name, file_url, preview_key, ministry_id, uploader_id, file_type')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      console.error('[DOWNLOAD] File not found:', fileError)
      return new Response('File not found', { status: 404, headers: corsHeaders })
    }

    console.log(`[DOWNLOAD] Found file: ${file.file_name}, ministry: ${file.ministry_id}, uploader: ${file.uploader_id}`)

    // Get user profile using service role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, ministry_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('[DOWNLOAD] User profile not found:', profileError)
      return new Response('User profile not found', { status: 404, headers: corsHeaders })
    }

    console.log(`[DOWNLOAD] User profile: role=${userProfile.role}, ministry=${userProfile.ministry_id}`)

    // Check if user has access to this file
    const hasAccess = userProfile.role === 'Director' || 
                     userProfile.role === 'SuperOrg' || 
                     userProfile.role === 'Admin' ||
                     file.uploader_id === user.id ||
                     file.ministry_id === userProfile.ministry_id

    if (!hasAccess) {
      console.log(`[DOWNLOAD] Access denied for user ${user.id} to file ${fileId}`)
      console.log(`[DOWNLOAD] User ministry: ${userProfile.ministry_id}, File ministry: ${file.ministry_id}, User role: ${userProfile.role}`)
      return new Response('Access denied', { status: 403, headers: corsHeaders })
    }

    // Determine which URL to use
    const fileKey = type === 'preview' && file.preview_key ? file.preview_key : file.file_url
    
    if (!fileKey) {
      console.error('[DOWNLOAD] No file URL available')
      return new Response('File URL not available', { status: 404, headers: corsHeaders })
    }

    // Generate CloudFront URL
    const cloudFrontUrl = type === 'preview' 
      ? `${Deno.env.get('CLOUDFRONT_URL_PREVIEWS')}/${fileKey}`
      : `${Deno.env.get('CLOUDFRONT_URL_ORIGINALS')}/${fileKey}`

    console.log(`[DOWNLOAD] Generated URL: ${cloudFrontUrl}`)

    return new Response(
      JSON.stringify({ 
        url: cloudFrontUrl,
        filename: file.file_name,
        fileType: file.file_type
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('[DOWNLOAD] Error in get-download-url function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
