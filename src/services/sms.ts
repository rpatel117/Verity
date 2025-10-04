/**
 * SMS Service
 *
 * Handles SMS verification code sending and validation via Twilio.
 * All Twilio operations are performed through Supabase Edge Functions
 * to keep API keys secure on the backend.
 *
 * BACKEND ASSUMPTION: Supabase Edge Functions exist:
 * - send-sms: Sends verification code via Twilio
 * - verify-code: Validates code and logs check-in
 *
 * These functions should handle:
 * - Twilio API integration
 * - Code generation and storage
 * - Rate limiting
 * - Privacy policy link inclusion in SMS
 */

import { supabase } from "./supabaseClient"

/**
 * Request to send SMS verification code
 */
export interface SendSmsRequest {
  phoneNumber: string
  creditCardLast4: string
  driversLicense: string
}

/**
 * Response from SMS sending
 */
export interface SendSmsResponse {
  success: boolean
  checkInId: string
  message: string
}

/**
 * Request to verify SMS code
 */
export interface VerifyCodeRequest {
  checkInId: string
  code: string
}

/**
 * Response from code verification
 */
export interface VerifyCodeResponse {
  success: boolean
  verified: boolean
  message: string
}

/**
 * Sends SMS verification code to guest
 *
 * FLOW:
 * 1. Validates input data
 * 2. Calls Supabase Edge Function 'send-sms'
 * 3. Edge function generates 6-digit code
 * 4. Edge function sends SMS via Twilio with code and privacy policy link
 * 5. Returns check-in ID for verification step
 *
 * @param request Guest information for verification
 * @returns Check-in ID and success status
 */
export async function sendVerificationSms(request: SendSmsRequest): Promise<SendSmsResponse> {
  try {
    console.log("[SMS] Sending verification code to:", request.phoneNumber)

    // Call Supabase Edge Function
    // BACKEND ASSUMPTION: Edge function 'send-sms' exists and handles:
    // - Code generation (6 digits)
    // - Twilio SMS sending
    // - Database record creation
    // - Privacy policy URL inclusion
    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: {
        phone_number: request.phoneNumber,
        credit_card_last_4: request.creditCardLast4,
        drivers_license: request.driversLicense,
      },
    })

    if (error) {
      console.error("[SMS] Failed to send SMS:", error)
      throw new Error(error.message || "Failed to send verification code")
    }

    if (!data || !data.check_in_id) {
      throw new Error("Invalid response from SMS service")
    }

    console.log("[SMS] Verification code sent successfully")

    return {
      success: true,
      checkInId: data.check_in_id,
      message: "Verification code sent successfully",
    }
  } catch (error) {
    console.error("[SMS] Error sending verification SMS:", error)
    throw error
  }
}

/**
 * Verifies SMS code entered by guest
 *
 * FLOW:
 * 1. Validates code format
 * 2. Calls Supabase Edge Function 'verify-code'
 * 3. Edge function checks code against database
 * 4. Edge function marks check-in as verified
 * 5. Edge function logs verification event
 *
 * SECURITY: Code verification should have rate limiting on backend
 * to prevent brute force attacks (max 3-5 attempts)
 *
 * @param request Check-in ID and verification code
 * @returns Verification success status
 */
export async function verifyCode(request: VerifyCodeRequest): Promise<VerifyCodeResponse> {
  try {
    console.log("[SMS] Verifying code for check-in:", request.checkInId)

    // Call Supabase Edge Function
    // BACKEND ASSUMPTION: Edge function 'verify-code' exists and handles:
    // - Code validation
    // - Rate limiting (max attempts)
    // - Check-in record update
    // - Verification logging
    const { data, error } = await supabase.functions.invoke("verify-code", {
      body: {
        check_in_id: request.checkInId,
        code: request.code,
      },
    })

    if (error) {
      console.error("[SMS] Code verification failed:", error)
      throw new Error(error.message || "Failed to verify code")
    }

    if (!data || typeof data.verified !== "boolean") {
      throw new Error("Invalid response from verification service")
    }

    console.log("[SMS] Code verification result:", data.verified)

    return {
      success: true,
      verified: data.verified,
      message: data.verified ? "Check-in verified successfully" : "Invalid verification code",
    }
  } catch (error) {
    console.error("[SMS] Error verifying code:", error)
    throw error
  }
}

/**
 * Logs privacy policy acceptance
 *
 * BACKEND ASSUMPTION: This creates a log entry in the verification_logs table
 * documenting that the guest accepted the privacy policy.
 *
 * RLS POLICY: Only authenticated users can insert logs for their own check-ins
 */
export async function logPolicyAcceptance(checkInId: string): Promise<void> {
  try {
    console.log("[SMS] Logging policy acceptance for:", checkInId)

    const { error } = await supabase.from("verification_logs").insert({
      check_in_id: checkInId,
      action: "policy_accepted",
      metadata: {
        accepted_at: new Date().toISOString(),
      },
    })

    if (error) {
      console.error("[SMS] Failed to log policy acceptance:", error)
      // Don't throw - this is a non-critical operation
    }
  } catch (error) {
    console.error("[SMS] Error logging policy acceptance:", error)
    // Don't throw - this is a non-critical operation
  }
}
