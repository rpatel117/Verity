# Verity - Hotel Check-in App

A modern, secure hotel check-in system with SMS verification, guest policy acceptance, and compliance-ready reporting for the hospitality industry.

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

## 📋 Features

### For Hotels
- **Secure Guest Verification**: SMS-based verification system
- **Policy Acceptance**: Digital policy acceptance workflow
- **Compliance Reporting**: Card arbitrator compliant reports
- **Staff Dashboard**: Manage guest check-ins and verification
- **Real-time Updates**: Live status tracking

### For Guests
- **SMS Verification**: Receive verification codes via SMS
- **Mobile-Friendly**: Responsive design for all devices
- **Secure Process**: JWT-protected guest links
- **Policy Transparency**: Clear policy acceptance flow

### Security & Compliance
- **Bank-Grade Encryption**: AES-256 encryption for all data
- **PCI DSS Compliant**: Payment card industry standards
- **SOC 2 Type II**: Security and compliance certification
- **Privacy First**: Minimal data collection with automatic deletion
- **Audit Trail**: Complete verification history for disputes

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **SMS**: Twilio for verification codes
- **Email**: EmailJS for contact forms
- **Deployment**: Vercel (frontend), Supabase (backend)

### Project Structure
```
app/
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx                # Landing page
├── (public)/               # Public routes (auth, guest)
│   ├── auth/              # Authentication pages
│   └── guest/[token]/     # Guest verification pages
└── (protected)/            # Protected routes (dashboard)
    └── dashboard/         # Staff dashboard
        ├── check-in/     # Guest check-in form
        ├── data/         # Data management
        └── reports/      # Compliance reports

components/
├── auth/                  # Authentication components
├── checkin/              # Check-in and verification
├── ContactForm.tsx       # Demo request form
└── ui/                   # Reusable UI components

lib/
├── api.ts                # API client functions
├── supabaseClient.ts     # Supabase configuration
└── validation.ts         # Form validation schemas

supabase/
├── functions/            # Edge functions
│   ├── send_attestation_sms_fixed/  # SMS sending
│   ├── guest_confirm/               # Policy acceptance
│   ├── guest_init/                  # Guest initialization
│   └── guest_event/                 # Event logging
└── migrations/           # Database migrations
```

## 🛠️ Development

### Commands
```bash
npm run dev              # Development server
npm run dev:clean        # Clean build and restart
npm run build            # Production build
npm start                # Production server
npm run lint             # Code linting
```

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

### Debug Tools
```javascript
// Available in browser console (development mode)
window.checkAuthState()        // Check authentication state
window.nuclearAuthClear()       // Clear all auth data
window.clearAuthState()         // Clear and reload
window.forceLogout()            // Force logout
```

## 🔄 Workflow

### Staff Check-in Process
1. **Staff Login**: Secure authentication via Supabase
2. **Guest Information**: Collect guest details and stay information
3. **SMS Dispatch**: Send verification code to guest's phone
4. **Policy Link**: Guest receives secure link for policy acceptance
5. **Code Verification**: Staff verifies guest's code for check-in

### Guest Verification Process
1. **SMS Received**: Guest gets verification code via SMS
2. **Policy Acceptance**: Guest clicks link and accepts policies
3. **Code Display**: Guest sees verification code for staff
4. **Staff Verification**: Staff enters code to complete check-in

## 🧪 Testing

### Manual Testing Checklist
- [ ] Authentication flow (login, logout, session persistence)
- [ ] Guest check-in to verification
- [ ] Error handling (invalid codes, network issues)
- [ ] Contact form functionality
- [ ] Responsive design on mobile devices
- [ ] EmailJS integration for demo requests

### Test Data
- **Test Verification Code**: `117001` (for development testing)
- **Test Phone**: Use your own number for SMS testing
- **Test Email**: Use your email for contact form testing

## 🚀 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Supabase edge functions deployed
- [ ] Database migrations applied
- [ ] Twilio credentials set
- [ ] EmailJS configuration complete
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

## 🆘 Troubleshooting

### Common Issues

**Authentication Issues**
- **"useAuth must be used within an AuthProvider"**: Ensure AuthProvider is in root layout
- **Infinite loading**: Use timeout fallback or manual override button
- **Auto-login in incognito**: Use `window.nuclearAuthClear()` in console

**Verification Issues**
- **Code mismatch**: Ensure `guest_confirm` doesn't regenerate codes
- **UI stuck loading**: Check API timeouts and error handling
- **Double SMS sends**: Add submission guards to forms

**Contact Form Issues**
- **EmailJS not working**: Check environment variables and template configuration
- **Form not submitting**: Verify EmailJS service is active

### Quick Fixes
1. **Authentication issues**: Use `window.nuclearAuthClear()` in console
2. **Infinite loading**: Click "Force Show Landing Page" button
3. **Hooks errors**: Check hooks are called before conditional returns
4. **Code verification**: Test with `117001` (test code)

## 📚 Documentation

### Core Systems
- **Authentication System**: Staff login, session management, and debugging
- **Verification Flow**: Guest verification, SMS flow, and code validation
- **API Documentation**: Backend endpoints and edge functions
- **Database Schema**: Database structure and relationships

### Development Guides
- **Development Setup**: Local development environment
- **Debugging Guide**: Troubleshooting and debugging tools
- **Testing Guide**: Testing procedures and test cases

## 🤝 Contributing

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

## 📄 License

[Add your license information here]

## 🆕 Recent Updates

### v1.4.0 - Current Version
- ✅ **Landing Page**: Modern UI with security/compliance focus
- ✅ **Contact Form**: EmailJS integration for demo requests
- ✅ **Shield Favicon**: Professional branding
- ✅ **Suspense Boundaries**: Fixed Next.js deployment issues
- ✅ **EmailJS Integration**: Demo request functionality
- ✅ **UI/UX Improvements**: Enhanced user experience

### Previous Versions
- **v1.3.0**: Fixed critical verification flow issues
- **v1.2.0**: Enhanced authentication and debugging tools
- **v1.1.0**: Added SMS verification system
- **v1.0.0**: Initial release with basic functionality

---

**Verity - a Shadow Solutions product**

*Enterprise-grade guest verification with compliance-ready reporting*