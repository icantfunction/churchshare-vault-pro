import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessingRequest {
  fileId: string;
  fileKey: string;
  previewKey: string;
  fileType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[POST-UPLOAD] Starting post-upload processing')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[POST-UPLOAD] Missing Supabase configuration')
      return new Response('Missing Supabase configuration', { status: 500, headers: corsHeaders })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[POST-UPLOAD] Missing authorization header')
      return new Response('Missing authorization header', { status: 401, headers: corsHeaders })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('[POST-UPLOAD] Authentication failed:', authError)
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Parse request data
    let processingData: ProcessingRequest
    try {
      processingData = await req.json()
      console.log('[POST-UPLOAD] Processing request:', {
        fileId: processingData.fileId,
        fileType: processingData.fileType,
        fileKey: processingData.fileKey
      })
    } catch (parseError) {
      console.error('[POST-UPLOAD] Failed to parse request JSON:', parseError)
      return new Response('Invalid JSON in request body', { status: 400, headers: corsHeaders })
    }

    // Validate required fields
    if (!processingData.fileId || !processingData.fileKey || !processingData.previewKey || !processingData.fileType) {
      console.error('[POST-UPLOAD] Missing required fields')
      return new Response('Missing required fields: fileId, fileKey, previewKey, fileType', { status: 400, headers: corsHeaders })
    }

    // Verify file exists in database and user has access
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('id, uploader_id, file_type')
      .eq('id', processingData.fileId)
      .single()

    if (fileError || !fileData) {
      console.error('[POST-UPLOAD] File not found or access denied:', fileError)
      return new Response('File not found or access denied', { status: 404, headers: corsHeaders })
    }

    // Check if user owns the file or has admin privileges
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const hasAccess = fileData.uploader_id === user.id || 
      (userProfile?.role && ['Admin', 'Director', 'SuperOrg'].includes(userProfile.role))

    if (!hasAccess) {
      console.error('[POST-UPLOAD] User does not have access to process this file')
      return new Response('Access denied', { status: 403, headers: corsHeaders })
    }

    // Trigger appropriate processing based on file type
    let processingResult = null
    
    if (processingData.fileType.startsWith('video/')) {
      console.log('[POST-UPLOAD] Triggering video processing for:', processingData.fileId)
      
      const { data, error } = await supabase.functions.invoke('process-file-metadata', {
        body: {
          fileId: processingData.fileId,
          fileKey: processingData.fileKey,
          previewKey: processingData.previewKey
        }
      })
      
      if (error) {
        console.error('[POST-UPLOAD] Video processing trigger error:', error)
        throw new Error(`Video processing failed: ${error.message}`)
      }
      
      processingResult = { type: 'video', data }
      console.log('[POST-UPLOAD] Video processing triggered successfully')
      
    } else if (processingData.fileType.startsWith('image/')) {
      console.log('[POST-UPLOAD] Triggering thumbnail generation for:', processingData.fileId)
      
      const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
        body: {
          fileId: processingData.fileId,
          fileKey: processingData.fileKey,
          previewKey: processingData.previewKey,
          fileType: processingData.fileType
        }
      })
      
      if (error) {
        console.error('[POST-UPLOAD] Thumbnail generation error:', error)
        throw new Error(`Thumbnail generation failed: ${error.message}`)
      }
      
      processingResult = { type: 'image', data }
      console.log('[POST-UPLOAD] Thumbnail generation triggered successfully')
      
    } else {
      console.log('[POST-UPLOAD] No processing needed for file type:', processingData.fileType)
      processingResult = { type: 'none', message: 'No processing needed for this file type' }
    }

    return new Response(JSON.stringify({
      success: true,
      fileId: processingData.fileId,
      processing: processingResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[POST-UPLOAD] Fatal error in post-upload processing:', {
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