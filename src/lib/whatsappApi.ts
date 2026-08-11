import { api } from './api';

// ==========================================
// WhatsApp Templates
// ==========================================
export const getWhatsappTemplates = async () => {
  const res = await api.get('/meta-whatsapp/template-library');
  return res.data;
};

// ==========================================
// WhatsApp Campaigns
// ==========================================
export const estimateWhatsappCampaign = async (payload: any) => {
  const res = await api.post('/meta-whatsapp/campaigns/estimate', payload);
  return res.data;
};

export const createWhatsappCampaign = async (payload: any) => {
  const res = await api.post('/meta-whatsapp/campaigns', payload);
  return res.data;
};

// ==========================================
// WhatsApp Connections
// ==========================================
export const getCampaignConnections = async () => {
  // Assuming a public API or a specific WhatsApp accounts API
  const res = await api.get('/meta-whatsapp/accounts'); // Ensure this matches backend
  return res.data;
};

// ==========================================
// WhatsApp Datasets
// ==========================================
export const getWhatsappDatasets = async () => {
  const res = await api.get('/meta-whatsapp/datasets');
  return res.data;
};

export const uploadWhatsappDataset = async (formData: FormData) => {
  const res = await api.post('/meta-whatsapp/datasets/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// ==========================================
// WhatsApp Chats (Inbox)
// ==========================================
export const getWhatsappChats = async (connectionId: string) => {
  const res = await api.get(`/meta-whatsapp/chats?connectionId=${connectionId}`);
  return res.data;
};

export const sendWhatsAppInboxMessage = async (payload: any) => {
  const res = await api.post('/meta-whatsapp/send-interactive', payload); // Adjust endpoint based on your backend
  return res.data;
};
