




import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const googleMapApi = createApi({
  reducerPath: 'googleMapApi',
  baseQuery: fetchBaseQuery({
    // 👇 Yahan .env file se backend ka URL aayega (http://localhost:5000)
    baseUrl: `${(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))}/api/leads`,

    prepareHeaders: (headers, { getState }) => {
      // Auth token handle karne ke liye (agar aapke app mein login/auth hai)
      const token = getState().auth?.token || localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // 'Leads' tag caching aur auto-refresh (revalidation) ke liye use hota hai
  tagTypes: ['Leads'],
  endpoints: (builder) => ({

    // 1. Fetch All Leads: Dashboard par leads table populate karne ke liye
    getMyLeads: builder.query({
      query: () => ({
        url: '/my-leads',
        method: 'GET',
      }),
      // Response ko transform kar sakte hain taaki frontend ko sahi data format mile
      transformResponse: (response) => {
        return {
          results: response.data || [],
          statistics: response.statistics || null
        };
      },
      providesTags: ['Leads'],
    }),

    // 2. Generate Leads: Naye leads scrap karne ke liye
    generateLeads: builder.mutation({
      query: (leadRequest) => ({
        url: '/generate-leads',
        method: 'POST',
        body: leadRequest, // Payload: { targetMarket, geographicFocus, NumberOfLeads }
      }),
      // Frontend ko batata hai ki naye data aa gaye hain, table auto-refresh karo
      invalidatesTags: ['Leads'],
    }),

    // 3. Delete Lead: Kisi specific lead ko DB se hataane ke liye
    deleteLead: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: 'DELETE',
      }),
      // Delete hone ke baad bhi table auto-refresh hogi
      invalidatesTags: ['Leads'],
    }),

    // Verify WhatsApp number
    verifyLeadWhatsApp: builder.mutation({
      query: ({ id, phone }) => ({
        url: `/verify-whatsapp/${id}`,
        method: 'PUT',
        body: { phone }
      }),
      // Refresh leads to get updated WhatsApp status
      invalidatesTags: ['Leads'],
    }),

    // 4. Export Leads: Agar backend se CSV/XLSX download karana ho (Optional)
    exportLeads: builder.query({
      query: () => '/export',
    }),

    getLeadProgress: builder.query({
      query: () => '/progress',
    }),

    getGooglePlacesAutocomplete: builder.query({
      query: (input) => `/autocomplete?input=${encodeURIComponent(input)}`,
    }),

    suggestTargetMarkets: builder.mutation({
      query: (data) => ({
        url: '/target-market-suggestions',
        method: 'POST',
        body: data,
      }),
    }),

    validateTargetMarket: builder.mutation({
      query: (data) => ({
        url: '/validate-target-market',
        method: 'POST',
        body: data,
      }),
    }),

  }),
});

// Hooks auto-generate ho jate hain function names ke basis par
export const {
  useGetMyLeadsQuery,
  useGenerateLeadsMutation,
  useDeleteLeadMutation,
  useLazyExportLeadsQuery,
  useGetLeadProgressQuery,
  useVerifyLeadWhatsAppMutation,
  useLazyGetGooglePlacesAutocompleteQuery,
  useSuggestTargetMarketsMutation,
  useValidateTargetMarketMutation
} = googleMapApi;