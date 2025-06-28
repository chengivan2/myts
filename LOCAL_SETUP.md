# Local Development Setup

## Environment Variables

For local development, you need to create a `.env.local` file in the root directory with your environment variables.

### Steps:

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your actual values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   RESEND_API_KEY=your_resend_key_here
   ```

### Finding Your Supabase Keys:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon public key

## Error: "No API key found in request"

This error occurs when:
1. `.env.local` file is missing
2. Environment variables are not set correctly
3. Variables don't start with `NEXT_PUBLIC_` (for client-side access)

## Production Deployment

Environment variables are already configured on Vercel. The local setup is only needed for development.
