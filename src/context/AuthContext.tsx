"use client"

/**
 * Authentication Context
 * 
 * Manages authentication state and provides login/logout functionality.
 * Includes SSO providers (Google, Microsoft) and development bypass.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  provider?: 'email' | 'google' | 'microsoft'
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithMicrosoft: () => Promise<void>
  devBypass: () => void
  logout: () => void
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
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    console.log('AuthContext: useEffect running')
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking auth state')
        // In a real app, this would check Supabase auth state
        const savedUser = localStorage.getItem('hotel-checkin-user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          console.log('AuthContext: Found saved user:', userData)
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          console.log('AuthContext: No saved user found')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid data
        localStorage.removeItem('hotel-checkin-user')
      } finally {
        console.log('AuthContext: Setting loading to false')
        setIsLoading(false)
      }
    }

    // Add small delay to show loading state
    setTimeout(checkAuth, 100)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        provider: 'email'
      }
      
      setUser(userData)
      localStorage.setItem('hotel-checkin-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '1',
        email,
        name,
        provider: 'email'
      }
      
      setUser(userData)
      localStorage.setItem('hotel-checkin-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true)
    try {
      // Simulate Google OAuth - replace with actual Supabase OAuth
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '2',
        email: 'user@gmail.com',
        name: 'Google User',
        provider: 'google'
      }
      
      setUser(userData)
      localStorage.setItem('hotel-checkin-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithMicrosoft = async () => {
    setIsLoading(true)
    try {
      // Simulate Microsoft OAuth - replace with actual Supabase OAuth
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '3',
        email: 'user@outlook.com',
        name: 'Microsoft User',
        provider: 'microsoft'
      }
      
      setUser(userData)
      localStorage.setItem('hotel-checkin-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Microsoft login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const devBypass = () => {
    const userData: User = {
      id: 'dev',
      email: 'dev@hotel.com',
      name: 'Development User',
      provider: 'email'
    }
    
    setUser(userData)
    localStorage.setItem('hotel-checkin-user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hotel-checkin-user')
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    loginWithGoogle,
    loginWithMicrosoft,
    devBypass,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}