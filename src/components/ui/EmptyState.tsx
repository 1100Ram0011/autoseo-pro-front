"use client";

import React from 'react';
import { Ghost, Box, AlertCircle, FileSearch } from 'lucide-react';
import styles from './EmptyState.module.css';
import { motion } from 'framer-motion';

type IconType = 'ghost' | 'box' | 'alert' | 'search';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: IconType;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  title, 
  description, 
  icon = 'box', 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  
  const getIcon = () => {
    switch (icon) {
      case 'ghost': return <Ghost size={48} className={styles.icon} />;
      case 'alert': return <AlertCircle size={48} className={styles.icon} />;
      case 'search': return <FileSearch size={48} className={styles.icon} />;
      case 'box':
      default:
        return <Box size={48} className={styles.icon} />;
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={styles.iconWrapper}>
        {getIcon()}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      
      {actionLabel && onAction && (
        <button onClick={onAction} className={styles.actionBtn}>
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
