import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useMapLeads() {
  const { data, error, mutate, isLoading } = useSWR('/api/leads/map', fetcher);

  const generateLeads = async (targetMarket: string, geographicFocus: string, numLeads: number) => {
    try {
      const response = await axios.post('/api/leads/map/generate', {
        targetMarket,
        geographicFocus,
        NumberOfLeads: numLeads
      });
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start generation');
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await axios.delete(`/api/leads/map/${id}`);
      mutate(); // Refresh the list
      toast.success('Lead deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const verifyWhatsApp = async (id: string) => {
    try {
      const response = await axios.post(`/api/leads/map/${id}/verify-wa`);
      mutate();
      return response.data.isWhatsAppNumber;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify WhatsApp');
      return null;
    }
  };

  const checkProgress = async (jobId: string) => {
    const response = await axios.get(`/api/leads/map/progress?jobId=${jobId}`);
    return response.data;
  };

  return {
    leads: data?.data || [],
    stats: data?.statistics || null,
    isLoading,
    isError: error,
    generateLeads,
    deleteLead,
    verifyWhatsApp,
    checkProgress,
    mutate
  };
}

export function useLinkedinLead(mapLeadId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    mapLeadId ? `/api/leads/linkedin/${mapLeadId}` : null, 
    fetcher,
    { refreshInterval: (data) => 
        (data?.data?.status && !['completed', 'failed'].includes(data.data.status)) ? 3000 : 0 
    }
  );

  const generateLinkedinLead = async (companyName: string) => {
    try {
      await axios.post('/api/leads/linkedin/generate', {
        mapLeadId,
        companyName
      });
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start LinkedIn scraping');
    }
  };

  const enrichEmployee = async (employeeName: string, profileUrl: string, companyName: string) => {
    try {
      const res = await axios.post('/api/leads/linkedin/enrich', {
        leadId: data?.data?.id,
        employeeName,
        profileUrl,
        companyName
      });
      toast.success(res.data.message);
      mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to enrich contact');
    }
  };

  return {
    linkedinLead: data?.data || null,
    isLoading,
    isError: error,
    generateLinkedinLead,
    enrichEmployee
  };
}
