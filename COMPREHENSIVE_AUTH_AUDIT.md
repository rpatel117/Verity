# COMPREHENSIVE AUTHENTICATION SYSTEM AUDIT
## Verity Hotel Check-In Application

**Purpose**: Complete technical documentation of the authentication system for error analysis and debugging.

**Date**: 2025-01-13
**Status**: Production - Active Issues with Login Flow

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#system-architecture-overview)
2. [Supabase Client Configuration](#supabase-client-configuration)
3. [Authentication Context (React)](#authentication-context-react)
4. [Database Schema & Tables](#database-schema--tables)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Edge Functions](#edge-functions)
7. [Authentication Flows](#authentication-flows)
8. [Known Issues & Error Patterns](#known-issues--error-patterns)
9. [Code Files Reference](#code-files-reference)

---

## SYSTEM ARCHITECTURE OVERVIEW

### Technology Stack
- **Frontend**: Next.js 15.2.4 (App Router)
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Auth Provider**: Supabase Auth (GoTrue)
- **State Management**: React Context API
- **Session Storage**: Browser localStorage
- **Token Flow**: PKCE (Proof Key for Code Exchange)

### Component Hierarchy
```
RootLayout (app/layout.tsx)
  └─ AuthProvider (components/auth/AuthContext.tsx)
      ├─ AuthGuard (components/auth/AuthGuard.tsx) - Protected routes
      ├─ AuthPage (app/(public)/auth/page.tsx) - Login/Signup
      └─ DashboardLayout (app/(protected)/dashboard/layout.tsx) - Protected content
```

### Data Flow
```
User Action → AuthContext → Supabase Client → Supabase Auth Service
                                              ↓
                                    auth.users (Supabase managed)
                                              ↓
                                    profiles table (App managed)
                                              ↓
                                    React State (user object)
```

---

## SUPABASE CLIENT CONFIGURATION

### File: `lib/supabaseClient.ts`

**Purpose**: Creates the main Supabase client instance for authenticated operations.

**Configuration**:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,      // Automatically refreshes expired tokens
    persistSession: true,         // Saves session to localStorage
    detectSessionInUrl: true,     // Detects auth tokens in URL (email confirmation, password reset)
    flowType: 'pkce',            // Uses PKCE flow for enhanced security
    storage: window.localStorage, // Stores session data in browser localStorage
    debug: process.env.NODE_ENV === 'development',
  },
})
```

**Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous/public API key
- **Fallback Values** (hardcoded):
  - URL: `https://rusqnjonwtgzcccyhjze.supabase.co`
  - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (truncated)

**Critical Notes**:
1. **Hardcoded fallbacks**: If env vars are missing, uses production values. This can cause confusion in development.
2. **Development storage wrapper**: In dev mode, wraps localStorage with logging for every getItem/setItem/removeItem operation.
3. **No error handling**: If Supabase client creation fails, no error is caught or displayed.

**Development Helpers** (window globals in dev mode):
- `window.clearAuthState()` - Clears all auth data
- `window.checkAuthState()` - Logs current session state
- `window.forceLogout()` - Forces logout and redirects
- `window.nuclearAuthClear()` - Nuclear option to clear everything

---

### File: `lib/supabaseGuestClient.ts`

**Purpose**: Separate Supabase client for guest-facing pages (public routes that don't need auth).

**Configuration**:
```typescript
export const supabaseGuest = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,     // No token refresh needed
    persistSession: false,        // No session persistence
    detectSessionInUrl: false,    // Not relevant for guest links
    flowType: 'pkce',
    storage: {
      getItem: () => null,        // No-op storage
      setItem: () => {},          // No-op storage
      removeItem: () => {},       // No-op storage
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'verity-guest-client'
    }
  }
})
```

**Why Separate Client?**
- Prevents conflicts with main auth client
- Guest pages don't need session management
- Avoids "Multiple GoTrueClient instances" warnings

---

## AUTHENTICATION CONTEXT (REACT)

### File: `components/auth/AuthContext.tsx`

**Purpose**: React Context provider that manages authentication state globally.

### State Variables

```typescript
const [user, setUser] = useState<User | null>(null)
const [isInitializing, setIsInitializing] = useState(true)
```

**Derived State**:
- `isAuthenticated: boolean` = `!!user`
- `userEmail: string | undefined` = `user?.email`

### Initialization Flow (useEffect on mount)

**Step 1: Guest Page Check** (lines 49-58)
```typescript
if (pathname.startsWith('/guest/')) {
  setUser(null)
  setIsInitializing(false)
  return // Skip all auth initialization
}
```
**Why**: Guest pages don't need auth, prevents conflicts.

**Step 2: Timeout Safety** (lines 61-66)
```typescript
setTimeout(() => {
  if (mounted) {
    setIsInitializing(false) // Force initialization complete after 2 seconds
  }
}, 2000)
```
**Why**: Prevents infinite loading if auth check hangs.

**Step 3: Auth State Change Listener** (lines 69-184)
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    // Handles: SIGNED_IN, SIGNED_OUT, INITIAL_SESSION, TOKEN_REFRESHED
  }
)
```

### Event Handlers

#### 1. SIGNED_IN Event (lines 76-129)

**Trigger**: User successfully logs in or session is restored.

**Flow**:
1. Receives `session` object with `session.user` (from Supabase Auth)
2. Fetches profile from `profiles` table:
   ```typescript
   const profilePromise = supabase
     .from('profiles')
     .select('*')
     .eq('id', session.user.id)
     .single()
   ```
3. **Timeout Protection**: 10-second timeout on profile fetch
   ```typescript
   const profileTimeoutPromise = new Promise((_, reject) => {
     setTimeout(() => reject(new Error('Profile fetch timed out after 10 seconds')), 10000)
   })
   profileResult = await Promise.race([profilePromise, profileTimeoutPromise])
   ```
4. If timeout: Signs out user, clears state, returns early
5. If success: Creates User object and sets state:
   ```typescript
   const userData: User = {
     id: session.user.id,
     email: session.user.email!,
     name: profile.name,
     hotelName: profile.hotel_name,
     provider: 'email'
   }
   setUser(userData)
   setIsInitializing(false)
   ```

**Critical Issues**:
- **Profile fetch can hang**: If database query hangs, timeout fires after 10 seconds and user is signed out
- **No retry logic**: If profile fetch fails due to network issues, user is signed out
- **Race condition**: Both SIGNED_IN handler and login() function fetch profile (duplicate queries)

#### 2. SIGNED_OUT Event (lines 130-134)

**Trigger**: User logs out or session expires.

**Flow**:
```typescript
setUser(null)
setIsInitializing(false)
```

**Simple and correct**.

#### 3. INITIAL_SESSION Event (lines 135-174)

**Trigger**: App loads and Supabase checks for existing session in localStorage.

**Flow**:
1. If `session?.user` exists:
   - Fetches profile from `profiles` table
   - If profile fetch fails: Signs out user (invalid session)
   - If profile found: Sets user state
2. If no session: Sets user to null
3. Always sets `isInitializing = false`

**Critical Issues**:
- **Profile fetch can hang**: Same timeout issue as SIGNED_IN
- **No timeout on INITIAL_SESSION profile fetch**: Unlike SIGNED_IN, no explicit timeout (relies on network timeout)

#### 4. TOKEN_REFRESHED Event (lines 175-180)

**Trigger**: Supabase automatically refreshes expired access token.

**Flow**:
```typescript
// Do nothing - user state remains the same
setIsInitializing(false) // Safety check
```

**Correct**: Token refresh doesn't change user identity.

### Login Function (lines 193-439)

**Signature**: `login(email: string, password: string): Promise<User | void>`

**Complete Flow**:

**Phase 1: Clear Stale Sessions** (lines 200-249)
```typescript
// Check for existing session with 3-second timeout
const getSessionPromise = supabase.auth.getSession()
const sessionTimeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Session check timed out')), 3000)
})
const result = await Promise.race([getSessionPromise, sessionTimeoutPromise])

