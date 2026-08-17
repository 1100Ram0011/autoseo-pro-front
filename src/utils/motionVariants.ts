import { Variants } from 'framer-motion';

/**
 * Core animation variants for reuse across components
 */

// Fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export const scaleInUp: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
};

// Rotate animations
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -10 },
  visible: { opacity: 1, rotate: 0, transition: { duration: 0.5 } },
};

// Slide animations
export const slideInLeft: Variants = {
  hidden: { x: -100 },
  visible: { x: 0, transition: { duration: 0.5 } },
};

export const slideInRight: Variants = {
  hidden: { x: 100 },
  visible: { x: 0, transition: { duration: 0.5 } },
};

export const slideInUp: Variants = {
  hidden: { y: 100 },
  visible: { y: 0, transition: { duration: 0.5 } },
};

export const slideInDown: Variants = {
  hidden: { y: -100 },
  visible: { y: 0, transition: { duration: 0.5 } },
};

// Stagger container - use with child variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.05,
    },
  },
};

// Tab/Page transitions
export const pageTransitionFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

export const pageTransitionSlideUp: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: 40, transition: { duration: 0.3 } },
};

export const pageTransitionSlideDown: Variants = {
  initial: { opacity: 0, y: -40 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.3 } },
};

export const pageTransitionSlideLeft: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  exit: { opacity: 0, x: -100, transition: { duration: 0.3 } },
};

// Hover animations
export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

export const hoverScaleLarge: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.1, transition: { duration: 0.2 } },
};

export const hoverLift: Variants = {
  initial: { y: 0, boxShadow: '0 0 0 rgba(0,0,0,0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    transition: { duration: 0.3 },
  },
};

export const hoverGlow: Variants = {
  initial: { boxShadow: '0 0 0 rgba(99, 102, 241, 0)' },
  hover: {
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
    transition: { duration: 0.3 },
  },
};

// Loading animations
export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0%', '-200% 0%'],
    transition: { duration: 2, repeat: Infinity },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
};

export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 1, repeat: Infinity },
  },
};

// Button animations
export const buttonTap: Variants = {
  tap: { scale: 0.95 },
};

export const buttonHover: Variants = {
  hover: { scale: 1.02 },
};

// Modal/Dialog animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Dropdown animations
export const dropdownContent: Variants = {
  hidden: { opacity: 0, y: -10, pointerEvents: 'none' },
  visible: {
    opacity: 1,
    y: 0,
    pointerEvents: 'auto',
    transition: { duration: 0.2 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.1 } },
};

// List item animations
export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

// Badge/Chip animations
export const badgePulse: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    transition: { duration: 0.6, repeat: Infinity },
  },
};

// Notification animations
export const notificationSlideIn: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4 } },
  exit: { x: 400, opacity: 0, transition: { duration: 0.3 } },
};

// Number counter animation (for stats)
export const numberCounter: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};
