import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalize phone number to E.164 format
 * Accepts formats like: (123) 456-7890, 123-456-7890, +1 123 456 7890, etc.
 * Returns E.164 format: +1234567890
 */
export function normalizePhoneToE164(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // If it already starts with +, return as is (assuming it's already E.164)
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // If it starts with 1 and has 11 digits, assume US number
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return '+' + cleaned
  }
  
  // If it has 10 digits, assume US number and add +1
  if (cleaned.length === 10) {
    return '+1' + cleaned
  }
  
  // If it has 11 digits without leading 1, assume US with leading 1
  if (cleaned.length === 11 && !cleaned.startsWith('1')) {
    return '+1' + cleaned
  }
  
  // For other cases, try to add +1 if it looks like a US number
  // Otherwise return with + prefix
  if (cleaned.length >= 10) {
    return '+' + cleaned
  }
  
  // Return as is if we can't normalize
  return phone
}
