/**
 * Reports Page
 * 
 * Modern report builder with gradient animations and success states
 */

import { ReportBuilder } from '@/components/reports/ReportBuilder'
// import { motion } from 'framer-motion'
// import { fadeInUp, staggerChildren, staggerItem } from '@/lib/motion'

export default function ReportsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Report Generator
          </h1>
          <p className="text-sm text-gray-600">
            Generate PDF reports for selected attestations
          </p>
        </div>
      </div>

      {/* Report Builder */}
      <div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <ReportBuilder />
        </div>
      </div>
    </div>
  )
}
