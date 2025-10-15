# Development Setup (No Twilio Required)

This guide lets you build and test the entire system without waiting for Twilio phone number registration.

## 🚀 **Quick Start (5 minutes)**

### 1. Set Frontend Environment Variables

Create `.env.local` in your project root:

```bash
# Supabase Configuration (already available)
NEXT_PUBLIC_SUPABASE_URL=https://rusqnjonwtgzcccyhjze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c3Fuam9ud3RnemNjY3loanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTE3MDksImV4cCI6MjA3NjAyNzcwOX0.cIcjqiy-o4iMsj-h1URkJhKZr0k2WJpyrWUkdLZxBMM

# Base URL (use localhost for development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Verity Policy Configuration
NEXT_PUBLIC_VERITY_POLICY_TITLE="Verity Attestation & Payment Consent"
```

### 2. Set Supabase Secrets (Development Mode)

Run these commands to set up development secrets:

```bash
# Set development secrets (no Twilio required)
supabase secrets set VERITY_BASE_URL=http://localhost:3000
supabase secrets set VERITY_SIGNING_SECRET=dev_signing_secret_12345
supabase secrets set VERITY_REPORT_BUCKET=verity-reports
supabase secrets set SUPABASE_URL=https://rusqnjonwtgzcccyhjze.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Start Development Server

```bash
npm run dev
```

## 🧪 **How Development Mode Works**

### SMS Mocking
- **No Twilio Required**: The system detects missing Twilio credentials and runs in development mode
- **Console Logging**: SMS messages are logged to the Supabase Edge Function console
- **Mock SIDs**: Generated mock SMS SIDs for testing
- **Real Database**: All database operations work normally

### Testing the Complete Flow

1. **Send Attestation**: 
   - Fill out check-in form
   - Click "Send Attestation SMS"
   - Check Supabase Edge Function logs for the SMS content and code

2. **Guest Verification**:
   - Copy the guest link from the logs
   - Open in browser (or use the guest link directly)
   - Complete the verification flow
   - The 6-digit code will be displayed

3. **Clerk Verification**:
   - Use the code from the guest page
   - Enter in the Code Verification section
   - Verify the attestation

## 📊 **Monitoring Development**

### View Edge Function Logs
1. Go to Supabase Dashboard → Edge Functions
2. Click on `send_attestation_sms_dev`
3. View logs to see mock SMS content

### View Database Changes
1. Go to Supabase Dashboard → Table Editor
2. Check `attestations`, `guests`, `attestation_events` tables
3. See real data being created

## 🔄 **When Twilio is Ready**

Once your Twilio phone number is approved:

1. **Get Twilio Credentials**:
   - Account SID (starts with `AC...`)
   - Auth Token
   - Messaging Service SID (starts with `MG...`)

2. **Update Supabase Secrets**:
   ```bash
   supabase secrets set TWILIO_ACCOUNT_SID=AC...
   supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
   supabase secrets set TWILIO_MESSAGING_SERVICE_SID=MG...
   ```

3. **Switch to Production Function**:
   - Update `lib/api.ts` to use `send_attestation_sms` instead of `send_attestation_sms_dev`
   - The system will automatically detect Twilio credentials and send real SMS

4. **Configure Twilio Webhook**:
   - Set webhook URL: `https://rusqnjonwtgzcccyhjze.supabase.co/functions/v1/twilio_status_callback`

## 🎯 **What You Can Test Now**

### ✅ **Fully Functional**
- User authentication (signup, login, forgot password)
- Check-in form with guest data entry
- SMS sending (mocked to console)
- Guest verification flow
- Code verification by clerk
- Data table with real database queries
- Report generation
- All database operations

### ⏳ **Waiting for Twilio**
- Real SMS delivery to phone numbers
- SMS status callbacks
- Production SMS rate limiting

## 🚀 **Deploy to Vercel (Optional)**

You can deploy to Vercel even without Twilio:

1. **Connect to Vercel**:
   - Push code to GitHub
   - Connect repo to Vercel
   - Set environment variables in Vercel dashboard

2. **Update Base URL**:
   ```bash
   supabase secrets set VERITY_BASE_URL=https://your-app.vercel.app
   ```

3. **Test with Real Domain**:
   - Guest links will work with your Vercel domain
   - All functionality works except real SMS delivery

## 📝 **Development Checklist**

- [ ] Frontend environment variables set
- [ ] Supabase secrets configured
- [ ] Development server running
- [ ] Test check-in flow (check console logs)
- [ ] Test guest verification flow
- [ ] Test clerk code verification
- [ ] Test data table and reports
- [ ] Verify all database operations work

## 🔧 **Troubleshooting**

### Edge Function Errors
- Check Supabase Dashboard → Edge Functions → Logs
- Verify secrets are set correctly
- Check function is deployed and active

### Database Issues
- Verify RLS policies are working
- Check user has `hotel_id` set in profile
- Ensure all tables exist and have proper relationships

### Frontend Issues
- Check browser console for errors
- Verify environment variables are loaded
- Check network tab for API call failures

## 🎉 **Ready for Production**

Once Twilio is approved, you can switch to production mode in minutes:

1. Add Twilio credentials to Supabase secrets
2. Update API client to use production function
3. Configure Twilio webhook
4. Test with real SMS delivery

The entire system is production-ready - you're just waiting for the phone number approval!
