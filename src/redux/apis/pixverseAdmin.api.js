import { apiSlice } from '@/redux/backendApiSlice/apiSlice'

// ─── Tag types ────────────────────────────────────────────────────
const FACESWAP_TAG = 'PixverseFaceSwap'
const PROMPT_TAG   = 'PixversePrompt'
const GENERIC_TAG  = 'PixverseGeneric'

// ─── Helper ───────────────────────────────────────────────────────
const toParams = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .reduce((acc, [k, v]) => {
      acc.set(k, String(v))
      return acc
    }, new URLSearchParams())
    .toString()

// ─────────────────────────────────────────────────────────────────
// transformResponse
//
// Our backend always sends:
//   { success: true, data: { items: [...], total: N, fetchedAt: ... } }
//
// But historically some endpoints sent data.list or data.data.list.
// We handle every variant here so a shape mismatch never silently
// results in an empty grid (the bug seen in the screenshot).
// ─────────────────────────────────────────────────────────────────
const transformList = (response) => {
  if (!response?.success) {
    throw new Error(response?.error?.message ?? 'Pixverse API error')
  }

  const d = response.data ?? {}

  // ── Resolve items ──────────────────────────────────────────────
  let items = []

  if (Array.isArray(d.items) && d.items.length > 0) {
    // Standard shape: { data: { items: [...] } }
    items = d.items
  } else if (Array.isArray(d.list) && d.list.length > 0) {
    // Legacy shape: { data: { list: [...] } }
    items = d.list
  } else if (Array.isArray(d.data) && d.data.length > 0) {
    // Nested shape: { data: { data: [...] } }
    items = d.data
  } else if (d.data && !Array.isArray(d.data) && Array.isArray(d.data?.list)) {
    // Double-nested: { data: { data: { list: [...] } } }
    items = d.data.list
  } else if (Array.isArray(d)) {
    // Bare array at data level (shouldn't happen but safe fallback)
    items = d
  }

  // ── Resolve total ──────────────────────────────────────────────
  const total =
    Number(
      d.total ??
      d.data?.total ??
      items.length
    ) || 0

  if (items.length === 0 && total > 0) {
    // This is the exact bug from the screenshot:
    // Backend said total=635 but items=[] — log it clearly
    console.warn(
      '[pixverseAdmin.api] transformList: total=%d but items is empty. Raw data keys: %s',
      total,
      Object.keys(d).join(', ')
    )
  }

  return {
    items,
    total,
    fetchedAt:       d.fetchedAt       ?? new Date().toISOString(),
    primaryCategory: d.primaryCategory ?? null,
    type:            d.type            ?? null,
  }
}

// ─── Shared merge (infinite scroll) ──────────────────────────────
const mergePages = (currentCache, newPage, { arg }) => {
  // offset=0 means a fresh load — replace, don't append
  if (!arg?.offset || arg.offset === 0) return newPage

  const existingIds = new Set(
    currentCache.items.map((i) => i.feed_id || i.feedId || i._id)
  )

  return {
    ...newPage,
    items: [
      ...currentCache.items,
      ...newPage.items.filter(
        (i) => !existingIds.has(i.feed_id || i.feedId || i._id)
      ),
    ],
  }
}

