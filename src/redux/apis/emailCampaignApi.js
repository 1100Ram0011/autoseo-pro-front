import { apiSlice } from "../backendApiSlice/apiSlice";

export const emailCampaignApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEmailCampaigns: builder.query({
            query: () => "/api/campaign",
            providesTags: ["EmailCampaign"]
        }),
        createEmailCampaign: builder.mutation({
            query: (formData) => ({
                url: "/api/campaign/create",
                method: "POST",
                body: formData
            }),
            invalidatesTags: ["EmailCampaign", "Credits", "CreditLogs"]
        }),
        deleteEmailCampaign: builder.mutation({
            query: (id) => ({
                url: `/api/campaign/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["EmailCampaign"]
        }),
        getCampaignLogs: builder.query({
            query: (id) => `/api/campaign/${id}/logs?limit=1000`,
            providesTags: ["EmailCampaign"]
        }),
        stopEmailCampaign: builder.mutation({
            query: (id) => ({
                url: `/api/campaign/${id}/stop`,
                method: "POST"
            }),
            invalidatesTags: ["EmailCampaign"]
        })
    })
});

export const {
    useGetEmailCampaignsQuery,
    useCreateEmailCampaignMutation,
    useDeleteEmailCampaignMutation,
    useGetCampaignLogsQuery,
    useLazyGetCampaignLogsQuery,
    useStopEmailCampaignMutation
} = emailCampaignApi;
