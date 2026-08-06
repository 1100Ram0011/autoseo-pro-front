import React from 'react';
import Skeleton from './Skeleton';

export default function DashboardSkeleton() {
  return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <Skeleton variant="text" style={{ width: '40%', height: '14px', marginBottom: '1rem' }} />
            <Skeleton variant="rectangular" style={{ width: '60%', height: '36px', marginBottom: '0.5rem' }} />
            <Skeleton variant="text" style={{ width: '30%', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', minHeight: '350px' }}>
          <Skeleton variant="text" style={{ width: '25%', height: '20px', marginBottom: '2rem' }} />
          <Skeleton variant="rectangular" style={{ width: '100%', height: '260px' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', minHeight: '350px' }}>
          <Skeleton variant="text" style={{ width: '25%', height: '20px', marginBottom: '2rem' }} />
          <Skeleton variant="rectangular" style={{ width: '100%', height: '260px' }} />
        </div>
      </div>
      
      {/* Full width table area */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', minHeight: '250px' }}>
        <Skeleton variant="text" style={{ width: '20%', height: '24px', marginBottom: '2rem' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rectangular" style={{ width: '100%', height: '40px', marginBottom: '0.5rem' }} />
        ))}
      </div>
    </div>
  );
}
