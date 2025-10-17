/**
 * Public Guest Attestation Page
 * 
 * Warm, friendly UI for guest consent flow with modern animations
 */

"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, Copy, Check, Heart } from 'lucide-react'

interface GuestPageState {
  status: 'loading' | 'error' | 'policy' | 'success'
  policyText: string
  code?: string
  error?: string
}

const POLICY_TITLE = "Verity Attestation & Payment Consent";
const POLICY_TEXT = "I confirm I am the authorized cardholder or their agent, consent to applicable charges for the stated dates, and agree that Verity may record IP & geolocation for fraud-prevention.";
const GUEST_CODE_INSTRUCTION = "Provide this code to the hotel clerk to complete check-in.";

export default function GuestPage() {
  const params = useParams()
  const rawToken = params.token as string
  // Decode the URL-encoded JWT token
  const token = rawToken ? decodeURIComponent(rawToken) : ''
  
  const [state, setState] = useState<GuestPageState>({
    status: 'loading',
    policyText: POLICY_TEXT
  })
  
  const [accepted, setAccepted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const initializeGuest = async () => {
      try {
        console.log('Initializing guest with token:', token)
        console.log('Token length:', token?.length)
        console.log('Token type:', typeof token)

        // Check if token looks like a JWT (has dots)
        if (!token || typeof token !== 'string') {
          setState({
            status: 'error',
            policyText: POLICY_TEXT,
            error: 'Invalid token format'
          })
          return
        }

        // Capture IP address and geolocation
        const captureLocation = async () => {
          try {
            // Get IP address
            const ipResponse = await fetch('https://api.ipify.org?format=json')
            const ipData = await ipResponse.json()
            const ip = ipData.ip

            // Get geolocation
            let latitude, longitude, accuracy
            if (navigator.geolocation) {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 300000 // 5 minutes
                })
              })
              latitude = position.coords.latitude
              longitude = position.coords.longitude
              accuracy = position.coords.accuracy
            }

            return { ip, latitude, longitude, accuracy }
          } catch (error) {
            console.log('Location capture failed:', error)
            return { ip: null, latitude: null, longitude: null, accuracy: null }
          }
        }

        const locationData = await captureLocation()

        // Call the guest_init edge function to validate the token
        const { supabase } = await import('@/lib/supabaseClient')
        const { data, error } = await supabase.functions.invoke('guest_init', {
          body: { token }
        })

        console.log('Guest init response:', { data, error })

        if (error || !data?.valid) {
          setState({
            status: 'error',
            policyText: POLICY_TEXT,
            error: 'Invalid or expired token'
          })
          return
        }

        // Log page open event with location data
        try {
          await supabase.functions.invoke('guest_event', {
            body: {
              token,
              eventType: 'page.open',
              ip: locationData.ip,
              userAgent: navigator.userAgent,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy
            }
          })
        } catch (logError) {
          console.log('Failed to log page open event:', logError)
        }

        setState({
          status: 'policy',
          policyText: data.policyText || POLICY_TEXT
        })
      } catch (error) {
        console.error('Guest initialization failed:', error)
        setState({
          status: 'error',
          policyText: POLICY_TEXT,
          error: 'Failed to load attestation page'
        })
      }
    }

    initializeGuest()
  }, [token])

  const handleContinue = async () => {
    try {
      // Call the guest_confirm edge function
      const { supabase } = await import('@/lib/supabaseClient')
      const { data, error } = await supabase.functions.invoke('guest_confirm', {
        body: {
          token,
          accepted: true
        }
      })

      if (error || !data?.ok) {
        setState({
          status: 'error',
          policyText: POLICY_TEXT,
          error: 'Failed to confirm attestation'
        })
        return
      }

      // Log policy acceptance event
      try {
        await supabase.functions.invoke('guest_event', {
          body: {
            token,
            eventType: 'policy.accept',
            ip: null, // We already captured this on page load
            userAgent: navigator.userAgent
          }
        })
      } catch (logError) {
        console.log('Failed to log policy acceptance event:', logError)
      }

      setState({
        status: 'success',
        policyText: POLICY_TEXT,
        code: data.code
      })
    } catch (error) {
      console.error('Confirmation failed:', error)
      setState({
        status: 'error',
        policyText: POLICY_TEXT,
        error: 'Failed to confirm attestation'
      })
    }
  }

  const copyCode = async () => {
    if (state.code) {
      await navigator.clipboard.writeText(state.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading attestation...</p>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {state.error || 'An error occurred'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.status === 'policy') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              {POLICY_TITLE}
            </CardTitle>
            <CardDescription>
              Please review and accept the terms to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-lg border">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {state.policyText}
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
                className="mt-1"
              />
              <label htmlFor="accept" className="text-sm text-foreground leading-relaxed">
                I confirm I am the authorized cardholder or their agent, consent to applicable charges for the stated dates, and agree that Verity may record IP & geolocation for fraud-prevention.
              </label>
            </div>

            <Button
              onClick={handleContinue}
              disabled={!accepted}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.status === 'success' && state.code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <Heart className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-600 text-2xl">
                Attestation Complete
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your verification code is ready
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-muted-foreground mb-3">Your Code:</p>
                <p className="text-4xl font-mono font-bold text-foreground">
                  {state.code}
                </p>
              </div>
            </div>

            <Button
              onClick={copyCode}
              className="w-full"
              size="lg"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {GUEST_CODE_INSTRUCTION}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
