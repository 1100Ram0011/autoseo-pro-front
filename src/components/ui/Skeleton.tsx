import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({ className, style, variant = 'rectangular', width, height, borderRadius }: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className || ''}`}
      style={customStyle}
    />
  );
}

export default Skeleton;
