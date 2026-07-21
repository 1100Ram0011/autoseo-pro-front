"use client";
import { Info } from "lucide-react";

import { useState, useEffect } from 'react';
// We reuse the gmb.module.css since the aesthetics are shared
import styles from '../local-seo/gmb.module.css';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  reply: string | null;
  isReplied: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [siteId, setSiteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const sitesRes = await fetch('http://localhost:4000/api/sites');
        const sites = await sitesRes.json();
        
        if (sites && sites.length > 0) {
          const sId = sites[0].id;
          setSiteId(sId);
          
          const revRes = await fetch(`http://localhost:4000/api/sites/${sId}/gmb/reviews`);
          if (revRes.ok) {
            const data = await revRes.json();
            setReviews(data);
          }
        }
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };

    fetchReviews();
  }, []);

  const handleGenerateReply = async (reviewId: string) => {
    if (!siteId) return;
    
    setLoadingIds(prev => new Set(prev).add(reviewId));
    
    try {
      const res = await fetch(`http://localhost:4000/api/sites/${siteId}/gmb/reviews/${reviewId}/ai-reply`, {
        method: 'POST',
      });

      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      }
    } catch (error) {
      console.error('Failed to generate reply:', error);
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handlePublishReply = async (reviewId: string, replyText: string) => {
    if (!siteId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/sites/${siteId}/gmb/reviews/${reviewId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText })
      });

      if (res.ok) {
        const updatedReview = await res.json();
        setReviews(prev => prev.map(r => r.id === reviewId ? updatedReview : r));
      }
    } catch (error) {
      console.error('Failed to publish reply:', error);
    }
  };

  const handleReplyChange = (reviewId: string, value: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: value } : r));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Review Management</h1>
          <p>Monitor your Google reviews and generate AI-powered responses instantly.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Monitor and reply to customer reviews from across the web. <strong>Example:</strong> Get notified immediately when someone leaves a 1-star review so you can resolve the issue quickly.
          </p>
        </div>
      </div>
  
        </div>
      </div>

      <div className={styles.reviewList}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>
            No reviews found. Make sure you have synced your GMB profile on the Local SEO page first.
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewer}>{rev.reviewerName}</div>
                <div className={styles.stars}>
                  {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                </div>
              </div>
              
              <div className={styles.comment}>
                "{rev.comment}"
              </div>

              <div className={styles.replySection}>
                {rev.isReplied ? (
                  <div>
                    <span className={styles.badge} style={{ marginBottom: '0.5rem' }}>Replied</span>
                    <div className={styles.repliedText}>{rev.reply}</div>
                  </div>
                ) : (
                  <>
                    <div className={styles.aiReplyBox}>
                      <textarea 
                        placeholder="Draft a reply or use AI..."
                        value={rev.reply || ''}
                        onChange={(e) => handleReplyChange(rev.id, e.target.value)}
                      />
                    </div>
                    <div className={styles.actionRow}>
                      <button 
                        className={styles.btnAi}
                        onClick={() => handleGenerateReply(rev.id)}
                        disabled={loadingIds.has(rev.id)}
                      >
                        {loadingIds.has(rev.id) ? 'Generating...' : '✨ Generate AI Reply'}
                      </button>
                      <button 
                        className={styles.btnPublish}
                        onClick={() => handlePublishReply(rev.id, rev.reply || '')}
                        disabled={!rev.reply || rev.reply.trim() === ''}
                      >
                        Publish Reply
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
