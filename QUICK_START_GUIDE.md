# 🚀 Quick Start - Apply Animations to Your Pages

**This guide shows exactly how to enhance any page with the new animation system in 5 minutes!**

---

## Step 1: Import at the Top

```tsx
"use client";

import { motion } from 'framer-motion';
import { 
  PageTransition,        // Wrap entire page
  SectionTransition,     // Wrap sections
  AnimatedButton,        // Use for buttons
  AnimatedCard,          // Use for cards
  getResponsiveGrid,     // For responsive grids
  useResponsive,         // For device detection
  fadeInUp,              // Animation variant
  staggerContainer,      // For lists
} from '@/components/animations';
```

---

## Step 2: Wrap Your Page

**Before:**
```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen p-8">
      {/* Content */}
    </div>
  );
}
```

**After:**
```tsx
export default function MyPage() {
  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen p-8">
        {/* Content */}
      </div>
    </PageTransition>
  );
}
```

---

## Step 3: Animate Sections

**Before:**
```tsx
<div className="mb-10">
  <h2>Section Title</h2>
  <p>Content here</p>
</div>
```

**After:**
```tsx
<SectionTransition index={0}>
  <h2>Section Title</h2>
  <p>Content here</p>
</SectionTransition>
```

---

## Step 4: Enhance Buttons

**Before:**
```tsx
<button className="bg-blue-500">Click Me</button>
```

**After:**
```tsx
<AnimatedButton variant="primary" size="lg">
  Click Me
</AnimatedButton>
```

---

## Step 5: Create Responsive Grids

**Before:**
```tsx
<div className="grid grid-cols-3">
  {items.map(item => <Card key={item.id}>{item}</Card>)}
</div>
```

**After:**
```tsx
<div className={getResponsiveGrid(3)}>
  {items.map(item => (
    <AnimatedCard key={item.id}>
      {item}
    </AnimatedCard>
  ))}
</div>
```

---

## Real Examples from Your Project

### Example 1: Pricing Page

```tsx
"use client";

import { PageTransition, SectionTransition, AnimatedButton, AnimatedCard, getResponsiveGrid } from '@/components/animations';

export default function PricingPage() {
  const plans = [
    { name: 'Starter', price: '$29', features: [...] },
    { name: 'Pro', price: '$79', features: [...] },
    { name: 'Enterprise', price: 'Custom', features: [...] },
  ];

  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen p-8">
        
        {/* Header */}
        <SectionTransition index={0}>
          <h1 className="text-4xl font-bold text-center">Simple Pricing</h1>
          <p className="text-center mt-4">Choose the plan that fits your needs</p>
        </SectionTransition>

        {/* Pricing Cards */}
        <SectionTransition index={1}>
          <div className={getResponsiveGrid(3)}>
            {plans.map((plan, i) => (
              <AnimatedCard key={i}>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">{plan.price}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j}>✓ {feature}</li>
                  ))}
                </ul>
                <AnimatedButton variant="primary" className="w-full mt-6">
                  Get Started
                </AnimatedButton>
              </AnimatedCard>
            ))}
          </div>
        </SectionTransition>

      </div>
    </PageTransition>
  );
}
```

### Example 2: Product Page

```tsx
"use client";

import { PageTransition, SectionTransition, AnimatedButton } from '@/components/animations';
import { motion } from 'framer-motion';

export default function ProductPage() {
  return (
    <PageTransition variant="fadeUp">
      <div className="min-h-screen">
        
        {/* Hero */}
        <SectionTransition index={0}>
          <div className="py-20 px-8 text-center">
            <h1 className="text-5xl font-bold">AutoSEO Pro</h1>
            <p className="mt-4 text-xl">The ultimate SEO automation platform</p>
            <AnimatedButton variant="primary" size="lg" className="mt-8">
              Get Started Free
            </AnimatedButton>
          </div>
        </SectionTransition>

        {/* Features */}
        <SectionTransition index={1}>
          <div className="py-20 px-8 bg-gray-50">
            <h2 className="text-3xl font-bold mb-10">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                'AI Content Generation',
                'Keyword Research',
                'Rank Tracking',
                'Backlink Analysis',
                'Technical SEO Audit',
                'Competitor Analysis',
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-white rounded-lg shadow"
                >
                  <h3 className="font-bold text-lg">{feature}</h3>
                  <p className="mt-2 text-gray-600">Powerful tools to boost your SEO</p>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionTransition>

      </div>
    </PageTransition>
  );
}
```

### Example 3: Form Page

```tsx
"use client";

import { motion } from 'framer-motion';
import { PageTransition, AnimatedButton } from '@/components/animations';

export default function FormPage() {
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <PageTransition variant="fadeUp">
      <div className="max-w-2xl mx-auto p-8 mt-20">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

        <motion.form
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {[
            { label: 'Name', name: 'name', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
          ].map((field, i) => (
            <motion.div key={i} variants={itemVariants}>
              <label className="block text-sm font-medium mb-2">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </motion.div>
          ))}

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              rows={5}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your message"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <AnimatedButton variant="primary" size="lg" className="w-full">
              Send Message
            </AnimatedButton>
          </motion.div>
        </motion.form>
      </div>
    </PageTransition>
  );
}
```

