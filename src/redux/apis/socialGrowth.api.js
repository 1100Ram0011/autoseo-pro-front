import { get } from "react-hook-form"
import { apiSlice } from "../backendApiSlice/apiSlice"

export const socialGrowthApi = apiSlice.injectEndpoints({

    endpoints: (builder) => ({

        /* -----------------------------
           CREATE PLAN
        ----------------------------- */

        deleteGrowthPlan: builder.mutation({
            query: (planId) => ({
                url: `/api/user/social-media-growth/plan/${planId}`,
                method: "DELETE"
            }),
            invalidatesTags: ["Plans"]
        }),

        createGrowthPlan: builder.mutation({

            query: (body) => ({
                url: "/api/user/social-media-growth/create-plan",
                method: "POST",
                body
            }),

            invalidatesTags: ["Plans"]

        }),

        /* -----------------------------
           GET ALL USER PLANS
        ----------------------------- */

        getGrowthPlans: builder.query({
            query: ({ page = 1, limit = 10 } = {}) => ({
                url: "/api/user/social-media-growth/plans",
                method: "GET",
                params: { page, limit }, // ✅ cleaner than string concat
            }),

            providesTags: ["Plans"],
        }),

        /* -----------------------------
           APPROVE PLAN
        ----------------------------- */

        approveGrowthPlan: builder.mutation({

            query: (body) => ({
                url: "/api/user/social-media-growth/approve-plan",
                method: "post",
                body
            }),

            invalidatesTags: ["Plans"]

        }),


        /* -----------------------------
           PUBLISH PLAN
        ----------------------------- */

        publishGrowthPlan: builder.mutation({
            query: (body) => ({
                url: "/api/user/social-media-growth/publish-plan",
                method: "POST", // or PUT based on backend
                body
            }),
            invalidatesTags: ["Plans"]
        }),

        getEstimateCost: builder.mutation({
            query: (body) => ({
                url: "/api/user/social-media-growth/plan/estimate-cost",
                method: "POST", // or PUT based on backend
                body
            }),

        }),

        stopGrowthPlan: builder.mutation({
            query: (planId) => ({
                url: `/api/user/social-media-growth/stop/${planId}`,
                method: "PUT"
            }),
            invalidatesTags: ["Plans"]
        }),

        pauseGrowthPlan: builder.mutation({
            query: ({ planId, pauseMode, confirmConflict }) => ({
                url: `/api/user/social-media-growth/plan/${planId}/pause`,
                method: "PUT",
                body: { pauseMode, confirmConflict }
            }),
            invalidatesTags: ["Plans"]
        }),

        resumeGrowthPlan: builder.mutation({
            query: ({ planId, confirmConflict }) => ({
                url: `/api/user/social-media-growth/plan/${planId}/resume`,
                method: "PUT",
                body: { confirmConflict }
            }),
            invalidatesTags: ["Plans"]
        }),

    })

})

export const {
    useCreateGrowthPlanMutation,
    useGetGrowthPlansQuery,
    useApproveGrowthPlanMutation,
    useDeleteGrowthPlanMutation,
    usePublishGrowthPlanMutation,
    useGetEstimateCostMutation,
    useStopGrowthPlanMutation,
    usePauseGrowthPlanMutation,
    useResumeGrowthPlanMutation
} = socialGrowthApi