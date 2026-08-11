import useSWR from "swr";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const fetcher = (url: string) =>
  axios.get(url, { withCredentials: true }).then((res) => res.data);

// ────────────────────────────────────────
// CAMPAIGNS
// ────────────────────────────────────────
export function useEmailCampaigns(page = 1) {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/email-campaign/campaigns?page=${page}`,
    fetcher
  );
  return {
    campaigns: data?.campaigns ?? [],
    pagination: data?.pagination ?? {},
    isLoading,
    isError: error,
    mutate,
  };
}

export async function createEmailCampaign(payload: any) {
  const res = await axios.post(`${API_BASE}/email-campaign/campaigns`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function updateCampaignStatus(id: string, status: string, extra?: any) {
  const res = await axios.patch(
    `${API_BASE}/email-campaign/campaigns/${id}/status`,
    { status, ...extra },
    { withCredentials: true }
  );
  return res.data;
}

export async function deleteCampaign(id: string) {
  const res = await axios.delete(`${API_BASE}/email-campaign/campaigns/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

export function useCampaignLogs(campaignId: string | null, page = 1) {
  const { data, error, isLoading, mutate } = useSWR(
    campaignId
      ? `${API_BASE}/email-campaign/campaigns/${campaignId}/logs?page=${page}`
      : null,
    fetcher
  );
  return {
    logs: data?.logs ?? [],
    pagination: data?.pagination ?? {},
    isLoading,
    isError: error,
    mutate,
  };
}

// ────────────────────────────────────────
// TEMPLATES
// ────────────────────────────────────────
export function useEmailTemplates() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/email-campaign/templates`,
    fetcher
  );
  return {
    templates: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function createEmailTemplate(payload: any) {
  const res = await axios.post(`${API_BASE}/email-campaign/templates`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function updateEmailTemplate(id: string, payload: any) {
  const res = await axios.put(`${API_BASE}/email-campaign/templates/${id}`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function deleteEmailTemplate(id: string) {
  const res = await axios.delete(`${API_BASE}/email-campaign/templates/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

// ────────────────────────────────────────
// AI TEMPLATES
// ────────────────────────────────────────
export function useAIEmailTemplates(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/email-campaign/ai-templates${query}`,
    fetcher
  );
  return {
    aiTemplates: data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function useAITemplate(id: string) {
  const res = await axios.post(
    `${API_BASE}/email-campaign/ai-templates/${id}/use`,
    {},
    { withCredentials: true }
  );
  return res.data;
}

// ────────────────────────────────────────
// EMAIL ACCOUNTS
// ────────────────────────────────────────
export function useEmailAccounts() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/email-campaign/accounts`,
    fetcher
  );
  return {
    accounts: data?.data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}

export async function connectCustomSmtp(payload: { email: string; appPassword: string; dailyLimit?: number }) {
  const res = await axios.post(`${API_BASE}/email-campaign/accounts/custom`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function disconnectEmailAccount(id: string) {
  const res = await axios.delete(`${API_BASE}/email-campaign/accounts/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

export function useEmailUnsubscribes() {
  const { data, error, isLoading, mutate } = useSWR(
    `${API_BASE}/email-campaign/unsubscribes`,
    fetcher
  );
  return {
    unsubscribes: data?.data ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