---

## Common Patterns

### Pattern 1: List with Stagger
```tsx
<motion.ul
  variants={staggerContainer}
  initial="hidden"
  animate="visible"
  className="space-y-3"
>
  {items.map((item, i) => (
    <motion.li
      key={i}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Pattern 2: Responsive Device Detection
```tsx
const { device, isTablet, isMobile } = useResponsive();

return (
  <>
    {isMobile && <MobileLayout />}
    {isTablet && <TabletLayout />}
    {!isMobile && !isTablet && <DesktopLayout />}
  </>
);
```

### Pattern 3: Scroll-Triggered Animation
```tsx
const { ref, isInView } = useInView();

return (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 100 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
    transition={{ duration: 0.5 }}
  >
    Content appears when scrolled into view
  </motion.div>
);
```

### Pattern 4: Custom Animation Variant
```tsx
const myVariant = {
  hidden: { opacity: 0, scale: 0.8, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.5, type: 'spring' }
  }
};

<motion.div
  initial="hidden"
  animate="visible"
  variants={myVariant}
>
  Custom animated element
</motion.div>
```

---

## Animation Variants Cheat Sheet

### Entrance Animations
```
fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
scaleIn, scaleInUp
rotateIn
slideInLeft, slideInRight, slideInUp, slideInDown
```

### Hover/Interaction
```
hoverScale, hoverScaleLarge
hoverLift, hoverGlow
buttonHover, buttonTap
```

### Loading
```
pulse, shimmer, spin, bounce
```

### Containers
```
staggerContainer, staggerContainerSlow
```

---

## Responsive Utilities Cheat Sheet

### Classes
```
getResponsiveContainer('lg')
getResponsiveGrid(3)
getResponsiveClass('block', 'md:grid', 'lg:flex')
getResponsivePadding('normal')
getResponsiveGap('normal')
```

### Hooks
```
useResponsive()      → { device, isMobile, isTablet, isDesktop }
useInView()          → { ref, isInView }
useTouch()           → isTouch boolean
useReducedMotion()   → prefersReducedMotion boolean
useWindowSize()      → { width, height }
useMediaQuery(query) → matches boolean
```

---

## Common Mistakes to Avoid

❌ **Don't**: Wrap everything in PageTransition
```tsx
// Wrong - overkill
<PageTransition>
  <PageTransition>
    <div>...</div>
  </PageTransition>
</PageTransition>
```

✅ **Do**: Use one PageTransition per page
```tsx
// Correct
<PageTransition>
  <div>...</div>
</PageTransition>
```

---

❌ **Don't**: Use motion.div without animation
```tsx
// Wrong - no animation defined
<motion.div>Content</motion.div>
```

✅ **Do**: Define variants or use initial/animate
```tsx
// Correct - has animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  Content
</motion.div>
```

---

❌ **Don't**: Animate too many things at once
```tsx
// Wrong - too much happening
<motion.div
  animate={{ x: 100, y: 100, rotate: 360, scale: 2, ... }}
>
```

✅ **Do**: Keep animations simple and purposeful
```tsx
// Correct - focused animation
<motion.div
  animate={{ x: 100 }}
  transition={{ duration: 0.3 }}
>
```

---

## Performance Tips

1. **Use transform and opacity only**
   - ✅ Good: `animate={{ x: 100, opacity: 0.5 }}`
   - ❌ Bad: `animate={{ width: 100, marginLeft: 50 }}`

2. **Reduce animations on mobile**
   ```tsx
   const { isMobile } = useResponsive();
   const duration = isMobile ? 0.2 : 0.5;
   ```

3. **Use whileInView for scroll animations**
   ```tsx
   <motion.div
     initial={{ opacity: 0 }}
     whileInView={{ opacity: 1 }}
   />
   ```

4. **Lazy load heavy components**
   ```tsx
   const HeavyComponent = React.lazy(() => import('./Heavy'));
   ```

---

## Testing Your Animations

### On Devices
- [ ] Test on iPhone (mobile)
- [ ] Test on iPad (tablet) ← PRIORITY
- [ ] Test on Android tablet
- [ ] Test on desktop Chrome
- [ ] Test on Safari
- [ ] Test on Firefox

### Accessibility
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Verify keyboard navigation
- [ ] Check screen reader compatibility
- [ ] Verify focus states

### Performance
- [ ] Check 60 FPS (use DevTools)
- [ ] Check no jank or stuttering
- [ ] Test on slow devices
- [ ] Monitor bundle size

---

## Need Help?

📚 **Check these files**:
- `QUICK_REFERENCE.md` - Fast lookups
- `ANIMATION_IMPLEMENTATION_GUIDE.md` - Detailed guide
- `src/components/Navbar.tsx` - Real example
- `src/app/dashboard/page.tsx` - Real example
- `src/app/login/page.tsx` - Real example

---

**Happy animating! 🎨✨**

Apply this pattern to all your pages for a consistent, professional UI!
