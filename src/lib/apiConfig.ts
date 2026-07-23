// Centralized API Base URL for the entire frontend
// In production, set NEXT_PUBLIC_API_URL in Vercel environment variables
// e.g., NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
