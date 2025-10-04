# Backend - Supabase Edge Functions

This directory contains Supabase Edge Functions that handle SMS operations and database interactions.

## Overview

The Edge Functions run on Supabase's infrastructure (Deno runtime) and are called by the React Native app. You don't need to run these locally - they're deployed to Supabase and called via HTTP.

## Files

- **`send-sms.ts`** - Sends SMS verification codes via Twilio
- **`verify-code.ts`** - Validates verification codes
- **`schema.sql`** - Database schema (tables, RLS policies)
- **`deno.d.ts`** - TypeScript definitions for Deno runtime

## Deployment

### Prerequisites

1. Install Supabase CLI:
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. Login to Supabase:
   \`\`\`bash
   supabase login
   \`\`\`

3. Link your project:
   \`\`\`bash
   supabase link --project-ref your-project-ref
   \`\`\`
   
   Find your project ref in your Supabase dashboard URL:
   `https://supabase.com/dashboard/project/[your-project-ref]`

### Deploy Edge Functions

Deploy both functions to Supabase:

\`\`\`bash
# Deploy send-sms function
supabase functions deploy send-sms

# Deploy verify-code function
supabase functions deploy verify-code
\`\`\`

### Set Twilio Secrets

Edge Functions need Twilio credentials to send SMS. Set these as Supabase secrets:

\`\`\`bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token_here
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
\`\`\`

**Important**: These secrets are stored securely on Supabase and are NOT in your local `.env` file.

### Verify Deployment

Check that functions are deployed:

\`\`\`bash
supabase functions list
\`\`\`

You should see:
\`\`\`
send-sms
verify-code
\`\`\`

## Testing Edge Functions

### View Logs

Monitor real-time logs for debugging:

\`\`\`bash
# Watch send-sms logs
supabase functions logs send-sms --follow

# Watch verify-code logs
supabase functions logs verify-code --follow
\`\`\`

### Test Locally (Optional)

If you want to test Edge Functions locally before deploying:

\`\`\`bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-sms' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"phone_number":"+1234567890","credit_card_last_4":"1234","drivers_license":"ABC123"}'
\`\`\`

**Note**: Local testing requires Docker and the full Supabase CLI setup. For most development, it's easier to deploy to Supabase and test from your app.

## Making Changes

### Modify Edge Functions

1. Edit `send-sms.ts` or `verify-code.ts`
2. Deploy the updated function:
   \`\`\`bash
   supabase functions deploy send-sms
   # or
   supabase functions deploy verify-code
   \`\`\`
3. Test from your React Native app

### Update Database Schema

1. Edit `schema.sql`
2. Run in Supabase SQL Editor:
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run your SQL
3. Or create a migration:
   \`\`\`bash
   supabase migration new your_migration_name
   \`\`\`

## Edge Function Details

### send-sms

**Purpose**: Generate verification code and send SMS to guest

**Input**:
\`\`\`typescript
{
  phone_number: string,      // E.164 format: +1234567890
  credit_card_last_4: string, // Last 4 digits
  drivers_license: string     // License number
}
\`\`\`

**Output**:
\`\`\`typescript
{
  check_in_id: string,  // UUID for verification
  success: boolean,
  message: string
}
\`\`\`

**What it does**:
1. Generates random 6-digit code
2. Creates record in `check_ins` table
3. Sends SMS via Twilio with code and privacy policy link
4. Returns check_in_id for next step

### verify-code

**Purpose**: Validate verification code and complete check-in

**Input**:
\`\`\`typescript
{
  check_in_id: string,  // UUID from send-sms
  code: string          // 6-digit code
}
\`\`\`

**Output**:
\`\`\`typescript
{
  verified: boolean,
  success: boolean,
  message: string
}
\`\`\`

**What it does**:
1. Looks up check-in by ID
2. Compares code (with rate limiting)
3. Updates `verified` status if correct
4. Logs verification event
5. Returns verification result

## Security

### Secrets Management

- Twilio credentials stored as Supabase secrets
- Never commit secrets to git
- Secrets are encrypted at rest
- Only Edge Functions can access secrets

### Rate Limiting

Edge Functions implement rate limiting:
- **send-sms**: Max 3 SMS per phone number per hour
- **verify-code**: Max 5 attempts per check-in

### Row-Level Security (RLS)

All database tables have RLS policies:
- Users can only access their own check-ins
- Logs are tied to check-in ownership
- No direct database access without auth

## Troubleshooting

### SMS Not Sending

1. **Check function deployment**:
   \`\`\`bash
   supabase functions list
   \`\`\`

2. **Check secrets are set**:
   \`\`\`bash
   supabase secrets list
   \`\`\`
   Should show: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

3. **Check function logs**:
   \`\`\`bash
   supabase functions logs send-sms
   \`\`\`

4. **Verify Twilio account**:
   - Check balance in Twilio console
   - Verify phone number is verified (trial accounts)
   - Check Twilio error logs

### Code Verification Fails

1. **Check logs**:
   \`\`\`bash
   supabase functions logs verify-code
   \`\`\`

2. **Check database**:
   - Go to Supabase Dashboard → Table Editor
   - View `check_ins` table
   - Verify code matches what was sent

3. **Rate limiting**:
   - After 5 failed attempts, wait 10 minutes
   - Or manually reset in database

### Deployment Errors

1. **Function not found**:
   - Ensure you're in the project root
   - Check `supabase/functions/` directory exists
   - Verify function name matches directory name

2. **Authentication errors**:
   - Run `supabase login` again
   - Check project is linked: `supabase link --project-ref your-ref`

3. **Secrets not accessible**:
   - Re-set secrets after deployment
   - Redeploy function after setting secrets

## Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Twilio API Reference](https://www.twilio.com/docs/sms)

---

**Need help?** Check the main [README.md](../README.md) or [DOCS.md](../DOCS.md)
