
# ChurchShare

A secure, simple file sharing platform designed specifically for churches and creative ministries. Built with React, TypeScript, and Supabase.

## Features

- **Secure File Sharing**: Role-based permissions ensure only authorized ministry members can access files
- **High-Quality Uploads**: Upload photos and files without compression - original quality preserved  
- **Ministry Organization**: Organize files by ministry and events for easy discovery
- **Demo Mode**: Try the platform with sample data before signing up

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Quick Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd churchshare
   ./setup.sh  # One-click setup script
   ```

2. **Configure environment variables (MANDATORY):**
   ```bash
   cp .env.example .env
   ```
   
   **⚠️ IMPORTANT**: You MUST edit `.env` and add your Supabase credentials before running the app:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   **The app will not start without these environment variables configured.**

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Environment Variables

This project requires Supabase credentials to function properly. You'll need to:

1. **Create a Supabase project** at [https://app.supabase.com](https://app.supabase.com)

2. **Get your credentials** from Project Settings → API:
   - `Project URL` → use as `VITE_SUPABASE_URL`
   - `anon public` key → use as `VITE_SUPABASE_ANON_KEY`

3. **Create your .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Add your credentials to .env:**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

⚠️ **Security Note**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally
- `npm run test` - Run test suite

### Running Tests

Run the Vitest suite with:
```bash
npm run test
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Routing**: React Router
- **State Management**: React Context API
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Route components
└── lib/                # Utility functions
```

## Troubleshooting

### Edge Function Errors: "Edge Function returned a non-2xx status code"

This is the most common error in ChurchShare. Here's how to diagnose and fix it:

#### Required Supabase Secrets

All edge functions require these secrets to be configured in Supabase:

**AWS Configuration (Required for file uploads):**
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key  
- `AWS_REGION` - AWS region (e.g., "us-east-1")
- `S3_BUCKET_ORIGINALS` - S3 bucket for original files
- `S3_BUCKET_PREVIEWS` - S3 bucket for thumbnails/previews
- `CLOUDFRONT_URL_ORIGINALS` - CloudFront URL for originals
- `CLOUDFRONT_URL_PREVIEWS` - CloudFront URL for previews

**Media Processing (Required for video files):**
- `MEDIACONVERT_TEMPLATE_NAME` - AWS MediaConvert template
- `MEDIACONVERT_ENDPOINT` - MediaConvert endpoint URL

**Supabase Configuration (Auto-configured):**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `SUPABASE_DB_URL` - Database connection string

#### How to Configure Secrets

1. Go to [Supabase Edge Functions Settings](https://supabase.com/dashboard/project/eb2a9d7f-e4d4-466f-95b8-4cea2bee63bf/settings/functions)
2. Add each required secret with its value
3. Redeploy your edge functions (happens automatically on code changes)

#### Common Error Scenarios

**400 Bad Request Errors:**
- **Cause**: Missing required fields in upload request
- **Fix**: Ensure ministryId is selected before uploading files
- **Check**: Verify file name, size, and type are valid

**401 Unauthorized Errors:**
- **Cause**: User not logged in or invalid authentication token
- **Fix**: Log out and log back in, check authentication flow

**403 Forbidden Errors:**
- **Cause**: User doesn't have permission to upload to selected ministry
- **Fix**: Check user role and ministry assignment in database

**500 Internal Server Error:**
- **Cause**: Missing AWS credentials or configuration
- **Fix**: Verify all AWS secrets are configured correctly
- **Check**: Edge function logs for specific error details

#### Debug Process

1. **Check Edge Function Logs:**
   - Go to [Edge Functions](https://supabase.com/dashboard/project/eb2a9d7f-e4d4-466f-95b8-4cea2bee63bf/functions)
   - Click on the failing function
   - View logs for specific error messages

2. **Verify Secrets Configuration:**
   - Go to [Function Settings](https://supabase.com/dashboard/project/eb2a9d7f-e4d4-466f-95b8-4cea2bee63bf/settings/functions)
   - Ensure all required secrets are present
   - AWS credentials must have S3 permissions

3. **Test Upload Flow:**
   - Select a ministry before uploading
   - Try uploading a small test file first
   - Check browser console for client-side errors

#### AWS Setup Requirements

Your AWS credentials need these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-originals/*",
        "arn:aws:s3:::your-bucket-previews/*"
      ]
    }
  ]
}
```

#### Prevention Checklist

- ✅ All Supabase secrets configured
- ✅ AWS credentials have correct permissions  
- ✅ S3 buckets exist and are accessible
- ✅ User is logged in with proper role
- ✅ Ministry is selected before upload
- ✅ File types are supported (images/videos)

### Other Common Issues

#### Files Not Appearing After Upload
- **Cause**: Database permissions or ministry filtering
- **Fix**: Check user's ministry assignment matches upload ministry

#### Thumbnails Not Generating
- **Cause**: Missing AWS MediaConvert configuration
- **Fix**: Configure MediaConvert secrets for video processing

#### Slow Upload Performance  
- **Cause**: Large file sizes or network issues
- **Fix**: Use file compression or chunked uploads for large files

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Run linting: `npm run lint`
5. Run tests: `npm run test`
6. Commit your changes: `git commit -m 'Add feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

## License

This project is licensed under the MIT License.
