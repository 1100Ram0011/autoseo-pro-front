import { api } from './api';

// ==========================================
// Email Accounts (Tokens)
// ==========================================
export const getEmailAccounts = async () => {
  const res = await api.get('/email-campaign/accounts');
  return res.data;
};

export const connectCustomSmtp = async (payload: any) => {
  const res = await api.post('/email-campaign/accounts/custom', payload);
  return res.data;
};

export const disconnectEmailAccount = async (id: string) => {
  const res = await api.delete(`/email-campaign/accounts/${id}`);
  return res.data;
};

// ==========================================
// Email Templates
// ==========================================
export const getEmailTemplates = async (select?: string) => {
  const res = await api.get(`/email-campaign/templates${select ? `?select=${select}` : ''}`);
  return res.data;
};

export const getEmailTemplateById = async (id: string) => {
  const res = await api.get(`/email-campaign/templates/${id}`);
  return res.data;
};

export const createEmailTemplate = async (payload: any) => {
  // If payload is FormData (for attachments), headers are automatically set by Axios
  const res = await api.post('/email-campaign/templates', payload);
  return res.data;
};

export const updateEmailTemplate = async (id: string, payload: any) => {
  const res = await api.put(`/email-campaign/templates/${id}`, payload);
  return res.data;
};

export const deleteEmailTemplate = async (id: string) => {
  const res = await api.delete(`/email-campaign/templates/${id}`);
  return res.data;
};

// ==========================================
// AI Email Templates
// ==========================================
export const getAITemplates = async () => {
  const res = await api.get('/email-campaign/ai-templates');
  return res.data;
};

export const useAITemplate = async (id: string) => {
  const res = await api.post(`/email-campaign/ai-templates/${id}/use`);
  return res.data;
};

// ==========================================
// Email Campaigns
// ==========================================
export const getEmailCampaigns = async (page = 1, limit = 10, status?: string) => {
  let url = `/email-campaign/campaigns?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  const res = await api.get(url);
  return res.data;
};

export const getEmailCampaignById = async (id: string) => {
  const res = await api.get(`/email-campaign/campaigns/${id}`);
  return res.data;
};

export const createEmailCampaign = async (formData: FormData) => {
  const res = await api.post('/email-campaign/campaigns', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateCampaignStatus = async (id: string, status: string) => {
  const res = await api.patch(`/email-campaign/campaigns/${id}/status`, { status });
  return res.data;
};

export const getCampaignLogs = async (id: string, page = 1, limit = 50, filter?: string) => {
  let url = `/email-campaign/campaigns/${id}/logs?page=${page}&limit=${limit}`;
  if (filter && filter !== 'all') url += `&filter=${filter}`;
  const res = await api.get(url);
  return res.data;
};
