import { apiSlice } from '../backendApiSlice/apiSlice'

export const socialAutomationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMonitoredAccounts: builder.query({
      query: () => '/api/social-automation/monitored-accounts',
      providesTags: ['SocialAutomation'],
    }),
    createMonitoredAccount: builder.mutation({
      query: (body) => ({
        url: '/api/social-automation/monitored-accounts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    pollMonitoredAccount: builder.mutation({
      query: ({ id, params = {} }) => ({
        url: `/api/social-automation/monitored-accounts/${id}/poll`,
        method: 'POST',
        params,
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    pollAutomationSources: builder.mutation({
      query: (params = {}) => ({
        url: '/api/social-automation/poll/run',
        method: 'POST',
        params,
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    getAutomationRules: builder.query({
      query: () => '/api/social-automation/rules',
      providesTags: ['SocialAutomation'],
    }),
    createAutomationRule: builder.mutation({
      query: (body) => ({
        url: '/api/social-automation/rules',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    updateAutomationRule: builder.mutation({
      query: ({ id, body }) => ({
        url: `/api/social-automation/rules/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    getAutomationEvents: builder.query({
      query: () => '/api/social-automation/events',
      providesTags: ['SocialAutomation'],
    }),
    getAutomationDrafts: builder.query({
      query: (params = {}) => ({
        url: '/api/social-automation/drafts',
        params,
      }),
      providesTags: ['SocialAutomation'],
    }),
    approveAutomationDraft: builder.mutation({
      query: ({ id, body = {} }) => ({
        url: `/api/social-automation/drafts/${id}/approve`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialAutomation', 'SocialPost'],
    }),
    rejectAutomationDraft: builder.mutation({
      query: (id) => ({
        url: `/api/social-automation/drafts/${id}/reject`,
        method: 'POST',
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    enhanceAutomationDraft: builder.mutation({
      query: (id) => ({
        url: `/api/social-automation/drafts/${id}/enhance`,
        method: 'POST',
      }),
      invalidatesTags: ['SocialAutomation'],
    }),
    getAutomationRuns: builder.query({
      query: () => '/api/social-automation/runs',
      providesTags: ['SocialAutomation'],
    }),
  }),
})

export const {
  useGetMonitoredAccountsQuery,
  useCreateMonitoredAccountMutation,
  usePollMonitoredAccountMutation,
  usePollAutomationSourcesMutation,
  useGetAutomationRulesQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useGetAutomationEventsQuery,
  useGetAutomationDraftsQuery,
  useApproveAutomationDraftMutation,
  useRejectAutomationDraftMutation,
  useEnhanceAutomationDraftMutation,
  useGetAutomationRunsQuery,
} = socialAutomationApi
