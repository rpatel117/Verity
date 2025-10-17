/**
 * Code Verification Component
 * 
 * Allows clerks to verify 6-digit codes from guests
 */

"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { verifyAttestationCode, listAttestations } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Key, Clock } from 'lucide-react'
import { toast } from 'sonner'

const CodeVerificationSchema = z.object({
  attestationId: z.string().min(1, "Please select an attestation"),
  code: z.string().length(6, "Code must be 6 digits"),
})

type CodeVerificationFormData = z.infer<typeof CodeVerificationSchema>

interface AttestationOption {
  id: string
  guestName: string
  phone: string
  sentAt: string
  status: string
}

interface CodeVerificationProps {
  onVerificationComplete?: () => void
}

export function CodeVerification({ onVerificationComplete }: CodeVerificationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const [attestationOptions, setAttestationOptions] = useState<AttestationOption[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  const form = useForm<CodeVerificationFormData>({
    resolver: zodResolver(CodeVerificationSchema),
    defaultValues: {
      attestationId: '',
      code: '',
    },
  })

  // Load recent attestations for selection
  useEffect(() => {
    const loadAttestations = async () => {
      setIsLoadingOptions(true)
      try {
        // Only load attestations from the last 24 hours
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const fromDate = yesterday.toISOString().split('T')[0]
        
        const response = await listAttestations({ 
          status: 'sent',
          from: fromDate,
          cursor: undefined 
        })
        
        // Filter to only show recent attestations (last 24 hours) and limit to 10
        const recentAttestations = response.data
          .filter(attestation => {
            const sentDate = new Date(attestation.sentAt)
            const now = new Date()
            const hoursDiff = (now.getTime() - sentDate.getTime()) / (1000 * 60 * 60)
            return hoursDiff <= 24 // Only show attestations from last 24 hours
          })
          .slice(0, 10) // Limit to 10 most recent
        
        const options: AttestationOption[] = recentAttestations.map(attestation => ({
          id: attestation.id,
          guestName: attestation.guest.fullName,
          phone: attestation.guest.phoneE164,
          sentAt: new Date(attestation.sentAt).toLocaleString(),
          status: attestation.status
        }))
        
        setAttestationOptions(options)
        
        // Auto-select the most recent one
        if (options.length > 0) {
          form.setValue('attestationId', options[0].id)
        }
      } catch (error) {
        console.error('Failed to load attestations:', error)
        toast.error('Failed to load attestations')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadAttestations()
  }, [form])

  const onSubmit = async (data: CodeVerificationFormData) => {
    setIsSubmitting(true)
    setError('')
    setIsVerified(false)

    try {
      // TEST CODE: Always accept 117001 as valid
      if (data.code === '117001') {
        console.log('🧪 TEST MODE: Accepting code 117001 as valid')
        setIsVerified(true)
        toast.success('Guest successfully checked in! (TEST MODE)')
        
        // Call the completion callback
        onVerificationComplete?.()
        
        // Reset form after successful verification
        setTimeout(() => {
          form.reset()
          setIsVerified(false)
        }, 3000)
        return
      }

      console.log('🔍 Calling verifyAttestationCode with:', { attestationId: data.attestationId, code: data.code })
      const result = await verifyAttestationCode({
        attestationId: data.attestationId,
        code: data.code
      })

      console.log('📥 verifyAttestationCode result:', result)

      if (result.ok) {
        console.log('✅ Verification successful')
        setIsVerified(true)
        toast.success('Guest successfully checked in!')
        
        // Call the completion callback
        onVerificationComplete?.()
        
        // Reset form after successful verification
        setTimeout(() => {
          form.reset()
          setIsVerified(false)
        }, 3000)
      } else {
        console.log('❌ Verification failed:', result.reason)
        setError(result.reason || 'Invalid code. Please try again.')
        toast.error('Verification failed')
      }
    } catch (error) {
      console.error('🔥 Code verification failed:', error)
      setError('Failed to verify code. Please try again.')
      toast.error('Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedAttestation = attestationOptions.find(
    option => option.id === form.watch('attestationId')
  )

  return (
    <Card className="p-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Key className="mr-2 h-4 w-4" />
          Code Verification
        </CardTitle>
        <CardDescription className="text-sm">
          Enter the 6-digit code provided by the guest. Only recent attestations (last 24 hours) are shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Attestation Selection */}
            <FormField
              control={form.control}
              name="attestationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Select Attestation</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || isVerified}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a recent attestation..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingOptions ? (
                          <SelectItem value="loading" disabled>
                            <div className="flex items-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </div>
                          </SelectItem>
                        ) : attestationOptions.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No recent attestations (last 24 hours)
                          </SelectItem>
                        ) : (
                          attestationOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{option.guestName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {option.phone} • {option.sentAt}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selected Attestation Info */}
            {selectedAttestation && (
              <div className="bg-muted/30 p-3 rounded-md text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedAttestation.guestName}</span>
                  <span className="text-muted-foreground">{selectedAttestation.phone}</span>
                </div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  Sent: {selectedAttestation.sentAt}
                </div>
              </div>
            )}

            {/* 6-Digit Code Input */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Verification Code</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isSubmitting || isVerified}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {isVerified && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 text-sm font-medium">
                  Code verified successfully!
                </span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || isVerified || !form.watch('attestationId')}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : isVerified ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verified
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
