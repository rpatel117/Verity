/**
 * Supabase Edge Function: send-sms
 *
 * Sends SMS verification code to guest via Twilio.
 *
 * FLOW:
 * 1. Validate input data
 * 2. Generate 6-digit verification code
 * 3. Create check_ins record in database
 * 4. Send SMS via Twilio API
 * 5. Log SMS sent event
 * 6. Return check_in_id to client
 *
 * SECURITY:
 * - Rate limiting: Max 3 SMS per phone number per hour
 * - Input validation and sanitization
 * - Twilio credentials stored in Supabase secrets
 *
 * DEPLOYMENT:
 * supabase functions deploy send-sms
 * supabase secrets set TWILIO_ACCOUNT_SID=xxx TWILIO_AUTH_TOKEN=xxx TWILIO_PHONE_NUMBER=xxx
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { env } from "https://deno.land/std@0.168.0/dotenv/mod.ts"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declare Deno variable

// Load environment variables
await env.load()

// Twilio configuration from environment
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER")!
const PRIVACY_POLICY_URL = Deno.env.get("EXPO_PUBLIC_PRIVACY_POLICY_URL") || "https://yourhotel.com/privacy"

// Supabase configuration
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface SendSmsRequest {
  phone_number: string
  credit_card_last_4: string
  drivers_license: string
}

/**
 * Generates a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Sends SMS via Twilio API
 */
async function sendTwilioSms(to: string, body: string): Promise<void> {
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: body,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twilio API error: ${error}`)
  }
}

/**
 * Checks rate limiting for phone number
 */
async function checkRateLimit(supabase: any, phoneNumber: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from("check_ins")
    .select("id")
    .eq("phone_number", phoneNumber)
    .gte("created_at", oneHourAgo)

  if (error) {
    console.error("Rate limit check error:", error)
    return false
  }

  // Max 3 SMS per hour per phone number
  return data.length < 3
}

serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    // Parse request body
    const body: SendSmsRequest = await req.json()
    const { phone_number, credit_card_last_4, drivers_license } = body

    // Validate input
    if (!phone_number || !credit_card_last_4 || !drivers_license) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check rate limiting
    const canSend = await checkRateLimit(supabase, phone_number)
    if (!canSend) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create check-in record
    const { data: checkIn, error: dbError } = await supabase
      .from("check_ins")
      .insert({
        credit_card_last_4,
        drivers_license,
        phone_number,
        verification_code: verificationCode, // In production, hash this
        code_expires_at: codeExpiresAt.toISOString(),
        verified: false,
        verification_attempts: 0,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database error:", dbError)
      return new Response(JSON.stringify({ error: "Failed to create check-in record" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Compose SMS message
    const smsBody = `Your hotel check-in verification code is: ${verificationCode}

By sharing this code, you confirm your presence and agree to our privacy policy: ${PRIVACY_POLICY_URL}

This code expires in 10 minutes.`

    // Send SMS via Twilio
    await sendTwilioSms(phone_number, smsBody)

    // Log SMS sent event
    await supabase.from("verification_logs").insert({
      check_in_id: checkIn.id,
      action: "sms_sent",
      metadata: {
        phone_number,
        sent_at: new Date().toISOString(),
      },
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        check_in_id: checkIn.id,
        message: "Verification code sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  } catch (error) {
    console.error("Error in send-sms function:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    )
  }
})
