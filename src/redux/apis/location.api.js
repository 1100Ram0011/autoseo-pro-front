import { apiSlice } from "../backendApiSlice/apiSlice.js";

export const locationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLocationAutocomplete: builder.query({
      query: (query) => `/api/location/autocomplete?query=${encodeURIComponent(query)}`,
    }),
  }),
});

export const { useLazyGetLocationAutocompleteQuery } = locationApi;
