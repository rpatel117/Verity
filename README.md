# Hotel Check-in App

A modern hotel check-in system with SMS verification and guest policy acceptance.

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd hotel-checkin-app
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development
npm run dev
```

## 📚 Documentation

**All documentation is centralized in the [`docs/`](./docs/) directory:**

- **[📖 Main Documentation](./docs/README.md)** - Complete system overview
- **[🔐 Authentication System](./docs/authentication.md)** - Auth setup, debugging, and fixes
- **[✅ Verification Flow](./docs/verification-flow.md)** - Guest verification and SMS system
- **[🐛 Debugging Guide](./docs/debugging.md)** - Troubleshooting and debug tools
- **[⚙️ Development Setup](./docs/development.md)** - Local development environment

## 🏗️ Architecture

### Core Systems

- **Authentication**: Staff login with Supabase Auth
- **SMS Verification**: Twilio integration for guest codes
- **Policy Acceptance**: Secure guest policy workflow
- **Code Verification**: Staff verification system

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **SMS**: Twilio for verification codes
- **Deployment**: Vercel (frontend), Supabase (backend)

## 🛠️ Development

### Commands

```bash
npm run dev              # Development server
npm run dev:clean        # Clean build and restart
npm run build            # Production build
npm test                 # Run tests
npm run lint             # Code linting
```

### Debug Tools

```javascript
// Available in browser console (development mode)
window.checkAuthState()        // Check authentication state
window.nuclearAuthClear()       // Clear all auth data
window.clearAuthState()         // Clear and reload
window.forceLogout()            // Force logout
```

## 🔧 Recent Fixes

### Authentication Issues Resolved

- ✅ **Hooks Order**: Fixed React hooks violations
- ✅ **Loading States**: Added timeout fallbacks and manual overrides
- ✅ **Session Management**: Simplified auth state management
- ✅ **Debug Tools**: Added comprehensive debugging helpers

### Verification Flow Fixed

- ✅ **Code Mismatch**: Fixed hash mismatch between generation and verification
- ✅ **UI Loading**: Added timeout handling and error recovery
- ✅ **Double Calls**: Prevented duplicate function calls
- ✅ **Error Handling**: Enhanced error management throughout

## 📁 Project Structure

```
app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Landing page
├── (public)/               # Public routes (auth, guest)
└── (protected)/            # Protected routes (dashboard)

components/
├── auth/                   # Authentication components
├── checkin/               # Check-in and verification
└── ui/                     # Reusable UI components

lib/
├── api.ts                  # API client functions
├── supabaseClient.ts       # Supabase configuration
└── validation.ts           # Form validation schemas

supabase/
├── functions/              # Edge functions
└── migrations/             # Database migrations

docs/                       # 📚 Centralized documentation
├── README.md              # Main documentation
├── authentication.md      # Auth system guide
├── verification-flow.md    # Verification system guide
├── debugging.md           # Debugging and troubleshooting
└── development.md         # Development setup
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Authentication flow (login, logout, session persistence)
- [ ] Guest check-in to verification
- [ ] Error handling (invalid codes, network issues)
- [ ] Incognito mode (should show landing page)
- [ ] No hooks order errors
- [ ] No infinite loading states

### Automated Testing

```bash
npm test                   # Run all tests
npm run test:coverage      # Run with coverage
npm run test:e2e          # End-to-end tests
```

## 🚀 Deployment

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Supabase edge functions deployed
- [ ] Database migrations applied
- [ ] Twilio credentials set
- [ ] Error monitoring configured

## 🆘 Troubleshooting

### Quick Fixes

1. **Authentication issues**: Use `window.nuclearAuthClear()` in console
2. **Infinite loading**: Click "Force Show Landing Page" button
3. **Hooks errors**: Check hooks are called before conditional returns
4. **Code verification**: Test with `117001` (test code)

### Getting Help

1. **Check documentation**: Review [`docs/`](./docs/) directory
2. **Use debug tools**: Browser console helpers
3. **Check console logs**: Look for error messages
4. **Test in incognito**: Verify clean state

## 📄 License

[Add your license information here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

---

**📚 For complete documentation, see the [`docs/`](./docs/) directory.**