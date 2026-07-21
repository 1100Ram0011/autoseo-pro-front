"use client";
import { Info } from "lucide-react";
export default function HeatmapPage() {
  const dots = [[30,25,90],[55,40,100],[50,30,70],[25,65,50],[75,35,65],[60,70,88],[40,50,78],[65,55,60],[35,80,45]];
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>🔥 Mouse Heatmap</h1>
      <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#64748B' }}>Where visitors click on /products — 248 sessions, Last 7 days</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Visualizes where users click and scroll on your web pages. <strong>Example:</strong> If users aren't scrolling down to your 'Buy Now' button, you can move it higher up on the page.
          </p>
        </div>
      </div>
  
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[{l:'Total Clicks',v:'1,842',c:'#EF4444'},{l:'Avg Scroll Depth',v:'64%',c:'#F59E0B'},{l:'Sessions Analyzed',v:'248',c:'#5A4AF4'}].map((m,i)=>(
          <div key={i} style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.6rem' }}>{m.l}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: m.c }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1rem', position: 'relative', overflow: 'hidden', height: 420 }}>
        <div style={{ position: 'absolute', inset: 0, background: '#FFFFFF', borderRadius: 12 }}>
          {dots.map(([x,y,intensity],i)=>(
            <div key={i} style={{ position: 'absolute', left: x+'%', top: y+'%', width: 80+(intensity/2)+'px', height: 80+(intensity/2)+'px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,'+(intensity/100)+') 0%,rgba(245,158,11,0.3) 40%,transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
          ))}
          <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 600 }}>Click Intensity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 80, height: 8, background: 'linear-gradient(90deg,rgba(59,130,246,0.5),rgba(245,158,11,0.8),rgba(239,68,68,1))', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748B', marginTop: '0.25rem' }}>
              <span>Low</span><span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}