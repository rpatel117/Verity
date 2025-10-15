# Production Deployment Checklist

This checklist ensures all components are properly configured for production deployment.

## Pre-Deployment Checklist

### 1. Database Setup ✅
- [ ] Run database migration: `supabase/migrations/001_production_schema.sql`
- [ ] Verify all tables created: `hotels`, `profiles`, `guests`, `attestations`, `attestation_events`, `reports`
- [ ] Confirm RLS policies are active on all tables
- [ ] Test RLS policies with different user accounts
- [ ] Verify indexes are created for performance
- [ ] Confirm storage bucket `verity-reports` exists

### 2. Environment Variables ✅
- [ ] Set all required Supabase secrets:
  ```bash
  supabase secrets set TWILIO_ACCOUNT_SID=AC...
  supabase secrets set TWILIO_AUTH_TOKEN=your_token
  supabase secrets set TWILIO_MESSAGING_SERVICE_SID=MG...
  supabase secrets set VERITY_BASE_URL=https://your-domain.com
  supabase secrets set VERITY_SIGNING_SECRET=your_long_random_string
  supabase secrets set VERITY_REPORT_BUCKET=verity-reports
  supabase secrets set SUPABASE_URL=your_supabase_url
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```
- [ ] Configure frontend environment variables in `.env.local`
- [ ] Verify `NEXT_PUBLIC_BASE_URL` matches production domain

### 3. Supabase Configuration ✅
- [ ] Enable email authentication in Supabase dashboard
- [ ] Configure email templates with "Verity by Shadow Solutions" branding
- [ ] Set Site URL to production domain
- [ ] Add production redirect URLs
- [ ] Configure CORS settings for production domain
- [ ] Enable Row Level Security on all tables

### 4. Edge Functions Deployment ✅
- [ ] Deploy all 7 Edge Functions:
  ```bash
  supabase functions deploy send_attestation_sms
  supabase functions deploy twilio_status_callback
  supabase functions deploy verify_attestation_code
  supabase functions deploy guest_init
  supabase functions deploy guest_event
  supabase functions deploy guest_confirm
  supabase functions deploy generate_report_pdf
  ```
- [ ] Test each Edge Function with sample data
- [ ] Verify error handling and rate limiting
- [ ] Check function logs for any issues

### 5. Twilio Configuration ✅
- [ ] Set up Twilio Messaging Service
- [ ] Configure webhook URL: `https://your-project.supabase.co/functions/v1/twilio_status_callback`
- [ ] Test SMS delivery with real phone numbers
- [ ] Verify webhook receives status updates
- [ ] Set up monitoring for SMS delivery rates

### 6. Security Hardening ✅
- [ ] Verify all RLS policies enforce hotel scoping
- [ ] Test cross-tenant data access (should be blocked)
- [ ] Confirm no sensitive data in browser console
- [ ] Verify JWT tokens expire correctly (24h for guest links)
- [ ] Test rate limiting on all endpoints
- [ ] Confirm CORS restrictions are in place

### 7. Frontend Deployment ✅
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test all pages load correctly
- [ ] Verify authentication flow works end-to-end

### 8. Testing Checklist ✅

#### Authentication Flow
- [ ] Sign up with email → receive confirmation email → click link → login successful
- [ ] Forgot password → receive reset email → set new password → login with new password
- [ ] Session persists across page reload
- [ ] Unauthenticated access to `/dashboard/*` redirects to `/auth`

#### Check-In Loop
- [ ] Clerk enters guest info → SMS sent → `sms.sent` event recorded
- [ ] Guest receives SMS with link and masked code
- [ ] Guest opens link → `page.open` event recorded
- [ ] Guest allows geo → `geo.capture` event recorded
- [ ] Guest accepts policy → code revealed → `policy.accept` event recorded
- [ ] Clerk enters 6-digit code → attestation marked verified → `code.submit` event recorded
- [ ] Invalid code shows error after 5 attempts

#### Data Page
- [ ] Table shows only current user's hotel data (RLS enforced)
- [ ] Search by name/phone/cc_last4 works
- [ ] Date range filter works
- [ ] Status filter (sent/verified/expired) works
- [ ] Pagination works (next/previous)
- [ ] View events shows timeline for attestation

