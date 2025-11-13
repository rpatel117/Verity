"use client"

/**
 * Authentication Context
 * 
 * Manages authentication state and provides login/logout functionality.
 * Simplified implementation that trusts Supabase's session management.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
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

/**
 * Load user profile from database
 * Returns null if profile doesn't exist (treats as onboarding issue, not auth failure)
 */
async function loadUserProfile(userId: string, email: string): Promise<User | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist - trigger should have created it
        // This is a data consistency issue, not an auth failure
        if (process.env.NODE_ENV === 'development') {
          console.warn('Profile not found for user:', userId, '- treating as onboarding issue')
        }
        return {
          id: userId,
          email,
          needsProfileCompletion: true
        }
      }
      throw error
    }
    
    return {
      id: userId,
      email,
      name: profile.name,
      hotelName: profile.hotel_name,
      hotelId: profile.hotel_id,
      role: profile.role,
      provider: 'email',
      needsProfileCompletion: !profile.name || !profile.hotel_name
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading profile:', error)
    }
    return null
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Single auth state change listener
  useEffect(() => {
    let mounted = true

    // Initial session check with timeout to prevent infinite loading
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        )
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (!mounted) return

        if (session?.user) {
          const userData = await loadUserProfile(session.user.id, session.user.email!)
          if (mounted) {
            setUser(userData)
          }
        } else {
          if (mounted) {
            setUser(null)
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error initializing auth:', error)
        }
        if (mounted) {
          setUser(null)
        }
      } finally {
        // Always set loading to false, even on error or timeout
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Auth state change:', event, session?.user?.email)
        }

        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await loadUserProfile(session.user.id, session.user.email!)
          if (mounted) {
            setUser(userData)
            setIsLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setUser(null)
            setIsLoading(false)
          }
        } else if (event === 'INITIAL_SESSION') {
          if (session?.user) {
            const userData = await loadUserProfile(session.user.id, session.user.email!)
            if (mounted) {
              setUser(userData)
            }
          } else {
            if (mounted) {
              setUser(null)
            }
          }
          if (mounted) {
            setIsLoading(false)
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refreshed - session is still valid, no state change needed
          // But ensure loading is false
          if (mounted) {
            setIsLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      throw new Error(error.message || 'Login failed')
    }
    
    // Auth state change listener will handle profile loading and state updates
  }

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    hotelName: string
  ): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          hotel_name: hotelName
        }
      }
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    // Profile will be created by database trigger
    // User metadata is stored in raw_user_meta_data for trigger to use
    toast.success('Account created successfully! Please check your email to confirm your account.')
  }

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message || 'Logout failed')
    }
    
    // Auth state change listener will handle clearing user state
    toast.success('Successfully signed out!')
  }

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/auth/reset`
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
    isLoading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
