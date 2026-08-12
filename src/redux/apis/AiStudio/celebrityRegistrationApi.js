import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const celebrityRegistrationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ======================================================
        // USER
        // ======================================================

        // User
        createCelebrityRegistration: builder.mutation({
            query: (data) => ({
                url: "/api/ai-studio/celebrity-registration",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                "CELEBRITY_REGISTRATION",
                "CELEBRITY_REGISTRATION_STATUS",
            ],
        }),

        getCelebrityRegistrationStatus: builder.query({
            query: () => ({
                url: "/api/ai-studio/celebrity-registration/status",
                method: "GET",
            }),
            providesTags: ["CELEBRITY_REGISTRATION_STATUS"],
        }),

        getCelebrityRegistration: builder.query({
            query: () => ({
                url: "/api/ai-studio/celebrity-registration",
                method: "GET",
            }),
            providesTags: ["CELEBRITY_REGISTRATION"],
        }),

        // getCelebrityRegistrationStatus: builder.query({
        //     query: () => ({
        //         url: "/api/ai-studio/celebrity-registration/status",
        //         method: "GET",
        //     }),
        //     providesTags: ["CELEBRITY_REGISTRATION_STATUS"],
        // }),

        verifyCelebrityRegistration: builder.mutation({
            query: (data) => ({
                url: "/api/ai-studio/celebrity-registration/verification",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                "CELEBRITY_REGISTRATION",
                "CELEBRITY_REGISTRATION_STATUS",
            ],
        }),

        // ======================================================
        // USER - PAN VERIFICATION
        // ======================================================

        initiatePanVerification: builder.mutation({
            query: (data) => ({
                url: "/api/ai-studio/celebrity-registration/pan/initiate",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                "CELEBRITY_REGISTRATION",
                "CELEBRITY_REGISTRATION_STATUS",
            ],
        }),

        verifyPanVerification: builder.mutation({
            query: (data) => ({
                url: "/api/ai-studio/celebrity-registration/pan/verify",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                "CELEBRITY_REGISTRATION",
                "CELEBRITY_REGISTRATION_STATUS",
            ],
        }),

        // ======================================================
        // ADMIN - CELEBRITY REGISTRATION
        // ======================================================

        getCelebrityRegistrations: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                status = "",
                category = "",
                sortBy = "createdAt",
                sortOrder = "desc",
            } = {}) => ({
                url: "/api/ai-studio/celebrity-registration",
                method: "GET",
                params: {
                    page,
                    limit,
                    search,
                    status,
                    category,
                    sortBy,
                    sortOrder,
                },
            }),
            providesTags: ["CELEBRITY_REGISTRATIONS"],
        }),

        getCelebrityRegistrationById: builder.query({
            query: (id) => ({
                url: `/api/ai-studio/celebrity-registration/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "CELEBRITY_REGISTRATIONS", id }],
        }),

        approveCelebrityRegistration: builder.mutation({
            query: ({ id, data }) => ({
                url: `/api/ai-studio/celebrity-registration/${id}/approve`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                "CELEBRITY_REGISTRATIONS",
                "CELEBRITY_REGISTRATION_STATUS",
            ],
        }),

        rejectCelebrityRegistration: builder.mutation({
            query: ({ id, data }) => ({
                url: `/api/ai-studio/celebrity-registration/${id}/reject`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: [
                "CELEBRITY_REGISTRATIONS",
                "CELEBRITY_REGISTRATION_STATUS",
            ],
        }),

    }),
});

export const {

    // ================= USER =================

    useCreateCelebrityRegistrationMutation,
    useGetCelebrityRegistrationQuery,
    useGetCelebrityRegistrationStatusQuery,
    useGetCelebrityRegistrationByIdQuery,
    useVerifyCelebrityRegistrationMutation,
    useInitiatePanVerificationMutation,
    useVerifyPanVerificationMutation,


    // ================= ADMIN =================

    useGetCelebrityRegistrationsQuery,
    useGetCelebrityRegistrationDetailsQuery,
    useUpdateCelebrityPricingMutation,
    useApproveCelebrityRegistrationMutation,
    useRejectCelebrityRegistrationMutation,
    useSuspendCelebrityRegistrationMutation,
    useDeleteCelebrityRegistrationMutation,

} = celebrityRegistrationApi;