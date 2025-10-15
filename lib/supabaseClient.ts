/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for database and auth operations.
 * Uses AsyncStorage for session persistence across app restarts.
 *
 * BACKEND ASSUMPTION: Supabase project is configured with:
 * - Authentication enabled
 * - Row Level Security (RLS) policies on all tables
 * - Edge functions for SMS sending and verification
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check .env file.")
}

/**
 * Supabase client instance
 * Configured for Next.js web environment
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})

/**
 * Database Types
 * Define the expected structure of database tables
 */
export interface CheckInRecord {
  id: string
  created_at: string
  credit_card_last_4: string
  drivers_license: string
  phone_number: string
  verification_code: string
  verified: boolean
  verified_at?: string
  hotel_staff_id?: string
}

export interface VerificationLog {
  id: string
  created_at: string
  check_in_id: string
  action: "sms_sent" | "code_verified" | "policy_accepted"
  metadata?: Record<string, any>
}
