# Supabase Edge Functions

This directory contains specifications for all Edge Functions required for the Verity hotel check-in system.

## Required Edge Functions

### 1. send_attestation_sms

**Purpose**: Send SMS attestation to guest and create attestation record

**Endpoint**: `POST /functions/v1/send_attestation_sms`

**Authentication**: Required (session JWT)

**Request Body**:
```typescript
{
  guest: {
    fullName: string;
    phoneE164: string;
    dlNumber?: string;
    dlState?: string;
  };
  stay: {
    ccLast4: string;
    checkInDate: string; // ISO date
    checkOutDate: string; // ISO date
  };
  policyText: string;
}
```

**Response**:
```typescript
{
  attestationId: string;
  guestId: string;
  smsSid?: string;
}
```

**Implementation**:
1. Authenticate user via session JWT
2. Resolve hotel_id from profiles table
3. Upsert guest record in guests table
4. Generate 6-digit code (000000-999999)
5. Hash code with bcrypt
6. Create JWT token for guest link (24h expiry, signed with VERITY_SIGNING_SECRET)
7. Create attestation record with code_hash and token
8. Send Twilio SMS via Messaging Service SID
9. Insert `sms.sent` event in attestation_events
10. Return attestation ID and guest ID

**Rate Limiting**: Max 10 SMS per phone per 24h

**Error Handling**:
- Invalid session → 401
- Missing hotel_id → 403
- Twilio API error → 500
- Rate limit exceeded → 429

### 2. twilio_status_callback

**Purpose**: Receive Twilio webhook for SMS status updates

**Endpoint**: `POST /functions/v1/twilio_status_callback`

**Authentication**: None (Twilio webhook)

**Request Body** (from Twilio):
```typescript
{
  MessageSid: string;
  MessageStatus: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  To: string;
  From: string;
  // ... other Twilio fields
}
```

**Response**: `{ ok: true }`

**Implementation**:
1. Extract MessageSid from request
2. Find attestation by sms_sid
3. Update attestation.sms_status
4. Insert attestation_events with event_type='sms.status'
5. Log status change

**Error Handling**:
- Invalid MessageSid → 404
- Database error → 500

### 3. verify_attestation_code

**Purpose**: Verify 6-digit code entered by clerk

**Endpoint**: `POST /functions/v1/verify_attestation_code`

**Authentication**: Required (session JWT)

**Request Body**:
```typescript
{
  attestationId: string;
  code: string; // 6-digit code
}
```

**Response**:
```typescript
{
  ok: boolean;
  verifiedAt?: string; // ISO timestamp
  reason?: string; // if ok=false
}
```

**Implementation**:
1. Authenticate user via session JWT
2. Verify attestation belongs to user's hotel
3. bcrypt.compare(code, code_hash)
4. On success:
   - Set verified_at = now()
   - Set verification_method = 'code'
   - Insert `code.submit` event
   - Delete code_enc if exists
5. On failure: increment attempt counter

**Rate Limiting**: 5 attempts per attestation

**Error Handling**:
- Invalid session → 401
- Attestation not found → 404
- Wrong hotel → 403
- Invalid code → 400
- Rate limit exceeded → 429

### 4. guest_init

**Purpose**: Initialize guest page with token validation

**Endpoint**: `POST /functions/v1/guest_init`

**Authentication**: None (token-based)

**Request Body**:
```typescript
{
  token: string; // JWT token from SMS link
}
```

**Response**:
```typescript
{
  valid: boolean;
  policyText: string;
  twoFACodeMasked: string; // e.g., "12****"
}
```

**Implementation**:
1. Verify JWT token (not expired, valid signature)
2. Extract attestation_id from token
3. Return policy text and masked code
4. Insert `page.open` event with IP/UA
5. No authentication required (token-based)

**Error Handling**:
- Invalid/expired token → 401
- Attestation not found → 404

### 5. guest_event

**Purpose**: Log guest events (geo.capture, policy.accept)

**Endpoint**: `POST /functions/v1/guest_event`

**Authentication**: None (token-based)

**Request Body**:
```typescript
{
  token: string;
  eventType: 'geo.capture' | 'policy.accept';
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}
```

