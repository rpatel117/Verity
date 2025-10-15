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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth check failed:', error)
          setUser(null)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileError) {
            setUser(null)
            setIsLoading(false)
            return
          }

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
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          // Get user profile
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
          }
          setIsLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsLoading(false)
        }
        // Don't set isLoading(false) for other events like INITIAL_SESSION
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
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

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, this shouldn't happen for existing users
          throw new Error('User profile not found. Please contact support.')
        } else if (profileError) {
          throw new Error('Failed to fetch user profile')
        }

        toast.success('Successfully signed in!')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.'
      toast.error(errorMessage)
      setIsLoading(false) // Set loading to false on error
      throw error
    }
    // Note: Don't set isLoading(false) here - let the auth state change listener handle it
  }

  const signup = async (email: string, password: string, name: string, hotelName: string) => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new Error(error.message)
      }

      setUser(null)
      toast.success('Successfully signed out!')
    } catch (error) {
      console.error('Logout failed:', error)
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