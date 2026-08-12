 



import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: ((process.env.NEXT_PUBLIC_API_URL.replace('/api', '')) || 'http://localhost:5000') + '/api/',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Blog', 'BlogSession'],
  endpoints: (builder) => ({

    publishBlog: builder.mutation({
      query: (newBlogData) => ({
        url: 'blogs/publish',
        method: 'POST',
        body: newBlogData,
      }),
      invalidatesTags: ['Blog'],
    }),

    deleteBlog: builder.mutation({
      query: (blogId) => ({
        url: `blogs/${blogId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
    }),

    getMyBlogs: builder.query({
      query: ({ page = 1, limit = 20 } = {}) =>
        `blogs/my-blogs?page=${page}&limit=${limit}`,
      providesTags: ['Blog'],
    }),
          getTitleSuggestions: builder.query({
        query: (profileId) => `/blog-generation/titles/${profileId}`,
      }),
      generateBlogContent: builder.mutation({
        query: (body) => ({
          url: '/blog-generation/generate-content',
          method: 'POST',
          body,
        }),
      }),

      getGenerationStatus: builder.query({  // new
  query: (jobId) => `/blog-generation/status/${jobId}`,
}),

    getBlogStatus: builder.query({
      query: (blogId) => `blogs/status/${blogId}`,
      providesTags: ['Blog'],
    }),

    getBloggerStatus: builder.query({
      query: () => `blogs/blogger/status`,
    }),

    getSuccessfulScrapes: builder.query({
      query: () => `/firecrawl/logs/success`,
    }),

    getBlogSession: builder.query({
  query: (profileId) => `/blog-session/${profileId}`,
  providesTags: ['BlogSession'],
}),

saveTitles: builder.mutation({
  query: ({ profileId, titles, prepend }) => ({
    url: `/blog-session/${profileId}/titles`,
    method: 'PATCH',
    body: { titles, prepend },
  }),
  invalidatesTags: ['BlogSession'],
}),

saveDraft: builder.mutation({
  query: ({ profileId, title, content, tags, coverImage }) => ({
    url: `/blog-session/${profileId}/draft`,
    method: 'PATCH',
    body: { title, content, tags, coverImage },
  }),
  invalidatesTags: ['BlogSession'],
}),

setActiveJob: builder.mutation({
  query: ({ profileId, jobId, selectedTitle, remove }) => ({
    url: `/blog-session/${profileId}/active-job`,
    method: 'PATCH',
    body: { jobId, selectedTitle, remove },
  }),
  invalidatesTags: ['BlogSession'],
}),

  }),
});

export const {
  usePublishBlogMutation,
  useDeleteBlogMutation,
  useGetMyBlogsQuery,
  useGetBlogStatusQuery,
  useGetTitleSuggestionsQuery,
  useGenerateBlogContentMutation,
  useLazyGetTitleSuggestionsQuery,
  useGetGenerationStatusQuery,
  useGetBlogSessionQuery,      // ← add
  useSaveTitlesMutation,       // ← add
  useSaveDraftMutation,        // ← add
  useSetActiveJobMutation,
  useGetBloggerStatusQuery,
  useGetSuccessfulScrapesQuery,
} = blogApi;