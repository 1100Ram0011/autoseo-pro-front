import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  style,
  className = ''
}: SkeletonProps) {
  return (
    <div 
      className={`skeleton ${className}`} 
      style={{ 
        width, 
        height, 
        borderRadius,
        ...style 
      }} 
    />
  );
}
