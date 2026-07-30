"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Sparkles, Plus, Clock, CheckCircle2, MoreVertical, Brain, LayoutGrid, List } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MOCK_CALENDAR = [
  { id: 1, date: '2026-07-18', title: '10 Best SEO Strategies for 2026', type: 'Blog Post', status: 'Drafted', intent: 'Informational', aiScore: 92 },
  { id: 2, date: '2026-07-20', title: 'How to fix Core Web Vitals', type: 'Tutorial', status: 'Scheduled', intent: 'Navigational', aiScore: 88 },
  { id: 3, date: '2026-07-23', title: 'AutoSEO Pro vs Competitors', type: 'Comparison', status: 'Idea', intent: 'Commercial', aiScore: 95 },
  { id: 4, date: '2026-07-26', title: 'Why your traffic dropped in July', type: 'Case Study', status: 'Idea', intent: 'Informational', aiScore: 81 },
];

export default function ContentCalendarPage() {
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [isGenerating, setIsGenerating] = useState(false);
  const [items, setItems] = useState(MOCK_CALENDAR);

  const generateContentPlan = () => {
    setIsGenerating(true);
    toast.loading('AI is analyzing keyword gaps...', { id: 'ai-gen' });
    
    setTimeout(() => {
      setItems([
        ...items,
        { id: 5, date: '2026-07-29', title: 'Understanding Semantic SEO', type: 'Blog Post', status: 'Idea', intent: 'Informational', aiScore: 98 },
        { id: 6, date: '2026-08-02', title: 'The Ultimate Guide to Local SEO', type: 'Pillar Page', status: 'Idea', intent: 'Commercial', aiScore: 94 },
      ]);
      toast.success('AI Content Plan Generated!', { id: 'ai-gen' });
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif", color: 'var(--foreground)', minHeight: '100vh', background: 'transparent' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={28} color="#3B82F6" />
            AI Content Calendar
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B' }}>
            Auto-generate and schedule content based on competitor gaps and keyword opportunities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#E2E8F0', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setView('list')}
              style={{ background: view === 'list' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: 'var(--foreground)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, boxShadow: view === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              <List size={16} /> List
            </button>
            <button 
              onClick={() => setView('calendar')}
              style={{ background: view === 'calendar' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: 'var(--foreground)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, boxShadow: view === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
            >
              <LayoutGrid size={16} /> Grid
            </button>
          </div>
          <button 
            onClick={generateContentPlan}
            disabled={isGenerating}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--primary)', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: isGenerating ? 'wait' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? <Clock size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isGenerating ? 'Analyzing...' : 'Generate 30-Day Plan'}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ borderRadius: '12px', overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--card-border)' }}>
            <tr>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>DATE</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>TOPIC / TITLE</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>TYPE</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>AI SCORE</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>STATUS</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item.id} 
                style={{ borderBottom: '1px solid var(--card-border)' }}
              >
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{item.date}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(90, 74, 244, 0.15)', border: '1px solid rgba(90, 74, 244, 0.3)', padding: '2px 8px', borderRadius: '12px', display: 'inline-block' }}>
                    {item.intent}
                  </div>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.type}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Brain size={16} /> {item.aiScore}/100
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    background: item.status === 'Drafted' ? 'rgba(245, 158, 11, 0.15)' : item.status === 'Scheduled' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                    color: item.status === 'Drafted' ? '#F59E0B' : item.status === 'Scheduled' ? '#10B981' : 'var(--text-muted)',
                    border: `1px solid ${item.status === 'Drafted' ? 'rgba(245, 158, 11, 0.3)' : item.status === 'Scheduled' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><MoreVertical size={18} /></button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
