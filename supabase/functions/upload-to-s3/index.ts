
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    console.log('[UPLOAD] Starting upload request processing')
    
    // Step 1: Verify AWS Configuration
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const s3Bucket = Deno.env.get('S3_BUCKET_ORIGINALS')
    const awsRegion = Deno.env.get('AWS_REGION')
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    
    console.log('[UPLOAD] Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
      hasS3Bucket: !!s3Bucket,
      hasAwsRegion: !!awsRegion,
      hasAwsAccessKey: !!awsAccessKeyId,
      hasAwsSecretKey: !!awsSecretAccessKey
    })

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[UPLOAD] Missing Supabase configuration')
      return new Response('Missing Supabase configuration', { status: 500, headers: corsHeaders })
    }

    if (!s3Bucket || !awsRegion || !awsAccessKeyId || !awsSecretAccessKey) {
      console.error('[UPLOAD] Missing AWS configuration')
      return new Response('Missing AWS configuration', { status: 500, headers: corsHeaders })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('[UPLOAD] Supabase client created successfully')

    // Step 2: Validate and authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[UPLOAD] Missing authorization header')
      return new Response('Missing authorization header', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[UPLOAD] Extracting user from token')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('[UPLOAD] Authentication failed:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    console.log('[UPLOAD] User authenticated:', user.id)

    // Step 3: Parse and validate request data
    let uploadData: UploadRequest
    try {
      uploadData = await req.json()
      console.log('[UPLOAD] Request data parsed:', {
        fileName: uploadData.fileName,
        fileSize: uploadData.fileSize,
        fileType: uploadData.fileType,
        ministryId: uploadData.ministryId,
        eventDate: uploadData.eventDate
      })
    } catch (parseError) {
      console.error('[UPLOAD] Failed to parse request JSON:', parseError)
      return new Response('Invalid JSON in request body', { status: 400, headers: corsHeaders })
    }

    // Step 4: Validate request data
    if (!uploadData.fileName || uploadData.fileName.trim() === '') {
      console.error('[UPLOAD] Missing or empty fileName')
      return new Response('File name is required', { status: 400, headers: corsHeaders })
    }

    if (!uploadData.fileType || uploadData.fileType.trim() === '') {
      console.error('[UPLOAD] Missing or empty fileType')
      return new Response('File type is required', { status: 400, headers: corsHeaders })
    }

    if (!uploadData.fileSize || uploadData.fileSize <= 0) {
      console.error('[UPLOAD] Invalid file size:', uploadData.fileSize)
      return new Response('Valid file size is required', { status: 400, headers: corsHeaders })
    }

    if (!uploadData.ministryId || uploadData.ministryId.trim() === '') {
      console.error('[UPLOAD] Missing ministryId')
      return new Response('Ministry ID is required', { status: 400, headers: corsHeaders })
    }

    console.log('[UPLOAD] Request validation passed')

    // Step 5: Get user profile and check permissions
    console.log('[UPLOAD] Fetching user profile for permissions check')
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, ministry_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[UPLOAD] User profile fetch error:', {
        error: profileError,
        code: profileError.code,
        message: profileError.message,
        details: profileError.details
      })
      return new Response('Failed to fetch user profile', { status: 500, headers: corsHeaders })
    }

    if (!userProfile) {
      console.error('[UPLOAD] User profile not found for user:', user.id)
      return new Response('User profile not found', { status: 404, headers: corsHeaders })
    }

    console.log('[UPLOAD] User profile retrieved:', {
      userId: user.id,
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

    console.log('[UPLOAD] Ministry permission check:', {
      userRole: userProfile.role,
      canUpload: canUploadToMinistry,
      reason: canUploadToMinistry ? 'Authorized' : 'Not authorized for this ministry'
    })

    if (!canUploadToMinistry) {
      console.error('[UPLOAD] Upload denied - insufficient permissions')
      return new Response('You do not have permission to upload to this ministry', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    // Step 6: Process filename and generate file keys
    console.log('[UPLOAD] Processing filename and generating keys')
    
    // Sanitize filename: remove path separators and control characters
    let sanitizedFileName = uploadData.fileName
      .replace(/[/\\]/g, '_')  // Replace path separators
      .replace(/[\x00-\x1f\x80-\x9f]/g, '')  // Remove control characters
      .trim()

    if (sanitizedFileName === '') {
      console.error('[UPLOAD] Filename became empty after sanitization')
      return new Response('Invalid filename', { status: 400, headers: corsHeaders })
    }
    
    // Generate unique file key with timestamp
    const timestamp = Date.now()
    const fileKey = `${user.id}/${timestamp}-${sanitizedFileName}`
    const previewKey = `${user.id}/${timestamp}-${sanitizedFileName.split('.')[0]}`
    
    console.log('[UPLOAD] File naming completed:', {
      original: uploadData.fileName,
      sanitized: sanitizedFileName,
      fileKey,
      previewKey,
      timestamp
    })

    // Step 7: Generate presigned URL for S3 upload
    console.log('[UPLOAD] Generating presigned URL for S3 upload')
    let uploadUrl: string
    try {
      uploadUrl = await generatePresignedUrl(
        s3Bucket,
        fileKey,
        awsRegion,
        awsAccessKeyId,
        awsSecretAccessKey,
        uploadData.fileType
      )
      console.log('[UPLOAD] Presigned URL generated successfully')
    } catch (urlError) {
      console.error('[UPLOAD] Failed to generate presigned URL:', urlError)
      return new Response('Failed to generate upload URL', { status: 500, headers: corsHeaders })
    }

    // Step 8: Handle event date validation
    let eventDateValue = null
    if (uploadData.eventDate && uploadData.eventDate.trim() !== '') {
      eventDateValue = uploadData.eventDate
      console.log('[UPLOAD] Event date set:', eventDateValue)
    } else {
      console.log('[UPLOAD] No event date provided')
    }

    // Step 9: Create file record in database
    console.log('[UPLOAD] Creating file record in database')
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
      console.error('[UPLOAD] File record creation failed:', {
        error: fileError,
        code: fileError.code,
        message: fileError.message,
        details: fileError.details
      })
      return new Response('Failed to create file record', { status: 500, headers: corsHeaders })
    }

    console.log('[UPLOAD] File record created successfully:', {
      fileId: fileData.id,
      fileName: fileData.file_name,
      ministryId: fileData.ministry_id
    })

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
      console.log('[UPLOAD] Starting thumbnail generation for:', uploadData.fileName, 'Type:', uploadData.fileType);
      EdgeRuntime.waitUntil(
        supabase.functions.invoke('generate-thumbnail', {
          body: {
            fileId: fileData.id,
            fileKey,
            previewKey,
            fileType: uploadData.fileType
          }
        }).then(({ data, error }) => {
          if (error) {
            console.error('[UPLOAD] Thumbnail generation trigger error:', error)
          } else {
            console.log('[UPLOAD] Thumbnail generation triggered successfully:', data)
          }
        }).catch(err => {
          console.error('[UPLOAD] Thumbnail generation invocation failed:', err)
        })
      )
    }

    console.log('[UPLOAD] Upload preparation completed successfully:', {
      fileId: fileData.id,
      fileKey,
      previewKey
    })

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
    console.error('[UPLOAD] Fatal error in upload preparation:', {
      error: error.message,
      stack: error.stack,
      name: error.name
    })
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
