import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const promptApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    validatePrompt: builder.mutation({
      query: (prompt) => ({
        url: "/api/prompts/validate-prompt",
        method: "POST",
        body: { prompt },
      }),
    }),

    enhancePrompt: builder.mutation({
      query: (payload) => ({
        url: "/api/prompts/enhance",
        method: "POST",
        body: payload,
      }),
    }),
    uploadAiCaption: builder.mutation({
      query: (formData) => ({
        url: '/api/media/upload/ai-caption',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
});

export const {
  useValidatePromptMutation,
  useEnhancePromptMutation,
  useUploadAiCaptionMutation,
} = promptApi;