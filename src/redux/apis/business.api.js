import { apiSlice } from '../backendApiSlice/apiSlice'

export const businessApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addBusinessDetails: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Business'],
    }),

    // getMyBusinessDetails: builder.query({
    //   query: () => ({
    //     url: '/api/business/user/business',
    //     method: 'GET',
    //   }),
    //   providesTags: ['Business'],
    // }),
    updateBusinessDescription: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Business', 'AnalysisStatus', 'BusinessDetailsSummary', 'Profile', 'User'],
    }),

    updateBusinessLogo: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business/logo',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['BusinessDetailsSummary'],
    }),

    uploadBusinessLogoImage: builder.mutation({
      query: (formData) => ({
        url: '/api/media/upload/image',
        method: 'POST',
        body: formData,
      }),
    }),

    deleteBusinessDetails: builder.mutation({
      query: (businessId) => ({
        url: `/api/business/user/business/${businessId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Business'],
    }),

    getAllMyBusinesses: builder.query({
      query: () => '/api/business/user/business/all',
      providesTags: ['Business'],
    }),

    switchActiveBusiness: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business/switch',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Business', 'BusinessDetailsSummary', 'AnalysisStatus', 'Profile', 'User'],
    }),

    deactivateAllBusinesses: builder.mutation({
      query: () => ({
        url: '/api/business/user/business/deactivate-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Business', 'BusinessDetailsSummary', 'AnalysisStatus', 'Profile', 'User'],
    }),

    getMyBusinessDetailSummary: builder.query({
      query: () => '/api/business/user/business/summary',
      providesTags: ['BusinessDetailsSummary'],
    }),

    getMyProfile: builder.query({
      query: (userId) => ({
        url: `/api/business/user/profile/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    uploadProfileMedia: builder.mutation({
      query: (formData) => ({
        url: '/api/business/user/profile/media',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),

    getAnalysisStatus: builder.query({
      query: () => '/api/firecrawl/status',
      providesTags: ['Business'],
    }),

    analyzeEnrichment: builder.mutation({
      query: (body) => ({
        url: '/api/enrichment/analyze',
        method: 'POST',
        body,
      }),
    }),

    getAnalysisProgress: builder.query({
      query: (websiteHash) =>
        `/api/business/user/analysis/progress/${websiteHash}`,
    }),

    sendBusinessEmailOtp: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business/verify/send-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Business'],
    }),

    verifyOtpAndStartCrawl: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business/verify/verify-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Business', 'Credits', 'CreditLogs'],
    }),

    getBusinessStatus: builder.query({
      query: (userId) => ({
        url: `/api/business/user/business/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Business'],
    }),
    extractWebsiteContacts: builder.mutation({
      query: (data) => ({
        url: "/api/business/user/business/extract-contacts",
        method: "POST",
        body: data,
      }),
    }),
    verifyBank: builder.mutation({
      query: (data) => ({
        url: "/api/auth/user/bank/verify",
        method: "POST",
        body: data,
      }),
    }),
    addBank: builder.mutation({
      query: (data) => ({
        url: "/api/auth/user/bank/add",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
    }),
    setPrimaryBank: builder.mutation({
      query: (data) => ({
        url: "/api/auth/user/bank/set-primary",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
    }),
    deleteBank: builder.mutation({
      query: (data) => ({
        url: "/api/auth/user/bank/delete",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Profile", "User"],
    }),
    generateUserReportPdf: builder.query({
      query: () => ({
        url: "/api/business/user/business/report-pdf",
        method: "GET",
      }),
    }),
    reanalyzeWebsite: builder.mutation({
      query: (data) => ({
        url: '/api/business/user/business/reanalyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Business', 'AnalysisStatus', 'BusinessDetailsSummary', 'Profile', 'User', 'Credits', 'CreditLogs'],
    }),
  }),
})
export const {
  useAddBusinessDetailsMutation,
  // useGetMyBusinessDetailsQuery,
  useUpdateBusinessDescriptionMutation,
  useUpdateBusinessLogoMutation,
  useUploadBusinessLogoImageMutation,
  useDeleteBusinessDetailsMutation,
  useGetMyBusinessDetailSummaryQuery,
  useLazyGetMyBusinessDetailSummaryQuery,
  useGetMyProfileQuery,
  useUploadProfileMediaMutation,
  useGetAllMyBusinessesQuery,
  useLazyGetAllMyBusinessesQuery,
  useSwitchActiveBusinessMutation,
  useDeactivateAllBusinessesMutation,
  useGetAnalysisStatusQuery,
  useAnalyzeEnrichmentMutation,
  useGetAnalysisProgressQuery,
  useSendBusinessEmailOtpMutation,
  useVerifyOtpAndStartCrawlMutation,
  useGetBusinessStatusQuery,
  useExtractWebsiteContactsMutation,
  useVerifyBankMutation,
  useAddBankMutation,
  useSetPrimaryBankMutation,
  useDeleteBankMutation,
  useLazyGenerateUserReportPdfQuery,
  useReanalyzeWebsiteMutation,
} = businessApi
