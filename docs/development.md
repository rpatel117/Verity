# Development Setup Guide

## Overview

This guide covers setting up the local development environment for the hotel check-in application.

## Prerequisites

### Required Software

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended

### Required Accounts

- **Supabase**: For backend services
- **Twilio**: For SMS functionality
- **GitHub**: For code repository

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd hotel-checkin-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 4. Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Commands

### Basic Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Development Utilities

```bash
# Clean development (removes .next and restarts)
npm run dev:clean

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

## Project Structure

```
hotel-checkin-app/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── (public)/          # Public routes
│   │   ├── auth/          # Authentication pages
│   │   └── guest/         # Guest pages
│   └── (protected)/       # Protected routes
│       └── dashboard/     # Staff dashboard
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── checkin/           # Check-in components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
│   ├── api.ts             # API client
│   ├── supabaseClient.ts  # Supabase configuration
│   └── validation.ts      # Form validation schemas
├── supabase/              # Supabase configuration
│   ├── functions/         # Edge functions
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
├── public/                # Static assets
└── tests/                 # Test files
```

## Development Workflow

### 1. Daily Development

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Make changes to code
# Hot reload will update automatically
```

### 2. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

### 3. Debugging

```bash
# Use debugging tools in browser console
window.checkAuthState()
window.nuclearAuthClear()

# Check console logs for debugging info
# Use Network tab for API debugging
```

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down URL and anon key

### 2. Database Setup

```sql
-- Run these SQL commands in Supabase SQL editor

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  hotel_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create attestations table
CREATE TABLE attestations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE,
  guest_full_name TEXT,
  guest_phone TEXT,
  code_hash TEXT,
  code_enc TEXT,
  sent_at TIMESTAMP,
  verified_at TIMESTAMP,
  verification_method TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attestations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 3. Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy send_attestation_sms_fixed
supabase functions deploy guest_confirm
supabase functions deploy verify_attestation_code
```

## Twilio Setup

### 1. Create Twilio Account

1. Go to [twilio.com](https://twilio.com)
2. Create account and verify phone number
3. Get Account SID and Auth Token from console

### 2. Configure Phone Number

1. Purchase a phone number in Twilio console
2. Note down the phone number
3. Add to environment variables

## Development Tools

### VS Code Extensions

Recommended extensions for development:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "supabase.supabase"
  ]
}
```

### Browser Extensions

- **React Developer Tools**: For React debugging
- **Redux DevTools**: For state management
- **Supabase DevTools**: For database debugging

## Testing

### Unit Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- components/auth/AuthContext.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm run test:coverage
```

### Integration Testing

```bash
# Test authentication flow
npm run test:auth

# Test verification flow
npm run test:verification

# Test complete user journey
npm run test:e2e
```

### Manual Testing

1. **Authentication Flow**:
   - Test login/logout
   - Test session persistence
   - Test incognito mode

2. **Verification Flow**:
   - Test guest check-in
   - Test SMS sending
   - Test code verification

3. **Error Handling**:
   - Test network errors
   - Test invalid inputs
   - Test timeout scenarios

## Debugging

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

#### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Supabase Connection Issues

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL

# Verify Supabase project is active
# Check Supabase dashboard for project status
```

### Debug Tools

```javascript
// Browser console helpers
window.checkAuthState()        // Check authentication state
window.nuclearAuthClear()       // Clear all auth data
window.clearAuthState()         // Clear and reload
window.forceLogout()            // Force logout
```

## Performance

### Development Performance

```bash
# Use development build for faster builds
npm run dev

# Use production build for testing
npm run build
npm start
```

### Monitoring

```bash
# Check bundle size
npm run analyze

# Check for unused dependencies
npm run audit

# Check for security vulnerabilities
npm audit
```

## Deployment

### Development Deployment

```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### Production Deployment

```bash
# Deploy to Vercel
vercel deploy

# Deploy to Netlify
netlify deploy

# Deploy to custom server
npm run build
# Upload dist/ folder to server
```

## Troubleshooting

### Common Problems

#### "Module not found" errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Hot reload not working

```bash
# Restart development server
npm run dev:clean
```

#### Supabase connection issues

```bash
# Check environment variables
# Verify Supabase project is active
# Check network connectivity
```

#### TypeScript errors

```bash
# Check TypeScript configuration
npm run type-check

# Update type definitions
npm install @types/node @types/react
```

### Getting Help

1. **Check documentation**: Review this guide and other docs
2. **Check console**: Look for error messages
3. **Check network**: Verify API calls are working
4. **Check environment**: Verify all variables are set
5. **Ask team**: Contact development team for help

## Best Practices

### Code Quality

- **TypeScript**: Use strict type checking
- **ESLint**: Follow linting rules
- **Prettier**: Use consistent formatting
- **Testing**: Write tests for new features

### Git Workflow

- **Feature branches**: Create branches for features
- **Commit messages**: Use descriptive commit messages
- **Pull requests**: Review code before merging
- **Documentation**: Update docs with changes

### Security

- **Environment variables**: Never commit secrets
- **Authentication**: Use secure authentication methods
- **API security**: Validate all inputs
- **HTTPS**: Use HTTPS in production

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Tools

- [VS Code](https://code.visualstudio.com)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Twilio Console](https://console.twilio.com)
- [GitHub](https://github.com)

### Community

- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)
- [React Discord](https://discord.gg/react)


