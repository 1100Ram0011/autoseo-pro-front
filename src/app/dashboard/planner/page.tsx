"use client";
import { Info } from "lucide-react";
const plan = [
  {week:'Week 1',date:'Jun 28',topic:'Best Sofa Sets in Mumbai 2024',kw:'sofa sets mumbai',status:'Published',score:94,emoji:'✅'},
  {week:'Week 2',date:'Jul 5',topic:'How to Choose a Dining Table for Your Home',kw:'dining table mumbai price',status:'Scheduled',score:null,emoji:'📅'},
  {week:'Week 3',date:'Jul 12',topic:'Office Chair Buying Guide for Small Offices',kw:'office chairs india',status:'Planned',score:null,emoji:'📝'},
  {week:'Week 4',date:'Jul 19',topic:'Interior Design Tips for 2BHK Flats Mumbai',kw:'interior design mumbai',status:'Planned',score:null,emoji:'📝'},
];
const sc: Record<string, string> = {Published:'rgba(16,185,129,0.15)',Scheduled:'rgba(59,130,246,0.15)',Planned:'#FFFFFF'};
const tc: Record<string, string> = {Published:'#10B981',Scheduled:'#3B82F6',Planned:'#64748B'};
export default function PlannerPage() {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>📅 Content Planner</h1>
      <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#64748B' }}>Your AI-generated 4-week content calendar for rajeshfurniture.com</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Your SEO content calendar and strategy planner. <strong>Example:</strong> Plan out the titles and target keywords for next month's blog posts in one organized view.
          </p>
        </div>
      </div>
  
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {plan.map((p,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 80 }}>
              <div style={{ fontSize: '1.5rem' }}>{p.emoji}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC', marginTop: '0.25rem' }}>{p.week}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{p.date}</div>
            </div>
            <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.35rem' }}>{p.topic}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Target: <span style={{ color: '#93C5FD', fontWeight: 600 }}>{p.kw}</span> {p.score && <span style={{ color: '#10B981', marginLeft: '0.5rem' }}>SEO Score: {p.score}/100</span>}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
              <span style={{ background: sc[p.status], color: tc[p.status], padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>{p.status}</span>
              {p.status !== 'Published' && <button style={{ background: 'rgba(90,74,244,0.2)', border: '1px solid rgba(90,74,244,0.3)', color: '#A5B4FC', padding: '0.25rem 0.75rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Generate ✨</button>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1.5rem', background: 'rgba(90,74,244,0.08)', border: '1px solid rgba(90,74,244,0.2)', borderRadius: 14, padding: '1.25rem 1.5rem', fontSize: '0.85rem', color: '#A5B4FC' }}>
        💡 <strong>Pro Tip:</strong> Publishing at least 1 blog per week consistently is the #1 way to grow organic traffic. Your AI planner has already picked the best keywords for you!
      </div>
    </div>
  );
}