**Response**: `{ ok: true }`

**Implementation**:
1. Verify JWT token
2. Insert attestation_events with provided data
3. No authentication required (token-based)

**Error Handling**:
- Invalid token → 401
- Invalid event type → 400

### 6. guest_confirm

**Purpose**: Confirm policy acceptance and return 6-digit code

**Endpoint**: `POST /functions/v1/guest_confirm`

**Authentication**: None (token-based)

**Request Body**:
```typescript
{
  token: string;
  accepted: boolean;
}
```

**Response**:
```typescript
{
  ok: boolean;
  code?: string; // Full 6-digit code
}
```

**Implementation**:
1. Verify JWT token
2. Mark attestation as policy accepted
3. Insert `policy.accept` event
4. Return full 6-digit code (decrypt from code_enc or regenerate)
5. No authentication required (token-based)

**Error Handling**:
- Invalid token → 401
- Already confirmed → 400

### 7. generate_report_pdf

**Purpose**: Generate PDF report for selected attestations

**Endpoint**: `POST /functions/v1/generate_report_pdf`

**Authentication**: Required (session JWT)

**Request Body**:
```typescript
{
  attestationIds: string[];
}
```

**Response**:
```typescript
{
  reportId: string;
  downloadUrl: string; // Signed URL, 1-hour expiry
}
```

**Implementation**:
1. Authenticate user via session JWT
2. Verify attestation IDs belong to user's hotel
3. Query guests, attestations, events for selected IDs
4. Generate simple PDF (use jsPDF or HTML→PDF)
5. Upload to verity-reports bucket with path `yyyy/mm/<uuid>.pdf`
6. Create report record in DB
7. Return signed URL (1-hour expiry)

**Error Handling**:
- Invalid session → 401
- Invalid attestation IDs → 403
- PDF generation error → 500
- Storage error → 500

## Security Considerations

### Authentication
- Session-based functions require valid JWT from Supabase Auth
- Token-based functions verify JWT signed with VERITY_SIGNING_SECRET
- All functions validate hotel scoping via RLS

### Rate Limiting
- SMS sending: 10/day per phone
- Code verification: 5 attempts per attestation
- Password reset: 3/hour per email
- Use in-memory maps or Supabase KV for counters

### Data Protection
- Never log raw codes or sensitive data
- Encrypt dl_number at rest (optional)
- Use signed URLs for report downloads
- Implement CORS restrictions

### Error Handling
- Structured logging with hotel_id, attestation_id, duration_ms
- Never expose internal errors to clients
- Log all errors with stack traces
- Implement retry logic for transient failures

## Deployment

### Prerequisites
1. Supabase CLI installed and authenticated
2. Project linked via `supabase link`
3. All secrets set via `supabase secrets set`

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy send_attestation_sms
supabase functions deploy twilio_status_callback
supabase functions deploy verify_attestation_code
supabase functions deploy guest_init
supabase functions deploy guest_event
supabase functions deploy guest_confirm
supabase functions deploy generate_report_pdf
```

### Set Secrets
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

### Configure Twilio Webhook
1. Go to Twilio Console → Phone Numbers → Manage → Active Numbers
2. Set webhook URL: `https://your-project.supabase.co/functions/v1/twilio_status_callback`
3. Set HTTP method: POST

## Testing

### Unit Tests
- Test JWT token verification
- Test bcrypt hash/compare
- Test phone number validation
- Test rate limiting logic

### Integration Tests
- Test complete SMS flow
- Test guest verification flow
- Test report generation
- Test error scenarios

### Manual Testing
1. Send attestation SMS → verify SMS received
2. Guest opens link → verify page loads
3. Guest accepts policy → verify code revealed
4. Clerk enters code → verify attestation marked verified
5. Generate report → verify PDF downloads

## Monitoring

### Logs
- View real-time logs: `supabase functions logs <function-name> --follow`
- Check Supabase Dashboard → Edge Functions → Logs
- Monitor error rates and response times

### Metrics to Track
- SMS delivery rates
- Guest verification completion rates
- API response times
- Error rates by endpoint
- Rate limit hits

### Alerts
- SMS delivery failures
- High error rates
- Rate limit violations
- Database connection issues
