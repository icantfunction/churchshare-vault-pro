
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

// AWS S3 Presigned URL generation for GET requests
async function generatePresignedGetUrl(
  bucket: string,
  key: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  expiresIn = 3600
): Promise<string> {
  const date = new Date()
  const dateString = date.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateStamp = dateString.slice(0, 8)
  
  const algorithm = 'AWS4-HMAC-SHA256'
  const credential = `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`
  
  // Create canonical request
  const method = 'GET'
  const canonicalUri = `/${key}`
  const canonicalQueryString = [
    `X-Amz-Algorithm=${algorithm}`,
    `X-Amz-Credential=${encodeURIComponent(credential)}`,
    `X-Amz-Date=${dateString}`,
    `X-Amz-Expires=${expiresIn}`,
    `X-Amz-SignedHeaders=host`
  ].join('&')
  
  const canonicalHeaders = `host:${bucket}.s3.${region}.amazonaws.com\n`
  const signedHeaders = 'host'
  const payloadHash = 'UNSIGNED-PAYLOAD'
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')
  
  // Create string to sign
  const stringToSign = [
    algorithm,
    dateString,
    `${dateStamp}/${region}/s3/aws4_request`,
    await sha256(canonicalRequest)
  ].join('\n')
  
  // Calculate signature
  const kDate = await hmacSha256(dateStamp, `AWS4${secretAccessKey}`)
  const kRegion = await hmacSha256(region, kDate)
  const kService = await hmacSha256('s3', kRegion)
  const kSigning = await hmacSha256('aws4_request', kService)
  const signature = await hmacSha256(stringToSign, kSigning, 'hex')
  
  // Build final URL
  const url = new URL(`https://${bucket}.s3.${region}.amazonaws.com/${key}`)
  url.searchParams.set('X-Amz-Algorithm', algorithm)
  url.searchParams.set('X-Amz-Credential', credential)
  url.searchParams.set('X-Amz-Date', dateString)
  url.searchParams.set('X-Amz-Expires', expiresIn.toString())
  url.searchParams.set('X-Amz-SignedHeaders', signedHeaders)
  url.searchParams.set('X-Amz-Signature', signature as string)
  
  return url.toString()
}

async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256(message: string, key: string | Uint8Array, encoding: 'hex' | 'binary' = 'binary'): Promise<string | Uint8Array> {
  const encoder = new TextEncoder()
  const keyData = typeof key === 'string' ? encoder.encode(key) : key
  const messageData = encoder.encode(message)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const signatureArray = new Uint8Array(signature)
  
  if (encoding === 'hex') {
    return Array.from(signatureArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
  
  return signatureArray
}

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

    // Get AWS credentials and config
    const bucketName = Deno.env.get('S3_BUCKET_PREVIEWS')
    const region = Deno.env.get('AWS_REGION') || 'us-east-1'
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    
    if (!bucketName || !accessKeyId || !secretAccessKey) {
      console.error('[HLS] Missing AWS configuration')
      return new Response('AWS configuration not available', { status: 500, headers: corsHeaders })
    }

    const previewPath = `${fileData.preview_key}/${quality}/playlist.m3u8`
    
    // Create expiration timestamp (30 minutes from now)
    const expirationTime = Math.floor(Date.now() / 1000) + (30 * 60)
    
    let hlsUrl: string;
    
    // Try CloudFront first, fallback to S3 presigned URL
    const cloudfrontUrl = Deno.env.get('CLOUDFRONT_URL_PREVIEWS')
    
    if (cloudfrontUrl) {
      // Use CloudFront distribution (for now, just append path - can add signed URLs later)
      hlsUrl = `${cloudfrontUrl}/${previewPath}`
    } else {
      // Generate S3 presigned URL for HLS manifest (30 minutes)
      hlsUrl = await generatePresignedGetUrl(
        bucketName,
        previewPath,
        region,
        accessKeyId,
        secretAccessKey,
        1800 // 30 minutes
      )
    }

    console.log(`[HLS] Generated ${cloudfrontUrl ? 'CloudFront' : 'S3 presigned'} URL for ${previewPath}`)

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
