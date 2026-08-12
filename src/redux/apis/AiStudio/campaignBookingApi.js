import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const campaignBookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create new campaign booking
    createCampaignBooking: builder.mutation({
      query: (data) => ({
        url: "/api/ai-studio/campaigns",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Get campaign bookings for current user
    getUserCampaignBookings: builder.query({
      query: () => ({
        url: "/api/ai-studio/campaigns/user",
        method: "GET",
      }),
      providesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Get campaign bookings for celebrity
    getCelebrityCampaignBookings: builder.query({
      query: () => ({
        url: "/api/ai-studio/campaigns/celebrity",
        method: "GET",
      }),
      providesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Get all platform campaign bookings for admin
    getAdminCampaignBookings: builder.query({
      query: (params) => ({
        url: "/api/ai-studio/campaigns/admin",
        method: "GET",
        params,
      }),
      providesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Get single campaign detail by ID
    getCampaignBookingById: builder.query({
      query: (id) => ({
        url: `/api/ai-studio/campaigns/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "CAMPAIGN_BOOKINGS", id }],
    }),

    // Admin Review
    adminReviewCampaign: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/admin-review`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Admin Generate AI Analysis Package
    generateAiAnalysisPackage: builder.mutation({
      query: (id) => ({
        url: `/api/ai-studio/campaigns/${id}/generate-analysis`,
        method: "POST",
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Celebrity Pre-Production Decision (Approve / Reject / Request Changes)
    celebrityCampaignDecision: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/celebrity-decision`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Admin Upload Intermediate Production Video
    updateProductionProgress: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/production-progress`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Celebrity Final Video Signoff
    celebrityFinalVideoApproval: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/celebrity-final-approval`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Schedule Virtual Meeting
    scheduleCampaignMeeting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/schedule-meeting`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Deliver Campaign to Customer
    deliverCampaignToCustomer: builder.mutation({
      query: (id) => ({
        url: `/api/ai-studio/campaigns/${id}/deliver`,
        method: "POST",
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Celebrity Propose Virtual Meeting Slot
    celebrityProposeMeeting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/celebrity-propose-meeting`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // User Accept Proposed Meeting Slot
    userAcceptMeeting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/user-accept-meeting`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),

    // Admin Setup Google Meet Link & Agenda
    adminSetupMeeting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/ai-studio/campaigns/${id}/admin-setup-meeting`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CAMPAIGN_BOOKINGS"],
    }),
  }),
});

export const {
  useCreateCampaignBookingMutation,
  useGetUserCampaignBookingsQuery,
  useGetCelebrityCampaignBookingsQuery,
  useGetAdminCampaignBookingsQuery,
  useGetCampaignBookingByIdQuery,
  useAdminReviewCampaignMutation,
  useGenerateAiAnalysisPackageMutation,
  useCelebrityCampaignDecisionMutation,
  useUpdateProductionProgressMutation,
  useCelebrityFinalVideoApprovalMutation,
  useScheduleCampaignMeetingMutation,
  useDeliverCampaignToCustomerMutation,
  useCelebrityProposeMeetingMutation,
  useUserAcceptMeetingMutation,
  useAdminSetupMeetingMutation,
} = campaignBookingApi;
