/**
 * Reports Page
 * 
 * Modern report builder with gradient animations and success states
 */

"use client"

import { useState, useEffect } from 'react'
import { ReportBuilder } from '@/components/reports/ReportBuilder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Clock, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'sonner'
// import { motion } from 'framer-motion'
// import { fadeInUp, staggerChildren, staggerItem } from '@/lib/motion'

interface RecentReport {
  id: string
  attestation_ids: string[]
  storage_path: string
  generated_at: string
  generated_by: string
}

export default function ReportsPage() {
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  // Load recent reports
  useEffect(() => {
    const loadRecentReports = async () => {
      try {
        setLoadingReports(true)
        
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .order('generated_at', { ascending: false })
          .limit(10)

        if (error) {
          throw error
        }

        setRecentReports(data || [])
      } catch (error) {
        console.error('Failed to load recent reports:', error)
        toast.error('Failed to load recent reports')
      } finally {
        setLoadingReports(false)
      }
    }

    loadRecentReports()
  }, [])

  const generateDownloadUrl = async (reportId: string) => {
    try {
      // Generate a new signed URL for the report
      const { data, error } = await supabase.storage
        .from('verity-reports')
        .createSignedUrl(`reports/${reportId}.pdf`, 3600) // 1 hour expiry

      if (error) {
        throw error
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to generate download URL:', error)
      toast.error('Failed to generate download link')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      {/* Recent Reports */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Your last 10 generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReports ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading reports...</p>
              </div>
            ) : recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Report {report.id.slice(0, 8)}...
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(report.generated_at)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {report.attestation_ids.length} attestation{report.attestation_ids.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateDownloadUrl(report.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">No reports generated yet</p>
                <p className="text-xs text-gray-500">Generate your first report above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
