/**
 * Application constants and configuration
 */

export const POLICY_TITLE = process.env.NEXT_PUBLIC_VERITY_POLICY_TITLE || "Verity Attestation & Payment Consent";

export const POLICY_TEXT = process.env.NEXT_PUBLIC_VERITY_POLICY_TEXT || 
  "I confirm I am the authorized cardholder or their agent, consent to applicable charges for the stated dates, and agree that Verity may record IP & geolocation for fraud-prevention.";

export const GUEST_CODE_INSTRUCTION = "Provide this code to the hotel clerk to complete check-in.";

export const APP_NAME = "Verity";

export const NAVIGATION_ITEMS = [
  { name: "Check-In", href: "/dashboard/check-in", icon: "CheckCircle" },
  { name: "Data", href: "/dashboard/data", icon: "Database" },
  { name: "Reports", href: "/dashboard/reports", icon: "FileText" },
] as const;

export const ATTESTATION_STATUS_LABELS = {
  sent: "Sent",
  verified: "Verified", 
  expired: "Expired",
} as const;

export const ATTESTATION_STATUS_COLORS = {
  sent: "blue",
  verified: "green",
  expired: "red",
} as const;

export const API_ENDPOINTS = {
  SEND_ATTESTATION: "/api/attestations/send",
  LIST_ATTESTATIONS: "/api/attestations",
  LIST_ATTESTATION_EVENTS: "/api/attestations/:id/events",
  GENERATE_REPORT: "/api/reports/generate",
  GUEST_INIT: "/api/guest/init",
  GUEST_EVENT: "/api/guest/event",
  GUEST_CONFIRM: "/api/guest/confirm",
} as const;

export const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/; // E.164 format

export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  API: "yyyy-MM-dd",
  DATETIME: "MMM dd, yyyy 'at' h:mm a",
} as const;

