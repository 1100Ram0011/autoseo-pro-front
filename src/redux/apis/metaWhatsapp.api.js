import { apiSlice } from '../backendApiSlice/apiSlice'

export const metaWhatsappApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────────────────
    // Logs (Message History)
    // ─────────────────────────────────────────────────────────────────────

    getLogs: builder.query({
      query: (params) => ({
        url: '/api/meta/whatsapp/logs',
        params,
      }),
      providesTags: ['MetaWhatsappLogs'],
    }),

    getLogStats: builder.query({
      query: (params) => ({
        url: '/api/meta/whatsapp/logs/stats',
        params,
      }),
      providesTags: ['MetaWhatsappLogs'],
    }),

    getLogById: builder.query({
      query: (id) => ({
        url: `/api/meta/whatsapp/logs/${id}`,
      }),
      providesTags: ['MetaWhatsappLogs'],
    }),

    exportLogs: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/logs/export',
        method: 'POST',
        body,
        responseHandler: (response) => response.blob(),
      }),
    }),

    getLogAnalytics: builder.query({
      query: (params) => ({
        url: '/api/meta/whatsapp/logs/analytics',
        params,
      }),
      providesTags: ['MetaWhatsappLogs'],
    }),

    syncLogAnalytics: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/logs/analytics/sync',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappLogs'],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Meta WhatsApp Connection
    // ─────────────────────────────────────────────────────────────────────

    MetaConnectEmbeddedWhatsapp: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/embedded/connect',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsapp'],
    }),

    testCreditLineId: builder.query({
      query: () => ({
        url: '/api/meta/whatsapp/test-credit-line',
        method: 'GET',
      }),
    }),

    connectWhatsapp: builder.mutation({
      query: (data) => ({
        url: '/api/meta/whatsapp/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MetaWhatsapp'],
    }),

    connectWhatsappold: builder.mutation({
      query: (data) => ({
        url: '/api/meta/whatsapp/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MetaWhatsapp'],
    }),

    getWhatsappNumber: builder.query({
      query: () => ({
        url: '/api/meta/whatsapp/connected-number',
      }),
      providesTags: ['MetaWhatsapp'],
    }),

    disconnectWhatsapp: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/connected-number/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MetaWhatsapp', 'MetaWhatsappNumbers'],
    }),

    syncNumberLimit: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/sync-limit/${id}`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsapp', 'MetaWhatsappNumbers'],
    }),

    getNumberSettings: builder.query({
      query: (phoneNumberId) => ({
        url: `/api/meta/whatsapp/settings/${phoneNumberId}`,
      }),
      providesTags: ['MetaWhatsappSettings'],
    }),

    updateNumberSettings: builder.mutation({
      query: ({ phoneNumberId, ...body }) => ({
        url: `/api/meta/whatsapp/settings/${phoneNumberId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['MetaWhatsappSettings'],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // WhatsApp Numbers (used by campaign create modal)
    // GET /api/meta/whatsapp/activation
    // ─────────────────────────────────────────────────────────────────────

    getNumbers: builder.query({
      query: () => ({
        url: '/api/meta/whatsapp/activation',
      }),
      providesTags: ['MetaWhatsappNumbers'],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // WhatsApp Templates
    // ─────────────────────────────────────────────────────────────────────

    getTemplates: builder.query({
      query: ({ numberId, ...params } = {}) => ({
        url: '/api/meta/whatsapp/template',
        params: { numberId, ...params },
      }),
      providesTags: ['MetaWhatsappTemplates'],
    }),

    getTemplateLibrary: builder.query({
      query: (params = {}) => ({
        url: '/api/meta/whatsapp/template-library',
        params,
      }),
      providesTags: ['MetaWhatsappTemplateLibrary'],
    }),

    getTemplate: builder.query({
      query: (id) => ({
        url: `/api/meta/whatsapp/template/${id}`,
      }),
      providesTags: (result, error, id) => [
        { type: 'MetaWhatsappTemplates', id },
      ],
    }),

    createTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/template',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappTemplates'],
    }),

    updateTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/meta/whatsapp/template/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['MetaWhatsappTemplates'],
    }),

    uploadMetaMedia: builder.mutation({
      query: (formData) => ({
        url: '/api/meta/whatsapp/template/upload-media',
        method: 'POST',
        body: formData,
      }),
    }),

    syncTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/template/${id}/sync`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappTemplates'],
    }),

    syncAllTemplates: builder.mutation({
      query: (numberId) => ({
        url: `/api/meta/whatsapp/template/sync-all/${numberId}`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappTemplates'],
    }),

    submitTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/template/${id}/submit`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappTemplates'],
    }),

    deleteTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/template/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MetaWhatsappTemplates'],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Campaigns
    // ─────────────────────────────────────────────────────────────────────

    getCampaigns: builder.query({
      query: (params = {}) => ({
        url: '/api/meta/whatsapp/campaigns',
        params,
      }),
      providesTags: ['MetaWhatsappCampaigns'],
    }),

    getCampaignById: builder.query({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}`,
      }),
      providesTags: (result, error, id) => [
        { type: 'MetaWhatsappCampaigns', id },
      ],
    }),

    createCampaign: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/campaigns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappCampaigns'],
    }),

    estimateCampaignCost: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/campaigns/estimate',
        method: 'POST',
        body,
      }),
    }),

    launchCampaign: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}/launch`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappCampaigns'],
    }),

    pauseCampaign: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappCampaigns'],
    }),

    resumeCampaign: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappCampaigns'],
    }),

    cancelCampaign: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappCampaigns'],
    }),

    deleteCampaign: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MetaWhatsappCampaigns'],
    }),

    getCampaignStats: builder.query({
      query: (id) => ({
        url: `/api/meta/whatsapp/campaigns/${id}/stats`,
      }),
      providesTags: (result, error, id) => [
        { type: 'MetaWhatsappCampaigns', id },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Contacts
    // ─────────────────────────────────────────────────────────────────────

    getContacts: builder.query({
      query: () => ({
        url: '/api/meta/whatsapp/contact',
      }),
      providesTags: ['MetaWhatsappContacts'],
    }),

    createContact: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/contact',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappContacts'],
    }),

    bulkImport: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/contact/bulk-import',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappContacts'],
    }),

    updateContact: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/meta/whatsapp/contact/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['MetaWhatsappContacts'],
    }),

    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/contact/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MetaWhatsappContacts'],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Contact Lists
    // ─────────────────────────────────────────────────────────────────────

    getContactLists: builder.query({
      query: () => ({
        url: '/api/meta/whatsapp/contact-list',
      }),
      providesTags: ['MetaWhatsappContactLists'],
    }),

    createContactList: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/contact-list',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappContactLists'],
    }),

    addToList: builder.mutation({
      query: ({ id, contactIds }) => ({
        url: `/api/meta/whatsapp/contact-list/${id}/contacts/add`,
        method: 'POST',
        body: { contactIds },
      }),
      invalidatesTags: ['MetaWhatsappContactLists'],
    }),

    removeFromList: builder.mutation({
      query: ({ id, contactIds }) => ({
        url: `/api/meta/whatsapp/contact-list/${id}/contacts/remove`,
        method: 'POST',
        body: { contactIds },
      }),
      invalidatesTags: ['MetaWhatsappContactLists'],
    }),

    deleteContactList: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/contact-list/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MetaWhatsappContactLists'],
    }),

    // ── 1. GET /whatsapp/logs ─────────────────────────────────────────────
    // useGetWhatsappLogsQuery({ numberId, page, search, direction, messageType, paymentStatus, dateFrom, dateTo })
    getWhatsappLogs: builder.query({
      query: ({
        numberId = '',
        page = 1,
        search = '',
        direction = '',
        messageType = '',
        paymentStatus = '',
        dateFrom = '',
        dateTo = '',
      } = {}) => ({
        url: '/whatsapp/logs',
        method: 'GET',
        params: {
          ...(numberId && { numberId }),
          ...(search && { search }),
          ...(direction && { direction }),
          ...(messageType && { messageType }),
          ...(paymentStatus && { paymentStatus }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
          page,
        },
      }),
      // Response: { data: Log[], total: number, page: number, pageSize: number }
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: 'WhatsappLogs',
                id: _id,
              })),
              { type: 'WhatsappLogs', id: 'LIST' },
            ]
          : [{ type: 'WhatsappLogs', id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),

    // ── 3. POST /whatsapp/logs/export ─────────────────────────────────────
    // useExportWhatsappLogsMutation()
    exportWhatsappLogs: builder.mutation({
      query: ({
        numberId = '',
        search = '',
        direction = '',
        messageType = '',
        paymentStatus = '',
        dateFrom = '',
        dateTo = '',
      } = {}) => ({
        url: '/whatsapp/logs/export',
        method: 'POST',
        body: {
          ...(numberId && { numberId }),
          ...(search && { search }),
          ...(direction && { direction }),
          ...(messageType && { messageType }),
          ...(paymentStatus && { paymentStatus }),
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo }),
        },
        // Handles both: streamed CSV blob and JSON { url: "..." }
        responseHandler: async (response) => {
          const contentType = response.headers.get('content-type') || ''

          if (contentType.includes('application/json')) {
            const json = await response.json()
            // If backend returns a signed URL
            if (json?.url) {
              const a = document.createElement('a')
              a.href = json.url
              a.download = `whatsapp-logs-${new Date().toISOString().slice(0, 10)}.csv`
              a.click()
            }
            return json
          }

          // Backend streams CSV directly
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `whatsapp-logs-${new Date().toISOString().slice(0, 10)}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          return { success: true }
        },
      }),
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Business Profile
    // ─────────────────────────────────────────────────────────────────────
    getBusinessProfile: builder.query({
      query: (phoneNumberId) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/business-profile`,
        method: 'GET',
      }),
      providesTags: (result, error, phoneNumberId) => [
        { type: 'MetaBusinessProfile', id: phoneNumberId },
      ],
    }),

    updateBusinessProfile: builder.mutation({
      query: ({ phoneNumberId, payload }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/business-profile`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaBusinessProfile', id: phoneNumberId },
      ],
    }),

    uploadBusinessProfilePhoto: builder.mutation({
      query: ({ phoneNumberId, formData }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/business-profile/photo`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaBusinessProfile', id: phoneNumberId },
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Conversational Automation (Ice Breakers & Commands)
    // ─────────────────────────────────────────────────────────────────────
    getConversationalAutomation: builder.query({
      query: (phoneNumberId) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/conversational-automation`,
        method: 'GET',
      }),
      providesTags: (result, error, phoneNumberId) => [
        { type: 'MetaConversationalAutomation', id: phoneNumberId },
      ],
    }),

    updateConversationalAutomation: builder.mutation({
      query: ({ phoneNumberId, payload }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/conversational-automation`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaConversationalAutomation', id: phoneNumberId },
        'MetaWhatsapp',
      ],
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Interactive Messages (Quick Replies & List Menus)
    // ─────────────────────────────────────────────────────────────────────
    getInteractiveMessages: builder.query({
      query: (phoneNumberId) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/interactive`,
        method: 'GET',
      }),
      providesTags: (result, error, phoneNumberId) => [
        { type: 'MetaWhatsappInteractive', id: phoneNumberId },
      ],
    }),

    createInteractiveMessage: builder.mutation({
      query: ({ phoneNumberId, ...body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/interactive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappInteractive', id: phoneNumberId },
      ],
    }),

    deleteInteractiveMessage: builder.mutation({
      query: ({ phoneNumberId, id }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/interactive/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappInteractive', id: phoneNumberId },
      ],
    }),

    updateInteractiveMessage: builder.mutation({
      query: ({ phoneNumberId, id, ...body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/interactive/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappInteractive', id: phoneNumberId },
      ],
    }),

    sendInteractiveMessage: builder.mutation({
      query: ({ phoneNumberId, id, to }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/interactive/${id}/send`,
        method: 'POST',
        body: { to },
      }),
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Chatbot Flow Builder Rules
    // ─────────────────────────────────────────────────────────────────────
    // Chatbot Flow Builder Rules
    // ─────────────────────────────────────────────────────────────────────
    getChatbotFlows: builder.query({
      query: (arg) => {
        const phoneNumberId = typeof arg === 'string' ? arg : arg?.phoneNumberId;
        const flowId = typeof arg === 'object' ? arg?.flowId : undefined;
        return {
          url: `/api/meta/whatsapp/${phoneNumberId}/chatbot`,
          method: 'GET',
          params: flowId ? { flowId } : undefined
        };
      },
      providesTags: (result, error, arg) => {
        const phoneNumberId = typeof arg === 'string' ? arg : arg?.phoneNumberId;
        return [{ type: 'MetaWhatsappChatbot', id: phoneNumberId }];
      },
    }),

    createChatbotFlow: builder.mutation({
      query: ({ phoneNumberId, ...body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappChatbot', id: phoneNumberId },
      ],
    }),

    updateChatbotFlow: builder.mutation({
      query: ({ phoneNumberId, id, ...body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappChatbot', id: phoneNumberId },
      ],
    }),

    deleteChatbotFlow: builder.mutation({
      query: ({ phoneNumberId, id }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappChatbot', id: phoneNumberId },
      ],
    }),

    // Chatbot Flow Lists
    // ─────────────────────────────────────────────────────────────────────
    getChatbotFlowsList: builder.query({
      query: (phoneNumberId) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot-flows`,
        method: 'GET',
      }),
      providesTags: (result, error, phoneNumberId) => [
        { type: 'MetaWhatsappChatbotFlowList', id: phoneNumberId },
      ],
    }),

    createChatbotFlowList: builder.mutation({
      query: ({ phoneNumberId, ...body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot-flows`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappChatbotFlowList', id: phoneNumberId },
      ],
    }),

    updateChatbotFlowList: builder.mutation({
      query: ({ phoneNumberId, id, ...body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot-flows/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappChatbotFlowList', id: phoneNumberId },
        { type: 'MetaWhatsappChatbot', id: phoneNumberId }
      ],
    }),

    deleteChatbotFlowList: builder.mutation({
      query: ({ phoneNumberId, id }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot-flows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { phoneNumberId }) => [
        { type: 'MetaWhatsappChatbotFlowList', id: phoneNumberId },
        { type: 'MetaWhatsappChatbot', id: phoneNumberId }
      ],
    }),

    duplicateChatbotFlowList: builder.mutation({
      query: ({ phoneNumberId, id, targetPhoneNumberId }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId}/chatbot-flows/${id}/duplicate`,
        method: 'POST',
        body: { targetPhoneNumberId }
      }),
      invalidatesTags: (result, error, { phoneNumberId, targetPhoneNumberId }) => [
        { type: 'MetaWhatsappChatbotFlowList', id: phoneNumberId },
        ...(targetPhoneNumberId ? [{ type: 'MetaWhatsappChatbotFlowList', id: targetPhoneNumberId }] : [])
      ],
    }),

    testApiRequest: builder.mutation({
      query: ({ phoneNumberId, url, method, headers, params, body }) => ({
        url: `/api/meta/whatsapp/${phoneNumberId || 'default'}/chatbot-flows/test-api-request`,
        method: 'POST',
        body: { url, method, headers, params, body }
      })
    }),

    // ─────────────────────────────────────────────────────────────────────
    // Developer API Keys
    // ─────────────────────────────────────────────────────────────────────

    getApiKeys: builder.query({
      query: () => ({ url: '/api/meta/whatsapp/api-keys' }),
      providesTags: ['MetaWhatsappApiKeys'],
    }),

    generateApiKey: builder.mutation({
      query: (body) => ({
        url: '/api/meta/whatsapp/api-keys/generate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappApiKeys'],
    }),

    regenerateApiKey: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/meta/whatsapp/api-keys/${id}/regenerate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MetaWhatsappApiKeys'],
    }),

    revokeApiKey: builder.mutation({
      query: (id) => ({
        url: `/api/meta/whatsapp/api-keys/${id}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: ['MetaWhatsappApiKeys'],
    }),
  }),
})

export const {
  // Meta Connection
  useConnectWhatsappMutation,
  useGetWhatsappNumberQuery,
  useDisconnectWhatsappMutation,
  useSyncNumberLimitMutation,

  // Numbers
  useGetNumbersQuery,

  // Templates
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useGetTemplateLibraryQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useUploadMetaMediaMutation,
  useSubmitTemplateMutation,
  useSyncTemplateMutation,
  useSyncAllTemplatesMutation,
  useDeleteTemplateMutation,

  // Campaigns
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useLazyGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useEstimateCampaignCostMutation,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
  useResumeCampaignMutation,
  useCancelCampaignMutation,
  useDeleteCampaignMutation,
  useGetCampaignStatsQuery,

  // Contacts
  useGetContactsQuery,
  useCreateContactMutation,
  useBulkImportMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,

  // Contact Lists
  useGetContactListsQuery,
  useCreateContactListMutation,
  useAddToListMutation,
  useRemoveFromListMutation,
  useDeleteContactListMutation,
  useMetaConnectEmbeddedWhatsappMutation,

  useGetLogsQuery, // ← used in MetaWhatsappLogs
  useGetLogStatsQuery,
  useGetLogByIdQuery,
  useExportLogsMutation, // ← used in MetaWhatsappLogs filter modal
  useGetLogAnalyticsQuery,
  useSyncLogAnalyticsMutation,
  
  // Test Routes
  useLazyTestCreditLineIdQuery,

  // Business Profile
  useGetBusinessProfileQuery,
  useLazyGetBusinessProfileQuery,
  useUpdateBusinessProfileMutation,
  useUploadBusinessProfilePhotoMutation,

  // Conversational Automation
  useGetConversationalAutomationQuery,
  useUpdateConversationalAutomationMutation,

  // Interactive Messages
  useGetInteractiveMessagesQuery,
  useCreateInteractiveMessageMutation,
  useDeleteInteractiveMessageMutation,
  useSendInteractiveMessageMutation,
  useUpdateInteractiveMessageMutation,

  // Chatbot Flows
  useGetChatbotFlowsQuery,
  useCreateChatbotFlowMutation,
  useUpdateChatbotFlowMutation,
  useDeleteChatbotFlowMutation,

  // Chatbot Flows List
  useGetChatbotFlowsListQuery,
  useCreateChatbotFlowListMutation,
  useUpdateChatbotFlowListMutation,
  useDeleteChatbotFlowListMutation,
  useDuplicateChatbotFlowListMutation,
  useTestApiRequestMutation,

  // Settings
  useGetNumberSettingsQuery,
  useUpdateNumberSettingsMutation,

  // Developer API Keys
  useGetApiKeysQuery,
  useGenerateApiKeyMutation,
  useRegenerateApiKeyMutation,
  useRevokeApiKeyMutation,
} = metaWhatsappApi