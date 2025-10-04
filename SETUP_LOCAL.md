# Local Development Setup Guide

## Quick Start (Frontend Only)

For a quick frontend demo without backend setup:

1. **Install dependencies** (already done):
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Create environment file**:
   ```bash
   # Create .env file in project root
   touch .env
   ```

3. **Add minimal environment variables** to `.env`:
   ```env
   # Minimal setup for frontend demo
   EXPO_PUBLIC_SUPABASE_URL=https://demo.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=demo-key
   EXPO_PUBLIC_PRIVACY_POLICY_URL=https://yourhotel.com/privacy
   EXPO_PUBLIC_DEV_MODE=true
   ```

4. **Start the development server**:
   ```bash
   # For web browser (recommended for quick demo)
   npm run web
   
   # Or for mobile development
   npm start
   ```

## Full Setup (With Backend)

For full functionality with SMS and database:

1. **Set up Supabase project**:
   - Go to https://supabase.com
   - Create new project
   - Get your project URL and anon key

2. **Deploy Edge Functions**:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-ref
   supabase functions deploy send-sms
   supabase functions deploy verify-code
   ```

3. **Set up Twilio** (for SMS):
   - Create Twilio account
   - Get Account SID, Auth Token, and Phone Number
   - Set as Supabase secrets

4. **Update .env with real values**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   EXPO_PUBLIC_PRIVACY_POLICY_URL=https://yourhotel.com/privacy
   ```

## Running the App

### Web Browser (Easiest)
```bash
npm run web
```
Opens at http://localhost:8081

### Mobile Development
```bash
npm start
```
Then scan QR code with Expo Go app

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## Demo Mode

The app includes demo mode for frontend testing:
- Forms will validate input
- UI will show loading states
- Navigation will work between screens
- Backend calls will fail gracefully (expected in demo mode)

## Troubleshooting

- **Node version warnings**: Ignore them, app will still work
- **Dependency conflicts**: Use `--legacy-peer-deps` flag
- **Port conflicts**: Change port with `EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0`
- **Cache issues**: Run `npm start --clear`

