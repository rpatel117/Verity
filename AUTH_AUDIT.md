# Authentication System Audit - Verity Application

## Overview

The Verity application uses Supabase Auth for authentication, with a React Context-based state management system. The authentication flow involves multiple components working together to manage user sessions, protect routes, and handle login/logout operations.

---

## Architecture Components

### 1. Supabase Client (`lib/supabaseClient.ts`)

**Purpose**: Creates and configures the main Supabase client instance that handles all authentication and database operations.

**Configuration**:
- **URL & Key**: Uses environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, with hardcoded fallback values for production
- **Auth Settings**:
  - `autoRefreshToken: true` - Automatically refreshes expired tokens in the background
  - `persistSession: true` - Saves session to localStorage so users stay logged in across page refreshes
  - `detectSessionInUrl: true` - Detects auth tokens in URL (for email confirmation links, password reset, etc.)
  - `flowType: 'pkce'` - Uses PKCE (Proof Key for Code Exchange) flow for enhanced security
  - `storage: window.localStorage` - Stores session data in browser's localStorage

**Why these settings matter**:
- Session persistence means users don't have to log in every time they visit
- Auto-refresh prevents sessions from expiring while users are active
- PKCE flow is more secure than basic auth flows
- URL detection allows seamless email confirmation and password reset flows

**Development Helpers** (only in dev mode):
- `window.clearAuthState()` - Clears all auth data for debugging
- `window.checkAuthState()` - Logs current session state
- `window.forceLogout()` - Forces logout and redirects
- `window.nuclearAuthClear()` - Nuclear option to clear everything

**Potential Issues**:
- Hardcoded fallback values could cause confusion if env vars are missing
- Development storage wrapper logs every getItem/setItem which could be noisy
- No error handling if Supabase client creation fails

---

### 2. AuthContext (`components/auth/AuthContext.tsx`)

**Purpose**: Provides authentication state and methods to all components in the application via React Context.

**State Management**:
- `user: User | null` - The current authenticated user object (null if not logged in)
- `isInitializing: boolean` - Whether auth state is still being determined (prevents flash of wrong content)

**Initialization Flow** (runs once on mount):

1. **Guest Page Check** (lines 49-58):
   - Checks if current pathname starts with `/guest/`
   - If yes, immediately sets `user = null` and `isInitializing = false`
   - **Why**: Guest pages don't need auth, so skip all auth checks to avoid conflicts

2. **Timeout Safety** (lines 60-66):
   - Sets a 1-second timeout that forces `isInitializing = false` if auth check takes too long
   - **Why**: Prevents infinite loading states if something goes wrong

3. **Immediate Session Check** (lines 68-102):
   - Calls `supabase.auth.getSession()` synchronously
   - If no session: sets user to null, stops initialization
   - If session exists but expired: clears it via `signOut()`, sets user to null
   - If session is valid: waits for `INITIAL_SESSION` event to handle it
   - **Why**: Quick check to see if user is already logged in before waiting for auth state change events

4. **Auth State Change Listener** (lines 104-215):
   - Subscribes to Supabase's `onAuthStateChange` event
   - This listener fires for ALL auth events: SIGNED_IN, SIGNED_OUT, INITIAL_SESSION, TOKEN_REFRESHED, etc.
   - **Why**: This is the primary way Supabase notifies the app of auth state changes

**Event Handlers**:

- **SIGNED_IN** (lines 129-156):
  - Fetches user profile from `profiles` table using the user ID from session
  - If profile exists: creates User object and sets it in state
  - If profile doesn't exist: sets user to null (user exists in auth but not in profiles table)
  - **Why**: The app needs profile data (name, hotel_name) not just auth data

- **SIGNED_OUT** (lines 157-159):
  - Simply sets user to null
  - **Why**: Clear state when user logs out

- **INITIAL_SESSION** (lines 160-199):
  - This fires when Supabase initializes and finds an existing session in localStorage
  - Double-checks session is still valid by calling `getSession()` again
  - Validates session hasn't changed (user ID matches)
  - Fetches profile and sets user state
  - **Why**: Handles the case where user refreshes page or returns to site with existing session

- **TOKEN_REFRESHED** (lines 200-202):
  - Does nothing, just logs
  - **Why**: Token refresh doesn't change user identity, so no state update needed

- **Other Events** (lines 203-208):
  - If session is missing, sets user to null
  - **Why**: Conservative approach - if we don't recognize the event and there's no session, assume logged out

