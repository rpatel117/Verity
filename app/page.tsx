"use client"

/**
 * Hotel Check-In App - Main Page
 * 
 * A simplified Next.js version of the hotel check-in application
 * for frontend demonstration purposes.
 */

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/src/context/AuthContext"
import { LoginModal } from "@/src/components/LoginModal"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

export default function HotelCheckIn() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  
  // Authentication state
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // Form state
  const [creditCardLast4, setCreditCardLast4] = useState("")
  const [driversLicense, setDriversLicense] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Validation errors
  const [errors, setErrors] = useState({
    creditCard: "",
    driversLicense: "",
    phone: "",
  })
  
  // Loading state
  const [loading, setLoading] = useState(false)

  // Show login modal if not authenticated
  useEffect(() => {
    console.log('Page: useEffect running', { isLoading, isAuthenticated })
    if (!isLoading && !isAuthenticated) {
      console.log('Page: Showing login modal')
      setShowLoginModal(true)
    } else if (isAuthenticated) {
      console.log('Page: Hiding login modal')
      setShowLoginModal(false)
    }
  }, [isAuthenticated, isLoading])

  /**
   * Validates all form fields
   */
  const validateForm = (): boolean => {
    const newErrors = {
      creditCard: "",
      driversLicense: "",
      phone: "",
    }

    // Validate credit card (last 4 digits)
    if (!/^\d{4}$/.test(creditCardLast4)) {
      newErrors.creditCard = "Please enter the last 4 digits of the credit card"
    }

    // Validate driver's license
    if (!driversLicense.trim()) {
      newErrors.driversLicense = "Driver's license number is required"
    }

    // Validate phone number (at least 10 digits)
    if (!/^\d{10,}$/.test(phoneNumber.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    const isValid = !Object.values(newErrors).some(error => error !== "")
    return isValid
  }

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Navigate to verification page
      router.push("/code-verification")
    } catch (error) {
      console.error("Error:", error)
      alert("Error sending verification code")
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hotel Check-In System</h1>
          <p className="text-gray-600 mb-6">Please authenticate to continue</p>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
          </div>
        </div>
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => {}} // Prevent closing without authentication
          preventClose={true}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and logout */}
      {isAuthenticated && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Hotel Check-In</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{user?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Guest Check-In
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter guest information to begin verification
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="creditCard" className="block text-sm font-medium text-gray-700">
                  Credit Card (Last 4 Digits)
                </label>
                <input
                  id="creditCard"
                  type="text"
                  value={creditCardLast4}
                  onChange={(e) => setCreditCardLast4(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="1234"
                  maxLength={4}
                />
                {errors.creditCard && (
                  <p className="mt-1 text-sm text-red-600">{errors.creditCard}</p>
                )}
              </div>
              <div>
                <label htmlFor="driversLicense" className="block text-sm font-medium text-gray-700">
                  Driver's License Number
                </label>
                <input
                  id="driversLicense"
                  type="text"
                  value={driversLicense}
                  onChange={(e) => setDriversLicense(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="D1234567"
                />
                {errors.driversLicense && (
                  <p className="mt-1 text-sm text-red-600">{errors.driversLicense}</p>
                )}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> The guest will receive an SMS with a verification code and privacy policy link. They must share the code with you to complete check-in.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  )
}