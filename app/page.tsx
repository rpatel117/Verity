"use client"

/**
 * Hotel Check-In App - Main Page
 * 
 * A simplified Next.js version of the hotel check-in application
 * for frontend demonstration purposes.
 */

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HotelCheckIn() {
  const router = useRouter()
  
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

  /**
   * Validates all form fields
   */
  const validateForm = (): boolean => {
    const newErrors = {
      creditCard: "",
      driversLicense: "",
      phone: "",
    }

    let isValid = true

    if (!/^\d{4}$/.test(creditCardLast4)) {
      newErrors.creditCard = "Please enter exactly 4 digits"
      isValid = false
    }

    if (!driversLicense.trim()) {
      newErrors.driversLicense = "Driver's license is required"
      isValid = false
    }

    if (!/^\d{10,}$/.test(phoneNumber.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
      isValid = false
    }

    setErrors(newErrors)
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
      
      // Navigate to verification screen
      router.push("/code-verification")
      
      alert("Verification code sent! (Demo mode)")
    } catch (error) {
      console.error("Error:", error)
      alert("Error sending verification code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hotel Check-In
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
  )
}