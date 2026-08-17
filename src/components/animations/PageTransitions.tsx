'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionSlideUp, fadeIn, staggerContainer } from '@/utils/motionVariants';
import { motionConfig } from '@/config/motionConfig';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'fade';
  delay?: number;
}

/**
 * Page Transition Wrapper
 * Wraps entire pages for smooth page transitions
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fadeUp',
  delay = 0,
}) => {
  const variants: Record<string, any> = {
    fadeUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    fadeDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    fadeLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    fadeRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
  };

  const selectedVariant = variants[variant];

  return (
    <motion.div
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={{
        ...motionConfig.transitions.normal,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered Page Transition - for pages with multiple sections
 */
export const StaggeredPageTransition: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

/**
 * Section Transition - for major sections within pages
 */
export const SectionTransition: React.FC<{
  children: React.ReactNode;
  index?: number;
}> = ({ children, index = 0 }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        ...motionConfig.transitions.normal,
        delay: index * 0.1,
      }}
    >
      {children}
    </motion.section>
  );
};

/**
 * Header Transition - for top navigation
 */
export const HeaderTransition: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
    >
      {children}
    </motion.header>
  );
};

/**
 * Tabbed Content Transition - for tab changes
 */
export const TabContentTransition: React.FC<{
  children: React.ReactNode;
  key?: string | number;
}> = ({ children, key }) => {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Modal/Dialog Transition
 */
export const ModalTransition: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}> = ({ isOpen, children, onClose }) => {
  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-h-screen max-w-2xl w-full overflow-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

/**
 * Sidebar Transition
 */
export const SidebarTransition: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  side?: 'left' | 'right';
}> = ({ isOpen, children, onClose, side = 'left' }) => {
  const slideDirection = side === 'left' ? { x: -300 } : { x: 300 };

  return (
    <>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />

          {/* Sidebar */}
          <motion.aside
            initial={slideDirection}
            animate={{ x: 0 }}
            exit={slideDirection}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 ${side}-0 h-full w-80 bg-white shadow-lg z-40 overflow-y-auto`}
          >
            {children}
          </motion.aside>
        </>
      )}
    </>
  );
};

/**
 * Toast Notification Transition
 */
export const ToastTransition: React.FC<{
  children: React.ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}> = ({ children, position = 'top-right' }) => {
  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed ${positionClasses[position]} z-50`}
    >
      {children}
    </motion.div>
  );
};

/**
 * Dropdown Menu Transition
 */
export const DropdownTransition: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
}> = ({ isOpen, children }) => {
  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, pointerEvents: 'none' }}
          animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
          exit={{ opacity: 0, y: -10, pointerEvents: 'none' }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50"
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

/**
 * Collapse/Accordion Transition
 */
export const CollapseTransition: React.FC<{
  isOpen: boolean;
  children: React.ReactNode;
}> = ({ isOpen, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        height: isOpen ? 'auto' : 0,
      }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
};

/**
 * List Item Reveal Transition - for lists with staggered items
 */
export const ListRevealTransition: React.FC<{
  children: React.ReactNode[];
  staggerDelay?: number;
}> = ({ children, staggerDelay = 0.1 }) => {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
