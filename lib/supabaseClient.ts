/**
 * Supabase Client Configuration for Web
 * 
 * Web-compatible Supabase client using localStorage instead of AsyncStorage
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check .env file.");
}

/**
 * Supabase client instance for web
 * Configured with localStorage for session persistence
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

/**
 * Database Types
 * Define the expected structure of database tables
 */
export interface CheckInRecord {
  id: string;
  created_at: string;
  credit_card_last_4: string;
  drivers_license: string;
  phone_number: string;
  verification_code: string;
  verified: boolean;
  verified_at?: string;
  hotel_staff_id?: string;
}

export interface VerificationLog {
  id: string;
  created_at: string;
  check_in_id: string;
  action: "sms_sent" | "code_verified" | "policy_accepted";
  metadata?: Record<string, any>;
}

