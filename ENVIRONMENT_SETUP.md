# Environment Setup Guide

## Frontend Environment Variables (.env.local)

Create a `.env.local` file in the root directory with the following content:

```bash
# Supabase Configuration
# Get these from your Supabase project dashboard -> Settings -> API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Base URL for the application (used in guest links + auth redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Verity Policy Configuration
NEXT_PUBLIC_VERITY_POLICY_TITLE="Verity Attestation & Payment Consent"
```

## Supabase Edge Function Secrets

These secrets are stored in Supabase and used by Edge Functions. Set them via Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set required secrets
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_auth_token
supabase secrets set TWILIO_MESSAGING_SERVICE_SID=MG...
supabase secrets set VERITY_BASE_URL=https://your-domain.com
supabase secrets set VERITY_SIGNING_SECRET=your_long_random_string
supabase secrets set VERITY_REPORT_BUCKET=verity-reports
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Required Services Setup

### 1. Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Get your credentials from **Settings** → **API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)

### 2. Twilio Setup

1. Create account at [https://twilio.com](https://twilio.com)
2. Get Account SID and Auth Token from Console Dashboard
3. Purchase a phone number or use Messaging Service
4. Get Messaging Service SID from Messaging → Services

### 3. Authentication Configuration

In your Supabase dashboard:

1. Go to **Authentication** → **Settings**
2. Enable **Email** authentication
3. Configure **Site URL**: `http://localhost:3000` (or your production domain)
4. Add **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`
5. Configure email templates:
   - **Confirm signup**: Use "Verity by Shadow Solutions" as brand name
   - **Reset password**: Use "Verity by Shadow Solutions" as brand name

### 4. Database Schema

Run the migration SQL from `supabase/migrations/001_production_schema.sql` in your Supabase SQL Editor.

### 5. Storage Setup

The migration automatically creates the `verity-reports` bucket for PDF storage.

## Production Environment

For production deployment, update these values:

```bash
# Production .env.local
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

And update Supabase secrets:

```bash
supabase secrets set VERITY_BASE_URL=https://your-domain.com
```

## Security Notes

- Never commit `.env.local` to version control
- Use different Supabase projects for development and production
- Rotate secrets regularly in production
- Monitor Edge Function logs for any exposed secrets
