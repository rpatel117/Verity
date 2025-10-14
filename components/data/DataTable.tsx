/**
 * Compact Data Table Component
 * 
 * Optimized for clerks with better visibility and compact layout
 */

"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  MoreHorizontal, 
  Plus, 
  Copy, 
  Loader2 
} from 'lucide-react'

interface AttestationRow {
  id: string
  guest: {
    fullName: string
    phoneE164: string
  }
  ccLast4: string
  checkInDate: string
  checkOutDate: string
  status: 'sent' | 'verified' | 'expired'
  sentAt: string
  verifiedAt?: string
  eventsCount: number
}

interface DataTableProps {
  data?: AttestationRow[]
  loading?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
}

export function DataTable({ data = [], loading = false, onSelectionChange }: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const handleAddToReport = (attestationId: string) => {
    const newSelection = selectedRows.includes(attestationId)
      ? selectedRows.filter(id => id !== attestationId)
      : [...selectedRows, attestationId]

    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const handleCopyId = async (attestationId: string) => {
    try {
      await navigator.clipboard.writeText(attestationId)
      console.log('ID copied to clipboard')
    } catch (error) {
      console.error('Failed to copy ID:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      sent: { className: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Sent' },
      verified: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Verified' },
      expired: { className: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Expired' }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.sent

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Loading attestations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Selection Summary */}
      {selectedRows.length > 0 && (
        <Card className="p-3">
          <CardContent className="pt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedRows.length} attestation{selectedRows.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs text-gray-600">
                  Ready to generate report
                </p>
              </div>
              <Button variant="default" size="sm">
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compact Table */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Guest</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Phone</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">CC</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Check-in</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Check-out</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Status</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Sent</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Events</TableHead>
              <TableHead className="text-xs font-medium text-gray-600 py-2 px-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  <TableCell className="py-2 px-3 text-sm font-medium text-gray-900">
                    {row.guest.fullName}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm text-gray-600">
                    {row.guest.phoneE164}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm font-mono text-gray-600">
                    ****{row.ccLast4}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm text-gray-600">
                    {formatDate(row.checkInDate)}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm text-gray-600">
                    {formatDate(row.checkOutDate)}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    {getStatusBadge(row.status)}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm text-gray-600">
                    {formatDate(row.sentAt)}
                  </TableCell>
                  <TableCell className="py-2 px-3 text-sm text-gray-600">
                    {row.eventsCount}
                  </TableCell>
                  <TableCell className="py-2 px-3">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToReport(row.id)}
                        className="h-7 w-7 p-0 hover:bg-blue-50"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyId(row.id)}
                        className="h-7 w-7 p-0 hover:bg-gray-50"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-50">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-16 text-center">
                  <p className="text-gray-500 text-sm">No attestations found.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Compact Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {data.length} attestations
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}