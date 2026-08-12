import { apiSlice } from "../backendApiSlice/apiSlice";

export const calendarApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ─────────────────────────────────────────────
       ACCOUNTS
    ───────────────────────────────────────────── */

    getConnectedAccounts: builder.query({
      query: () => "/api/social-accounts/get-all-accounts",
      providesTags: ["SocialAccount"],
    }),


    getScheduledPosts: builder.query({
      query: (params) => {
        let url = "/api/post";
        const queryParams = new URLSearchParams();
        if (params && params.postSource) {
          queryParams.set("postSource", params.postSource);
        }
        if (params && params.planId) {
          queryParams.set("planId", params.planId);
        }
        const qs = queryParams.toString();
        return qs ? `${url}?${qs}` : url;
      },
      providesTags: ["SocialPost"],
    }),


    getFestivalsByMonth: builder.query({
      query: ({ year, month, countryCode, isFixed } = {}) => {
        const params = new URLSearchParams();
        if (year)                      params.set("year",    String(year));
        if (month)                     params.set("month",   String(month));
        if (countryCode)               params.set("countryCode", String(countryCode));
        if (typeof isFixed === "boolean") params.set("isFixed", String(isFixed));
        return `/api/calendar/festivals?${params.toString()}`;
      },
      providesTags: ["Festival"],
    }),

    getFestivals: builder.query({
      query: ({ countryCode, year }) => {
        const params = new URLSearchParams();
        if (countryCode) params.set("countryCode", countryCode);
        if (year) params.set("year", String(year));
        return `/api/calendar/calendar-festivals?${params.toString()}`;
      },
      providesTags: ["Festival"],
    }),

    generateFestivalPost: builder.mutation({
      query: (data) => ({
        url: "/api/calendar/generate-festival-post",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SocialPost"],
    }),

    getPostGenerationStatus: builder.query({
      query: (postId) =>
        `/api/calendar/post-generation-status/${postId}`,
      keepUnusedDataFor: 0,
    }),

    reschedulePost: builder.mutation({
      query: ({ postId, scheduledAt }) => ({
        url: `/api/calendar/scheduled-post/${postId}/reschedule`,
        method: "PATCH",
        body: { scheduledAt },
      }),
      invalidatesTags: ["SocialPost", "PersonalEvent", "Plans"],
    }),

    deleteScheduledPost: builder.mutation({
      query: (postId) => ({
        url: `/api/calendar/scheduled-post/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SocialPost", "PersonalEvent"],
    }),

    /* ─────────────────────────────────────────────
       PERSONAL EVENTS
    ───────────────────────────────────────────── */

    getPersonalEvents: builder.query({
      query: ({ month, year } = {}) => {
        const params = new URLSearchParams();
        if (month) params.set("month", String(month));
        if (year) params.set("year", String(year));

        return `/api/calendar/personalEvent?${params.toString()}`;
      },
      providesTags: ["PersonalEvent"],
    }),

    createPersonalEvent: builder.mutation({
      query: (data) => ({
        url: "/api/calendar/personalEvent",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PersonalEvent", "SocialPost"],
    }),

    updatePersonalEvent: builder.mutation({
      query: (data) => ({
        url: "/api/calendar/personalEvent",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["PersonalEvent"],
    }),

    deletePersonalEvent: builder.mutation({
      query: (eventId) => ({
        url: "/api/calendar/personalEvent",
        method: "DELETE",
        body: { eventId },
      }),
      invalidatesTags: ["PersonalEvent", "SocialPost"],
    }),
    scheduleMeeting: builder.mutation({
      query: (body) => ({
        url: "/api/meeting/schedule-meeting",
        method: "POST",
        body,
      }),
    }),
    contactInfo: builder.mutation({
      query: (body) => ({
        url: "/api/contact/info",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetConnectedAccountsQuery,
  useGetScheduledPostsQuery,
  useGetFestivalsByMonthQuery,
  useGenerateFestivalPostMutation,
  useGetPostGenerationStatusQuery,
  useReschedulePostMutation,
  useDeleteScheduledPostMutation,
  useGetPersonalEventsQuery,
  useCreatePersonalEventMutation,
  useUpdatePersonalEventMutation,
  useDeletePersonalEventMutation,
  useGetFestivalsQuery,
  useScheduleMeetingMutation,
  useContactInfoMutation,
} = calendarApi;