import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const promptTemplateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // Create
    createPromptTemplate: builder.mutation({
      query: (formData) => ({
        url: "/api/ai-studio/prompt-templates",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AiStudioPromptTemplate"],
    }),

    // Update
    updatePromptTemplate: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/api/ai-studio/prompt-templates/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["AiStudioPromptTemplate"],
    }),

    // Delete
    deletePromptTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/ai-studio/prompt-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AiStudioPromptTemplate"],
    }),

    // Activate / Deactivate
    togglePromptTemplateStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/api/ai-studio/prompt-templates/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["AiStudioPromptTemplate"],
    }),

    // Admin List
    getAiStudioPromptTemplates: builder.query({
      query: (params) => ({
        url: "/api/ai-studio/prompt-templates",
        params,
      }),
      providesTags: ["AiStudioPromptTemplate"],
    }),

    // Get By Id
    getPromptTemplateById: builder.query({
      query: (id) => ({
        url: `/api/ai-studio/prompt-templates/${id}`,
      }),
      providesTags: ["AiStudioPromptTemplate"],
    }),

    // User Templates
    getActivePromptTemplates: builder.query({
      query: (params) => ({
        url: "/api/ai-studio/prompt-templates/active",
        params,
      }),
      providesTags: ["AiStudioPromptTemplate"],
    }),
    // POST /api/ai-studio/prompt-template/generate
    generatePromptTemplate: builder.mutation({
      query: (formData) => ({
        url: "/api/ai-studio/prompt-templates/generate",
        method: "POST",
        body: formData,
      }),

      invalidatesTags: ["AiStudioPromptTemplate"],
    }),

    // GET /api/ai-studio/prompt-template/generation/:id/status
    getPromptTemplateGenerationStatus: builder.query({
      query: (requestId) =>
        `/api/ai-studio/prompt-templates/generation/${requestId}/status`,

      keepUnusedDataFor: 0,

      providesTags: (_result, _error, requestId) => [
        {
          type: "PromptTemplateGeneration",
          id: requestId,
        },
      ],
    }),

    // GET /api/ai-studio/prompt-templates/settings
    getPromptImageTemplateSettings: builder.query({
      query: () => ({
        url: "/api/ai-studio/prompt-templates/settings",
      }),
      providesTags: ["AiStudioPromptTemplateSettings"],
    }),

    // PUT /api/ai-studio/prompt-templates/settings
    updatePromptImageTemplateSettings: builder.mutation({
      query: (body) => ({
        url: "/api/ai-studio/prompt-templates/settings",
        method: "PUT",
        body,
      }),
      invalidatesTags: [
        "AiStudioPromptTemplateSettings",
        "PromptTemplatePricing",
      ],
    }),

    // GET /api/ai-studio/prompt-templates/pricing
    getPromptTemplatePricing: builder.query({
      query: () => ({
        url: "/api/ai-studio/prompt-templates/pricing",
      }),
      providesTags: ["PromptTemplatePricing"],
    }),

  }),
});

export const {
  useCreatePromptTemplateMutation,
  useUpdatePromptTemplateMutation,
  useDeletePromptTemplateMutation,
  useTogglePromptTemplateStatusMutation,
  useGetAiStudioPromptTemplatesQuery,
  useGetPromptTemplateByIdQuery,
  useGetActivePromptTemplatesQuery,

  // Generation
  useGeneratePromptTemplateMutation,
  useGetPromptTemplateGenerationStatusQuery,
  useLazyGetPromptTemplateGenerationStatusQuery,

  // Settings
  useGetPromptImageTemplateSettingsQuery,
  useUpdatePromptImageTemplateSettingsMutation,

  // Pricing
  useGetPromptTemplatePricingQuery,
  useLazyGetPromptTemplatePricingQuery,
} = promptTemplateApi;