"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info, Tag, Rocket, Crown, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function BillingContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isActivePro, setIsActivePro] = useState(false);

  useEffect(() => {
    // Check current subscription status from backend
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/payment/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.isActive) {
          setIsActivePro(true);
        }
      } catch (err) {
        console.error("Failed to check payment status", err);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();

    if (searchParams?.get('success')) {
      setIsSuccess(true);
      setIsActivePro(true);
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // 1. Initiate payment from backend
      const res = await fetch(`${API_BASE}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure we pass token if required by authMiddleware
        },
        body: JSON.stringify({ planId: 'ProMonthly' })
      });
      const data = await res.json();
      
      if (data.success && data.payment_session_id) {
        // 2. Load Cashfree SDK
        const { load } = await import('@cashfreepayments/cashfree-js');
        const cashfree = await load({ mode: 'production' }); // Use 'sandbox' for testing if needed

        let checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_modal' as const
        };

        // 3. Open Cashfree checkout
        cashfree.checkout(checkoutOptions).then((result: any) => {
          if (result.error) {
            alert('❌ Payment failed or cancelled.');
            setIsLoading(false);
          }
          if (result.paymentDetails) {
            verifyPayment(data.order_id, 'ProMonthly');
          }
        });
      } else {
        alert('Failed to initiate checkout: ' + (data.error || 'Unknown error'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to billing server');
      setIsLoading(false);
    }
  };

  const verifyPayment = async (orderId: string, planId: string) => {
    try {
      const res = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId, planId })
      });
      const data = await res.json();
      
      if (data.success && data.status === 'SUCCESS') {
        setIsSuccess(true);
      } else {
        alert('⏳ Payment not confirmed yet. Try again in a moment.');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Verification failed. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pricingBadge}>
        <Tag size={16} /> PRICING
      </div>
      
      <h1 className={styles.title}>
        Simple, Transparent <span className={styles.titleBlue}>Pricing</span>
      </h1>
      
      <p className={styles.subtitle}>
        Unlock the full power of AI for your SEO strategy.
      </p>

      {/* Info Block */}
      <div className={styles.infoBox}>
        <Info size={24} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <h4>How does this work?</h4>
          <p>
             Manage your subscription plan, billing history, and payment methods.<br />
             <span className={styles.infoExample}>Example:</span> Upgrade to the Pro plan to unlock more AI limits and track more websites.
          </p>
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
          <div className={styles.iconWrapper}>
            <Rocket size={24} strokeWidth={2.5} />
          </div>
          <div className={styles.planName}>Free Starter</div>
          <div className={styles.planPrice}>
            $0 <span className={styles.priceInterval}>/forever</span>
          </div>
          <p className={styles.planDesc}>
            Perfect for exploring the platform and basic tracking.
          </p>
          
          <div className={styles.divider}></div>
          
          <div className={styles.featuresList}>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Add up to 1 website
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Crawl up to 50 pages
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Basic SEO generation
            </div>
            <div className={`${styles.feature} ${styles.featureDisabled}`}>
              <XCircle className={styles.cross} size={20} /> No Lighthouse Audits
            </div>
            <div className={`${styles.feature} ${styles.featureDisabled}`}>
              <XCircle className={styles.cross} size={20} /> No AI Keyword Research
            </div>
            <div className={`${styles.feature} ${styles.featureDisabled}`}>
              <XCircle className={styles.cross} size={20} /> No AI Blog Writer
            </div>
          </div>

          <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnDisabled}`} disabled>
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`${styles.planCard} ${styles.planCardPro}`}>
          <div className={styles.popularBadge}>Most Popular</div>
          <div className={styles.iconWrapper}>
            <Crown size={24} strokeWidth={2.5} />
          </div>
          <div className={styles.planName}>Pro Mastery</div>
          <div className={styles.planPrice}>
            $29 <span className={styles.priceInterval}>/month</span>
          </div>
          <p className={styles.planDesc}>
            Everything you need to dominate search rankings.
          </p>
          
          <div className={styles.divider}></div>

          <div className={styles.featuresList}>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Unlimited websites
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Crawl up to 10,000 pages
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Full Lighthouse Auditing
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Gemini AI Keyword Research
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Automated AI Blog Writer
            </div>
            <div className={styles.feature}>
              <CheckCircle2 className={styles.check} size={20} /> Live Analytics Dashboard
            </div>
          </div>

          <button 
            className={`${styles.btn} ${isActivePro ? styles.btnOutline : styles.btnPrimary} ${isActivePro ? styles.btnDisabled : ''}`} 
            onClick={handleUpgrade}
            disabled={isLoading || isActivePro}
          >
            {isLoading ? 'Processing...' : isActivePro ? 'Already Pro' : 'Upgrade to Pro'}
          </button>
        </div>
      </div>
      
      <div className={styles.guarantee}>
        <ShieldCheck className={styles.guaranteeIcon} size={20} /> 30-day money-back guarantee
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
