import axios from 'axios';

// The backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Auto-attach user email to every request for auth middleware
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Try to get email from session storage (set by NextAuth session)
    const sessionData = sessionStorage.getItem('autoseo-user-email');
    if (sessionData) {
      config.headers['x-user-email'] = sessionData;
    }
  }
  return config;
});

// Global error interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized — session may have expired');
    }
    return Promise.reject(error);
  }
);

// For SWR
export const fetcher = (url: string) => api.get(url).then(res => res.data);

// ==========================================
// Sites
// ==========================================
export const getSites = async (email?: string) => {
  const url = email ? `/sites?email=${encodeURIComponent(email)}` : '/sites';
  const res = await api.get(url);
  return res.data;
};

export const addSite = async (email: string, url: string) => {
  const res = await api.post(`/sites?email=${encodeURIComponent(email)}`, { url });
  return res.data;
};

// ==========================================
// Dashboard / SEO Overview
// ==========================================
export const getSeoMetrics = async (siteId: string) => {
  const res = await api.get(`/seo/${siteId}/metrics`);
  return res.data;
};

export const getGa4Overview = async (siteId: string) => {
  const res = await api.get(`/sites/${siteId}/ga4/overview`);
  return res.data;
};

export const checkGoogleStatus = async (userId: string = "1") => {
  const res = await api.get(`/auth/google/status?userId=${userId}`);
  return res.data;
};

// ==========================================
// Keywords
// ==========================================
export const getKeywords = async (siteId: string) => {
  const res = await api.get(`/sites/${siteId}/keywords`);
  return res.data;
};

export const addKeyword = async (siteId: string, keyword: string) => {
  const res = await api.post(`/sites/${siteId}/keywords`, { keyword });
  return res.data;
};

// ==========================================
// Competitors
// ==========================================
export const getCompetitors = async (siteId: string) => {
  const res = await api.get(`/sites/${siteId}/competitors`);
  return res.data;
};

export const addCompetitor = async (siteId: string, url: string) => {
  const res = await api.post(`/sites/${siteId}/competitors`, { url });
  return res.data;
};

// ==========================================
// Backlinks
// ==========================================
export const getBacklinks = async (siteId: string) => {
  const res = await api.get(`/backlinks/${siteId}`);
  return res.data;
};
