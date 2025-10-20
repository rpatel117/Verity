<!-- 02c5b0e0-3e7d-4773-abc6-17fa8aa83f73 d3a698e9-61a7-4d32-b021-fed1eb5e6a64 -->
# Fix Verification Code Flow

## Critical Issues Identified

### 1. Code Hash Mismatch (PRIMARY BUG)

**Problem**: Two different codes are being generated:

- `send_attestation_sms_fixed` generates code `917737` and stores its hash
- `guest_confirm` generates a NEW code `731803` and **overwrites** the original hash
- When clerk tries to verify the code shown to the guest (`731803`), it's checked against the wrong hash

**Root Cause**: In `guest_confirm` edge function (lines 104-125), a new code is generated and the hash is updated:

```typescript
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
// ... hashing logic ...
await supabase.from('attestations').update({
  code_hash: codeHash,  // OVERWRITES original hash!
  verified_at: new Date().toISOString(),
  verification_method: 'link'
}).eq('id', attestation.id);
```

**Fix**: `guest_confirm` should NOT generate a new code or update `code_hash`. It should only return the ORIGINAL code that was stored when the attestation was created.

### 2. UI Not Updating After Failed Verification

**Problem**: When entering an incorrect code (not `117001`), the UI gets stuck in loading state with no error message shown.

**Root Cause**: In `CodeVerification.tsx` line 144, there's an early `return` statement inside the test code block that skips the `finally` block. However, for real codes, the `finally` block should execute. The issue is that the `verifyAttestationCode` function in `lib/api.ts` might be throwing an error that's not properly caught, or the edge function is returning an unexpected response format.

**Fix**:

- Ensure `finally` block always executes by removing any early returns that bypass it
- Add better error handling in the API layer
- Ensure edge function always returns valid JSON with `ok: boolean` field

### 3. Double Function Calls

**Problem**: Logs show `send_attestation_sms_fixed` is being called twice for every check-in.

**Root Cause**: Need to investigate React component re-renders or form submission handlers.

**Fix**: Add debugging to identify source of duplicate calls, likely in `CheckInForm.tsx`.

## Implementation Plan

### Step 1: Fix Code Hash Mismatch in `guest_confirm`

**File**: Deployed edge function `guest_confirm`

Current problematic code (lines 104-125):

```typescript
const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
// ... hashing ...
await supabase.from('attestations').update({
  code_hash: codeHash,
  verified_at: new Date().toISOString(),
  verification_method: 'link'
}).eq('id', attestation.id);
```

**Change to**: Return the ORIGINAL code without regenerating or updating hash. Since we can't decrypt the hash, we need to store the code in a way we can retrieve it. Options:

- **Option A**: Store encrypted code in `code_enc` field during `send_attestation_sms_fixed`
- **Option B**: Don't update `verified_at` in `guest_confirm` - only update it when clerk verifies via `verify_attestation_code`

**Recommended approach**: Option B - Remove the code regeneration and hash update entirely. The `guest_confirm` function should:

1. Validate token
2. Log policy acceptance event
3. Return success WITHOUT returning a code (guest already received it via SMS/console)

### Step 2: Fix API Call Not Firing

**File**: `components/checkin/CodeVerification.tsx`

**Problem**: The test code at line 131-144 has an early `return` that correctly skips API call, but for real codes, if `verifyAttestationCode` throws an error or returns unexpected format, the UI might not update.

**Changes needed**:

1. Move `setIsSubmitting(false)` to a proper `finally` block
2. Ensure the API call always resolves (no unhandled promise rejections)
3. Add timeout to API calls
4. Ensure error states are properly set

### Step 3: Investigate Double Function Calls

**Files**:

- `components/checkin/CheckInForm.tsx`
- `lib/api.ts`

Add logging to trace:

1. Form submission in `CheckInForm.tsx` (line 48)
2. API function call in `lib/api.ts` (line 35)
3. Check for React StrictMode double-mounting
4. Check for duplicate form submit handlers

### Step 4: Update Database Schema Understanding

The `attestations` table has:

- `code_hash`: SHA-256 hash of code + salt (for verification)
- `code_enc`: Currently NULL (could store encrypted code for retrieval)
- `verification_method`: 'code' or 'link'

**Decision needed**: Should `guest_confirm` return a code at all, or should the guest only receive the code via SMS/console log from `send_attestation_sms_fixed`?

## Files to Modify

1. **Edge Function**: `guest_confirm` (via Supabase deployment)

   - Remove code regeneration logic
   - Remove hash update
   - Only log policy acceptance

2. **Edge Function**: `verify_attestation_code` (verify it's working correctly)

   - Already looks correct, just needs testing

3. **Client Component**: `components/checkin/CodeVerification.tsx`

   - Improve error handling
   - Ensure `finally` block always executes
   - Add timeout to API calls

4. **API Layer**: `lib/api.ts`

   - Add timeout to `verifyAttestationCode`
   - Improve error handling and logging

5. **Investigation**: `components/checkin/CheckInForm.tsx`

   - Add logging to identify double calls

## Testing Plan

1. Create new attestation via check-in form
2. Note the code logged in Supabase function logs
3. Attempt to verify that EXACT code
4. Verify API call is made (check Network tab)
5. Verify correct success/error message is shown
6. Test with incorrect code to ensure error handling works

### To-dos

- [ ] Remove code regeneration and hash update from guest_confirm edge function - it should only log policy acceptance, not overwrite the original verification code hash
- [ ] Fix CodeVerification component to properly handle API errors and ensure loading state is always reset in finally block
- [ ] Add comprehensive error handling and timeouts to verifyAttestationCode API function
- [ ] Add logging and investigate why send_attestation_sms_fixed is being called twice
- [ ] Test complete verification flow with correct and incorrect codes to ensure all issues are resolved