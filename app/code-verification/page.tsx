"use client"

/**
 * Code Verification Page
 * 
 * Screen where guests enter the SMS verification code
 */

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CodeVerification() {
  const router = useRouter()
  
  // Form state
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  /**
   * Handles code verification
   */
  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Please enter a 6-digit code")
      return
    }

    if (!policyAccepted) {
      setShowPolicyModal(true)
      return
    }

    setLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate verification (accept any 6-digit code in demo)
      if (code.length === 6) {
        router.push("/confirmation")
      } else {
        setError("Invalid verification code. Please try again.")
      }
    } catch (error) {
      console.error("Error:", error)
      setError("Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handles policy acceptance
   */
  const handlePolicyAccept = () => {
    setPolicyAccepted(true)
    setShowPolicyModal(false)
    handleVerify()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Enter Verification Code
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            A 6-digit code was sent to{" "}
            <span className="font-semibold text-indigo-600">(555) 123-4567</span>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setError("")
              }}
              className="mt-1 block w-full px-3 py-3 text-center text-2xl font-semibold border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 tracking-widest"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowPolicyModal(true)}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              {policyAccepted ? "✓ Privacy policy accepted" : "View privacy policy"}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Complete Check-In"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">Didn't receive the code?</p>
            <button
              type="button"
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>

      {/* Privacy Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Privacy Policy
              </h3>
              <div className="max-h-96 overflow-y-auto text-sm text-gray-600 mb-4">
                <p className="mb-4">
                  By providing your information for hotel check-in, you consent to the collection and processing of your personal data as described below.
                </p>
                <p className="mb-4">
                  <strong>Information We Collect:</strong> We collect your credit card information (last 4 digits), driver's license number, and phone number for verification purposes.
                </p>
                <p className="mb-4">
                  <strong>How We Use It:</strong> This information is used solely for verifying your identity during the check-in process and is not stored beyond the verification period.
                </p>
                <p className="mb-4">
                  <strong>Data Security:</strong> All information is encrypted and transmitted securely. We do not share your personal information with third parties.
                </p>
                <p>
                  <strong>Contact:</strong> If you have questions about this policy, please contact our front desk.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPolicyModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400"
                >
                  Decline
                </button>
                <button
                  onClick={handlePolicyAccept}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

