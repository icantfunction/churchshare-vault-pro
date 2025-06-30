
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HLSRequest {
  fileId: string;
  quality?: '4k' | '1080p' | '720p' | '480p';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { fileId, quality = '720p' }: HLSRequest = await req.json()

    // Get file details and verify access
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('preview_key, file_name, file_type, uploader_id')
      .eq('id', fileId)
      .single()

    if (fileError || !fileData) {
      return new Response('File not found', { status: 404, headers: corsHeaders })
    }

    // Check if user has access to this file
    const { data: userData } = await supabase
      .from('users')
      .select('role, ministry_id')
      .eq('id', user.id)
      .single()

    const hasAccess = fileData.uploader_id === user.id || 
                     userData?.role === 'Admin' || 
                     userData?.role === 'Director' || 
                     userData?.role === 'SuperOrg'

    if (!hasAccess) {
      return new Response('Access denied', { status: 403, headers: corsHeaders })
    }

    // Generate CloudFront signed URL for HLS streaming (30-minute expiration)
    const cloudfrontUrl = Deno.env.get('CLOUDFRONT_URL_PREVIEWS')
    const previewPath = `${fileData.preview_key}/${quality}/playlist.m3u8`
    
    // Create expiration timestamp (30 minutes from now)
    const expirationTime = Math.floor(Date.now() / 1000) + (30 * 60)
    
    const hlsUrl = `${cloudfrontUrl}/${previewPath}?expires=${expirationTime}`

    return new Response(JSON.stringify({
      hlsUrl,
      quality,
      fileName: fileData.file_name,
      expiresAt: new Date(expirationTime * 1000).toISOString(),
      availableQualities: ['4k', '1080p', '720p', '480p']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('HLS URL generation error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
