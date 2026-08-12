import { apiSlice } from '../backendApiSlice/apiSlice'

export const referralApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createReferral: builder.mutation({
      query: (body) => ({
        url: '/api/referrals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Referrals'],
    }),

    getReferralsByParentId: builder.query({
      query: (parentId) => ({
        url: `/api/referrals/parent/${parentId}`,
        method: 'GET',
      }),
      providesTags: ['Referrals'],
    }),

    updateReferral: builder.mutation({
      query: ({ referralId, body }) => ({
        url: `/api/referrals/${referralId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Referrals'],
    }),
  }),
})

export const {
  useCreateReferralMutation,
  useGetReferralsByParentIdQuery,
  useUpdateReferralMutation,
} = referralApi
