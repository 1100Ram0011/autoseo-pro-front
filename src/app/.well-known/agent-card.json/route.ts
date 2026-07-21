import { NextResponse } from 'next/server';

export async function GET() {
  const agentCard = {
    agent_id: 'autoseo-pro-agent',
    agent_name: 'AutoSEO Pro Agent',
    description: 'An autonomous agent that optimizes your website for search engines. It can crawl sites, fix meta tags, and generate SEO-optimized content.',
    version: '1.0.0',
    capabilities: [
      'site-crawling',
      'meta-tag-analysis',
      'content-generation',
      'keyword-research'
    ],
    contact: {
      email: 'ai@autoseopro.com',
      website: 'https://autoseopro.com'
    },
    api_schema: '/.well-known/openapi.json',
    pricing: 'free-tier'
  };

  return NextResponse.json(agentCard, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
