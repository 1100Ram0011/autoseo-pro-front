import toast from 'react-hot-toast';
import React from 'react';

interface ToastActionProps {
  message: string;
  buttonText: string;
  onClick: () => void;
}

export const showActionToast = ({ message, buttonText, onClick }: ToastActionProps) => {
  toast((t) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '14px', fontWeight: 500 }}>{message}</span>
      <button
        onClick={() => {
          toast.dismiss(t.id);
          onClick();
        }}
        style={{
          background: 'var(--primary, #3b82f6)',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        {buttonText}
      </button>
    </div>
  ), {
    duration: 6000, // Show for a bit longer so user can click
    style: {
      background: 'var(--bg-primary, #1e293b)',
      color: '#fff',
      border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
      padding: '12px',
    }
  });
};
