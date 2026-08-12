// redux/api/baseQueryWithAnalytics.js

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))

const baseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const handledAccountId = localStorage.getItem('handledAccountId')
    if (handledAccountId) {
      headers.set('x-handled-account-id', handledAccountId)
    }

    return headers;
  },
});

export const baseQueryWithAnalyticsReauth = async (
  args,
  api,
  extraOptions
) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const isUnauthorized = result.error.status === 401;
    const message = result.error?.data?.message;

    // ❌ No refresh token → clear ONLY analytics session
    if (
      isUnauthorized &&
      message === "No refresh token found"
    ) {
      handleAnalyticsLogout();
      return result;
    }

    // 🔁 Try refresh
    if (isUnauthorized && !args.url.includes("/analytics/refresh")) {
      const refreshResult = await baseQuery(
        {
          url: "/api/auth/analytics/refresh",
          method: "POST",
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        handleAnalyticsLogout();
      }
    }
  }

  return result;
};

function handleAnalyticsLogout (){
    localStorage.removeItem('ga_property_id')
    localStorage.removeItem('ga_name')
    localStorage.removeItem('ga_website')
    
}