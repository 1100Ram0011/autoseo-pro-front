"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Globe, ChevronDown, LayoutDashboard, Wrench, FileJson, 
  Search, Key, Code, AlertCircle, BarChart, Users, MousePointer, 
  Video, PenTool, MessageSquare, Calendar, Target, Mail, 
  UsersRound, FileText, Puzzle, Settings, CreditCard, Link as LinkIcon, 
  Smartphone, LineChart, ShieldAlert, Sparkles, FileText as FileTextIcon, UploadCloud, Zap, BookOpen, Store, Bot, Menu, X, MapPin, LogOut
} from 'lucide-react';
import SiteSelector from '@/components/SiteSelector';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isRouteActive = (route: string) => {
    return pathname === route;
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${isMobileMenuOpen ? styles.overlayOpen : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Dark Theme Sidebar */}
      <div className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <Link href="/" className={styles.logoArea} style={{ marginBottom: 0 }}>
            <div className={styles.logoGroup}>
              <Activity size={24} color="#5A4AF4" />
              AutoSEO Pro
            </div>
            <div className={styles.versionBadge}>v1.0</div>
          </Link>
          <button className={styles.mobileCloseBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <SiteSelector />

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>OVERVIEW</div>
          <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/dashboard/analytics" className={`${styles.navItem} ${isRouteActive('/dashboard/analytics') ? styles.active : ''}`}>
            <BarChart size={18} /> Google Analytics
          </Link>
          <Link href="/dashboard/search-console" className={`${styles.navItem} ${isRouteActive('/dashboard/search-console') ? styles.active : ''}`}>
            <LineChart size={18} /> Search Console
          </Link>
          <Link href="/dashboard/reports" className={`${styles.navItem} ${isRouteActive('/dashboard/reports') ? styles.active : ''}`}>
            <FileText size={18} /> Reports
          </Link>
          <Link href="/dashboard/recordings" className={`${styles.navItem} ${isRouteActive('/dashboard/recordings') ? styles.active : ''}`}>
            <Video size={18} /> Recordings
          </Link>
          <Link href="/dashboard/alerts" className={`${styles.navItem} ${isRouteActive('/dashboard/alerts') ? styles.active : ''}`}>
            <AlertCircle size={18} /> Alerts
            <span className={styles.navBadgeRed}>12</span>
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>AGENTIC SEO (AI)</div>
          <Link href="/dashboard/agentic-seo" className={`${styles.navItem} ${isRouteActive('/dashboard/agentic-seo') ? styles.active : ''}`}>
            <Bot size={18} /> AI Identity Setup
            <span className={styles.navBadge}>New</span>
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>KEYWORDS & AI CONTENT</div>
          <Link href="/dashboard/chat" className={`${styles.navItem} ${isRouteActive('/dashboard/chat') ? styles.active : ''}`}>
            <Sparkles size={18} /> AI SEO Assistant
            <span className={styles.navBadge}>New</span>
          </Link>
          <Link href="/dashboard/keywords" className={`${styles.navItem} ${isRouteActive('/dashboard/keywords') ? styles.active : ''}`}>
            <Key size={18} /> Keywords Tracker
          </Link>
          <Link href="/dashboard/google-keywords" className={`${styles.navItem} ${isRouteActive('/dashboard/google-keywords') ? styles.active : ''}`}>
            <Target size={18} /> Google Keywords
          </Link>
          <Link href="/dashboard/blog" className={`${styles.navItem} ${isRouteActive('/dashboard/blog') ? styles.active : ''}`}>
            <PenTool size={18} /> AI Blog Writer
          </Link>
          <Link href="/dashboard/meta" className={`${styles.navItem} ${isRouteActive('/dashboard/meta') ? styles.active : ''}`}>
            <FileTextIcon size={18} /> AI Meta Generator
          </Link>
          <Link href="/dashboard/planner" className={`${styles.navItem} ${isRouteActive('/dashboard/planner') ? styles.active : ''}`}>
            <Calendar size={18} /> Content Optimizer
          </Link>
          <Link href="/dashboard/competitors" className={`${styles.navItem} ${isRouteActive('/dashboard/competitors') ? styles.active : ''}`}>
            <UsersRound size={18} /> Competitors
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>TECHNICAL SEO</div>
          <Link href="/dashboard/cwv" className={`${styles.navItem} ${isRouteActive('/dashboard/cwv') ? styles.active : ''}`}>
            <Activity size={18} /> Core Web Vitals
          </Link>
          <Link href="/dashboard/lighthouse" className={`${styles.navItem} ${isRouteActive('/dashboard/lighthouse') ? styles.active : ''}`}>
            <Zap size={18} /> Lighthouse Audit
          </Link>
          <Link href="/dashboard/mobile" className={`${styles.navItem} ${isRouteActive('/dashboard/mobile') ? styles.active : ''}`}>
            <Smartphone size={18} /> Mobile Usability
          </Link>
          <Link href="/dashboard/schema" className={`${styles.navItem} ${isRouteActive('/dashboard/schema') ? styles.active : ''}`}>
            <Code size={18} /> Schema Markup
          </Link>
          <Link href="/dashboard/security" className={`${styles.navItem} ${isRouteActive('/dashboard/security') ? styles.active : ''}`}>
            <ShieldAlert size={18} /> Security Audit
          </Link>
          <Link href="/dashboard/pages" className={`${styles.navItem} ${isRouteActive('/dashboard/pages') ? styles.active : ''}`}>
            <FileTextIcon size={18} /> Pages
          </Link>
          <Link href="/dashboard/url-inspection" className={`${styles.navItem} ${isRouteActive('/dashboard/url-inspection') ? styles.active : ''}`}>
            <Search size={18} /> URL Inspection
          </Link>
          <Link href="/dashboard/index-coverage" className={`${styles.navItem} ${isRouteActive('/dashboard/index-coverage') ? styles.active : ''}`}>
            <ShieldAlert size={18} /> Index Coverage
          </Link>
          <Link href="/dashboard/indexing" className={`${styles.navItem} ${isRouteActive('/dashboard/indexing') ? styles.active : ''}`}>
            <UploadCloud size={18} /> Indexing API
          </Link>
          <Link href="/dashboard/sitemaps" className={`${styles.navItem} ${isRouteActive('/dashboard/sitemaps') ? styles.active : ''}`}>
            <FileJson size={18} /> Sitemaps
          </Link>
          <Link href="/dashboard/robots" className={`${styles.navItem} ${isRouteActive('/dashboard/robots') ? styles.active : ''}`}>
            <Code size={18} /> Robots.txt
          </Link>
          <Link href="/dashboard/backlinks" className={`${styles.navItem} ${isRouteActive('/dashboard/backlinks') ? styles.active : ''}`}>
            <LinkIcon size={18} /> Backlinks
          </Link>
          <Link href="/dashboard/internal-links" className={`${styles.navItem} ${isRouteActive('/dashboard/internal-links') ? styles.active : ''}`}>
            <LinkIcon size={18} /> Internal Links
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>GOOGLE BUSINESS & REPUTATION</div>
          <Link href="/dashboard/local-seo" className={`${styles.navItem} ${isRouteActive('/dashboard/local-seo') ? styles.active : ''}`}>
            <Store size={18} /> Local SEO Profile
          </Link>
          <Link href="/dashboard/reviews" className={`${styles.navItem} ${isRouteActive('/dashboard/reviews') ? styles.active : ''}`}>
            <MessageSquare size={18} /> Review Management
          </Link>
          <Link href="/dashboard/leads/map" className={`${styles.navItem} ${isRouteActive('/dashboard/leads/map') ? styles.active : ''}`}>
            <MapPin size={18} /> Map & LinkedIn Leads
            <span className={styles.navBadge}>New</span>
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>SETTINGS & SETUP</div>
          <Link href="/dashboard/guide" className={`${styles.navItem} ${isRouteActive('/dashboard/guide') ? styles.active : ''}`}>
            <BookOpen size={18} /> Platform Guide
          </Link>
          <Link href="/dashboard/setup" className={`${styles.navItem} ${isRouteActive('/dashboard/setup') ? styles.active : ''}`}>
            <Wrench size={18} /> Setup Wizard
          </Link>
          <Link href="/dashboard/integrations" className={`${styles.navItem} ${isRouteActive('/dashboard/integrations') ? styles.active : ''}`}>
            <Puzzle size={18} /> Integrations
          </Link>
          <Link href="/dashboard/settings" className={`${styles.navItem} ${isRouteActive('/dashboard/settings') ? styles.active : ''}`}>
            <Settings size={18} /> Settings
          </Link>
          <Link href="/dashboard/billing" className={`${styles.navItem} ${isRouteActive('/dashboard/billing') ? styles.active : ''}`}>
            <CreditCard size={18} /> Billing & Plan
          </Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>
          <Link href="/" className={styles.navItem}>
            <LogOut size={18} /> Logout
          </Link>
        </div>

        <div className={styles.upgradeCard}>
          <div className={styles.upgradeCardTitle}>Upgrade to Agency</div>
          <div className={styles.upgradeCardDesc}>Manage up to 20 websites</div>
          <button className={styles.upgradeCardBtn}>Upgrade Now</button>
          <div className={styles.rocketGraphic}>🚀</div>
        </div>

      </div>

      <div className={styles.mainContent}>
        <div className={styles.mobileHeader}>
          <button className={styles.mobileMenuBtn} onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className={styles.logoGroup}>
            <Activity size={24} color="#5A4AF4" />
            AutoSEO Pro
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{ minHeight: '100%' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
