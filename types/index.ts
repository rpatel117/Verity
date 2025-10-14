/**
 * Shared TypeScript interfaces for Verity application
 */

export type AttestationStatus = "sent" | "verified" | "expired";

export interface AttestationRow {
  id: string;
  guest: {
    fullName: string;
    phoneE164: string;
  };
  ccLast4: string;
  checkInDate: string;
  checkOutDate: string;
  status: AttestationStatus;
  sentAt: string;
  verifiedAt?: string;
  eventsCount: number;
}

export interface AttestationEvent {
  id: string;
  eventType: "page.open" | "geo.capture" | "policy.accept";
  createdAt: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export interface CheckInFormData {
  fullName: string;
  phoneE164: string;
  ccLast4: string;
  dlNumber?: string;
  dlState?: string;
  checkInDate: Date;
  checkOutDate: Date;
  policyText: string;
}

export interface ReportFormData {
  attestationIds: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  hotelName: string;
  provider?: 'email' | 'google' | 'microsoft';
}

export interface ApiResponse<T = any> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  total?: number;
}

export interface SendAttestationResponse {
  attestationId: string;
  guestId: string;
  smsSid?: string;
}

export interface GenerateReportResponse {
  reportId: string;
  downloadUrl: string;
}

export interface GuestInitResponse {
  valid: boolean;
  policyText: string;
  twoFACodeMasked: string;
}

export interface GuestEventResponse {
  ok: boolean;
}

export interface GuestConfirmResponse {
  ok: boolean;
  code: string;
}