if (result?.data?.session) {
  // Clear existing session
  await supabase.auth.signOut()
  // Manually clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
      localStorage.removeItem(key)
    }
  })
  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
      sessionStorage.removeItem(key)
    }
  })
  // Wait 200ms for signout to complete
  await new Promise(resolve => setTimeout(resolve, 200))
}
```

**Why**: Prevents conflicts when re-logging in after closing a tab without logging out.

**Phase 2: Attempt Login** (lines 251-291)
```typescript
// Set up backup listener for SIGNED_IN event
let signedInEventReceived = false
let signedInUser: any = null
const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    signedInEventReceived = true
    signedInUser = session.user
  }
})

// Attempt login with 60-second timeout
const loginPromise = supabase.auth.signInWithPassword({ email, password })
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Login request timed out after 60 seconds')), 60000)
})

let loginResult = await Promise.race([loginPromise, timeoutPromise])

// If timeout but SIGNED_IN event fired, use event data
if (timeoutError && signedInEventReceived && signedInUser) {
  loginResult = { data: { user: signedInUser }, error: null }
}
```

**Why**: Handles cases where `signInWithPassword` promise hangs but SIGNED_IN event fires.

**Phase 3: Fetch Profile** (lines 314-389)
```typescript
// Wait 300ms to see if main SIGNED_IN handler already fetched profile
await new Promise(resolve => setTimeout(resolve, 300))

