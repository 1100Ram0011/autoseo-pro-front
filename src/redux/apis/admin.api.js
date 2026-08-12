import { apiSlice } from '../backendApiSlice/apiSlice'

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBusinessDetails: builder.query({
      query: () => '/api/admin/business',
      providesTags: ['AdminBusiness'],
    }),

    // Service Costs
    getAllServiceCosts: builder.query({
      query: () => '/api/admin/service-costs',
      providesTags: ['ServiceCosts'],
    }),
    updateServiceCost: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/service-costs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ServiceCosts'],
    }),

    // Company Lead Pricing
    getCompanyLeadPricing: builder.query({
      query: () => '/api/admin/company-lead-pricing',
      providesTags: ['CompanyLeadPricing'],
    }),
    createCompanyLeadPricing: builder.mutation({
      query: (data) => ({
        url: '/api/admin/company-lead-pricing',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CompanyLeadPricing'],
    }),
    updateCompanyLeadPricing: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/company-lead-pricing/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['CompanyLeadPricing'],
    }),
    deleteCompanyLeadPricing: builder.mutation({
      query: (id) => ({
        url: `/api/admin/company-lead-pricing/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanyLeadPricing'],
    }),

    // Video Pricing Config
    getAllVideoPricingConfig: builder.query({
      query: () => '/api/admin/video-pricing',
      providesTags: ['VideoPricingConfig'],
    }),
    updateVideoPricingConfig: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/video-pricing/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['VideoPricingConfig'],
    }),
    createVideoPricingConfig: builder.mutation({
      query: (data) => ({
        url: '/api/admin/video-pricing',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VideoPricingConfig'],
    }),

    // Free Usage Master
    getAllFreeUsageMaster: builder.query({
      query: () => '/api/admin/free-usage-master',
      providesTags: ['FreeUsageMaster'],
    }),
    updateFreeUsageMaster: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/free-usage-master/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FreeUsageMaster'],
    }),
    getAISettings: builder.query({
      query: () => '/api/admin/ai-settings',
      providesTags: ['AISettings'],
    }),
    updateAISetting: builder.mutation({
      query: (data) => ({
        url: '/api/admin/ai-settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AISettings'],
    }),

    // Demo Emails
    getDemoEmails: builder.query({
      query: (params) => ({
        url: '/api/auth/user/demo-emails',
        params,
      }),
      providesTags: ['DemoEmails'],
    }),
    addDemoEmail: builder.mutation({
      query: (data) => ({
        url: '/api/admin/demo-emails',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DemoEmails'],
    }),
    deleteDemoEmail: builder.mutation({
      query: (id) => ({
        url: `/api/admin/demo-emails/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DemoEmails'],
    }),

    // Caption Cost Config
    getCaptionConfig: builder.query({
      query: () => '/api/admin/caption-config',
      providesTags: ['CaptionConfig'],
    }),
    updateCaptionConfig: builder.mutation({
      query: (data) => ({
        url: '/api/admin/caption-config',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CaptionConfig'],
    }),

    // Meta Whatsapp Pricing
    getMetaWhatsappPricings: builder.query({
      query: () => '/api/admin/whatsapp/pricing',
      providesTags: ['MetaWhatsappPricings'],
    }),
    createMetaWhatsappPricing: builder.mutation({
      query: (data) => ({
        url: '/api/admin/whatsapp/pricing',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MetaWhatsappPricings'],
    }),
    updateMetaWhatsappPricing: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/whatsapp/pricing/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MetaWhatsappPricings'],
    }),
    deleteMetaWhatsappPricing: builder.mutation({
      query: (id) => ({
        url: `/api/admin/whatsapp/pricing/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MetaWhatsappPricings'],
    }),
  }),
})

export const {
  useGetAllBusinessDetailsQuery,
  useGetAllServiceCostsQuery,
  useUpdateServiceCostMutation,
  useGetAllVideoPricingConfigQuery,
  useUpdateVideoPricingConfigMutation,
  useCreateVideoPricingConfigMutation,
  useGetAllFreeUsageMasterQuery,
  useUpdateFreeUsageMasterMutation,
  useGetAISettingsQuery,
  useUpdateAISettingMutation,
  useGetDemoEmailsQuery,
  useAddDemoEmailMutation,
  useDeleteDemoEmailMutation,
  useGetCaptionConfigQuery,
  useUpdateCaptionConfigMutation,
  useGetMetaWhatsappPricingsQuery,
  useCreateMetaWhatsappPricingMutation,
  useUpdateMetaWhatsappPricingMutation,
  useDeleteMetaWhatsappPricingMutation,
  useGetCompanyLeadPricingQuery,
  useCreateCompanyLeadPricingMutation,
  useUpdateCompanyLeadPricingMutation,
  useDeleteCompanyLeadPricingMutation,
} = adminApi
