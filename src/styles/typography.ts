/**
 * Typography System
 *
 * Defines font families and text styles for the app.
 * Uses a clean sans-serif for UI and a serif for headings to add sophistication.
 */

export const typography = {
  fonts: {
    sans: "System",
    serif: "Georgia",
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },

  weights: {
    normal: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const
