"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info } from "lucide-react";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function BillingContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success')) {
      setIsSuccess(true);
      // In a real app, you would verify the session ID and update local state
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_123' }) // Mock user ID
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to initiate checkout');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to billing server');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Simple, Transparent Pricing</h1>
        <p className={styles.subtitle}>Unlock the full power of AI for your SEO strategy.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Manage your subscription plan, billing history, and payment methods. <strong>Example:</strong> Upgrade to the Pro plan to unlock more API limits and track more websites.
          </p>
        </div>
      </div>
  
      </div>

      {isSuccess && (
        <div className={styles.successAlert}>
          🎉 Payment successful! You are now on the Pro Plan.
        </div>
      )}

      <div className={styles.pricingGrid}>
        {/* Free Plan */}
        <div className={styles.planCard}>
          <div className={styles.planName}>Free Starter</div>
          <div className={styles.planPrice}>$0 <span className={styles.priceInterval}>/mo</span></div>
          <p className={styles.planDesc}>Perfect for exploring the platform and basic tracking.</p>
          
          <div className={styles.featuresList}>
            <div className={styles.feature}><span className={styles.check}>✓</span> Add up to 1 website</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Crawl up to 50 pages</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Basic SEO generation</div>
            <div className={styles.feature}><span className={styles.cross}>✗</span> No Lighthouse Audits</div>
            <div className={styles.feature}><span className={styles.cross}>✗</span> No AI Keyword Research</div>
            <div className={styles.feature}><span className={styles.cross}>✗</span> No AI Blog Writer</div>
          </div>

          <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnDisabled}`} disabled>
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`${styles.planCard} ${styles.planCardPro}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <div className={styles.planName}>Pro Mastery</div>
          <div className={styles.planPrice}>$29 <span className={styles.priceInterval}>/mo</span></div>
          <p className={styles.planDesc}>Everything you need to dominate search rankings.</p>
          
          <div className={styles.featuresList}>
            <div className={styles.feature}><span className={styles.check}>✓</span> Unlimited websites</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Crawl up to 10,000 pages</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Full Lighthouse Auditing</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Gemini AI Keyword Research</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Automated AI Blog Writer</div>
            <div className={styles.feature}><span className={styles.check}>✓</span> Live Analytics Dashboard</div>
          </div>

          <button 
            className={`${styles.btn} ${styles.btnPrimary}`} 
            onClick={handleUpgrade}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? 'Processing...' : isSuccess ? 'Already Pro' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div>Loading billing...</div>}>
      <BillingContent />
    </Suspense>
  );
}