// Fetch profile with 5-second timeout
const profilePromise = supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

const profileTimeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Profile fetch timed out after 5 seconds')), 5000)
})

let profileResult = await Promise.race([profilePromise, profileTimeoutPromise])
```

**If profile fetch times out**:
1. Checks if session exists (main handler may have set user)
2. If session exists: Tries quick retry (2-second timeout)
3. If retry fails: Returns minimal user object (fallback)
4. If no session: Throws error

**Phase 4: Set User State** (lines 408-424)
```typescript
const userData: User = {
  id: user.id,
  email: user.email!,
  name: profile.name,
  hotelName: profile.hotel_name,
  provider: 'email'
}
setUser(userData)
setIsInitializing(false)
toast.success('Successfully signed in!')
return userData
```

**Critical Issues**:
1. **Duplicate profile fetches**: Both SIGNED_IN handler and login() fetch profile
2. **Race condition**: 300ms wait may not be enough
3. **Profile fetch can hang**: Multiple timeout layers but still can fail
4. **Complex fallback logic**: Hard to debug when things go wrong

### Signup Function (lines 441-477)

**Signature**: `signup(email: string, password: string, name: string, hotelName: string): Promise<void>`

**Flow**:
1. Calls `supabase.auth.signUp({ email, password })`
   - Creates user in `auth.users` table (Supabase managed)
   - Sends confirmation email (if enabled)
2. Inserts profile into `profiles` table:
   ```typescript
   await supabase.from('profiles').insert({
     id: data.user.id,  // Foreign key to auth.users
     name,
     hotel_name: hotelName,
   })
   ```
3. Shows success toast
4. Does NOT log user in (must confirm email first)

**Critical Issues**:
- **No transaction**: If profile insert fails, user exists in auth.users but not in profiles
- **No hotel_id**: Profile is created without hotel_id (should create hotel first or require hotel_id)
- **No error recovery**: If profile creation fails, user is stuck (can't log in, can't re-signup)

### Logout Function (lines 479-516)

**Signature**: `logout(): Promise<void>`

**Flow**:
1. Clears user state immediately: `setUser(null)`
2. Calls `supabase.auth.signOut()`
3. Manually clears localStorage and sessionStorage:
   ```typescript
   Object.keys(localStorage).forEach(key => {
     if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
       localStorage.removeItem(key)
     }
   })
   ```
4. Shows success toast

**Correct**: Aggressive cleanup prevents stale sessions.

### Forgot Password Function (lines 518-535)

**Signature**: `forgotPassword(email: string): Promise<void>`

**Flow**:
1. Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset' })`
2. Supabase sends password reset email
3. Shows success toast

