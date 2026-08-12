import { apiSlice } from '../backendApiSlice/apiSlice'

export const studioApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getScrapedAssets: builder.query({
      query: () => '/api/studio/assets',
      providesTags: ['ScrapedAssets'],
    }),
  }),
})

export const { useGetScrapedAssetsQuery } = studioApi
