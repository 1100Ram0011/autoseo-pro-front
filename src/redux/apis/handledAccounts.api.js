import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

export const handledAccountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyHandlers: builder.query({
      query: () => '/api/handled-accounts/my-handlers',
      providesTags: ['HandledAccounts'],
    }),

    getAccessibleAccounts: builder.query({
      query: () => '/api/handled-accounts/accessible',
      providesTags: ['AccessibleAccounts'],
    }),

    suggestUsernames: builder.query({
      query: (q) => `/api/handled-accounts/suggest-usernames?q=${encodeURIComponent(q)}`,
    }),

    inviteHandler: builder.mutation({
      query: (body) => ({
        url: '/api/handled-accounts/invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HandledAccounts'],
    }),

    acceptInvitation: builder.mutation({
      query: (invitationId) => ({
        url: `/api/handled-accounts/accept/${invitationId}`,
        method: 'POST',
      }),
      invalidatesTags: ['AccessibleAccounts'],
    }),

    removeDelegation: builder.mutation({
      query: (id) => ({
        url: `/api/handled-accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HandledAccounts', 'AccessibleAccounts'],
    }),

    verifySwitchAccount: builder.query({
      query: (targetOwnerId) => `/api/handled-accounts/verify-switch/${targetOwnerId}`,
    }),

    updateDelegation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/handled-accounts/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['HandledAccounts', 'User'],
    }),
  }),
})

export const {
  useGetMyHandlersQuery,
  useGetAccessibleAccountsQuery,
  useSuggestUsernamesQuery,
  useLazySuggestUsernamesQuery,
  useInviteHandlerMutation,
  useAcceptInvitationMutation,
  useRemoveDelegationMutation,
  useLazyVerifySwitchAccountQuery,
  useUpdateDelegationMutation,
} = handledAccountsApi

