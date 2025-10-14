/**
 * Framer Motion Variants for Verity
 * 
 * Reusable animation variants for consistent motion design
 */

import { Variants } from 'framer-motion'

// Page transition variants
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

// Modal and dialog variants
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}

// Sidebar slide-in
export const slideInFromLeft: Variants = {
  initial: {
    x: -240,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  exit: {
    x: -240,
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
}

// Card hover lift effect
export const hoverLift: Variants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
}

// Button press animation
export const buttonPress: Variants = {
  initial: {
    scale: 1,
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.12,
    },
  },
}

// Stagger children for lists
export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Individual item for stagger
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
}

// Table row hover
export const tableRowHover: Variants = {
  initial: {
    y: 0,
  },
  hover: {
    y: -2,
    transition: {
      duration: 0.12,
      ease: 'easeOut',
    },
  },
}

// Toast slide-up
export const toastSlideUp: Variants = {
  initial: {
    y: 100,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// Loading spinner
export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Success checkmark
export const checkmark: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
}

// Gradient sweep animation for buttons
export const gradientSweep: Variants = {
  initial: {
    backgroundPosition: '0% 50%',
  },
  hover: {
    backgroundPosition: '100% 50%',
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

// Count-up animation for stats
export const countUp: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

// Form field focus
export const fieldFocus: Variants = {
  initial: {
    scale: 1,
  },
  focus: {
    scale: 1.02,
    transition: {
      duration: 0.12,
      ease: 'easeOut',
    },
  },
}

// Tab indicator slide
export const tabIndicator: Variants = {
  initial: {
    x: 0,
    width: 0,
  },
  animate: {
    width: '100%',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
}

// Mobile drawer slide
export const mobileDrawer: Variants = {
  initial: {
    x: '-100%',
  },
  animate: {
    x: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    x: '-100%',
    transition: {
      duration: 0.15,
      ease: 'easeIn',
    },
  },
}
