"use client";
import { Info } from "lucide-react";

import { useState, useEffect } from 'react';
import styles from './gmb.module.css';

export default function LocalSeoPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitesAndProfile = async () => {
      try {
        const sitesRes = await fetch('http://localhost:4000/api/sites');
        const sites = await sitesRes.json();
        
        if (sites && sites.length > 0) {
          const sId = sites[0].id;
          setSiteId(sId);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    fetchSitesAndProfile();
  }, []);

  const handleSync = async () => {
    if (!siteId) return;
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:4000/api/sites/${siteId}/gmb/sync`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to sync profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Local SEO Profile</h1>
          <p>Sync your Google My Business data to track local performance.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Manage your Google Business Profile and local citations. <strong>Example:</strong> Ensure your business address and phone number are consistent across the web to rank in Google Maps.
          </p>
        </div>
      </div>
  
        </div>
        
        <button onClick={handleSync} className={styles.syncButton} disabled={loading}>
          {loading ? 'Syncing...' : '🔄 Sync GMB Data'}
        </button>
      </div>

      {!profile ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
          Click "Sync GMB Data" to pull your business profile from Google.
        </div>
      ) : (
        <>
          <div className={styles.profileHeader}>
            <div className={styles.businessName}>{profile.businessName}</div>
            <div className={styles.businessDetails}>
              <span>📍 {profile.address}</span>
              <span>📞 {profile.phone}</span>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Average Rating</div>
              <div className={styles.cardValue}>⭐ {profile.rating}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Total Reviews</div>
              <div className={styles.cardValue}>{profile.totalReviews}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Total Searches (30d)</div>
              <div className={styles.cardValue}>{profile.totalSearches}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Map Views (30d)</div>
              <div className={styles.cardValue}>{profile.mapViews}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
