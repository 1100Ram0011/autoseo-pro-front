"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from 'react';
import { 
  Puzzle, CheckCircle, ExternalLink, ArrowRight, Settings, 
  Search, BarChart2, MessageSquare, Globe, Info
} from 'lucide-react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher } from '@/lib/api';
import styles from '../search-console/page.module.css';

export default function IntegrationsDashboard() {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeyRevealed, setIsKeyRevealed] = useState(false);
  const [loadingKey, setLoadingKey] = useState(true);

  const { data: session } = useSession();
  const email = session?.user?.email;

  const { data: status } = useSWR(email ? `/auth/google/status?email=${encodeURIComponent(email)}` : null, fetcher);
  const isGoogleConnected = status?.connected || false; 

  useEffect(() => {
    if (email) {
      fetch(`${API_BASE}/users/api-key?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.apiKey) setApiKey(data.apiKey);
        })
        .finally(() => setLoadingKey(false));
    }
  }, [email]);

  const handleConnectGsc = () => {
    if (!email) return;
    setLoadingGoogle(true);
    window.location.href = `${API_BASE}/auth/google?email=${encodeURIComponent(email)}&redirect=search-console`;
  };

  const handleConnectGa4 = () => {
    if (!email) return;
    setLoadingGoogle(true);
    window.location.href = `${API_BASE}/auth/google?email=${encodeURIComponent(email)}&redirect=analytics`;
  };

  const handleGenerateKey = async () => {
    if (!email) return;
    setLoadingKey(true);
    try {
      const res = await fetch(`${API_BASE}/users/api-key/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.apiKey) {
        setApiKey(data.apiKey);
        setIsKeyRevealed(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKey(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!email) return;
    if (!confirm("Are you sure you want to revoke this API key? This will break any existing integrations using this key.")) return;
    
    setLoadingKey(true);
    try {
      await fetch(`${API_BASE}/users/api-key/revoke`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setApiKey(null);
      setIsKeyRevealed(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKey(false);
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Puzzle size={24} color="#8b5cf6" /> Integrations
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Connect AutoSEO Pro with your favorite tools to unlock advanced automation and insights.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Connect AutoSEO Pro with third-party tools like WordPress, Slack, and Google Analytics. <strong>Example:</strong> Connect your WordPress account to enable one-click, automated article publishing.
          </p>
        </div>
      </div>
  
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* GOOGLE SEARCH CONSOLE */}
        <div className={styles.panel} style={{ position: 'relative', overflow: 'hidden' }}>
          {isGoogleConnected && (
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: '#0F172A', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '8px' }}>
              AUTHORIZED
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', background: '#0F172A', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px' }}>
              <svg viewBox="0 0 48 48" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>Google Search Console</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Sync your keyword rankings, index coverage, and click data directly from Google. Required for most SEO features.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={handleConnectGsc}
                  disabled={loadingGoogle}
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    background: isGoogleConnected ? 'rgba(16, 185, 129, 0.1)' : '#3b82f6', 
                    color: isGoogleConnected ? '#10b981' : '#FFFFFF', 
                    border: isGoogleConnected ? '1px solid rgba(16, 185, 129, 0.2)' : 'none', 
                    borderRadius: '6px', 
                    cursor: isGoogleConnected ? 'default' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loadingGoogle ? 'Connecting...' : isGoogleConnected ? <><CheckCircle size={16}/> Authorized</> : 'Connect Account'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GOOGLE ANALYTICS 4 */}
        <div className={styles.panel} style={{ position: 'relative', overflow: 'hidden' }}>
          {isGoogleConnected && (
            <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', color: '#0F172A', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '8px' }}>
              AUTHORIZED
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', background: '#F8D12F', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BarChart2 size={28} color="#D95029" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>Google Analytics 4</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Track real-time traffic, user behavior, and conversion funnels. Connects automatically when you authorize Google.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={handleConnectGa4}
                  disabled={loadingGoogle}
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    background: isGoogleConnected ? 'rgba(16, 185, 129, 0.1)' : '#FFFFFF', 
                    color: isGoogleConnected ? '#10b981' : '#0F172A', 
                    border: isGoogleConnected ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #E2E8F0', 
                    borderRadius: '6px', 
                    cursor: isGoogleConnected ? 'default' : 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {loadingGoogle ? 'Connecting...' : isGoogleConnected ? <><CheckCircle size={16}/> Authorized</> : 'Authorize via Google'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WORDPRESS */}
        <div className={styles.panel} style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', background: '#21759b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Globe size={28} color="#0F172A" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>WordPress Plugin</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Install our official WordPress plugin to enable Auto-Blogging, automatic Meta Tag injection, and Schema updates.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={() => alert("WordPress Plugin is currently in Beta and available to invited users. Please contact support.")}
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    background: '#21759b', 
                    color: '#0F172A', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  Download Plugin
                </button>
                <button style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Documentation <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SLACK / WEBHOOKS */}
        <div className={styles.panel} style={{ position: 'relative', overflow: 'hidden', opacity: 0.7 }}>
          <div style={{ position: 'absolute', top: 0, right: 0, background: '#E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderBottomLeftRadius: '8px' }}>
            COMING SOON
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', background: '#4A154B', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={24} color="#0F172A" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0F172A', fontSize: '1.1rem' }}>Slack Alerts</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Get real-time notifications in your Slack workspace when traffic drops, ranks change, or indexing errors occur.
              </p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  disabled
                  style={{ 
                    padding: '0.6rem 1.25rem', 
                    background: '#FFFFFF', 
                    color: '#64748b', 
                    border: '1px solid #FFFFFF', 
                    borderRadius: '6px', 
                    cursor: 'not-allowed',
                    fontWeight: 600,
                  }}
                >
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* API KEYS SECTION */}
      <div className={styles.panel}>
        <div className={styles.panelHeader} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Settings size={20} color="#0F172A" /> API Keys & Webhooks
        </div>
        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Use these keys to authenticate your WordPress plugin or custom API integrations. Keep them secret.
        </p>
        
        {loadingKey ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading...</div>
        ) : apiKey ? (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 600, marginBottom: '4px' }}>Project API Key</div>
              <div style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '1rem', letterSpacing: '1px' }}>
                {isKeyRevealed ? apiKey : 'sk_live_' + '•'.repeat(48)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setIsKeyRevealed(!isKeyRevealed)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid #E2E8F0', color: '#0F172A', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                {isKeyRevealed ? 'Hide' : 'Reveal'}
              </button>
              <button onClick={handleRevokeKey} style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Revoke
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748B', marginBottom: '1rem' }}>You don't have an active API key yet.</p>
            <button onClick={handleGenerateKey} style={{ padding: '0.75rem 1.5rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
              Generate API Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
