/**
 * Auth Page
 * 
 * Modern authentication page with glassmorphism and smooth transitions
 * Redirects to /dashboard on successful authentication
 */

"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthContext'
import { LoginSchema, SignupSchema } from '@/lib/validation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { motion } from 'framer-motion'
import { fadeInUp, scaleIn, checkmark, spin } from '@/lib/motion'
import { Loader2, Mail, Lock, User, Building, Shield } from 'lucide-react'
import Link from 'next/link'

function AuthPageContent() {
  const { login, signup, isAuthenticated, isInitializing } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get the default tab from URL params
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login'

  // Redirect authenticated users to dashboard
  // Also handle stale sessions that might cause UI errors
  useEffect(() => {
    if (!isInitializing) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        // If not authenticated and not initializing, ensure we're on auth page
        // This prevents UI errors from stale session state
        const currentPath = window.location.pathname
        if (!currentPath.startsWith('/auth')) {
          // Already handled by router, but this ensures clean state
        }
      }
    }
  }, [isAuthenticated, isInitializing, router])

  const loginForm = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signupForm = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      hotelName: '',
    },
  })

  // Show loading while checking auth (but with timeout to prevent infinite loading)
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInitializing) {
        console.log('⚠️ Auth initialization taking too long, allowing form to render')
        setAuthCheckTimeout(true)
      }
    }, 2000) // 2 second timeout
    
    return () => clearTimeout(timeout)
  }, [isInitializing])
  
  if (isInitializing && !authCheckTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render auth page if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const handleLogin = async (data: any) => {
    console.log('🔐 handleLogin called with data:', data)
    setError('')
    setIsSubmitting(true)
    try {
      console.log('🔐 Calling login function...')
      await login(data.email, data.password)
      console.log('🔐 Login successful, redirecting...')
      router.push('/dashboard')
    } catch (error) {
      console.error('🔐 Login error:', error)
      setError('Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (data: any) => {
    setError('')
    setIsSubmitting(true)
    try {
      await signup(data.email, data.password, data.name, data.hotelName)
      setShowEmailConfirmation(true)
    } catch (error) {
      console.error('Signup error:', error)
      setError('Signup failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-8"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="text-center"
            variants={fadeInUp}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-heading font-bold gradient-text">Verity</h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Secure attestation and verification system
            </p>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
          >
            <Card className="glass-panel">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a confirmation link to your email address. Please click the link to activate your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmailConfirmation(false)}
                  >
                    Back to Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="max-w-md w-full space-y-8"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          className="text-center"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold gradient-text">Verity</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure attestation and verification system
          </p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
        >
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-panel">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

          <TabsContent value="login">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Sign in to access your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form 
                    onSubmit={(e) => {
                      console.log('🔐 Form submit event fired')
                      e.preventDefault()
                      loginForm.handleSubmit(
                        (data) => {
                          console.log('🔐 Form validation passed, calling handleLogin')
                          handleLogin(data)
                        },
                        (errors) => {
                          console.error('🔐 Form validation failed:', errors)
                          setError('Please check your email and password.')
                        }
                      )()
                    }} 
                    className="space-y-4"
                  >
                    <FormField
                      control={loginForm.control}
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
                      control={loginForm.control}
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


                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        console.log('🔐 Sign In button clicked, isSubmitting:', isSubmitting)
                        // Don't prevent default - let form handle it
                        // But log for debugging
                        const form = e.currentTarget.closest('form')
                        if (form) {
                          console.log('🔐 Form found, checking validity...')
                          // Trigger validation manually if needed
                          loginForm.trigger()
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <motion.div
                          variants={spin}
                          animate="animate"
                        >
                          <Loader2 className="w-4 h-4 mr-2" />
                        </motion.div>
                      ) : null}
                      Sign In
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="link"
                        className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                        asChild
                      >
                        <Link href="/auth/forgot">
                          Forgot your password?
                        </Link>
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Sign up to get started with Verity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
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

                    <FormField
                      control={signupForm.control}
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
                      control={signupForm.control}
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
                      control={signupForm.control}
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
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          variants={spin}
                          animate="animate"
                        >
                          <Loader2 className="w-4 h-4 mr-2" />
                        </motion.div>
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  )
}
