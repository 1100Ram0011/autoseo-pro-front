# 🎨 Animation Components & Hooks - Quick Reference Card

## Import Statement (Everything in One)
```tsx
import {
  // Animated Components
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
  
  // Transition Components
  PageTransition,
  SectionTransition,
  ModalTransition,
  SidebarTransition,
  DropdownTransition,
  
  // Custom Hooks
  useResponsive,
  useInView,
  useTouch,
  useReducedMotion,
  useScrollAnimation,
  
  // Animation Variants
  fadeInUp,
  slideInLeft,
  hoverScale,
  staggerContainer,
  
  // Responsive Utils
  getResponsiveContainer,
  getResponsiveGrid,
  getResponsiveClass,
  
  // Config & Breakpoints
  motionConfig,
  BREAKPOINTS,
  ANIMATION_DURATION,
} from '@/components/animations';
```

---

## 🎬 Animated Components

### Basic Components

| Component | Props | Example |
|-----------|-------|---------|
| **AnimatedContainer** | `variant: 'fade' \| 'scale' \| 'stagger'`<br/>`delay: number`<br/>`className: string` | `<AnimatedContainer variant="fade"><h1>Hi</h1></AnimatedContainer>` |
| **AnimatedButton** | `variant: 'primary' \| 'secondary' \| 'ghost'`<br/>`size: 'sm' \| 'md' \| 'lg'`<br/>`isLoading: boolean`<br/>`icon: React.ReactNode` | `<AnimatedButton variant="primary" size="lg">Click</AnimatedButton>` |
| **AnimatedCard** | `hover: boolean`<br/>`className: string`<br/>`children: React.ReactNode` | `<AnimatedCard><p>Card content</p></AnimatedCard>` |

### Loading & Feedback

| Component | Props | Example |
|-----------|-------|---------|
| **AnimatedSpinner** | `size: 'sm' \| 'md' \| 'lg'`<br/>`color: string` | `<AnimatedSpinner size="md" />` |
| **SkeletonLoader** | `width: string`<br/>`height: string`<br/>`count: number`<br/>`circle: boolean` | `<SkeletonLoader width="w-full" height="h-4" count={3} />` |

### Text & Visual

| Component | Props | Example |
|-----------|-------|---------|
| **FadeInText** | `children: string`<br/>`className: string` | `<FadeInText className="text-2xl">Text here</FadeInText>` |
| **GradientText** | `children: React.ReactNode`<br/>`colors: string[]`<br/>`className: string` | `<GradientText>Gradient</GradientText>` |
| **AnimatedBadge** | `label: string`<br/>`variant: 'success' \| 'warning' \| 'error' \| 'info'`<br/>`animate: boolean` | `<AnimatedBadge label="New" variant="success" />` |

### Data Display

| Component | Props | Example |
|-----------|-------|---------|
| **AnimatedCounter** | `from: number` (default: 0)<br/>`to: number`<br/>`duration: number` (default: 2)<br/>`prefix: string`<br/>`suffix: string` | `<AnimatedCounter to={1000} prefix="$" suffix="+" />` |
| **AnimatedList** | `items: React.ReactNode[]`<br/>`staggerDelay: number` | `<AnimatedList items={myItems} staggerDelay={0.1} />` |

---

## 🔄 Transition Components

| Component | Props | Use Case |
|-----------|-------|----------|
| **PageTransition** | `variant: 'fadeUp' \| 'fadeDown' \| 'fadeLeft' \| 'fadeRight' \| 'fade'`<br/>`delay: number` | Page entrance animations |
| **SectionTransition** | `index: number` (optional) | Major page sections |
| **HeaderTransition** | - | Sticky header with blur |
| **ModalTransition** | `isOpen: boolean`<br/>`onClose: () => void` | Modals & dialogs |
| **SidebarTransition** | `isOpen: boolean`<br/>`side: 'left' \| 'right'`<br/>`onClose: () => void` | Slide-in sidebars |
| **DropdownTransition** | `isOpen: boolean` | Dropdown menus |
| **CollapseTransition** | `isOpen: boolean` | Accordions & collapsible content |
| **ToastTransition** | `position: 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | Toast notifications |
| **TabContentTransition** | `key: string \| number` | Tab content switching |

---

## 🪝 Custom Hooks

### Device & Viewport

```tsx
// Device detection
const { device, isMobile, isTablet, isDesktop } = useResponsive();

// Scroll detection
const { scrollY, scrollDirection } = useScrollAnimation();
const { elementRef, isVisible } = useScrollVisibility(offset);

// Window size
const { width, height } = useWindowSize();

// Media query
const isTablet = useMediaQuery('(max-width: 1024px)');
```

### Animation & Interaction

```tsx
// In-view animation trigger
const { ref, isInView } = useInView({ once: true, amount: 0.3 });

// Touch device detection
const isTouch = useTouch();

// Reduced motion preference
const prefersReducedMotion = useReducedMotion();

// Hover & focus states
const { ref, isHovered } = useHover();
const { ref, isFocused } = useFocus();

// Debounced resize
useDebounceResize(() => { /* callback */ }, 250);
```

---

## 📊 Animation Variants (30+)

### Entrance
```tsx
// Fade
fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight

// Scale
scaleIn, scaleInUp

// Rotate
rotateIn

