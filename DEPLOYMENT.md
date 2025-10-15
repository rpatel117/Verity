# Production Deployment Guide

This guide walks through deploying the Verity hotel check-in system to production.

## Prerequisites

Before deploying, ensure you have:

- [ ] Supabase project created and configured
- [ ] Twilio account with Messaging Service set up
- [ ] Domain name for production (e.g., `verity.yourdomain.com`)
- [ ] Hosting platform account (Vercel, Netlify, etc.)
- [ ] Supabase CLI installed and authenticated

## Step 1: Database Setup

### 1.1 Run Database Migration

```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Run the production schema migration
# Copy and paste the SQL from supabase/migrations/001_production_schema.sql
# into your Supabase SQL Editor and execute it
```

### 1.2 Verify Database Setup

1. Go to Supabase Dashboard → Table Editor
2. Verify all tables exist: `hotels`, `profiles`, `guests`, `attestations`, `attestation_events`, `reports`
3. Check that RLS is enabled on all tables
4. Verify the `verity-reports` storage bucket exists

## Step 2: Configure Environment Variables

### 2.1 Supabase Secrets

Set all required secrets for Edge Functions:

```bash
# Twilio Configuration
supabase secrets set TWILIO_ACCOUNT_SID=AC...
supabase secrets set TWILIO_AUTH_TOKEN=your_twilio_auth_token
supabase secrets set TWILIO_MESSAGING_SERVICE_SID=MG...

# Application Configuration
supabase secrets set VERITY_BASE_URL=https://your-domain.com
supabase secrets set VERITY_SIGNING_SECRET=your_long_random_string_here
supabase secrets set VERITY_REPORT_BUCKET=verity-reports

# Supabase Configuration
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2.2 Frontend Environment Variables

Create `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Base URL for the application
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Verity Policy Configuration
NEXT_PUBLIC_VERITY_POLICY_TITLE="Verity Attestation & Payment Consent"
```

## Step 3: Deploy Edge Functions

Deploy all 7 Edge Functions to Supabase:

```bash
# Deploy each function
supabase functions deploy send_attestation_sms
supabase functions deploy twilio_status_callback
supabase functions deploy verify_attestation_code
supabase functions deploy guest_init
supabase functions deploy guest_event
supabase functions deploy guest_confirm
supabase functions deploy generate_report_pdf
```

### 3.1 Test Edge Functions

After deployment, test each function:

```bash
# Test send_attestation_sms
curl -X POST https://your-project.supabase.co/functions/v1/send_attestation_sms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"guest":{"fullName":"Test User","phoneE164":"+1234567890"},"stay":{"ccLast4":"1234","checkInDate":"2024-01-15","checkOutDate":"2024-01-17"},"policyText":"Test policy"}'

# Test other functions similarly...
```

## Step 4: Configure Twilio

### 4.1 Set Up Messaging Service

1. Go to Twilio Console → Messaging → Services
2. Create a new Messaging Service
3. Add your phone number to the service
4. Note the Messaging Service SID (starts with `MG`)

### 4.2 Configure Webhook

1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Set webhook URL: `https://your-project.supabase.co/functions/v1/twilio_status_callback`
4. Set HTTP method: POST
5. Save configuration

### 4.3 Test SMS Delivery

```bash
# Test SMS sending through your app
# Send a test attestation and verify SMS is received
```

## Step 5: Configure Supabase Authentication

### 5.1 Enable Email Authentication

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable Email authentication
3. Configure Site URL: `https://your-domain.com`
4. Add Redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `https://your-domain.com/auth/reset`

### 5.2 Configure Email Templates

1. Go to Authentication → Email Templates
2. Update "Confirm signup" template:
   - Subject: "Confirm your Verity account"
   - Use "Verity by Shadow Solutions" as brand name
3. Update "Reset password" template:
   - Subject: "Reset your Verity password"
   - Use "Verity by Shadow Solutions" as brand name

### 5.3 Configure CORS

1. Go to Settings → API
2. Add your production domain to CORS origins
3. Save configuration

## Step 6: Deploy Frontend

