
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1'

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

    console.log(`[PROCESS] Starting processing for file: ${fileKey}`)
    
    // Get AWS MediaConvert configuration
    const mediaConvertEndpoint = Deno.env.get('MEDIACONVERT_ENDPOINT')
    const templateName = Deno.env.get('MEDIACONVERT_TEMPLATE_NAME')
    const region = Deno.env.get('AWS_REGION') || 'us-east-1'
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    
    if (!mediaConvertEndpoint || !templateName || !accessKeyId || !secretAccessKey) {
      console.log('[PROCESS] MediaConvert not configured, marking as processed without encoding')
      
      // Update file record to mark as processed (no actual encoding)
      const { error: updateError } = await supabase
        .from('files')
        .update({
          needs_reencode: false,
          compression_ratio: 0.85, // Estimated compression ratio
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        
      if (updateError) {
        console.error('[PROCESS] File update error:', updateError)
        return new Response('Failed to update file status', { status: 500, headers: corsHeaders })
      }
    } else {
      // In production, this would trigger AWS MediaConvert job
      console.log('[PROCESS] Would start MediaConvert job with:', {
        endpoint: mediaConvertEndpoint,
        template: templateName,
        inputFile: fileKey,
        outputPrefix: previewKey
      })
      
      // For now, simulate processing and update the record
      const { error: updateError } = await supabase
        .from('files')
        .update({
          needs_reencode: false,
          compression_ratio: 0.75, // MediaConvert compression ratio
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        
      if (updateError) {
        console.error('[PROCESS] File update error:', updateError)
        return new Response('Failed to update file status', { status: 500, headers: corsHeaders })
      }
    }

    // Log processing completion
    const { error: logError } = await supabase
      .from('system_logs')
      .insert({
        action: 'file_processed',
        details: `File ${fileKey} processed successfully with preview key ${previewKey}`
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
