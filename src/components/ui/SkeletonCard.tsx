import React from 'react';
import { Skeleton } from './Skeleton';

export function SkeletonCard() {
  return (
    <div className="glass-card" style={{ borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Skeleton width="14px" height="14px" borderRadius="50%" />
        <Skeleton width="120px" height="12px" />
      </div>
      <Skeleton width="80px" height="32px" style={{ marginBottom: '1rem' }} />
      <Skeleton width="140px" height="10px" style={{ marginBottom: '1rem' }} />
      <Skeleton width="100%" height="40px" />
    </div>
  );
}
