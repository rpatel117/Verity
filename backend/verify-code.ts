/**
 * Supabase Edge Function: verify-code
 *
 * Verifies SMS code entered by guest and completes check-in.
 *
 * FLOW:
 * 1. Validate input data
 * 2. Retrieve check-in record from database
 * 3. Check code expiration
 * 4. Check rate limiting (max attempts)
 * 5. Verify code matches
 * 6. Update check-in as verified
 * 7. Log verification event
 * 8. Return verification status
 *
 * SECURITY:
 * - Rate limiting: Max 5 attempts per check-in
 * - Code expiration: 10 minutes
 * - Constant-time comparison to prevent timing attacks
 *
 * DEPLOYMENT:
 * supabase functions deploy verify-code
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Deno } from "https://deno.land/std@0.168.0/runtime.ts" // Declaring Deno variable

// @ts-ignore: Deno is available in Supabase Edge Functions runtime
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
// @ts-ignore: Deno is available in Supabase Edge Functions runtime
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface VerifyCodeRequest {
  check_in_id: string
  code: string
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
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
    const body: VerifyCodeRequest = await req.json()
    const { check_in_id, code } = body

    // Validate input
    if (!check_in_id || !code) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: "Invalid code format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Retrieve check-in record
    const { data: checkIn, error: fetchError } = await supabase
      .from("check_ins")
      .select("*")
      .eq("id", check_in_id)
      .single()

    if (fetchError || !checkIn) {
      return new Response(JSON.stringify({ error: "Check-in not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if already verified
    if (checkIn.verified) {
      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          message: "Check-in already verified",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
    }

    // Check rate limiting (max attempts)
    if (checkIn.verification_attempts >= checkIn.max_attempts) {
      await supabase.from("verification_logs").insert({
        check_in_id,
        action: "max_attempts_reached",
        metadata: {
          attempts: checkIn.verification_attempts,
          timestamp: new Date().toISOString(),
        },
      })

      return new Response(
        JSON.stringify({
          error: "Maximum verification attempts exceeded",
          verified: false,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      )
    }

    // Check code expiration
    const now = new Date()
    const expiresAt = new Date(checkIn.code_expires_at)

    if (now > expiresAt) {
      return new Response(
        JSON.stringify({
          error: "Verification code has expired",
          verified: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Verify code (constant-time comparison)
    const isValid = constantTimeCompare(code, checkIn.verification_code)

    if (!isValid) {
      // Increment attempt counter
      await supabase
        .from("check_ins")
        .update({
          verification_attempts: checkIn.verification_attempts + 1,
        })
        .eq("id", check_in_id)

      // Log failed attempt
      await supabase.from("verification_logs").insert({
        check_in_id,
        action: "code_failed",
        metadata: {
          attempt: checkIn.verification_attempts + 1,
          timestamp: new Date().toISOString(),
        },
      })

      return new Response(
        JSON.stringify({
          success: true,
          verified: false,
          message: "Invalid verification code",
          attempts_remaining: checkIn.max_attempts - checkIn.verification_attempts - 1,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      )
    }

    // Code is valid - update check-in as verified
    const { error: updateError } = await supabase
      .from("check_ins")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", check_in_id)

    if (updateError) {
      console.error("Failed to update check-in:", updateError)
      return new Response(JSON.stringify({ error: "Failed to complete verification" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Log successful verification
    await supabase.from("verification_logs").insert({
      check_in_id,
      action: "code_verified",
      metadata: {
        verified_at: new Date().toISOString(),
      },
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        message: "Check-in verified successfully",
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
    console.error("Error in verify-code function:", error)
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
