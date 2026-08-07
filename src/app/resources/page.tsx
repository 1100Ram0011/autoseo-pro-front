"use client";

import React, { useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import anime from 'animejs';
import { BookOpen, Video, FileText, HelpCircle, Search as SearchIcon, ArrowRight } from 'lucide-react';
import styles from '../page.module.css';

export default function ResourcesPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: '.animate-item',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: anime.stagger(100),
      easing: 'easeOutSine'
    });
  }, []);

  const resources = [
    { category: 'Documentation', title: 'API Integration Guide', icon: <BookOpen size={20} className="text-blue-400" />, desc: 'Learn how to connect our AI engine directly to your CMS.', link: 'Read Docs' },
    { category: 'Video', title: 'Zero to 10k Traffic', icon: <Video size={20} className="text-red-400" />, desc: 'Step-by-step masterclass on setting up your first autonomous campaign.', link: 'Watch Videos' },
    { category: 'Case Study', title: 'How AcmeCorp scaled 500%', icon: <FileText size={20} className="text-emerald-400" />, desc: 'See the exact workflows and prompts used by top-tier agencies.', link: 'View Stories' },
    { category: 'Support', title: 'Troubleshooting Indexing', icon: <HelpCircle size={20} className="text-violet-400" />, desc: 'Fix common Google Search Console connection errors.', link: 'Get Help' },
    { category: 'Documentation', title: 'Prompt Engineering for SEO', icon: <BookOpen size={20} className="text-blue-400" />, desc: 'Advanced techniques for guiding the AI writer.', link: 'Read Docs' },
    { category: 'Video', title: 'Platform Walkthrough', icon: <Video size={20} className="text-red-400" />, desc: 'A complete tour of the new dashboard and analytics.', link: 'Watch Videos' },
  ];

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.backgroundGlow}></div>
      <div className={styles.gridOverlay}></div>
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-16 animate-item max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6">
            Resources Hub
          </h1>
          <p className="text-lg text-slate-400 mb-10">
            Everything you need to master autonomous SEO. Search our docs, watch tutorials, or read success stories.
          </p>

          {/* Glowing Search Bar */}
          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-2xl group-focus-within:bg-violet-500/30 transition-all duration-300"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700 focus-within:border-violet-500 rounded-2xl p-2 shadow-2xl transition-all">
              <div className="pl-4 pr-2 text-slate-400">
                <SearchIcon size={20} />
              </div>
              <input 
                type="text" 
                placeholder="Search for guides, tutorials, or APIs..." 
                className="w-full bg-transparent border-none text-white focus:outline-none py-3 text-lg"
              />
              <button className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, i) => (
            <div key={i} className="animate-item group relative rounded-2xl p-[1px] bg-slate-800 hover:bg-gradient-to-br hover:from-violet-500/50 hover:to-fuchsia-500/50 transition-all duration-300">
              <div className="relative h-full bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 flex flex-col cursor-pointer overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                    {res.icon}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {res.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">
                  {res.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 flex-1">
                  {res.desc}
                </p>
                
                <div className="flex items-center text-sm font-bold text-violet-400 group-hover:text-violet-300">
                  {res.link} <ArrowRight size={16} className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
