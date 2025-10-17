/**
 * Check-In Page
 * 
 * Modern check-in page with two-column layout and micro-interactions
 */

"use client"

import { useState } from 'react'
import { CheckInForm } from '@/components/checkin/CheckInForm'
import { CodeVerification } from '@/components/checkin/CodeVerification'
// import { motion } from 'framer-motion'
// import { fadeInUp } from '@/lib/motion'

export default function CheckInPage() {
  const [showCodeVerification, setShowCodeVerification] = useState(false)
  const [isCheckInComplete, setIsCheckInComplete] = useState(false)

  const handleSmsSent = () => {
    setShowCodeVerification(true)
  }

  const handleCheckInComplete = () => {
    setIsCheckInComplete(true)
    setShowCodeVerification(false)
  }

  const handleNewCheckIn = () => {
    setIsCheckInComplete(false)
    setShowCodeVerification(false)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Guest Check-In
        </h1>
        <p className="text-sm text-gray-600">
          Create and send attestation SMS to guests for verification
        </p>
      </div>
      
      <div className="space-y-6">
        {!isCheckInComplete && (
          <CheckInForm onSmsSent={handleSmsSent} />
        )}
        {showCodeVerification && !isCheckInComplete && (
          <CodeVerification onVerificationComplete={handleCheckInComplete} />
        )}
        {isCheckInComplete && (
          <div className="text-center py-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Guest Successfully Checked In!
              </h3>
              <p className="text-green-700 mb-4">
                The verification code has been confirmed and the guest is now checked in.
              </p>
              <button
                onClick={handleNewCheckIn}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Check In Another Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
