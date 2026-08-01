import useSWR from 'swr';
import { useState } from 'react';
import { api } from '../lib/api';

interface BlogTitle {
  title: string;
  url: string;
}

interface BlogDraft {
  title: string;
  content: string;
  tags?: string[];
  coverImage?: string;
  createdAt: Date;
}

interface ActiveJob {
  jobId: string;
  selectedTitle: string;
}

interface BlogSession {
  id: string;
  userId: string;
  titles: BlogTitle[];
  drafts: BlogDraft[];
  activeJobs: ActiveJob[];
}

export const useGetBlogSessionQuery = (siteId: string | null, options?: any) => {
  const { data, error, mutate, isLoading } = useSWR<BlogSession>(
    siteId && siteId !== 'undefined' && !options?.skip ? `/blogs/session` : null, 
    (url: string) => api.get(url).then(res => res.data)
  );
  return { data, isLoading: isLoading && (!data && !error), isError: !!error, mutate };
};

export const useGetBloggerStatusQuery = () => {
  const { data, error, mutate, isLoading } = useSWR<{ connected: boolean }>(
    `/blogs/blogger/status`,
    (url: string) => api.get(url).then(res => res.data)
  );
  return { data, isLoading: isLoading && (!data && !error), isError: !!error, mutate };
};

export const useGetMyBlogsQuery = (params: any, options?: any) => {
  const { data, error, mutate, isLoading } = useSWR<{ blogs: any[], totalPages: number }>(
    !options?.skip ? `/blogs?page=${params.page}&limit=${params.limit}` : null,
    (url: string) => api.get(url).then(res => res.data),
    { refreshInterval: options?.pollingInterval || 0 }
  );
  return { data, isLoading: isLoading && (!data && !error), refetch: mutate };
};

export const useGetBlogStatusQuery = (blogId: string, options?: any) => {
  const { data, error, mutate, isLoading } = useSWR<{ blog: any }>(
    blogId && !options?.skip ? `/blogs/status/${blogId}` : null,
    (url: string) => api.get(url).then(res => res.data),
    { refreshInterval: options?.pollingInterval || 0 }
  );
  return { data, isLoading: isLoading && (!data && !error), isError: !!error };
};

// Mutations and Lazy queries
export const useLazyGetTitleSuggestionsQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const trigger = async (siteId: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get<{ success: boolean, titles: BlogTitle[] }>(`/blogs/titles/${siteId}`);
      return { unwrap: () => Promise.resolve(data) };
    } finally {
      setIsLoading(false);
    }
  };
  return [trigger, { isLoading }];
};

export const useGenerateBlogContentMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const trigger = async (body: any) => {
    setIsLoading(true);
    try {
      // In our new controller, the param is siteId, mytekai uses profileId. We'll map it.
      const mappedBody = { ...body, siteId: body.profileId };
      const { data } = await api.post(`/blogs/generate`, mappedBody);
      return { unwrap: () => Promise.resolve(data) };
    } finally {
      setIsLoading(false);
    }
  };
  return [trigger, { isLoading }];
};

export const useSaveDraftMutation = () => {
  const trigger = async (body: any) => {
    const { data } = await api.patch(`/blogs/session/draft`, body);
    return { unwrap: () => Promise.resolve(data) };
  };
  return [trigger, {}];
};

export const useSaveTitlesMutation = () => {
  const trigger = async (body: any) => {
    const { data } = await api.patch(`/blogs/session/titles`, body);
    return { unwrap: () => Promise.resolve(data) };
  };
  return [trigger, {}];
};

export const useSetActiveJobMutation = () => {
  const trigger = async (body: any) => {
    const { data } = await api.patch(`/blogs/session/active-job`, body);
    return { unwrap: () => Promise.resolve(data) };
  };
  return [trigger, {}];
};

export const useDeleteBlogMutation = () => {
  const trigger = async (blogId: string) => {
    const { data } = await api.delete(`/blogs/${blogId}`);
    return { unwrap: () => Promise.resolve(data) };
  };
  return [trigger, {}];
};

export const usePublishBlogMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const trigger = async (body: any) => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/blogs/publish`, body);
      return { unwrap: () => Promise.resolve(data) };
    } finally {
      setIsLoading(false);
    }
  };
  return [trigger, { isLoading }];
};

export const useGetGenerationStatusQuery = () => {
   return { data: null }; // Not used or handled by active jobs
};


export const generateTitles = async (siteId: string) => {
  const { data } = await api.get<{ success: boolean, titles: BlogTitle[] }>(`/blogs/titles/${siteId}`);
  return data.titles;
};

export const generateBlogContent = async (siteId: string, selectedTitle: string, blogPageUrl?: string) => {
  const { data } = await api.post(`/blogs/generate`, { siteId, selectedTitle, blogPageUrl });
  return data;
};

export const saveDraft = async (draftData: Partial<BlogDraft>) => {
  const { data } = await api.patch(`/blogs/session/draft`, draftData);
  return data;
};

export const saveTitles = async (titles: BlogTitle[], prepend = false) => {
  const { data } = await api.patch(`/blogs/session/titles`, { titles, prepend });
  return data;
};

export const setActiveJob = async (jobId?: string, selectedTitle?: string, remove = false) => {
  const { data } = await api.patch(`/blogs/session/active-job`, { jobId, selectedTitle, remove });
  return data;
};