// ─── Slice ────────────────────────────────────────────────────────
export const pixverseAdminApi = apiSlice.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({

    // ══════════════════════════════════════════════════════════════
    // GENERIC — fully dynamic primary_category
    // GET /api/pixverse/templates?primary_category=X&limit=N&offset=N
    // ══════════════════════════════════════════════════════════════
    getTemplates: builder.query({
      query: ({ primaryCategory = 1, limit = 10, offset = 0 } = {}) =>
        `/api/pixverse/templates?${toParams({ primary_category: primaryCategory, limit, offset })}`,

      // Include primaryCategory so different categories are cached separately
      serializeQueryArgs: ({ queryArgs }) =>
        `generic-cat${queryArgs?.primaryCategory ?? 1}-lim${queryArgs?.limit ?? 10}`,

      transformResponse: transformList,
      merge: mergePages,
      forceRefetch: ({ currentArg, previousArg }) =>
        JSON.stringify(currentArg) !== JSON.stringify(previousArg),
      keepUnusedDataFor: 300,

      providesTags: (result, _err, arg) => {
        const base = [{ type: GENERIC_TAG, id: `CAT_${arg?.primaryCategory ?? 1}_LIST` }]
        if (!result?.items?.length) return base
        return [
          ...base,
          ...result.items.map((i) => ({
            type: GENERIC_TAG,
            id: i.feed_id || i.feedId || i._id,
          })),
        ]
      },
    }),

    // ══════════════════════════════════════════════════════════════
    // FACE-SWAP  (primary_category = 3)
    // ══════════════════════════════════════════════════════════════

    // GET /api/pixverse/faceswap?limit=N&offset=N
    getFaceSwapTemplates: builder.query({
      query: ({ limit = 10, offset = 0 } = {}) =>
        `/api/pixverse/faceswap?${toParams({ limit, offset })}`,

      serializeQueryArgs: ({ queryArgs }) =>
        `faceswap-lim${queryArgs?.limit ?? 10}`,

      transformResponse: transformList,
      merge: mergePages,
      forceRefetch: ({ currentArg, previousArg }) =>
        JSON.stringify(currentArg) !== JSON.stringify(previousArg),
      keepUnusedDataFor: 300,

      providesTags: (result) => {
        const base = [{ type: FACESWAP_TAG, id: 'LIST' }]
        if (!result?.items?.length) return base
        return [
          ...base,
          ...result.items.map((i) => ({
            type: FACESWAP_TAG,
            id: i.feed_id || i.feedId || i._id,
          })),
        ]
      },
    }),

    // POST /api/pixverse/faceswap/approve
    approveFaceSwapTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/pixverse/faceswap/approve',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, err) =>
        err
          ? []
          : [
              { type: FACESWAP_TAG, id: 'LIST' },
              { type: FACESWAP_TAG, id: 'APPROVED' },
            ],
    }),

    // GET /api/pixverse/faceswap/approved?limit=N&page=N
    getApprovedFaceSwapTemplates: builder.query({
      query: ({ limit = 20, page = 1 } = {}) =>
        `/api/pixverse/faceswap/approved?${toParams({ limit, page })}`,

      transformResponse: transformList,
      providesTags: [{ type: FACESWAP_TAG, id: 'APPROVED' }],
      keepUnusedDataFor: 60,
    }),

    // DELETE /api/pixverse/faceswap/approved/:id
    deleteFaceSwapTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/pixverse/faceswap/approved/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: FACESWAP_TAG, id: 'APPROVED' }],
    }),

    // ══════════════════════════════════════════════════════════════
    // PROMPT TEMPLATES  (primary_category = 1)
    // ══════════════════════════════════════════════════════════════

    // GET /api/pixverse/prompt?limit=N&offset=N
    getPromptTemplates: builder.query({
      query: ({ limit = 10, offset = 0 } = {}) =>
        `/api/pixverse/prompt?${toParams({ limit, offset })}`,

      serializeQueryArgs: ({ queryArgs }) =>
        `prompt-lim${queryArgs?.limit ?? 10}`,

      transformResponse: transformList,
      merge: mergePages,
      forceRefetch: ({ currentArg, previousArg }) =>
        JSON.stringify(currentArg) !== JSON.stringify(previousArg),
      keepUnusedDataFor: 300,

      providesTags: (result) => {
        const base = [{ type: PROMPT_TAG, id: 'LIST' }]
        if (!result?.items?.length) return base
        return [
          ...base,
          ...result.items.map((i) => ({
            type: PROMPT_TAG,
            id: i.feed_id || i.feedId || i._id,
          })),
        ]
      },
    }),

    // POST /api/pixverse/prompt/approve
    approvePromptTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/pixverse/prompt/approve',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, err) =>
        err
          ? []
          : [
              { type: PROMPT_TAG, id: 'LIST' },
              { type: PROMPT_TAG, id: 'APPROVED' },
            ],
    }),

    // GET /api/pixverse/prompt/approved?limit=N&page=N
    getApprovedPromptTemplates: builder.query({
      query: ({ limit = 20, page = 1 } = {}) =>
        `/api/pixverse/prompt/approved?${toParams({ limit, page })}`,

      transformResponse: transformList,
      providesTags: [{ type: PROMPT_TAG, id: 'APPROVED' }],
      keepUnusedDataFor: 60,
    }),

    // DELETE /api/pixverse/prompt/approved/:id
    deletePromptTemplate: builder.mutation({
      query: (id) => ({
        url: `/api/pixverse/prompt/approved/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: PROMPT_TAG, id: 'APPROVED' }],
    }),
  }),
})

// ─── Exported hooks ───────────────────────────────────────────────

export const {
  // Generic (dynamic primary_category)
  useLazyGetTemplatesQuery,

  // Face-Swap
  useLazyGetFaceSwapTemplatesQuery,
  useApproveFaceSwapTemplateMutation,
  useGetApprovedFaceSwapTemplatesQuery,
  useDeleteFaceSwapTemplateMutation,

  // Prompt
  useLazyGetPromptTemplatesQuery,
  useApprovePromptTemplateMutation,
  useGetApprovedPromptTemplatesQuery,
  useDeletePromptTemplateMutation,
} = pixverseAdminApi