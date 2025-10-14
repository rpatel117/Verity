/**
 * Data Table Page
 * 
 * Modern data table with filters, animated rows, and status badges
 */

"use client"

import { useState } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Filters } from '@/components/data/Filters'
// import { motion } from 'framer-motion'
// import { fadeInUp, staggerChildren, staggerItem } from '@/lib/motion'

// Mock data for UI viewing
const mockData = [
  {
    id: "att_1",
    guest: { fullName: "John Doe", phoneE164: "+1234567890" },
    ccLast4: "1234",
    checkInDate: "2024-01-15",
    checkOutDate: "2024-01-17",
    status: "verified" as const,
    sentAt: "2024-01-15T10:00:00Z",
    verifiedAt: "2024-01-15T10:30:00Z",
    eventsCount: 3
  },
  {
    id: "att_2",
    guest: { fullName: "Jane Smith", phoneE164: "+1987654321" },
    ccLast4: "5678",
    checkInDate: "2024-01-16",
    checkOutDate: "2024-01-18",
    status: "sent" as const,
    sentAt: "2024-01-16T09:00:00Z",
    eventsCount: 1
  },
  {
    id: "att_3",
    guest: { fullName: "Bob Johnson", phoneE164: "+1555123456" },
    ccLast4: "9012",
    checkInDate: "2024-01-14",
    checkOutDate: "2024-01-16",
    status: "expired" as const,
    sentAt: "2024-01-14T08:00:00Z",
    eventsCount: 2
  }
]

export default function DataPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Attestation Data
          </h1>
          <p className="text-sm text-gray-600">
            View and manage guest attestations and verification events
          </p>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div className="bg-white border border-gray-200 rounded-md p-4">
          <Filters />
        </div>
      </div>

      {/* Data Table */}
      <div>
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <DataTable
            data={mockData}
            loading={false}
            onSelectionChange={setSelectedIds}
          />
        </div>
      </div>
    </div>
  )
}
