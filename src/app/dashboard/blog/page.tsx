"use client";

import { useState } from 'react';
import { Info, PenTool, Bold, Italic, Underline, Link, List, ListOrdered, AlignLeft, AlignCenter, Sparkles} from 'lucide-react';
import styles from './page.module.css';

export default function AIBlogWriterPage() {
  const [title, setTitle] = useState('10 Best SEO Tools to Grow Your Business in 2024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState(`<h1>10 Best SEO Tools to Grow Your Business in 2024</h1>
<p>SEO tools are essential for any business that wants to rank higher on search engines and drive more organic traffic. In this top guide, we'll explore the 10 best SEO tools that can help you find purpose, analyze your competitors, and grow your brand online.</p>
      {/* Auto-injected Info Block */}
      <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '12px' }}>
        <Info size={20} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#0369A1', fontSize: '0.95rem' }}>How does this work?</h4>
          <p style={{ margin: 0, color: '#0C4A6E', fontSize: '0.85rem', lineHeight: '1.5' }}>
             Manage and optimize your existing blog content for better search visibility. <strong>Example:</strong> Identify articles that haven't been updated in a year and refresh them for a quick ranking boost.
          </p>
        </div>
      </div>
  `);

  const handleGenerate = async () => {
    if (!title) return;
    setIsGenerating(true);
    setContent('<p>Generating AI Content... Please wait... 🚀</p>');
    try {
      const res = await fetch('http://localhost:4000/api/ai/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: title })
      });
      const data = await res.json();
      if (data.post) {
        let htmlPost = data.post
          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
          .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br/>');
        setContent(`<p>${htmlPost}</p>`);
      }
    } catch (error) {
      setContent('<p style="color:red">Failed to generate content.</p>');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <PenTool size={24} color="#5A4AF4" />
          AI Blog Writer
        </div>
      </div>

      <div className={styles.splitLayout}>
        {/* Left Config Panel */}
        <div className={styles.configPanel}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Blog Title</label>
            <input 
              type="text" 
              className={styles.input} 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>

          <div className={styles.twoCols}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tone</label>
              <select className={styles.select}>
                <option>Professional</option>
                <option>Conversational</option>
                <option>Humorous</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Language</label>
              <select className={styles.select}>
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Article Type</label>
            <select className={styles.select}>
              <option>How-to Guide</option>
              <option>Listicle</option>
              <option>Thought Leadership</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Length (Words)</label>
            <input 
              type="number" 
              className={styles.input} 
              defaultValue={1500}
            />
          </div>

          <button className={styles.generateBtn} onClick={handleGenerate} disabled={isGenerating}>
            <Sparkles size={18} />
            {isGenerating ? 'Generating...' : 'Generate Content'}
          </button>
        </div>

        {/* Right Editor Panel */}
        <div className={styles.editorPanel}>
          <div className={styles.editorHeader}>
            <div className={styles.editorTitle}>Generated Content</div>
          </div>
          
          <div className={styles.toolbar}>
            <button className={styles.toolIconBtn}><Bold size={16} /></button>
            <button className={styles.toolIconBtn}><Italic size={16} /></button>
            <button className={styles.toolIconBtn}><Underline size={16} /></button>
            <span style={{width: 1, height: 20, background: '#0F172A', margin: '0 8px', alignSelf: 'center'}} />
            <button className={styles.toolIconBtn}><Link size={16} /></button>
            <button className={styles.toolIconBtn}><List size={16} /></button>
            <button className={styles.toolIconBtn}><ListOrdered size={16} /></button>
            <span style={{width: 1, height: 20, background: '#0F172A', margin: '0 8px', alignSelf: 'center'}} />
            <button className={styles.toolIconBtn}><AlignLeft size={16} /></button>
            <button className={styles.toolIconBtn}><AlignCenter size={16} /></button>
          </div>

          <div 
            className={styles.editorContent} 
            contentEditable={true} 
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <div className={styles.editorFooter}>
            <button className={styles.draftBtn}>Save as Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
}
