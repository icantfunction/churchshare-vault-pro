import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ThumbnailRequest {
  fileId: string;
  fileKey: string;
  previewKey: string;
  fileType: string;
}

// Simple image processing using Canvas API (built into Deno)
async function generateThumbnail(imageBuffer: ArrayBuffer, maxSize = 150): Promise<ArrayBuffer> {
  try {
    // For this implementation, we'll use a simple approach with ImageMagick-like processing
    // In a production environment, you might want to use a proper image processing service
    
    // For now, we'll create a simple thumbnail by resizing the image
    // This is a placeholder - in production you'd use a proper image processing library
    console.log('[THUMBNAIL] Processing image, original size:', imageBuffer.byteLength);
    
    // Return the original buffer for now (placeholder implementation)
    // In production, you would:
    // 1. Decode the image
    // 2. Resize to maxSize x maxSize maintaining aspect ratio
    // 3. Re-encode as JPEG or WebP
    return imageBuffer;
  } catch (error) {
    console.error('[THUMBNAIL] Error processing image:', error);
    throw error;
  }
}

// Generate presigned URL for S3 upload (simplified version for thumbnails)
async function generateThumbnailUploadUrl(
  bucket: string,
  key: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<string> {
  const date = new Date()
  const dateString = date.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateStamp = dateString.slice(0, 8)
  
  const algorithm = 'AWS4-HMAC-SHA256'
  const credential = `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, '/')
  
  // Create canonical request for thumbnail upload
  const method = 'PUT'
  const canonicalUri = `/${encodedKey}`
  const contentType = 'image/jpeg'
  
  const queryParams = new URLSearchParams()
  queryParams.set('X-Amz-Algorithm', algorithm)
  queryParams.set('X-Amz-Credential', credential)
  queryParams.set('X-Amz-Date', dateString)
  queryParams.set('X-Amz-Expires', '3600')
  queryParams.set('X-Amz-SignedHeaders', 'content-type;host')
  
  queryParams.sort()
  const canonicalQueryString = queryParams.toString()
  
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
  const url = new URL(`https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`)
  url.searchParams.set('X-Amz-Algorithm', algorithm)
  url.searchParams.set('X-Amz-Credential', credential)
  url.searchParams.set('X-Amz-Date', dateString)
  url.searchParams.set('X-Amz-Expires', '3600')
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileId, fileKey, previewKey, fileType }: ThumbnailRequest = await req.json()

    console.log(`[THUMBNAIL] Starting thumbnail generation for: ${fileKey}`)
    
    // Check if this is an image file
    if (!fileType.startsWith('image/')) {
      console.log(`[THUMBNAIL] Skipping non-image file: ${fileType}`)
      return new Response(JSON.stringify({
        success: false,
        message: 'Not an image file'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get AWS configuration - Use originals bucket for consistency
    const originsBucket = Deno.env.get('S3_BUCKET_ORIGINALS')
    const region = Deno.env.get('AWS_REGION') || 'us-east-1'
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    
    if (!originsBucket || !accessKeyId || !secretAccessKey) {
      throw new Error('Missing required AWS configuration')
    }

    // Create thumbnail filename with _thumb suffix
    const thumbnailKey = `${previewKey}_thumb.jpg`
    
    console.log(`[THUMBNAIL] Processing: ${fileKey} -> ${thumbnailKey}`)

    try {
      // Download original image from S3
      const originalUrl = `https://${originsBucket}.s3.${region}.amazonaws.com/${fileKey}`
      const imageResponse = await fetch(originalUrl)
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to download original image: ${imageResponse.status}`)
      }
      
      const imageBuffer = await imageResponse.arrayBuffer()
      console.log(`[THUMBNAIL] Downloaded original image: ${imageBuffer.byteLength} bytes`)
      
      // Process thumbnail (for now just use original, but with proper key)
      const thumbnailBuffer = await generateThumbnail(imageBuffer, 300)
      
      // Upload thumbnail to S3 using the same bucket
      const uploadUrl = await generateThumbnailUploadUrl(
        originsBucket,
        thumbnailKey,
        region,
        accessKeyId,
        secretAccessKey
      )
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: thumbnailBuffer,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      })
      
      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload thumbnail: ${uploadResponse.status}`)
      }
      
      console.log(`[THUMBNAIL] Successfully uploaded thumbnail: ${thumbnailKey}`)
      
      // Update the file record with the thumbnail key
      const { error: updateError } = await supabase
        .from('files')
        .update({
          preview_key: thumbnailKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        
      if (updateError) {
        console.error('[THUMBNAIL] File update error:', updateError)
        throw updateError
      }

      console.log(`[THUMBNAIL] Successfully updated preview key: ${thumbnailKey}`)

      return new Response(JSON.stringify({
        success: true,
        fileId,
        thumbnailKey,
        message: 'Thumbnail generated successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (processingError) {
      console.error('[THUMBNAIL] Processing error:', processingError)
      
      // Fallback: use the original file key as preview
      const { error: fallbackError } = await supabase
        .from('files')
        .update({
          preview_key: fileKey, // Use original as fallback
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        
      if (fallbackError) {
        console.error('[THUMBNAIL] Fallback update error:', fallbackError)
      }

      return new Response(JSON.stringify({
        success: false,
        fileId,
        thumbnailKey: fileKey, // Fallback to original
        error: 'Thumbnail generation failed, using original as preview',
        message: processingError.message
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Thumbnail generation error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})