import { apiSlice } from "../backendApiSlice/apiSlice";


export const reportApi = apiSlice.injectEndpoints({
  overrideExisting: false,

  endpoints: (builder) => ({
    // ➕ Create Report
    createReport: builder.mutation({
      query: (data) => ({
        url: "/api/report",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Report"],
    }),

    // 📥 Get All Reports (Admin)
    getReports: builder.query({
      query: () => ({
        url: "/api/report",
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

      getReportById: builder.query({
      query: (id) => ({
        url: `/api/report/${id}`,
        method: "GET",
      }),
      providesTags: ["Report"],
    }),

    // 🔄 Update Report Status
    updateReport: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/report/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Report"],
    }),

    // ❌ Delete Report
    deleteReport: builder.mutation({
      query: (id) => ({
        url: `/api/report/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Report"],
    }),
  }),
});

export const {
  useCreateReportMutation,
  useGetReportsQuery,
  useGetReportByIdQuery,
  useUpdateReportMutation,
  useDeleteReportMutation,
} = reportApi;