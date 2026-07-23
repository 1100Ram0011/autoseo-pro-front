"use client";


import { API_BASE } from '@/lib/apiConfig';
import { useState, useEffect } from 'react';
import { Info, Code, Copy, CheckCircle, ChevronDown, AlignLeft, Building2, MessageCircleQuestion,
  Search, ShieldAlert, BadgeCheck} from 'lucide-react';
import { toast } from 'react-hot-toast';
import styles from '../search-console/page.module.css';

type SchemaType = 'LocalBusiness' | 'Article' | 'FAQPage';

export default function SchemaGeneratorDashboard() {
  const [schemaType, setSchemaType] = useState<SchemaType>('LocalBusiness');
  const [copied, setCopied] = useState(false);

  // Knowledge Graph State
  const [kgStatus, setKgStatus] = useState<'idle' | 'loading' | 'found' | 'not_found'>('idle');
  const [kgData, setKgData] = useState<any>(null);

  // LocalBusiness State
  const [lbName, setLbName] = useState('Rajesh Furniture');
  const [lbDescription, setLbDescription] = useState('Best furniture shop in Mumbai — premium sofas, beds, and office chairs.');
  const [lbUrl, setLbUrl] = useState('https://rajeshfurniture.com');
  const [lbPhone, setLbPhone] = useState('+91-98765-43210');
  const [lbStreet, setLbStreet] = useState('LBS Marg, Kurla West');
  const [lbCity, setLbCity] = useState('Mumbai');
  const [lbRegion, setLbRegion] = useState('Maharashtra');
  const [lbPostal, setLbPostal] = useState('400070');
  const [lbCountry, setLbCountry] = useState('IN');

  // Article State
  const [artHeadline, setArtHeadline] = useState('How to Improve SEO in 2024');
  const [artDescription, setArtDescription] = useState('A comprehensive guide to modern SEO techniques.');
  const [artImage, setArtImage] = useState('https://example.com/image.jpg');
  const [artAuthor, setArtAuthor] = useState('John Doe');
  const [artPublisher, setArtPublisher] = useState('AutoSEO Pro');

  // FAQ State
  const [faqs, setFaqs] = useState<{q: string, a: string}[]>([
    { q: 'What is SEO?', a: 'Search Engine Optimization is the process of improving your website to increase visibility.' },
    { q: 'How long does SEO take?', a: 'It typically takes 3-6 months to start seeing significant results from SEO.' }
  ]);

  const generateJsonLd = () => {
    let obj: any = { "@context": "https://schema.org" };

    if (schemaType === 'LocalBusiness') {
      obj["@type"] = "LocalBusiness";
      if (lbName) obj.name = lbName;
      if (lbDescription) obj.description = lbDescription;
      if (lbUrl) obj.url = lbUrl;
      if (lbPhone) obj.telephone = lbPhone;
      obj.address = {
        "@type": "PostalAddress",
        streetAddress: lbStreet,
        addressLocality: lbCity,
        addressRegion: lbRegion,
        postalCode: lbPostal,
        addressCountry: lbCountry
      };
    } else if (schemaType === 'Article') {
      obj["@type"] = "Article";
      if (artHeadline) obj.headline = artHeadline;
      if (artDescription) obj.description = artDescription;
      if (artImage) obj.image = artImage;
      obj.author = { "@type": "Person", name: artAuthor };
      obj.publisher = { "@type": "Organization", name: artPublisher, logo: { "@type": "ImageObject", url: "https://example.com/logo.png" } };
      obj.datePublished = new Date().toISOString().split('T')[0];
    } else if (schemaType === 'FAQPage') {
      obj["@type"] = "FAQPage";
      obj.mainEntity = faqs.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a
        }
      }));
    }

    return JSON.stringify(obj, null, 2);
  };

  const jsonLdCode = generateJsonLd();

  const handleCopy = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${jsonLdCode}\n</script>`);
    setCopied(true);
    toast.success('Schema copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const addFaq = () => setFaqs([...faqs, { q: '', a: '' }]);
  const updateFaq = (index: number, field: 'q'|'a', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };
  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const verifyKnowledgeGraph = async () => {
    if (!lbName) return toast.error('Please enter a Brand/Business Name first.');
    setKgStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/seo/kg-check?query=${encodeURIComponent(lbName)}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setKgData(data.entity);
        setKgStatus('found');
        toast.success('Brand found in Google Knowledge Graph!');
      } else {
        setKgStatus('not_found');
        toast.error('Brand not found. Schema deployment required.');
      }
    } catch (error) {
      setKgStatus('idle');
      toast.error('Failed to verify entity');
    }
  };

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Code size={24} color="#8b5cf6" /> Schema Markup Generator
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Generate structured data (JSON-LD) to help Google understand your content and show Rich Results.
          </p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Generates structured data (Schema JSON-LD) that helps Google understand the context of your page (e.g., FAQ, Product, Recipe, Article). <strong>Example:</strong> Adding FAQ schema makes your questions appear directly in Google search results as rich snippets, increasing your click-through rate.
          </p>
        </div>
      </div>
  
        </div>
        <button 
          onClick={handleCopy}
          style={{ 
            padding: '0.6rem 1.25rem', 
            background: copied ? '#10B981' : '#8b5cf6', 
            color: '#0F172A', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            fontWeight: 600,
            transition: 'background 0.3s'
          }}
        >
          {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
          {copied ? 'Copied to Clipboard' : 'Copy Full Script'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setSchemaType('LocalBusiness')}
          style={{ padding: '0.75rem 1.25rem', background: schemaType === 'LocalBusiness' ? 'rgba(139, 92, 246, 0.2)' : '#FFFFFF', border: `1px solid ${schemaType === 'LocalBusiness' ? '#8b5cf6' : 'transparent'}`, color: schemaType === 'LocalBusiness' ? '#8b5cf6' : '#64748B', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <Building2 size={18} /> Local Business
        </button>
        <button 
          onClick={() => setSchemaType('Article')}
          style={{ padding: '0.75rem 1.25rem', background: schemaType === 'Article' ? 'rgba(139, 92, 246, 0.2)' : '#FFFFFF', border: `1px solid ${schemaType === 'Article' ? '#8b5cf6' : 'transparent'}`, color: schemaType === 'Article' ? '#8b5cf6' : '#64748B', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <AlignLeft size={18} /> Article
        </button>
        <button 
          onClick={() => setSchemaType('FAQPage')}
          style={{ padding: '0.75rem 1.25rem', background: schemaType === 'FAQPage' ? 'rgba(139, 92, 246, 0.2)' : '#FFFFFF', border: `1px solid ${schemaType === 'FAQPage' ? '#8b5cf6' : 'transparent'}`, color: schemaType === 'FAQPage' ? '#8b5cf6' : '#64748B', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <MessageCircleQuestion size={18} /> FAQ Page
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* INPUT FORM */}
        <div className={styles.panel} style={{ flex: 1, height: 'fit-content' }}>
          
          {schemaType === 'LocalBusiness' && (
            <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1rem', color: '#0F172A', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} color="#3b82f6" /> Brand Entity Verification
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                Check if Google already recognizes your brand in its Knowledge Graph. If not, deploying LocalBusiness schema is critical.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={verifyKnowledgeGraph} 
                  disabled={kgStatus === 'loading'}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: '#0F172A', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
                >
                  {kgStatus === 'loading' ? 'Searching Google...' : 'Verify in Knowledge Graph'}
                </button>
              </div>
              
              {kgStatus === 'found' && kgData && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <BadgeCheck size={18} /> Google Recognizes This Brand!
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.5rem' }}>{kgData.description} - {kgData.detailedDescription?.articleBody}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>💡 Deploying schema will help maintain and enrich this existing entity.</div>
                </div>
              )}

              {kgStatus === 'not_found' && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <ShieldAlert size={18} /> Entity Not Found in Knowledge Graph
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0F172A', marginBottom: '0.5rem' }}>Google does not recognize this brand as an established entity yet.</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>⚠️ You MUST generate and deploy the LocalBusiness schema below immediately so Google crawlers can map your brand.</div>
                </div>
              )}
            </div>
          )}

          <div className={styles.panelHeader}>
            Schema Details
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {schemaType === 'LocalBusiness' && (
              <>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Business Name</label>
                  <input type="text" value={lbName} onChange={e => setLbName(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                </div>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Description</label>
                  <textarea value={lbDescription} onChange={e => setLbDescription(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none', minHeight: '80px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>URL</label>
                    <input type="text" value={lbUrl} onChange={e => setLbUrl(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                  </div>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Phone</label>
                    <input type="text" value={lbPhone} onChange={e => setLbPhone(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                  </div>
                </div>
                
                <h4 style={{ margin: '0.5rem 0 0 0', color: '#0F172A', fontSize: '0.9rem' }}>Address</h4>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Street Address</label>
                  <input type="text" value={lbStreet} onChange={e => setLbStreet(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>City</label>
                    <input type="text" value={lbCity} onChange={e => setLbCity(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                  </div>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>State/Region</label>
                    <input type="text" value={lbRegion} onChange={e => setLbRegion(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                  </div>
                </div>
              </>
            )}

            {schemaType === 'Article' && (
              <>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Headline / Title</label>
                  <input type="text" value={artHeadline} onChange={e => setArtHeadline(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                </div>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Description</label>
                  <textarea value={artDescription} onChange={e => setArtDescription(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none', minHeight: '80px' }} />
                </div>
                <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Image URL</label>
                  <input type="text" value={artImage} onChange={e => setArtImage(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Author Name</label>
                    <input type="text" value={artAuthor} onChange={e => setArtAuthor(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                  </div>
                  <div className={styles.formGroup} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Publisher</label>
                    <input type="text" value={artPublisher} onChange={e => setArtPublisher(e.target.value)} style={{ padding: '0.75rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                  </div>
                </div>
              </>
            )}

            {schemaType === 'FAQPage' && (
              <>
                {faqs.map((faq, i) => (
                  <div key={i} style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 600 }}>Question {i + 1}</span>
                      {faqs.length > 1 && (
                        <button onClick={() => removeFaq(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>Remove</button>
                      )}
                    </div>
                    <input type="text" placeholder="Enter question..." value={faq.q} onChange={e => updateFaq(i, 'q', e.target.value)} style={{ padding: '0.6rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none' }} />
                    <textarea placeholder="Enter answer..." value={faq.a} onChange={e => updateFaq(i, 'a', e.target.value)} style={{ padding: '0.6rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', outline: 'none', minHeight: '60px' }} />
                  </div>
                ))}
                <button onClick={addFaq} style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed rgba(139, 92, 246, 0.5)', color: '#8b5cf6', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  + Add Another Question
                </button>
              </>
            )}
          </div>
        </div>

        {/* OUTPUT JSON-LD */}
        <div className={styles.panel} style={{ height: 'fit-content', background: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><Code size={18} color="#10b981" /> Live Preview</span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '12px' }}>Auto-updates</span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '1rem', marginBottom: '1rem' }}>
            Paste this code snippet into the <code>&lt;head&gt;</code> section of your HTML.
          </p>
          <div style={{ background: '#020617', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', overflowX: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.8rem', color: '#10b981', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
{`<script type="application/ld+json">
${jsonLdCode}
</script>`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}