**Session Expiration Check** (lines 114-126):
- Before handling any event, checks if session is expired
- Compares `session.expires_at` (Unix timestamp) to current time
- If expired: clears session and sets user to null
- **Why**: Prevents using stale/expired sessions

**Critical Issue**: The `INITIAL_SESSION` handler calls `getSession()` again (line 166), which could cause a race condition or infinite loop if not careful. Also, if the profile fetch fails, user is set to null even though they have a valid auth session.

---

### 3. Login Function (`login`, lines 224-279)

**Purpose**: Authenticates a user with email and password.

**Flow**:

1. **Clear Stale Sessions** (lines 228-234):
   - Checks for existing session via `getSession()`
   - If session exists: calls `signOut()` to clear it
   - Waits 100ms for signout to complete
   - **Why**: Prevents conflicts when re-logging in after closing a tab (stale session issue)

2. **Attempt Login** (lines 237-240):
   - Calls `supabase.auth.signInWithPassword({ email, password })`
   - This is a Supabase method that validates credentials and creates a session

3. **Handle Response** (lines 242-273):
   - If error: throws error with message
   - If success: fetches user profile from `profiles` table
   - If profile not found (PGRST116 error code): throws "User profile not found" error
   - If profile found: creates User object and sets it in state
   - Shows success toast

**Potential Issues**:
- The 100ms wait might not be enough for signout to complete in all cases
- If profile fetch fails for any reason other than "not found", user is logged in to Supabase but app state shows them as logged out
- No retry logic if profile fetch fails due to network issues

---

### 4. Signup Function (`signup`, lines 281-317)

**Purpose**: Creates a new user account.

**Flow**:

1. **Create Auth User** (lines 283-286):
   - Calls `supabase.auth.signUp({ email, password })`
   - This creates a user in Supabase's `auth.users` table
   - Supabase sends a confirmation email (if email confirmation is enabled)

2. **Create Profile** (lines 294-304):
   - Inserts a row into `profiles` table with:
     - `id`: The user ID from auth (foreign key to auth.users)
     - `name`: User's full name
     - `hotel_name`: User's hotel name
   - **Why**: The app needs additional user data beyond what Supabase Auth provides

3. **Handle Response**:
   - Shows success toast
   - Does NOT redirect or log user in
   - **Why**: User must confirm email before they can log in (if email confirmation is enabled)

**Potential Issues**:
- If profile creation fails, user exists in auth.users but not in profiles table
- This creates orphaned auth users
- No transaction/rollback - if profile insert fails, auth user is still created
- If email confirmation is disabled in Supabase, user is created but never logged in

---

### 5. Logout Function (`logout`, lines 319-356)

**Purpose**: Signs out the current user and clears all auth data.

**Flow**:

1. **Clear User State Immediately** (line 322):
   - Sets `user = null` before calling signOut
   - **Why**: Prevents UI flicker - user sees logged out state immediately

2. **Call Supabase SignOut** (line 324):
   - Calls `supabase.auth.signOut()`
   - This clears the session on Supabase's side

3. **Clear Local Storage** (lines 330-344):
   - Loops through all localStorage keys
   - Removes any key containing "supabase", "auth", or starting with "sb-"
   - Also clears sessionStorage with same pattern
   - **Why**: Ensures no stale auth data remains in browser storage

4. **Handle Errors**:
   - Even if signOut fails, still clears local state
   - **Why**: User should be logged out from app perspective even if Supabase call fails

**Potential Issues**:
- Clearing ALL keys containing "supabase" might remove non-auth data
- No verification that storage was actually cleared
- If signOut fails, user might still have valid session on Supabase side

---

### 6. Forgot Password Function (`forgotPassword`, lines 358-375)

**Purpose**: Sends password reset email to user.

**Flow**:

