/**
 * Verity Design System - Typography
 *
 * Professional typography system using Inter (primary) and DM Sans (headings).
 * Maintains consistent spacing, line heights, and letter spacing for optimal readability.
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
    heading: ['DM Sans', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'SF Mono', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Font sizes with line heights
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
    base: ['1rem', { lineHeight: '1.6' }],       // 16px
    lg: ['1.125rem', { lineHeight: '1.6' }],     // 18px
    xl: ['1.25rem', { lineHeight: '1.4' }],      // 20px
    '2xl': ['1.5rem', { lineHeight: '1.4' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '1.3' }],  // 30px
    '4xl': ['2.25rem', { lineHeight: '1.2' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1.1' }],      // 48px
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Text styles for common use cases
  textStyles: {
    // Headings
    h1: {
      fontFamily: 'DM Sans',
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: 'DM Sans',
      fontSize: '1.875rem',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: 'DM Sans',
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: 'DM Sans',
      fontSize: '1.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '-0.01em',
    },

    // Body text
    body: {
      fontFamily: 'Inter',
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    bodyLarge: {
      fontFamily: 'Inter',
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    bodySmall: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },

    // UI elements
    button: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    label: {
      fontFamily: 'Inter',
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    caption: {
      fontFamily: 'Inter',
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },

    // Code and IDs
    code: {
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    codeSmall: {
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, Liberation Mono, Menlo, monospace',
      fontSize: '0.75rem',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
  },
} as const

// Spacing scale (4px base)
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const