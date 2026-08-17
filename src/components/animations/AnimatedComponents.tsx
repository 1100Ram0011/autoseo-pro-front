'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { fadeInUp, scaleIn, staggerContainer } from '@/utils/motionVariants';
import { motionConfig } from '@/config/motionConfig';

interface AnimatedContainerProps extends Omit<HTMLMotionProps<"div">, "variant"> {
  children: React.ReactNode;
  variant?: 'fade' | 'scale' | 'stagger';
  delay?: number;
  motionProps?: HTMLMotionProps<"div">;
}

/**
 * Animated Container - Base component for animations
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  variant = 'fade',
  delay = 0,
  className = '',
  motionProps = {},
  ...rest
}) => {
  const variants: any = {
    fade: fadeInUp,
    scale: scaleIn,
    stagger: staggerContainer,
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{ ...motionConfig.transitions.normal, delay }}
      className={className}
      {...motionProps}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<"button">, "variant"> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Animated Button with hover and tap effects
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...rest
}) => {
  const baseClasses = 'font-semibold transition-all duration-200 flex items-center gap-2 justify-center';

  const variantClasses: Record<string, string> = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={finalClassName}
      {...rest}
    >
      {icon && !isLoading && icon}
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        />
      )}
      <span>{children}</span>
    </motion.button>
  );
};

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hover?: boolean;
}

/**
 * Animated Card with lift effect on hover
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  hover = true,
  className = '',
  ...rest
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={`bg-white rounded-lg shadow-md p-6 transition-shadow ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated Loading Spinner
 */
export const AnimatedSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ size = 'md', color = '#6366f1' }) => {
  const sizeMap = { sm: 24, md: 40, lg: 56 };
  const dimension = sizeMap[size];

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        fill="none"
      >
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={dimension / 2 - 4}
          stroke="#f0f0f0"
          strokeWidth="2"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={dimension / 2 - 4}
          stroke={color}
          strokeWidth="2"
          strokeDasharray={`${Math.PI * (dimension - 8) * 0.25} ${Math.PI * (dimension - 8)}`}
        />
      </svg>
    </motion.div>
  );
};

/**
 * Skeleton Loader with shimmer effect
 */
export const SkeletonLoader: React.FC<{
  width?: string;
  height?: string;
  count?: number;
  circle?: boolean;
}> = ({ width = 'w-full', height = 'h-4', count = 3, circle = false }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            backgroundPosition: ['200% 0%', '-200% 0%'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`${width} ${height} ${
            circle ? 'rounded-full' : 'rounded-md'
          } bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]`}
        />
      ))}
    </div>
  );
};

/**
 * Fade In Text - animates text on scroll
 */
export const FadeInText: React.FC<{
  children: string;
  className?: string;
}> = ({ children, className = '' }) => {
  const words = children.split(' ');

  return (
    <motion.span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          viewport={{ once: true }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

interface GradientTextProps extends HTMLMotionProps<"span"> {
  children: React.ReactNode;
  colors?: string[];
}

/**
 * Animated Gradient Text
 */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  colors = ['#6366f1', '#8b5cf6', '#ec4899'],
  className = '',
  ...rest
}) => {
  const gradientStyle = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(', ')})`,
    backgroundSize: '200% 100%',
  };

  return (
    <motion.span
      animate={{
        backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
      }}
      transition={{ duration: 3, repeat: Infinity }}
      style={gradientStyle}
      className={`bg-clip-text text-transparent font-bold ${className}`}
      {...rest}
    >
      {children}
    </motion.span>
  );
};

/**
 * Animated Badge/Chip
 */
export const AnimatedBadge: React.FC<{
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  animate?: boolean;
}> = ({ label, variant = 'info', animate = false }) => {
  const variantClasses: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <motion.span
      animate={animate ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.6, repeat: Infinity }}
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variantClasses[variant]}`}
    >
      {label}
    </motion.span>
  );
};

/**
 * Animated Counter (for statistics)
 */
export const AnimatedCounter: React.FC<{
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({ from = 0, to, duration = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    const increment = (to - from) / (duration * 60); // 60fps
    let current = from;

    const timer = setInterval(() => {
      current += increment;
      if (current >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * List with staggered animation
 */
export const AnimatedList: React.FC<{
  items: React.ReactNode[];
  staggerDelay?: number;
}> = ({ items, staggerDelay = 0.1 }) => {
  return (
    <motion.ul
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * staggerDelay }}
        >
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
};
