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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rusqnjonwtgzcccyhjze.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1c3Fuam9ud3RnemNjY3loanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTE3MDksImV4cCI6MjA3NjAyNzcwOX0.cIcjqiy-o4iMsj-h1URkJhKZr0k2WJpyrWUkdLZxBMM'

// Use production values as fallback if env vars are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase environment variables not found, using production fallback values")
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
    // Add debug logging for development
    debug: process.env.NODE_ENV === 'development',
    // Force clear any existing sessions on initialization
    ...(typeof window !== 'undefined' && process.env.NODE_ENV === 'development' ? {
      // In development, be more aggressive about clearing stale sessions
      storage: {
        getItem: (key: string) => {
          const value = window.localStorage.getItem(key)
          console.log('🔍 Storage getItem:', key, value ? 'exists' : 'null')
          return value
        },
        setItem: (key: string, value: string) => {
          console.log('🔍 Storage setItem:', key, 'length:', value.length)
          window.localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          console.log('🔍 Storage removeItem:', key)
          window.localStorage.removeItem(key)
        }
      }
    } : {})
  },
})

// Development helper: Clear auth state if needed
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  
  // Add a global function to clear auth state for debugging
  (window as any).clearAuthState = async () => {
    console.log('🧹 Clearing auth state...')
    await supabase.auth.signOut()
    
    // Clear all localStorage
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('🧹 Auth state cleared, reloading...')
    window.location.href = '/'
  }
  
  // Add a function to check current auth state
  (window as any).checkAuthState = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔍 Current auth state:', session)
    console.log('🔍 localStorage keys:', Object.keys(localStorage))
    console.log('🔍 sessionStorage keys:', Object.keys(sessionStorage))
    return session
  }
  
  // Add a function to force logout and redirect
  (window as any).forceLogout = async () => {
    console.log('🚪 Force logout...')
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }
  
  // Add a function to completely clear all auth data
  (window as any).nuclearAuthClear = async () => {
    console.log('💥 NUCLEAR AUTH CLEAR - Removing ALL auth data...')
    
    // Sign out from Supabase
    await supabase.auth.signOut()
    
    // Clear all storage
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear any remaining auth-related keys
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('sb-')) {
        localStorage.removeItem(key)
      }
    })
    
    // Force reload
    console.log('💥 Nuclear clear complete, reloading...')
    window.location.reload()
  }
}

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
