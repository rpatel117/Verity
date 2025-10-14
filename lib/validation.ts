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
  hotelName: z.string().min(1, "Hotel name is required"),
});

export const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hotelName: z.string().min(1, "Hotel name is required"),
});

export const GuestEventSchema = z.object({
  token: z.string(),
  eventType: z.enum(["page.open", "geo.capture", "policy.accept"]),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
});

export const GuestConfirmSchema = z.object({
  token: z.string(),
  accepted: z.boolean(),
});

export type CheckInFormData = z.infer<typeof CheckInSchema>;
export type ReportFormData = z.infer<typeof ReportSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;
export type SignupFormData = z.infer<typeof SignupSchema>;
export type GuestEventData = z.infer<typeof GuestEventSchema>;
export type GuestConfirmData = z.infer<typeof GuestConfirmSchema>;

