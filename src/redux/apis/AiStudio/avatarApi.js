import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const avatarApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ======================================================
        // USER - AVATAR VALIDATION
        // ======================================================

        validateAvatarImages: builder.mutation({
            query: (formData) => ({
                url: "/api/ai-studio/avatar/validate/image",
                method: "POST",
                body: formData,
            }),
        }),

        validateAvatarVideo: builder.mutation({
            query: (formData) => ({
                url: "/api/ai-studio/avatar/validate/video",
                method: "POST",
                body: formData,
            }),
        }),

        validateAvatarAudio: builder.mutation({
            query: (formData) => ({
                url: "/api/ai-studio/avatar/validate/audio",
                method: "POST",
                body: formData,
            }),
        }),

        // ======================================================
        // USER - AVATAR
        // ======================================================

        createAvatar: builder.mutation({
            query: (formData) => ({
                url: "/api/ai-studio/avatar",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [
                "AI_AVATAR",
                "AI_AVATAR_STATUS",
            ],
        }),

        getAvatar: builder.query({
            query: () => ({
                url: "/api/ai-studio/avatar",
                method: "GET",
            }),
            providesTags: ["AI_AVATAR"],
        }),

        getAvatarStatus: builder.query({
            query: () => ({
                url: "/api/ai-studio/avatar/status",
                method: "GET",
            }),
            providesTags: ["AI_AVATAR_STATUS"],
        }),

        getHeyGenAvatarStatus: builder.query({
            query: () => ({
                url: "/api/ai-studio/avatar/heygen-status",
                method: "GET",
            }),
            providesTags: ["HEYGEN_AVATAR_STATUS"],
        }),

    }),
});

export const {

    // ================= VALIDATION =================

    useValidateAvatarImagesMutation,
    useValidateAvatarVideoMutation,
    useValidateAvatarAudioMutation,

    // ================= AVATAR =================

    useCreateAvatarMutation,
    useGetAvatarQuery,
    useGetAvatarStatusQuery,
    useGetHeyGenAvatarStatusQuery,

} = avatarApi;