import { apiSlice } from "../backendApiSlice/apiSlice";

export const aiTemplateApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ── User: browse active AI templates ──
        getAITemplates: builder.query({
            query: ({ category, search } = {}) => {
                const params = new URLSearchParams();
                if (category && category !== "All") params.append("category", category);
                if (search) params.append("search", search);
                const qs = params.toString();
                return `/api/ai-templates${qs ? `?${qs}` : ""}`;
            },
            providesTags: (result) =>
                Array.isArray(result)
                    ? [
                        ...result.map(({ _id }) => ({
                            type: "AIEmailTemplate",
                            id: _id,
                        })),
                        { type: "AIEmailTemplate", id: "LIST" },
                    ]
                    : [{ type: "AIEmailTemplate", id: "LIST" }],
        }),

        // ── User: get single AI template ──
        getAITemplateById: builder.query({
            query: (id) => `/api/ai-templates/${id}`,
            providesTags: (result, error, id) => [
                { type: "AIEmailTemplate", id },
            ],
        }),

        // ── User: copy / use AI template ──
        useAITemplate: builder.mutation({
            query: ({ id, customName }) => ({
                url: `/api/ai-templates/${id}/use`,
                method: "POST",
                body: { customName },
            }),
            invalidatesTags: [
                { type: "EmailTemplate", id: "LIST" },
                { type: "AIEmailTemplate", id: "LIST" },
            ],
        }),

        // ── Admin: get all AI templates ──
        getAdminAITemplates: builder.query({
            query: () => "/api/ai-templates/admin/all",
            providesTags: (result) =>
                Array.isArray(result)
                    ? [
                        ...result.map(({ _id }) => ({
                            type: "AIEmailTemplate",
                            id: _id,
                        })),
                        { type: "AIEmailTemplate", id: "ADMIN_LIST" },
                    ]
                    : [{ type: "AIEmailTemplate", id: "ADMIN_LIST" }],
        }),

        // ── Admin: create AI template ──
        createAITemplate: builder.mutation({
            query: (body) => ({
                url: "/api/ai-templates/admin",
                method: "POST",
                body,
            }),
            invalidatesTags: [
                { type: "AIEmailTemplate", id: "LIST" },
                { type: "AIEmailTemplate", id: "ADMIN_LIST" },
            ],
        }),

        // ── Admin: update AI template ──
        updateAITemplate: builder.mutation({
            query: ({ id, body }) => ({
                url: `/api/ai-templates/admin/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "AIEmailTemplate", id },
                { type: "AIEmailTemplate", id: "LIST" },
                { type: "AIEmailTemplate", id: "ADMIN_LIST" },
            ],
        }),

        // ── Admin: delete AI template ──
        deleteAITemplate: builder.mutation({
            query: (id) => ({
                url: `/api/ai-templates/admin/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "AIEmailTemplate", id },
                { type: "AIEmailTemplate", id: "LIST" },
                { type: "AIEmailTemplate", id: "ADMIN_LIST" },
            ],
        }),

        // ── Generate AI template from prompt ──
        generateAITemplate: builder.mutation({
            query: (body) => ({
                url: "/api/ai-templates/generate",
                method: "POST",
                body,
            }),
            // Don't invalidate here — socket event handles refresh
        }),
    }),
});

export const {
    useGetAITemplatesQuery,
    useGetAITemplateByIdQuery,
    useUseAITemplateMutation,
    useGetAdminAITemplatesQuery,
    useCreateAITemplateMutation,
    useUpdateAITemplateMutation,
    useDeleteAITemplateMutation,
    useGenerateAITemplateMutation,
} = aiTemplateApi;
