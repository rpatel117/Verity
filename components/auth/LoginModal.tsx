/**
 * Login Modal Component
 * 
 * Provides login/signup functionality with SSO options (Google, Microsoft)
 * and development bypass for testing.
 */

import React, { useState } from 'react'
import { useAuth } from '@/src/context/AuthContext'
import { LoginSchema, SignupSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { Loader2, Mail, Lock, User, Building } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  preventClose?: boolean
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, preventClose = false }) => {
  const { login, signup, isLoading } = useAuth()
  
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')

  const form = useForm({
    resolver: zodResolver(isSignup ? SignupSchema : LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      hotelName: '',
    },
  })

  const handleSubmit = async (data: any) => {
    setError('')

    try {
      if (isSignup) {
        await signup(data.email, data.password, data.name, data.hotelName)
      } else {
        await login(data.email, data.password, data.hotelName)
      }
      onClose()
    } catch (error) {
      console.error('Authentication error:', error)
      setError('Authentication failed. Please try again.')
    }
  }

  const resetForm = () => {
    form.reset()
    setError('')
  }

  const toggleMode = () => {
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
          {/* Email/Password Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {isSignup && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter your full name"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hotelName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hotel Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter your hotel name"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>

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

        </div>
      </DialogContent>
    </Dialog>
  )
}
