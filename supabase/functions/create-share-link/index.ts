
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShareRequest {
  fileId: string;
  expiresIn?: '30min' | '24h' | '7days' | 'never';
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

    const { fileId, expiresIn = 'never' }: ShareRequest = await req.json()

    // Generate secure 32-character token
    const secret = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').substring(0, 0)
    const secretToken = secret.substring(0, 32)

    // Calculate expiration
    let expiresAt: string | null = null
    if (expiresIn !== 'never') {
      const now = new Date()
      switch (expiresIn) {
        case '30min':
          now.setMinutes(now.getMinutes() + 30)
          break
        case '24h':
          now.setHours(now.getHours() + 24)
          break
        case '7days':
          now.setDate(now.getDate() + 7)
          break
      }
      expiresAt = now.toISOString()
    }

    // Create share record
    const { data: shareData, error: shareError } = await supabase
      .from('file_shares')
      .insert({
        file_id: fileId,
        shared_by: user.id,
        secret: secretToken,
        expires_at: expiresAt
      })
      .select()
      .single()

    if (shareError) {
      console.error('Share creation error:', shareError)
      return new Response('Failed to create share', { status: 500, headers: corsHeaders })
    }

    // Get file details for CloudFront URL generation
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('file_url, file_name, file_type')
      .eq('id', fileId)
      .single()

    if (fileError || !fileData) {
      return new Response('File not found', { status: 404, headers: corsHeaders })
    }

    // Generate CloudFront signed URL (30-minute expiration for security)
    const cloudfrontUrl = Deno.env.get('CLOUDFRONT_URL_ORIGINALS')
    const shareUrl = `${cloudfrontUrl}/${fileData.file_url}?token=${secretToken}`

    return new Response(JSON.stringify({
      shareId: shareData.id,
      shareUrl,
      secret: secretToken,
      expiresAt,
      fileName: fileData.file_name,
      fileType: fileData.file_type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Create share error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
