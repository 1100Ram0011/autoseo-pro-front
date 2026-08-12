import { apiSlice } from "../backendApiSlice/apiSlice";

export const emailTemplateApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getEmailTemplates: builder.query({
            query: (params) => {
                if (params) {
                    const queryStr = new URLSearchParams(params).toString();
                    return `/api/template?${queryStr}`;
                }
                return "/api/template";
            },
            providesTags: (result) =>
                Array.isArray(result)
                    ? [
                        ...result.map(({ _id }) => ({
                            type: "EmailTemplate",
                            id: _id,
                        })),
                        { type: "EmailTemplate", id: "LIST" },
                    ]
                    : [{ type: "EmailTemplate", id: "LIST" }],
        }),

        createEmailTemplate: builder.mutation({
            query: (formData) => ({
                url: "/api/template",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: "EmailTemplate", id: "LIST" }],
        }),

        updateEmailTemplate: builder.mutation({
            query: ({ id, body }) => ({
                url: `/api/template/${id}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "EmailTemplate", id },
                { type: "EmailTemplate", id: "LIST" },
            ],
        }),

        deleteEmailTemplate: builder.mutation({
            query: (id) => ({
                url: `/api/template/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "EmailTemplate", id },
                { type: "EmailTemplate", id: "LIST" },
            ],
        }),

    }),
});

export const {
    useGetEmailTemplatesQuery,
    useCreateEmailTemplateMutation,
    useUpdateEmailTemplateMutation,
    useDeleteEmailTemplateMutation,
} = emailTemplateApi;