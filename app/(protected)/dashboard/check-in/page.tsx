/**
 * Check-In Page
 * 
 * Modern check-in page with two-column layout and micro-interactions
 */

import { CheckInForm } from '@/components/checkin/CheckInForm'
// import { motion } from 'framer-motion'
// import { fadeInUp } from '@/lib/motion'

export default function CheckInPage() {
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
      
      <CheckInForm />
    </div>
  )
}
