"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Compass, Type, BarChart2, Briefcase, FileText, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './CommandPalette.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <motion.div 
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command className={styles.command}>
              <div className={styles.header}>
                <Search size={18} className={styles.searchIcon} />
                <Command.Input 
                  autoFocus 
                  placeholder="Type a command or search..." 
                  className={styles.input} 
                />
                <button onClick={() => setOpen(false)} className={styles.closeBtn}>
                    <X size={16} />
                </button>
              </div>

              <Command.List className={styles.list}>
                <Command.Empty className={styles.empty}>No results found.</Command.Empty>

                <Command.Group heading="Content & SEO" className={styles.group}>
                  <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/agentic-seo'))} className={styles.item}>
                    <Compass size={16} />
                    <span>Agentic SEO Identity</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/ai-blog'))} className={styles.item}>
                    <FileText size={16} />
                    <span>AI Blog Writer</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/meta'))} className={styles.item}>
                    <Type size={16} />
                    <span>Generate Meta Tags</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Lead Generation" className={styles.group}>
                  <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/map-leads'))} className={styles.item}>
                    <Briefcase size={16} />
                    <span>Map Leads & LinkedIn</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push('/dashboard/gmb-reviews'))} className={styles.item}>
                    <BarChart2 size={16} />
                    <span>GMB Review Management</span>
                  </Command.Item>
                </Command.Group>

              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
