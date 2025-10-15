/**
 * Zod validation schemas for Verity application
 */

import { z } from "zod";

export const CheckInSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneE164: z.string().min(8, "Phone number must be at least 8 digits"),
  ccLast4: z.string().length(4).regex(/^\d{4}$/, "Must be exactly 4 digits"),
  dlNumber: z.string().optional(),
  dlState: z.string().optional(),
  checkInDate: z.date(),
  checkOutDate: z.date().refine(
    (date) => date > new Date(),
    "Check-out date must be in the future"
  ),
  policyText: z.string().min(20, "Policy text must be at least 20 characters"),
});

export const ReportSchema = z.object({
  attestationIds: z.array(z.string().uuid()).min(1, "At least one attestation ID is required"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hotelName: z.string().min(1, "Hotel name is required"),
});

// New validation schemas for Edge Function contracts
export const VerifyCodeSchema = z.object({
  attestationId: z.string().uuid("Invalid attestation ID"),
  code: z.string().length(6, "Code must be exactly 6 digits").regex(/^\d{6}$/, "Code must contain only digits"),
});

export const SendAttestationSchema = z.object({
  guest: z.object({
    fullName: z.string().min(1, "Full name is required"),
    phoneE164: z.string().min(8, "Phone number must be at least 8 digits"),
    dlNumber: z.string().optional(),
    dlState: z.string().optional(),
  }),
  stay: z.object({
    ccLast4: z.string().length(4).regex(/^\d{4}$/, "Must be exactly 4 digits"),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  }),
  policyText: z.string().min(20, "Policy text must be at least 20 characters"),
});

export const TwilioStatusCallbackSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.enum(['queued', 'sent', 'delivered', 'failed', 'undelivered']),
  To: z.string(),
  From: z.string(),
  ErrorCode: z.string().optional(),
  ErrorMessage: z.string().optional(),
});

export const GuestInitSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const GuestEventSchema = z.object({
  token: z.string().min(1, "Token is required"),
  eventType: z.enum(['page.open', 'geo.capture', 'policy.accept']),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
});

export const GuestConfirmSchema = z.object({
  token: z.string().min(1, "Token is required"),
  accepted: z.boolean(),
});

export const GenerateReportSchema = z.object({
  attestationIds: z.array(z.string().uuid("Invalid attestation ID")).min(1, "At least one attestation ID is required"),
});

export type CheckInFormData = z.infer<typeof CheckInSchema>;
export type ReportFormData = z.infer<typeof ReportSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;
export type GuestEventData = z.infer<typeof GuestEventSchema>;
export type GuestConfirmData = z.infer<typeof GuestConfirmSchema>;
export type VerifyCodeData = z.infer<typeof VerifyCodeSchema>;
export type SendAttestationData = z.infer<typeof SendAttestationSchema>;
export type TwilioStatusCallbackData = z.infer<typeof TwilioStatusCallbackSchema>;
export type GuestInitData = z.infer<typeof GuestInitSchema>;
export type GenerateReportData = z.infer<typeof GenerateReportSchema>;

