
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadRequest {
  fileName: string;
  fileSize: number;
  fileType: string;
  ministryId?: string;
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

    // Generate unique file key
    const timestamp = Date.now()
    const fileKey = `${user.id}/${timestamp}-${uploadData.fileName}`
    const previewKey = `${user.id}/${timestamp}-${uploadData.fileName.split('.')[0]}`

    // Create AWS S3 presigned URL for multipart upload
    const s3Bucket = Deno.env.get('S3_BUCKET_ORIGINALS')
    const awsRegion = Deno.env.get('AWS_REGION')
    
    // For now, return a simple presigned URL (in production, implement multipart upload)
    const presignedUrl = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/${fileKey}`

    // Create file record in database
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
        event_date: uploadData.eventDate,
        notes: uploadData.notes,
        needs_reencode: uploadData.fileType.startsWith('video/')
      })
      .select()
      .single()

    if (fileError) {
      console.error('File record creation error:', fileError)
      return new Response('Failed to create file record', { status: 500, headers: corsHeaders })
    }

    // Trigger MediaConvert processing for video files
    if (uploadData.fileType.startsWith('video/')) {
      EdgeRuntime.waitUntil(
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/process-file-metadata`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fileId: fileData.id,
            fileKey,
            previewKey
          })
        })
      )
    }

    return new Response(JSON.stringify({
      fileId: fileData.id,
      presignedUrl,
      fileKey,
      previewKey,
      uploadUrl: `https://s3.${awsRegion}.amazonaws.com/${s3Bucket}/${fileKey}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Upload preparation error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
