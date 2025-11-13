/**
 * Server-Side Supabase Client
 * 
 * Provides server-side Supabase client for Next.js App Router.
 * Use this in route handlers, server components, and server actions.
 */

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side operations (route handlers, server components)
 * This client reads/writes cookies to maintain session state
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server component - can't set cookies in some contexts
          // This is expected and safe to ignore
        }
      },
    },
  })
}

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * Use this ONLY for admin operations, edge functions, or trusted server-side tasks
 * NEVER expose this to the client
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      'Missing Supabase service role credentials. ' +
      'Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY'
    )
  }
  
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