**Note**: Always returns success (security best practice - doesn't reveal if email exists).

### Reset Password Function (lines 537-552)

**Signature**: `resetPassword(password: string): Promise<void>`

**Flow**:
1. Calls `supabase.auth.updateUser({ password })`
2. Only works if user has valid reset token (from email link)
3. Shows success toast

**Note**: Token is extracted from URL by Supabase (via `detectSessionInUrl`).

---

## DATABASE SCHEMA & TABLES

### File: `supabase/migrations/001_production_schema.sql`

### Table: `auth.users` (Supabase Managed)

**Purpose**: Core authentication table managed by Supabase Auth.

**Key Columns**:
- `id` (UUID): Primary key, used as foreign key in `profiles.id`
- `email`: User's email address
- `encrypted_password`: Hashed password (bcrypt)
- `email_confirmed_at`: Timestamp when email was confirmed
- `created_at`: Account creation timestamp

**Access**: Only via Supabase Auth API, not directly queryable.

### Table: `profiles` (App Managed)

**Purpose**: Extended user profile data beyond what Supabase Auth provides.

**Schema**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hotel_name TEXT,
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  role TEXT CHECK (role IN ('admin','staff')) DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Relationships**:
- `id` → `auth.users.id` (1:1 relationship)
- `hotel_id` → `hotels.id` (many:1 relationship)

**RLS Policy**:
```sql
CREATE POLICY "profiles self" ON profiles 
FOR SELECT USING (id = auth.uid());
```
**Meaning**: Users can only SELECT their own profile.

**Critical Issues**:
1. **No INSERT policy**: Users cannot insert their own profile (signup function may fail)
2. **No UPDATE policy**: Users cannot update their own profile
3. **hotel_id can be NULL**: Profiles can exist without hotel_id (multi-tenancy broken)

### Table: `hotels`

**Purpose**: Multi-tenant hotel organization.

**Schema**:
```sql
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note**: No RLS policies defined (all authenticated users can read/write?).

### Table: `guests`

**Purpose**: Guest records for check-ins.

**Schema**:
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  dl_number TEXT,
  dl_state TEXT,
  cc_last4 TEXT CHECK (char_length(cc_last4)=4),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies**:
```sql
CREATE POLICY "guests hotel read" ON guests FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.hotel_id = guests.hotel_id)
);

