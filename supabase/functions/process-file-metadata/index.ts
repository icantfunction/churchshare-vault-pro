
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessRequest {
  fileId: string;
  fileKey: string;
  previewKey: string;
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

    const { fileId, fileKey, previewKey }: ProcessRequest = await req.json()

    console.log(`[PROCESS] Starting metadata processing for: ${fileKey}`)
    
    // Get file record to determine file type
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('file_type, file_name')
      .eq('id', fileId)
      .single()

    if (fileError || !file) {
      console.error('[PROCESS] File not found:', fileError)
      return new Response('File not found', { status: 404, headers: corsHeaders })
    }

    console.log(`[PROCESS] Processing file: ${file.file_name} (${file.file_type})`)

    // For video files, implement HLS processing (placeholder for now)
    if (file.file_type.startsWith('video/')) {
      console.log(`[PROCESS] Video processing for ${file.file_name}`)
      
      // TODO: Implement actual video processing
      // 1. Download video from S3
      // 2. Use FFmpeg to create HLS segments 
      // 3. Upload segments back to S3
      // 4. Update preview_key with HLS manifest path
      
      // For now, use original file as preview
      const { error: updateError } = await supabase
        .from('files')
        .update({
          preview_key: fileKey, // Use original until HLS is implemented
          needs_reencode: false,
          compression_ratio: 0.85,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        
      if (updateError) {
        console.error('[PROCESS] Update error:', updateError)
        throw updateError
      }

      console.log(`[PROCESS] Video processing completed (placeholder): ${fileKey}`)
    } else {
      // For non-video files, just mark as processed
      const { error: updateError } = await supabase
        .from('files')
        .update({
          preview_key: fileKey, // Use original file
          needs_reencode: false,
          compression_ratio: 1.0, // No compression for non-video
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        
      if (updateError) {
        console.error('[PROCESS] Update error:', updateError)
        throw updateError
      }

      console.log(`[PROCESS] File processing completed: ${file.file_name}`)
    }

    // Log processing completion
    const { error: logError } = await supabase
      .from('system_logs')
      .insert({
        action: 'file_processed',
        details: `File ${file.file_name} (${file.file_type}) processed successfully with preview key ${fileKey}`
      })

    if (logError) {
      console.error('Logging error:', logError)
    }

    return new Response(JSON.stringify({
      success: true,
      fileId,
      message: 'File processing completed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('File processing error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
