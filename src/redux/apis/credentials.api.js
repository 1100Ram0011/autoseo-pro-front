import { apiSlice } from '../backendApiSlice/apiSlice.js'

export const apiCredentialsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------------- LIST ---------------- */
    listCredentials: builder.query({
      query: () => '/api/apicredentials',
      providesTags: ['ApiCredential'],
    }),

    /* ---------------- LIST ---------------- */
    listActiveCredentials: builder.query({
      query: () => '/api/apicredentials/active',
      providesTags: ['ApiCredential'],
    }),

    /* ---------------- GET ONE ---------------- */
    getCredential: builder.query({
      query: (id) => `/api/apicredentials/${id}`,
    }),

    /* ---------------- CREATE API ---------------- */
    createCredential: builder.mutation({
      query: (body) => ({
        url: '/api/apicredentials',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ApiCredential'],
    }),

    /* ---------------- TOGGLE ---------------- */
    toggleCredentialStatus: builder.mutation({
      query: (id) => ({
        url: `/api/apicredentials/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: ['ApiCredential'],
    }),

    /* ---------------- DELETE ---------------- */
    deleteCredential: builder.mutation({
      query: (id) => ({
        url: `/api/apicredentials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ApiCredential'],
    }),

    /* ================= MASTER KEY ================= */

    createMasterKey: builder.mutation({
      query: (body) => ({
        url: '/api/apicredentials/master',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useListCredentialsQuery,
  useGetCredentialQuery,
  useCreateCredentialMutation,
  useToggleCredentialStatusMutation,
  useDeleteCredentialMutation,
  useCreateMasterKeyMutation,
} = apiCredentialsApi
