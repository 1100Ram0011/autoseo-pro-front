

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAnalyticsReauth } from "./baseQueryWithAnalytics";

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseQueryWithAnalyticsReauth,
  tagTypes: ["AnalyticsProperties", "AnalyticsReport", "PageSpeed"],

  endpoints: (builder) => ({

    // GET PROPERTIES
    getAnalyticsProperties: builder.query({
      query: () => "/api/analytics/properties",
      providesTags: ["AnalyticsProperties"],
      keepUnusedDataFor: 300,
    }),
    logoutAnalytics: builder.mutation({
  query: (data) => ({
    url: "/api/analytics/logout",
    method: "POST",
    body: data,
  }),
  invalidatesTags: ["AnalyticsProperties", "AnalyticsReport"],
}),

    // GET REPORT — null params filtered out
    getAnalyticsReport: builder.query({
      query: ({ propertyId, ...params }) => {
        // ✅ Remove null/undefined values so they don't reach backend as "null" strings
        const cleanParams = {};
        Object.entries(params).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== "null" && v !== "undefined") {
            cleanParams[k] = v;
          }
        });
        return {
          url: `/api/analytics/${propertyId}`,
          params: cleanParams,
        };
      },
      providesTags: (result, error, arg) => [
        { type: "AnalyticsReport", id: arg.propertyId },
      ],
      refetchOnMountOrArgChange: true,
    }),
// analytics.api.js mein ye endpoint add karo
getDropdownUrls: builder.query({
  query: (websiteHash) => ({
    url: `/api/pagespeed/urls/${websiteHash}`,
  }),
  providesTags: ["DropdownUrls"],
}),
    // PAGE SPEED
    // getAnalyticsPageSpeed: builder.query({
    //   query: ({ url, strategy = "mobile" }) => ({
    //     url: "/api/analytics/pagespeed",
    //     params: { url, strategy },
    //   }),
    //   providesTags: ["PageSpeed"],
    // }),
// ── PAGE SPEED ────────────────────────────────────────────────────
//     ✅ url string lega (object nahi)
//     ✅ Backend GET /api/analytics/pagespeed?url=...
//     ✅ Backend { mobile: {...}, desktop: {...} } dono return karta hai
//     ✅ useLazyGetAnalyticsPageSpeedQuery export hoga button click ke liye
    getAnalyticsPageSpeed: builder.query({
      query: (url) => ({
        url: "/api/analytics/pagespeed",
        params: { url },
      }),
      providesTags: ["PageSpeed"],
      keepUnusedDataFor: 300,
    }),
    // SELECT PROPERTY
    selectAnalyticsProperty: builder.mutation({
      query: (data) => ({
        url: "/api/analytics/select-property",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AnalyticsProperties", "AnalyticsReport"],
    }),
  }),
});

export const {
  useGetAnalyticsPropertiesQuery,
  useGetAnalyticsReportQuery,
  useGetAnalyticsPageSpeedQuery,
  useLazyGetAnalyticsPageSpeedQuery,
  useGetDropdownUrlsQuery,          
  useSelectAnalyticsPropertyMutation,
  useLogoutAnalyticsMutation,
} = analyticsApi;









