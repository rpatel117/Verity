/**
 * Verity Design System - Color Palette
 *
 * Trust-driven fintech/hospitality product with credibility, calm, and confidence.
 * Similar energy to Stripe or Linear, but with warmer undertones for "human verification."
 * All tones maintain AA+ contrast accessibility.
 */

export const colors = {
  // Primary — Trust Blue (core action color)
  primary: {
    50: "#edf5ff",
    100: "#d0e2ff",
    200: "#a6c8ff",
    300: "#78a9ff",
    400: "#4589ff",
    500: "#0f62fe",   // main brand blue
    600: "#0043ce",
    700: "#002d9c",
    800: "#001d6c",
    900: "#001141",
    DEFAULT: "#0f62fe",
  },

  // Accent — Warm Gold (signal confidence and hospitality)
  accent: {
    50: "#fff9e6",
    100: "#fff1b8",
    200: "#ffe58f",
    300: "#ffd666",
    400: "#ffc53d",
    500: "#faad14",
    600: "#d48806",
    700: "#ad6800",
    800: "#874d00",
    900: "#613400",
    DEFAULT: "#faad14",
  },

  // Surface / Neutral
  surface: {
    background: "#f9fafb",
    foreground: "#0a0a0a",
    card: "#ffffff",
    cardForeground: "#0a0a0a",
    popover: "#ffffff",
    popoverForeground: "#0a0a0a",
    muted: "#f2f4f8",
    mutedForeground: "#6b7280",
    border: "#e5e7eb",
    input: "#e5e7eb",
  },

  // Semantic colors
  success: "#24a148",
  warning: "#f1c21b",
  error: "#da1e28",
  info: "#0f62fe",

  // Dark mode
  dark: {
    background: "#0b0c10",
    foreground: "#f4f4f4",
    card: "#16181d",
    muted: "#1f2229",
    border: "#2a2e35",
  },
} as const