CREATE POLICY "guests hotel write" ON guests FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.hotel_id = hotel_id)
);
```

**Meaning**: Users can only read/write guests for their own hotel.

### Table: `attestations`

**Purpose**: SMS attestation records.

**Schema**:
```sql
CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,           -- SHA-256 hash of 6-digit code
  code_enc TEXT,                     -- Plain text code (for guest display)
  token TEXT NOT NULL UNIQUE,        -- JWT token for guest link
  sms_sid TEXT,
  sms_status TEXT,
  policy_text TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verification_method TEXT CHECK (verification_method IN ('code','link')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note**: Schema in migration shows different columns than what edge function uses (see edge function section).

### Table: `attestation_events`

**Purpose**: Event log for attestation lifecycle.

**Schema**:
```sql
CREATE TABLE attestation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attestation_id UUID NOT NULL REFERENCES attestations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  accuracy NUMERIC,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Event Types**: `'sms.sent'`, `'sms.status'`, `'page.open'`, `'geo.capture'`, `'policy.accept'`, `'code.submit'`

---

## ROW LEVEL SECURITY (RLS) POLICIES

### Profiles Table

**SELECT Policy**:
```sql
CREATE POLICY "profiles self" ON profiles 
FOR SELECT USING (id = auth.uid());
```
- Users can only read their own profile
- **Missing**: INSERT and UPDATE policies (signup may fail)

### Guests Table

**SELECT Policy**:
```sql
CREATE POLICY "guests hotel read" ON guests FOR SELECT USING (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.hotel_id = guests.hotel_id)
);
```
- Users can only read guests for their hotel

**INSERT Policy**:
```sql
CREATE POLICY "guests hotel write" ON guests FOR INSERT WITH CHECK (
  EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.hotel_id = hotel_id)
);
```
- Users can only insert guests for their hotel

### Attestations Table

**SELECT Policy**:
```sql
CREATE POLICY "attest hotel read" ON attestations FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM guests g JOIN profiles p ON p.id=auth.uid()
    WHERE g.id = guest_id AND g.hotel_id = p.hotel_id
  )
);
```
- Users can only read attestations for their hotel's guests

**INSERT Policy**:
```sql
CREATE POLICY "attest hotel write" ON attestations FOR INSERT WITH CHECK (
  EXISTS(
    SELECT 1 FROM guests g JOIN profiles p ON p.id=auth.uid()
    WHERE g.id = guest_id AND g.hotel_id = p.hotel_id
  )
);
```
- Users can only insert attestations for their hotel's guests

**Critical Issue**: Edge function uses SERVICE_ROLE_KEY (bypasses RLS), but client code uses anon key (subject to RLS).

---

## EDGE FUNCTIONS

### Function: `send_attestation_sms_fixed`

**File**: `supabase/functions/send_attestation_sms_fixed/index.ts`

**Purpose**: Creates guest record, generates attestation, sends SMS (mock in dev).

**Authentication**: Requires JWT token in Authorization header.

**Flow**:
1. **Verify JWT Token** (lines 42-56):
   ```typescript
   const token = authHeader.replace('Bearer ', '')
   const { data: { user }, error } = await supabase.auth.getUser(token)
   ```
   - Validates user is authenticated
   - Returns 401 if invalid

2. **Get User's Hotel ID** (lines 58-72):
   ```typescript
   const { data: profile } = await supabase
     .from('profiles')
     .select('hotel_id')
     .eq('id', user.id)
     .single()
   ```
   - Fetches profile to get hotel_id
   - Returns 403 if no hotel_id

3. **Generate Verification Code** (lines 93-103):
   ```typescript
   const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
   // Hash with SHA-256
   const codeHash = await crypto.subtle.digest('SHA-256', ...)
   ```

4. **Upsert Guest Record** (lines 106-132):
   ```typescript
   await supabase.from('guests').upsert({
     hotel_id: hotelId,
     created_by: user.id,
     full_name: guest.fullName,
     phone_e164: guest.phoneE164,
     // ... other fields
   }, {
     onConflict: 'phone_e164,hotel_id'
   })
   ```

5. **Create JWT Token for Guest Link** (lines 134-162):
   ```typescript
   const payload = {
     attestation_id: attestationId,
     guest_id: guestRecord.id,
     hotel_id: hotelId,
     exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24h expiry
   }
   const jwtToken = await jwt.create({ alg: 'HS256' }, payload, key)
   ```

6. **Create Attestation Record** (lines 165-195):
   ```typescript
   await supabase.from('attestations').insert({
     id: attestationId,
     guest_id: guestRecord.id,
     code_hash: codeHash,
     code_enc: verificationCode,  // Plain text code stored
     token: jwtToken,
     status: 'sent'
   })
   ```

**Critical Issues**:
1. **Schema Mismatch**: Edge function inserts columns that don't exist in migration:
   - `hotel_id` (not in migration schema)
   - `guest_full_name` (not in migration schema)
   - `guest_phone_e164` (not in migration schema)
   - `cc_last_4` (not in migration schema)
   - `dl_number` (not in migration schema)
   - `dl_state` (not in migration schema)
   - `check_in_date` (not in migration schema)
   - `check_out_date` (not in migration schema)
   - `status` (not in migration schema)
2. **Uses SERVICE_ROLE_KEY**: Bypasses RLS (intentional, but means RLS policies are not tested)
3. **Hardcoded fallback values**: Uses production URL/key if env vars missing

### Function: `guest_init`

**File**: `supabase/functions/guest_init/index.ts`

**Purpose**: Validates guest JWT token and returns policy text.

**Authentication**: No auth required (public endpoint).

**Flow**:
1. **Verify JWT Token** (lines 38-63):
   ```typescript
   const payload = await jwt.verify(token, key)
   ```
   - Uses `VERITY_SIGNING_SECRET` to verify
   - Returns `{ valid: false }` if invalid/expired

2. **Fetch Attestation** (lines 74-90):
   ```typescript
   const { data: attestation } = await supabase
     .from('attestations')
     .select('id, policy_text, guest_full_name, guest_phone_e164')
     .eq('token', token)
     .single()
   ```
   - **Schema Mismatch**: Queries `guest_full_name` and `guest_phone_e164` which don't exist in migration

3. **Log Page Open Event** (lines 92-106):
   ```typescript
   await supabase.from('attestation_events').insert({
     attestation_id: attestation.id,
     event_type: 'page.open',
     event_data: { ip, user_agent, timestamp }
   })
   ```
   - **Schema Mismatch**: Uses `event_data` JSONB field, but migration shows separate columns (`ip`, `user_agent`)

4. **Return Response**:
   ```typescript
   return { valid: true, policyText: attestation.policy_text, twoFACodeMasked: '12****' }
   ```

**Critical Issues**:
1. **Schema mismatches**: Queries non-existent columns
2. **Uses SERVICE_ROLE_KEY**: Bypasses RLS

### Function: `guest_confirm`

**File**: `supabase/functions/guest_confirm/index.ts`

**Purpose**: Handles guest policy acceptance and returns verification code.

**Authentication**: No auth required (public endpoint).

**Flow**:
1. **Verify JWT Token** (lines 45-85): Same as guest_init

2. **Check Attestation** (lines 90-106):
   ```typescript
   const { data: attestation } = await supabase
     .from('attestations')
     .select('id, verified_at')
     .eq('token', token)
     .single()
   ```
   - Checks if already verified
   - Returns `{ ok: false }` if already verified

3. **Log Policy Acceptance** (lines 138-144):
   ```typescript
   await supabase.from('attestation_events').insert({
     attestation_id: attestation.id,
     event_type: 'policy.accept',
     event_data: { timestamp: new Date().toISOString() }
   })
   ```

4. **Return Verification Code** (lines 147-156):
   ```typescript
   const { data: attestationData } = await supabase
     .from('attestations')
     .select('code_enc')
     .eq('token', token)
     .single()
   
   return { ok: true, code: attestationData?.code_enc || 'Code not available' }
   ```

**Critical Issues**:
1. **Returns plain text code**: Security risk if token is compromised
2. **No rate limiting**: Can be called multiple times
3. **Uses SERVICE_ROLE_KEY**: Bypasses RLS

---

## AUTHENTICATION FLOWS

### Flow 1: New User Signup

```
1. User fills signup form (email, password, name, hotelName)
   ↓
