/**
 * Color System
 *
 * Defines the app's color palette with a warm, trustworthy aesthetic.
 * - Primary: Deep forest green (trust, security, hospitality)
 * - Neutrals: Warm off-white, soft grays, charcoal
 * - Accent: Warm coral for CTAs and highlights
 */

export const colors = {
  // Primary - Deep forest green for trust and security
  primary: {
    DEFAULT: "#1B4332",
    light: "#2D6A4F",
    dark: "#081C15",
  },

  // Accent - Warm coral for CTAs
  accent: {
    DEFAULT: "#D4745E",
    light: "#E89580",
    dark: "#B85C47",
  },

  // Neutrals - Warm, sophisticated palette
  neutral: {
    50: "#F5F3F0",
    100: "#E8E4DF",
    200: "#D1C9BF",
    300: "#B0A599",
    400: "#8A7D6F",
    500: "#6B5F52",
    600: "#544A3F",
    700: "#3D352D",
    800: "#2A241F",
    900: "#1A1612",
  },

  // Semantic colors
  success: "#2D6A4F",
  error: "#C1666B",
  warning: "#D4A373",
  info: "#4A7C8C",

  // Background
  background: "#F5F3F0",
  surface: "#FFFFFF",

  // Text
  text: {
    primary: "#1A1612",
    secondary: "#544A3F",
    tertiary: "#8A7D6F",
    inverse: "#F5F3F0",
  },
} as const