// Slide
slideInLeft, slideInRight, slideInUp, slideInDown
```

### Hover/Interaction
```tsx
hoverScale,      // scale: 1.05
hoverScaleLarge, // scale: 1.1
hoverLift,       // y: -4 + shadow
hoverGlow,       // box-shadow glow effect
buttonHover,     // scale: 1.02
buttonTap,       // scale: 0.95
```

### Loading
```tsx
pulse,           // opacity 1 → 0.5 → 1
shimmer,         // shimmer background animation
spin,            // 360° rotation
bounce,          // y: 0 → -10 → 0
```

### Container/Group
```tsx
staggerContainer,     // Stagger children: 0.1s delay
staggerContainerSlow, // Stagger children: 0.15s delay
pageTransitionFade,   // Page fade transition
pageTransitionSlideUp, // Page slide up transition
```

---

## 🎯 Responsive Utilities

### Container & Layout
```tsx
getResponsiveContainer('lg')    // Centered container
getResponsiveGrid(3)             // 1 col mobile, 2 col tablet, 3 col desktop
getResponsiveClass('block', 'md:grid', 'lg:flex')
```

### Spacing
```tsx
getResponsivePadding('normal')   // px-4 md:px-6 lg:px-8
getResponsiveGap('normal')       // gap-4 md:gap-6 lg:gap-8
```

### Typography
```tsx
getResponsiveFontSize('h1')      // text-2xl md:text-3xl lg:text-4xl
getResponsiveTextAlign('left', 'center')
```

### Pre-built Styles
```tsx
getResponsiveCardClass()         // Full card styling
getResponsiveButtonClass()       // Full button styling
getResponsiveHeroClass()         // Full hero section styling
```

### Media Queries
```tsx
MEDIA.mobile     // (max-width: 640px)
MEDIA.tablet     // (min-width: 641px) and (max-width: 1024px)
MEDIA.desktop    // (min-width: 1025px)
MEDIA.touchOnly  // (hover: none) and (pointer: coarse)
```

---

## ⚙️ Configuration

### Motion Config
```tsx
motionConfig.transitions.fast    // 0.2s
motionConfig.transitions.normal  // 0.4s
motionConfig.transitions.slow    // 0.6s

motionConfig.spring.tight        // Stiff spring
motionConfig.spring.normal       // Balanced spring
motionConfig.spring.bouncy       // Bouncy spring

ANIMATION_DURATION.fast          // 200ms
ANIMATION_DURATION.normal        // 350ms
ANIMATION_DURATION.slow          // 500ms
```

### Breakpoints
```tsx
BREAKPOINTS.xs    // 320px
BREAKPOINTS.sm    // 480px
BREAKPOINTS.md    // 640px
BREAKPOINTS.lg    // 1024px (Tablet!)
BREAKPOINTS.xl    // 1280px
BREAKPOINTS.xxl   // 1536px
```

---

## 💡 Common Patterns

### Pattern 1: Animated Page
```tsx
import { PageTransition } from '@/components/animations';

export default function Page() {
  return (
    <PageTransition variant="fadeUp">
      <h1>Content here</h1>
    </PageTransition>
  );
}
```

### Pattern 2: Responsive Grid
```tsx
import { getResponsiveGrid, AnimatedCard } from '@/components/animations';

export default function CardGrid() {
  return (
    <div className={getResponsiveGrid(3)}>
      {items.map(item => (
        <AnimatedCard key={item.id}>
          {item.content}
        </AnimatedCard>
      ))}
    </div>
  );
}
```

### Pattern 3: Device-Specific Layout
```tsx
import { useResponsive } from '@/components/animations';

export default function ResponsiveLayout() {
  const { isTablet } = useResponsive();
  
  return isTablet ? <TabletLayout /> : <DefaultLayout />;
}
```

### Pattern 4: Scroll Animation
```tsx
import { useInView } from '@/components/animations';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/components/animations';

export default function ScrollSection() {
  const { ref, isInView } = useInView();
  
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeInUp}
    >
      Content
    </motion.section>
  );
}
```

### Pattern 5: Loading State
```tsx
import { AnimatedSpinner, SkeletonLoader } from '@/components/animations';

export default function DataDisplay() {
  if (loading) return <SkeletonLoader count={3} />;
  if (error) return <p>Error loading</p>;
  return <div>{data}</div>;
}
```

---

## 🔍 Quick Lookup

**Need to...**
| Task | Use |
|------|-----|
| Make text fade in | `FadeInText` or `fadeInUp` variant |
| Animate page entrance | `PageTransition` |
| Make buttons interactive | `AnimatedButton` |
| Show loading state | `AnimatedSpinner` or `SkeletonLoader` |
| Create modal | `ModalTransition` |
| Detect device type | `useResponsive()` hook |
| Animate on scroll | `useInView()` hook |
| Responsive grid | `getResponsiveGrid()` |
| Center container | `getResponsiveContainer()` |
| Card with hover | `AnimatedCard` |
| Stagger list items | `AnimatedList` or `staggerContainer` |
| Smooth dropdown | `DropdownTransition` |
| Respect motion preferences | `useReducedMotion()` hook |
| Count up to number | `AnimatedCounter` |
| Gradient text | `GradientText` |

---

## 📚 Documentation

- **Full Guide**: See `ANIMATION_IMPLEMENTATION_GUIDE.md`
- **Roadmap**: See `UI_IMPROVEMENTS_PLAN.md`
- **Summary**: See `ANIMATIONS_SUMMARY.md`
- **Checklist**: See `PHASE2_IMPLEMENTATION_CHECKLIST.md`

---

**Last Updated**: 2026-08-17
**Phase**: 1 Complete ✅ - Ready for Phase 2 Implementation