2. AuthPage calls AuthContext.signup()
   ↓
3. AuthContext calls supabase.auth.signUp({ email, password })
   ↓
4. Supabase creates user in auth.users table
   ↓
5. Supabase sends confirmation email (if enabled)
   ↓
6. AuthContext inserts profile into profiles table
   ❌ ISSUE: May fail due to missing INSERT RLS policy
   ↓
7. Success toast shown, email confirmation message displayed
   ↓
8. User clicks confirmation link in email
   ↓
9. Supabase validates token, activates account
   ↓
10. User redirected to app (via detectSessionInUrl)
    ↓
11. INITIAL_SESSION event fires
    ↓
12. AuthContext fetches profile, sets user state
    ↓
13. User redirected to dashboard
```

**Failure Points**:
- Step 6: Profile insert may fail (no INSERT policy)
- Step 12: Profile fetch may hang/timeout

### Flow 2: User Login

```
1. User fills login form (email, password)
   ↓
2. AuthPage calls AuthContext.login()
   ↓
3. AuthContext checks for existing session (3s timeout)
   ↓
4. If session exists: Clears it (signOut + localStorage clear)
   ↓
5. AuthContext calls supabase.auth.signInWithPassword({ email, password })
   ↓
6. Supabase validates credentials against auth.users
   ↓
7. Supabase creates session, stores in localStorage
   ↓
8. SIGNED_IN event fires (Supabase Auth)
   ↓
9. TWO PROFILE FETCHES HAPPEN (RACE CONDITION):
   a) SIGNED_IN handler fetches profile (10s timeout)
   b) login() function fetches profile (5s timeout, waits 300ms first)
   ↓
10. If profile fetch succeeds: User state set, isInitializing = false
    ↓
11. AuthPage detects isAuthenticated = true
    ↓
12. AuthPage redirects to /dashboard
    ↓
13. DashboardLayout renders, AuthGuard checks isAuthenticated
    ↓
14. Protected content rendered
```

**Failure Points**:
- Step 3: Session check may timeout (continues anyway)
- Step 5: signInWithPassword may timeout (60s timeout, but can still hang)
- Step 9a: SIGNED_IN handler profile fetch may hang/timeout (user signed out)
- Step 9b: login() function profile fetch may hang/timeout (throws error)
- Step 10: Race condition - both fetches may complete, causing duplicate queries

### Flow 3: Session Restoration (Page Refresh)

```
1. User refreshes page or opens new tab
   ↓
