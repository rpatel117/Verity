"use client"

/**
 * Authentication Context
 * 
 * Manages authentication state and provides login/logout functionality.
 * Includes SSO providers (Google, Microsoft) and development bypass.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types'

// User interface is now imported from types

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, hotelName: string) => Promise<void>
  signup: (email: string, password: string, name: string, hotelName: string) => Promise<void>
  logout: () => Promise<void>
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
    const checkAuth = async () => {
      try {
        // Mock auth check - replace with real Supabase auth later
        const savedUser = localStorage.getItem('verity-user')
        if (savedUser) {
          const userData = JSON.parse(savedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, hotelName: string) => {
    setIsLoading(true)
    try {
      // Mock login - replace with real Supabase auth later
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        hotelName,
        provider: 'email'
      }
      
      setUser(userData)
      localStorage.setItem('verity-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, hotelName: string) => {
    setIsLoading(true)
    try {
      // Mock signup - replace with real Supabase auth later
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const userData: User = {
        id: '1',
        email,
        name,
        hotelName,
        provider: 'email'
      }
      
      setUser(userData)
      localStorage.setItem('verity-user', JSON.stringify(userData))
    } catch (error) {
      console.error('Signup failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Mock logout - replace with real Supabase auth later
      setUser(null)
      localStorage.removeItem('verity-user')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}