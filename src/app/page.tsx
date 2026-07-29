"use client";

import Link from 'next/link';
import { Activity, Sparkles, Check, ChevronDown, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import styles from './page.module.css';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={styles.container}>
      {/* Abstract Backgrounds */}
      <div className={styles.backgroundGlow}></div>
      <div className={styles.gridOverlay}></div>

      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <div style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #5A4AF4 100%)', padding: '6px', borderRadius: '8px' }}>
            <Activity size={22} color="#FFF" />
          </div>
          AutoSEO Pro
        </div>
        
        {/* Desktop Links */}
        <div className={styles.navLinks}>
          <Link href="#" className={styles.navLink}>Product <ChevronDown size={14} /></Link>
          <Link href="#" className={styles.navLink}>Features <ChevronDown size={14} /></Link>
          <Link href="#" className={styles.navLink}>Pricing</Link>
          <Link href="#" className={styles.navLink}>Resources <ChevronDown size={14} /></Link>
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
              <Link href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Product</Link>
              <Link href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
              <Link href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <Link href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Resources</Link>
              <div className={styles.mobileNavActions}>
                <Link href="/login" className={styles.mobileLoginBtn} onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                <Link href="/login" className={styles.getStartedBtn} onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <motion.div 
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className={styles.aiBadge}>
            <Sparkles size={16} /> AI-Powered Platform
          </motion.div>
          <motion.h1 variants={fadeIn} className={styles.heroTitle}>
            Automate Your SEO &<br/>
            <span>Rank Higher</span> Faster.
          </motion.h1>
          <motion.p variants={fadeIn} className={styles.heroSubtitle}>
            Harness the power of AI to generate content, discover keywords, and fully automate your digital marketing workflows.
          </motion.p>
          <motion.div variants={fadeIn} className={styles.heroActions}>
            <Link href="/login" className={styles.trialBtn}>
              Start 7 Days Free Trial <ArrowRight size={18} />
            </Link>
            <Link href="#" className={styles.demoBtn}>Book a Demo</Link>
          </motion.div>
          <motion.div variants={fadeIn} className={styles.heroFeatures}>
            <div className={styles.heroFeature}><Check size={16} color="#34D399"/> AI SEO Tools</div>
            <div className={styles.heroFeature}><Check size={16} color="#34D399"/> Auto Content Generation</div>
            <div className={styles.heroFeature}><Check size={16} color="#34D399"/> Lead Gen & Outreach</div>
          </motion.div>
        </motion.div>

        <motion.div 
          className={styles.heroVisual}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className={styles.mockDash}>
            <div className={styles.mockSidebar}>
              <div className={`${styles.mockLine} ${styles.mockLineActive}`} style={{width: '80%'}}></div>
              <div className={styles.mockLine} style={{width: '60%'}}></div>
              <div className={styles.mockLine} style={{width: '70%'}}></div>
              <div className={styles.mockLine} style={{width: '50%'}}></div>
              <div className={styles.mockLine} style={{width: '90%', marginTop: 'auto'}}></div>
            </div>
            <div className={styles.mockContent}>
              <div style={{display: 'flex', gap: '1.25rem'}}>
                <div className={styles.mockCard} style={{flex: 1, height: '100px', background: 'rgba(90, 74, 244, 0.1)'}}></div>
                <div className={styles.mockCard} style={{flex: 1, height: '100px'}}></div>
                <div className={styles.mockCard} style={{flex: 1, height: '100px'}}></div>
              </div>
              <div className={styles.mockCard} style={{flex: 1}}>
                <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%'}}>
                  <div className={styles.mockLine} style={{width: '30%'}}></div>
                  <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '1rem'}}>
                    {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                        style={{ flex: 1, background: 'linear-gradient(to top, #5A4AF4, #A78BFA)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}
                      ></motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By */}
      <section className={styles.trustedSection}>
        <div className={styles.trustedTitle}>Trusted by innovative teams worldwide</div>
        <div className={styles.logos}>
          <h2>envato</h2>
          <h2>CLOUDWAYS</h2>
          <h2>airbnb</h2>
          <h2>HubSpot</h2>
          <h2>Microsoft</h2>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <motion.div className={styles.statItem} whileHover={{ y: -5 }}>
          <div className={styles.statNumber}>6+</div>
          <div className={styles.statLabel}>Powerful AI Modules</div>
        </motion.div>
        <motion.div className={styles.statItem} whileHover={{ y: -5 }}>
          <div className={styles.statNumber}>12.4K</div>
          <div className={styles.statLabel}>Active Users</div>
        </motion.div>
        <motion.div className={styles.statItem} whileHover={{ y: -5 }}>
          <div className={styles.statNumber}>85%</div>
          <div className={styles.statLabel}>Success Rate</div>
        </motion.div>
        <motion.div className={styles.statItem} whileHover={{ y: -5 }}>
          <div className={styles.statNumber}>2x</div>
          <div className={styles.statLabel}>Faster Results</div>
        </motion.div>
      </section>

      {/* Vision / About Us (Hindi) */}
      <section className={styles.visionSection}>
        <motion.div 
          className={styles.visionContainer}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className={styles.visionTitle}>
            Hamara Vision
          </h2>
          <div className={styles.visionCard}>
            <p style={{ marginBottom: '1.5rem' }}>
              <span className={styles.highlightText}>Main ek aisa software bana raha hoon jo logon ki websites ko Google par upar laane mein madad karta hai — isse SEO kehte hain.</span>
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Jaise maan lo kisi ka restaurant hai aur uski website hai, lekin Google mein wo kahin nazar nahi aati. Mera tool unki website ko check karega, batayega ki kya kami hai, aur AI (jaisa ki ChatGPT) ki madad se khud hi unke liye blog posts likh dega, keywords dhoondega, aur unki website ko sudharne ke tips dega.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Isme ek robot jaisa system bhi hai jo khud hi customers dhoondta hai, unhe email bhejta hai, aur unka kaam automatic kar deta hai — bina kisi insaan ke baar baar click kiye.
            </p>
            <p className={styles.successText}>
              Matlab simple bhasha mein: yeh ek 'digital marketing assistant' hai jo chhote business walon ka kaam AI se aasan bana deta hai, taaki unhe expensive agency hire na karni pade.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
