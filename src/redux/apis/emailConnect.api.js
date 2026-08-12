import { apiSlice } from "../backendApiSlice/apiSlice";

export const emailConnectApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // GET /api/auth/status
        getEmailAuthStatus: builder.query({
            query: () => "/api/auth/email/status",
            providesTags: ["EmailAuth"]
        }),

        // DELETE /api/auth/google/disconnect
        disconnectGoogle: builder.mutation({
            query: (body) => ({
                url: "/api/auth/email/google/disconnect",
                method: "DELETE",
                body
            }),
            invalidatesTags: ["EmailAuth"]
        }),

        // DELETE /api/auth/microsoft/disconnect
        disconnectMicrosoft: builder.mutation({
            query: (body) => ({
                url: "/api/auth/email/microsoft/disconnect",
                method: "DELETE",
                body
            }),
            invalidatesTags: ["EmailAuth"]
        }),

        // POST /api/auth/test-email
        sendTestEmail: builder.mutation({
            query: (body) => ({
                url: "/api/auth/email/test-email",
                method: "POST",
                body
            })
        }),

        // POST /api/auth/email/custom/connect
        connectCustomEmail: builder.mutation({
            query: (body) => ({
                url: "/api/auth/email/custom/connect",
                method: "POST",
                body
            }),
            invalidatesTags: ["EmailAuth"]
        }),

        // DELETE /api/auth/email/custom/disconnect
        disconnectCustomEmail: builder.mutation({
            query: (body) => ({
                url: "/api/auth/email/custom/disconnect",
                method: "DELETE",
                body
            }),
            invalidatesTags: ["EmailAuth"]
        }),

        // PUT /api/auth/email/limit
        updateEmailDailyLimit: builder.mutation({
            query: (body) => ({
                url: "/api/auth/email/limit",
                method: "PUT",
                body
            }),
            invalidatesTags: ["EmailAuth"]
        }),

        // GET /api/auth/email/utilization
        getEmailUtilizationHistory: builder.query({
            query: ({ email, days }) => `/api/auth/email/utilization?email=${encodeURIComponent(email)}&days=${days}`,
        }),

    }),
});

export const {
    useGetEmailAuthStatusQuery,
    useDisconnectGoogleMutation,
    useDisconnectMicrosoftMutation,
    useSendTestEmailMutation,
    useConnectCustomEmailMutation,
    useDisconnectCustomEmailMutation,
    useUpdateEmailDailyLimitMutation,
    useGetEmailUtilizationHistoryQuery,
} = emailConnectApi;