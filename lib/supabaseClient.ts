/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for database and auth operations.
 * Client-side only - use lib/supabaseServer.ts for server-side operations.
 *
 * BACKEND ASSUMPTION: Supabase project is configured with:
 * - Authentication enabled
 * - Row Level Security (RLS) policies on all tables
 * - Edge functions for SMS sending and verification
 * - Database trigger for automatic profile creation (see migrations/002_add_profile_trigger.sql)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Get Supabase client instance
 * Throws error if env vars are missing (but only when client is actually used)
 */
function getSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Only throw in browser - during SSR/build, return a mock client
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. ' +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      )
    }
    // During SSR/build, return a minimal mock to prevent crashes
    // This should never be used in practice, but prevents build errors
    return {} as SupabaseClient
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })
}

/**
 * Supabase client instance
 * Configured for Next.js web environment (client-side only)
 * Lazy initialization to avoid errors during build/SSR
 */
let _supabaseClient: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = getSupabaseClient()
  }
  return _supabaseClient
}

// Create a Proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
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
