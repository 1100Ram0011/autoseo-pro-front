"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from 'react';
import { Info, ShieldAlert, ShieldCheck, Search, Activity, Globe, CheckCircle2, XCircle} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

export default function SecurityAuditDashboard() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'safe' | 'unsafe'>('idle');
  const [threats, setThreats] = useState<any[]>([]);

  const runAudit = async (overrideUrl?: string) => {
    const scanUrl = overrideUrl || url;
    if (!scanUrl) return toast.error('Please enter a URL to scan');
    
    let targetUrl = scanUrl;
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }

    setStatus('loading');
    setThreats([]);

    try {
      const res = await fetch(`${API_BASE}/seo/safe-browsing?url=${encodeURIComponent(targetUrl)}`);
      const data = await res.json();
      
      if (res.ok) {
        if (data.safe) {
          setStatus('safe');
          toast.success('Domain is safe!');
        } else {
          setStatus('unsafe');
          setThreats(data.matches || []);
          toast.error('Threats detected!');
        }
      } else {
        setStatus('idle');
        toast.error('Failed to run security audit');
      }
    } catch (error) {
      setStatus('idle');
      toast.error('Error connecting to API');
    }
  };

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch(`${API_BASE}/sites`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setUrl(data[0].url);
            runAudit(data[0].url);
          }
        }
      } catch (error) {
        console.error('Failed to auto-fetch site:', error);
      }
    };
    fetchSites();
  }, []);

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Google Safe Browsing Audit</h1>
          <p className={styles.subtitle}>Instantly scan your domain for Malware, Phishing, and Unwanted Software penalties.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Scans your website against the Google Safe Browsing database to ensure your domain hasn't been blacklisted for malware or deceptive content. <strong>Example:</strong> If your site is hacked and blacklisted, Google will show users a scary red warning screen. This tool warns you beforehand.
          </p>
        </div>
      </div>
  
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className={styles.panel}>
          <div style={{ padding: '1.5rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #FFFFFF' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0F172A', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#ef4444" /> Domain Malware & Blacklist Check
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Globe size={18} color="#64748B" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter domain (e.g., example.com)"
                  style={{ width: '100%', padding: '12px 16px 12px 40px', background: '#FFFFFF', border: '1px solid #0F172A', color: '#0F172A', borderRadius: '8px', fontSize: '1rem' }}
                />
              </div>
              <button 
                onClick={() => runAudit()}
                disabled={status === 'loading'}
                style={{ padding: '12px 24px', background: '#8b5cf6', color: '#0F172A', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, transition: 'background 0.3s' }}
              >
                {status === 'loading' ? <Activity size={18} className="animate-spin" /> : <Search size={18} />}
                {status === 'loading' ? 'Scanning...' : 'Run Security Scan'}
              </button>
            </div>

            {status === 'safe' && (
              <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '50%' }}>
                  <ShieldCheck size={32} color="#10b981" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#10b981', fontSize: '1.1rem' }}>Domain is Safe! Penalty Zero</h4>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>Google Safe Browsing found no malware, phishing, or unwanted software on this domain.</p>
                </div>
              </div>
            )}

            {status === 'unsafe' && (
              <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '50%' }}>
                    <ShieldAlert size={32} color="#ef4444" />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#ef4444', fontSize: '1.1rem' }}>Critical Security Alert!</h4>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>Google has blacklisted this domain. Immediate action is required to prevent a complete loss of SEO rankings.</p>
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '8px', border: '1px solid #0F172A' }}>
                  <h5 style={{ margin: '0 0 1rem 0', color: '#0F172A' }}>Detected Threats:</h5>
                  {threats.map((threat, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
                      <XCircle size={16} /> 
                      <span style={{ fontWeight: 600 }}>{threat.threatType.replace(/_/g, ' ')}</span>
                      {threat.platformType && <span style={{ color: '#64748B', fontSize: '0.85rem' }}>on {threat.platformType}</span>}
                    </div>
                  ))}
                  <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
                    * Clean the malware and request a review via Google Search Console.
                  </div>
                </div>
              </div>
            )}
            
            {status === 'idle' && (
              <div style={{ padding: '2rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #E2E8F0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <ShieldCheck size={48} color="#94A3B8" style={{ marginBottom: '1rem' }} />
                <h4 style={{ margin: '0 0 8px 0', color: '#64748B' }}>No Audit Run Yet</h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Enter a URL above to check its security status against Google's global malware database.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
