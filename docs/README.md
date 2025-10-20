# Hotel Check-in App Documentation

## Overview

A comprehensive hotel check-in system with SMS verification, guest policy acceptance, and staff verification workflows.

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Twilio account (for SMS)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd hotel-checkin-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

## Documentation Structure

### Core Systems

- **[Authentication System](./authentication.md)** - Staff login, session management, and debugging
- **[Verification Flow](./verification-flow.md)** - Guest verification, SMS flow, and code validation
- **[API Documentation](./api.md)** - Backend endpoints and edge functions
- **[Database Schema](./database.md)** - Database structure and relationships

### Development

- **[Development Setup](./development.md)** - Local development environment
- **[Debugging Guide](./debugging.md)** - Troubleshooting and debugging tools
- **[Testing Guide](./testing.md)** - Testing procedures and test cases

## System Architecture

### Frontend (Next.js)

```
app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Landing page
├── (public)/
│   ├── auth/page.tsx       # Login/signup forms
│   └── guest/[token]/      # Guest policy acceptance
└── (protected)/
    └── dashboard/          # Staff dashboard
        ├── check-in/       # Guest check-in form
        └── verify/         # Code verification
```

### Backend (Supabase)

```
supabase/functions/
├── send_attestation_sms_fixed/  # SMS sending
├── guest_confirm/               # Policy acceptance
├── verify_attestation_code/     # Code verification
├── guest_init/                  # Guest initialization
└── guest_event/                 # Event logging
```

### Database

```
Tables:
├── profiles           # Staff user profiles
├── attestations       # Guest verification records
├── guest_events       # Event logging
└── hotels            # Hotel information
```

## Key Features

### Staff Features

- **Authentication**: Secure login with Supabase Auth
- **Guest Check-in**: Create guest records and send SMS
- **Code Verification**: Verify guest codes for check-in
- **Dashboard**: View and manage guest attestations

### Guest Features

- **SMS Verification**: Receive verification codes via SMS
- **Policy Acceptance**: Accept hotel policies via secure link
- **Code Display**: View verification code for staff

### System Features

- **Real-time Updates**: Live status updates
- **Error Handling**: Comprehensive error management
- **Security**: JWT tokens, hashed codes, secure storage
- **Debugging**: Development tools and logging

## Development Workflow

### 1. Authentication Flow

```
User visits app → AuthContext initializes → Check session → 
If authenticated: Dashboard → If not: Landing page
```

### 2. Guest Check-in Flow

```
Staff fills form → SMS sent to guest → Guest receives code → 
Guest accepts policies → Staff verifies code → Check-in complete
```

### 3. Verification Flow

```
Staff enters code → API validates → Hash comparison → 
Success/Error response → UI updates
```

## Common Issues & Solutions

### Authentication Issues

- **"useAuth must be used within an AuthProvider"**: Ensure AuthProvider is in root layout
- **Infinite loading**: Use timeout fallback or manual override button
- **Auto-login in incognito**: Use `window.nuclearAuthClear()` in console

### Verification Issues

- **Code mismatch**: Ensure `guest_confirm` doesn't regenerate codes
- **UI stuck loading**: Check API timeouts and error handling
- **Double SMS sends**: Add submission guards to forms

### Debugging Tools

```javascript
// Development helpers (available in console)
window.checkAuthState()        // Check auth state
window.nuclearAuthClear()       // Clear all auth data
window.clearAuthState()         // Clear and reload
window.forceLogout()            // Force logout
```

## Testing

### Manual Testing

1. **Authentication**: Test login, logout, session persistence
2. **Guest Flow**: Complete check-in to verification
3. **Error Handling**: Test with invalid codes, network issues
4. **Edge Cases**: Test timeouts, double submissions

### Automated Testing

```bash
# Run tests
npm test

# Run specific test
npm test -- --grep "authentication"

# Run with coverage
npm run test:coverage
```

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Supabase edge functions deployed
- [ ] Database migrations applied
- [ ] Twilio credentials set
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Clean development
npm run dev:clean
```

## Contributing

### Code Standards

- **React**: Functional components with hooks
- **TypeScript**: Strict type checking
- **Styling**: Tailwind CSS with consistent design
- **Testing**: Jest and React Testing Library

### Git Workflow

1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit pull request

## Support

### Getting Help

1. Check this documentation
2. Review troubleshooting guides
3. Check console logs for errors
4. Use debugging tools
5. Contact development team

### Reporting Issues

When reporting issues, include:

- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Console logs**
- **Browser/OS information**
- **Screenshots if applicable**

## License

[Add your license information here]

## Changelog

### Recent Updates

- **Authentication System**: Fixed hooks order issues, added timeout fallbacks
- **Verification Flow**: Fixed code hash mismatch, improved error handling
- **Debugging Tools**: Added comprehensive logging and development helpers
- **Documentation**: Centralized documentation structure

### Version History

- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added SMS verification system
- **v1.2.0**: Enhanced authentication and debugging tools
- **v1.3.0**: Fixed critical verification flow issues


