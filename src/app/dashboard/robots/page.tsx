"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, FileCode, ShieldAlert, CheckCircle, Download, AlertTriangle, Bot} from 'lucide-react';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

export default function RobotsTxtPage() {
  const [content, setContent] = useState<string>(
`User-agent: *
Disallow: /wp-admin/
Disallow: /admin/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml`
  );

  const [testUrl, setTestUrl] = useState('');
  const [testUserAgent, setTestUserAgent] = useState('*');
  const [testResult, setTestResult] = useState<'allowed' | 'blocked' | null>(null);

  const handleGenerateBasic = () => {
    setContent(
`User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /tmp/
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`
    );
    toast.success('Basic robots.txt generated');
  };

  const handleGenerateWordPress = () => {
    setContent(
`User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /wp-includes/
Allow: /wp-includes/js/
Disallow: /wp-content/plugins/
Disallow: /wp-content/themes/
Disallow: /*?*
Disallow: /trackback/
Disallow: /xmlrpc.php

Sitemap: https://yoursite.com/sitemap_index.xml`
    );
    toast.success('WordPress optimized robots.txt generated');
  };

  const handleTestUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl) return;

    // A very simple mock test engine for UI demonstration
    const lines = content.split('\n');
    let isBlocked = false;
    let inTargetUserAgent = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const lower = trimmed.toLowerCase();
      
      if (lower.startsWith('user-agent:')) {
        const agent = trimmed.substring(11).trim();
        inTargetUserAgent = agent === '*' || agent.toLowerCase() === testUserAgent.toLowerCase();
        continue;
      }

      if (inTargetUserAgent) {
        if (lower.startsWith('disallow:')) {
          const path = trimmed.substring(9).trim();
          if (path && testUrl.includes(path.replace('*', ''))) {
            isBlocked = true;
          }
        }
        if (lower.startsWith('allow:')) {
          const path = trimmed.substring(6).trim();
          if (path && testUrl.includes(path.replace('*', ''))) {
            isBlocked = false; // Allow overrides previous Disallow in this simple logic
          }
        }
      }
    }

    setTestResult(isBlocked ? 'blocked' : 'allowed');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded robots.txt');
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: '#0F172A', fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileCode size={28} color="#f59e0b" /> Robots.txt Editor
            </h1>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#64748B' }}>
              Control how search engines crawl and index your site's content.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownload}
              style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0F172A', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px 0 rgba(245,158,11,0.39)', whiteSpace: 'nowrap' }}
            >
              <Download size={16} /> Download
            </button>
          </div>
        </motion.div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Manage your robots.txt file to control what Google can and cannot crawl. <strong>Example:</strong> Block Googlebot from crawling your private /admin pages or internal search result pages.
            </p>
          </div>
        </div>
      </div>


      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Editor Area */}
        <motion.div variants={itemVariants} style={{ flex: '2 1 400px', minWidth: '280px', background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #FFFFFF', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#0F172A' }}>
              <FileCode size={18} color="#f59e0b" /> Edit robots.txt
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleGenerateBasic}
                style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                Basic Setup
              </button>
              <button 
                onClick={handleGenerateWordPress}
                style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
              >
                WordPress Setup
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ 
                width: '100%', 
                minHeight: '400px', 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                color: '#0F172A', 
                padding: '1.5rem', 
                fontFamily: "'Fira Code', monospace", 
                fontSize: '0.95rem',
                lineHeight: 1.6,
                resize: 'vertical',
                outline: 'none',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)'
              }}
              spellCheck="false"
            />
          </div>
        </motion.div>

        {/* Tester Area */}
        <div style={{ flex: '1 1 300px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div variants={itemVariants} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Bot size={20} color="#3b82f6" /> Test URL Blocking
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
              Verify if a specific URL path is blocked by the rules written in the editor.
            </p>
            
            <form onSubmit={handleTestUrl} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Bot User-Agent</label>
                <select 
                  value={testUserAgent} 
                  onChange={(e) => setTestUserAgent(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                >
                  <option value="*">Any Bot (*)</option>
                  <option value="Googlebot">Googlebot</option>
                  <option value="Googlebot-Image">Googlebot-Image</option>
                  <option value="Bingbot">Bingbot</option>
                  <option value="Slurp">Yahoo Slurp</option>
                  <option value="DuckDuckBot">DuckDuckBot</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Path to test</label>
                <input 
                  type="text" 
                  placeholder="/admin/dashboard" 
                  value={testUrl} 
                  onChange={(e) => setTestUrl(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'rgba(0,0,0,0.2)', color: '#0F172A', fontSize: '0.9rem', outline: 'none' }}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', marginTop: '0.5rem' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Test Path
              </button>
            </form>

            {testResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.25rem', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px',
                  background: testResult === 'allowed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${testResult === 'allowed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                <div style={{ marginTop: '2px' }}>
                  {testResult === 'allowed' ? <CheckCircle size={20} color="#10b981" /> : <ShieldAlert size={20} color="#ef4444" />}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: testResult === 'allowed' ? '#10b981' : '#ef4444' }}>
                    {testResult === 'allowed' ? 'Access Allowed' : 'Access Blocked'}
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#0F172A', lineHeight: 1.5 }}>
                    {testResult === 'allowed' 
                      ? 'Search engines can successfully crawl and index this path based on your rules.' 
                      : 'This path is blocked by a Disallow rule. Search engines will skip it.'}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <AlertTriangle size={20} color="#10b981" /> Quick Tips
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 1.2rem', color: '#64748B', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', lineHeight: 1.5 }}>
              <li><strong style={{ color: '#0F172A' }}>User-agent: *</strong> applies rules to all web crawlers globally.</li>
              <li><strong style={{ color: '#0F172A' }}>Disallow: /folder/</strong> blocks the entire directory and its contents.</li>
              <li>Always include the absolute path to your <strong style={{ color: '#0F172A' }}>Sitemap.xml</strong> at the bottom.</li>
              <li>Use <strong style={{ color: '#0F172A' }}>Allow:</strong> to whitelist specific files inside a disallowed folder.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
