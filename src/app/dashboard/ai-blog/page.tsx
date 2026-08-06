"use client";
import { useState, useEffect } from "react";
import useSWR from 'swr';
import SmartBlogCreator from "./components/SmartBlogCreator";
import { useSite } from '@/lib/SiteContext';

export default function AIBlogPage() {
  const { selectedSiteId: activeSiteId } = useSite();

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