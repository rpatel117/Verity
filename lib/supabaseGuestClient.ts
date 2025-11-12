/**
 * Guest-Specific Supabase Client
 * 
 * Creates a Supabase client instance specifically for guest pages that:
 * - Does NOT persist sessions (no localStorage)
 * - Does NOT trigger auth state changes
 * - Uses a separate storage key to avoid conflicts with main client
 * - Only used for edge function calls, not auth operations
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rusqnjonwtgzcccyhjze.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c3Fuam9ud3RnemNjY3loanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTE3MDksImV4cCI6MjA3NjAyNzcwOX0.cIcjqiy-o4iMsj-h1URkJhKZr0k2WJpyrWUkdLZxBMM'

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
      // Use a separate storage key to avoid conflicts
      getItem: (key: string) => {
        // Return null - don't read from storage
        return null
      },
      setItem: (key: string, value: string) => {
        // Don't write to storage
      },
      removeItem: (key: string) => {
        // Don't remove from storage
      }
    } : undefined,
  },
  global: {
    // Use a different fetch implementation to avoid conflicts
    headers: {
      'X-Client-Info': 'verity-guest-client'
    }
  }
})

