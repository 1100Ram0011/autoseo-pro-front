import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { showActionToast } from '@/lib/toastUtils';
import { API_BASE } from '@/lib/apiConfig';

const fetcher = (url: string) => axios.get(url).then(res => res.data);

export function useMapLeads() {
  const { data, error, mutate, isLoading } = useSWR(`${API_BASE}/leads/map`, fetcher);

  const generateLeads = async (targetMarket: string, geographicFocus: string, numLeads: number) => {
    try {
      const response = await axios.post(`${API_BASE}/leads/map/generate`, {
        targetMarket,
        geographicFocus,
        NumberOfLeads: numLeads
      });
      
      showActionToast({
        message: `Generation started for ${numLeads} leads in ${geographicFocus}.`,
        buttonText: "Got it",
        onClick: () => {}
      });
      
      return response.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start generation');
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/leads/map/${id}`);
      mutate(); // Refresh the list
      toast.success('Lead deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const verifyWhatsApp = async (id: string) => {
    try {
      const response = await axios.post(`${API_BASE}/leads/map/${id}/verify-wa`);
      mutate();
      return response.data.isWhatsAppNumber;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify WhatsApp');
      return null;
    }
  };

  const checkProgress = async (jobId: string) => {
    const response = await axios.get(`${API_BASE}/leads/map/progress?jobId=${jobId}`);
    return response.data;
  };

  const fetchedLeads = data?.data || [];
  
  const dummyLeads = [
    {
      _id: "lead_1",
      id: "lead_1",
      name: "Acme Web Solutions",
      business_type: "Information Technology",
      city: "San Francisco",
      location_name: "San Francisco",
      rating: 4.8,
      reviews: 156,
      phone: "+1 415-555-0198",
      emails: ["contact@acmeweb.example.com"],
      website: "https://acmeweb.example.com",
      isWhatsAppNumber: true,
      linkedin: "https://linkedin.com/company/acmeweb",
      hasLinkedinExtracted: true,
      match_score: 95,
      createdAt: new Date().toISOString(),
      address: "123 Tech Lane, SF, CA 94105",
      additionalPhones: ["+1 415-555-0199"]
    },
    {
      _id: "lead_2",
      id: "lead_2",
      name: "Global Logistics Inc",
      business_type: "Transportation",
      city: "New York",
      location_name: "New York",
      rating: 3.9,
      reviews: 42,
      phone: "+1 212-555-0123",
      emails: [],
      website: "N/A",
      isWhatsAppNumber: false,
      linkedin: "N/A",
      hasLinkedinExtracted: false,
      match_score: 65,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      address: "45 Freight Rd, NY, NY 10001",
      additionalPhones: []
    },
    {
      _id: "lead_3",
      id: "lead_3",
      name: "Green Energy Corp",
      business_type: "Renewables",
      city: "Austin",
      location_name: "Austin",
      rating: 5.0,
      reviews: 12,
      phone: "+1 512-555-0987",
      emails: ["info@greenenergy.example.com"],
      website: "https://greenenergy.example.com",
      isWhatsAppNumber: true,
      linkedin: "https://linkedin.com/company/greenenergy",
      hasLinkedinExtracted: true,
      match_score: 88,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      address: "789 Eco Blvd, Austin, TX 78701",
      additionalPhones: []
    }
  ];

  const leadsToUse = fetchedLeads.length > 0 ? fetchedLeads : dummyLeads;

  return {
    leads: leadsToUse,
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
    mapLeadId ? `${API_BASE}/leads/linkedin/${mapLeadId}` : null, 
    fetcher,
    { refreshInterval: (data) => 
        (data?.data?.status && !['completed', 'failed'].includes(data.data.status)) ? 3000 : 0 
    }
  );

  const generateLinkedinLead = async (companyName: string) => {
    try {
      await axios.post(`${API_BASE}/leads/linkedin/generate`, {
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
      const res = await axios.post(`${API_BASE}/leads/linkedin/enrich`, {
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
    enrichEmployee,
    mutate
  };
}
