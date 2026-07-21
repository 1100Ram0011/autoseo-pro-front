"use client";

import { useState } from "react";
import { X, Search, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

interface KeywordDiscoveryModalProps {
  siteId: string;
  isOpen: boolean;
  onClose: () => void;
  onKeywordSaved: () => void; // Callback to refresh the parent table
}

export default function KeywordDiscoveryModal({
  siteId,
  isOpen,
  onClose,
  onKeywordSaved,
}: KeywordDiscoveryModalProps) {
  const [seed, setSeed] = useState("");
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingKw, setSavingKw] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;

    setLoading(true);
    setIdeas([]);
    
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${siteId}/keyword-ideas?seed=${encodeURIComponent(seed)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setIdeas(data.ideas || []);
      if (data.ideas?.length === 0) {
        toast.error("No ideas found for this keyword.");
      }
    } catch (err) {
      toast.error("Failed to fetch keyword ideas");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKeyword = async (idea: any) => {
    setSavingKw(idea.keyword);
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${siteId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: idea.keyword,
          volume: idea.searchVolume,
          position: null // New keyword, no position yet
        }),
      });
      
      if (!res.ok) throw new Error("Save failed");
      
      toast.success(`Tracked: ${idea.keyword}`);
      onKeywordSaved();
    } catch (err) {
      toast.error("Failed to save keyword");
    } finally {
      setSavingKw(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px',
        width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', color: '#3b82f6' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>Discover New Keywords</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>Powered by Google Ads Keyword Planner</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '24px', background: 'rgba(15, 23, 42, 0.3)' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Enter a seed keyword (e.g. 'seo agency')"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1rem' }}
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !seed.trim()}
              style={{ padding: '0 24px', borderRadius: '8px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: loading || !seed.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading || !seed.trim() ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={18} className="spinner" /> : <Search size={18} />}
              Generate Ideas
            </button>
          </form>
        </div>

        {/* Results */}
        <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
          {loading && ideas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
               <Loader2 size={32} className="spinner" style={{ margin: '0 auto 16px auto', color: '#3b82f6' }} />
               <p>Mining Google Ads database for opportunities...</p>
            </div>
          ) : ideas.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#0f172a', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Keyword Idea</th>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Volume</th>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #334155' }}>Competition</th>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #334155' }}>CPC (Low - High)</th>
                  <th style={{ padding: '12px 24px', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', borderBottom: '1px solid #334155', textAlign: 'right' }}>Track</th>
                </tr>
              </thead>
              <tbody>
                {ideas.map((idea, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '16px 24px', color: '#e2e8f0', fontWeight: 500 }}>{idea.keyword}</td>
                    <td style={{ padding: '16px 24px', color: '#cbd5e1' }}>{idea.searchVolume.toLocaleString()}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: idea.competition === 'LOW' ? 'rgba(16, 185, 129, 0.1)' : idea.competition === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: idea.competition === 'LOW' ? '#10b981' : idea.competition === 'MEDIUM' ? '#f59e0b' : '#ef4444'
                      }}>
                        {idea.competition}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                      ${idea.cpcLow} - ${idea.cpcHigh}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleSaveKeyword(idea)}
                        disabled={savingKw === idea.keyword}
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', 
                          padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        {savingKw === idea.keyword ? <Loader2 size={14} className="spinner" /> : <Plus size={14} />}
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
              <p>Type a seed keyword above to generate data-driven ideas.</p>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}} />
    </div>
  );
}
