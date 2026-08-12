import { apiSlice } from "@/redux/backendApiSlice/apiSlice";

export const aiStudioSettingsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // Categories
        createCategory: builder.mutation({
            query: (data) => ({
                url: "/api/ai-studio/settings/categories",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["AI_STUDIO_CATEGORIES"],
        }),

        getCategories: builder.query({
            query: () => ({
                url: "/api/ai-studio/settings/categories",
                method: "GET",
            }),
            providesTags: ["AI_STUDIO_CATEGORIES"],
        }),

        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/ai-studio/settings/categories/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["AI_STUDIO_CATEGORIES"],
        }),

        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `/api/ai-studio/settings/categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["AI_STUDIO_CATEGORIES"],
        }),

    }),
});

export const {
    useCreateCategoryMutation,
    useGetCategoriesQuery,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = aiStudioSettingsApi;