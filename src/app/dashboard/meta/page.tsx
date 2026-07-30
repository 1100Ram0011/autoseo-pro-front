"use client";

import { useState } from 'react';
import { Info, Type, Search, Image as ImageIcon, MessageCircle, Code, Copy, CheckCircle, Smartphone, Monitor} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

export default function MetaTagsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [url, setUrl] = useState('https://example.com/page');

  const generatedCode = `
<!-- Primary Meta Tags -->
<title>${title || 'Page Title'}</title>
<meta name="title" content="${title || 'Page Title'}" />
<meta name="description" content="${description || 'Page description'}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title || 'Page Title'}" />
<meta property="og:description" content="${description || 'Page description'}" />
${imageUrl ? `<meta property="og:image" content="${imageUrl}" />` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title || 'Page Title'}" />
<meta property="twitter:description" content="${description || 'Page description'}" />
${imageUrl ? `<meta property="twitter:image" content="${imageUrl}" />` : ''}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Meta tags copied to clipboard!');
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className={styles.header} style={{ marginBottom: 0 }}>
          <div>
            <h1 className={styles.title}>Meta Tags Generator & Preview</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Create and preview perfect meta tags for Search, Facebook, and Twitter.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handleCopy}
              style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: '#0F172A', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
            >
              <Copy size={16} /> Copy Code
            </button>
          </div>
        </div>

        {/* Auto-injected Info Block */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Helps you craft the perfect SEO Title and Meta Description. This is the first thing users see on Google. <strong>Example:</strong> Keep your title under 60 characters so it doesn't get cut off in Google results, and include your main keyword.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        
        {/* Editor Area */}
        <div className={styles.panel} style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
          <div className={styles.panelHeader}>
            <Type size={18} color="#3b82f6" /> Editor
          </div>
          
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
                <span>Page Title</span>
                <span style={{ color: title.length > 60 ? '#ef4444' : '#10b981' }}>{title.length} / 60</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title..."
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '0.95rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>
                <span>Description</span>
                <span style={{ color: description.length > 160 ? '#ef4444' : '#10b981' }}>{description.length} / 160</span>
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a compelling description..."
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '0.95rem', minHeight: '120px', resize: 'vertical', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none', lineHeight: '1.5' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>
                Image URL (For Social Sharing)
              </label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '0.95rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>
                Canonical URL
              </label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontSize: '0.95rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Previews */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Google Preview */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <Search size={18} color="#4285f4" /> Google Search Preview
            </div>
            <div style={{ marginTop: '1rem', background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '1.5rem', borderRadius: '12px', color: '#202124', fontFamily: 'arial, sans-serif', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ fontSize: '12px', color: '#4d5156', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', background: '#f1f3f4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>G</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#202124', fontSize: '14px' }}>{url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : 'example.com'}</span>
                  <span style={{ color: '#4d5156', fontSize: '12px' }}>{url || 'https://example.com/page'}</span>
                </div>
              </div>
              <h3 style={{ fontSize: '20px', color: '#1a0dab', margin: '12px 0 4px 0', fontWeight: '400', cursor: 'pointer', lineHeight: '1.3' }}>
                {title || 'Page Title - Make it descriptive and engaging'}
              </h3>
              <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '1.58' }}>
                {description || 'This is how your page description will appear in search results. Ensure it is compelling and accurately describes the content.'}
              </div>
            </div>
          </div>

          {/* Social Preview */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <MessageCircle size={18} color="#1da1f2" /> Social Preview (Twitter/Facebook)
            </div>
            <div style={{ marginTop: '1rem', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF', color: '#0F172A', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ width: '100%', height: '220px', background: imageUrl ? `url(${imageUrl}) center/cover` : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E2E8F0' }}>
                {!imageUrl && <ImageIcon size={48} color="#CBD5E1" />}
              </div>
              <div style={{ padding: '12px 16px', background: '#F8FAFC' }}>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {url ? new URL(url.startsWith('http') ? url : `https://${url}`).hostname : 'example.com'}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', margin: '2px 0 6px 0', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {title || 'Engaging Page Title'}
                </div>
                <div style={{ fontSize: '14px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                  {description || 'An interesting description of your page content goes right here. Make it catchy for social media!'}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Code Output (Full Width) */}
        <div className={styles.panel} style={{ flex: '1 1 100%' }}>
          <div className={styles.panelHeader}>
            <Code size={18} color="#10b981" /> Generated Meta Tags
          </div>
          <pre style={{ 
            marginTop: '1rem', 
            background: '#F8FAFC', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            overflowX: 'auto',
            fontSize: '0.9rem',
            color: '#1E293B',
            border: '1px solid #E2E8F0',
            lineHeight: '1.6'
          }}>
            <code>{generatedCode}</code>
          </pre>
        </div>

      </div>
    </div>
  );
}
