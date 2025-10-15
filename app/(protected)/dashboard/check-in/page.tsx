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

  const handleSmsSent = () => {
    setShowCodeVerification(true)
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
        <CheckInForm onSmsSent={handleSmsSent} />
        {showCodeVerification && <CodeVerification />}
      </div>
    </div>
  )
}
