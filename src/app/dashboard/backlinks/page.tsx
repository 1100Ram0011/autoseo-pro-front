"use client";

import { API_BASE } from '@/lib/apiConfig';
import { Info } from "lucide-react";

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import styles from './backlinks.module.css';

interface Backlink {
  id: string;
  domain: string;
  url: string;
  targetUrl: string;
  toxicityScore: number;
  isDisavowed: boolean;
}

export default function BacklinksPage() {
  const { data: sites } = useSWR('/sites', fetcher);
  const site = sites?.[0];

  const { data: fetchedLinks, mutate } = useSWR(site ? `/sites/${site.id}/backlinks` : null, fetcher);
  
  const [loading, setLoading] = useState(false);

  // Use fetched links if available, else empty array
  const links = fetchedLinks || [];

  const handleScan = async () => {
    if (!site) return;
    setLoading(true);

    try {
      await api.post(`/sites/${site.id}/backlinks/scan`);
      toast.success('Scan complete');
      mutate();
    } catch (error) {
      console.error('Failed to scan backlinks:', error);
      toast.error('Failed to scan');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisavow = async (linkId: string, currentStatus: boolean) => {
    if (!site) return;

    // Optimistic UI update
    mutate(
      links.map((l: Backlink) => l.id === linkId ? { ...l, isDisavowed: !currentStatus } : l),
      false
    );

    try {
      await api.patch(`/sites/${site.id}/backlinks/${linkId}/disavow`, {
        isDisavowed: !currentStatus
      });
      mutate(); // Revalidate
    } catch (error) {
      console.error('Failed to update disavow status:', error);
      toast.error('Failed to update status');
      mutate(); // Revert on failure
    }
  };

  const handleExportDisavow = () => {
    if (!site) return;
    window.open(`${API_BASE}/sites/${site.id}/backlinks/export-disavow`, '_blank');
  };

  const toxicCount = links.filter((l: Backlink) => l.toxicityScore >= 60).length;
  const disavowedCount = links.filter((l: Backlink) => l.isDisavowed).length;

  const getScoreClass = (score: number) => {
    if (score >= 60) return styles.scoreToxic;
    if (score >= 30) return styles.scoreMedium;
    return styles.scoreGood;
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div>
            <h1>Backlink Monitoring</h1>
            <p>Track your inbound links and automatically generate a Disavow file for Google Search Console.</p>
          </div>
          
          <div className={styles.actionGroup}>
            <button onClick={handleScan} className={styles.btnScan} disabled={loading}>
              {loading ? 'Scanning...' : '🔍 Run Backlink Scan'}
            </button>
            <button onClick={handleExportDisavow} className={styles.btnExport} disabled={disavowedCount === 0}>
              📄 Export Disavow File
            </button>
          </div>
        </div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Monitors who is linking to your website (backlinks) and tracks your Domain Authority. <strong>Example:</strong> If a high-authority news site links to you, your domain authority and rankings will increase.
            </p>
          </div>
        </div>
      </div>
        


      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Total Backlinks</div>
          <div className={styles.statValue}>{links.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Toxic Links Found</div>
          <div className={styles.statValue} style={{ color: toxicCount > 0 ? '#EF4444' : '#FFFFFF' }}>
            {toxicCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statTitle}>Marked for Disavowal</div>
          <div className={styles.statValue}>{disavowedCount}</div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {links.length === 0 ? (
          <div className={styles.noData}>
            No backlink data. Click "Run Backlink Scan" to pull data.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Referring Domain</th>
                <th>Source URL</th>
                <th>Target URL</th>
                <th>Toxicity Score</th>
                <th>Disavow</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link: Backlink) => (
                <tr key={link.id}>
                  <td className={styles.domainCol}>{link.domain}</td>
                  <td className={styles.urlCol} title={link.url}>{link.url}</td>
                  <td className={styles.urlCol} title={link.targetUrl}>{link.targetUrl}</td>
                  <td>
                    <span className={`${styles.scoreBadge} ${getScoreClass(link.toxicityScore)}`}>
                      {link.toxicityScore}/100
                    </span>
                  </td>
                  <td>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={link.isDisavowed}
                        onChange={() => handleToggleDisavow(link.id, link.isDisavowed)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
