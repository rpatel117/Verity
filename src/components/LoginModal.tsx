/**
 * Login Modal Component
 * 
 * Provides login/signup functionality with SSO options (Google, Microsoft)
 * and development bypass for testing.
 */

import React, { useState } from 'react'
import { useAuth } from '@/src/context/AuthContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Loader2, Mail, Lock, User, Chrome, Building2 } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  preventClose?: boolean
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, preventClose = false }) => {
  const { login, signup, loginWithGoogle, loginWithMicrosoft, devBypass, isLoading } = useAuth()
  
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('Form submitted:', { isSignup, email, password, name })

    try {
      if (isSignup) {
        console.log('Calling signup function')
        await signup(email, password, name)
      } else {
        console.log('Calling login function')
        await login(email, password)
      }
      onClose()
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Authentication failed. Please try again.')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      onClose()
    } catch (error) {
      setError('Google login failed. Please try again.')
    }
  }

  const handleMicrosoftLogin = async () => {
    try {
      await loginWithMicrosoft()
      onClose()
    } catch (error) {
      setError('Microsoft login failed. Please try again.')
    }
  }

  const handleDevBypass = () => {
    devBypass()
    onClose()
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }

  const toggleMode = () => {
    console.log('Toggling mode from', isSignup, 'to', !isSignup)
    setIsSignup(!isSignup)
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={preventClose ? undefined : onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSignup 
              ? 'Sign up to access the hotel check-in system'
              : 'Sign in to access the hotel check-in system'
            }
          </DialogDescription>
        </DialogHeader>
        {!preventClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}

        <div className="space-y-4">
          {/* SSO Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              <Building2 className="w-5 h-5 mr-2" />
              Continue with Microsoft
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required={isSignup}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle between login/signup */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto font-medium ml-1"
              onClick={toggleMode}
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </Button>
          </div>

          {/* Development Bypass */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Development
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-11 border-dashed"
                onClick={handleDevBypass}
                disabled={isLoading}
              >
                🚀 Skip Authentication (Dev Mode)
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
