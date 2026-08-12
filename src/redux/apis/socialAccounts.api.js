import { apiSlice } from '../backendApiSlice/apiSlice'

export const SocialAccounts = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSocialAccount: builder.query({
      query: () => '/api/social-accounts/get-all-accounts',
      providesTags: ['SocialAccount'],
    }),

    validateTokens: builder.mutation({
      query: (body) => ({
        url: '/api/social-accounts/validate-tokens',
        method: 'POST',
        body,
      }),
      // Optionally invalidate tags if needed, but this is a validation check.
    }),

    createAllTextPosts: builder.mutation({
      query: (body) => ({
        url: '/api/social-accounts/create-text',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialAccount'],
    }),

    getAllTextPosts: builder.query({
      query: (params = {}) => ({
        url: '/api/social-accounts/all-text',
        params,
      }),
      providesTags: ['SocialAccount'],
    }),

    deleteSimpleTextPost: builder.mutation({
      query: (id) => ({
        url: `/api/social-accounts/text-post/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialAccount'],
    }),

    permanentlyDeleteSimpleTextPost: builder.mutation({
      query: (id) => ({
        url: `/api/social-accounts/text-post/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialAccount'],
    }),

    restoreSimpleTextPost: builder.mutation({
      query: (id) => ({
        url: `/api/social-accounts/text-post/${id}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SocialAccount'],
    }),

    updateSimpleTextPost: builder.mutation({
      query: ({ id, caption }) => ({
        url: `/api/post/simple-text/${id}`,
        method: 'PATCH',
        body: { caption },
      }),
      invalidatesTags: ['SocialAccount', 'SocialPost'],
    }),

    disconnectSocialAccount: builder.mutation({
      query: ({ platform, connectionId }) => ({
        url: `/api/social-accounts/${platform}/${connectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialAccount'],
    }),

    postToLinkedIn: builder.mutation({
      query: (body) => ({
        url: '/api/linkedin/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),

    postToYoutube: builder.mutation({
      query: (body) => ({
        url: '/api/youtube/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),

    postToInstagram: builder.mutation({
      query: (body) => ({
        url: '/api/instagram/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),

    postInstagramStory: builder.mutation({
      query: (body) => ({
        url: '/api/instagram/stories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'SocialPost',
        'Credits',
        'CreditLogs',
        'InstagramAnalytics',
      ],
    }),
    postFacebookStory: builder.mutation({
      query: (body) => ({
        url: '/api/facebook/postStories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        'SocialPost',
        'Credits',
        'CreditLogs',
        'FacebookAnalytics',
      ],
    }),

    postToFacebook: builder.mutation({
      query: (body) => ({
        url: '/api/facebook/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),

    postToTwitter: builder.mutation({
      query: (body) => ({
        url: '/api/twitter/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),
    postToPinterest: builder.mutation({
      query: (body) => ({
        url: '/api/pinterest/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),
    
    postToThreads: builder.mutation({
      query: (body) => ({
        url: '/api/threads/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost', 'Credits', 'CreditLogs'],
    }),

    manualConnectPinterest: builder.mutation({
      query: () => ({
        url: '/api/pinterest/manual-connect',
        method: 'GET',
      }),
      invalidatesTags: ['SocialAccount'],
    }),

    getPostCreated: builder.query({
      query: (params) => ({
                url: '/api/post',
                params,
            }),
      providesTags: ['SocialPost'],
    }),

    getTextPosts: builder.query({
      query: (params) => ({
        url: '/api/post',
        params: { ...params, isText: 'true' },
      }),
      providesTags: ['SocialPost'],
    }),

    getStories: builder.query({
      query: (params) => ({
        url: '/api/post',
        params: { ...params, isStory: 'true' },
      }),
      providesTags: ['SocialPost'],
    }),

    createPost: builder.mutation({
      query: (body) => ({
        url: '/api/post',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost'],
    }),

    updatePost: builder.mutation({
      query: ({ postId, body }) => ({
        url: `/api/post/${postId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent', 'Plans'],
    }),

    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/${postId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    permanentlyDeletePost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/${postId}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    restorePost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/${postId}/restore`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    archivePost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/${postId}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    unarchivePost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/${postId}/unarchive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    archiveSimpleTextPost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/simple-text/${postId}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    unarchiveSimpleTextPost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/simple-text/${postId}/unarchive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['SocialPost', 'PersonalEvent'],
    }),

    saveDraftPost: builder.mutation({
      query: (body) => ({
        url: '/api/post/draft',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost'],
    }),

    createTextPost: builder.mutation({
      query: (body) => ({
        url: '/api/post/text',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost'],
    }),

    saveDraftTextPost: builder.mutation({
      query: (body) => ({
        url: '/api/post/text/draft',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SocialPost'],
    }),

        // ── Facebook Analytics ──────────────────────────────────────
        getFacebookAnalytics: builder.query({
            query: (params = {}) => ({
                url: '/api/facebook/analytics',
                params,
            }),
            providesTags: ['FacebookAnalytics'],
        }),
        generateFacebookCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/facebook/comments/generate-reply',
                method: 'POST',
                body,
            }),
        }),
        postFacebookCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/facebook/comments/post-reply',
                method: 'POST',
                body,
            }),
        }),
        deleteFacebookPost: builder.mutation({
            query: ({ id, accountId }) => ({
                url: `/api/facebook/post/${id}`,
                method: 'DELETE',
                params: { accountId }
            }),
            invalidatesTags: ['FacebookAnalytics'],
        }),

    // ── Instagram Analytics ─────────────────────────────────────

    getYoutubeConnectUrl: builder.query({
      query: () => '/api/youtube/connect',
    }),

    getInstagramAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/api/instagram/analytics',
        params,
      }),
      providesTags: ['InstagramAnalytics'],
      keepUnusedDataFor: 1800,
    }),

    refreshInstagramAnalytics: builder.mutation({
      query: (params = {}) => ({
        url: '/api/instagram/analytics/refresh',
        method: 'POST',
        params,
      }),
      invalidatesTags: ['InstagramAnalytics'],
    }),

    // 📖 NEW: Get active stories
    getInstagramStories: builder.query({
      query: () => '/api/instagram/stories',
      providesTags: ['InstagramStories'],
    }),

    // 📖 NEW: Get story insights
    getStoryInsights: builder.query({
      query: (storyId) => `/api/instagram/stories/${storyId}/insights`,
      providesTags: ['InstagramStories'],
    }),

    generateInstagramCommentReply: builder.mutation({
      query: (body) => ({
        url: '/api/instagram/comments/generate-reply',
        method: 'POST',
        body,
      }),
    }),

        postInstagramCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/instagram/comments/post-reply',
                method: 'POST',
                body,
            }),
        }),
        likeInstagramComment: builder.mutation({
            query: (commentId) => ({
                url: `/api/instagram/comments/${commentId}/like`,
                method: 'POST',
            }),
        }),
        unlikeInstagramComment: builder.mutation({
            query: (commentId) => ({
                url: `/api/instagram/comments/${commentId}/like`,
                method: 'DELETE',
            }),
        }),
        getYoutubeAnalytics: builder.query({
            query: (params = {}) => ({
                url: '/api/youtube/analytics',
                params,
            }),
            providesTags: ['YoutubeAnalytics'],
            keepUnusedDataFor: 1800,
        }),
        refreshYoutubeAnalytics: builder.mutation({
            query: (params = {}) => ({
                url: '/api/youtube/analytics',
                method: 'GET',
                params: { ...params, refresh: true },
            }),
            invalidatesTags: ['YoutubeAnalytics'],
        }),
        generateYoutubeCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/comments/generate-reply',
                method: 'POST',
                body,
            }),
        }),
        postYoutubeCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/comments/post-reply',
                method: 'POST',
                body,
            }),
        }),
        postYoutubeVideoComment: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/comments/post-comment',
                method: 'POST',
                body,
            }),
        }),
        updateYoutubeVideo: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/video',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['YoutubeAnalytics'],
        }),
        deleteYoutubeVideo: builder.mutation({
            query: ({ videoId, accountId }) => ({
                url: `/api/youtube/video`,
                method: 'DELETE',
                params: { videoId, accountId },
            }),
            invalidatesTags: ['YoutubeAnalytics'],
        }),
        updateYoutubeVideoThumbnail: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/video/thumbnail',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['YoutubeAnalytics'],
        }),
        createYoutubePlaylist: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/playlists',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['YoutubePlaylists']
        }),
        updateYoutubePlaylist: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/playlists',
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['YoutubePlaylists']
        }),
        deleteYoutubePlaylist: builder.mutation({
            query: ({ accountId, playlistId }) => ({
                url: `/api/youtube/playlists?accountId=${accountId}&playlistId=${playlistId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['YoutubePlaylists']
        }),
        getYoutubePlaylists: builder.query({
            query: (accountId) => ({
                url: `/api/youtube/playlists?accountId=${accountId}`,
            }),
            providesTags: ['YoutubePlaylists'],
            keepUnusedDataFor: 0,
        }),
        getYoutubeCategories: builder.query({
            query: (accountId) => ({
                url: `/api/youtube/categories?accountId=${accountId}`,
            }),
            providesTags: ['YoutubeCategories'],
        }),
        addVideoToYoutubePlaylist: builder.mutation({
            query: (body) => ({
                url: '/api/youtube/playlists/items',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['YoutubePlaylists'],
        }),
        removeVideoFromYoutubePlaylist: builder.mutation({
            query: ({ accountId, playlistId, videoId }) => ({
                url: `/api/youtube/playlists/items?accountId=${accountId}&playlistId=${playlistId}&videoId=${videoId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['YoutubePlaylists'],
        }),
        getVideoPlaylists: builder.query({
            query: ({ accountId, videoId }) => ({
                url: `/api/youtube/playlists/video-presence?accountId=${accountId}&videoId=${videoId}`,
            }),
            providesTags: ['YoutubePlaylists'],
        }),
        getTwitterAnalytics: builder.query({
            query: (params = {}) => ({
                url: '/api/twitter/analytics',
                params,
            }),
            providesTags: ['TwitterAnalytics'],
        }),
        refreshTwitterAnalytics: builder.mutation({
            query: (params = {}) => ({
                url: '/api/twitter/analytics',
                method: 'GET',
                params: { ...params, refresh: true, _ts: Date.now() },
            }),
            async onQueryStarted(params = {}, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        SocialAccounts.util.updateQueryData(
                            'getTwitterAnalytics',
                            { days: params.days, accountId: params.accountId },
                            () => data,
                        ),
                    );
                } catch {
                    // The component handles mutation errors.
                }
            },
            invalidatesTags: ['Credits', 'CreditLogs'],
        }),
        generateTwitterCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/twitter/comments/generate-reply',
                method: 'POST',
                body,
            }),
        }),
        postTwitterReply: builder.mutation({
            query: (body) => ({
                url: '/api/twitter/reply',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Credits', 'CreditLogs'],
        }),
        deleteTwitterPost: builder.mutation({
            query: ({ accountId, tweetId }) => ({
                url: `/api/twitter/post/${tweetId}`,
                method: 'DELETE',
                body: { accountId },
            }),
            invalidatesTags: ['TwitterAnalytics', 'Credits', 'CreditLogs'],
        }),
        getThreadsAnalytics: builder.query({
            query: (params = {}) => ({
                url: '/api/threads/analytics',
                params,
            }),
            providesTags: ['ThreadsAnalytics'],
        }),
        refreshThreadsAnalytics: builder.mutation({
            query: (params = {}) => ({
                url: '/api/threads/analytics',
                method: 'GET',
                params: { ...params, refresh: true, _ts: Date.now() },
            }),
            async onQueryStarted(params = {}, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(
                        SocialAccounts.util.updateQueryData(
                            'getThreadsAnalytics',
                            { days: params.days, accountId: params.accountId },
                            () => data,
                        ),
                    );
                } catch {
                    // The component handles mutation errors.
                }
            },
            invalidatesTags: ['Credits', 'CreditLogs'],
        }),
        postThreadsReply: builder.mutation({
            query: (body) => ({
                url: '/api/threads/reply',
                method: 'POST',
                body,
            }),
        }),
        deleteThreadsPost: builder.mutation({
            query: ({ accountId, postId }) => ({
                url: `/api/threads/post/${postId}`,
                method: 'DELETE',
                body: { accountId },
            }),
            invalidatesTags: ['ThreadsAnalytics'],
        }),
        getLinkedinAnalytics: builder.query({
            query: (params = {}) => ({
                url: '/api/linkedin/analytics',
                params,
            }),
            providesTags: ['LinkedinAnalytics'],
            keepUnusedDataFor: 1800,
        }),
        getLinkedinConnectUrl: builder.query({
            query: () => '/api/linkedin/connect',
        }),
        refreshLinkedinAnalytics: builder.mutation({
            query: (params = {}) => ({
                url: '/api/linkedin/analytics',
                method: 'GET',
                params: { ...params, refresh: true },
            }),
            invalidatesTags: ['LinkedinAnalytics'],
        }),
        generateLinkedinCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/linkedin/comments/generate-reply',
                method: 'POST',
                body,
            }),
        }),
        postLinkedinCommentReply: builder.mutation({
            query: (body) => ({
                url: '/api/linkedin/comments/post-reply',
                method: 'POST',
                body,
            }),
        }),
        deleteLinkedinPost: builder.mutation({
            query: ({ accountId, postId }) => ({
                url: `/api/linkedin/post/${postId}`,
                method: 'DELETE',
                body: { accountId },
            }),
            invalidatesTags: ['LinkedinAnalytics', 'SocialPost', 'Credits', 'CreditLogs'],
        }),

    // ── Pinterest Analytics ─────────────────────────────────────
    getPinterestAnalytics: builder.query({
      query: (accountId) => `/api/pinterest/analytics?accountId=${accountId}`,
      providesTags: ['PinterestAnalytics'],
    }),

    deletePinterestPin: builder.mutation({
      query: ({ accountId, pinId }) => ({
        url: `/api/pinterest/pin/${accountId}/${pinId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PinterestAnalytics'],
    }),

    getPinterestBoards: builder.query({
      query: (accountId) => `/api/pinterest/boards?accountId=${accountId}`,
      providesTags: ['PinterestBoards'],
    }),

    createPinterestBoard: builder.mutation({
      query: (data) => ({
        url: `/api/pinterest/boards`,
        method: 'POST',
        body: data, // { accountId, name, description, privacy }
      }),
      invalidatesTags: ['PinterestBoards'],
    }),

    deletePinterestBoard: builder.mutation({
      query: ({ accountId, boardId }) => ({
        url: `/api/pinterest/boards/${accountId}/${boardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PinterestBoards'],
    }),

    updatePinterestBoard: builder.mutation({
      query: (data) => ({
        url: `/api/pinterest/boards`,
        method: 'PATCH',
        body: data, // { accountId, boardId, name, description, privacy }
      }),
      invalidatesTags: ['PinterestBoards'],
    }),

    // ── Social Post PDF Report ───────────────────────────────────
    generateSocialPostPDFReport: builder.query({
      query: ({ reportType, dateFrom, dateTo, platform, accounts, status }) => ({
        url: `/api/post/report/pdf`,
        params: { reportType, dateFrom, dateTo, platform, accounts, status },
        responseHandler: async (response) => {
          if (!response.ok) {
            const errText = await response.text()
            throw new Error(errText || 'Failed to generate PDF')
          }
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          const today = new Date().toISOString().split('T')[0]
          a.href = url
          a.download = `borade-ai-social-report-${today}.pdf`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          return { success: true }
        },
        cache: 'no-cache',
      }),
    }),
    exchangeFacebookCode: builder.mutation({
      query: (body) => ({
        url: '/api/auth/facebook/exchange',
        method: 'POST',
        body,
      }),
    }),
    getPinterestBoards: builder.query({
      query: (accountId) => `/api/pinterest/boards?accountId=${accountId}`,
    }),
    getFacebookConnectUrl: builder.query({
      query: () => '/api/facebook/connect',
    }),
    getInstagramConnectUrl: builder.query({
      query: () => '/api/instagram/connect',
    }),
    getLinkedinConnectUrl: builder.query({
      query: () => '/api/linkedin/connect',
    }),
    getYoutubeConnectUrl: builder.query({
      query: () => '/api/youtube/connect',
    }),
    getTwitterConnectUrl: builder.query({
      query: () => '/api/twitter/connect',
    }),
    getThreadsConnectUrl: builder.query({
      query: (isMobile) => `/api/threads/connect?isMobile=${isMobile}`,
    }),
    getPinterestConnectUrl: builder.query({
      query: () => '/api/pinterest/connect',
    }),
  }),
})

export const {
  useCreateAllTextPostsMutation,
  useGetAllTextPostsQuery,
  useDeleteSimpleTextPostMutation,
  usePermanentlyDeleteSimpleTextPostMutation,
  useRestoreSimpleTextPostMutation,
  useUpdateSimpleTextPostMutation,
  useArchiveSimpleTextPostMutation,
  useUnarchiveSimpleTextPostMutation,
  useGetSocialAccountQuery,
  useValidateTokensMutation,
  useDisconnectSocialAccountMutation,
  usePostToLinkedInMutation,
  usePostToYoutubeMutation,
  usePostToInstagramMutation,
  usePostInstagramStoryMutation,
  usePostFacebookStoryMutation,
  usePostToFacebookMutation,
  usePostToTwitterMutation,
  usePostToPinterestMutation,
  usePostToThreadsMutation,
  useManualConnectPinterestMutation,
  useGetPostCreatedQuery,
  useGetTextPostsQuery,
  useGetStoriesQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  usePermanentlyDeletePostMutation,
  useRestorePostMutation,
  useArchivePostMutation,
  useUnarchivePostMutation,
  useSaveDraftPostMutation,
  useCreateTextPostMutation,
  useSaveDraftTextPostMutation,
  useGetFacebookAnalyticsQuery,
  useGenerateFacebookCommentReplyMutation,
  usePostFacebookCommentReplyMutation,
    useDeleteFacebookPostMutation,
  useGetInstagramAnalyticsQuery,
  useRefreshInstagramAnalyticsMutation,
  useGetInstagramStoriesQuery,
  useGetStoryInsightsQuery,
  useGenerateInstagramCommentReplyMutation,
  usePostInstagramCommentReplyMutation,
  useLikeInstagramCommentMutation,
  useUnlikeInstagramCommentMutation,
  useGetPinterestAnalyticsQuery,
  useDeletePinterestPinMutation,
  useGetPinterestBoardsQuery,
  useCreatePinterestBoardMutation,
  useDeletePinterestBoardMutation,
  useUpdatePinterestBoardMutation,
  useGetYoutubeAnalyticsQuery,
  useRefreshYoutubeAnalyticsMutation,
  useGenerateYoutubeCommentReplyMutation,
  usePostYoutubeCommentReplyMutation,
  usePostYoutubeVideoCommentMutation,
  useUpdateYoutubeVideoMutation,
  useUpdateYoutubeVideoThumbnailMutation,
    useDeleteYoutubeVideoMutation,
  useCreateYoutubePlaylistMutation,
  useUpdateYoutubePlaylistMutation,
  useDeleteYoutubePlaylistMutation,
  useGetYoutubePlaylistsQuery,
  useGetYoutubeCategoriesQuery,
  useAddVideoToYoutubePlaylistMutation,
  useRemoveVideoFromYoutubePlaylistMutation,
  useGetVideoPlaylistsQuery,
  useGetTwitterAnalyticsQuery,
  useRefreshTwitterAnalyticsMutation,
  useGenerateTwitterCommentReplyMutation,
  usePostTwitterReplyMutation,
  useDeleteTwitterPostMutation,
  useGetThreadsAnalyticsQuery,
  useRefreshThreadsAnalyticsMutation,
  usePostThreadsReplyMutation,
  useDeleteThreadsPostMutation,
  useGetLinkedinAnalyticsQuery,
  useRefreshLinkedinAnalyticsMutation,
  useGenerateLinkedinCommentReplyMutation,
  usePostLinkedinCommentReplyMutation,
  useDeleteLinkedinPostMutation,
  useLazyGetLinkedinConnectUrlQuery,
  useLazyGetYoutubeConnectUrlQuery,
  useLazyGetFacebookConnectUrlQuery,
  useLazyGetInstagramConnectUrlQuery,
  useLazyGetTwitterConnectUrlQuery,
  useLazyGetThreadsConnectUrlQuery,
  useLazyGetPinterestConnectUrlQuery,
  useLazyGenerateSocialPostPDFReportQuery,
  useExchangeFacebookCodeMutation,
  useLazyGetPinterestBoardsQuery,
} = SocialAccounts
