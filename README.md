# Hotel Check-In App

A production-ready React Native application for secure hotel guest check-ins using two-factor authentication via SMS. Built with Expo, Supabase, and Twilio.

## Overview

This app streamlines the hotel check-in process by verifying guest identity through SMS verification codes. Hotel staff enter guest information, guests receive an SMS with a verification code and privacy policy link, and check-in is completed when the code is verified.

## Features

- **Two-Factor Authentication**: SMS-based verification using Twilio
- **Secure Data Handling**: JWT-based authentication with automatic token refresh
- **Privacy Compliance**: Built-in privacy policy acceptance and logging
- **Input Validation**: Comprehensive client-side validation and sanitization
- **Modern UI**: Clean, professional interface built with React Native
- **Cross-Platform**: Runs on iOS, Android, and web browsers with the same codebase

## Tech Stack

- **Frontend**: React Native with Expo (iOS, Android, Web)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **SMS**: Twilio (via Supabase Edge Functions)
- **Authentication**: JWT tokens with secure storage
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (Mac only) or **Android Studio** (for Android emulator) - optional for mobile testing
- **Supabase Account**: [https://supabase.com](https://supabase.com)
- **Twilio Account**: [https://twilio.com](https://twilio.com)

## Quick Start

### 1. Clone and Install

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd hotel-checkin-app

# Install dependencies
npm install
\`\`\`

### 2. Supabase Setup

#### Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

#### Deploy Edge Functions

The app calls Supabase Edge Functions for SMS operations. Deploy them first:

\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (find project-ref in your Supabase dashboard URL)
supabase link --project-ref your-project-ref

# Deploy edge functions to Supabase
supabase functions deploy send-sms
supabase functions deploy verify-code

# Set Twilio secrets for edge functions
supabase secrets set TWILIO_ACCOUNT_SID=your-sid
supabase secrets set TWILIO_AUTH_TOKEN=your-token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
\`\`\`

#### Setup Database

Run the SQL scripts to create tables and policies:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and run `backend/schema.sql`

### 3. Environment Setup

Create a `.env` file in the root directory:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your Supabase credentials (no Twilio keys needed locally):

\`\`\`env
# Supabase Configuration (from your Supabase dashboard)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Privacy Policy URL
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://yourhotel.com/privacy
\`\`\`

**Note**: Twilio credentials are stored as Supabase secrets and only used by Edge Functions. You don't need them locally.

### 4. Run the App

The app will call your deployed Supabase Edge Functions automatically:

#### **Web Browser (Recommended for Quick Preview)**

\`\`\`bash
npm run web
\`\`\`

Opens in your default browser at `http://localhost:8081`

#### iOS Simulator (Mac only)

\`\`\`bash
npm run ios
\`\`\`

#### Android Emulator

\`\`\`bash
npm run android
\`\`\`

#### Physical Device

\`\`\`bash
# Start the development server
npm start

# Scan the QR code with:
# - Expo Go app (iOS/Android)
# - Camera app (iOS only)
\`\`\`

## Architecture

### Local Development + Remote Edge Functions

This app is configured for **hybrid development**:

- **Frontend (Local)**: React Native app runs on your device/simulator/browser
- **Backend (Remote)**: Edge Functions run on Supabase infrastructure
- **Database (Remote)**: PostgreSQL hosted on Supabase

**Benefits**:
- No need to run Deno or Supabase CLI locally
- Twilio credentials stay secure in Supabase secrets
- Faster development without backend setup
- Production-like environment during development

**How it works**:
1. App calls `supabase.functions.invoke('send-sms', ...)`
2. Request goes to your deployed Supabase Edge Function
3. Edge Function uses Twilio to send SMS
4. Response returns to your local app

### Cross-Platform Storage

The app uses a smart storage abstraction:
- **Mobile (iOS/Android)**: Expo SecureStore (encrypted)
- **Web**: localStorage (browser storage)

This ensures secure token storage across all platforms.

## Project Structure

\`\`\`
hotel-checkin-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout with navigation
│   ├── index.tsx                # Owner reservation screen
│   ├── privacy-policy.tsx       # Privacy policy screen
│   ├── code-verification.tsx    # SMS code verification screen
│   └── confirmation.tsx         # Check-in confirmation screen
│
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx          # Primary/secondary button
│   │   ├── InputField.tsx      # Form input with validation
│   │   ├── Loader.tsx          # Loading indicator
│   │   └── PolicyModal.tsx     # Privacy policy modal
│   │
│   ├── services/               # Backend integration
│   │   ├── supabaseClient.ts  # Supabase client setup
│   │   ├── auth.ts            # JWT token management
│   │   └── sms.ts             # SMS sending/verification
│   │
│   ├── context/               # React Context providers
│   │   └── AuthContext.tsx   # Authentication state
│   │
│   ├── utils/                 # Utilities and helpers
│   │   ├── validation.ts     # Input validation functions
│   │   └── constants.ts      # App constants
│   │
│   └── styles/               # Design system
│       ├── colors.ts        # Color palette
│       └── typography.ts    # Font styles
│
├── backend/                  # Supabase backend code
│   ├── schema.sql           # Database schema
│   ├── seed.sql             # Sample data
│   ├── send-sms.ts          # Edge function: Send SMS
│   └── verify-code.ts       # Edge function: Verify code
│
├── .env.example             # Environment variables template
├── app.config.js            # Expo configuration
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind CSS configuration
├── README.md                # This file
└── DOCS.md                  # Detailed documentation
\`\`\`

## Development Workflow

### Best Practices

1. **Branch Strategy**: Create feature branches from `main`
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Testing Flows**: Test the complete check-in flow regularly
   - Enter guest information
   - Verify SMS is sent (check Twilio logs)
   - Enter verification code
   - Confirm check-in completion

3. **JWT Token Testing**: Use Supabase dashboard to inspect tokens
   - Check token expiration times
   - Verify refresh token functionality
   - Test with expired tokens

4. **Environment Variables**: Never commit `.env` file
   - Use `.env.example` as template
   - Document all required variables

### Making Changes

#### Frontend Changes (Local)

1. Edit files in `app/` or `src/`
2. Changes hot-reload automatically
3. Test on your device/simulator

#### Backend Changes (Edge Functions)

1. Edit files in `backend/send-sms.ts` or `backend/verify-code.ts`
2. Deploy to Supabase:
   \`\`\`bash
   supabase functions deploy send-sms
   # or
   supabase functions deploy verify-code
   \`\`\`
3. Test from your local app

#### Database Changes

1. Edit `backend/schema.sql`
2. Run the updated SQL in Supabase SQL Editor
3. Or create a new migration:
   \`\`\`bash
   supabase migration new your_migration_name
   \`\`\`

### Common Commands

\`\`\`bash
# Start development server
npm start

# Clear cache and restart
npm start --clear

# Run on specific platform
npm run ios
npm run android
npm run web

# Type checking
npx tsc --noEmit

# Lint code
npx eslint .
\`\`\`

### Testing Edge Functions

View logs for deployed Edge Functions:

\`\`\`bash
# View real-time logs
supabase functions logs send-sms --follow
supabase functions logs verify-code --follow
\`\`\`

Or check logs in Supabase Dashboard → Edge Functions → Logs

## Building for Production

### iOS

\`\`\`bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
\`\`\`

### Android

\`\`\`bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
\`\`\`

### Web

\`\`\`bash
# Build for web
npx expo export:web

# Deploy to Vercel
vercel deploy
\`\`\`

## Troubleshooting

### SMS Not Sending

1. **Check Edge Function deployment**:
   \`\`\`bash
   supabase functions list
   \`\`\`
   Ensure `send-sms` is deployed

2. **Check Twilio secrets**:
   \`\`\`bash
   supabase secrets list
   \`\`\`
   Verify `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` are set

3. **Check Edge Function logs**:
   \`\`\`bash
   supabase functions logs send-sms
   \`\`\`

4. **Verify Twilio account**:
   - Check account balance
   - Verify phone number is verified (for trial accounts)
   - Check Twilio console for error logs

### Code Verification Fails

1. **Check Edge Function logs**:
   \`\`\`bash
   supabase functions logs verify-code
   \`\`\`

2. **Verify database records**:
   - Go to Supabase Dashboard → Table Editor
   - Check `check_ins` table for recent entries
   - Verify `verification_code` matches what was sent

3. **Check rate limiting**:
   - Edge function limits verification attempts
   - Wait a few minutes and try again

### Environment Variable Issues

1. **Frontend can't connect to Supabase**:
   - Verify `.env` file exists
   - Check `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Restart Expo server: `npm start --clear`

2. **Edge Functions can't access secrets**:
   - Secrets must be set via Supabase CLI, not in `.env`
   - Re-deploy after setting secrets:
     \`\`\`bash
     supabase secrets set TWILIO_ACCOUNT_SID=your-sid
     supabase functions deploy send-sms
     \`\`\`

## Security Considerations

- **Row-Level Security (RLS)**: All database tables have RLS policies
- **Input Validation**: All user input is validated and sanitized
- **Secure Storage**: JWT tokens stored in encrypted SecureStore
- **Rate Limiting**: Backend implements rate limiting on verification attempts
- **Privacy Compliance**: Privacy policy acceptance is logged for each check-in

## Support

For issues or questions:

1. Check the [DOCS.md](./DOCS.md) for detailed documentation
2. Review Supabase logs for backend errors
3. Check Twilio logs for SMS issues
4. Open an issue in the repository

## License

MIT License - See LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ for the hospitality industry
