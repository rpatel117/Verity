"use client"

/**
 * Authentication Context
 * 
 * Manages authentication state and provides login/logout functionality.
 * Includes SSO providers (Google, Microsoft) and development bypass.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, hotelName: string) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  

  // Simplified auth initialization - Trust Supabase's session management
  useEffect(() => {
    let mounted = true
    
    // Skip auth initialization on guest pages (public routes that don't need auth)
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname.startsWith('/guest/')) {
        console.log('🔍 Guest page detected - skipping auth initialization')
        setUser(null)
        setIsInitializing(false)
        return
      }
    }
    
    // Fallback timeout to prevent infinite initialization
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('⏰ Auth initialization timeout - forcing isInitializing to false')
        setIsInitializing(false)
      }
    }, 2000) // Increased to 2 seconds to give Supabase time to initialize

    // Listen for auth state changes - Trust Supabase's session management
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        // Only handle the events we care about - trust Supabase's session state
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('Profile fetch failed:', profileError)
              setUser(null)
            } else if (profile) {
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                hotelName: profile.hotel_name,
                provider: 'email'
              }
              setUser(userData)
            } else {
              setUser(null)
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
            setUser(null)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔄 SIGNED_OUT - setting user to null')
          setUser(null)
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 INITIAL_SESSION - session:', !!session, 'user:', !!session?.user)
          // Trust Supabase - if they say there's a session, use it
          if (session?.user) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (profile) {
                const userData: User = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: profile.name,
                  hotelName: profile.hotel_name,
                  provider: 'email'
                }
                setUser(userData)
              } else {
                setUser(null)
              }
            } catch (error) {
              console.error('Error fetching initial profile:', error)
              setUser(null)
            }
          } else {
            console.log('🔄 INITIAL_SESSION - no session, setting user to null')
            setUser(null)
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed - session is still valid, no state change needed
          console.log('🔄 TOKEN_REFRESHED - session still valid, no action needed')
          // Do nothing - user state remains the same
        }
        // Ignore all other events - Supabase will handle them
        
        // Always set initializing to false after first auth state change
        console.log('🔄 Setting isInitializing to false')
        setIsInitializing(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing stale session before attempting login
      // This prevents conflicts when re-logging in after closing a tab
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        console.log('🧹 Clearing existing session before login...')
        await supabase.auth.signOut()
        // Wait a moment for the signout to complete
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Now attempt the login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }
      
      if (data.user) {
        // Get or create user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, this shouldn't happen for existing users
            throw new Error('User profile not found. Please contact support.')
          } else {
            throw new Error('Failed to fetch user profile')
          }
        }

        // Set user state immediately after successful login
        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          name: profile.name,
          hotelName: profile.hotel_name,
          provider: 'email'
        }
        setUser(userData)
        toast.success('Successfully signed in!')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const signup = async (email: string, password: string, name: string, hotelName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name,
            hotel_name: hotelName,
          })

        if (profileError) {
          throw new Error('Failed to create user profile')
        }

        toast.success('Account created successfully! Please check your email to confirm your account.')
        
        // Don't redirect immediately - user needs to confirm email first
        // The user will be redirected after clicking the confirmation link
      }
    } catch (error) {
      console.error('Signup failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Clear user state immediately to prevent UI flicker
      setUser(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }

      // Clear all auth-related localStorage
      if (typeof window !== 'undefined') {
        // Clear Supabase-specific keys
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
        
        // Also clear sessionStorage for good measure
        Object.keys(sessionStorage).forEach(key => {
          if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
            sessionStorage.removeItem(key)
          }
        })
      }

      toast.success('Successfully signed out!')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if signOut fails, clear local state
      setUser(null)
      const errorMessage = error instanceof Error ? error.message : 'Logout failed. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset`
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      console.error('Forgot password failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Password updated successfully!')
    } catch (error) {
      console.error('Reset password failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password. Please try again.'
      toast.error(errorMessage)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isInitializing,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword
  }

  // Debug logging
  console.log('🔍 AuthContext state:', { 
    user: !!user, 
    isAuthenticated: !!user, 
    isInitializing,
    userEmail: user?.email 
  })

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}