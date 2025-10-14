# Verity Backend Setup Guide

This document outlines the required backend infrastructure for the Verity attestation system.

## Overview

Verity requires:
- **Supabase** for database and authentication
- **Twilio** for SMS messaging
- **Edge Functions** for API endpoints
- **Row Level Security (RLS)** for data protection

## Environment Variables

### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VERITY_POLICY_TITLE="Verity Attestation & Payment Consent"
NEXT_PUBLIC_VERITY_POLICY_TEXT="I confirm I am the authorized cardholder or their agent, consent to applicable charges for the stated dates, and agree that Verity may record IP & geolocation for fraud-prevention."
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Backend (Supabase Edge Functions)
```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

### 1. Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. Attestations Table
```sql
CREATE TABLE attestations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES profiles(id) NOT NULL,
  guest_full_name TEXT NOT NULL,
  guest_phone_e164 TEXT NOT NULL,
  cc_last_4 TEXT NOT NULL,
  dl_number TEXT,
  dl_state TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  policy_text TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'verified', 'expired')),
  verification_code TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hotels can view own attestations" ON attestations FOR SELECT USING (auth.uid() = hotel_id);
CREATE POLICY "Hotels can insert own attestations" ON attestations FOR INSERT WITH CHECK (auth.uid() = hotel_id);
```

### 3. Attestation Events Table
```sql
CREATE TABLE attestation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attestation_id UUID REFERENCES attestations(id) NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page.open', 'geo.capture', 'policy.accept')),
  ip_address INET,
  user_agent TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy DECIMAL(8, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE attestation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hotels can view events for own attestations" ON attestation_events FOR SELECT 
  USING (attestation_id IN (SELECT id FROM attestations WHERE hotel_id = auth.uid()));
```

### 4. Reports Table
```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id UUID REFERENCES profiles(id) NOT NULL,
  attestation_ids UUID[] NOT NULL,
  report_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hotels can view own reports" ON reports FOR SELECT USING (auth.uid() = hotel_id);
CREATE POLICY "Hotels can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = hotel_id);
```

## Required Edge Functions

### 1. Send Attestation SMS
**Endpoint:** `POST /api/attestations/send`

**Request Body:**
```typescript
{
  fullName: string;
  phoneE164: string;
  ccLast4: string;
  dlNumber?: string;
  dlState?: string;
  checkInDate: string; // ISO date
  checkOutDate: string; // ISO date
  policyText: string;
}
```

**Response:**
```typescript
{
  attestationId: string;
  guestId: string;
  smsSid?: string;
}
```

**Implementation:**
1. Validate input data
2. Generate 6-digit verification code
3. Insert attestation record
4. Send SMS via Twilio with guest link
5. Return attestation ID and guest ID

### 2. List Attestations
**Endpoint:** `GET /api/attestations`

**Query Parameters:**
- `query` (optional): Search term
- `from` (optional): Start date filter
- `to` (optional): End date filter
- `status` (optional): Status filter
- `cursor` (optional): Pagination cursor

**Response:**
```typescript
{
  data: AttestationRow[];
  nextCursor?: string;
  total?: number;
}
```

### 3. List Attestation Events
**Endpoint:** `GET /api/attestations/:id/events`

**Response:**
```typescript
AttestationEvent[]
```

### 4. Generate Report
**Endpoint:** `POST /api/reports/generate`

**Request Body:**
```typescript
{
  attestationIds: string[];
}
```

**Response:**
```typescript
{
  reportId: string;
  downloadUrl: string;
}
```

**Implementation:**
1. Validate attestation IDs belong to hotel
2. Generate PDF report with attestation data
3. Upload to Supabase Storage
4. Return download URL

### 5. Guest Initialize
**Endpoint:** `GET /api/guest/init`

**Query Parameters:**
- `token`: Guest token from SMS

**Response:**
```typescript
{
  valid: boolean;
  policyText: string;
  twoFACodeMasked: string; // e.g., "12****"
}
```

### 6. Guest Event
**Endpoint:** `POST /api/guest/event`

**Request Body:**
```typescript
{
  token: string;
  eventType: 'page.open' | 'geo.capture' | 'policy.accept';
  ip?: string;
  userAgent?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}
```

**Response:**
```typescript
{
  ok: boolean;
}
```

### 7. Guest Confirm
**Endpoint:** `POST /api/guest/confirm`

**Request Body:**
```typescript
{
  token: string;
  accepted: boolean;
}
```

**Response:**
```typescript
{
  ok: boolean;
  code: string; // Full 6-digit code
}
```

## Twilio Integration

### SMS Template
```
Verity Hotel Check-in Verification

Your verification code: {code}

Complete your attestation: {guest_url}

This link expires in 24 hours.
```

### Required Twilio Setup
1. Create Twilio account
2. Purchase phone number
3. Configure webhook URLs (if needed)
4. Set up environment variables

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own hotel's data
- Guest tokens are time-limited and single-use

### Data Protection
- PII data is encrypted at rest
- SMS messages are sent securely via Twilio
- Guest tokens are cryptographically secure
- IP addresses and geolocation are logged for fraud prevention

### Rate Limiting
- SMS sending: 5 per minute per hotel
- Guest verification: 3 attempts per token
- API calls: 100 per minute per user

## Deployment Checklist

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Configure RLS policies
- [ ] Set up Edge Functions
- [ ] Configure authentication settings

### Twilio Setup
- [ ] Create Twilio account
- [ ] Purchase phone number
- [ ] Configure SMS templates
- [ ] Set up webhooks (if needed)

### Environment Configuration
- [ ] Set up environment variables
- [ ] Configure CORS settings
- [ ] Set up domain allowlist
- [ ] Configure rate limiting

### Testing
- [ ] Test SMS delivery
- [ ] Test guest verification flow
- [ ] Test report generation
- [ ] Test RLS policies
- [ ] Load test API endpoints

## Monitoring & Analytics

### Key Metrics to Track
- SMS delivery rates
- Guest verification completion rates
- API response times
- Error rates by endpoint
- User engagement metrics

### Recommended Tools
- Supabase Analytics
- Twilio Console
- Custom logging in Edge Functions
- Error tracking (Sentry, etc.)

## Support & Maintenance

### Regular Tasks
- Monitor SMS delivery rates
- Review failed verifications
- Update policy text as needed
- Backup database regularly
- Monitor API usage and costs

### Troubleshooting
- Check Twilio logs for SMS issues
- Review Supabase logs for database errors
- Monitor Edge Function execution logs
- Verify RLS policies are working correctly

