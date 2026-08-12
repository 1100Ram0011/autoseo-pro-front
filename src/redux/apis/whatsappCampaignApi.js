// whatsappCampaignApi.js

import { apiSlice }
  from "../backendApiSlice/apiSlice";

export const whatsappCampaignApi =
  apiSlice.injectEndpoints({

    endpoints: builder => ({

      estimateWhatsappCampaign:
        builder.mutation({

          query: data => ({

            url:
              "/api/whatsapp/campaigns/estimate",

            method:
              "POST",

            body:
              data,
          }),
        }),

      createWhatsappCampaign:
        builder.mutation({

          query: data => ({

            url:
              "/api/whatsapp/campaigns",

            method:
              "POST",

            body:
              data,
          }),

          invalidatesTags:
            ["Campaigns"],
        }),

      getWhatsappCampaigns:
        builder.query({

          query: () =>
            "/api/whatsapp/campaigns",

          providesTags:
            ["Campaigns"],
        }),

      getWhatsappCampaign:
        builder.query({

          query:
            campaignId =>
              `/api/whatsapp/campaigns/${campaignId}`,

          providesTags:
            (
              result,
              error,
              id
            ) => [
                {
                  type:
                    "Campaign",

                  id,
                },
              ],
        }),

      pauseWhatsappCampaign:
        builder.mutation({

          query:
            campaignId => ({

              url:
                `/api/whatsapp/campaigns/${campaignId}/pause`,

              method:
                "PATCH",
            }),

          invalidatesTags:
            (
              result,
              error,
              campaignId
            ) => [

                "Campaigns",

                {
                  type:
                    "Campaign",

                  id:
                    campaignId,
                },
              ],
        }),

      resumeWhatsappCampaign:
        builder.mutation({

          query:
            campaignId => ({

              url:
                `/api/whatsapp/campaigns/${campaignId}/resume`,

              method:
                "PATCH",
            }),

          invalidatesTags:
            (
              result,
              error,
              campaignId
            ) => [

                "Campaigns",

                {
                  type:
                    "Campaign",

                  id:
                    campaignId,
                },
              ],
        }),

      stopWhatsappCampaign:
        builder.mutation({

          query:
            campaignId => ({

              url:
                `/api/whatsapp/campaigns/${campaignId}/stop`,

              method:
                "PATCH",
            }),

          invalidatesTags:
            (
              result,
              error,
              campaignId
            ) => [

                "Campaigns",

                {
                  type:
                    "Campaign",

                  id:
                    campaignId,
                },
              ],
        }),

      getWhatsappCampaignAnalytics:
        builder.query({

          query:
            campaignId =>
              `/api/whatsapp/campaigns/${campaignId}/analytics`,

          providesTags:
            (
              result,
              error,
              id
            ) => [
                {
                  type:
                    "CampaignAnalytics",

                  id,
                },
              ],
        }),

      getCampaignConnections:
        builder.query({

          query: () =>
            "/api/whatsapp/campaigns/campaign-connections",

          providesTags: [
            "CampaignConnections",
          ],
        }),
    }),
  });

export const {

  useEstimateWhatsappCampaignMutation,

  useCreateWhatsappCampaignMutation,

  useGetWhatsappCampaignsQuery,

  useGetWhatsappCampaignQuery,

  usePauseWhatsappCampaignMutation,

  useResumeWhatsappCampaignMutation,

  useStopWhatsappCampaignMutation,

  useGetWhatsappCampaignAnalyticsQuery,

  useGetCampaignConnectionsQuery

} = whatsappCampaignApi;