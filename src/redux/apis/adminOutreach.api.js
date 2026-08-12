import { apiSlice } from '../backendApiSlice/apiSlice'

export const adminOutreachApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all outreach profiles
    getOutreachList: builder.query({
      query: () => '/api/admin/outreach/list',
      providesTags: ['AdminOutreach'],
    }),

    // Get specific profile details
    getOutreachDetail: builder.query({
      query: (hash) => `/api/admin/outreach/${hash}`,
      providesTags: (result, error, hash) => [{ type: 'AdminOutreach', id: hash }],
    }),

    // Submit URLs for analysis
    analyzeUrls: builder.mutation({
      query: (data) => ({
        url: '/api/admin/outreach/analyze',
        method: 'POST',
        body: data, // { items: [{ websiteUrl, emails: ["a@b.com"] }] }
      }),
      invalidatesTags: ['AdminOutreach'],
    }),

    // Manually trigger email send for a specific hash
    sendOutreachEmail: builder.mutation({
      query: ({ hash, emails }) => ({
        url: `/api/admin/outreach/${hash}/send-email`,
        method: 'POST',
        body: { emails },
      }),
      invalidatesTags: (result, error, { hash }) => [
        'AdminOutreach',
        { type: 'AdminOutreach', id: hash },
      ],
    }),

    // Manually trigger email extraction
    getWebsiteEmails: builder.mutation({
      query: ({ hash }) => ({
        url: `/api/admin/outreach/${hash}/get-emails`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { hash }) => [
        'AdminOutreach',
        { type: 'AdminOutreach', id: hash },
      ],
    }),
  }),
})

export const {
  useGetOutreachListQuery,
  useGetOutreachDetailQuery,
  useAnalyzeUrlsMutation,
  useSendOutreachEmailMutation,
  useGetWebsiteEmailsMutation,
} = adminOutreachApi
