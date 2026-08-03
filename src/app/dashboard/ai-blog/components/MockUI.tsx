import React from 'react';

export function Dialog({ open, onOpenChange, children }: { open?: boolean, onOpenChange?: (open: boolean) => void, children: React.ReactNode }) {
  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0"
      onClick={() => onOpenChange && onOpenChange(false)}
    >
      <div 
        className="relative w-full max-w-4xl" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-2xl relative flex flex-col ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={`text-xl font-bold text-gray-900 dark:text-gray-100 m-0 ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}
