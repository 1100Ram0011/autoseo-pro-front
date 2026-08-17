/**
 * Breakpoint Configuration for Responsive Design
 * Priority: Tablet (641px - 1024px)
 */

export const BREAKPOINTS = {
  xs: 320, // Extra small phones
  sm: 480, // Small phones
  md: 640, // Larger phones / Small tablets
  lg: 1024, // Tablets / Large tablets
  xl: 1280, // Desktops
  xxl: 1536, // Large desktops
} as const;

/**
 * Device type definitions
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Media query strings ready to use
 */
export const MEDIA = {
  // Mobile first approach
  mobile: `(max-width: ${BREAKPOINTS.md}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md + 1}px) and (max-width: ${BREAKPOINTS.lg}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg + 1}px)`,

  // Individual breakpoints
  atMobile: `(max-width: ${BREAKPOINTS.md}px)`,
  atTablet: `(max-width: ${BREAKPOINTS.lg}px)`,
  atDesktop: `(min-width: ${BREAKPOINTS.lg + 1}px)`,

  // Touch devices
  touchOnly: '(hover: none) and (pointer: coarse)',
  hasHover: '(hover: hover) and (pointer: fine)',

  // Orientation
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',

  // Screen density
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
} as const;

/**
 * Tailwind CSS breakpoint prefixes for className usage
 * Usage: sm:, md:, lg:, xl:, 2xl:
 */
export const TAILWIND_BREAKPOINTS = {
  mobile: '', // No prefix for mobile-first
  sm: 'sm:', // 640px
  md: 'md:', // 768px
  lg: 'lg:', // 1024px
  xl: 'xl:', // 1280px
  '2xl': '2xl:', // 1536px
} as const;

/**
 * Responsive spacing values (in rem units)
 * Use these for consistent spacing across devices
 */
export const RESPONSIVE_SPACING = {
  // Padding
  paddingMobile: 'p-4', // 1rem
  paddingTablet: 'md:p-6', // 1.5rem
  paddingDesktop: 'lg:p-8', // 2rem

  // Margin
  marginMobile: 'm-4', // 1rem
  marginTablet: 'md:m-6', // 1.5rem
  marginDesktop: 'lg:m-8', // 2rem

  // Gap (for flex/grid)
  gapMobile: 'gap-4', // 1rem
  gapTablet: 'md:gap-6', // 1.5rem
  gapDesktop: 'lg:gap-8', // 2rem
} as const;

/**
 * Responsive font sizes
 */
export const RESPONSIVE_TEXT = {
  h1: 'text-2xl md:text-3xl lg:text-4xl',
  h2: 'text-xl md:text-2xl lg:text-3xl',
  h3: 'text-lg md:text-xl lg:text-2xl',
  h4: 'text-base md:text-lg lg:text-xl',
  body: 'text-sm md:text-base lg:text-base',
  small: 'text-xs md:text-sm lg:text-sm',
} as const;

/**
 * Responsive grid columns
 */
export const RESPONSIVE_GRID = {
  cols1: 'grid-cols-1',
  cols1md2: 'grid-cols-1 md:grid-cols-2',
  cols1lg3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  cols1lg4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const;

/**
 * Touch-friendly sizing for interactive elements
 * Recommended minimum: 48px x 48px
 */
export const TOUCH_TARGETS = {
  small: 'h-10 w-10', // 40px
  default: 'h-12 w-12', // 48px (recommended)
  large: 'h-14 w-14', // 56px
  extraLarge: 'h-16 w-16', // 64px
} as const;

/**
 * Container queries max-width for different views
 */
export const CONTAINER_SIZES = {
  mobile: 'max-w-sm', // 24rem / 384px
  tablet: 'max-w-2xl', // 42rem / 672px
  desktop: 'max-w-5xl', // 64rem / 1024px
  full: 'max-w-7xl', // 80rem / 1280px
} as const;
