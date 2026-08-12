import { apiSlice } from "../backendApiSlice/apiSlice";
import { promptTemplateApi } from "./AiStudio/promptTemplateApi";

export const feedsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // =====================================================
    // LIKE POST
    // =====================================================

    likePost: builder.mutation({
      query: ({ postId, socketId }) => ({
        url: `/api/feeds/posts/${postId}/like`,
        method: "POST",
        body: {
          socketId,
        },
      }),

      async onQueryStarted(
        { postId },
        { dispatch, queryFulfilled, getState }
      ) {
        const patches = [];

        // ============================================
        // PATCH HELPER
        // ============================================

        const patchPost = (post) => {
          if (!post) return;

          if (post.isLiked) return;

          post.isLiked = true;
          post.likes = Number(post.likes || 0) + 1;
        };

        const state = getState();

        // ============================================
        // PATCH SWAP VIDEOS
        // ============================================

        const swapQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "getSwapExternalVideos"
          );

        swapQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "getSwapExternalVideos",
              args,
              (draft) => {
                if (!Array.isArray(draft?.data))
                  return;

                const post = draft.data.find(
                  (item) =>
                    String(item.id) ===
                    String(postId) ||
                    String(item._id) ===
                    String(postId)
                );

                patchPost(post);
              }
            )
          );

          patches.push(patch);
        });

        // ============================================
        // PATCH TEMPLATE VIDEOS
        // ============================================

        const templateQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "templeteVideos"
          );

        templateQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "templeteVideos",
              args,
              (draft) => {
                if (
                  !Array.isArray(
                    draft?.data?.items
                  )
                ) {
                  return;
                }

                const post =
                  draft.data.items.find(
                    (item) =>
                      String(item.id) ===
                      String(postId) ||
                      String(item._id) ===
                      String(postId)
                  );

                patchPost(post);
              }
            )
          );

          patches.push(patch);
        });

        // ============================================
        // PATCH ACTIVE PROMPT TEMPLATES
        // ============================================

        const promptQueries =
          promptTemplateApi.util.selectCachedArgsForQuery(
            state,
            "getActivePromptTemplates"
          );

        promptQueries.forEach((args) => {
          const patch = dispatch(
            promptTemplateApi.util.updateQueryData(
              "getActivePromptTemplates",
              args,
              (draft) => {
                if (!Array.isArray(draft?.data))
                  return;

                const post = draft.data.find(
                  (item) =>
                    String(item.id) ===
                    String(postId) ||
                    String(item._id) ===
                    String(postId)
                );

                patchPost(post);
              }
            )
          );

          patches.push(patch);
        });

        try {
          await queryFulfilled;
        } catch (err) {
          patches.forEach((p) => p.undo());
          console.error(err);
        }
      },
    }),

    // =====================================================
    // UNLIKE POST
    // =====================================================

    unlikePost: builder.mutation({
      query: ({ postId, socketId }) => ({
        url: `/api/feeds/posts/${postId}/like`,
        method: "DELETE",
        body: {
          socketId,
        },
      }),

      async onQueryStarted(
        { postId },
        { dispatch, queryFulfilled, getState }
      ) {
        const patches = [];

        // ============================================
        // PATCH HELPER
        // ============================================

        const patchPost = (post) => {
          if (!post) return;

          if (!post.isLiked) return;

          post.isLiked = false;
          post.likes = Math.max(
            0,
            Number(post.likes || 0) - 1
          );
        };

        const state = getState();

        // ============================================
        // PATCH SWAP VIDEOS
        // ============================================

        const swapQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "getSwapExternalVideos"
          );

        swapQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "getSwapExternalVideos",
              args,
              (draft) => {
                if (!Array.isArray(draft?.data))
                  return;

                const post = draft.data.find(
                  (item) =>
                    String(item.id) ===
                    String(postId) ||
                    String(item._id) ===
                    String(postId)
                );

                patchPost(post);
              }
            )
          );

          patches.push(patch);
        });

        // ============================================
        // PATCH TEMPLATE VIDEOS
        // ============================================

        const templateQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "templeteVideos"
          );

        templateQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "templeteVideos",
              args,
              (draft) => {
                if (
                  !Array.isArray(
                    draft?.data?.items
                  )
                ) {
                  return;
                }

                const post =
                  draft.data.items.find(
                    (item) =>
                      String(item.id) ===
                      String(postId) ||
                      String(item._id) ===
                      String(postId)
                  );

                patchPost(post);
              }
            )
          );

          patches.push(patch);
        });

        // ============================================
        // PATCH ACTIVE PROMPT TEMPLATES
        // ============================================

        const promptQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "getActivePromptTemplates"
          );

        promptQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "getActivePromptTemplates",
              args,
              (draft) => {
                if (!Array.isArray(draft?.data))
                  return;

                const post = draft.data.find(
                  (item) =>
                    String(item.id) ===
                    String(postId) ||
                    String(item._id) ===
                    String(postId)
                );

                patchPost(post);
              }
            )
          );

          patches.push(patch);
        });

        try {
          await queryFulfilled;
        } catch (err) {
          patches.forEach((p) => p.undo());
          console.error(err);
        }
      },
    }),

    // =====================================================
    // GET POST COMMENTS
    // =====================================================

    getPostComments: builder.query({
      query: ({
        postId,
        cursor,
        limit = 20,
      }) => ({
        url: `/api/feeds/posts/${postId}/comments`,
        params: {
          cursor,
          limit,
        },
      }),

      keepUnusedDataFor: 60,
    }),

    // =====================================================
    // GET POST LIKE STATUS
    // =====================================================

    getPostLikes: builder.query({
      query: ({
        postId,
        cursor,
        limit = 20,
      }) => ({
        url: `/api/feeds/posts/${postId}/like-status`,
        params: {
          cursor,
          limit,
        },
      }),

      keepUnusedDataFor: 60,
    }),

    // =====================================================
    // GET COMMENT REPLIES
    // =====================================================

    getCommentReplies: builder.query({
      query: ({
        commentId,
        cursor,
        limit = 20,
      }) => ({
        url: `/api/feeds/comments/${commentId}/replies`,
        params: {
          cursor,
          limit,
        },
      }),

      keepUnusedDataFor: 60,
    }),

    // =====================================================
    // CREATE COMMENT
    // =====================================================

    createComment: builder.mutation({
      query: ({
        postId,
        text,
        socketId,
      }) => ({
        url: `/api/feeds/posts/${postId}/comments`,
        method: "POST",
        body: {
          text,
          socketId,
        },
      }),

      async onQueryStarted(
        { postId, text },
        { dispatch, queryFulfilled, getState }
      ) {
        const patches = [];

        const optimisticComment = {
          _id: `temp-${Date.now()}`,
          text,
          replyCount: 0,
          likeCount: 0,
          isDeleted: false,
          createdAt: new Date().toISOString(),
          isOptimistic: true,
          userId: {
            _id: "me",
            name: "You",
          },
        };

        // =========================================
        // PATCH COMMENTS CACHE
        // =========================================

        const commentPatch = dispatch(
          feedsApi.util.updateQueryData(
            "getPostComments",
            { postId },
            (draft) => {
              if (!draft?.data?.comments) return;

              draft.data.comments.unshift(
                optimisticComment
              );
            }
          )
        );

        patches.push(commentPatch);

        const state = getState();

        // =========================================
        // PATCH SWAP VIDEOS
        // =========================================

        const swapQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "getSwapExternalVideos"
          );

        swapQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "getSwapExternalVideos",
              args,
              (draft) => {
                if (!Array.isArray(draft?.data))
                  return;

                const post = draft.data.find(
                  (item) =>
                    String(item.id) ===
                    String(postId) ||
                    String(item._id) ===
                    String(postId)
                );

                if (post) {
                  post.commentsCount =
                    Number(
                      post.commentsCount || 0
                    ) + 1;
                }
              }
            )
          );

          patches.push(patch);
        });

        // =========================================
        // PATCH TEMPLATE VIDEOS
        // =========================================

        const templateQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "templeteVideos"
          );

        templateQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "templeteVideos",
              args,
              (draft) => {
                if (
                  !Array.isArray(
                    draft?.data?.items
                  )
                )
                  return;

                const post =
                  draft.data.items.find(
                    (item) =>
                      String(item.id) ===
                      String(postId) ||
                      String(item._id) ===
                      String(postId)
                  );

                if (post) {
                  post.commentsCount =
                    Number(
                      post.commentsCount || 0
                    ) + 1;
                }
              }
            )
          );

          patches.push(patch);
        });

        // =========================================
        // PATCH ACTIVE PROMPT TEMPLATES
        // =========================================

        const promptQueries =
          feedsApi.util.selectCachedArgsForQuery(
            state,
            "getActivePromptTemplates"
          );

        promptQueries.forEach((args) => {
          const patch = dispatch(
            feedsApi.util.updateQueryData(
              "getActivePromptTemplates",
              args,
              (draft) => {
                if (!Array.isArray(draft?.data))
                  return;

                const post = draft.data.find(
                  (item) =>
                    String(item.id) === String(postId) ||
                    String(item._id) === String(postId)
                );

                // console.log("Found Post:", post);
                // console.log("Draft:", draft.data);

                if (post) {
                  post.commentsCount =
                    Number(
                      post.commentsCount || 0
                    ) + 1;
                }
              }
            )
          );

          patches.push(patch);
        });

        try {
          await queryFulfilled;
        } catch (err) {
          patches.forEach((p) => p.undo());
          console.error(err);
        }
      },
    }),

    // =====================================================
    // CREATE REPLY
    // =====================================================

    createReply: builder.mutation({
      query: ({
        commentId,
        text,
      }) => ({
        url: `/api/feeds/comments/${commentId}/reply`,
        method: "POST",
        body: {
          text,
        },
      }),

      async onQueryStarted(
        { commentId, text },
        { dispatch, queryFulfilled }
      ) {

        const optimisticReply = {
          _id: `temp-${Date.now()}`,

          text,

          createdAt: new Date().toISOString(),

          isOptimistic: true,

          userId: {
            _id: "me",
            name: "You",
          },
        };

        const repliesPatch = dispatch(
          feedsApi.util.updateQueryData(
            "getCommentReplies",
            { commentId },
            (draft) => {

              if (!draft?.data?.replies)
                return;

              draft.data.replies.push(
                optimisticReply
              );
            }
          )
        );

        try {
          await queryFulfilled;
        } catch (err) {

          repliesPatch.undo();

          console.error(err);
        }
      },
    }),

    searchAll: builder.query({
      query: ({
        keyword,
        type = 'all',
        page = 1,
        limit = 20,
      }) => ({
        url: '/api/feeds/search/all',

        params: {
          keyword,
          type,
          page,
          limit,
        },
      }),

      // =====================================================
      // CACHE KEY
      // =====================================================

      serializeQueryArgs: ({
        endpointName,
        queryArgs,
      }) => {
        return `${endpointName}-${queryArgs.keyword}-${queryArgs.type}`
      },

      // =====================================================
      // FORCE REFETCH
      // =====================================================

      forceRefetch({
        currentArg,
        previousArg,
      }) {
        return (
          currentArg?.keyword !==
          previousArg?.keyword ||

          currentArg?.type !==
          previousArg?.type ||

          currentArg?.page !==
          previousArg?.page
        )
      },

      // =====================================================
      // MERGE PAGINATION
      // =====================================================

      merge: (
        currentCache,
        newCache,
        { arg }
      ) => {
        // FIRST PAGE

        if (arg.page === 1) {
          return newCache
        }

        // =================================================
        // TAB ITEMS
        // =================================================

        if (
          Array.isArray(
            currentCache?.items
          ) &&
          Array.isArray(
            newCache?.items
          )
        ) {
          const existingIds =
            new Set(
              currentCache.items.map(
                (item) =>
                  item._id
              )
            )

          const uniqueItems =
            newCache.items.filter(
              (item) =>
                !existingIds.has(
                  item._id
                )
            )

          currentCache.items.push(
            ...uniqueItems
          )

          currentCache.hasMore =
            newCache.hasMore

          currentCache.page =
            newCache.page

          return
        }

        return newCache
      },
    })

  }),
});

export const {
  useLikePostMutation,
  useUnlikePostMutation,

  useGetPostLikesQuery,
  useLazyGetPostLikesQuery,

  useGetPostCommentsQuery,
  useLazyGetPostCommentsQuery,

  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,

  useCreateCommentMutation,
  useCreateReplyMutation,

  useSearchAllQuery

} = feedsApi;