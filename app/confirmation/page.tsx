"use client"

/**
 * Confirmation Page
 * 
 * Success screen after check-in completion
 */

import { useRouter } from "next/navigation"

export default function Confirmation() {
  const router = useRouter()

  const handleNewCheckIn = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check-In Complete!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Guest verification successful
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Check-In ID:</span>
              <span className="text-sm text-gray-900 font-mono">CHK-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Verified At:</span>
              <span className="text-sm text-gray-900">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleNewCheckIn}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-900 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start New Check-In
          </button>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-800">
              <strong>Success!</strong> The guest has been successfully verified and checked in. All information has been securely processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

