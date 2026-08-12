import { apiSlice } from '../backendApiSlice/apiSlice'

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => '/api/chat/',
      providesTags: ['Chats'],
    }),
    getChat: builder.query({
      query: (id) => `/api/chat/${id}`,
      providesTags: (result, error, id) => [{ type: 'Chat', id }],
    }),
    createChat: builder.mutation({
      query: (data) => ({
        url: '/api/chat/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Chats'],
    }),
    deleteChat: builder.mutation({
      query: (id) => ({
        url: `/api/chat/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Chats'],
    }),
    sendMessage: builder.mutation({
      query: ({ chatId, formData }) => ({
        url: `/api/chat/${chatId}/messages`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Chats', 'Messages', 'Credits', 'CreditLogs'],
    }),
    getMessages: builder.query({
      query: (chatId) => `/api/chat/${chatId}/messages`,
      providesTags: ['Messages'],
    }),
    getMessageStatus: builder.query({
      query: (messageId) => `/api/chat/messages/${messageId}/status`,
      providesTags: ['Chats'],
    }),
    getImagesLibrary: builder.query({
      query: () => '/api/media/images',
      providesTags: ['Chats', 'MediaImages'],
      // transformResponse: (response) => response.data,
    }),
    getDeletedImagesLibrary: builder.query({
      query: () => '/api/media/images/deleted',
      providesTags: ['Chats', 'MediaImagesDeleted'],
    }),

    getVideosLibrary: builder.query({
      query: () => '/api/media/videos',
      providesTags: ['Chats', 'MediaVideos'],
      // transformResponse: (response) => response.data,
    }),
    getStoriesLibrary: builder.query({
      query: () => '/api/media/stories',
      providesTags: ['Chats', 'MediaStories'],
    }),
    getDeletedVideosLibrary: builder.query({
      query: () => '/api/media/videos/deleted',
      providesTags: ['Chats', 'MediaVideosDeleted'],
    }),
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/api/media/upload/image',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Chats', 'MediaImages'],
    }),
    uploadVideo: builder.mutation({
      query: (formData) => ({
        url: '/api/media/upload/video',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Chats', 'MediaVideos'],
    }),
    uploadChatImage: builder.mutation({
      query: (formData) => ({
        url: '/api/chat/upload-image',
        method: 'POST',
        body: formData,
      }),
    }),
    uploadChatVideo: builder.mutation({
      query: (formData) => ({
        url: '/api/chat/upload-video',
        method: 'POST',
        body: formData,
      }),
    }),
    getAiOverlaySuggestions: builder.mutation({
      query: (formData) => ({
        url: '/api/media/upload/ai-overlay-suggestions',
        method: 'POST',
        body: formData,
      }),
    }),
    approveMessage: builder.mutation({
      query: ({ messageId, params }) => ({
        url: `/api/chat/messages/${messageId}/approve`,
        method: 'POST',
        body: { params },
      }),
      invalidatesTags: ['Chats', 'Messages', 'Credits', 'CreditLogs'],
    }),
    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/api/media/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'MediaImages',
        'MediaVideos',
        'MediaWebsite',
        'MediaImagesDeleted',
        'MediaVideosDeleted',
      ],
    }),
    restoreMedia: builder.mutation({
      query: (id) => ({
        url: `/api/media/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: [
        'MediaImages',
        'MediaVideos',
        'MediaWebsite',
        'MediaImagesDeleted',
        'MediaVideosDeleted',
        'MediaArchived',
      ],
    }),
    permanentlyDeleteMedia: builder.mutation({
      query: (id) => ({
        url: `/api/media/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'MediaImages',
        'MediaVideos',
        'MediaWebsite',
        'MediaImagesDeleted',
        'MediaVideosDeleted',
        'MediaArchived',
      ],
    }),
    updateMediaMeta: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/media/${id}/meta`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        'MediaImages',
        'MediaVideos',
        'MediaWebsite',
        'MediaArchived',
      ],
    }),

    archiveMedia: builder.mutation({
      query: (id) => ({
        url: `/api/media/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['MediaImages', 'MediaVideos', 'MediaArchived'],
    }),

    unarchiveMedia: builder.mutation({
      query: (id) => ({
        url: `/api/media/${id}/unarchive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['MediaImages', 'MediaVideos', 'MediaArchived'],
    }),

    getArchivedMedia: builder.query({
      query: () => '/api/media/archived',
      providesTags: ['MediaArchived'],
    }),

    getVideoProgress: builder.query({
      query: () => `/api/media/progress`,
    }),

    getMediaByWebsite: builder.query({
      query: () => 'api/media/getMediaByWebsite',
      providesTags: ['MediaWebsite'],
    }),

    generatePlatformCaptions: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/generate-platform-captions',
        method: 'POST',
        body,
      }),
    }),

    generateSocialPostCaptions: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/generate-social-post-captions',
        method: 'POST',
        body,
      }),
    }),

    generateTextSocialPostCaptions: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/generate-text-social-post-captions',
        method: 'POST',
        body,
      }),
    }),

    saveManualCaptions: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/save-manual-captions',
        method: 'POST',
        body,
      }),
    }),

    estimateCaptionCost: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/estimate-caption-cost',
        method: 'POST',
        body,
      }),
    }),

    renderAiOverlay: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/ai-overlay-render',
        method: 'POST',
        body,
      }),
    }),

    estimateOverlayCost: builder.mutation({
      query: (body) => ({
        url: '/api/media/upload/estimate-overlay-cost',
        method: 'POST',
        body: body || {},
      }),
    }),
    createShareLink: builder.mutation({
      query: (body) => ({
        url: '/api/share/create',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetChatsQuery,
  useGetChatQuery,
  useCreateChatMutation,
  useDeleteChatMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
  useGetMessageStatusQuery,
  useLazyGetMessageStatusQuery,
  useGetVideosLibraryQuery,
  useGetStoriesLibraryQuery,
  useGetImagesLibraryQuery,
  useGetDeletedImagesLibraryQuery,
  useGetDeletedVideosLibraryQuery,
  useUploadImageMutation,
  useUploadVideoMutation,
  useUploadChatImageMutation,
  useUploadChatVideoMutation,
  useGetAiOverlaySuggestionsMutation,
  useApproveMessageMutation,
  useDeleteMediaMutation,
  useRestoreMediaMutation,
  usePermanentlyDeleteMediaMutation,
  useUpdateMediaMetaMutation,
  useArchiveMediaMutation,
  useUnarchiveMediaMutation,
  useGetArchivedMediaQuery,
  useGetVideoProgressQuery,
  useGetMediaByWebsiteQuery,
  useGeneratePlatformCaptionsMutation,
  useGenerateSocialPostCaptionsMutation,
  useGenerateTextSocialPostCaptionsMutation,
  useSaveManualCaptionsMutation,
  useEstimateCaptionCostMutation,
  useRenderAiOverlayMutation,
  useEstimateOverlayCostMutation,
  useCreateShareLinkMutation,
} = chatApi
