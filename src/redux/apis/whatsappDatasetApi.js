import { apiSlice }
    from "../backendApiSlice/apiSlice";

export const whatsappDatasetApi =
    apiSlice.injectEndpoints({

        endpoints: builder => ({

            uploadWhatsappDataset:
                builder.mutation({

                    query: formData => ({

                        url:
                            "/api/whatsapp/datasets/upload",

                        method:
                            "POST",

                        body:
                            formData,
                    }),

                    invalidatesTags:
                        ["Datasets"],
                }),

            getWhatsappDatasets:
                builder.query({

                    query: () =>
                        "/api/whatsapp/datasets",

                    providesTags:
                        ["Datasets"],
                }),

            getWhatsappDataset:
                builder.query({

                    query:
                        datasetId =>
                            `/api/whatsapp/datasets/${datasetId}`,

                    providesTags:
                        (
                            result,
                            error,
                            id
                        ) => [
                                {
                                    type:
                                        "Dataset",

                                    id,
                                },
                            ],
                }),

            getWhatsappDatasetPreview:
                builder.query({

                    query:
                        datasetId =>
                            `/api/whatsapp/datasets/${datasetId}/preview`,
                }),

            deleteWhatsappDataset:
                builder.mutation({

                    query:
                        datasetId => ({

                            url:
                                `/api/whatsapp/datasets/${datasetId}`,

                            method:
                                "DELETE",
                        }),

                    invalidatesTags:
                        ["Datasets"],
                }),
        }),
    });

export const {

    useUploadWhatsappDatasetMutation,

    useGetWhatsappDatasetsQuery,

    useGetWhatsappDatasetQuery,

    useGetWhatsappDatasetPreviewQuery,

    useDeleteWhatsappDatasetMutation,

} = whatsappDatasetApi;