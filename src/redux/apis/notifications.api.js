import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 15 } = {}) => ({
        url: "/api/notifications",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query({
      query: () => ({
        url: "/api/notifications/unread-count",
        method: "GET",
      }),
      providesTags: ["NotificationsCount"],
    }),

    markNotificationsRead: builder.mutation({
      query: (notificationIds) => ({
        url: "/api/notifications/mark-read",
        method: "PATCH",
        body: { notificationIds },
      }),
      invalidatesTags: ["Notifications", "NotificationsCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationsReadMutation,
} = notificationsApi;
