
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

// AWS S3 Presigned URL generation for PUT requests
async function generatePresignedUrl(
  bucket: string,
  key: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const date = new Date()
  const dateString = date.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateStamp = dateString.slice(0, 8)
  
  const algorithm = 'AWS4-HMAC-SHA256'
  const credential = `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`
  
  // Properly encode the key for the canonical URI
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/')
  
  console.log('[DEBUG] Signature generation inputs:', {
    bucket,
    key,
    encodedKey,
    region,
    contentType,
    dateString,
    credential
  })
  
  // Create canonical request with content-type included in signed headers
  const method = 'PUT'
  const canonicalUri = `/${encodedKey}`
  
  // Query parameters must be in alphabetical order
  const queryParams = new URLSearchParams()
  queryParams.set('X-Amz-Algorithm', algorithm)
  queryParams.set('X-Amz-Credential', credential)
  queryParams.set('X-Amz-Date', dateString)
  queryParams.set('X-Amz-Expires', expiresIn.toString())
  queryParams.set('X-Amz-SignedHeaders', 'content-type;host')
  
  // Sort parameters alphabetically by key
  queryParams.sort()
  const canonicalQueryString = queryParams.toString()
  
  // Include both content-type and host in canonical headers (alphabetically ordered)
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${bucket}.s3.${region}.amazonaws.com`
  ].join('\n') + '\n'
  
  const signedHeaders = 'content-type;host'
  const payloadHash = 'UNSIGNED-PAYLOAD'
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n')
  
  console.log('[DEBUG] Canonical request:', canonicalRequest)
  
  // Create string to sign
  const stringToSign = [
    algorithm,
    dateString,
    `${dateStamp}/${region}/s3/aws4_request`,
    await sha256(canonicalRequest)
  ].join('\n')
  
  console.log('[DEBUG] String to sign:', stringToSign)
  
  // Calculate signature
  const kDate = await hmacSha256(dateStamp, `AWS4${secretAccessKey}`)
  const kRegion = await hmacSha256(region, kDate)
  const kService = await hmacSha256('s3', kRegion)
  const kSigning = await hmacSha256('aws4_request', kService)
  const signature = await hmacSha256(stringToSign, kSigning, 'hex')
  
  console.log('[DEBUG] Generated signature:', signature)
  
  // Build final URL
  const url = new URL(`https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`)
  url.searchParams.set('X-Amz-Algorithm', algorithm)
  url.searchParams.set('X-Amz-Credential', credential)
  url.searchParams.set('X-Amz-Date', dateString)
  url.searchParams.set('X-Amz-Expires', expiresIn.toString())
  url.searchParams.set('X-Amz-SignedHeaders', signedHeaders)
  url.searchParams.set('X-Amz-Signature', signature as string)
  
  console.log('[DEBUG] Final presigned URL:', url.toString())
  
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

interface UploadRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  ministryId: string;
  eventDate?: string;
  notes?: string;
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

    const uploadData: UploadRequest = await req.json()

    console.log('[DEBUG] Upload request:', {
      fileName: uploadData.fileName,
      ministryId: uploadData.ministryId,
      userId: user.id,
      eventDate: uploadData.eventDate
    })

    // Validate ministry ID is provided
    if (!uploadData.ministryId) {
      return new Response('Ministry ID is required', { status: 400, headers: corsHeaders })
    }

    // Get user profile to check permissions
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, ministry_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      console.error('[DEBUG] User profile error:', profileError)
      return new Response('User profile not found', { status: 404, headers: corsHeaders })
    }

    console.log('[DEBUG] User profile:', {
      role: userProfile.role,
      userMinistry: userProfile.ministry_id,
      uploadMinistry: uploadData.ministryId
    })

    // Check if user can upload to the specified ministry
    const canUploadToMinistry = 
      userProfile.role === 'Director' ||
      userProfile.role === 'SuperOrg' ||
      userProfile.role === 'Admin' ||
      userProfile.ministry_id === uploadData.ministryId

    if (!canUploadToMinistry) {
      console.log('[DEBUG] Upload denied - user cannot upload to this ministry')
      return new Response('You do not have permission to upload to this ministry', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    // Sanitize filename to avoid encoding issues
    const sanitizedFileName = uploadData.fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    
    // Generate unique file key
    const timestamp = Date.now()
    const fileKey = `${user.id}/${timestamp}-${sanitizedFileName}`
    const previewKey = `${user.id}/${timestamp}-${sanitizedFileName.split('.')[0]}`
    
    console.log('[DEBUG] File naming:', {
      original: uploadData.fileName,
      sanitized: sanitizedFileName,
      fileKey,
      previewKey
    })

    // Create AWS S3 presigned URL for file upload
    const s3Bucket = Deno.env.get('S3_BUCKET_ORIGINALS')
    const awsRegion = Deno.env.get('AWS_REGION')
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    
    console.log('[DEBUG] AWS Config check:', {
      bucket: s3Bucket ? 'configured' : 'missing',
      region: awsRegion ? 'configured' : 'missing',
      accessKey: awsAccessKeyId ? 'configured' : 'missing',
      secretKey: awsSecretAccessKey ? 'configured' : 'missing'
    })

    if (!s3Bucket || !awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('Missing required AWS configuration')
    }

    // Generate presigned URL for S3 upload
    const uploadUrl = await generatePresignedUrl(
      s3Bucket,
      fileKey,
      awsRegion,
      awsAccessKeyId,
      awsSecretAccessKey,
      uploadData.fileType
    )

    // Handle empty or invalid event dates
    let eventDateValue = null;
    if (uploadData.eventDate && uploadData.eventDate.trim() !== '') {
      eventDateValue = uploadData.eventDate;
    }

    // Create file record in database with ministry ID
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        file_name: uploadData.fileName,
        file_size: uploadData.fileSize,
        file_type: uploadData.fileType,
        file_url: fileKey,
        preview_key: previewKey,
        uploader_id: user.id,
        ministry_id: uploadData.ministryId,
        event_date: eventDateValue,
        notes: uploadData.notes || '',
        needs_reencode: uploadData.fileType.startsWith('video/')
      })
      .select()
      .single()

    if (fileError) {
      console.error('File record creation error:', fileError)
      return new Response('Failed to create file record', { status: 500, headers: corsHeaders })
    }

    console.log('[DEBUG] File record created successfully:', fileData.id)

    // Trigger processing for video files and thumbnail generation for images
    if (uploadData.fileType.startsWith('video/')) {
      EdgeRuntime.waitUntil(
        supabase.functions.invoke('process-file-metadata', {
          body: {
            fileId: fileData.id,
            fileKey,
            previewKey
          }
        }).then(({ error }) => {
          if (error) {
            console.error('[UPLOAD] Processing trigger error:', error)
          } else {
            console.log('[UPLOAD] Processing triggered successfully')
          }
        })
      )
    } else if (uploadData.fileType.startsWith('image/')) {
      // Trigger thumbnail generation for images
      EdgeRuntime.waitUntil(
        supabase.functions.invoke('generate-thumbnail', {
          body: {
            fileId: fileData.id,
            fileKey,
            previewKey,
            fileType: uploadData.fileType
          }
        }).then(({ error }) => {
          if (error) {
            console.error('[UPLOAD] Thumbnail generation trigger error:', error)
          } else {
            console.log('[UPLOAD] Thumbnail generation triggered successfully')
          }
        })
      )
    }

    return new Response(JSON.stringify({
      fileId: fileData.id,
      presignedUrl: uploadUrl,
      fileKey,
      previewKey,
      uploadUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Upload preparation error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
