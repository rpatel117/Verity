# Debugging Guide

## Overview

This guide covers debugging tools, common issues, and troubleshooting procedures for the hotel check-in application.

## Development Tools

### Browser Console Helpers

These functions are available in development mode:

```javascript
// Check current authentication state
window.checkAuthState()
// Returns: { session, user, isAuthenticated }

// Clear all authentication data (nuclear option)
window.nuclearAuthClear()
// Clears: localStorage, sessionStorage, cookies, auth tokens

// Force logout and redirect
window.forceLogout()
// Signs out and redirects to landing page

// Clear auth state and reload
window.clearAuthState()
// Clears auth data and reloads page
```

### Console Logging

Enhanced logging is available in development mode:

```
🔄 Auth state change: SIGNED_IN user@example.com
🔍 AuthContext state: { user: true, isAuthenticated: true, isInitializing: false }
🏠 LandingPage state: { isAuthenticated: false, isInitializing: true }
🔍 Storage getItem: sb-rusqnjonwtgzcccyhjze-auth-token exists
⏰ Auth initialization timeout - forcing isInitializing to false
```

### Network Tab Debugging

Check the Network tab for:

- **API calls**: Verify `verifyAttestationCode` is being called
- **Response codes**: 200 (success), 401 (unauthorized), 500 (server error)
- **Response times**: Should be under 5 seconds
- **Request payload**: Verify data being sent

## Common Issues

### 1. Authentication Issues

#### "useAuth must be used within an AuthProvider"

**Symptoms**: Error in console, app crashes

**Cause**: Component using `useAuth()` is not wrapped in `AuthProvider`

**Solution**:
```typescript
// Ensure AuthProvider is in root layout
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### "Rendered fewer hooks than expected"

**Symptoms**: React hooks error, component crashes

**Cause**: Hooks are being called conditionally

**Solution**:
```typescript
// ❌ Bad: Hooks after conditional return
export default function MyComponent() {
  if (condition) {
    return <div>Loading</div>
  }
  
  const [state, setState] = useState() // ❌ Conditional hook
}

// ✅ Good: All hooks at the top
export default function MyComponent() {
  const [state, setState] = useState() // ✅ Always called
  
  if (condition) {
    return <div>Loading</div>
  }
}
```

#### Infinite Loading State

**Symptoms**: Loading spinner never stops, app doesn't load

**Cause**: `isInitializing` stuck at `true`

**Solutions**:
1. **Wait for timeout**: 1-second timeout should force `isInitializing = false`
2. **Manual override**: Click "Force Show Landing Page" button
3. **Console clear**: Use `window.nuclearAuthClear()` in console
4. **Check logs**: Look for timeout messages in console

#### Auto-login in Incognito Mode

**Symptoms**: Incognito window automatically logs in as test user

**Cause**: Cached session data or aggressive session clearing

**Solutions**:
1. **Nuclear clear**: `window.nuclearAuthClear()` in console
2. **Check localStorage**: Look for auth tokens in Application tab
3. **Verify session**: Check Supabase logs for session activity
4. **Clean restart**: `npm run dev:clean`

### 2. Verification Flow Issues

#### Code Mismatch

**Symptoms**: Correct code fails verification

**Cause**: Hash mismatch between code generation and verification

**Debug Steps**:
1. Check console for generated code in `send_attestation_sms_fixed`
2. Verify `guest_confirm` doesn't regenerate codes
3. Check database `code_hash` field
4. Test with `117001` (test code)

**Solution**: Ensure `guest_confirm` only logs policy acceptance, doesn't update hash

#### UI Stuck in Loading

**Symptoms**: Verification form stuck in loading state

**Cause**: API call timeout or error not handled

**Debug Steps**:
1. Check Network tab for API calls
2. Look for timeout errors in console
3. Verify `finally` block executes
4. Check API response format

**Solution**: 
```typescript
// Ensure finally block always executes
try {
  await verifyCode()
} catch (error) {
  setError(error.message)
} finally {
  setIsLoading(false) // Always execute
}
```

#### Double Function Calls

**Symptoms**: SMS sent twice, duplicate API calls

**Cause**: Form submission called multiple times

**Debug Steps**:
1. Check console for duplicate logs
2. Look for React StrictMode warnings
3. Verify form submission guards
4. Check for duplicate event handlers

**Solution**:
```typescript
// Add submission guard
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async () => {
  if (isSubmitting) return // Prevent double submission
  
  setIsSubmitting(true)
  try {
    await submitForm()
  } finally {
    setIsSubmitting(false)
  }
}
```

### 3. Network Issues

#### API Calls Not Firing

**Symptoms**: No network activity in Network tab

**Cause**: Form validation failing or early returns

**Debug Steps**:
1. Check form validation errors
2. Look for early returns in code
3. Verify API function is called
4. Check console for errors

**Solution**: Add logging to trace execution
```typescript
console.log('Form submitted:', data)
console.log('Calling API...')
const result = await apiCall(data)
console.log('API result:', result)
```

#### Timeout Errors

**Symptoms**: API calls timeout after 5 seconds

**Cause**: Slow network or server issues

**Solutions**:
1. Check network connection
2. Verify server status
3. Increase timeout if needed
4. Add retry logic

#### 401/403 Errors

**Symptoms**: Unauthorized errors in Network tab

**Cause**: Authentication issues

**Solutions**:
1. Check auth state: `window.checkAuthState()`
2. Verify session is valid
3. Clear auth data: `window.nuclearAuthClear()`
4. Re-login if needed

## Debugging Procedures

### 1. Authentication Debugging

```bash
# 1. Check auth state
window.checkAuthState()

