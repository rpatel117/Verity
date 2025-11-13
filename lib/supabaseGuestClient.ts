/**
 * Guest-Specific Supabase Client
 * 
 * Creates a Supabase client instance specifically for guest pages that:
 * - Does NOT persist sessions (no localStorage)
 * - Does NOT trigger auth state changes
 * - Uses no-op storage to avoid conflicts with main client
 * - Only used for edge function calls, not auth operations
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Guest-specific Supabase client
 * Configured to NOT persist sessions or trigger auth state changes
 */
export const supabaseGuest = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false, // Don't auto-refresh tokens
    persistSession: false, // Don't persist sessions
    detectSessionInUrl: false, // Don't detect sessions in URL
    storage: typeof window !== 'undefined' ? {
      // No-op storage to avoid conflicts with main client
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    } : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'verity-guest-client'
    }
  }
})