2. AuthContext mounts, isInitializing = true
   ↓
3. Supabase checks localStorage for session
   ↓
4. If session found: INITIAL_SESSION event fires
   ↓
5. AuthContext fetches profile from profiles table
   ❌ ISSUE: No explicit timeout (relies on network timeout)
   ↓
6. If profile found: User state set, isInitializing = false
   ↓
7. If profile not found: Session cleared, user = null
   ↓
8. AuthGuard checks isAuthenticated
   ↓
9. If authenticated: Protected content rendered
   If not: Redirect to /auth
```

**Failure Points**:
- Step 5: Profile fetch may hang (no timeout protection)
- Step 6: If profile fetch fails, user is signed out (even if session is valid)

### Flow 4: User Logout

```
1. User clicks logout button
   ↓
2. Component calls AuthContext.logout()
   ↓
3. AuthContext sets user = null immediately
   ↓
4. AuthContext calls supabase.auth.signOut()
   ↓
5. Supabase clears session from localStorage
   ↓
6. SIGNED_OUT event fires
   ↓
7. AuthContext sets user = null (redundant, already done)
   ↓
8. AuthContext clears localStorage and sessionStorage manually
   ↓
9. Success toast shown
   ↓
10. AuthGuard detects isAuthenticated = false
    ↓
