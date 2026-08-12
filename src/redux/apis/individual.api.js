// individual.api.js
// Covers all 3 backend endpoints:
//   POST /api/individual/submit         → submitIndividualAnalysisProfile
//   GET  /api/individual/analysis       → getIndividualAnalysis  (polling)
//   POST /api/individual/retry          → retryIndividualAnalysis

import { apiSlice } from '../backendApiSlice/apiSlice'
// ─── tag constants ─────────────────────────────────────────────────────────────
// Keep in sync with other slices that touch the same data
const TAGS = {
  PROFILE: 'IndividualProfile',
  ANALYSIS: 'IndividualAnalysis',
  USER: 'User',
}

export const individualAnalysisApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
     // ── 1. Submit profile (photo + logo + description + socials) ──────────────
    // Matches: POST /api/individual/submit
    // multer expects multipart/form-data — do NOT set Content-Type header,
    // RTK Query / fetch will set it automatically with the correct boundary.
    submitIndividualAnalysisProfile: builder.mutation({
      query: (formData) => ({
        url: '/api/individual-analysis/submit',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        { type: TAGS.PROFILE, id: 'ME' },
        { type: TAGS.ANALYSIS, id: 'ME' },
        TAGS.USER,
      ],
    }),

    updateIndividualAnalysisProfile: builder.mutation({
      query: (formData) => ({
        url: '/api/individual-analysis/profile',
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: [
        { type: TAGS.PROFILE, id: 'ME' },
        { type: TAGS.ANALYSIS, id: 'ME' },
        TAGS.USER,
      ],
    }),
       // ── 2. Get analysis result / poll status ──────────────────────────────────
    // Matches: GET /api/individual/analysis
    // Call this every 5 s after submit until analysisStatus === "completed" | "failed"
    // Response shape (pending/processing):
    //   { success, data: { profileId, analysisStatus, analysisError, analysisResult: null } }
    // Response shape (completed):
    //   { success, data: { profileId, analysisStatus, analysisCompletedAt,
    //                      photoUrl, logoUrl, growthScorecard,
    //                      confidenceLevels, analysisResult } }

    getIndividualAnalysis: builder.query({
      query: () => ({
        url: '/api/individual-analysis/analysis',
        method: 'GET',
      }),
      providesTags: [{ type: TAGS.ANALYSIS, id: 'ME' }],
        // keep cached result for 10 s between manual refetch calls
      keepUnusedDataFor: 10,
    }),
  // ── 3. Retry failed analysis (no re-upload needed) ────────────────────────
    // Matches: POST /api/individual/retry
    // Only call when analysisStatus === "failed"
    // Backend re-runs Claude using already-uploaded S3 files
    retryIndividualAnalysis: builder.mutation({
      query: () => ({
        url: '/api/individual-analysis/retry',
        method: 'POST',
      }),
       // invalidate so polling query picks up the new "pending" status immediately
      invalidatesTags: [{ type: TAGS.ANALYSIS, id: 'ME' }],
    }),
  }),
// do not override existing endpoints from other slices
  overrideExisting: false,
})

export const {
  useSubmitIndividualAnalysisProfileMutation,
  useUpdateIndividualAnalysisProfileMutation,
  useGetIndividualAnalysisQuery,
  useLazyGetIndividualAnalysisQuery,

  useRetryIndividualAnalysisMutation,
} = individualAnalysisApi
