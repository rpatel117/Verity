import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    console.log('Edge function started');
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({
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
    console.log('Supabase client created');
    
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No auth header');
      return new Response(JSON.stringify({
        error: 'Missing authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Auth header found');
    
    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.log('Auth error:', authError);
      return new Response(JSON.stringify({
        error: 'Invalid or expired token'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('User authenticated:', user.id);
    
    // Get user's hotel_id from profiles table
    const { data: profile, error: profileError } = await supabase.from('profiles').select('hotel_id').eq('id', user.id).single();
    if (profileError || !profile?.hotel_id) {
      console.log('Profile error:', profileError);
      return new Response(JSON.stringify({
        error: 'User not associated with a hotel'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const hotelId = profile.hotel_id;
    console.log('Hotel ID:', hotelId);
    
    // Parse request body
    const body = await req.json();
    const { guest, stay, policyText } = body;
    console.log('Request body parsed');
    
    // Validate required fields
    if (!guest.fullName || !guest.phoneE164 || !stay.ccLast4 || !stay.checkInDate || !stay.checkOutDate) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated code:', verificationCode);
    
    // Hash the code using Web Crypto API (compatible with Deno)
    const encoder = new TextEncoder();
    const data = encoder.encode(verificationCode + 'salt_verity_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    console.log('Code hashed');
    
    // Create or update guest record
    const { data: guestRecord, error: guestError } = await supabase.from('guests').upsert({
      hotel_id: hotelId,
      created_by: user.id,
      full_name: guest.fullName,
      phone_e164: guest.phoneE164,
      dl_number: guest.dlNumber,
      dl_state: guest.dlState,
      cc_last4: stay.ccLast4,
      check_in_date: stay.checkInDate,
      check_out_date: stay.checkOutDate
    }, {
      onConflict: 'phone_e164,hotel_id'
    }).select().single();
    
    if (guestError) {
      console.error('Guest upsert error:', guestError);
      return new Response(JSON.stringify({
        error: 'Failed to create guest record'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Guest record created/updated:', guestRecord.id);
    
    // Create JWT token for guest link
    const jwt = await import('https://deno.land/x/djwt@v2.8/mod.ts');
    const signingSecret = Deno.env.get('VERITY_SIGNING_SECRET') || 'dev_signing_secret_12345';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(signingSecret), {
      name: 'HMAC',
      hash: 'SHA-256'
    }, false, ['sign', 'verify']);
    
    // Generate UUID manually
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : r & 0x3 | 0x8;
        return v.toString(16);
      });
    };
    const attestationId = generateUUID();
    const payload = {
      attestation_id: attestationId,
      guest_id: guestRecord.id,
      hotel_id: hotelId,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      iat: Math.floor(Date.now() / 1000)
    };
    const jwtToken = await jwt.create({
      alg: 'HS256',
      typ: 'JWT'
    }, payload, key);
    console.log('JWT token created');
    
    // Create attestation record - FIXED: Store the actual code in code_enc field
    const { data: attestation, error: attestationError } = await supabase.from('attestations').insert({
      id: attestationId,
      hotel_id: hotelId,
      guest_full_name: guest.fullName,
      guest_phone_e164: guest.phoneE164,
      cc_last_4: stay.ccLast4,
      dl_number: guest.dlNumber,
      dl_state: guest.dlState,
      check_in_date: stay.checkInDate,
      check_out_date: stay.checkOutDate,
      policy_text: policyText,
      guest_id: guestRecord.id,
      code_hash: codeHash,
      code_enc: verificationCode, // Store the actual code for guest retrieval
      token: jwtToken,
      status: 'sent'
    }).select().single();
    
    if (attestationError) {
      console.error('Attestation creation error:', attestationError);
      return new Response(JSON.stringify({
        error: 'Failed to create attestation record'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('Attestation record created:', attestation.id);
    
    // Create guest URL
    const baseUrl = Deno.env.get('VERITY_BASE_URL') || 'http://localhost:3000';
    const encodedToken = encodeURIComponent(jwtToken);
    const guestUrl = `${baseUrl}/guest/${encodedToken}`;
    const smsSid = `DEV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log the mock SMS to console
    console.log(`[DEV MODE] SMS would be sent to ${guest.phoneE164}:`);
    console.log(`[DEV MODE] Message: Your Verity attestation code is ready. Click here to verify: ${guestUrl}`);
    console.log(`[DEV MODE] Code: ${verificationCode}`);
    console.log(`[DEV MODE] Guest Link: ${guestUrl}`);
    
    // Update attestation with mock SMS SID
    await supabase.from('attestations').update({
      sms_sid: smsSid,
      sms_status: 'sent'
    }).eq('id', attestation.id);
    
    // Insert SMS sent event
    await supabase.from('attestation_events').insert({
      attestation_id: attestation.id,
      event_type: 'sms.sent',
      event_data: {
        sms_sid: smsSid,
        is_development: true,
        message: `[DEV] Code: ${verificationCode}`,
        guest_link: guestUrl
      }
    });
    
    const response = {
      attestationId: attestation.id,
      guestId: guestRecord.id,
      smsSid: smsSid,
      guestUrl: guestUrl,
      verificationCode: verificationCode
    };
    console.log('Returning response:', response);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Edge function error:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({
      error: 'Internal server error: ' + error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});



