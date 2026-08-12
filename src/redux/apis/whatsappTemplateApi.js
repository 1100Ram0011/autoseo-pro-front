// whatsappTemplateApi.js

import { apiSlice } from "../backendApiSlice/apiSlice";

export const whatsappTemplateApi =
  apiSlice.injectEndpoints({

    endpoints: builder => ({

      createWhatsappTemplate:
        builder.mutation({

          query: data => ({

            url:
              "/api/whatsapp/templates",

            method:
              "POST",

            body:
              data,
          }),

          invalidatesTags:
            ["Templates"],
        }),

      getWhatsappTemplates:
        builder.query({

          query: () =>
            "/api/whatsapp/templates",

          providesTags:
            ["Templates"],
        }),

      getWhatsappTemplate:
        builder.query({

          query:
            templateId =>
              `/api/whatsapp/templates/${templateId}`,

          providesTags:
            (
              result,
              error,
              id
            ) => [
              {
                type:
                  "Template",

                id,
              },
            ],
        }),

      updateWhatsappTemplate:
        builder.mutation({

          query:
            ({
              templateId,
              ...data
            }) => ({

              url:
                `/api/whatsapp/templates/${templateId}`,

              method:
                "PUT",

              body:
                data,
            }),

          invalidatesTags:
            (
              result,
              error,
              arg
            ) => [

              "Templates",

              {
                type:
                  "Template",

                id:
                  arg.templateId,
              },
            ],
        }),

      deleteWhatsappTemplate:
        builder.mutation({

          query:
            templateId => ({

              url:
                `/api/whatsapp/templates/${templateId}`,

              method:
                "DELETE",
            }),

          invalidatesTags:
            ["Templates"],
        }),
    }),
  });

export const {

  useCreateWhatsappTemplateMutation,

  useGetWhatsappTemplatesQuery,

  useGetWhatsappTemplateQuery,

  useUpdateWhatsappTemplateMutation,

  useDeleteWhatsappTemplateMutation,

} = whatsappTemplateApi;