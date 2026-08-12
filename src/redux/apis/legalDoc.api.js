import { apiSlice } from '../backendApiSlice/apiSlice'

export const legalDocApi = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getLegalTypes: build.query({
      query: () => ({
        url: '/api/legal/legalTypes',
        params: { fxdTypeId: 1 },
      }),
      providesTags: [{ type: 'LegalDoc', id: 'TYPES' }],
    }),

    getLegalSummary: build.query({
      query: () => '/api/legal',
      providesTags: [{ type: 'LegalDoc', id: 'SUMMARY' }],
    }),

    getVersionList: build.query({
      query: (typeId) => ({ url: '/api/legal', params: { typeId } }),
      providesTags: (_res, _err, typeId) => [
        { type: 'LegalDoc', id: `LIST-${typeId}` },
      ],
    }),

    getPublishedByType: build.query({
      query: (typeId) => ({
        url: '/api/legal',
        params: { typeId, published: true },
      }),
      providesTags: (_res, _err, typeId) => [
        { type: 'LegalDoc', id: `PUBLISHED-${typeId}` },
      ],
    }),

    getDocById: build.query({
      query: (id) => `/api/legal/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'LegalDoc', id }],
    }),

    createDoc: build.mutation({
      query: (body) => ({ url: '/api/legal', method: 'POST', body }),
      invalidatesTags: (_res, _err, body) => [
        { type: 'LegalDoc', id: `LIST-${body.typeId}` },
        { type: 'LegalDoc', id: 'SUMMARY' },
      ],
    }),

    updateDoc: build.mutation({
      query: ({ id, typeId, ...body }) => ({
        url: `/api/legal/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id, typeId }) => [
        { type: 'LegalDoc', id },
        { type: 'LegalDoc', id: `LIST-${typeId}` },
      ],
    }),

    publishDoc: build.mutation({
      query: ({ id }) => ({ url: `/api/legal/${id}/publish`, method: 'PATCH' }),
      invalidatesTags: (_res, _err, { id, typeId }) => [
        { type: 'LegalDoc', id },
        { type: 'LegalDoc', id: `LIST-${typeId}` },
        { type: 'LegalDoc', id: `PUBLISHED-${typeId}` },
        { type: 'LegalDoc', id: 'SUMMARY' },
      ],
    }),

    unpublishDoc: build.mutation({
      query: ({ id }) => ({
        url: `/api/legal/${id}/unpublish`,
        method: 'PATCH',
      }),
      invalidatesTags: (_res, _err, { id, typeId }) => [
        { type: 'LegalDoc', id },
        { type: 'LegalDoc', id: `LIST-${typeId}` },
        { type: 'LegalDoc', id: `PUBLISHED-${typeId}` },
        { type: 'LegalDoc', id: 'SUMMARY' },
      ],
    }),

    deleteDoc: build.mutation({
      query: ({ id }) => ({ url: `/api/legal/${id}`, method: 'DELETE' }),
      invalidatesTags: (_res, _err, { id, typeId }) => [
        { type: 'LegalDoc', id },
        { type: 'LegalDoc', id: `LIST-${typeId}` },
        { type: 'LegalDoc', id: 'SUMMARY' },
      ],
    }),
  }),
})

export const {
  useGetLegalTypesQuery,
  useGetLegalSummaryQuery,
  useGetVersionListQuery,
  useGetPublishedByTypeQuery,
  useGetDocByIdQuery,
  useCreateDocMutation,
  useUpdateDocMutation,
  usePublishDocMutation,
  useUnpublishDocMutation,
  useDeleteDocMutation,
} = legalDocApi