# 2. Clear if needed
window.nuclearAuthClear()

# 3. Check console logs
# Look for: 🔄 Auth state change, 🔍 AuthContext state

# 4. Test in incognito
# Should show landing page, not auto-login
```

### 2. Verification Debugging

```bash
# 1. Check generated code
# Look in console for: [DEV MODE] Code: XXXXXX

# 2. Verify API calls
# Check Network tab for verifyAttestationCode calls

# 3. Test with 117001
# Should bypass API and show success

# 4. Check database
# Verify code_hash matches generated code
```

### 3. Performance Debugging

```bash
# 1. Check loading times
# Look for timeout messages: ⏰ Auth initialization timeout

# 2. Monitor API calls
# Check response times in Network tab

# 3. Check memory usage
# Look for memory leaks in DevTools

# 4. Test on slow network
# Use Chrome DevTools Network throttling
```

## Development Environment

### Clean Development Setup

```bash
# Clean build and restart
npm run dev:clean

# Or manual clean
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Environment Variables

```env
# Required for development
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Optional for debugging
NODE_ENV=development
DEBUG=true
```

### Browser DevTools

#### Application Tab
- **Local Storage**: Check for auth tokens
- **Session Storage**: Check for temporary data
- **Cookies**: Check for session cookies

#### Network Tab
- **API Calls**: Monitor all network requests
- **Response Times**: Check for slow requests
- **Status Codes**: Verify success/error responses

#### Console Tab
- **Logs**: Check for error messages
- **Warnings**: Look for React warnings
- **Debug Info**: Use development helpers

## Production Debugging

### Error Monitoring

```typescript
// Add error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
    // Send to monitoring service
  }
}
```

### Logging

```typescript
// Add production logging
const logError = (error, context) => {
  console.error('Error:', error, 'Context:', context)
  // Send to logging service
}
```

### Performance Monitoring

```typescript
// Monitor performance
const measurePerformance = (name, fn) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
  return result
}
```

## Best Practices

### Debugging Checklist

- [ ] Check console for errors
- [ ] Verify network requests
- [ ] Test in incognito mode
- [ ] Use development helpers
- [ ] Check authentication state
- [ ] Verify hooks order
- [ ] Test error scenarios
- [ ] Monitor performance

### Prevention

- **Code Reviews**: Check for hooks violations
- **Testing**: Test authentication flows
- **Monitoring**: Watch for errors in production
- **Documentation**: Keep debugging guides updated

## Getting Help

### When to Ask for Help

- Authentication issues persist after debugging
- Verification flow completely broken
- Performance issues affecting users
- Security concerns identified

### Information to Provide

- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Console logs**
- **Network requests**
- **Browser/OS information**
- **Screenshots if applicable**

### Escalation Process

1. **Self-debug**: Use this guide and tools
2. **Team help**: Ask development team
3. **Expert help**: Contact senior developers
4. **Emergency**: Contact on-call support


