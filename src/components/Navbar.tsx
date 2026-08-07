"use client";

import Link from 'next/link';
import { Activity, ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo} style={{ textDecoration: 'none' }}>
        <div style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #5A4AF4 100%)', padding: '6px', borderRadius: '8px' }}>
          <Activity size={22} color="#FFF" />
        </div>
        AutoSEO Pro
      </Link>
      
      {/* Desktop Links */}
      <div className={styles.navLinks}>
        <Link href="/product" className={styles.navLink}>Product</Link>
        <Link href="/features" className={styles.navLink}>Features</Link>
        <Link href="/pricing" className={styles.navLink}>Pricing</Link>
        <Link href="/resources" className={styles.navLink}>Resources</Link>
      </div>
      
      <div className={styles.rightNav}>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.loginLink}>Login</Link>
          <Link href="/login" className={styles.getStartedBtn}>Get Started</Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuBtn} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} color="#FFF" /> : <Menu size={24} color="#FFF" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.mobileMenu}
          >
            <Link href="/product" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Product</Link>
            <Link href="/features" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href="/pricing" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
            <Link href="/resources" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Resources</Link>
            <div className={styles.mobileNavActions}>
              <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link href="/login" className={styles.getStartedBtn} onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