#### Reports
- [ ] Select attestations → generate report → PDF downloads
- [ ] Report contains all guest data, attestation details, events
- [ ] Recent reports list shows last 10
- [ ] Download links expire after 1 hour

#### Security
- [ ] User A cannot see User B's attestations (cross-tenant test)
- [ ] Expired guest tokens rejected
- [ ] Rate limits trigger after threshold
- [ ] No sensitive data in browser console logs

### 9. Monitoring Setup ✅
- [ ] Set up Supabase monitoring dashboard
- [ ] Configure Twilio monitoring
- [ ] Set up error tracking (Sentry, if desired)
- [ ] Monitor Edge Function logs
- [ ] Set up alerts for high error rates
- [ ] Monitor SMS delivery rates

### 10. Performance Testing ✅
- [ ] Load test with multiple concurrent users
- [ ] Test database performance with large datasets
- [ ] Verify Edge Function response times
- [ ] Test PDF generation with large reports
- [ ] Monitor memory usage and CPU utilization

## Post-Deployment Verification

### 1. End-to-End Testing
- [ ] Complete guest check-in flow from start to finish
- [ ] Generate and download a report
- [ ] Test with multiple hotel accounts
- [ ] Verify all data is properly scoped by hotel

### 2. Security Audit
- [ ] Test all authentication flows
- [ ] Verify RLS policies are working
- [ ] Check for any exposed sensitive data
- [ ] Test rate limiting functionality

### 3. Performance Verification
- [ ] Check page load times
- [ ] Verify database query performance
- [ ] Test Edge Function response times
- [ ] Monitor resource usage

### 4. User Acceptance Testing
- [ ] Test with real hotel staff
- [ ] Verify SMS delivery to real phones
- [ ] Test guest experience on mobile devices
- [ ] Confirm all UI elements work correctly

## Rollback Plan

If issues are discovered post-deployment:

1. **Database Issues**: Restore from backup or run rollback migrations
2. **Edge Function Issues**: Revert to previous function versions
3. **Frontend Issues**: Deploy previous version from Git
4. **Twilio Issues**: Disable SMS sending temporarily
5. **Security Issues**: Immediately disable affected endpoints

## Maintenance Tasks

### Daily
- [ ] Monitor error rates and logs
- [ ] Check SMS delivery rates
- [ ] Verify database performance

### Weekly
- [ ] Review user activity and engagement
- [ ] Check for any security alerts
- [ ] Monitor storage usage

### Monthly
- [ ] Review and rotate secrets
- [ ] Update dependencies
- [ ] Review and optimize database queries
- [ ] Clean up old reports and events

## Support Contacts

- **Supabase Support**: [https://supabase.com/support](https://supabase.com/support)
- **Twilio Support**: [https://support.twilio.com](https://support.twilio.com)
- **Hosting Platform Support**: [Your hosting provider's support]

## Emergency Procedures

### If SMS stops working:
1. Check Twilio account status and balance
2. Verify webhook URL is correct
3. Check Edge Function logs for errors
4. Test with Twilio console directly

### If database is slow:
1. Check query performance in Supabase dashboard
2. Review RLS policies for efficiency
3. Consider adding additional indexes
4. Monitor connection pool usage

### If authentication fails:
1. Check Supabase Auth settings
2. Verify email templates are configured
3. Check redirect URLs are correct
4. Test with different browsers/devices

## Success Metrics

Track these KPIs to measure production success:

- **SMS Delivery Rate**: >95%
- **Guest Verification Completion**: >80%
- **Page Load Time**: <2 seconds
- **API Response Time**: <500ms
- **Error Rate**: <1%
- **User Satisfaction**: >4.5/5

## Documentation Links

- [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- [Edge Functions Documentation](./supabase/functions/README.md)
- [Database Schema Migration](./supabase/migrations/001_production_schema.sql)
- [API Documentation](./lib/api.ts)
- [Type Definitions](./types/index.ts)
