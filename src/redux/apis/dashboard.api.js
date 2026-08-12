import { apiSlice } from '../backendApiSlice/apiSlice'

export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: (period = 'all') => `/api/dashboard/overview?period=${period}`,
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetDashboardOverviewQuery,
  useLazyGetDashboardOverviewQuery,
} = dashboardApi
