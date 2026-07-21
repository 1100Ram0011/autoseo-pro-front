"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { addSite } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Globe, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // If unauthenticated, go to login
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    if (!session?.user?.email) {
      toast.error('User email not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      // Validate minimal URL structure
      let formattedUrl = url.trim().toLowerCase();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      await addSite(session.user.email, formattedUrl);
      toast.success('Website added successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error('Failed to add website. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: '#FFFFFF', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', textAlign: 'center' }}
      >
        <div style={{ width: 64, height: 64, background: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Globe size={32} color="#3B82F6" />
        </div>
        
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
          Welcome to AutoSEO Pro
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
          Let's set up your first workspace. Enter the website you want to track and optimize.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.5rem' }}>
              Website URL
            </label>
            <input 
              type="text" 
              placeholder="e.g. https://mycompany.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: '0.875rem 1rem', 
                borderRadius: '12px', 
                border: '1px solid #E2E8F0', 
                background: '#F8FAFC', 
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !url}
            style={{ 
              width: '100%', 
              background: loading || !url ? '#94A3B8' : '#3B82F6', 
              color: '#FFFFFF', 
              border: 'none', 
              padding: '0.875rem', 
              borderRadius: '12px', 
              fontSize: '1rem', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              cursor: loading || !url ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              transition: 'background 0.2s'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Adding...
              </>
            ) : (
              <>
                Add Website & Continue <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
