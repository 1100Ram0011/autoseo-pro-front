import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

export const paymentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCredits: builder.query({
      query: (userId) => ({
        url: '/api/credits',
        params: userId ? { userId } : {},
      }),
      providesTags: ['Credits'],
    }),
    getFeatureCost: builder.query({
      query: ({ featureKey, subFeature }) => {
        let url = `/api/credits/cost?featureKey=${featureKey}`
        if (subFeature) url += `&subFeature=${subFeature}`
        return url
      },
    }),
    getCreditUsageLogs: builder.query({
      query: ({ page = 1, limit = 20, type, serviceName, startDate, endDate } = {}) => {
        let url = `/api/credits/usage?page=${page}&limit=${limit}`
        if (type) url += `&type=${encodeURIComponent(type)}`
        if (serviceName) url += `&serviceName=${encodeURIComponent(serviceName)}`
        if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`
        if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`
        return url
      },
      providesTags: ['CreditLogs'],
    }),
    initializePayU: builder.mutation({
      query: (data) => ({
        url: '/api/payu/initialize',
        method: 'POST',
        body: data,
      }),
    }),
    initializeRazorpay: builder.mutation({
      query: (data) => ({
        url: '/api/razorpay/initialize',
        method: 'POST',
        body: data,
      }),
    }),
    verifyRazorpay: builder.mutation({
      query: (data) => ({
        url: '/api/razorpay/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Credits', 'CreditLogs', 'Invoices'],
    }),
    getPricingPlans: builder.query({
      query: (country) => {
        const _url = country
          ? `/api/credits/plans?country=${country}`
          : '/api/credits/plans'
        return {
          url: _url,
          method: 'GET',
        }
      },
      providesTags: ['Plans'],
    }),
    getServiceCosts: builder.query({
      query: () => '/api/credits/service-costs',
      providesTags: ['ServiceCosts'],
    }),
    getVideoPricing: builder.query({
      query: (engine) => engine ? `/api/credits/video-pricing?engine=${engine}` : '/api/credits/video-pricing',
      providesTags: ['VideoPricing'],
    }),
    getIncentiveSlabs: builder.query({
      query: (country) => {
        const _url = country
          ? `/api/credits/incentive-slabs?country=${country}`
          : '/api/credits/incentive-slabs';
        return { url: _url, method: 'GET' };
      },
      providesTags: ['IncentiveSlabs'],
    }),
    getUserLocation: builder.query({
      query: (ip) => {
        const url = ip ? `/api/credits/user-location?ip=${ip}` : '/api/credits/user-location';
        return { url, method: 'GET' };
      },
    }),
    getStates: builder.query({
      query: () => '/api/invoice/states',
    }),
    getInvoiceStatus: builder.query({
      query: () => '/api/invoice/invoice-onboarding/status',
      providesTags: ['InvoiceStatus'],
    }),
    submitBillingDetails: builder.mutation({
      query: (data) => ({
        url: '/api/invoice/invoice-onboarding/submit',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['InvoiceStatus', 'User'],
    }),
    skipBillingDetails: builder.mutation({
      query: () => ({
        url: '/api/invoice/invoice-onboarding/skip',
        method: 'POST',
      }),
      invalidatesTags: ['InvoiceStatus', 'User'],
    }),
    getCreditOverview: builder.query({
      query: (userId) => ({
        url: '/api/credits/getCreditOverview',
        method: 'GET',
        params: userId ? { userId } : {},
      }),
      providesTags: ['Credits'],
    }),
    addCredits: builder.mutation({
      query: ({ userId, amount }) => ({
        url: "/api/credits/add-credits",
        method: "POST",
        body: {
          userId,
          amount,
        },
      }),
      invalidatesTags: ["Credits"],
    }),
    getMyInvoices: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => {
        let url = `/api/invoice/my-invoices?page=${page}&limit=${limit}`
        if (search) url += `&search=${search}`
        return url
      },
      providesTags: ['Invoices'],
    }),
    getAllInvoices: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = '',
        city = '',
        state = '',
      } = {}) => {
        let url = `/api/invoice/all-invoices?page=${page}&limit=${limit}`
        if (search) url += `&search=${search}`
        if (city) url += `&city=${city}`
        if (state) url += `&state=${state}`
        return url
      },
      providesTags: ['Invoices'],
    }),
    downloadInvoice: builder.query({
      query: (id) => ({
        url: `/api/invoice/download/${id}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // DSA - Incentive Transactions
    getIncentiveTransactions: builder.query({
      query: ({
        page = 1,
        limit = 15,
        status = '',
        search = '',
        beneficiaryId = '',
        month = '',
      } = {}) => {
        let url = `/api/admin/dsa/incentive-transactions?page=${page}&limit=${limit}`
        if (status) url += `&status=${status}`
        if (search) url += `&search=${search}`
        if (beneficiaryId) url += `&beneficiaryId=${beneficiaryId}`
        if (month) url += `&month=${month}`
        return url
      },
      providesTags: ['IncentiveTransactions'],
    }),

    // DSA - Invoices
    getDSAInvoices: builder.query({
      query: ({ page = 1, limit = 15, search = '', status = '' } = {}) => {
        let url = `/api/admin/dsa/invoices?page=${page}&limit=${limit}`
        if (search) url += `&search=${search}`
        if (status) url += `&status=${status}`
        return url
      },
      providesTags: ['DSAInvoices'],
    }),

    deleteDSAInvoice: builder.mutation({
      query: (id) => ({
        url: `/api/admin/dsa/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DSAInvoices', 'IncentiveTransactions'],
    }),

    updateDSAInvoiceStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/admin/dsa/invoices/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['DSAInvoices', 'IncentiveTransactions'],
    }),

    downloadDSAInvoice: builder.query({
      query: (id) => ({
        url: `/api/admin/dsa/invoices/${id}/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    getAdminDetails: builder.query({
      query: () => '/api/admin/dsa/admin-details',
    }),

    payBulkRaiseInvoicesByAdmin: builder.mutation({
      query: (formData) => ({
        url: '/api/admin/dsa/invoices/bulk-pay',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['DSAInvoices', 'IncentiveTransactions', 'DSAPayments'],
    }),

    getAllDsaPaymentTransactions: builder.query({
      query: (params) => ({
        url: '/api/admin/dsa/payment-transactions',
        params,
      }),
      providesTags: ['DSAPayments'],
    }),
    initializePayUReferral: builder.mutation({
      query: (data) => ({
        url: '/api/payu/initialize_referral',
        method: 'POST',
        body: data,
      }),
    }),
    getPayUPincode: builder.query({
      query: (pincode) => `/api/payu/pincode/${pincode}`,
    }),
    verifyRazorpayReferral: builder.mutation({
      query: (data) => ({
        url: '/api/razorpay/verify-referral',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Credits', 'CreditLogs', 'Invoices', 'FaceSwap'],
    }),
  }),
})

export const {
  useGetCreditsQuery,
  useGetFeatureCostQuery,
  useGetCreditUsageLogsQuery,
  useInitializePayUMutation,
  useInitializeRazorpayMutation,
  useVerifyRazorpayMutation,
  useGetPricingPlansQuery,
  useGetServiceCostsQuery,
  useGetVideoPricingQuery,
  useGetIncentiveSlabsQuery,
  useGetUserLocationQuery,
  useGetStatesQuery,
  useGetInvoiceStatusQuery,
  useSubmitBillingDetailsMutation,
  useSkipBillingDetailsMutation,
  useGetCreditOverviewQuery,
  useAddCreditsMutation,
  useGetMyInvoicesQuery,
  useGetAllInvoicesQuery,
  useLazyDownloadInvoiceQuery,

  // DSA
  useGetIncentiveTransactionsQuery,
  useGetDSAInvoicesQuery,
  useDeleteDSAInvoiceMutation,
  useUpdateDSAInvoiceStatusMutation,
  useLazyDownloadDSAInvoiceQuery,
  useGetAdminDetailsQuery,
  usePayBulkRaiseInvoicesByAdminMutation,
  useGetAllDsaPaymentTransactionsQuery,
  useInitializePayUReferralMutation,
  useVerifyRazorpayReferralMutation,
  useLazyGetPayUPincodeQuery,
} = paymentApi
