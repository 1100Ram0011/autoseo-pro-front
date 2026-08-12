import { apiSlice } from '../backendApiSlice/apiSlice'

export const settingsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // =========================
        // SETTINGS DEFINITION APIs
        // =========================

        // Get all settings
        getAllSettings: builder.query({
            query: () => '/api/settings',
            providesTags: ['Settings'],
        }),

        // Get single setting (definition + values)
        getSetting: builder.query({
            query: (id) => `/api/settings/${id}`,
            providesTags: (result, error, id) => [{ type: 'Settings', id }],
        }),

        // Create setting
        createSetting: builder.mutation({
            query: (data) => ({
                url: '/api/settings',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Settings'],
        }),

        // Update setting (structure)
        updateSetting: builder.mutation({
            query: ({ key, ...data }) => ({
                url: `/api/settings/${key}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { key }) => [
                { type: 'Settings', id: key },
            ],
        }),

        // Delete setting
        deleteSetting: builder.mutation({
            query: (key) => ({
                url: `/api/settings/${key}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Settings'],
        }),

        // =========================
        // SETTINGS VALUES APIs
        // =========================

        // Save values
        saveSettingValues: builder.mutation({
            query: ({ key, values }) => ({
                url: `/api/settings/${key}/value`,
                method: 'POST',
                body: { values },
            }),
            invalidatesTags: (result, error, { key, id }) => [
                { type: 'Settings', id: key },
                ...(id ? [{ type: 'Settings', id }] : []),
                'Settings',
            ],
        }),

        // Get only values (for runtime usage)
        getSettingValues: builder.query({
            query: (key) => `/api/settings/${key}/value`,
            providesTags: (result, error, key) => [
                { type: 'Settings', id: key },
            ],
        }),

    }),
})

export const {
    useGetAllSettingsQuery,
    useGetSettingQuery,
    useCreateSettingMutation,
    useUpdateSettingMutation,
    useDeleteSettingMutation,
    useSaveSettingValuesMutation,
    useGetSettingValuesQuery,
} = settingsApi