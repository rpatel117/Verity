/**
 * Application Constants
 *
 * Centralized configuration values used throughout the app.
 */

export const APP_NAME = "Hotel Check-In"

export const VALIDATION = {
  CREDIT_CARD_LAST_4_LENGTH: 4,
  DRIVERS_LICENSE_MIN_LENGTH: 5,
  DRIVERS_LICENSE_MAX_LENGTH: 20,
  PHONE_NUMBER_MIN_LENGTH: 10,
  SMS_CODE_LENGTH: 6,
} as const

export const MESSAGES = {
  ERRORS: {
    INVALID_CREDIT_CARD: "Please enter the last 4 digits of the credit card",
    INVALID_DRIVERS_LICENSE: "Please enter a valid driver's license number",
    INVALID_PHONE: "Please enter a valid phone number",
    INVALID_CODE: "Please enter a valid verification code",
    NETWORK_ERROR: "Network error. Please check your connection and try again.",
    VERIFICATION_FAILED: "Verification failed. Please try again.",
  },
  SUCCESS: {
    SMS_SENT: "Verification code sent successfully",
    CHECK_IN_COMPLETE: "Check-in completed successfully",
  },
} as const

export const ROUTES = {
  OWNER_RESERVATION: "/",
  PRIVACY_POLICY: "/privacy-policy",
  CODE_VERIFICATION: "/code-verification",
  CONFIRMATION: "/confirmation",
} as const
