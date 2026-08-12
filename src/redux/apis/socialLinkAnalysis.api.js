import { apiSlice } from '../backendApiSlice/apiSlice'

export const socialLinkAnalysisApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSocialLinkAnalyses: builder.query({
      query: (websiteHash) => ({
        url: '/api/social-link-analysis',
        method: 'GET',
        params: websiteHash ? { websiteHash } : {},
      }),
      providesTags: ['SocialLinkAnalysis'],
    }),

    analyzeSocialLink: builder.mutation({
      query: (body) => ({
        url: '/api/social-link-analysis/analyze',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialLinkAnalysis'],
    }),

    analyzeSocialLinksBulk: builder.mutation({
      query: (body) => ({
        url: '/api/social-link-analysis/analyze-bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialLinkAnalysis'],
    }),

    analyzeSentimentText: builder.mutation({
      query: (body) => ({
        url: '/api/social-link-analysis/sentiment',
        method: 'POST',
        body,
      }),
    }),

    getSocialAuditPricingConfig: builder.query({
      query: () => ({
        url: '/api/social-link-analysis/pricing-config',
        method: 'GET',
      }),
    }),

    generateSocialAuditReportPdf: builder.query({
      query: (id) => ({
        url: `/api/social-link-analysis/${id}/report-pdf`,
        method: 'GET',
      }),
    }),

    probeSocialProfile: builder.mutation({
      query: (body) => ({
        url: '/api/social-link-analysis/probe-profile',
        method: 'POST',
        body,
      }),
    }),

    deleteSocialLinkAnalysis: builder.mutation({
      query: (id) => ({
        url: `/api/social-link-analysis/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialLinkAnalysis'],
    }),
  }),
})

export const {
  useGetSocialLinkAnalysesQuery,
  useAnalyzeSocialLinkMutation,
  useAnalyzeSocialLinksBulkMutation,
  useAnalyzeSentimentTextMutation,
  useGetSocialAuditPricingConfigQuery,
  useLazyGenerateSocialAuditReportPdfQuery,
  useDeleteSocialLinkAnalysisMutation,
  useProbeSocialProfileMutation,
} = socialLinkAnalysisApi
