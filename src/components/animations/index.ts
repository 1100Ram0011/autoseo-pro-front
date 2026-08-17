/**
 * Animations Module - Central Export Point
 * Import all animation components and utilities from here
 */

// Animated Components
export {
  AnimatedContainer,
  AnimatedButton,
  AnimatedCard,
  AnimatedSpinner,
  SkeletonLoader,
  FadeInText,
  GradientText,
  AnimatedBadge,
  AnimatedCounter,
  AnimatedList,
} from './AnimatedComponents';

// Page Transitions
export {
  PageTransition,
  StaggeredPageTransition,
  SectionTransition,
  HeaderTransition,
  TabContentTransition,
  ModalTransition,
  SidebarTransition,
  ToastTransition,
  DropdownTransition,
  CollapseTransition,
  ListRevealTransition,
} from './PageTransitions';

// Animation Variants
export * from '@/utils/motionVariants';

// Motion Configuration
export { motionConfig, getMotionPreference, getSafeTransition, animationPresets, ANIMATION_DURATION, Z_INDEX } from '@/config/motionConfig';

// Breakpoints & Responsive
export * from '@/config/breakpoints';
export * from '@/utils/responsive';

// Hooks
export {
  useInView,
  useResponsive,
  useTouch,
  useReducedMotion,
  useScrollAnimation,
  useScrollVisibility,
  useDebounceResize,
  useWindowSize,
  useHover,
  useFocus,
  useMediaQuery,
} from '@/hooks/useAnimation';
