import { apiSlice } from '@/redux/backendApiSlice/apiSlice';

const PIXVERSE_TAG = 'PixverseTemplate';

/**
 * Build URLSearchParams from a plain object, omitting null/undefined values.
 */
const toParams = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .reduce((acc, [k, v]) => { acc.set(k, String(v)); return acc; }, new URLSearchParams())
    .toString();

// ─── Slice ────────────────────────────────────────────────────────

export const pixverseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    /**
     * GET /api/pixverse/templates
     *
     * Args (all optional — mirrors backend PIXVERSE_DEFAULTS):
     * {
     *   limit              number   Items per page          (default 10)
     *   offset             number   Pagination offset        (default 0)
     *   primary_category   number   Pixverse primary cat ID  (default 1)
     *   secondary_category number   Pixverse secondary ID    (default 113)
     *   platform           string   Platform                 (default "web")
     *   current            number   Current page flag        (default 1)
     *   web_offset         number   Web-specific offset      (default 0)
     *   app_offset         number   App-specific offset      (default 0)
     * }
     *
     * Returns the full backend envelope:
     * {
     *   success: true,
     *   data: {
     *     ErrCode: 0,
     *     Resp: {
     *       data: PixverseItem[],
     *       total: number,
     *       next_offset: number,
     *     }
     *   },
     *   meta: { limit, offset, fetchedAt }
     * }
     *
     * Convenience selectors are exported below so callers never need
     * to navigate the nested shape manually.
     */
    getPixverseTemplates: builder.query({
      query: ({
        limit = 10,
        offset = 0,
        primary_category,
        secondary_category,
        platform,
        current,
        web_offset,
        app_offset,
      } = {}) => {
        const qs = toParams({
          limit,
          offset,
          primary_category,
          secondary_category,
          platform,
          current,
          web_offset,
          app_offset,
        });
        return `/api/pixverse/video-templates?${qs}`;
      },

      // Cache each unique {limit, offset, ...} combo independently
      serializeQueryArgs: ({ queryArgs }) => JSON.stringify(queryArgs ?? {}),

      // Provide cache tags so approvals can invalidate the list
      providesTags: (result, _err, args) => {
        const base = [{ type: PIXVERSE_TAG, id: 'LIST' }];
        if (!result?.data?.Resp?.data) return base;
        return [
          ...base,
          ...result.data.Resp.data.map((item) => ({
            type: PIXVERSE_TAG,
            id: item.feed_id,
          })),
        ];
      },

      // Normalize the nested response so consumers get a flat, predictable shape:
      // { items, total, nextOffset, fetchedAt, raw }
      transformResponse: (response) => {
        if (!response?.success) {
          // Surface the error message for RTK Query's `error` field
          throw new Error(response?.error?.message ?? 'Pixverse API error');
        }
        const resp      = response.data?.Resp ?? {};
        const items     = Array.isArray(resp.data) ? resp.data : [];
        const total     = resp.total ?? items.length;
        const nextOffset = resp.next_offset ?? null;
        return {
          items,
          total,
          nextOffset,
          fetchedAt: response.meta?.fetchedAt ?? new Date().toISOString(),
          /** Keep the raw envelope in case callers need it */
          raw: response,
        };
      },

      // Merge pages when the caller increments `offset` (infinite scroll)
      // Remove this block if you prefer discrete page navigation.
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.offset || arg.offset === 0) {
          // Fresh fetch — replace cache
          return newItems;
        }
        // Append to existing items, dedup by feed_id
        const existingIds = new Set(currentCache.items.map((i) => i.feed_id));
        return {
          ...newItems,
          items: [
            ...currentCache.items,
            ...newItems.items.filter((i) => !existingIds.has(i.feed_id)),
          ],
        };
      },

      // Refetch when offset/limit changes even if merged shape didn't change
      forceRefetch: ({ currentArg, previousArg }) =>
        JSON.stringify(currentArg) !== JSON.stringify(previousArg),

      // Keep the cache alive for 5 minutes after the last subscriber unmounts
      keepUnusedDataFor: 300,
    }),

    /**
     * POST /api/pixverse/templates/approve  (optimistic — wired for future DB endpoint)
     *
     * Body: {
     *   feed_id    number
     *   video_id   number
     *   title      string
     *   url        string
     *   first_frame string
     *   duration   number
     *   model      string
     *   creator    string
     * }
     *
     * On success → invalidates the LIST tag so the grid refetches.
     * The endpoint is marked `skipToken`-safe: if you haven't built the
     * server route yet, just keep the optimistic update and comment out
     * invalidatesTags temporarily.
     */
    approvePixverseTemplate: builder.mutation({
      query: (body) => ({
        url: '/api/pixverse/templates/approve',
        method: 'POST',
        body,
      }),

      // Optimistic update: immediately mark the item as approved in the cache
      // so the UI responds without waiting for the round-trip.
      onQueryStarted: async (body, { dispatch, queryFulfilled, getState }) => {
        // Find every cached query result that contains this feed_id and patch it.
        // This is intentionally broad — works across different limit/offset combos.
        const patchResults = [];
        try {
          for (const { endpointName, originalArgs } of Object.values(
            pixverseApi.util.selectInvalidatedBy(getState(), [
              { type: PIXVERSE_TAG, id: 'LIST' },
            ])
          )) {
            if (endpointName !== 'getPixverseTemplates') continue;
            const patch = dispatch(
              pixverseApi.util.updateQueryData(
                'getPixverseTemplates',
                originalArgs,
                (draft) => {
                  const item = draft.items?.find((i) => i.feed_id === body.feed_id);
                  if (item) item._approved = true;
                }
              )
            );
            patchResults.push(patch);
          }
          await queryFulfilled;
        } catch {
          // Roll back all optimistic patches on failure
          patchResults.forEach((p) => p.undo());
        }
      },

      invalidatesTags: (_result, error) =>
        error ? [] : [{ type: PIXVERSE_TAG, id: 'LIST' }],
    }),
  }),

  // Prevent throwing if endpoints are injected more than once (HMR-safe)
  overrideExisting: false,
});

