/**
 * Check-In Form Component
 * 
 * Compact form optimized for clerks with better visibility
 */

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckInSchema, type CheckInFormData } from '@/lib/validation'
import { sendAttestation } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Send, Calendar, User, Phone, CreditCard, FileText, CheckCircle } from 'lucide-react'
import { POLICY_TEXT } from '@/lib/constants'

interface CheckInFormProps {
  onSmsSent?: () => void
}

export function CheckInForm({ onSmsSent }: CheckInFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<CheckInFormData>({
    resolver: zodResolver(CheckInSchema),
    defaultValues: {
      fullName: '',
      phoneE164: '',
      ccLast4: '',
      dlNumber: '',
      dlState: '',
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      policyText: POLICY_TEXT,
    },
  })

  const onSubmit = async (data: CheckInFormData) => {
    console.log('📝 CheckInForm: onSubmit called with data:', data)
    console.log('📝 CheckInForm: isSubmitting was:', isSubmitting)
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('📝 CheckInForm: Already submitting, ignoring duplicate call')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    setIsSuccess(false)

    try {
      console.log('📝 CheckInForm: About to call sendAttestation API')
      const response = await sendAttestation(data)
      console.log('📝 CheckInForm: sendAttestation API returned:', response)

      console.log('Attestation sent successfully!', {
        description: `SMS sent to ${data.phoneE164}. Guest ID: ${response.guestId}`,
        action: {
          label: 'View in Data',
          onClick: () => router.push('/dashboard/data'),
        },
      })

      setIsSuccess(true)
      form.reset()
      
      // Show code verification section
      onSmsSent?.()

      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to send attestation:', error)
      setError('Failed to send attestation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Compact Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Guest Details - Left Column */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter guest's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneE164"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input placeholder="+1234567890" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="dlNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">License #</FormLabel>
                        <FormControl>
                          <Input placeholder="D1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dlState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">State</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stay Details - Right Column */}
            <Card className="p-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Stay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <FormField
                  control={form.control}
                  name="ccLast4"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Credit Card Last 4</FormLabel>
                      <FormControl>
                        <Input placeholder="1234" maxLength={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="checkInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Check-in</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              type="date"
                              className="pl-10"
                              {...field}
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="checkOutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Check-out</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                              type="date"
                              className="pl-10"
                              {...field}
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Policy Text - Compact */}
          <Card className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Policy Text
              </CardTitle>
              <CardDescription className="text-sm">
                This text will be sent to the guest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="policyText"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter policy text..."
                        className="min-h-[80px] text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                Attestation sent successfully!
              </span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Attestation SMS
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}