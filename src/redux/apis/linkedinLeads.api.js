import { apiSlice } from '../backendApiSlice/apiSlice'

export const linkedinLeadsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getMyLinkedinLeads: builder.query({
            query: (params) => ({
                url: "/api/linkedin-leads/my-leads",
                method: "GET",
                params: params
            }),
            providesTags: ["LinkedinLeads"],
        }),

        generateLinkedinLeads: builder.mutation({
            query: (data) => ({
                url: "/api/linkedin-leads/generate",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["LinkedinLeads", "Leads"],
        }),

        deleteLinkedinLead: builder.mutation({
            query: (id) => ({
                url: `/api/linkedin-leads/${id}`,
                method: "DELETE"
            }),
            invalidatesTags: ["LinkedinLeads"],
        }),

        clearLinkedinLeads: builder.mutation({
            query: () => ({
                url: "/api/linkedin-leads/clear/all",
                method: "DELETE"
            }),
            invalidatesTags: ["LinkedinLeads"],
        }),
        enrichLinkedinEmployee: builder.mutation({
            query: (data) => ({
                url: "/api/linkedin-leads/enrich",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["LinkedinLeads"],
        }),
    })
});

export const {
    useGetMyLinkedinLeadsQuery,
    useLazyGetMyLinkedinLeadsQuery,
    useGenerateLinkedinLeadsMutation,
    useDeleteLinkedinLeadMutation,
    useClearLinkedinLeadsMutation,
    useEnrichLinkedinEmployeeMutation
} = linkedinLeadsApi;
