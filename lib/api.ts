/**
 * Typed API client wrappers for backend endpoints
 * 
 * TODO: Replace mock implementations with real API calls once backend is ready
 */

import { 
  AttestationEvent, 
  SendAttestationResponse, 
  GenerateReportResponse,
  GuestInitResponse,
  GuestEventResponse,
  GuestConfirmResponse,
  PaginatedResponse,
  CheckInFormData,
  ReportFormData
} from "@/types";

export type { AttestationRow } from "@/types";

export class TypedError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "TypedError";
  }
}

/**
 * Send attestation SMS to guest
 */
export async function sendAttestation(data: CheckInFormData): Promise<SendAttestationResponse> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data: result, error } = await supabase.functions.invoke('send_attestation_sms_fixed', {
      body: {
        guest: {
          fullName: data.fullName,
          phoneE164: data.phoneE164,
          dlNumber: data.dlNumber,
          dlState: data.dlState,
        },
        stay: {
          ccLast4: data.ccLast4,
          checkInDate: data.checkInDate.toISOString().split('T')[0],
          checkOutDate: data.checkOutDate.toISOString().split('T')[0],
        },
        policyText: data.policyText,
      }
    })

    if (error) {
      throw new TypedError(error.message, error.name, error.status)
    }

    return result
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * List attestations with pagination and filters
 */
export async function listAttestations(params: {
  query?: string;
  from?: string;
  to?: string;
  status?: string;
  cursor?: string;
}): Promise<PaginatedResponse<AttestationRow>> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    // Get current user's hotel_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new TypedError("Not authenticated", "UNAUTHENTICATED", 401)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('hotel_id')
      .eq('id', user.id)
      .single()

    if (!profile?.hotel_id) {
      throw new TypedError("Hotel not found", "NOT_FOUND", 404)
    }

    // Call the RPC function with parameters in the correct order
    const { data, error } = await supabase.rpc('list_attestations', {
      hotel_id_param: profile.hotel_id,
      query_param: params.query || null,
      from_date_param: params.from || null,
      to_date_param: params.to || null,
      status_param: params.status || null,
      page_size_param: 50,
      cursor_param: params.cursor || null
    })

    if (error) {
      throw new TypedError(error.message, "RPC_ERROR")
    }

    // Transform the data to match AttestationRow interface
    const transformedData: AttestationRow[] = data.map((row: any) => ({
      id: row.id,
      guest: {
        fullName: row.guest_name,
        phoneE164: row.guest_phone
      },
      ccLast4: row.cc_last4,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      status: row.status,
      sentAt: row.sent_at,
      verifiedAt: row.verified_at,
      eventsCount: row.events_count
    }))

    return {
      data: transformedData,
      nextCursor: data.length === 50 ? data[data.length - 1]?.sent_at : undefined,
      total: transformedData.length
    }
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * List events for a specific attestation
 */
export async function listAttestationEvents(attestationId: string): Promise<AttestationEvent[]> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data, error } = await supabase
      .from('attestation_events')
      .select('*')
      .eq('attestation_id', attestationId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TypedError(error.message, "QUERY_ERROR")
    }

    return data.map((event: any) => ({
      id: event.id,
      eventType: event.event_type,
      createdAt: event.created_at,
      ip: event.ip,
      latitude: event.latitude,
      longitude: event.longitude,
      accuracy: event.accuracy
    }))
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * Generate PDF report for selected attestations
 */
export async function generateReport(data: ReportFormData): Promise<GenerateReportResponse> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data: result, error } = await supabase.functions.invoke('generate_report_pdf', {
      body: {
        attestationIds: data.attestationIds
      }
    })

    if (error) {
      throw new TypedError(error.message, error.name, error.status)
    }

    return result
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * Initialize guest page with token validation
 */
export async function initGuest(token: string): Promise<GuestInitResponse> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data: result, error } = await supabase.functions.invoke('guest_init', {
      body: { token }
    })

    if (error) {
      throw new TypedError(error.message, error.name, error.status)
    }

    return result
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * Send guest event (page.open, geo.capture, policy.accept)
 */
export async function sendGuestEvent(data: {
  token: string;
  eventType: "page.open" | "geo.capture" | "policy.accept";
  ip?: string;
  userAgent?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}): Promise<GuestEventResponse> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data: result, error } = await supabase.functions.invoke('guest_event', {
      body: data
    })

    if (error) {
      throw new TypedError(error.message, error.name, error.status)
    }

    return result
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * Confirm guest policy acceptance and get 2FA code
 */
export async function confirmGuest(data: {
  token: string;
  accepted: boolean;
}): Promise<GuestConfirmResponse> {
  try {
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data: result, error } = await supabase.functions.invoke('guest_confirm', {
      body: data
    })

    if (error) {
      throw new TypedError(error.message, error.name, error.status)
    }

    return result
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}

/**
 * Verify attestation code entered by clerk
 */
export async function verifyAttestationCode(data: {
  attestationId: string;
  code: string;
}): Promise<{ ok: boolean; verifiedAt?: string; reason?: string }> {
  try {
    console.log('🌐 API: Calling verify_attestation_code with:', data)
    const { supabase } = await import('@/lib/supabaseClient')
    
    const { data: result, error } = await supabase.functions.invoke('verify_attestation_code', {
      body: data
    })

    console.log('🌐 API: Edge function response:', { result, error })

    if (error) {
      console.error('🌐 API: Edge function error:', error)
      throw new TypedError(error.message, error.name, error.status)
    }

    console.log('🌐 API: Returning result:', result)
    return result
  } catch (error) {
    console.error('🌐 API: verifyAttestationCode error:', error)
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}
