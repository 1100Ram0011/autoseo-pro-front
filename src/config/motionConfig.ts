/**
 * Global Motion Configuration
 * Centralized settings for Framer Motion animations throughout the app
 */

export const motionConfig = {
  // Transition timings
  transitions: {
    fast: { duration: 0.2 },
    normal: { duration: 0.4 },
    slow: { duration: 0.6 },
    verySlow: { duration: 1.0 },
  },

  // Spring physics for natural motion
  spring: {
    tight: { type: 'spring', stiffness: 400, damping: 40 },
    normal: { type: 'spring', stiffness: 300, damping: 30 },
    smooth: { type: 'spring', stiffness: 200, damping: 20 },
    bouncy: { type: 'spring', stiffness: 500, damping: 10 },
  },

  // Easing functions
  easing: {
    easeInOut: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
    anticipate: 'easeInOut',
  },

  // Common delays
  delays: {
    none: 0,
    xs: 0.05,
    sm: 0.1,
    md: 0.15,
    lg: 0.2,
    xl: 0.3,
  },

  // Stagger settings for lists
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
  },

  // Tap feedback
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },

  // Hover effects
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },

  // Reduce motion preferences
  respectReducedMotion: true,
};

/**
 * Helper function to respect user's motion preferences
 */
export const getMotionPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return true;
};

/**
 * Get safe transition config respecting user preferences
 */
export const getSafeTransition = (transition: any) => {
  if (!motionConfig.respectReducedMotion) return transition;
  if (!getMotionPreference()) {
    return { duration: 0 }; // Instant transition if user prefers reduced motion
  }
  return transition;
};

/**
 * Preset animation combinations
 */
export const animationPresets = {
  // Page entrance
  pageEntrance: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Card hover lift
  cardHover: {
    whileHover: { y: -4 },
    transition: { duration: 0.2 },
  },

  // Button tap
  buttonTap: {
    whileTap: { scale: 0.95 },
  },

  // List item stagger
  listStagger: {
    container: {
      staggerChildren: 0.1,
    },
    item: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    },
  },
};

/**
 * Animation timing constants
 */
export const ANIMATION_DURATION = {
  instant: 0,
  ultraFast: 100,
  fast: 200,
  normal: 350,
  slow: 500,
  verySlow: 800,
  extraSlow: 1200,
} as const;

/**
 * Z-index for animations and overlays
 */
export const Z_INDEX = {
  base: 1,
  dropdown: 1000,
  tooltip: 1100,
  modal: 1200,
  backdrop: 1100,
  notification: 1400,
} as const;
