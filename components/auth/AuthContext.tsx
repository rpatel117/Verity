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
  login: (email: string, password: string) => Promise<User | void>
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
          console.log('🔄 SIGNED_IN event received, fetching profile...')
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
              setIsInitializing(false)
            } else if (profile) {
              const userData: User = {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                hotelName: profile.hotel_name,
                provider: 'email'
              }
              console.log('🔄 Setting user state from SIGNED_IN event:', userData.email)
              setUser(userData)
              setIsInitializing(false)
            } else {
              console.error('No profile found for user')
              setUser(null)
              setIsInitializing(false)
            }
          } catch (error) {
            console.error('Error fetching profile:', error)
            setUser(null)
            setIsInitializing(false)
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🔄 SIGNED_OUT - setting user to null')
          setUser(null)
          // Always set initializing to false after handling event
          setIsInitializing(false)
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 INITIAL_SESSION - session:', !!session, 'user:', !!session?.user)
          // Validate session is actually valid - if profile fetch fails, clear the session
          if (session?.user) {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (profileError || !profile) {
                // Profile doesn't exist or fetch failed - session is invalid, clear it
                console.log('🔄 INITIAL_SESSION - profile fetch failed, clearing invalid session')
                console.error('Profile error:', profileError)
                await supabase.auth.signOut()
                setUser(null)
              } else {
                const userData: User = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: profile.name,
                  hotelName: profile.hotel_name,
                  provider: 'email'
                }
                setUser(userData)
              }
            } catch (error) {
              console.error('Error fetching initial profile:', error)
              // On error, clear the session to prevent stale state
              console.log('🔄 INITIAL_SESSION - error occurred, clearing session')
              await supabase.auth.signOut()
              setUser(null)
            }
          } else {
            console.log('🔄 INITIAL_SESSION - no session, setting user to null')
            setUser(null)
          }
          // Always set initializing to false after handling INITIAL_SESSION
          setIsInitializing(false)
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed - session is still valid, no state change needed
          console.log('🔄 TOKEN_REFRESHED - session still valid, no action needed')
          // Do nothing - user state remains the same
          // But still set initializing to false if it's still true (shouldn't happen, but safety)
          setIsInitializing(false)
        }
        // Ignore all other events - Supabase will handle them
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
      console.log('🔐 Login function started')
      
      // Try to clear any existing session before attempting login
      // This prevents conflicts when re-logging in after closing a tab
      // Use a short timeout to prevent hanging
      console.log('🔐 Checking for existing session...')
      
      let existingSession = null
      let shouldClearSession = false
      
      try {
        // Add timeout to getSession to prevent hanging
        const getSessionPromise = supabase.auth.getSession()
        const sessionTimeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timed out')), 3000) // 3 second timeout
        })
        
        const result = await Promise.race([getSessionPromise, sessionTimeoutPromise]) as any
        
        if (result?.data?.session) {
          existingSession = result.data.session
          shouldClearSession = true
          console.log('🔐 Found existing session, will clear before login')
        } else {
          console.log('🔐 No existing session found')
        }
      } catch (error) {
        console.warn('🔐 Session check timed out or failed, proceeding with login:', error)
        // Continue with login - Supabase will handle session conflicts
      }
      
      if (shouldClearSession && existingSession) {
        console.log('🧹 Clearing existing session before login...')
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
          console.error('🔐 Error signing out:', signOutError)
        }
        // Also manually clear localStorage to be thorough
        if (typeof window !== 'undefined') {
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
              localStorage.removeItem(key)
            }
          })
          // Clear sessionStorage too
          Object.keys(sessionStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('auth') || key.startsWith('sb-')) {
              sessionStorage.removeItem(key)
            }
          })
        }
        // Wait a moment for the signout to complete
        await new Promise(resolve => setTimeout(resolve, 200))
        console.log('🧹 Session cleared')
      }

      // Now attempt the login with timeout
      console.log('🔐 Attempting login with Supabase...')
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out after 30 seconds')), 30000)
      })
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any

      if (error) {
        console.error('🔐 Login error from Supabase:', error)
        throw new Error(error.message || 'Login failed')
      }
      
      console.log('🔐 Login successful, user:', data?.user?.email)
      
      if (!data?.user) {
        console.error('🔐 No user data returned from login')
        throw new Error('Login failed: No user data returned')
      }
      
      console.log('🔐 Fetching user profile...')
      // Get or create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        console.error('🔐 Profile fetch error:', profileError)
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, this shouldn't happen for existing users
          throw new Error('User profile not found. Please contact support.')
        } else {
          throw new Error(`Failed to fetch user profile: ${profileError.message}`)
        }
      }
      
      if (!profile) {
        console.error('🔐 No profile found')
        throw new Error('User profile not found. Please contact support.')
      }

      console.log('🔐 Setting user state...')
      // Set user state immediately after successful login
      const userData: User = {
        id: data.user.id,
        email: data.user.email!,
        name: profile.name,
        hotelName: profile.hotel_name,
        provider: 'email'
      }
      setUser(userData)
      // Ensure isInitializing is false so redirect can happen
      setIsInitializing(false)
      console.log('🔐 Login complete, user state set')
      toast.success('Successfully signed in!')
      
      // Return user data so caller can handle redirect
      return userData
    } catch (error) {
      console.error('🔐 Login function error:', error)
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