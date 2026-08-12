import { apiSlice } from '../backendApiSlice/apiSlice'

export const mediaPresenceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMediaPresence: builder.query({
      query: (params) => ({
        url: '/api/media-presence',
        params: params || {},
      }),
      providesTags: ['MediaPresence'],
    }),
    getMediaPresenceById: builder.query({
      query: (id) => `/api/media-presence/${id}`,
      providesTags: (result, error, id) => [{ type: 'MediaPresence', id }],
    }),
    createMediaPresence: builder.mutation({
      query: (formData) => ({
        url: '/api/media-presence',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['MediaPresence'],
    }),
    updateMediaPresence: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/media-presence/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['MediaPresence'],
    }),
    deleteMediaPresence: builder.mutation({
      query: (id) => ({
        url: `/api/media-presence/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaPresence'],
    }),
  }),
})

export const {
  useGetAllMediaPresenceQuery,
  useGetMediaPresenceByIdQuery,
  useCreateMediaPresenceMutation,
  useUpdateMediaPresenceMutation,
  useDeleteMediaPresenceMutation,
} = mediaPresenceApi
