import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

export const countryCurrencyApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCountryCurrency: builder.query({
      query: () => '/api/countrycurrency',
    }),
  }),
})

export const {
  useGetCountryCurrencyQuery,
} = countryCurrencyApi
