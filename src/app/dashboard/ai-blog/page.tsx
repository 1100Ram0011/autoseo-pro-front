"use client";
import { useState, useEffect } from "react";
import useSWR from 'swr';
import SmartBlogCreator from "./components/SmartBlogCreator";

export default function AIBlogPage() {
  const [activeSiteId, setActiveSiteId] = useState<string | null>(null);

  // Fetch sites to default to the first one if not set
  const fetcher = (url: string) => fetch(`/api${url}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
  const { data: sites } = useSWR('/sites', fetcher);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeSiteId');
      if (saved) {
        setActiveSiteId(saved);
      } else if (sites && sites.length > 0) {
        setActiveSiteId(sites[0].id);
      }
    }
  }, [sites]);

  if (!activeSiteId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Please select a site to generate a blog.
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', color: '#0F172A', padding: '1.75rem 2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.4rem', color: '#0F172A' }}>✍️ AI Blog Writer</h1>
      <p style={{ margin: '0 0 1.75rem', fontSize: '0.88rem', color: '#64748B' }}>
        Generate full, SEO-optimized blog posts using AI and publish directly to Blogger.
      </p>

      {/* Render the ported mytekai component */}
      <SmartBlogCreator profileId={activeSiteId} requireAuth={true} />
    </div>
  );
}