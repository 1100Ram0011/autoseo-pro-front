"use client";
import { useState } from 'react';
import { Info, Code, Copy, CheckCircle, X} from 'lucide-react';

const live = [
  {city:'Mumbai',page:'/products',src:'Google',flag:'🇮🇳',time:'Just now',device:'Mobile'},
  {city:'Pune',page:'/home',src:'Direct',flag:'🇮🇳',time:'2 min ago',device:'Desktop'},
  {city:'Delhi',page:'/blog/sofa-guide',src:'Instagram',flag:'🇮🇳',time:'5 min ago',device:'Mobile'},
  {city:'Bangalore',page:'/contact',src:'Google',flag:'🇮🇳',time:'9 min ago',device:'Mobile'},
  {city:'Thane',page:'/products',src:'Facebook',flag:'🇮🇳',time:'14 min ago',device:'Desktop'},
];

export default function VisitorsPage() {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const scriptCode = `<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "xezpfgv7x8");
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>👥 Live Visitors</h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>Real people visiting your website right now</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Detailed demographics and behavior analysis of your website visitors. <strong>Example:</strong> Find out if most of your audience is visiting from the USA or UK, and what devices they use.
          </p>
        </div>
      </div>
  
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setShowCode(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #A855F7, #5A4AF4)', border: 'none', color: '#0F172A', padding: '0.5rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Code size={16} /> Get Tracking Script
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '0.4rem 0.9rem', borderRadius: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '0.82rem', color: '#10B981', fontWeight: 700 }}>5 Online Now</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[{l:'Today',v:'142'},{l:'This Week',v:'1,284'},{l:'This Month',v:'4,821'}].map((m,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.6rem' }}>Visitors {m.l}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{m.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {live.map((v,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#5A4AF4,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{v.flag}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{v.city}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Viewing <span style={{ color: '#93C5FD' }}>{v.page}</span> · {v.device}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#A5B4FC' }}>{v.src}</div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '2px' }}>{v.time}</div>
            </div>
          </div>
        ))}
      </div>

      {showCode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2rem', borderRadius: 16, width: '100%', maxWidth: 600, position: 'relative' }}>
            <button onClick={() => setShowCode(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0F172A' }}>Install Tracking Script</h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748B' }}>Copy this code snippet and paste it just before the closing <code>&lt;/head&gt;</code> tag of your website.</p>
            
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8, border: '1px solid #FFFFFF', marginBottom: '1.5rem', position: 'relative' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', color: '#A5B4FC', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {scriptCode}
              </pre>
            </div>

            <button 
              onClick={copyCode}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: copied ? '#10B981' : '#5A4AF4', border: 'none', color: '#0F172A', padding: '0.75rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              {copied ? <><CheckCircle size={18} /> Copied to Clipboard</> : <><Copy size={18} /> Copy Script</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}