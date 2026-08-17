"use client";

import Link from 'next/link';
import { Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useResponsive } from '@/components/animations';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isTablet, isMobile } = useResponsive();

  // Animation variants
  const navLinkVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    }),
    hover: { color: '#FFFFFF', scale: 1.05 }
  };

  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.05, boxShadow: '0 10px 30px rgba(90, 74, 244, 0.6)' },
    tap: { scale: 0.95 }
  };

  const navLinks = [
    { href: '/product', label: 'Product' },
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/resources', label: 'Resources' }
  ];

  return (
    <motion.nav 
      className={styles.navbar}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <motion.div variants={logoVariants} initial="hidden" animate="visible">
        <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
          <motion.div 
            style={{ 
              background: 'linear-gradient(135deg, #A78BFA 0%, #5A4AF4 100%)', 
              padding: '6px', 
              borderRadius: '8px' 
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity size={22} color="#FFF" />
          </motion.div>
          AutoSEO Pro
        </Link>
      </motion.div>
      
      {/* Desktop & Tablet Links */}
      {!isMobile && (
        <motion.div 
          className={styles.navLinks}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              variants={navLinkVariants}
              initial="hidden"
              animate="visible"
            >
              <Link 
                href={link.href} 
                className={styles.navLink}
              >
                <motion.span
                  whileHover={{ color: '#FFFFFF' }}
                  transition={{ duration: 0.2 }}
                >
                  {link.label}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      <div className={styles.rightNav}>
        {/* Desktop Buttons */}
        {!isMobile && (
          <motion.div 
            className={styles.navActions}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div variants={buttonVariants} initial="hidden" animate="visible">
              <Link href="/login" className={styles.loginLink}>
                <motion.span whileHover={{ color: '#FFFFFF' }} transition={{ duration: 0.2 }}>
                  Login
                </motion.span>
              </Link>
            </motion.div>
            <motion.div variants={buttonVariants} initial="hidden" animate="visible" custom={1}>
              <Link 
                href="/login" 
                className={styles.getStartedBtn}
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        )}

        {/* Mobile Menu Button */}
        <motion.button 
          className={styles.mobileMenuBtn} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isMobileMenuOpen ? (
              <X size={24} color="#FFF" />
            ) : (
              <Menu size={24} color="#FFF" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -30, pointerEvents: 'none' }}
            animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
            exit={{ opacity: 0, y: -30, pointerEvents: 'none' }}
            transition={{ duration: 0.3 }}
            className={styles.mobileMenu}
          >
            {/* Mobile Nav Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
            >
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className={styles.mobileNavLink} 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.span
                      whileHover={{ paddingLeft: '8px', color: '#A78BFA' }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Mobile Action Buttons */}
            <motion.div 
              className={styles.mobileNavActions}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/login" 
                  className={styles.mobileLoginBtn} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/login" 
                  className={styles.getStartedBtn} 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
