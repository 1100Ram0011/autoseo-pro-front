import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

export const swapTemplatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMySwapTemplates: builder.query({
      query: (cacheBust) => ({
        url: '/api/swap-templates/mine',
        method: 'GET',
        params: cacheBust ? { _t: cacheBust } : undefined,
      }),
      keepUnusedDataFor: 300,
      providesTags: ['Template'],
    }),
    getArchivedSwapTemplates: builder.query({
      query: () => ({
        url: '/api/swap-templates/archived',
        method: 'GET',
      }),
      providesTags: ['Template'],
    }),
    getDeletedSwapTemplateVideos: builder.query({
      query: () => ({
        url: '/api/swap-templates/videos/deleted',
        method: 'GET',
      }),
      keepUnusedDataFor: 300,
      providesTags: ['Template'],
    }),
    uploadSwapTemplate: builder.mutation({
      query: (formData) => ({
        url: '/api/swap-templates',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Template'],
    }),
    importSwapTemplateByUrl: builder.mutation({
      query: (body) => ({
        url: '/api/swap-templates/import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Template'],
    }),
    updateSwapTemplate: builder.mutation({
      query: ({ id, patch }) => ({
        url: `/api/swap-templates/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Template'],
    }),
    deleteSwapTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/swap-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),
    restoreSwapTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/swap-templates/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Template'],
    }),
    permanentlyDeleteSwapTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/swap-templates/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Template'],
    }),
    getSwapTemplateSummary: builder.query({
      query: (id) => ({ url: `/api/swap-templates/${id}/summary`, method: 'GET' }),
      keepUnusedDataFor: 300,
    }),
    getSavedSwapTemplates: builder.query({
      query: () => ({ url: '/api/swap-templates/saved', method: 'GET' }),
      providesTags: ['SavedTemplate'],
    }),
    saveSwapTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/swap-templates/saved',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SavedTemplate'],
    }),
    unsaveSwapTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/swap-templates/saved',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['SavedTemplate'],
    }),
  }),
})

export const {
  useGetMySwapTemplatesQuery,
  useGetArchivedSwapTemplatesQuery,
  useGetDeletedSwapTemplateVideosQuery,
  useUploadSwapTemplateMutation,
  useImportSwapTemplateByUrlMutation,
  useUpdateSwapTemplateMutation,
  useDeleteSwapTemplateMutation,
  useRestoreSwapTemplateMutation,
  usePermanentlyDeleteSwapTemplateMutation,
  useGetSwapTemplateSummaryQuery,
  useGetSavedSwapTemplatesQuery,
  useSaveSwapTemplateMutation,
  useUnsaveSwapTemplateMutation,
} = swapTemplatesApi

