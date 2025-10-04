"use client"

/**
 * Authentication Context
 *
 * Provides global authentication state and methods throughout the app.
 * Manages session persistence and token refresh automatically.
 *
 * Usage:
 * - Wrap app with <AuthProvider>
 * - Use useAuth() hook in components to access auth state
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "../services/supabaseClient"
import { storeTokens, clearTokens } from "../services/auth"
import type { Session } from "@supabase/supabase-js"

interface AuthContextType {
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication Provider Component
 *
 * Manages authentication state and provides auth methods to child components.
 * Automatically handles session restoration and token refresh.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)

      if (session) {
        // Store tokens for API calls
        storeTokens(session.access_token, session.refresh_token, session.expires_in || 3600)
      }

      setLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[Auth] Auth state changed:", _event)
      setSession(session)

      if (session) {
        storeTokens(session.access_token, session.refresh_token, session.expires_in || 3600)
      } else {
        clearTokens()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Sign in with email and password
   * For hotel staff authentication
   */
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    if (data.session) {
      await storeTokens(data.session.access_token, data.session.refresh_token, data.session.expires_in || 3600)
    }
  }

  /**
   * Sign out and clear all tokens
   */
  const signOut = async () => {
    await supabase.auth.signOut()
    await clearTokens()
  }

  const value: AuthContextType = {
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!session,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
