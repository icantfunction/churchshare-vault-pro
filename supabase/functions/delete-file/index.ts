import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteRequest {
  fileId: string;
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

    const deleteData: DeleteRequest = await req.json()

    console.log('[DEBUG] Delete request:', {
      fileId: deleteData.fileId,
      userId: user.id
    })

    // Get file details first to verify ownership and get S3 keys
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', deleteData.fileId)
      .single()

    if (fetchError || !fileRecord) {
      console.error('[DEBUG] File not found:', fetchError)
      return new Response('File not found', { status: 404, headers: corsHeaders })
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

    // Check if user can delete this file
    const canDelete = 
      fileRecord.uploader_id === user.id ||
      userProfile.role === 'Director' ||
      userProfile.role === 'SuperOrg' ||
      userProfile.role === 'Admin'

    if (!canDelete) {
      console.log('[DEBUG] Delete denied - insufficient permissions')
      return new Response('You do not have permission to delete this file', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    // Delete from S3 buckets
    const awsRegion = Deno.env.get('AWS_REGION')
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
    const originalsBucket = Deno.env.get('S3_BUCKET_ORIGINALS')
    const previewsBucket = Deno.env.get('S3_BUCKET_PREVIEWS')

    if (awsRegion && awsAccessKeyId && awsSecretAccessKey && originalsBucket && fileRecord.file_url) {
      try {
        // Delete from originals bucket
        const deleteOriginalUrl = `https://${originalsBucket}.s3.${awsRegion}.amazonaws.com/${fileRecord.file_url}`
        const deleteOriginalResponse = await fetch(deleteOriginalUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `AWS4-HMAC-SHA256 Credential=${awsAccessKeyId}/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${awsRegion}/s3/aws4_request`
          }
        })
        
        console.log('[DEBUG] Delete from originals bucket response:', deleteOriginalResponse.status)

        // Delete from previews bucket if preview exists
        if (previewsBucket && fileRecord.preview_key) {
          const deletePreviewUrl = `https://${previewsBucket}.s3.${awsRegion}.amazonaws.com/${fileRecord.preview_key}`
          const deletePreviewResponse = await fetch(deletePreviewUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `AWS4-HMAC-SHA256 Credential=${awsAccessKeyId}/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${awsRegion}/s3/aws4_request`
            }
          })
          
          console.log('[DEBUG] Delete from previews bucket response:', deletePreviewResponse.status)
        }
      } catch (s3Error) {
        console.error('[DEBUG] S3 deletion error:', s3Error)
        // Continue with database deletion even if S3 fails
      }
    }

    // Delete associated file shares first (due to foreign key constraint)
    const { error: sharesDeleteError } = await supabase
      .from('file_shares')
      .delete()
      .eq('file_id', deleteData.fileId)

    if (sharesDeleteError) {
      console.error('[DEBUG] Error deleting file shares:', sharesDeleteError)
    }

    // Delete file record from database
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', deleteData.fileId)

    if (deleteError) {
      console.error('[DEBUG] Database deletion error:', deleteError)
      return new Response('Failed to delete file record', { status: 500, headers: corsHeaders })
    }

    console.log('[DEBUG] File deleted successfully:', deleteData.fileId)

    return new Response(JSON.stringify({
      success: true,
      message: 'File deleted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})