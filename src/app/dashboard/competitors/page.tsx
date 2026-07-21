"use client";
import { Info } from "lucide-react";

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher, addCompetitor } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import styles from './competitors.module.css';

interface CompetitorKeyword {
  id: string;
  keyword: string;
  position: number;
  volume: number;
  traffic: number;
}

interface Competitor {
  id: string;
  url: string;
  keywords: CompetitorKeyword[];
}

export default function CompetitorsPage() {
  const { data: sites } = useSWR('/sites', fetcher);
  const site = sites?.[0];

  const { data: competitors, mutate, isLoading } = useSWR(site ? `/sites/${site.id}/competitors` : null, fetcher);

  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !site) return;

    setLoading(true);
    try {
      await addCompetitor(site.id, newDomain);
      toast.success('Competitor added successfully!');
      setNewDomain('');
      mutate();
    } catch (error) {
      toast.error('Failed to add competitor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (competitorId: string) => {
    if (!site) return;
    
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${site.id}/competitors/${competitorId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Competitor removed');
        mutate();
      }
    } catch (error) {
      console.error('Failed to delete competitor:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Competitor Analysis</h1>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Analyzes what your competitors are doing right. It compares your metrics with theirs to find content gaps. <strong>Example:</strong> If a competitor is ranking for "Best Running Shoes" and you are not, this tool will highlight that gap.
          </p>
        </div>
      </div>
  
        
        <form onSubmit={handleAddCompetitor} className={styles.addForm}>
          <input 
            type="text" 
            placeholder="Enter competitor domain (e.g. ahrefs.com)" 
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Analyzing...' : 'Add Competitor'}
          </button>
        </form>
      </div>

      <div className={styles.grid}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : !competitors || competitors.length === 0 ? (
          <div className={styles.noData}>
            <h3>No competitors added yet</h3>
            <p>Add a competitor domain above to analyze their top keywords and estimated traffic.</p>
          </div>
        ) : (
          competitors.map((comp: Competitor) => (
            <motion.div 
              key={comp.id} 
              className={styles.card}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.domainName}>
                  🌍 {comp.url}
                </div>
                <button onClick={() => handleDelete(comp.id)} className={styles.deleteBtn}>
                  Remove
                </button>
              </div>
              
              <div className={styles.keywordList}>
                <h4 style={{ color: '#A5B4FC', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Top Keywords</h4>
                {comp.keywords?.slice(0, 4).map((kw) => (
                  <div key={kw.id} className={styles.keywordItem}>
                    <div className={styles.keywordText}>{kw.keyword}</div>
                    <div className={styles.metrics}>
                      <span>Pos: <strong>#{kw.position}</strong></span>
                      <span>Vol: <strong>{(kw.volume / 1000).toFixed(1)}k</strong></span>
                    </div>
                  </div>
                ))}
                {(!comp.keywords || comp.keywords.length === 0) && (
                  <div style={{ color: '#64748B', fontSize: '0.85rem' }}>No keyword data found.</div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}