// ─── Auto-generated hooks ─────────────────────────────────────────

export const {
  /**
   * useGetPixverseTemplatesQuery(args?, options?)
   *
   * @example
   * const { data, isLoading, isError, error, refetch } =
   *   useGetPixverseTemplatesQuery({ limit: 20, offset: 0 });
   *
   * // data shape (after transformResponse):
   * // { items: PixverseItem[], total: number, nextOffset: number|null, fetchedAt: string }
   */
  useGetPixverseTemplatesQuery,

  /**
   * useLazyGetPixverseTemplatesQuery()
   *
   * Useful when you want to defer the fetch (e.g. on button click).
   *
   * @example
   * const [fetchTemplates, { data, isLoading }] = useLazyGetPixverseTemplatesQuery();
   * // Call fetchTemplates({ limit, offset }) manually.
   */
  useLazyGetPixverseTemplatesQuery,

  /**
   * useApprovePixverseTemplateMutation()
   *
   * @example
   * const [approveTemplate, { isLoading: isApproving }] =
   *   useApprovePixverseTemplateMutation();
   * await approveTemplate({ feed_id, video_id, title, url, ... });
   */
  useApprovePixverseTemplateMutation,
} = pixverseApi;

// ─── Selector helpers ─────────────────────────────────────────────
// Pre-built selectors you can pass to useSelector() when you need
// the cached data outside of a component that holds a query hook.

/**
 * selectPixverseTemplates(state, queryArgs)
 *
 * @example
 * const items = useSelector((state) =>
 *   selectPixverseTemplates(state, { limit: 10, offset: 0 })
 * );
 */
export const selectPixverseTemplates = (state, queryArgs) =>
  pixverseApi.endpoints.getPixverseTemplates.select(queryArgs)(state)?.data?.items ?? [];

export const selectPixverseTotal = (state, queryArgs) =>
  pixverseApi.endpoints.getPixverseTemplates.select(queryArgs)(state)?.data?.total ?? 0;