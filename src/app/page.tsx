"use client";

import Link from 'next/link';
import { Activity, Sparkles, Check, ChevronDown, ArrowRight, Menu, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
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
  return (
    <div className={styles.container}>
      {/* Abstract Backgrounds */}
      <div className={styles.backgroundGlow}></div>
      <div className={styles.gridOverlay}></div>

      {/* Navigation */}
      <Navbar />

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
                        style={{ flex: 1, background: 'linear-gradient(to top, #3b82f6, #8b5cf6)', borderRadius: '4px 4px 0 0', opacity: 0.8 }}
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(90, 74, 244, 0.1)', padding: '1rem', borderRadius: '50%', border: '1px solid rgba(90, 74, 244, 0.25)', boxShadow: '0 0 20px rgba(90, 74, 244, 0.2)' }}>
              <Target size={36} color="#A78BFA" />
            </div>
          </div>
          <h2 className={styles.visionTitle}>
            Our Vision
          </h2>
          <div className={styles.visionCard}>
            <p style={{ marginBottom: '1.5rem' }}>
              <span className={styles.highlightText}>We are building a platform that helps people rank their websites higher on Google — this is called SEO.</span>
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Imagine a restaurant with a website that's nowhere to be found on Google. Our tool will audit their website, identify areas for improvement, and use AI (like ChatGPT) to automatically write blog posts, discover keywords, and provide actionable tips to optimize their site.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              It also features an AI agent system that autonomously finds potential customers, sends them targeted emails, and automates marketing workflows — without requiring constant human intervention.
            </p>
            <p className={styles.successText}>
              In simple terms: it's a 'digital marketing assistant' that simplifies tasks for small businesses using AI, empowering them to grow without having to hire expensive marketing agencies.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
