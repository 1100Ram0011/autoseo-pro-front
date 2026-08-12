import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkUsernameAvailability: builder.query({
      query: (username) => `/api/profile/username/check?username=${encodeURIComponent(String(username || ''))}`,
    }),
    getPublicProfile: builder.query({
      query: (userId) => `/api/profile/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'PublicProfile', id: userId }],
    }),
    getPublicProfileTemplates: builder.query({
      query: ({
        userId,
        limit = 20,
        cursor,
      }) => {
        const params = new URLSearchParams()

        params.append('limit', limit)

        if (cursor) {
          params.append('cursor', cursor)
        }

        return `/api/profile/${userId}/templates?${params.toString()}`
      },

      serializeQueryArgs: ({
        endpointName,
        queryArgs,
      }) => {
        return `${endpointName}-${queryArgs.userId}`
      },

      merge: (currentCache, newCache) => {
        const existingIds = new Set(
          (currentCache?.data || []).map(
            (item) => item.id
          )
        )

        const newData = (
          newCache?.data || []
        ).filter(
          (item) => !existingIds.has(item.id)
        )

        currentCache.data.push(...newData)

        currentCache.pagination =
          newCache.pagination
      },

      forceRefetch({
        currentArg,
        previousArg,
      }) {
        return (
          currentArg?.cursor !==
          previousArg?.cursor
        )
      },

      providesTags: (
        result,
        error,
        arg
      ) => [
          {
            type: 'PublicProfile',
            id: `${arg.userId}-templates`,
          },
        ],
    }),
    getPublicProfileFollowers: builder.query({
      query: ({ userId, q = '', page = 1, limit = 30 }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        })
        const s = String(q || '').trim()
        if (s) params.set('q', s)
        return `/api/profile/${encodeURIComponent(userId)}/followers?${params}`
      },
      providesTags: () => [{ type: 'FollowLists', id: 'LIST' }],
    }),
    getPublicProfileFollowing: builder.query({
      query: ({ userId, q = '', page = 1, limit = 30 }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        })
        const s = String(q || '').trim()
        if (s) params.set('q', s)
        return `/api/profile/${encodeURIComponent(userId)}/following?${params}`
      },
      providesTags: () => [{ type: 'FollowLists', id: 'LIST' }],
    }),
    followUser: builder.mutation({
      query: (userId) => ({
        url: `/api/profile/${userId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'PublicProfile', id: userId },
        { type: 'PublicProfile' },
        { type: 'FollowLists', id: 'LIST' },
      ],
    }),
    unfollowUser: builder.mutation({
      query: (userId) => ({
        url: `/api/profile/${userId}/follow`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'PublicProfile', id: userId },
        { type: 'PublicProfile' },
        { type: 'FollowLists', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useLazyCheckUsernameAvailabilityQuery,
  useGetPublicProfileQuery,
  useGetPublicProfileTemplatesQuery,
  useGetPublicProfileFollowersQuery,
  useGetPublicProfileFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = profileApi
