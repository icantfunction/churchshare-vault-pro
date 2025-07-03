-- Add system log entry for S3 CORS configuration requirement
INSERT INTO public.system_logs (action, details)
VALUES (
  'aws_s3_cors_setup_required', 
  'S3 bucket CORS configuration needed for browser uploads. Configure CORS policy on churchshare-originals bucket to allow PUT requests from web origins.'
);