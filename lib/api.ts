/**
 * Typed API client wrappers for backend endpoints
 * 
 * TODO: Replace mock implementations with real API calls once backend is ready
 */

import { 
  AttestationRow, 
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      attestationId: `att_${Date.now()}`,
      guestId: `guest_${Date.now()}`,
      smsSid: `sms_${Date.now()}`
    }
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData: AttestationRow[] = [
      {
        id: "att_1",
        guest: { fullName: "John Doe", phoneE164: "+1234567890" },
        ccLast4: "1234",
        checkInDate: "2024-01-15",
        checkOutDate: "2024-01-17",
        status: "verified",
        sentAt: "2024-01-15T10:00:00Z",
        verifiedAt: "2024-01-15T10:30:00Z",
        eventsCount: 3
      },
      {
        id: "att_2",
        guest: { fullName: "Jane Smith", phoneE164: "+1987654321" },
        ccLast4: "5678",
        checkInDate: "2024-01-16",
        checkOutDate: "2024-01-18",
        status: "sent",
        sentAt: "2024-01-16T09:00:00Z",
        eventsCount: 1
      }
    ]
    
    return {
      data: mockData,
      nextCursor: undefined,
      total: mockData.length
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: "evt_1",
        eventType: "page.open",
        createdAt: "2024-01-15T10:00:00Z",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0..."
      },
      {
        id: "evt_2",
        eventType: "geo.capture",
        createdAt: "2024-01-15T10:01:00Z",
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10
      }
    ]
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      reportId: `report_${Date.now()}`,
      downloadUrl: "https://example.com/report.pdf"
    }
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (token === 'invalid') {
      throw new TypedError("Invalid or expired token", "INVALID_TOKEN");
    }
    
    return {
      valid: true,
      policyText: "I confirm I am the authorized cardholder or their agent, consent to applicable charges for the stated dates, and agree that Verity may record IP & geolocation for fraud-prevention.",
      twoFACodeMasked: "12****"
    }
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return { ok: true }
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
    // Mock implementation - replace with real API call later
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      ok: true,
      code: "123456"
    }
  } catch (error) {
    if (error instanceof TypedError) throw error;
    throw new TypedError("Network error occurred", "NETWORK_ERROR");
  }
}
