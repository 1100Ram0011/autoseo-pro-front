import { apiSlice } from '../backendApiSlice/apiSlice'

export const googleLeadsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getMyLeads: builder.query({
            query: () => ({
                url: "/api/google/scrap/business-leads?limit=200",
                method: "GET"
            }),
            providesTags: ["GoogleLeads"],
        }),

        addMoreLeads: builder.mutation({
            query: (data) => ({
                url: "/api/google/scrap/business-leads/add-more",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["GoogleLeads", "Credits", "CreditLogs"],
        }),

        getScraperProgress: builder.query({
            query: () => ({
                url: "/api/google/scrap/progress",
                method: "GET"
            }),
            providesTags: ["ScraperProgress"],
        }),
        getLeadProgress: builder.query({
            query: () => ({
                url: "/api/leads/progress",
                method: "GET"
            }),
        }),
    })
});
export const {
    useGetMyLeadsQuery,
    useAddMoreLeadsMutation,
    useGetScraperProgressQuery,
    useLazyGetLeadProgressQuery,
} = googleLeadsApi;