### 6.1 Build Production Bundle

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the build locally
npm start
```

### 6.2 Deploy to Hosting Platform

#### Option A: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

#### Option B: Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard

#### Option C: Other Platforms

Follow your hosting platform's documentation for Next.js deployment.

### 6.3 Configure Custom Domain

1. Add your custom domain in your hosting platform
2. Configure DNS records as required
3. Set up SSL certificate (usually automatic)

## Step 7: Final Configuration

### 7.1 Update Supabase Settings

1. Update Site URL to your production domain
2. Verify all redirect URLs are correct
3. Test authentication flow

### 7.2 Update Twilio Webhook

1. Ensure webhook URL points to your production Edge Functions
2. Test webhook receives status updates
3. Monitor SMS delivery rates

### 7.3 Test End-to-End Flow

1. Create a test hotel account
2. Send a test attestation SMS
3. Complete the guest verification flow
4. Generate a test report
5. Verify all data is properly scoped by hotel

## Step 8: Monitoring Setup

### 8.1 Supabase Monitoring

1. Go to Supabase Dashboard → Logs
2. Monitor Edge Function logs
3. Check database performance
4. Monitor authentication events

### 8.2 Twilio Monitoring

1. Go to Twilio Console → Monitor
2. Check SMS delivery rates
3. Monitor webhook delivery
4. Set up alerts for failures

### 8.3 Application Monitoring

1. Set up error tracking (Sentry, if desired)
2. Monitor page load times
3. Track user engagement metrics
4. Set up uptime monitoring

## Step 9: Security Verification

### 9.1 Test RLS Policies

1. Create multiple hotel accounts
2. Verify each hotel can only see their own data
3. Test cross-tenant access is blocked
4. Verify guest tokens expire correctly

### 9.2 Test Rate Limiting

1. Test SMS rate limits (10/day per phone)
2. Test code verification limits (5 attempts per attestation)
3. Test password reset limits (3/hour per email)

### 9.3 Security Audit

1. Check for exposed sensitive data
2. Verify JWT tokens are properly signed
3. Test CORS restrictions
4. Verify HTTPS is enforced

## Step 10: Go Live

### 10.1 Final Checklist

- [ ] All Edge Functions deployed and tested
- [ ] Database migration completed
- [ ] Environment variables configured
- [ ] Twilio webhook configured
- [ ] Frontend deployed and accessible
- [ ] Authentication flow working
- [ ] SMS delivery working
- [ ] Guest verification flow working
- [ ] Report generation working
- [ ] Security policies verified

### 10.2 Launch

1. Update DNS to point to production
2. Monitor for any issues
3. Have rollback plan ready
4. Monitor error rates and performance

## Post-Launch Monitoring

### Daily Tasks
- [ ] Check error rates and logs
- [ ] Monitor SMS delivery rates
- [ ] Verify database performance
- [ ] Check user activity

### Weekly Tasks
- [ ] Review user feedback
- [ ] Check security alerts
- [ ] Monitor storage usage
- [ ] Review performance metrics

### Monthly Tasks
- [ ] Rotate secrets
- [ ] Update dependencies
- [ ] Review and optimize queries
- [ ] Clean up old data

## Troubleshooting

### Common Issues

#### SMS Not Sending
1. Check Twilio account balance
2. Verify Messaging Service SID
3. Check Edge Function logs
4. Test with Twilio console

#### Authentication Issues
1. Check Supabase Auth settings
2. Verify redirect URLs
3. Check email templates
4. Test with different browsers

#### Database Issues
1. Check RLS policies
2. Verify user permissions
3. Check query performance
4. Review connection limits

#### Edge Function Issues
1. Check function logs
2. Verify secrets are set
3. Test function endpoints
4. Check rate limiting

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Production Checklist](./PRODUCTION_CHECKLIST.md)

## Emergency Procedures

### If SMS stops working:
1. Check Twilio account status
2. Verify webhook configuration
3. Test with Twilio console
4. Check Edge Function logs

### If database is slow:
1. Check query performance
2. Review RLS policies
3. Add indexes if needed
4. Monitor connection pool

### If authentication fails:
1. Check Supabase Auth settings
2. Verify email templates
3. Check redirect URLs
4. Test with different browsers

### If Edge Functions fail:
1. Check function logs
2. Verify secrets are set
3. Test function endpoints
4. Check rate limiting

## Success Metrics

Track these KPIs to measure success:

- **SMS Delivery Rate**: >95%
- **Guest Verification Completion**: >80%
- **Page Load Time**: <2 seconds
- **API Response Time**: <500ms
- **Error Rate**: <1%
- **User Satisfaction**: >4.5/5

## Maintenance Schedule

### Daily
- Monitor error rates
- Check SMS delivery
- Verify database performance

### Weekly
- Review user activity
- Check security alerts
- Monitor storage usage

### Monthly
- Rotate secrets
- Update dependencies
- Review performance
- Clean up old data

## Conclusion

Following this deployment guide will ensure a successful production launch of the Verity hotel check-in system. Remember to monitor all systems closely during the first few days after launch and be prepared to address any issues quickly.

For additional support, refer to the [Production Checklist](./PRODUCTION_CHECKLIST.md) and [Environment Setup Guide](./ENVIRONMENT_SETUP.md).
