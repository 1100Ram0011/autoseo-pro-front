import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

export const usersApi = apiSlice.injectEndpoints({
    overrideExisting: false,
    endpoints: (builder) => ({

        // GET /api/admin/users?page=&limit=&search=&state=&district=&role=
        getUsers: builder.query({
            query: ({ page = 1, limit = 10, search = '', state = '', district = '', role = '' } = {}) => ({
                url: '/api/admin/users',
                params: { page, limit, search, state, district, role },
            }),
            providesTags: (result) =>
                result?.users
                    ? [...result.users.map(({ _id }) => ({ type: 'Users', id: _id })), { type: 'Users', id: 'LIST' }]
                    : [{ type: 'Users', id: 'LIST' }],
        }),

        // GET /api/admin/users/:id
        getUserById: builder.query({
            query: (id) => `/api/admin/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'Users', id }],
        }),

        // GET /api/admin/users/:id/detail — full combined profile
        getUserDetail: builder.query({
            query: (id) => `/api/admin/users/${id}/detail`,
            providesTags: (result, error, id) => [{ type: 'Users', id }],
        }),

        // POST /api/admin/users
        createUser: builder.mutation({
            query: (body) => ({ url: '/api/admin/users', method: 'POST', body }),
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
        }),

        // PUT /api/admin/users/:id
        updateUser: builder.mutation({
            query: ({ id, ...patch }) => ({ url: `/api/admin/users/${id}`, method: 'PUT', body: patch }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
        }),

        // DELETE /api/admin/users/:id
        deleteUser: builder.mutation({
            query: ({ id, reason, hardDelete }) => ({ url: `/api/admin/users/${id}`, method: 'DELETE', body: { reason, hardDelete } }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
        }),

        // PATCH /api/admin/users/:id/toggle-status
        toggleUserStatus: builder.mutation({
            query: (id) => ({ url: `/api/admin/users/${id}/toggle-status`, method: 'PATCH' }),
            invalidatesTags: (result, error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
        }),

        // PATCH /api/admin/users/:id/toggle-incentive
        toggleIncentive: builder.mutation({
            query: (id) => ({ url: `/api/admin/users/${id}/toggle-incentive`, method: 'PATCH' }),
            invalidatesTags: (result, error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
        }),

        // PATCH /api/admin/users/:id/incentive-percentage
        updateIncentivePercentage: builder.mutation({
            query: ({ id, percentage }) => ({
                url: `/api/admin/users/${id}/incentive-percentage`,
                method: 'PATCH',
                body: { percentage },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
        }),
        getUserAssets: builder.query({
            query: ({ type = "image", page = 1, limit = 20 } = {}) => ({
                url: `/api/admin/users/assets`,
                params: { type, page, limit },
            }),

        }),

        reqDeleteAccount: builder.mutation({
            query: (body) => ({
                url: '/api/auth/user/reqDelete',
                method: 'DELETE',
                body,
            }),
        }),

        confirmDeleteAccount: builder.mutation({
            query: (body) => ({
                url: '/api/auth/user/confirmDelete',
                method: 'DELETE',
                body,
            }),
        }),

        resendDeleteOtp: builder.mutation({
            query: (body) => ({
                url: '/api/auth/user/delete-account/resend-otp',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useGetUserDetailQuery,
    useCreateUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useToggleUserStatusMutation,
    useToggleIncentiveMutation,
    useUpdateIncentivePercentageMutation,
    useLazyGetUserDetailQuery,
    useLazyGetUsersQuery,
    useGetUserAssetsQuery,
    useReqDeleteAccountMutation,
    useConfirmDeleteAccountMutation,
    useResendDeleteOtpMutation,
} = usersApi