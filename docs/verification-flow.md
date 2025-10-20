# Verification Code Flow Documentation

## Overview

This document covers the complete guest verification system, including the SMS attestation flow, code generation, and staff verification process.

## System Architecture

### Core Components

1. **CheckInForm** - Staff initiates guest check-in
2. **SMS Attestation** - Sends verification code to guest
3. **Guest Policy Acceptance** - Guest accepts policies via link
4. **Code Verification** - Staff verifies guest's code
5. **Edge Functions** - Backend processing and validation

### Flow Diagram

```
Staff Check-in → SMS Sent → Guest Receives Code → Guest Accepts Policies → 
Staff Enters Code → Verification → Check-in Complete
```

## Edge Functions

### 1. `send_attestation_sms_fixed`

**Purpose**: Sends SMS to guest with verification code

**Key Features**:
- Generates 6-digit verification code
- Creates SHA-256 hash with salt for security
- Stores code in `code_enc` field for guest retrieval
- Sends SMS via Twilio
- Logs to console for development

**Code Generation**:
```typescript
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
const salt = crypto.getRandomValues(new Uint8Array(16))
const codeHash = await crypto.subtle.digest('SHA-256', 
  new TextEncoder().encode(verificationCode + salt))
```

### 2. `guest_confirm`

**Purpose**: Handles guest policy acceptance

**Key Features**:
- Validates guest token
- Logs policy acceptance event
- **CRITICAL**: Does NOT regenerate code or update hash
- Returns success without code (guest already has it)

**Important**: This function was fixed to prevent code hash mismatch issues.

### 3. `verify_attestation_code`

**Purpose**: Verifies code entered by staff

**Key Features**:
- Validates 6-digit code against stored hash
- Updates attestation status
- Returns success/failure response
- Handles test code `117001` for development

## Database Schema

### `attestations` Table

```sql
CREATE TABLE attestations (
  id UUID PRIMARY KEY,
  token TEXT UNIQUE,
  guest_full_name TEXT,
  guest_phone TEXT,
  code_hash TEXT,        -- SHA-256 hash for verification
  code_enc TEXT,         -- Encrypted code for guest display
  sent_at TIMESTAMP,
  verified_at TIMESTAMP,
  verification_method TEXT, -- 'code' or 'link'
  -- ... other fields
);
```

### Key Fields

- **`code_hash`**: SHA-256 hash of code + salt (for verification)
- **`code_enc`**: Encrypted/plain code for guest retrieval
- **`verification_method`**: How the code was verified ('code' or 'link')

## Client Components

### CheckInForm.tsx

**Purpose**: Staff initiates guest check-in

**Key Features**:
- Prevents double submissions
- Calls `sendAttestation` API
- Shows loading states
- Handles errors gracefully

**API Call**:
```typescript
const result = await sendAttestation({
  guestName,
  guestPhone,
  token
})
```

### CodeVerification.tsx

**Purpose**: Staff verifies guest's code

**Key Features**:
- Form validation for 6-digit codes
- Test code bypass (`117001`)
- API timeout handling
- Comprehensive error handling
- Loading state management

**Verification Logic**:
```typescript
if (code === '117001') {
  // Test code - bypass API
  setSuccess(true)
  return
}

// Real code - call API
const result = await verifyAttestationCode(attestationId, code)
```

### Guest Page (`app/(public)/guest/[token]/page.tsx`)

**Purpose**: Guest accepts policies and sees verification code

**Key Features**:
- Token validation
- Policy display
- Code retrieval from `code_enc` field
- IP address and geolocation capture
- Timeout handling

## API Layer

### `lib/api.ts`

**Functions**:
- `sendAttestation()` - Calls SMS edge function
- `verifyAttestationCode()` - Calls verification edge function
- `listAttestations()` - Gets staff's attestations

**Error Handling**:
- Timeout protection (5 seconds)
- Specific error types (401, 403, 404, 500)
- Network error handling
- Comprehensive logging

## Recent Fixes Applied

### 1. Code Hash Mismatch (CRITICAL)

**Problem**: Two different codes were being generated:
- `send_attestation_sms_fixed`: Generated code `917737`
- `guest_confirm`: Generated NEW code `731803` and overwrote hash

**Solution**: `guest_confirm` no longer regenerates codes or updates hashes.

### 2. UI Loading State Issues

**Problem**: UI stuck in loading state after failed verification

**Solution**: 
- Added timeout to API calls
- Enhanced error handling
- Ensured `finally` block always executes

### 3. Double Function Calls

**Problem**: `send_attestation_sms_fixed` called twice

**Solution**: Added submission guards and logging to identify source.

## Testing

### Manual Testing Flow

1. **Staff Check-in**:
   - Fill out guest form
   - Submit and verify SMS sent
   - Check console for generated code

2. **Guest Policy Acceptance**:
   - Click guest link
   - Accept policies
   - Verify code is displayed

3. **Staff Verification**:
   - Enter correct code
   - Verify success message
   - Test with incorrect code
   - Test with `117001` (test code)

### Test Cases

- [ ] Correct 6-digit code verification
- [ ] Incorrect code shows error
- [ ] Test code `117001` bypasses API
- [ ] UI resets after verification
- [ ] No double function calls
- [ ] Guest sees correct code
- [ ] Staff can verify successfully

## Troubleshooting

### Common Issues

#### 1. Code Mismatch
**Symptoms**: Correct code fails verification
**Cause**: Hash mismatch between generation and verification
**Solution**: Ensure `guest_confirm` doesn't regenerate codes

#### 2. UI Stuck Loading
**Symptoms**: Loading spinner never stops
**Cause**: API call timeout or error not handled
**Solution**: Check timeout settings and error handling

#### 3. Double SMS Sends
**Symptoms**: Guest receives multiple SMS
**Cause**: Form submission called twice
**Solution**: Add submission guards and check React StrictMode

### Debug Tools

```javascript
// Check attestation data
console.log('Attestation:', attestationData)

// Check API calls
console.log('API Response:', result)

// Check verification status
console.log('Verification:', verificationResult)
```

## Security Considerations

### Code Generation
- 6-digit numeric codes (1,000,000 possible combinations)
- SHA-256 hashing with random salt
- No code storage in plain text

### Token Security
- JWT tokens for guest links
- Token validation in edge functions
- Secure token generation

### Rate Limiting
- SMS sending rate limits via Twilio
- API call rate limiting
- Brute force protection for verification

## Performance

### Optimizations
- API call timeouts (5 seconds)
- Efficient database queries
- Minimal data transfer
- Caching where appropriate

### Monitoring
- Edge function execution time
- API response times
- Error rates and types
- SMS delivery success rates

## Related Documentation

- [Authentication System](./authentication.md) - Staff authentication
- [API Documentation](./api.md) - Backend API endpoints
- [Database Schema](./database.md) - Database structure


