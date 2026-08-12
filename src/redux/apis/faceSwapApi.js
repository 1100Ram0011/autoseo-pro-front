import { apiSlice } from '../backendApiSlice/apiSlice';
 
export const faceSwapApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
 
    // =========================
    // FACE SWAP APIs
    // =========================
 
    // 🔥 Init face swap (wallet / payu)
    initFaceSwap: builder.mutation({
      query: (payload) => ({
        url: "/api/pixverse/face-swap/init",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["FaceSwap"],
    }),
 
 
    initTemplateVideoPayment: builder.mutation({
      query: ({ templateId, redirectUrl, redirectParam, userInput = {} }) => ({
        url: '/api/pixverse/template/payment/init',
        method: 'POST',
        body: { templateId, redirectUrl, redirectParam, userInput },
      }),
    }),
 
    // 🔍 Get single request status
    getFaceSwapStatus: builder.query({
      query: (requestId) => `/api/pixverse/face-swap/${requestId}`,
      providesTags: (result, error, requestId) => [
        { type: 'FaceSwap', id: requestId },
      ],
    }),
 
    // 📜 Get all user requests (optional)
    getMyFaceSwaps: builder.query({
      query: () => `/api/pixverse/face-swap/my`,
      keepUnusedDataFor: 300,
      providesTags: ['FaceSwap'],
    }),

    getFaceSwapLineage: builder.query({
      query: (id) => `/api/pixverse/faceswaplineage/${id}`,
      providesTags: ['FaceSwap']
    }),

    retryFaceSwap: builder.mutation({
      query: (requestId) => ({
        url: `/api/pixverse/face-swap/${requestId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['FaceSwap'],
    }),

    deleteFaceSwapRequest: builder.mutation({
      query: (requestId) => ({
        url: `/api/pixverse/face-swap/${requestId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FaceSwap'],
    }),
 
    getSwapExternalVideos: builder.query({
      query: ({ category = "all" } = {}) =>
        `/api/pixverse/swap/external-videos?category=${category}`,
      keepUnusedDataFor: 300,
      providesTags: ['SwapTemplates'],
    }),
 
     templeteVideos: builder.query({
      query: () =>
        `/api/pixverse/prompt/approved`,
      keepUnusedDataFor: 300,
      providesTags: ['Templates'],
    }),
 
  }),
});
 
export const {
  useInitFaceSwapMutation,
  useInitTemplateVideoPaymentMutation,
  useGetFaceSwapStatusQuery,
  useGetMyFaceSwapsQuery,
  useGetFaceSwapLineageQuery,
  useRetryFaceSwapMutation,
  useDeleteFaceSwapRequestMutation,
  useGetSwapExternalVideosQuery,
  useTempleteVideosQuery
} = faceSwapApi;