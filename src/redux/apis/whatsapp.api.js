// whatsapp.api.js

import { apiSlice } from "../backendApiSlice/apiSlice";

export const whatsappApi =
  apiSlice.injectEndpoints({

    endpoints: (builder) => ({

      /*
      |--------------------------------------------------------------------------
      | CONNECT
      |--------------------------------------------------------------------------
      */

      connectWhatsApp:
        builder.mutation({

          query: () => ({
            url:
              "/api/whatsapp/connect",

            method: "POST",
          }),
        }),

      /*
      |--------------------------------------------------------------------------
      | CONNECTIONS
      |--------------------------------------------------------------------------
      */

      getWhatsAppConnections:
        builder.query({

          query: () => ({
            url:
              "/api/whatsapp/connections",

            method: "GET",
          }),

          keepUnusedDataFor: 0,
        }),

      /*
      |--------------------------------------------------------------------------
      | QR
      |--------------------------------------------------------------------------
      */

      getWhatsAppQRCode:
        builder.query({

          query: (
            connectionId
          ) => ({
            url:
              `/api/whatsapp/qr/${connectionId}`,

            method: "GET",
          }),

          keepUnusedDataFor: 0,
        }),

      /*
      |--------------------------------------------------------------------------
      | STATUS
      |--------------------------------------------------------------------------
      */

      getWhatsappConnectionStatus:
        builder.query({

          query: (
            connectionId
          ) => ({
            url:
              `/api/whatsapp/status/${connectionId}`,

            method: "GET",
          }),

          keepUnusedDataFor: 0,
        }),

      /*
      |--------------------------------------------------------------------------
      | CHECK NUMBER
      |--------------------------------------------------------------------------
      */

      checkWhatsAppNumber:
        builder.mutation({

          query: ({
            connectionId,
            number,
          }) => ({
            url:
              "/api/whatsapp/check-number",

            method: "POST",

            body: {
              connectionId,
              number,
            },
          }),
        }),

      /*
      |--------------------------------------------------------------------------
      | LOGOUT SINGLE
      |--------------------------------------------------------------------------
      */

      logoutWhatsApp:
        builder.mutation({

          query: (
            connectionId
          ) => ({
            url:
              "/api/whatsapp/logout",

            method: "POST",

            body: {
              connectionId,
            },
          }),
        }),

      /*
      |--------------------------------------------------------------------------
      | LOGOUT ALL
      |--------------------------------------------------------------------------
      */

      logoutAllWhatsApp:
        builder.mutation({

          query: () => ({
            url:
              "/api/whatsapp/logout-all",

            method: "POST",
          }),
        }),

      /*
|--------------------------------------------------------------------------
| WHATSAPP VALIDATOR - UPLOAD
|--------------------------------------------------------------------------
*/

      uploadWhatsappValidationFile:
        builder.mutation({

          query: (
            file
          ) => {

            const formData =
              new FormData();

            formData.append(
              "file",
              file
            );

            return {
              url:
                "/api/whatsapp/validator/upload",

              method:
                "POST",

              body:
                formData,
            };
          },
        }),

      /*
      |--------------------------------------------------------------------------
      | WHATSAPP VALIDATOR - STATUS
      |--------------------------------------------------------------------------
      */

      getWhatsappValidationStatus:
        builder.query({

          query: (
            jobId
          ) => ({
            url:
              `/api/whatsapp/validator/status/${jobId}`,

            method:
              "GET",
          }),

          keepUnusedDataFor:
            0,
        }),
    }),
  });

export const {

  useConnectWhatsAppMutation,

  useGetWhatsAppConnectionsQuery,
  useLazyGetWhatsAppConnectionsQuery,

  useGetWhatsAppQRCodeQuery,
  useLazyGetWhatsAppQRCodeQuery,

  useGetWhatsappConnectionStatusQuery,
  useLazyGetWhatsappConnectionStatusQuery,

  useCheckWhatsAppNumberMutation,

  useLogoutWhatsAppMutation,
  useLogoutAllWhatsAppMutation,

  useUploadWhatsappValidationFileMutation,

  useGetWhatsappValidationStatusQuery,
  useLazyGetWhatsappValidationStatusQuery,


} = whatsappApi;