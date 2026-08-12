// services/blog-generation.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

function safeParseJSON(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

export async function generateTitleSuggestions(analysis) {
  const { business_overview, services_and_offerings, target_market } = analysis;

  const prompt = `
You are an SEO blog title expert.
Business: ${business_overview?.company_name}
Industry: ${business_overview?.industry}
Services: ${services_and_offerings?.primary_services?.slice(0, 3).join(', ')}
Target: ${target_market?.primary_customer_segments?.slice(0, 2).join(', ')}

Generate 5 compelling SEO-optimized blog titles.
Return ONLY a valid JSON array of 5 strings. No explanation.
`;

  const result = await model.generateContent(prompt);
  return safeParseJSON(result.response.text());
}

export async function generateBlogFromTitle(analysis, selectedTitle) {
  const { business_overview, services_and_offerings, customer_insights } = analysis;

  const prompt = `
Write a professional blog post titled: "${selectedTitle}"
Company: ${business_overview?.company_name}
Services: ${services_and_offerings?.primary_services?.slice(0, 4).join(', ')}
Pain points addressed: ${customer_insights?.pain_points?.slice(0, 3).join(', ')}

Write 1000-1200 words in markdown with H2/H3 headings.
Return ONLY valid JSON in this exact format:
{ "content": "...", "tags": ["tag1","tag2","tag3"], "excerpt": "..." }
`;

  const result = await model.generateContent(prompt);
  return safeParseJSON(result.response.text());
}