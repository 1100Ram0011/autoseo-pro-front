import { apiSlice } from "../backendApiSlice/apiSlice";

export const aiMasterApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Providers
    getProviders: builder.query({
      query: () => "/api/admin/ai-master/providers",
      providesTags: ["AiProviders"],
    }),
    createProvider: builder.mutation({
      query: (data) => ({
        url: "/api/admin/ai-master/providers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AiProviders"],
    }),
    updateProvider: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/ai-master/providers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AiProviders"],
    }),
    deleteProvider: builder.mutation({
      query: (id) => ({
        url: `/api/admin/ai-master/providers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AiProviders"],
    }),

    // Models
    getModels: builder.query({
      query: () => "/api/admin/ai-master/models",
      providesTags: ["AiModels"],
    }),
    createModel: builder.mutation({
      query: (data) => ({
        url: "/api/admin/ai-master/models",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AiModels", "AiProviders"],
    }),
    updateModel: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/ai-master/models/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AiModels", "AiProviders"],
    }),
    deleteModel: builder.mutation({
      query: (id) => ({
        url: `/api/admin/ai-master/models/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AiModels", "AiProviders"],
    }),

    // Endpoints
    getEndpoints: builder.query({
      query: () => "/api/admin/ai-master/endpoints",
      providesTags: ["AiEndpoints"],
    }),
    createEndpoint: builder.mutation({
      query: (data) => ({
        url: "/api/admin/ai-master/endpoints",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AiEndpoints", "AiProviders"],
    }),
    updateEndpoint: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/ai-master/endpoints/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AiEndpoints", "AiProviders"],
    }),
    deleteEndpoint: builder.mutation({
      query: (id) => ({
        url: `/api/admin/ai-master/endpoints/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AiEndpoints", "AiProviders"],
    }),

    // Keys
    updateApiKey: builder.mutation({
      query: (data) => ({
        url: "/api/admin/ai-master/keys",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AiKeys"],
    }),
    getKeysStatus: builder.query({
      query: () => "/api/admin/ai-master/keys/status",
      providesTags: ["AiKeys"],
    }),

    // System Prompts
    getSystemPrompts: builder.query({
      query: () => "/api/admin/ai-master/system-prompts",
      providesTags: ["AiSystemPrompts"],
    }),
    createSystemPrompt: builder.mutation({
      query: (data) => ({
        url: "/api/admin/ai-master/system-prompts",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AiSystemPrompts"],
    }),
    updateSystemPrompt: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/admin/ai-master/system-prompts/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AiSystemPrompts"],
    }),
    deleteSystemPrompt: builder.mutation({
      query: (id) => ({
        url: `/api/admin/ai-master/system-prompts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AiSystemPrompts"],
    }),
    
    // Audit Logs
    getProviderLogs: builder.query({
      query: () => "/api/admin/ai-master/logs",
      providesTags: ["AiProviderLogs"],
    }),

    // AI Execution Error Logs & Predefined Error Codes Catalog
    getAiErrorLogs: builder.query({
      query: (params) => ({
        url: "/api/admin/ai-master/error-logs",
        params,
      }),
      providesTags: ["AiErrorLogs"],
    }),
    getAiErrorCodesCatalog: builder.query({
      query: () => "/api/admin/ai-master/error-codes",
      providesTags: ["AiErrorCodes"],
    }),
    clearAiErrorLogs: builder.mutation({
      query: () => ({
        url: "/api/admin/ai-master/error-logs",
        method: "DELETE",
      }),
      invalidatesTags: ["AiErrorLogs"],
    }),
    
    // Remote Execution Gateway
    executeAiTask: builder.mutation({
      query: (data) => ({
        url: "/api/ai/gateway/execute",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetProvidersQuery,
  useCreateProviderMutation,
  useUpdateProviderMutation,
  useDeleteProviderMutation,
  useGetModelsQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useGetEndpointsQuery,
  useCreateEndpointMutation,
  useUpdateEndpointMutation,
  useDeleteEndpointMutation,
  useUpdateApiKeyMutation,
  useGetKeysStatusQuery,
  useGetSystemPromptsQuery,
  useCreateSystemPromptMutation,
  useUpdateSystemPromptMutation,
  useDeleteSystemPromptMutation,
  useGetProviderLogsQuery,
  useGetAiErrorLogsQuery,
  useGetAiErrorCodesCatalogQuery,
  useClearAiErrorLogsMutation,
  useExecuteAiTaskMutation,
} = aiMasterApi;
