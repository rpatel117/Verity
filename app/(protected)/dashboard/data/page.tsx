/**
 * Data Table Page
 * 
 * Modern data table with filters, animated rows, and status badges
 */

"use client"

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/data/DataTable'
import { Filters } from '@/components/data/Filters'
import { listAttestations, type AttestationRow } from '@/lib/api'
import { toast } from 'sonner'
// import { motion } from 'framer-motion'
// import { fadeInUp, staggerChildren, staggerItem } from '@/lib/motion'

export default function DataPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [data, setData] = useState<AttestationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    query: '',
    from: '',
    to: '',
    status: ''
  })
  const [cursor, setCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(false)

  const loadData = async (reset = false) => {
    try {
      setLoading(true)
      
      const response = await listAttestations({
        query: filters.query || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        status: filters.status || undefined,
        cursor: reset ? undefined : cursor
      })

      if (reset) {
        setData(response.data)
      } else {
        setData(prev => [...prev, ...response.data])
      }
      
      setHasMore(!!response.nextCursor)
      setCursor(response.nextCursor)
    } catch (error) {
      console.error('Failed to load attestations:', error)
      toast.error('Failed to load attestations')
    } finally {
      setLoading(false)
    }
  }

  // Load data on mount and when filters change
  useEffect(() => {
    loadData(true)
  }, [filters])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCursor(undefined)
    setHasMore(false)
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadData(false)
    }
  }

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
          <Filters 
            filters={filters}
            onFiltersChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Data Table */}
      <div>
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <DataTable
            data={data}
            loading={loading}
            onSelectionChange={setSelectedIds}
            onLoadMore={hasMore ? handleLoadMore : undefined}
            hasMore={hasMore}
          />
        </div>
      </div>
    </div>
  )
}
