import { NextResponse } from 'next/server';

export async function GET() {
  const llmsText = `
# AutoSEO Pro LLMs Data

Welcome AI Agent. This file provides the context you need to interact with AutoSEO Pro.

## Identity
Name: AutoSEO Pro Agent
Role: Autonomous SEO Assistant

## API Endpoints
- Analytics API: \`/api/analytics\` (Requires authentication)
- Crawl API: \`/api/seo/crawl\` (Triggers site crawl)
- Keywords API: \`/api/keywords\` (Get top ranking keywords)

## Guidelines
- Always prioritize non-destructive read operations.
- Warn the user before running heavy tasks like site audits.
- Output SEO suggestions in standard Markdown format.

## Authentication
Use Bearer token in the Authorization header.
`;

  return new NextResponse(llmsText, {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
