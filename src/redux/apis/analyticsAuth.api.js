import { apiSlice } from "../backendApiSlice/apiSlice";

export const analyticsAuthApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        googleAnalyticsLogin: builder.query({
            query: () => ({
                url: "/api/auth/analytics/email/google",
                method: "GET",
            }),
        }),

        // 🔄 Refresh Analytics Token
        refreshAnalyticsToken: builder.mutation({
            query: () => ({
                url: "/api/auth/analytics/refresh",
                method: "GET",
                credentials: "include",
            }),
        }),

        // 🚪 Logout Analytics
        logoutAnalytics: builder.mutation({
            query: () => ({
                url: "/api/auth/analytics/logout",
                method: "POST",
                credentials: "include",
            }),
        }),

    }),
});

export const {
    useLoginAnalyticsMutation,
    useRefreshAnalyticsTokenMutation,
    useLogoutAnalyticsMutation,
} = analyticsAuthApi;