11. Redirect to /auth
```

**Correct**: Aggressive cleanup prevents stale sessions.

---

## KNOWN ISSUES & ERROR PATTERNS

### Issue 1: Profile Fetch Hanging

**Symptoms**:
- Login gets stuck at "Fetching user profile..."
- Console shows: "Profile fetch timed out after 10 seconds"
- User is signed out even though login succeeded

**Root Causes**:
1. Database query hangs (network issue, database overload)
2. RLS policy blocks query (unlikely, but possible)
3. Profile doesn't exist (should throw PGRST116 error, but may hang instead)

**Affected Code**:
- `AuthContext.tsx` lines 80-101 (SIGNED_IN handler)
- `AuthContext.tsx` lines 329-389 (login function)

**Current Mitigations**:
- 10-second timeout in SIGNED_IN handler
- 5-second timeout in login function
- Fallback to minimal user object if timeout

**Not Fixed**: Still hangs in production.

### Issue 2: Duplicate Profile Fetches

**Symptoms**:
- Two identical queries to profiles table on login
- Race condition between SIGNED_IN handler and login function

**Root Cause**:
- Both SIGNED_IN handler and login() function fetch profile independently
- 300ms wait in login() is not reliable

**Affected Code**:
- `AuthContext.tsx` lines 80-101 (SIGNED_IN handler)
- `AuthContext.tsx` lines 329-389 (login function)

**Current Mitigations**:
- 300ms wait in login() before fetching profile
- Check if session exists before fetching in login()

**Not Fixed**: Still causes duplicate queries.

### Issue 3: Schema Mismatches

**Symptoms**:
- Edge functions query columns that don't exist
- Database errors when edge functions run

**Root Cause**:
- Migration schema doesn't match what edge functions expect
- Edge functions were written for different schema

**Affected Code**:
- `supabase/functions/send_attestation_sms_fixed/index.ts` (inserts non-existent columns)
- `supabase/functions/guest_init/index.ts` (queries non-existent columns)
- `supabase/migrations/001_production_schema.sql` (missing columns)

**Missing Columns in Migration**:
- `attestations.hotel_id`
- `attestations.guest_full_name`
- `attestations.guest_phone_e164`
- `attestations.cc_last_4`
- `attestations.dl_number`
- `attestations.dl_state`
- `attestations.check_in_date`
- `attestations.check_out_date`
- `attestations.status`

**Not Fixed**: Schema needs to be updated or edge functions need to be fixed.

### Issue 4: Missing RLS Policies

**Symptoms**:
- Signup fails with "new row violates row-level security policy"
- Users cannot insert their own profile

**Root Cause**:
- No INSERT policy on profiles table
- No UPDATE policy on profiles table

**Affected Code**:
- `supabase/migrations/001_production_schema.sql` (missing policies)
- `AuthContext.tsx` signup function (may fail)

**Not Fixed**: Policies need to be added.

### Issue 5: Stale Session on Tab Close

**Symptoms**:
- User closes tab without logging out
- Opens new tab, tries to log in
- Login hangs or fails

**Root Cause**:
- Session persists in localStorage
- Old session conflicts with new login attempt

**Current Mitigations**:
- Login function clears existing session before attempting login
- Manual localStorage/sessionStorage cleanup

**Partially Fixed**: Still occurs in some cases.

### Issue 6: INITIAL_SESSION No Timeout

**Symptoms**:
- App hangs on load if profile fetch hangs
- isInitializing stays true forever

**Root Cause**:
- INITIAL_SESSION handler has no explicit timeout
- Relies on network timeout (can be 30+ seconds)

**Affected Code**:
- `AuthContext.tsx` lines 135-174 (INITIAL_SESSION handler)

**Current Mitigations**:
- 2-second fallback timeout on entire initialization
- But INITIAL_SESSION handler itself has no timeout

**Not Fixed**: Should add timeout to INITIAL_SESSION profile fetch.

---

## CODE FILES REFERENCE

### Frontend Files

1. **`lib/supabaseClient.ts`** (151 lines)
   - Main Supabase client configuration
   - Development helpers

2. **`lib/supabaseGuestClient.ts`** (46 lines)
   - Guest-specific Supabase client (no session persistence)

3. **`components/auth/AuthContext.tsx`** (578 lines)
   - React Context provider
   - All auth functions (login, signup, logout, etc.)
   - Auth state management

4. **`components/auth/AuthGuard.tsx`** (47 lines)
   - Route protection component
   - Redirects unauthenticated users

5. **`app/(public)/auth/page.tsx`** (565 lines)
   - Login/signup UI
   - Form handling
   - Redirect logic

6. **`app/(public)/auth/forgot/page.tsx`** (177 lines)
   - Password reset request page

7. **`app/(public)/auth/reset/page.tsx`** (242 lines)
   - Password reset confirmation page

8. **`app/layout.tsx`** (43 lines)
   - Root layout with AuthProvider

9. **`app/(protected)/dashboard/layout.tsx`** (37 lines)
   - Dashboard layout with AuthGuard

10. **`lib/api.ts`** (301 lines)
    - API client functions
    - Edge function invocations

### Backend Files

1. **`supabase/migrations/001_production_schema.sql`** (244 lines)
   - Database schema
   - RLS policies
   - RPC functions

2. **`supabase/functions/send_attestation_sms_fixed/index.ts`** (259 lines)
   - Creates attestation and sends SMS

3. **`supabase/functions/guest_init/index.ts`** (128 lines)
   - Validates guest token and returns policy

4. **`supabase/functions/guest_confirm/index.ts`** (181 lines)
   - Handles policy acceptance and returns code

### Type Definitions

1. **`types/index.ts`** (139 lines)
   - TypeScript interfaces
   - User, Attestation, etc.

---

## SUMMARY OF CRITICAL ISSUES

1. **Profile fetch hanging**: Multiple timeouts but still hangs in production
2. **Duplicate profile fetches**: Race condition between SIGNED_IN handler and login()
3. **Schema mismatches**: Edge functions query non-existent columns
4. **Missing RLS policies**: No INSERT/UPDATE policies on profiles table
5. **INITIAL_SESSION no timeout**: Can hang on app load
6. **Stale session conflicts**: Still occurs despite cleanup attempts

---

## RECOMMENDATIONS FOR FIXING

1. **Add explicit timeout to INITIAL_SESSION profile fetch** (10 seconds)
2. **Remove duplicate profile fetch** - Only fetch in SIGNED_IN handler, login() should wait for it
3. **Fix schema mismatches** - Either update migration or fix edge functions
4. **Add RLS policies** - INSERT and UPDATE policies for profiles table
5. **Add retry logic** - Retry profile fetch on network errors
6. **Add better error messages** - Distinguish between timeout, network error, and missing profile
7. **Add logging** - Log all profile fetch attempts and results
8. **Consider database trigger** - Auto-create profile when user signs up (eliminates race condition)

---

**END OF AUDIT**