1. **Call Supabase Reset** (lines 360-362):
   - Calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: ... })`
   - Supabase sends email with reset link
   - Link redirects to `/auth/reset` page

2. **Handle Response**:
   - Shows success toast
   - **Why**: User needs feedback that email was sent

**Potential Issues**:
- No validation that email exists before sending
- If email doesn't exist, Supabase still returns success (security best practice)
- User might not know if email was actually sent or if they entered wrong email

---

### 7. Reset Password Function (`resetPassword`, lines 377-392)

**Purpose**: Updates user's password after they click reset link.

**Flow**:

1. **Update Password** (line 379):
   - Calls `supabase.auth.updateUser({ password })`
   - This only works if user has a valid reset token (from email link)

2. **Handle Response**:
   - Shows success toast
   - **Why**: User needs confirmation password was changed

**Potential Issues**:
- No redirect after password reset
- User might not know what to do next
- If token is expired, error message might not be clear

---

### 8. AuthGuard Component (`components/auth/AuthGuard.tsx`)

**Purpose**: Protects routes by redirecting unauthenticated users to login page.

**Flow**:

1. **Get Auth State** (line 20):
   - Uses `useAuth()` hook to get `isAuthenticated` and `isInitializing`

2. **Redirect Logic** (lines 23-27):
   - If not initializing AND not authenticated: redirects to `/auth`
   - **Why**: Only redirect after we know for sure user is not authenticated

3. **Loading State** (lines 29-38):
   - If initializing: shows loading spinner
   - **Why**: Prevents flash of protected content before auth check completes

4. **Render Children** (line 44):
   - If authenticated: renders children (protected content)
   - If not authenticated: returns null (redirect will happen)

**Potential Issues**:
- If `isInitializing` gets stuck as `true`, user sees infinite loading
- Redirect happens in useEffect, so there's a brief moment where protected content might render
- No way to customize redirect URL per route

---

### 9. Auth Page (`app/(public)/auth/page.tsx`)

**Purpose**: UI for login and signup forms.

**Flow**:

1. **Get Auth State** (line 27):
   - Uses `useAuth()` to get login function and auth state

2. **Redirect if Authenticated** (lines 39-52):
   - If authenticated: redirects to `/dashboard`
   - **Why**: Don't show login page to already-logged-in users

3. **Loading State with Timeout** (lines 72-95):
   - If `isInitializing` is true: shows loading spinner
   - BUT: Has 2-second timeout that allows form to render anyway
   - **Why**: Prevents infinite loading if auth initialization hangs

4. **Login Form Handler** (lines 102-117):
   - Validates form with Zod schema
   - Calls `login()` function from context
   - On success: redirects to `/dashboard`
   - On error: shows error message

5. **Signup Form Handler** (lines 119-131):
   - Validates form with Zod schema
   - Calls `signup()` function from context
   - On success: shows email confirmation message
   - On error: shows error message

**Form Submission** (lines 229-243):
- Custom onSubmit handler that:
  - Prevents default form submission
  - Calls `loginForm.handleSubmit()` with success/error callbacks
  - Logs extensively for debugging
  - **Why**: Need to handle validation errors and show them to user

**Potential Issues**:
- The 2-second timeout might not be enough in slow networks
- Form validation errors might not be visible if Zod validation fails silently
- Button has onClick handler that triggers validation, which might conflict with form onSubmit
- If login succeeds but redirect fails, user is logged in but still on auth page

---

## Complete Authentication Flow

### New User Signup Flow:

1. User fills out signup form (email, password, name, hotel name)
2. Form validates with Zod schema
3. `handleSignup` calls `signup()` function
4. `signup()` calls `supabase.auth.signUp()` - creates user in auth.users
5. `signup()` inserts profile into profiles table
6. Success toast shown, email confirmation message displayed
7. User receives confirmation email (if enabled)
8. User clicks confirmation link
9. Supabase validates token, activates account
10. User redirected back to app (via `detectSessionInUrl`)
11. `onAuthStateChange` fires with SIGNED_IN event
12. AuthContext fetches profile, sets user state
13. User is now logged in

### Existing User Login Flow:

1. User fills out login form (email, password)
2. Form validates with Zod schema
3. `handleLogin` calls `login()` function
4. `login()` checks for existing session, clears it if found
5. `login()` calls `supabase.auth.signInWithPassword()`
6. Supabase validates credentials, creates session
7. Session saved to localStorage (via `persistSession: true`)
8. `onAuthStateChange` fires with SIGNED_IN event
9. AuthContext fetches profile from profiles table
10. User state set in context
11. `handleLogin` redirects to `/dashboard`
12. AuthGuard checks auth state, allows access
13. User sees dashboard

### Page Refresh Flow:

1. User refreshes page while logged in
2. Supabase client initializes, reads session from localStorage
3. `onAuthStateChange` fires with INITIAL_SESSION event
4. AuthContext's `checkSession()` also runs, finds session
5. INITIAL_SESSION handler double-checks session is valid
6. INITIAL_SESSION handler fetches profile
7. User state set in context
8. `isInitializing` set to false
9. AuthGuard sees user is authenticated, allows access
10. User stays logged in

### Logout Flow:

1. User clicks logout button
2. Calls `logout()` function
3. User state immediately set to null (UI updates)
4. `supabase.auth.signOut()` called
5. Session cleared on Supabase side
6. All localStorage/sessionStorage keys containing "supabase" or "auth" cleared
7. Success toast shown
8. User redirected to home or auth page (depending on implementation)

---

## Critical Issues and Potential Problems

### 1. Race Conditions

**Problem**: Multiple async operations happening simultaneously:
- `checkSession()` runs immediately
- `onAuthStateChange` listener fires
- Both might try to set user state at the same time
- INITIAL_SESSION handler calls `getSession()` again, which could trigger another event

**Impact**: User state might flicker or be set incorrectly

**Solution Needed**: Better coordination between these operations, or remove redundant `checkSession()` call

### 2. Profile Not Found Errors

**Problem**: If user exists in `auth.users` but not in `profiles` table:
- Login succeeds in Supabase
- Profile fetch fails
- User state set to null
- User is logged in to Supabase but app thinks they're logged out

**Impact**: User can't access app even though they have valid credentials

**Solution Needed**: Better error handling, or auto-create profile if missing

### 3. Stale Session Handling

**Problem**: When user closes tab and reopens:
- Old session might still be in localStorage
- Login function clears it, but timing might be off
- 100ms wait might not be enough

**Impact**: Login might fail or behave unpredictably

**Solution Needed**: More robust session clearing, or don't clear before login (let Supabase handle it)

### 4. Infinite Loading States

**Problem**: If `isInitializing` never becomes false:
- AuthGuard shows infinite loading
- Auth page shows infinite loading (though has 2s timeout)
- User can't interact with app

**Impact**: App becomes unusable

**Solution Needed**: More aggressive timeouts, or better error handling in initialization

### 5. Multiple Supabase Client Instances

**Problem**: Guest pages create separate Supabase client
- Could cause conflicts with main client
- Already fixed with `supabaseGuestClient`, but need to ensure it's used everywhere

**Impact**: Auth state might not sync properly

**Solution Needed**: Ensure all guest pages use guest client, not main client

### 6. Form Submission Not Working

**Problem**: Sign-in button not triggering form submission in production
- Custom onSubmit handler might be preventing default behavior
- Button onClick might be interfering
- Form validation might be failing silently

**Impact**: Users can't log in

**Solution Needed**: Simplify form submission, remove conflicting handlers, ensure validation errors are visible

### 7. Session Expiration Edge Cases

**Problem**: Session expiration checked in multiple places:
- In `checkSession()`
- In `onAuthStateChange` handler
- But timing might be off - session could expire between checks

**Impact**: User might see authenticated state briefly after session expires

**Solution Needed**: More consistent expiration checking, or rely on Supabase's auto-refresh

### 8. Error Message Clarity

**Problem**: Many error messages are generic:
- "Login failed. Please try again." - doesn't say why
- "Failed to fetch user profile" - user doesn't know what this means
- Profile not found errors might confuse users

**Impact**: Users don't know how to fix issues

**Solution Needed**: More specific error messages, user-friendly language

---

## Recommendations for Fixes

1. **Simplify Initialization**: Remove redundant `checkSession()` call, rely only on `onAuthStateChange`
2. **Better Error Handling**: Add try-catch around all async operations, provide specific error messages
3. **Profile Auto-Creation**: If profile doesn't exist during login, create it with default values
4. **Remove Conflicting Handlers**: Simplify form submission, remove button onClick that triggers validation
5. **Add Retry Logic**: If profile fetch fails due to network, retry a few times
6. **Better Timeout Handling**: Increase timeouts, add exponential backoff
7. **Session Validation**: Add middleware to validate session on every protected route access
8. **Clearer State Management**: Use a state machine or reducer to manage auth state more predictably

---

## Testing Checklist

- [ ] New user signup creates both auth user and profile
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Login after closing tab works (stale session handling)
- [ ] Page refresh maintains login state
- [ ] Logout clears all auth data
- [ ] Protected routes redirect to login when not authenticated
- [ ] Auth page redirects to dashboard when already authenticated
- [ ] Profile not found error is handled gracefully
- [ ] Session expiration is detected and handled
- [ ] Form validation errors are visible to user
- [ ] Network errors during auth operations are handled
- [ ] Multiple tabs maintain consistent auth state
- [ ] Guest pages don't interfere with auth state

---

## Conclusion

The authentication system is functional but has several edge cases and potential race conditions that could cause issues in production. The main problems are:

1. Complex initialization with multiple async operations
2. Profile table dependency (if profile missing, user can't use app)
3. Stale session handling timing issues
4. Form submission complexity causing production issues
5. Error handling that doesn't provide clear feedback

The system would benefit from simplification and more robust error handling.

