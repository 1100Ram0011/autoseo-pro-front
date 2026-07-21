"use client";
import { Info } from "lucide-react";
import { useState } from 'react';
const initMsgs = [
  {role:'ai',text:'👋 Hi! I am your AutoSEO AI Assistant. I know everything about your website rajeshfurniture.com. Ask me anything about SEO, keywords, or how to grow on Google!'},
  {role:'user',text:'Why is my website not showing up on Google?'},
  {role:'ai',text:'Based on your site audit, the main reasons are:\n\n1️⃣ **2 pages are not indexed yet** — Your /about and /contact pages are missing from Google. I can fix this by submitting them directly.\n\n2️⃣ **Missing meta descriptions** — 3 pages have no meta description tag, so Google does not know what they are about.\n\n3️⃣ **Mobile speed is 62/100** — Google prefers fast mobile sites. Your /products page has large uncompressed images.\n\n✅ The good news: fixing these 3 things could move you from page 4 to page 1 in about 6 weeks!'},
];
export default function AIChatPage() {
  const [msgs, setMsgs] = useState(initMsgs);
  const [input, setInput] = useState('');
  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, {role:'user',text:input}, {role:'ai',text:'Great question! Based on your website data for rajeshfurniture.com, I am analyzing the best answer for you. In a fully connected version, I would pull live data from your crawl results, keyword rankings, and Google Analytics to give you a precise recommendation. For now — the short answer is: focus on fixing your meta descriptions first, as that is the highest-impact, lowest-effort fix available right now!'}]);
    setInput('');
  };
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>🤖 AI Chat Assistant</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748B' }}>Ask anything about your website, SEO, or digital marketing</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Chat with your personal AI SEO assistant trained on your website data. <strong>Example:</strong> Ask 'Why did my traffic drop yesterday?' and get an instant, data-backed analysis.
          </p>
        </div>
      </div>
  
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display: 'flex', justifyContent: m.role==='user'?'flex-end':'flex-start', gap: '0.75rem', alignItems: 'flex-start' }}>
            {m.role==='ai' && <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#5A4AF4,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>🤖</div>}
            <div style={{ maxWidth: '72%', background: m.role==='user'?'#5A4AF4':'#FFFFFF', padding: '0.9rem 1.1rem', borderRadius: m.role==='user'?'14px 4px 14px 14px':'4px 14px 14px 14px', fontSize: '0.85rem', lineHeight: 1.65, whiteSpace: 'pre-line', color: '#0F172A' }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.75rem' }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask anything... e.g. 'How do I get more visitors from Google?'" style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0.8rem 1.1rem', color: '#0F172A', fontSize: '0.88rem', outline: 'none' }}/>
        <button onClick={send} style={{ background: '#5A4AF4', border: 'none', color: '#0F172A', padding: '0 1.5rem', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>↑</button>
      </div>
    </div>
  );
}