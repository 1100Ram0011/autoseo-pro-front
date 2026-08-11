import useSWR from 'swr';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const fetcher = (url: string) => axios.get(url, { withCredentials: true }).then(res => res.data);

export function useGetImages() {
  const { data, error, mutate, isLoading } = useSWR(`${API_BASE}/media/images`, fetcher);

  return {
    images: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useGetDeletedImages() {
  const { data, error, mutate, isLoading } = useSWR(`${API_BASE}/media/images/deleted`, fetcher);

  return {
    deletedImages: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useGetArchivedMedia() {
  const { data, error, mutate, isLoading } = useSWR(`${API_BASE}/media/archived`, fetcher);

  return {
    archivedMedia: data?.data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export async function uploadImage(payload: any) {
  const response = await axios.post(`${API_BASE}/media`, payload, { withCredentials: true });
  return response.data;
}

export async function updateMedia(id: string, payload: any) {
  const response = await axios.put(`${API_BASE}/media/${id}`, payload, { withCredentials: true });
  return response.data;
}

export async function deleteMedia(id: string) {
  const response = await axios.delete(`${API_BASE}/media/${id}`, { withCredentials: true });
  return response.data;
}

export async function restoreMedia(id: string) {
  const response = await axios.put(`${API_BASE}/media/${id}/restore`, {}, { withCredentials: true });
  return response.data;
}

export async function permanentlyDeleteMedia(id: string) {
  const response = await axios.delete(`${API_BASE}/media/${id}/permanent`, { withCredentials: true });
  return response.data;
}

export async function updateMediaMeta(id: string, payload: { description?: string, hashtags?: string[] }) {
  const response = await axios.put(`${API_BASE}/media/${id}/meta`, payload, { withCredentials: true });
  return response.data;
}

export async function archiveMedia(id: string) {
  const response = await axios.put(`${API_BASE}/media/${id}/archive`, {}, { withCredentials: true });
  return response.data;
}

export async function unarchiveMedia(id: string) {
  const response = await axios.put(`${API_BASE}/media/${id}/unarchive`, {}, { withCredentials: true });
  return response.data;
}
