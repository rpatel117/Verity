/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email
 */

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setError('')
    setIsSuccess(false)

    try {
      await forgotPassword(data.email)
      setIsSuccess(true)
    } catch (error) {
      console.error('Forgot password failed:', error)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                If you don't see the email, check your spam folder or try again.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsSuccess(false)
                  form.reset()
                }}
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                asChild
              >
                <Link href="/auth">
                  Back to Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="p-0 h-auto"
            >
              <Link href="/auth">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
          </div>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
