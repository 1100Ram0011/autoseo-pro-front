/**
 * Responsive CSS Utilities
 * Helper functions and classes for responsive design
 */

import { BREAKPOINTS, RESPONSIVE_SPACING, RESPONSIVE_TEXT, RESPONSIVE_GRID } from '@/config/breakpoints';

/**
 * Generate responsive className string
 */
export const getResponsiveClass = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  const classes = [mobile];
  if (tablet) classes.push(tablet);
  if (desktop) classes.push(desktop);
  return classes.join(' ');
};

/**
 * Convert pixel value to responsive breakpoint
 */
export const isResponsive = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width <= BREAKPOINTS.md) return 'mobile';
  if (width <= BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
};

/**
 * Get responsive padding
 */
export const getResponsivePadding = (type: 'tight' | 'normal' | 'loose' = 'normal') => {
  const configs = {
    tight: {
      mobile: 'px-3 py-2',
      tablet: 'md:px-4 md:py-3',
      desktop: 'lg:px-6 lg:py-4',
    },
    normal: {
      mobile: 'px-4 py-3',
      tablet: 'md:px-6 md:py-4',
      desktop: 'lg:px-8 lg:py-6',
    },
    loose: {
      mobile: 'px-6 py-4',
      tablet: 'md:px-8 md:py-6',
      desktop: 'lg:px-10 lg:py-8',
    },
  };

  const config = configs[type];
  return `${config.mobile} ${config.tablet} ${config.desktop}`;
};

/**
 * Get responsive font size
 */
export const getResponsiveFontSize = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' = 'body') => {
  return RESPONSIVE_TEXT[level];
};

/**
 * Responsive container
 */
export const getResponsiveContainer = (maxWidth: 'sm' | 'md' | 'lg' | 'full' = 'lg') => {
  const widths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    full: 'max-w-7xl',
  };
  return `mx-auto ${widths[maxWidth]} px-4 md:px-6 lg:px-8`;
};

/**
 * Get responsive grid
 */
export const getResponsiveGrid = (cols: 1 | 2 | 3 | 4 = 2) => {
  const configs: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  return `grid gap-4 md:gap-6 lg:gap-8 ${configs[cols]}`;
};

/**
 * Touch-friendly button sizing
 */
export const getTouchFriendlySize = (minSize: number = 48) => {
  // Returns padding to ensure minimum touch target size
  const padding = Math.max(8, Math.ceil((minSize - 24) / 2));
  return `px-${padding} py-${padding}`;
};

/**
 * Responsive gap/spacing
 */
export const getResponsiveGap = (size: 'tight' | 'normal' | 'loose' = 'normal') => {
  const configs = {
    tight: 'gap-2 md:gap-3 lg:gap-4',
    normal: 'gap-4 md:gap-6 lg:gap-8',
    loose: 'gap-6 md:gap-8 lg:gap-10',
  };
  return configs[size];
};

/**
 * Responsive flex direction
 */
export const getResponsiveDirection = (mobileDir: 'row' | 'col' = 'col', desktopDir: 'row' | 'col' = 'row') => {
  const dirMap = { row: 'flex-row', col: 'flex-col' };
  return `flex ${dirMap[mobileDir]} ${desktopDir === 'row' ? 'lg:flex-row' : 'lg:flex-col'}`;
};

/**
 * Responsive text align
 */
export const getResponsiveTextAlign = (mobile: 'left' | 'center' | 'right' = 'left', desktop: 'left' | 'center' | 'right' = 'left') => {
  const alignMap = { left: 'text-left', center: 'text-center', right: 'text-right' };
  const mobileClass = alignMap[mobile];
  const desktopClass = desktop !== mobile ? `lg:${alignMap[desktop].split('-')[1]}` : '';
  return `${mobileClass} ${desktopClass}`;
};

/**
 * Responsive image sizing
 */
export const getResponsiveImageSize = () => {
  return {
    thumbnail: 'w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20',
    small: 'w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40',
    medium: 'w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72',
    large: 'w-full md:w-3/4 lg:w-1/2',
  };
};

/**
 * Responsive aspect ratio
 */
export const getResponsiveAspectRatio = (ratio: '1/1' | '4/3' | '16/9' | '3/2' = '16/9') => {
  const ratioMap = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-video', // Close to 4/3
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  };
  return ratioMap[ratio];
};

/**
 * Responsive shadow
 */
export const getResponsiveShadow = (level: 'sm' | 'md' | 'lg' = 'md') => {
  const shadowMap = {
    sm: 'shadow-sm md:shadow',
    md: 'shadow md:shadow-lg',
    lg: 'shadow-lg md:shadow-xl',
  };
  return shadowMap[level];
};

/**
 * Responsive border radius
 */
export const getResponsiveBorderRadius = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const radiusMap = {
    sm: 'rounded-md md:rounded-lg',
    md: 'rounded-lg md:rounded-xl',
    lg: 'rounded-xl md:rounded-2xl',
  };
  return radiusMap[size];
};

/**
 * Combined responsive card style
 */
export const getResponsiveCardClass = () => {
  return `
    bg-white rounded-lg md:rounded-xl 
    shadow-md md:shadow-lg 
    p-4 md:p-6 lg:p-8
    border border-gray-100 md:border-gray-200
  `.trim();
};

/**
 * Combined responsive button style
 */
export const getResponsiveButtonClass = () => {
  return `
    px-4 md:px-6
    py-2 md:py-2.5
    text-sm md:text-base
    rounded-lg md:rounded-xl
    transition-all duration-200
    hover:shadow-lg
    active:scale-95
  `.trim();
};

/**
 * Responsive hero section
 */
export const getResponsiveHeroClass = () => {
  return `
    min-h-screen md:min-h-[80vh]
    px-4 md:px-8 lg:px-16
    py-8 md:py-12 lg:py-20
    flex flex-col md:flex-row
    items-center justify-between
    gap-6 md:gap-8 lg:gap-12
  `.trim();
};

/**
 * Responsive grid with auto-fit
 */
export const getResponsiveAutoGrid = (minWidth: '200px' | '250px' | '300px' = '250px') => {
  return `grid auto-fit gap-4 md:gap-6 lg:gap-8`;
};

/**
 * Calculate responsive breakpoint-based value
 */
export const getResponsiveValue = <T,>(
  mobileValue: T,
  tabletValue?: T,
  desktopValue?: T
): { mobile: T; tablet: T; desktop: T } => {
  return {
    mobile: mobileValue,
    tablet: tabletValue || mobileValue,
    desktop: desktopValue || tabletValue || mobileValue,
  };
};
