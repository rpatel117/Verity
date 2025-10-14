/**
 * Compact Report Builder Component
 * 
 * Optimized for clerks with better visibility and compact layout
 */

"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ReportSchema, type ReportFormData } from '@/lib/validation'
import { generateReport } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Plus, 
  X, 
  Loader2, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react'

interface ReportBuilderProps {
  initialAttestationIds?: string[]
}

export function ReportBuilder({ initialAttestationIds = [] }: ReportBuilderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [attestationIds, setAttestationIds] = useState<string[]>(initialAttestationIds)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<{ reportId: string; downloadUrl: string } | null>(null)
  const [error, setError] = useState('')

  const form = useForm<ReportFormData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      attestationIds: initialAttestationIds,
    },
  })

  // Handle URL parameters for pre-selected IDs
  useEffect(() => {
    const idsParam = searchParams.get('ids')
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean)
      setAttestationIds(ids)
      form.setValue('attestationIds', ids)
    }
  }, [searchParams, form])

  const addAttestationId = (id: string) => {
    if (!attestationIds.includes(id)) {
      const newIds = [...attestationIds, id]
      setAttestationIds(newIds)
      form.setValue('attestationIds', newIds)
    }
  }

  const removeAttestationId = (id: string) => {
    const newIds = attestationIds.filter(existingId => existingId !== id)
    setAttestationIds(newIds)
    form.setValue('attestationIds', newIds)
  }

  const handleManualIdAdd = (id: string) => {
    if (id.trim() && !attestationIds.includes(id.trim())) {
      addAttestationId(id.trim())
      console.log('Attestation ID added')
    }
  }

  const onSubmit = async (data: ReportFormData) => {
    setIsGenerating(true)
    setError('')
    setIsSuccess(false)

    try {
      const response = await generateReport(data)
      setGeneratedReport(response)
      setIsSuccess(true)
      console.log('Report generated successfully!')

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to generate report:', error)
      setError('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    if (generatedReport?.downloadUrl) {
      window.open(generatedReport.downloadUrl, '_blank')
      console.log('Download started')
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected Attestations - Compact */}
      <Card className="p-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Selected Attestations
          </CardTitle>
          <CardDescription className="text-sm">
            Choose attestations to include in your report
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attestationIds.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {attestationIds.map((id) => (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-2 px-2 py-1 text-xs"
                  >
                    {id.slice(0, 8)}...
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeAttestationId(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                {attestationIds.length} attestation{attestationIds.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No attestations selected</p>
              <p className="text-xs">Add attestation IDs manually or select from the Data table</p>
            </div>
          )}

          {/* Manual ID Input - Compact */}
          <div className="mt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="attestationIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Add Attestation ID</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter attestation ID..."
                            className="text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const input = e.target as HTMLInputElement
                                if (input.value.trim()) {
                                  addAttestationId(input.value.trim())
                                  input.value = ''
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder="Enter attestation ID..."]') as HTMLInputElement
                              if (input?.value.trim()) {
                                addAttestationId(input.value.trim())
                                input.value = ''
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Generate Button */}
                <Button
                  type="submit"
                  disabled={isGenerating || attestationIds.length === 0}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>

      {/* Success State - Compact */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Report generated successfully!</p>
            <p className="text-xs text-green-600">Your PDF report is ready for download</p>
          </div>
        </div>
      )}

      {/* Generated Report - Compact */}
      {generatedReport && (
        <Card className="p-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center text-green-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              Report Generated Successfully
            </CardTitle>
            <CardDescription className="text-sm">
              Your PDF report is ready for download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-green-800">Report ID: {generatedReport.reportId}</p>
                  <p className="text-xs text-green-600">Ready for download</p>
                </div>
                <Button
                  onClick={downloadReport}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>

              <div className="text-xs text-gray-600">
                Report includes {attestationIds.length} attestation{attestationIds.length !== 1 ? 's' : ''} with full verification details and compliance data.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions - Compact */}
      <Card className="p-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription className="text-sm">
            Common report generation tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/data')}
              className="h-auto p-3 text-left hover:bg-blue-50"
            >
              <div>
                <div className="font-medium text-sm">Select from Data Table</div>
                <div className="text-xs text-gray-600">
                  Choose attestations from your data
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setAttestationIds([])
                setGeneratedReport(null)
                setIsSuccess(false)
                form.reset()
              }}
              className="h-auto p-3 text-left hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-sm">Clear Selection</div>
                <div className="text-xs text-gray-600">
                  Start over with new selection
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}