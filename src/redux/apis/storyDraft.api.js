import { apiSlice } from '../backendApiSlice/apiSlice'

export const storyDraftApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /* ── Save generated story to MediaStore ── */
    saveStoryToMediaStore: builder.mutation({
      query: (formData) => ({
        url: '/api/story-drafts/save-to-media-store',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['ImagesLibrary'], // To refresh the library automatically
    }),

    /* ── Story history (published, from MediaStore) ── */
    getStoryHistory: builder.query({
      query: ({ page = 1, limit = 20 } = {}) =>
        `/api/story-drafts/history?page=${page}&limit=${limit}`,
      providesTags: ['StoryHistory'],
    }),

    /* ── Audio Search (Instagram Audio API) ── */
    searchAudio: builder.query({
      query: ({ q, accountId, audio_type }) => {
        let url = `/api/story-drafts/audio/search?accountId=${accountId}`
        if (q) url += `&q=${encodeURIComponent(q)}`
        if (audio_type) url += `&audio_type=${encodeURIComponent(audio_type)}`
        return url
      },
    }),
    searchItunesAudio: builder.query({
      query: ({ q, limit = 15 }) => {
        let url = `/api/story-drafts/audio/itunes-search?limit=${limit}`
        if (q) url += `&q=${encodeURIComponent(q)}`
        return url
      },
    }),
    getAudioMetadata: builder.query({
      query: ({ audioId, accountId }) => `/api/story-drafts/audio/${audioId}?accountId=${accountId}`,
    }),
    downloadStoryMedia: builder.query({
      query: (url) => ({
        url: `/api/story-drafts/download?url=${encodeURIComponent(url)}`,
        responseHandler: (response) => response.blob(),
      }),
    }),
    searchGiphy: builder.query({
      query: ({ q }) => {
        let url = `/api/story-drafts/giphy/search`
        if (q) url += `?q=${encodeURIComponent(q)}`
        return url
      },
    }),
  }),
})

export const {
  useSaveStoryToMediaStoreMutation,
  useGetStoryHistoryQuery,
  useLazySearchAudioQuery,
  useLazySearchItunesAudioQuery,
  useGetAudioMetadataQuery,
  useLazyDownloadStoryMediaQuery,
  useLazySearchGiphyQuery,
} = storyDraftApi
