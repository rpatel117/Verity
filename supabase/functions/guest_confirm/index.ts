import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  token: string;
  accepted: boolean;
}

interface ResponseData {
  ok: boolean;
  code?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body: RequestBody = await req.json()
    const { token, accepted } = body

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify JWT token
    const signingSecret = Deno.env.get('VERITY_SIGNING_SECRET')
    if (!signingSecret) {
      throw new Error('VERITY_SIGNING_SECRET not set')
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(signingSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const jwt = await import('https://deno.land/x/djwt@v2.8/mod.ts')
    let payload: any
    
    try {
      payload = await jwt.verify(token, key)
    } catch (error) {
      console.error('JWT verification failed:', error)
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get attestation data
    const { data: attestation, error: attestationError } = await supabase
      .from('attestations')
      .select('id, verified_at')
      .eq('token', token)
      .single()

    if (attestationError || !attestation) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if already confirmed
    if (attestation.verified_at) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!accepted) {
      return new Response(
        JSON.stringify({ ok: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a new 6-digit code for display
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Update attestation as verified
    await supabase
      .from('attestations')
      .update({ 
        verified_at: new Date().toISOString(),
        verification_method: 'link'
      })
      .eq('id', attestation.id)

    // Log policy acceptance event
    await supabase
      .from('attestation_events')
      .insert({
        attestation_id: attestation.id,
        event_type: 'policy.accept',
        event_data: {
          timestamp: new Date().toISOString()
        }
      })

    const response: ResponseData = {
      ok: true,
      code: verificationCode
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Guest confirm error:', error)
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
