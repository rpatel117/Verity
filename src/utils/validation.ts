/**
 * Input Validation Utilities
 *
 * Provides validation functions for user input to ensure data integrity
 * and security. All validation happens at the UI layer before API calls.
 */

import { VALIDATION } from "./constants"

/**
 * Validates last 4 digits of credit card
 * Must be exactly 4 numeric digits
 */
export function validateCreditCardLast4(value: string): boolean {
  const cleaned = value.replace(/\s/g, "")
  return /^\d{4}$/.test(cleaned)
}

/**
 * Validates driver's license number
 * Accepts alphanumeric characters, typically 5-20 characters
 */
export function validateDriversLicense(value: string): boolean {
  const cleaned = value.trim()
  return (
    cleaned.length >= VALIDATION.DRIVERS_LICENSE_MIN_LENGTH &&
    cleaned.length <= VALIDATION.DRIVERS_LICENSE_MAX_LENGTH &&
    /^[A-Za-z0-9]+$/.test(cleaned)
  )
}

/**
 * Validates phone number
 * Accepts various formats, ensures at least 10 digits
 */
export function validatePhoneNumber(value: string): boolean {
  const digitsOnly = value.replace(/\D/g, "")
  return digitsOnly.length >= VALIDATION.PHONE_NUMBER_MIN_LENGTH
}

/**
 * Formats phone number to E.164 format for Twilio
 * Example: (555) 123-4567 -> +15551234567
 */
export function formatPhoneNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, "")
  // Assume US number if no country code
  return digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+1${digitsOnly}`
}

/**
 * Validates SMS verification code
 * Must be exactly 6 numeric digits
 */
export function validateSmsCode(value: string): boolean {
  const cleaned = value.replace(/\s/g, "")
  return /^\d{6}$/.test(cleaned)
}

/**
 * Sanitizes string input to prevent injection attacks
 * Removes potentially dangerous characters
 */
export function sanitizeInput(value: string): string {
  return value
    .trim()
    .replace(/[<>"']/g, "") // Remove HTML/script injection characters
    .slice(0, 255) // Limit length
}
