
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Get AWS credentials and config
    const bucketName = type === 'preview' 
      ? Deno.env.get('S3_BUCKET_PREVIEWS')
      : Deno.env.get('S3_BUCKET_ORIGINALS')
    const region = Deno.env.get('AWS_REGION') || 'us-east-1'
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    
    if (!bucketName || !accessKeyId || !secretAccessKey) {
      console.error('[DOWNLOAD] Missing AWS configuration')
      return new Response('AWS configuration not available', { status: 500, headers: corsHeaders })
    }

    let finalUrl: string;
    
    // Try CloudFront first, fallback to S3 presigned URL
    const cloudFrontBaseUrl = type === 'preview' 
      ? Deno.env.get('CLOUDFRONT_URL_PREVIEWS')
      : Deno.env.get('CLOUDFRONT_URL_ORIGINALS')
    
    if (cloudFrontBaseUrl) {
      // Use CloudFront distribution (public access, no signing needed for now)
      finalUrl = `${cloudFrontBaseUrl}/${fileKey}`
    } else {
      // Generate S3 presigned URL (1 hour expiration)
      finalUrl = await generatePresignedGetUrl(
        bucketName,
        fileKey,
        region,
        accessKeyId,
        secretAccessKey,
        3600 // 1 hour
      )
    }

    console.log(`[DOWNLOAD] Generated ${cloudFrontBaseUrl ? 'CloudFront' : 'S3 presigned'} URL for ${fileKey}`)

    // Always return consistent JSON format for both downloads and previews
    return new Response(
      JSON.stringify({ 
        url: finalUrl,
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
