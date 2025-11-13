import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('Guest confirm function started');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({
        ok: false,
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const { token, accepted } = body;
    
    console.log('Token received:', token?.substring(0, 50) + '...');
    console.log('Accepted:', accepted);

    if (!token) {
      return new Response(JSON.stringify({
        error: 'Token is required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Verify JWT token
    const jwt = await import('https://deno.land/x/djwt@v2.8/mod.ts');
    const signingSecret = Deno.env.get('VERITY_SIGNING_SECRET') || 'dev_signing_secret_12345';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(signingSecret), {
      name: 'HMAC',
      hash: 'SHA-256'
    }, false, ['sign', 'verify']);

    let payload;
    try {
      payload = await jwt.verify(token, key);
      console.log('Token verified successfully');
    } catch (error) {
      console.log('Token verification failed:', error);
      return new Response(JSON.stringify({
        ok: false,
        error: 'Invalid or expired token'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('Token expired');
      return new Response(JSON.stringify({
        ok: false,
        error: 'Token has expired'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('Token is valid, payload:', payload);

    // Get the attestation record to check if already confirmed
    const { data: attestation, error: attestationError } = await supabase
      .from('attestations')
      .select('id, verified_at')
      .eq('token', token)
      .single();

    if (attestationError || !attestation) {
      return new Response(JSON.stringify({
        ok: false
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Check if already confirmed
    if (attestation.verified_at) {
      return new Response(JSON.stringify({
        ok: false
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    if (!accepted) {
      return new Response(JSON.stringify({
        ok: false
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // FIXED: Only log policy acceptance event - DO NOT generate new code or update hash
    // The original code was already generated and stored in send_attestation_sms_fixed
    console.log('Policy accepted by guest - logging event only');
    
    // Log policy acceptance event
    await supabase.from('attestation_events').insert({
      attestation_id: attestation.id,
      event_type: 'policy.accept',
      payload: {
        timestamp: new Date().toISOString()
      }
    });

    // FIXED: Return success with the verification code
    const { data: attestationData, error: attestationError } = await supabase
      .from('attestations')
      .select('code_enc')
      .eq('token', token)
      .single();

    const response = {
      ok: true,
      code: attestationData?.code_enc || 'Code not available'
    };

    console.log('Policy acceptance logged successfully, returning code:', response.code);
    console.log('Full response:', JSON.stringify(response));
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Guest confirm error:', error);
    return new Response(JSON.stringify({
      ok: false,
      error: 'Internal server error: ' + error.message
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});