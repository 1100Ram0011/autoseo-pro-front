"use client";
import { Info } from "lucide-react";
import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, addKeyword } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { Skeleton } from '@/components/ui/Skeleton';
import ExportReportButton from '@/components/ExportReportButton';
import { exportKeywordsCSV, exportKeywordsPDF } from '@/lib/reportExporter';

const ic = { Commercial: 'var(--primary)', Transactional: '#10B981', Informational: '#A855F7' };

export default function KeywordsPage() {
  const { data: sites } = useSWR('/sites', fetcher);
  const site = sites?.[0];

  const { data: keywords, mutate, isLoading } = useSWR(site ? `/sites/${site.id}/keywords` : null, fetcher);

  const [newKw, setNewKw] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newKw || !site) return;
    setIsAdding(true);
    try {
      await addKeyword(site.id, newKw);
      toast.success('Keyword added successfully!');
      setNewKw('');
      mutate(); // refetch
    } catch (e) {
      toast.error('Failed to add keyword');
    } finally {
      setIsAdding(false);
    }
  };

  const displayKeywords = Array.isArray(keywords) ? keywords : [];

  const inTop3 = displayKeywords.filter(k => (k.position || k.rank) <= 3).length;
  const inTop10 = displayKeywords.filter(k => (k.position || k.rank) > 3 && (k.position || k.rank) <= 10).length;
  const top11to30 = displayKeywords.filter(k => (k.position || k.rank) > 10 && (k.position || k.rank) <= 30).length;
  const below30 = displayKeywords.filter(k => !(k.position || k.rank) || (k.position || k.rank) > 30).length;

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', color: 'var(--foreground)', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--foreground)' }}>🔑 Keyword Tracker</h1>
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>Tracking {displayKeywords?.length || 0} keywords for {site?.url || 'loading...'}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input 
              value={newKw}
              onChange={(e) => setNewKw(e.target.value)}
              placeholder="Add new keyword..." 
              style={{ padding: '0.55rem 1rem', borderRadius: 8, border: '1px solid var(--card-border)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--foreground)', outline: 'none', fontSize: '0.82rem', flex: '1 1 150px' }} 
            />
            <button onClick={handleAdd} disabled={isAdding} style={{ background: 'var(--primary)', border: 'none', color: '#FFFFFF', padding: '0.55rem 1rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {isAdding ? 'Adding...' : '+ Add Keyword'}
            </button>
            <ExportReportButton
              csvExport={() => exportKeywordsCSV(displayKeywords, site?.url || 'website')}
              pdfExport={async () => exportKeywordsPDF(displayKeywords, site?.url || 'website')}
              disabled={displayKeywords.length === 0}
            />
          </div>
        </div>
        
        {/* Auto-injected Info Block */}
        <div className="glass-card" style={{ padding: '1rem', borderRadius: '8px', display: 'flex', gap: '12px' }}>
          <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '0.95rem' }}>How does this work?</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5' }}>
               Your main keyword rank tracker and SERP monitoring tool. <strong>Example:</strong> Track your daily position on Google for your most profitable keywords and see if you move to Page 1.
            </p>
          </div>
        </div>
      </div>
      <div className="grid-responsive grid-cols-4" style={{ marginBottom: '1.75rem' }}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {[{ l: 'In Top 3', v: inTop3, c: '#10B981' }, { l: 'In Top 10', v: inTop10, c: '#3B82F6' }, { l: 'Top 11–30', v: top11to30, c: '#F59E0B' }, { l: 'Below 30', v: below30, c: 'var(--text-muted)' }].map((m, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(90, 74, 244, 0.15)" }}
                className="glass-card"
                style={{ borderRadius: 14, padding: '1.25rem 1.5rem', cursor: 'default' }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.6rem' }}>{m.l}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: m.c }}>{m.v}</div>
              </motion.div>
            ))}
          </>
        )}
      </div>
      <div className="glass-card" style={{ borderRadius: 16, overflowX: 'auto' }}>
        <div style={{ minWidth: '800px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)' }}>
          {['Keyword', 'Monthly Volume', 'Difficulty', 'Intent', 'Rank'].map(h => (
            <div key={h} style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
          ))}
        </div>
        {displayKeywords?.map((k: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr', padding: '0.9rem 1.25rem', borderBottom: i < displayKeywords.length - 1 ? '1px solid var(--card-border)' : 'none', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--foreground)' }}>{k.kw || k.keyword}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{k.volume?.toLocaleString() || k.vol?.toLocaleString() || '-'}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ height: 5, width: 60, background: 'var(--card-border)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: (k.difficulty || k.diff || 0) + '%', background: (k.difficulty || k.diff || 0) > 60 ? '#EF4444' : (k.difficulty || k.diff || 0) > 40 ? '#F59E0B' : '#10B981', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{k.difficulty || k.diff || 0}</span>
              </div>
            </div>
            <div><span style={{ background: (ic[(k.intent || 'Informational') as keyof typeof ic] || 'var(--text-muted)') + '22', color: ic[(k.intent || 'Informational') as keyof typeof ic] || 'var(--text-muted)', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>{k.intent || 'Informational'}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: (k.position || k.rank || 0) <= 10 && (k.position || k.rank || 0) > 0 ? '#10B981' : (k.position || k.rank || 0) <= 20 && (k.position || k.rank || 0) > 0 ? '#F59E0B' : (k.position || k.rank || 0) > 0 ? '#EF4444' : 'var(--text-muted)' }}>{(k.position || k.rank) ? `#${k.position || k.rank}` : '-'}</span>
              {(k.position || k.rank) && <span style={{ fontSize: '1rem', color: (k.trend || 'up') === 'up' ? '#10B981' : '#EF4444' }}>{(k.trend || 'up') === 'up' ? '↑' : '↓'}</span>}
            </div>
          </div>
          ))}
          {!isLoading && displayKeywords.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No keywords tracked yet. Add one above or connect Google Search Console.
            </div>
          )}
          {isLoading && (
            <div style={{ padding: '1rem' }}>
              <Skeleton width="100%" height="40px" style={{ marginBottom: '10px' }} />
              <Skeleton width="100%" height="40px" style={{ marginBottom: '10px' }} />
              <Skeleton width="100%" height="40px" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}