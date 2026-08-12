// transactions.api.js

import { apiSlice } from "../backendApiSlice/apiSlice";

export const transactionsApi =
  apiSlice.injectEndpoints({

    endpoints: (builder) => ({

      // =========================================
      // PENDING PAYOUTS
      // =========================================

      getPendingReferralPayouts:
        builder.query({

          query: ({
            last,
            status = "UNPAID",
          } = {}) => {

            const params =
              new URLSearchParams();

            if (last) {

              params.append(
                "last",
                last
              );
            }

            if (status) {

              params.append(
                "status",
                status
              );
            }

            return {

              url:
                `/api/transactions/referral/pending-payouts?${params.toString()}`,

              method:
                "GET",
            };
          },

          providesTags: [
            "PendingPayouts",
          ],
        }),

      // =========================================
      // EXPORT PAYOUTS
      // =========================================

      exportReferralPayouts:
        builder.mutation({

          query: ({
            last = 180,
          } = {}) => {

            const params =
              new URLSearchParams();

            if (last) {

              params.append(
                "last",
                last
              );
            }

            return {

              url:
                `/api/transactions/referral/export-payouts?${params.toString()}`,

              method:
                "GET",

              responseHandler:
                async (
                  response
                ) => {

                  if (
                    !response.ok
                  ) {

                    return await response.json();
                  }

                  const blob =
                    await response.blob();

                  return {

                    blob,

                    fileName:
                      response.headers.get(
                        "x-file-name"
                      ) ||
                      `Payout_${Date.now()}.xlsx`,
                  };
                },

              validateStatus: (
                response
              ) => {

                return (
                  response.status >= 200 &&
                  response.status < 300
                );
              },
            };
          },
        }),

      // =========================================
      // IMPORT PAYOUTS
      // =========================================

      importReferralPayouts:
        builder.mutation({

          query: (
            formData
          ) => ({

            url:
              "/api/transactions/referral/import-payouts",

            method:
              "POST",

            body:
              formData,
          }),

          invalidatesTags: [
            "PendingPayouts",
            "PayoutBatchHistory",
          ],
        }),

      // =========================================
      // BATCH HISTORY
      // =========================================

      getPayoutBatchHistory:
        builder.query({

          query: ({
            page = 1,
            limit = 20,
            status = "",
          } = {}) => {

            const params =
              new URLSearchParams();

            params.append(
              "page",
              page
            );

            params.append(
              "limit",
              limit
            );

            if (status) {

              params.append(
                "status",
                status
              );
            }

            return {

              url:
                `/api/transactions/referral/payout-batches?${params.toString()}`,

              method:
                "GET",
            };
          },

          providesTags: [
            "PayoutBatchHistory",
          ],
        }),

      // =========================================
      // DOWNLOAD BATCH EXCEL
      // =========================================

      downloadPayoutBatchExcel:
        builder.mutation({

          query: ({
            batchId,
          }) => ({

            url:
              `/api/transactions/referral/download-payout-batch-excel/${batchId}`,

            method:
              "GET",

            responseHandler:
              async (
                response
              ) => {

                if (
                  !response.ok
                ) {

                  return await response.json();
                }

                const blob =
                  await response.blob();

                return {

                  blob,

                  fileName:
                    response.headers.get(
                      "x-file-name"
                    ) ||
                    `Batch_${Date.now()}.xlsx`,
                };
              },

            validateStatus: (
              response
            ) => {

              return (
                response.status >= 200 &&
                response.status < 300
              );
            },
          }),
        }),

      getMyReferralTransactions:
        builder.query({

          query: ({
            page = 1,
            limit = 20,
          } = {}) => ({

            url:
              `/api/transactions/referral/my-transactions?page=${page}&limit=${limit}`,

            method:
              "GET",
          }),

          providesTags: [
            "MyReferralTransactions",
          ],
        }),

    }),

    overrideExisting:
      false,
  });

export const {

  useGetPendingReferralPayoutsQuery,

  useExportReferralPayoutsMutation,

  useImportReferralPayoutsMutation,

  useGetPayoutBatchHistoryQuery,

  useDownloadPayoutBatchExcelMutation,

  useGetMyReferralTransactionsQuery,


} = transactionsApi;