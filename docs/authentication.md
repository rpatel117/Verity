# Authentication System Documentation

## Overview

This document covers the complete authentication system implementation, including fixes for persistent authentication issues, debugging tools, and troubleshooting guides.

## Architecture

### Core Components

1. **AuthContext** (`components/auth/AuthContext.tsx`) - Central authentication state management
2. **AuthGuard** (`components/auth/AuthGuard.tsx`) - Route protection for authenticated users
3. **Supabase Client** (`lib/supabaseClient.ts`) - Supabase authentication configuration
4. **Auth Pages** - Login/signup forms and landing page

### Authentication Flow

```
User visits app → AuthContext initializes → Check for existing session → 
If authenticated: Redirect to dashboard → If not: Show landing page
```

## Recent Fixes Applied

### 1. Hooks Order Issues (CRITICAL FIX)

**Problem**: React hooks were being called conditionally, violating the Rules of Hooks.

**Files Fixed**:
- `app/(public)/auth/page.tsx` - Moved `useForm` hooks before conditional returns
- `components/auth/AuthContext.tsx` - Removed conflicting `useEffect` hooks

**Solution**: All hooks must be called at the top of components, before any conditional returns.

### 2. Authentication State Management

**Problem**: `isInitializing` state was getting stuck at `true`, causing infinite loading.

**Files Fixed**:
- `components/auth/AuthContext.tsx` - Added timeout fallback (1 second)
- `app/page.tsx` - Added manual override button for stuck states

**Solution**: 
- Timeout forces `isInitializing = false` after 1 second
- Manual override button allows users to force show landing page
- Enhanced debugging with comprehensive logging

### 3. Session Persistence Issues

**Problem**: Users were being automatically logged in even in incognito mode.

**Files Fixed**:
- `lib/supabaseClient.ts` - Removed problematic automatic session clearing
- `components/auth/AuthContext.tsx` - Simplified auth state management

**Solution**: Clean auth flow without aggressive session clearing that was causing conflicts.

## Debugging Tools

### Development Helpers

The following global functions are available in development mode:

```javascript
// Check current authentication state
window.checkAuthState()

// Clear all authentication data (nuclear option)
window.nuclearAuthClear()

// Force logout and redirect
window.forceLogout()

// Clear auth state and reload
window.clearAuthState()
```

### Console Logging

Enhanced logging is available in development mode:

- **AuthContext logs**: `🔄 Auth state change:`, `🔍 AuthContext state:`
- **LandingPage logs**: `🏠 LandingPage state:`
- **Supabase logs**: `🔍 Storage getItem/setItem/removeItem:`
- **Timeout logs**: `⏰ Auth initialization timeout`

### Manual Override

If the app gets stuck in loading state:

1. Look for the "Force Show Landing Page" button
2. Click it to reload the page
3. Check browser console for detailed logs

## File Structure

```
components/auth/
├── AuthContext.tsx          # Central auth state management
├── AuthGuard.tsx           # Route protection
└── LoginModal.tsx          # Modal login form

app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Landing page with auth redirects
├── (public)/
│   ├── layout.tsx          # Public layout (no AuthProvider)
│   └── auth/page.tsx       # Auth page with login/signup forms
└── (protected)/
    └── dashboard/
        └── layout.tsx      # Protected layout with AuthGuard

lib/
└── supabaseClient.ts       # Supabase configuration and debug tools
```

## Configuration

### Supabase Client Setup

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    debug: process.env.NODE_ENV === 'development',
  },
})
```

### Development Mode Features

- **Debug logging**: All storage operations logged
- **Global helpers**: `window.nuclearAuthClear()`, `window.checkAuthState()`
- **Timeout fallback**: 1-second timeout to prevent infinite loading
- **Manual override**: Button to force show landing page

## Troubleshooting Guide

### Common Issues

#### 1. "useAuth must be used within an AuthProvider"

**Cause**: Component using `useAuth()` is not wrapped in `AuthProvider`

**Solution**: Ensure `AuthProvider` is in the root layout (`app/layout.tsx`)

#### 2. "Rendered fewer hooks than expected"

**Cause**: Hooks are being called conditionally

**Solution**: Move all hooks to the top of components, before any conditional returns

#### 3. Infinite loading state

**Cause**: `isInitializing` stuck at `true`

**Solution**: 
- Wait 1 second for timeout fallback
- Click "Force Show Landing Page" button
- Check console for timeout logs

#### 4. Automatic login in incognito mode

**Cause**: Cached session data or aggressive session clearing

**Solution**: 
- Use `window.nuclearAuthClear()` in console
- Check for cached localStorage data
- Verify no session exists in Supabase logs

### Debugging Steps

1. **Check console logs** for authentication state
2. **Use development helpers** to inspect/clear auth state
3. **Verify hooks order** in components
4. **Test in incognito mode** to ensure clean state
5. **Check Supabase logs** for session activity

### Clean Development Setup

```bash
# Clean build and restart
npm run dev:clean

# Or manual clean
rm -rf .next
npm run dev
```

## Best Practices

### Component Structure

```typescript
export default function MyComponent() {
  // 1. All hooks at the top
  const { isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()
  const [state, setState] = useState()
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 3. Conditional returns AFTER all hooks
  if (isInitializing) {
    return <Loading />
  }
  
  if (isAuthenticated) {
    return null // Will redirect
  }
  
  // 4. Component JSX
  return <div>Content</div>
}
```

### Authentication Checks

```typescript
// ✅ Good: Check both states
if (!isInitializing && isAuthenticated) {
  router.push('/dashboard')
}

// ❌ Bad: Only check one state
if (isAuthenticated) {
  router.push('/dashboard')
}
```

### Error Handling

```typescript
// ✅ Good: Always reset loading state
try {
  await authAction()
} catch (error) {
  setError(error.message)
} finally {
  setIsLoading(false) // Always execute
}
```

## Testing

### Manual Testing Checklist

- [ ] Landing page loads without authentication
- [ ] Login form works correctly
- [ ] Successful login redirects to dashboard
- [ ] Incognito mode shows landing page (not auto-login)
- [ ] Logout clears all auth state
- [ ] Protected routes redirect unauthenticated users
- [ ] No hooks order errors in console
- [ ] No infinite loading states

### Automated Testing

```bash
# Run development server
npm run dev

# Test in incognito mode
# Open http://localhost:3000 in incognito window
# Should show landing page, not auto-login
```

## Deployment Notes

### Production Considerations

- Remove debug logging in production
- Remove global helper functions
- Ensure proper error boundaries
- Test authentication flow thoroughly

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

## Related Documentation

- [Verification Code Flow](./verification-flow.md) - Guest verification system
- [API Documentation](./api.md) - Backend API endpoints
- [Database Schema](./database.md) - Database structure and relationships


