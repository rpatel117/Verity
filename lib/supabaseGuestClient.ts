/**
 * Guest-Specific Supabase Client
 * 
 * Creates a Supabase client instance specifically for guest pages that:
 * - Does NOT persist sessions (no localStorage)
 * - Does NOT trigger auth state changes
 * - Uses no-op storage to avoid conflicts with main client
 * - Only used for edge function calls, not auth operations
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

/**
 * Get guest Supabase client instance
 * Throws error if env vars are missing (but only when client is actually used in browser)
 */
function getSupabaseGuestClient(): SupabaseClient {
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
}

/**
 * Guest-specific Supabase client
 * Configured to NOT persist sessions or trigger auth state changes
 * Lazy initialization to avoid errors during build/SSR
 */
let _supabaseGuestClient: SupabaseClient | null = null

function getGuestClient(): SupabaseClient {
  if (!_supabaseGuestClient) {
    _supabaseGuestClient = getSupabaseGuestClient()
  }
  return _supabaseGuestClient
}

// Create a Proxy that lazily initializes the client
export const supabaseGuest = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getGuestClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})

