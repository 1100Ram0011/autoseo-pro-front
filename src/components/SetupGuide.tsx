import React, { ReactNode } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export interface SetupStep {
  title: ReactNode;
  description: ReactNode;
}

interface SetupGuideProps {
  onBack: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  steps: SetupStep[];
  note: ReactNode;
  onConnect: () => void;
  connectButtonText: string;
}

export default function SetupGuide({
  onBack,
  icon,
  title,
  subtitle,
  steps,
  note,
  onConnect,
  connectButtonText
}: SetupGuideProps) {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1rem' }}>
      <button 
        onClick={onBack}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#64748B', 
          fontSize: '0.9rem', 
          fontWeight: 600, 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '1.5rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} /> Go Back
      </button>

      <div style={{ 
        background: '#fff', 
        border: '1px solid #E2E8F0', 
        borderRadius: '24px', 
        padding: '2.5rem',
        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            border: '1px solid #E2E8F0', 
            borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1.5rem auto',
            background: '#FAFAFA'
          }}>
            {icon}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
            {title}
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: '0' }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2rem' }}>
          {steps.map((step, index) => (
            <div key={index} style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              background: '#FFFFFF'
            }}>
              <div style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: '#3B82F6',
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {index + 1}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0F172A', fontSize: '1rem', fontWeight: 600 }}>
                  {step.title}
                </h4>
                <div style={{ color: '#64748B', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FEF3C7',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          gap: '12px',
          marginBottom: '2rem',
          alignItems: 'flex-start'
        }}>
          <Lightbulb size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', color: '#92400E', fontSize: '0.95rem', fontWeight: 600 }}>
              Important Note
            </h4>
            <div style={{ color: '#92400E', fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.9 }}>
              {note}
            </div>
          </div>
        </div>

        <button 
          onClick={onConnect}
          style={{ 
            width: '100%', 
            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)', 
            color: '#fff', 
            border: 'none', 
            padding: '14px 24px', 
            borderRadius: '12px', 
            fontSize: '1rem', 
            fontWeight: 600, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' 
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M47.532 24.5528C47.532 22.9214 47.3992 21.2811 47.1171 19.6761H24.48V28.5181H37.4433C36.9056 31.4328 35.207 33.9455 32.6515 35.6322V41.3697H40.4027C44.9287 37.2023 47.532 31.4239 47.532 24.5528Z" fill="#4285F4"/>
            <path d="M24.4799 48.0016C30.9535 48.0016 36.4116 45.8764 40.4025 41.3698L32.6513 35.6323C30.5015 37.0754 27.728 37.9404 24.4799 37.9404C18.2257 37.9404 12.9238 33.7436 11.026 28.0772H3.01343V34.2568C7.11181 42.3484 15.3409 48.0016 24.4799 48.0016Z" fill="#34A853"/>
            <path d="M11.026 28.0768C10.5304 26.5925 10.2526 25.0456 10.2526 23.4987C10.2526 21.9518 10.5304 20.4049 11.026 18.9206V12.741H3.01344C1.31575 16.0792 0.380371 19.7215 0.380371 23.4987C0.380371 27.2759 1.31575 30.9182 3.01344 34.2564L11.026 28.0768Z" fill="#FBBC05"/>
            <path d="M24.4799 9.06114C28.0163 9.06114 31.1718 10.264 33.6703 12.6186L40.5739 5.75389C36.394 1.86878 30.936 0 24.4799 0C15.3409 0 7.11181 5.65314 3.01343 13.7448L11.026 19.9244C12.9238 14.258 18.2257 9.06114 24.4799 9.06114Z" fill="#EA4335"/>
          </svg>
          {connectButtonText}
        </button>
      </div>
    </div>
  );
}
