"use client";

import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { Info, FileCode, ShieldAlert, CheckCircle, Download, AlertTriangle, Bot, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TextField, Button, MenuItem, Paper, Typography, Box } from '@mui/material';

export default function RobotsTxtPage() {
  const [content, setContent] = useState<string>(
`User-agent: *
Disallow: /wp-admin/
Disallow: /admin/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml`
  );

  const [testUrl, setTestUrl] = useState('');
  const [testUserAgent, setTestUserAgent] = useState('*');
  const [testResult, setTestResult] = useState<'allowed' | 'blocked' | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    anime({
      targets: '.animate-in',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 800,
      delay: anime.stagger(100),
      easing: 'easeOutQuint'
    });
  }, []);

  const handleGenerateBasic = () => {
    setContent(
`User-agent: *
Disallow: /admin/
Disallow: /private/
Disallow: /tmp/
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`
    );
    toast.success('Basic robots.txt generated');
  };

  const handleGenerateWordPress = () => {
    setContent(
`User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php
Disallow: /wp-includes/
Allow: /wp-includes/js/
Disallow: /wp-content/plugins/
Disallow: /wp-content/themes/
Disallow: /*?*
Disallow: /trackback/
Disallow: /xmlrpc.php

Sitemap: https://yoursite.com/sitemap_index.xml`
    );
    toast.success('WordPress optimized robots.txt generated');
  };

  const handleTestUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl) return;

    const lines = content.split('\n');
    let isBlocked = false;
    let inTargetUserAgent = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const lower = trimmed.toLowerCase();
      
      if (lower.startsWith('user-agent:')) {
        const agent = trimmed.substring(11).trim();
        inTargetUserAgent = agent === '*' || agent.toLowerCase() === testUserAgent.toLowerCase();
        continue;
      }

      if (inTargetUserAgent) {
        if (lower.startsWith('disallow:')) {
          const path = trimmed.substring(9).trim();
          if (path && testUrl.includes(path.replace('*', ''))) isBlocked = true;
        }
        if (lower.startsWith('allow:')) {
          const path = trimmed.substring(6).trim();
          if (path && testUrl.includes(path.replace('*', ''))) isBlocked = false;
        }
      }
    }
    setTestResult(isBlocked ? 'blocked' : 'allowed');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded robots.txt');
  };

  return (
    <div ref={containerRef} className="p-4 md:p-8 max-w-7xl mx-auto text-slate-800 dark:text-slate-200">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <FileCode size={28} className="text-amber-500" />
            </div>
            Robots.txt Editor
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
            Control how search engines crawl and index your site's content.
          </p>
        </div>
        <Button 
          onClick={handleDownload} 
          variant="contained" 
          startIcon={<Download size={18} />}
          sx={{ 
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            boxShadow: '0 4px 14px 0 rgba(245,158,11,0.3)',
            '&:hover': { background: 'linear-gradient(135deg, #d97706, #b45309)' }
          }}
        >
          Download
        </Button>
      </div>

      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-2xl bg-sky-50 border border-sky-100 dark:bg-sky-950/30 dark:border-sky-900 flex gap-4 items-start animate-in">
        <Info size={24} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sky-900 dark:text-sky-300 mb-1">How does this work?</h4>
          <p className="text-sm text-sky-800 dark:text-sky-400/80 leading-relaxed">
             Manage your robots.txt file to control what Google can and cannot crawl. 
             <strong> Example:</strong> Block Googlebot from crawling your private <code className="bg-sky-200/50 dark:bg-sky-900/50 px-1 py-0.5 rounded">/admin</code> pages.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Editor Area */}
        <Paper elevation={0} className="flex-1 min-w-[300px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none animate-in">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center flex-wrap gap-4">
            <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FileCode size={18} className="text-amber-500" /> Editor
            </div>
            <div className="flex gap-2">
              <Button size="small" variant="outlined" color="inherit" onClick={handleGenerateBasic} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                Basic Setup
              </Button>
              <Button size="small" variant="outlined" color="warning" onClick={handleGenerateWordPress} sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                WordPress Setup
              </Button>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-800 dark:text-slate-300 font-mono text-sm leading-loose focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-y transition-shadow"
              spellCheck="false"
            />
          </div>
        </Paper>

        {/* Tester Area */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          {/* Test URL Card */}
          <Paper elevation={0} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none animate-in">
            <div className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-2">
              <Bot size={22} className="text-blue-500" /> Test URL Blocking
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Verify if a specific URL path is blocked by the rules written in the editor.
            </p>
            
            <form onSubmit={handleTestUrl} className="flex flex-col gap-5">
              <TextField
                select
                label="Bot User-Agent"
                value={testUserAgent}
                onChange={(e) => setTestUserAgent(e.target.value)}
                variant="outlined"
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                <MenuItem value="*">Any Bot (*)</MenuItem>
                <MenuItem value="Googlebot">Googlebot</MenuItem>
                <MenuItem value="Googlebot-Image">Googlebot-Image</MenuItem>
                <MenuItem value="Bingbot">Bingbot</MenuItem>
                <MenuItem value="Slurp">Yahoo Slurp</MenuItem>
                <MenuItem value="DuckDuckBot">DuckDuckBot</MenuItem>
              </TextField>

              <TextField
                label="Path to test"
                placeholder="/admin/dashboard"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                variant="outlined"
                fullWidth
                size="small"
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />

              <Button 
                type="submit" 
                variant="outlined" 
                color="primary"
                fullWidth
                sx={{ borderRadius: '12px', padding: '10px', textTransform: 'none', fontWeight: 700, borderWidth: '2px', '&:hover': { borderWidth: '2px' } }}
              >
                Test Path
              </Button>
            </form>

            {testResult && (
              <div className={`mt-6 p-4 rounded-2xl flex items-start gap-3 border ${testResult === 'allowed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'} animate-in`}>
                <div className="mt-0.5">
                  {testResult === 'allowed' ? <CheckCircle size={20} className="text-emerald-500" /> : <ShieldAlert size={20} className="text-red-500" />}
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${testResult === 'allowed' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {testResult === 'allowed' ? 'Access Allowed' : 'Access Blocked'}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {testResult === 'allowed' 
                      ? 'Search engines can successfully crawl and index this path.' 
                      : 'This path is blocked by a Disallow rule. Search engines will skip it.'}
                  </p>
                </div>
              </div>
            )}
          </Paper>

          {/* Quick Tips Card */}
          <Paper elevation={0} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none animate-in">
            <div className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <AlertTriangle size={20} className="text-emerald-500" /> Quick Tips
            </div>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="flex gap-2 items-start"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span><strong className="text-slate-700 dark:text-slate-200">User-agent: *</strong> applies rules to all web crawlers globally.</span></li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span><strong className="text-slate-700 dark:text-slate-200">Disallow: /folder/</strong> blocks the entire directory and its contents.</span></li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Always include the absolute path to your <strong className="text-slate-700 dark:text-slate-200">Sitemap.xml</strong> at the bottom.</span></li>
              <li className="flex gap-2 items-start"><Check size={16} className="text-emerald-500 shrink-0 mt-0.5" /> <span>Use <strong className="text-slate-700 dark:text-slate-200">Allow:</strong> to whitelist specific files inside a disallowed folder.</span></li>
            </ul>
          </Paper>
        </div>
      </div>
    </div>
  );
}
