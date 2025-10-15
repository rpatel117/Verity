/**
 * Public Guest Attestation Page
 * 
 * Warm, friendly UI for guest consent flow with modern animations
 */

"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { initGuest, sendGuestEvent, confirmGuest } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import { fadeInUp, scaleIn, checkmark, spin } from '@/lib/motion'
import { Loader2, MapPin, Shield, Copy, Check, Heart } from 'lucide-react'
import { POLICY_TITLE, POLICY_TEXT, GUEST_CODE_INSTRUCTION } from '@/lib/constants'

interface GuestPageState {
  status: 'loading' | 'error' | 'policy' | 'success'
  policyText: string
  code?: string
  error?: string
}

export default function GuestPage() {
  const params = useParams()
  const token = params.token as string
  
  const [state, setState] = useState<GuestPageState>({
    status: 'loading',
    policyText: POLICY_TEXT
  })
  
  const [accepted, setAccepted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const initializeGuest = async () => {
      try {
        // For development, skip Edge Function calls and use mock data
        console.log('Initializing guest with token:', token)
        
        // Mock the guest initialization for development
        if (token.startsWith('dev_token_')) {
          setState({
            status: 'policy',
            policyText: POLICY_TEXT
          })
        } else {
          setState({
            status: 'error',
            error: 'Invalid or expired token'
          })
        }
      } catch (error) {
        console.error('Guest initialization failed:', error)
        setState({
          status: 'error',
          error: 'Failed to load attestation page'
        })
      }
    }

    initializeGuest()
  }, [token])

  const handleContinue = async () => {
    try {
      // For development, generate a mock 6-digit code
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      setState({
        status: 'success',
        policyText: POLICY_TEXT,
        code: mockCode
      })
    } catch (error) {
      console.error('Confirmation failed:', error)
      setState({
        status: 'error',
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
        <motion.div 
          className="text-center"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <motion.div
            variants={spin}
            animate="animate"
          >
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-primary" />
          </motion.div>
          <p className="text-sm text-muted-foreground">Loading attestation...</p>
        </motion.div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
        >
          <Card className="w-full max-w-md glass-panel">
            <CardHeader>
              <CardTitle className="text-error flex items-center">
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
        </motion.div>
      </div>
    )
  }

  if (state.status === 'policy') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 py-12 px-4">
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
        >
          <Card className="w-full max-w-2xl glass-panel">
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
              <motion.div 
                className="bg-muted/30 p-6 rounded-lg border"
                variants={fadeInUp}
              >
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {state.policyText}
                </p>
              </motion.div>

              <motion.div 
                className="flex items-start space-x-3"
                variants={fadeInUp}
              >
                <Checkbox
                  id="accept"
                  checked={accepted}
                  onCheckedChange={setAccepted}
                  className="mt-1"
                />
                <label htmlFor="accept" className="text-sm text-foreground leading-relaxed">
                  I confirm I am the authorized cardholder or their agent, consent to applicable charges for the stated dates, and agree that Verity may record IP & geolocation for fraud-prevention.
                </label>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  onClick={handleContinue}
                  disabled={!accepted}
                  className="w-full"
                  variant="gradient"
                  size="lg"
                >
                  Continue
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (state.status === 'success' && state.code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-success/5 to-primary/5 py-12 px-4">
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
        >
          <Card className="w-full max-w-md glass-panel">
            <CardHeader>
              <motion.div 
                className="text-center"
                variants={fadeInUp}
              >
                <motion.div
                  variants={checkmark}
                  initial="initial"
                  animate="animate"
                  className="mx-auto mb-4"
                >
                  <Heart className="h-12 w-12 text-success mx-auto" />
                </motion.div>
                <CardTitle className="text-success text-2xl">
                  Attestation Complete
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your verification code is ready
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div 
                className="text-center"
                variants={fadeInUp}
              >
                <div className="bg-accent/10 p-8 rounded-lg border-2 border-accent/20">
                  <p className="text-sm text-muted-foreground mb-3">Your Code:</p>
                  <p className="text-4xl font-mono font-bold text-foreground gradient-text">
                    {state.code}
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Button
                  onClick={copyCode}
                  variant="gradient"
                  className="w-full"
                  size="lg"
                >
                  {copied ? (
                    <>
                      <motion.div
                        variants={checkmark}
                        initial="initial"
                        animate="animate"
                      >
                        <Check className="mr-2 h-4 w-4" />
                      </motion.div>
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div 
                className="text-center"
                variants={fadeInUp}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {GUEST_CODE_INSTRUCTION}
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return null
}
