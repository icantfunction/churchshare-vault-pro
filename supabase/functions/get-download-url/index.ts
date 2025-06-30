
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { fileId, type } = await req.json()

    if (!fileId) {
      return new Response('File ID is required', { status: 400, headers: corsHeaders })
    }

    console.log(`[DOWNLOAD] User ${user.id} requesting ${type || 'download'} URL for file ${fileId}`)

    // Get file information and verify access
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, file_name, file_url, preview_key, ministry_id, uploader_id')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      console.error('File not found:', fileError)
      return new Response('File not found', { status: 404, headers: corsHeaders })
    }

    // Get user profile for permission check
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, ministry_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('User profile not found:', profileError)
      return new Response('User profile not found', { status: 404, headers: corsHeaders })
    }

    // Check if user has access to this file
    const hasAccess = userProfile.role === 'Director' || 
                     userProfile.role === 'SuperOrg' || 
                     userProfile.role === 'Admin' ||
                     file.uploader_id === user.id ||
                     file.ministry_id === userProfile.ministry_id

    if (!hasAccess) {
      console.log(`[DOWNLOAD] Access denied for user ${user.id} to file ${fileId}`)
      return new Response('Access denied', { status: 403, headers: corsHeaders })
    }

    // Determine which URL to use
    const fileKey = type === 'preview' && file.preview_key ? file.preview_key : file.file_url
    
    if (!fileKey) {
      console.error('No file URL available')
      return new Response('File URL not available', { status: 404, headers: corsHeaders })
    }

    // For now, return the CloudFront URL directly
    // In a real implementation, you would generate a signed URL here
    const cloudFrontUrl = type === 'preview' 
      ? `${Deno.env.get('CLOUDFRONT_URL_PREVIEWS')}/${fileKey}`
      : `${Deno.env.get('CLOUDFRONT_URL_ORIGINALS')}/${fileKey}`

    console.log(`[DOWNLOAD] Generated URL: ${cloudFrontUrl}`)

    return new Response(
      JSON.stringify({ 
        url: cloudFrontUrl,
        filename: file.file_name 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in get-download-url function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
