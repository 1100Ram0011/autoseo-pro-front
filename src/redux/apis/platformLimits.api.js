import { apiSlice } from '../backendApiSlice/apiSlice'

export const platformLimitsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllPlatformLimits: builder.query({
            query: () => '/api/platform-limits',
            providesTags: ['PlatformLimits'],
        }),

        getPlatformLimit: builder.query({
            query: (idOrPlatform) => `/api/platform-limits/${idOrPlatform}`,
            providesTags: (result, error, id) => [{ type: 'PlatformLimits', id }],
        }),

        createPlatformLimit: builder.mutation({
            query: (data) => ({
                url: '/api/platform-limits',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['PlatformLimits'],
        }),

        updatePlatformLimit: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/platform-limits/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'PlatformLimits', id },
                'PlatformLimits'
            ],
        }),

        deletePlatformLimit: builder.mutation({
            query: (id) => ({
                url: `/api/platform-limits/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['PlatformLimits'],
        }),
    }),
})

export const {
    useGetAllPlatformLimitsQuery,
    useGetPlatformLimitQuery,
    useCreatePlatformLimitMutation,
    useUpdatePlatformLimitMutation,
    useDeletePlatformLimitMutation,
} = platformLimitsApi
