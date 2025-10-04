# Hotel Check-In App - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [File Structure Explained](#file-structure-explained)
4. [Backend Integration](#backend-integration)
5. [Security Implementation](#security-implementation)
6. [Extension Guide](#extension-guide)

---

## Architecture Overview

### System Components

\`\`\`
┌─────────────┐
│   Mobile    │
│   Client    │
│  (React     │
│   Native)   │
└──────┬──────┘
       │
       │ HTTPS/JWT
       │
┌──────▼──────────────────────────────────┐
│         Supabase Backend                │
│  ┌────────────┐      ┌──────────────┐  │
│  │ PostgreSQL │◄────►│ Edge         │  │
│  │ Database   │      │ Functions    │  │
│  └────────────┘      └──────┬───────┘  │
│                             │           │
└─────────────────────────────┼───────────┘
                              │
                              │ HTTPS
                              │
                      ┌───────▼────────┐
                      │  Twilio API    │
                      │  (SMS Service) │
                      └────────────────┘
\`\`\`

### Technology Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: JWT tokens with automatic refresh
- **SMS**: Twilio (via Supabase Edge Functions)
- **Storage**: Expo SecureStore (encrypted device storage)

---

## Data Flow

### Complete Check-In Flow

\`\`\`
1. OWNER ENTERS GUEST INFO
   ┌─────────────────────────────────────────┐
   │ app/index.tsx (OwnerReservationScreen)  │
   │ - Validates input (validation.ts)       │
   │ - Sanitizes data                        │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ src/services/sms.ts                     │
   │ - sendVerificationSms()                 │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ Supabase Edge Function: send-sms        │
   │ - Generates 6-digit code                │
   │ - Creates check_ins record              │
   │ - Calls Twilio API                      │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ Twilio SMS                              │
   │ - Sends code to guest's phone           │
   │ - Includes privacy policy link          │
   └─────────────────────────────────────────┘

2. GUEST RECEIVES SMS & SHARES CODE

3. STAFF ENTERS CODE
   ┌─────────────────────────────────────────┐
   │ app/code-verification.tsx               │
   │ - Shows policy modal                    │
   │ - Validates code format                 │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ src/services/sms.ts                     │
   │ - verifyCode()                          │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ Supabase Edge Function: verify-code     │
   │ - Checks code against database          │
   │ - Updates check_ins.verified = true     │
   │ - Logs verification event               │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ app/confirmation.tsx                    │
   │ - Shows success message                 │
   │ - Displays check-in ID                  │
   └─────────────────────────────────────────┘
\`\`\`

### JWT Token Flow

\`\`\`
1. USER AUTHENTICATES
   ┌─────────────────────────────────────────┐
   │ src/context/AuthContext.tsx             │
   │ - signIn(email, password)               │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ Supabase Auth                           │
   │ - Validates credentials                 │
   │ - Returns access_token + refresh_token  │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ src/services/auth.ts                    │
   │ - storeTokens() → SecureStore           │
   │ - Stores: token, refresh_token, expiry  │
   └─────────────────────────────────────────┘

2. API CALLS WITH TOKEN
   ┌─────────────────────────────────────────┐
   │ Any API call                            │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ src/services/auth.ts                    │
   │ - getToken()                            │
   │ - Checks expiry                         │
   │ - Auto-refreshes if needed              │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ API Request                             │
   │ - Headers: Authorization: Bearer <token>│
   └─────────────────────────────────────────┘

3. TOKEN REFRESH (Automatic)
   ┌─────────────────────────────────────────┐
   │ Token expires in < 5 minutes            │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ src/services/auth.ts                    │
   │ - refreshToken()                        │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ Supabase Auth                           │
   │ - Validates refresh_token               │
   │ - Returns new access_token              │
   └────────────┬────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────┐
   │ src/services/auth.ts                    │
   │ - storeTokens() → Updates SecureStore   │
   └─────────────────────────────────────────┘
\`\`\`

---

## File Structure Explained

### Frontend Files

#### **app/** - Screens (Expo Router)

- **`_layout.tsx`**: Root layout component
  - Sets up navigation stack
  - Wraps app with AuthProvider
  - Configures screen options (headers, transitions)

- **`index.tsx`**: Owner reservation screen
  - Form for entering guest information
  - Validates credit card last 4, driver's license, phone
  - Calls `sendVerificationSms()` service
  - Navigates to code verification on success

- **`privacy-policy.tsx`**: Privacy policy display
  - Shows full privacy policy text
  - Accessible via SMS link or in-app
  - Explains data collection and usage

- **`code-verification.tsx`**: Code entry screen
  - Input for 6-digit SMS code
  - Privacy policy acceptance modal
  - Calls `verifyCode()` service
  - Navigates to confirmation on success

- **`confirmation.tsx`**: Success screen
  - Shows check-in completion message
  - Displays check-in ID and timestamp
  - Option to start new check-in

#### **src/components/** - Reusable UI

- **`Button.tsx`**: Primary/secondary button
  - Variants: primary (filled), secondary (outlined)
  - Loading state with spinner
  - Disabled state
  - Full-width option

- **`InputField.tsx`**: Form input component
  - Label with uppercase styling
  - Error message display
  - Helper text support
  - Consistent styling across forms

- **`Loader.tsx`**: Loading indicator
  - Full-screen loading overlay
  - Optional message display
  - Used during async operations

- **`PolicyModal.tsx`**: Privacy policy modal
  - Scrollable policy content
  - Checkbox for acceptance
  - Accept/decline actions
  - Prevents check-in without acceptance

#### **src/services/** - Backend Integration

- **`supabaseClient.ts`**: Supabase setup
  - Initializes Supabase client
  - Configures AsyncStorage for session persistence
  - Defines TypeScript interfaces for database tables
  - Exports client for use throughout app

- **`auth.ts`**: JWT token management
  - `storeTokens()`: Saves tokens to SecureStore
  - `getToken()`: Retrieves token, auto-refreshes if needed
  - `refreshToken()`: Refreshes expired tokens
  - `isTokenValid()`: Checks token expiration
  - `clearTokens()`: Removes all tokens (logout)
  - `getAuthHeaders()`: Creates Authorization header

- **`sms.ts`**: SMS operations
  - `sendVerificationSms()`: Sends code via Twilio
  - `verifyCode()`: Validates code against database
  - `logPolicyAcceptance()`: Records policy acceptance
  - All operations call Supabase Edge Functions

#### **src/context/** - Global State

- **`AuthContext.tsx`**: Authentication state
  - Manages user session
  - Provides `signIn()`, `signOut()` methods
  - Listens for auth state changes
  - Auto-stores tokens on login
  - Exports `useAuth()` hook

#### **src/utils/** - Utilities

- **`validation.ts`**: Input validation
  - `validateCreditCardLast4()`: Checks 4 digits
  - `validateDriversLicense()`: Checks alphanumeric, length
  - `validatePhoneNumber()`: Checks min 10 digits
  - `formatPhoneNumber()`: Converts to E.164 format
  - `validateSmsCode()`: Checks 6 digits
  - `sanitizeInput()`: Removes dangerous characters

- **`constants.ts`**: App constants
  - Validation rules (lengths, formats)
  - Error messages
  - Success messages
  - Route paths

#### **src/styles/** - Design System

- **`colors.ts`**: Color palette
  - Primary: Deep forest green (#1B4332)
  - Accent: Warm coral (#D4745E)
  - Neutrals: Warm grays and off-whites
  - Semantic colors: success, error, warning, info

- **`typography.ts`**: Font system
  - Font families: System (sans), Georgia (serif)
  - Font sizes: xs to 4xl
  - Font weights: normal to bold
  - Line heights: tight, normal, relaxed

### Backend Files

#### **backend/** - Supabase Code

- **`schema.sql`**: Database schema
  - Creates `check_ins` table
  - Creates `verification_logs` table
  - Sets up Row-Level Security (RLS) policies
  - Creates indexes for performance

- **`seed.sql`**: Sample data (optional)
  - Inserts test check-in records
  - Useful for development/testing

- **`send-sms.ts`**: Edge function
  - Generates 6-digit verification code
  - Creates check_ins record in database
  - Sends SMS via Twilio API
  - Includes privacy policy link in SMS
  - Returns check_in_id to client

- **`verify-code.ts`**: Edge function
  - Validates code against database
  - Checks rate limiting (max attempts)
  - Updates check_ins.verified = true
  - Logs verification event
  - Returns verification status

---

## Backend Integration

### Supabase Setup

#### Database Tables

**check_ins**
\`\`\`sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  credit_card_last_4 VARCHAR(4) NOT NULL,
  drivers_license VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  verification_code VARCHAR(6) NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  hotel_staff_id UUID REFERENCES auth.users(id)
);
\`\`\`

**verification_logs**
\`\`\`sql
CREATE TABLE verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  metadata JSONB
);
\`\`\`

#### Row-Level Security (RLS) Policies

**check_ins table:**
- INSERT: Authenticated users can create check-ins
- SELECT: Users can only view their own check-ins
- UPDATE: Users can only update their own check-ins

**verification_logs table:**
- INSERT: Authenticated users can create logs
- SELECT: Users can only view logs for their check-ins

### Twilio Integration

#### SMS Format

\`\`\`
Your hotel check-in verification code is: 123456

By sharing this code, you confirm your presence and agree to our privacy policy: https://yourhotel.com/privacy

This code expires in 10 minutes.
\`\`\`

#### Edge Function: send-sms

**Input:**
\`\`\`typescript
{
  phone_number: string,      // E.164 format: +1234567890
  credit_card_last_4: string, // Last 4 digits
  drivers_license: string     // Full license number
}
\`\`\`

**Output:**
\`\`\`typescript
{
  check_in_id: string,  // UUID of created check-in
  success: boolean,
  message: string
}
\`\`\`

**Implementation Notes:**
- Generate random 6-digit code
- Store code in database (hashed recommended)
- Set expiration time (10 minutes)
- Send SMS via Twilio
- Return check_in_id for verification step

#### Edge Function: verify-code

**Input:**
\`\`\`typescript
{
  check_in_id: string,  // UUID from send-sms
  code: string          // 6-digit code from SMS
}
\`\`\`

**Output:**
\`\`\`typescript
{
  verified: boolean,
  success: boolean,
  message: string
}
\`\`\`

**Implementation Notes:**
- Check code against database
- Verify code hasn't expired
- Implement rate limiting (max 3-5 attempts)
- Update verified status on success
- Log verification event

---

## Security Implementation

### Input Validation

All user input is validated at multiple layers:

1. **Client-side** (src/utils/validation.ts)
   - Format validation (length, characters)
   - Immediate user feedback
   - Prevents invalid data from reaching backend

2. **Sanitization** (src/utils/validation.ts)
   - Removes HTML/script injection characters
   - Limits input length
   - Trims whitespace

3. **Backend validation** (Supabase Edge Functions)
   - Re-validates all inputs
   - Checks against database constraints
   - Rate limiting on sensitive operations

### JWT Token Security

- **Storage**: Tokens stored in Expo SecureStore (encrypted)
- **Expiration**: Tokens expire after 1 hour
- **Refresh**: Automatic refresh when < 5 minutes remaining
- **Transmission**: Always sent via HTTPS with Authorization header
- **Invalidation**: Tokens cleared on logout or error

### Row-Level Security (RLS)

All database tables have RLS policies:

- Users can only access their own data
- Check-ins are tied to authenticated users
- Logs are only visible to check-in owners
- No direct database access without authentication

### Rate Limiting

Implemented on backend for:

- SMS sending: Max 3 per phone number per hour
- Code verification: Max 5 attempts per check-in
- API calls: General rate limiting per user

### Privacy Compliance

- Privacy policy acceptance is required
- Acceptance is logged with timestamp
- Guest data is encrypted at rest
- Data retention policies can be configured
- GDPR/CCPA compliance ready

---

## Extension Guide

### Adding Multi-Hotel Support

1. **Database Changes**
   \`\`\`sql
   CREATE TABLE hotels (
     id UUID PRIMARY KEY,
     name VARCHAR(255),
     settings JSONB
   );

   ALTER TABLE check_ins ADD COLUMN hotel_id UUID REFERENCES hotels(id);
   \`\`\`

2. **Update RLS Policies**
   - Filter check-ins by hotel_id
   - Ensure staff can only access their hotel's data

3. **UI Changes**
   - Add hotel selector to owner screen
   - Filter check-ins by selected hotel
   - Update confirmation screen with hotel name

### Adding Owner SSO (Single Sign-On)

1. **Supabase Auth Configuration**
   - Enable OAuth providers (Google, Microsoft, etc.)
   - Configure redirect URLs

2. **Update AuthContext**
   \`\`\`typescript
   const signInWithSSO = async (provider: 'google' | 'microsoft') => {
     const { data, error } = await supabase.auth.signInWithOAuth({
       provider,
       options: {
         redirectTo: 'hotelcheckin://auth/callback'
       }
     })
   }
   \`\`\`

3. **Add SSO Buttons**
   - Update login screen with provider buttons
   - Handle OAuth callback

### Adding Check-In History

1. **New Screen**: `app/history.tsx`
   \`\`\`typescript
   // List all check-ins with filters
   // Show verified/unverified status
   // Search by phone, license, date
   \`\`\`

2. **Database Query**
   \`\`\`typescript
   const { data } = await supabase
     .from('check_ins')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(50)
   \`\`\`

3. **UI Components**
   - List view with check-in cards
   - Filter controls
   - Export functionality

### Adding Email Notifications

1. **Supabase Edge Function**: `send-email.ts`
   - Use SendGrid or similar service
   - Send confirmation email to guest
   - Include check-in details

2. **Trigger on Verification**
   \`\`\`typescript
   // In verify-code edge function
   if (verified) {
     await sendConfirmationEmail({
       to: guestEmail,
       checkInId,
       hotelName
     })
   }
   \`\`\`

### Adding Analytics

1. **Track Events**
   \`\`\`typescript
   // In services/analytics.ts
   export const trackCheckIn = (checkInId: string) => {
     // Send to analytics service
   }
   \`\`\`

2. **Dashboard Screen**
   - Total check-ins per day/week/month
   - Average verification time
   - Success/failure rates
   - Most common errors

### Adding Offline Support

1. **Install Dependencies**
   \`\`\`bash
   npm install @react-native-async-storage/async-storage
   \`\`\`

2. **Queue Failed Requests**
   \`\`\`typescript
   // Store failed requests in AsyncStorage
   // Retry when connection restored
   \`\`\`

3. **Sync Strategy**
   - Queue check-ins when offline
   - Sync when connection restored
   - Show offline indicator in UI

---

## Assumptions & Integration Points

### Backend Assumptions

1. **Supabase Edge Functions Exist**
   - `send-sms`: Handles SMS sending via Twilio
   - `verify-code`: Validates codes and updates database

2. **Database Schema**
   - Tables: `check_ins`, `verification_logs`
   - RLS policies configured
   - Indexes on frequently queried columns

3. **Twilio Configuration**
   - Account SID, Auth Token, Phone Number set in Supabase secrets
   - SMS sending enabled for target countries
   - Sufficient account balance

4. **JWT Configuration**
   - Supabase Auth configured
   - Token expiration set to 1 hour
   - Refresh tokens enabled

### Frontend Integration Points

1. **Environment Variables**
   - All required variables in `.env`
   - Variables prefixed with `EXPO_PUBLIC_` for client access

2. **Navigation**
   - Expo Router handles all navigation
   - Deep linking configured for SMS links

3. **State Management**
   - AuthContext provides global auth state
   - Local state for form data

4. **Error Handling**
   - All API calls wrapped in try/catch
   - User-friendly error messages
   - Logging for debugging

---

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**
   - Expo Router automatically code-splits by route
   - Lazy load heavy components

2. **Image Optimization**
   - Use optimized image formats (WebP)
   - Implement lazy loading for images

3. **Database Queries**
   - Use indexes on frequently queried columns
   - Limit result sets with pagination
   - Cache frequently accessed data

4. **Token Management**
   - Minimize token refresh calls
   - Cache tokens in memory during session
   - Only refresh when necessary

### Monitoring

1. **Supabase Dashboard**
   - Monitor database performance
   - Track API usage
   - Review error logs

2. **Twilio Console**
   - Monitor SMS delivery rates
   - Track costs
   - Review failed messages

3. **Expo Analytics**
   - Track app crashes
   - Monitor performance metrics
   - User engagement data

---

## Testing Strategy

### Unit Tests

Test individual functions:
- Validation functions
- Token management
- Data formatting

### Integration Tests

Test component interactions:
- Form submission flow
- API calls with mocked responses
- Navigation between screens

### End-to-End Tests

Test complete user flows:
- Full check-in process
- Error handling
- Token refresh

### Manual Testing Checklist

- [ ] Enter valid guest information
- [ ] Receive SMS with code
- [ ] Enter correct code
- [ ] Complete check-in
- [ ] Enter invalid code (3 times)
- [ ] Test with expired code
- [ ] Test offline behavior
- [ ] Test token refresh
- [ ] Test privacy policy acceptance
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on web browser

---

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] Edge functions deployed
- [ ] RLS policies tested
- [ ] Twilio account configured
- [ ] Privacy policy URL updated
- [ ] App icons and splash screen added
- [ ] App store metadata prepared

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check SMS delivery rates
- [ ] Verify token refresh works
- [ ] Test on production devices
- [ ] Monitor database performance
- [ ] Set up alerts for errors
- [ ] Document any issues

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review error logs
   - Check SMS delivery rates
   - Monitor database size

2. **Monthly**
   - Update dependencies
   - Review security patches
   - Analyze usage patterns

3. **Quarterly**
   - Performance optimization
   - Feature planning
   - User feedback review

### Common Issues & Solutions

See README.md Troubleshooting section for common issues and solutions.

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
