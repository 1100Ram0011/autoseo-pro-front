// src/redux/api/templateApi.js
import { apiSlice } from '../backendApiSlice/apiSlice'
import { buildMongoPayload } from '../../utils/Payloadtransformer'

const isDev = (process.env.NODE_ENV === 'development')

export const templateApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ─────────────────────────────────────────────
        // GET TEMPLATES
        // GET /api/whatsapp?integrated_number=xxx
        // ─────────────────────────────────────────────
        msg91GetTemplates: builder.query({
            query: (integratedNumber) => ({
                url: '/api/whatsapp',
                params: { integrated_number: integratedNumber },
            }),
            transformResponse: (response) => response.data || [],
            providesTags: (result) =>
                Array.isArray(result)
                    ? [
                        ...result.map((t) => ({ type: 'Template', id: t._id })),
                        { type: 'Template', id: 'LIST' },
                    ]
                    : [{ type: 'Template', id: 'LIST' }],
        }),

        // ─────────────────────────────────────────────
        // GET WHATSAPP ACTIVATION (MSG91)
        // GET /api/whatsapp/activation
        // ─────────────────────────────────────────────
        msg91GetWhatsappActivation: builder.query({
            query: () => ({ url: '/api/whatsapp/activation', method: 'GET' }),
            transformResponse: (response) => response?.data || null,
            providesTags: [{ type: 'Template', id: 'ACTIVATION' }],
        }),

        // ─────────────────────────────────────────────
        // ADD MSG91 CLIENT
        // POST /api/msg91/add-client
        // body: { user_full_name, user_mobile_number, user_company_name,
        //         user_industry, services, user_name, user_email }
        // ─────────────────────────────────────────────
        msg91AddMsg91Client: builder.mutation({
            query: (clientData) => {
                if (isDev) {
                    console.group('👤 Add MSG91 Client Payload')
                    console.log(clientData)
                    console.groupEnd()
                }
                return {
                    url: '/api/whatsapp/campaign/add-client',
                    method: 'POST',
                    body: clientData,
                }
            },
            transformResponse: (response) => response?.data || response,
            transformErrorResponse: (response) => ({
                status: response.status,
                message: response.data?.message || 'Failed to add client',
            }),
            invalidatesTags: [{ type: 'Template', id: 'ACTIVATION' }],
        }),

        // ─────────────────────────────────────────────
        // UPLOAD HEADER MEDIA
        // POST /api/whatsapp/upload-media   (multipart/form-data)
        // body: FormData { whatsapp_number, media (File) }
        // Returns: { success, header_handle }
        // ─────────────────────────────────────────────
        msg91UploadMedia: builder.mutation({
            query: (formData) => ({
                url: '/api/whatsapp/upload-media',
                method: 'POST',
                body: formData,
                formData: true,
            }),
            transformResponse: (response) => response,
            transformErrorResponse: (response) => ({
                status: response.status,
                message: response.data?.message || 'Media upload failed'
            }),
        }),

        // ─────────────────────────────────────────────
        // CREATE TEMPLATE  (saves as DRAFT)
        // POST /api/whatsapp
        // ─────────────────────────────────────────────
        msg91CreateTemplate: builder.mutation({
            query: (args) => {
                const { integratedNumber, ...form } = args
                const payload = buildMongoPayload(form, String(integratedNumber))

                if (isDev) {
                    console.group('📝 Create Template Payload')
                    console.log(payload)
                    console.groupEnd()
                }

                return {
                    url: '/api/whatsapp',
                    method: 'POST',
                    body: payload,
                }
            },
            invalidatesTags: [{ type: 'Template', id: 'LIST' }],
        }),

        // ─────────────────────────────────────────────
        // UPDATE TEMPLATE  (DRAFT / REJECTED only)
        // PATCH /api/whatsapp/:templateId
        // ─────────────────────────────────────────────
        msg91UpdateTemplate: builder.mutation({
            query: ({ form, integratedNumber, templateId }) => {
                const payload = buildMongoPayload(form, integratedNumber)

                if (isDev) {
                    console.group('✏️ Update Template Request')
                    console.log('Template ID:', templateId)
                    console.log('Payload:', payload)
                    console.groupEnd()
                }

                return {
                    url: `/api/whatsapp/${templateId}`,
                    method: 'PATCH',
                    body: payload,
                }
            },
            invalidatesTags: (result, error, arg) => [
                { type: 'Template', id: arg.templateId },
                { type: 'Template', id: 'LIST' },
            ],
        }),

        // ─────────────────────────────────────────────
        // DELETE TEMPLATE
        // DELETE /api/whatsapp/delete?integrated_number=&template_name=&template_id=
        // ─────────────────────────────────────────────
        msg91DeleteTemplate: builder.mutation({
            query: ({ integratedNumber, templateName, template_id }) => ({
                url: '/api/whatsapp/delete',
                method: 'DELETE',
                params: {
                    integrated_number: integratedNumber,
                    template_name: templateName,
                    template_id: template_id,
                },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Template', id: `${arg.integratedNumber}-${arg.templateName}` },
                { type: 'Template', id: 'LIST' },
            ],
        }),

        // ─────────────────────────────────────────────
        // SYNC TEMPLATES FROM MSG91
        // POST /api/whatsapp/sync
        // ─────────────────────────────────────────────
        msg91SyncTemplates: builder.mutation({
            query: (integratedNumber) => ({
                url: '/api/whatsapp/sync',
                method: 'POST',
                body: { integrated_number: integratedNumber },
            }),
            invalidatesTags: [{ type: 'Template', id: 'LIST' }],
        }),

        // ─────────────────────────────────────────────
        // SUBMIT TEMPLATE TO MSG91
        // POST /api/whatsapp/:templateId/submit
        // ─────────────────────────────────────────────
        msg91SubmitTemplate: builder.mutation({
            query: (templateId) => ({
                url: `/api/whatsapp/${templateId}/submit`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Template', id },
                { type: 'Template', id: 'LIST' },
            ],
        }),

        // ─────────────────────────────────────────────
        // CLONE TEMPLATE  (locked → new DRAFT)
        // POST /api/whatsapp/:templateId/clone
        // ─────────────────────────────────────────────
        msg91CloneTemplate: builder.mutation({
            query: (templateId) => ({
                url: `/api/whatsapp/${templateId}/clone`,
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'Template', id: 'LIST' }],
        }),

        // ─────────────────────────────────────────────
        // SEND WHATSAPP CAMPAIGN
        // POST /api/whatsapp/campaign/send
        // ─────────────────────────────────────────────
        msg91SendWhatsappCampaign: builder.mutation({
            query: (data) => ({
                url: '/api/whatsapp/campaign/send',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'whatsappCampaign', id: 'LIST' }, 'Credits', 'CreditLogs'],
        }),

        // ─────────────────────────────────────────────
        // GET ALL CAMPAIGNS
        // GET /api/whatsapp/campaign
        // ─────────────────────────────────────────────
        msg91GetAllCampaigns: builder.query({
            query: () => ({ url: '/api/whatsapp/campaign', method: 'GET' }),
            transformResponse: (response) => response?.campaigns || [],
            providesTags: ['whatsappCampaign'],
        }),

        // ─────────────────────────────────────────────
        // GET SINGLE CAMPAIGN STATUS
        // GET /api/whatsapp/campaign/:campaignId
        // ─────────────────────────────────────────────
        msg91GetCampaignStatus: builder.query({
            query: (campaignId) => ({
                url: `/api/whatsapp/campaign/${campaignId}`,
                method: 'GET',
            }),
            transformResponse: (response) => response?.campaign,
            providesTags: (result, error, id) => [{ type: 'whatsappCampaign', id }],
        }),

        // ─────────────────────────────────────────────
        // GET MSG91 WHATSAPP REPORT LOGS
        // GET /api/whatsapp/campaign/msg91-logs
        // ─────────────────────────────────────────────
        msg91GetMsg91WhatsappLogs: builder.query({
            query: ({ startDate, endDate, limit, fields, requestId } = {}) => {
                const params = new URLSearchParams({ startDate, endDate })
                if (limit) params.append('limit', limit)
                if (fields) params.append('fields', fields)
                if (requestId) params.append('requestId', requestId)
                return {
                    url: `/api/whatsapp/campaign/msg91-logs?${params.toString()}`,
                    method: 'GET',
                }
            },
            transformResponse: (response) => response?.data,
            providesTags: ['whatsappMsg91Logs'],
        }),

        // ─────────────────────────────────────────────
        // SYNC MSG91 WHATSAPP REPORT LOGS
        // POST /api/whatsapp/campaign/sync-logs/:campaignId
        // ─────────────────────────────────────────────
        msg91SyncCampaignLogs: builder.mutation({
            query: (campaignId) => ({
                url: `/api/whatsapp/campaign/sync-logs/${campaignId}`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'whatsappCampaign', id }],
        }),


        // Onboarding

        submitOnboardingForm: builder.mutation({
            query: (body) => ({
                url: '/api/91/whatsapp/onboarding',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Onboarding'],
        }),

        confirmFbAdmin: builder.mutation({
            query: (id) => ({
                url: `/api/91/whatsapp/onboarding/${id}/fb-confirm`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Onboarding'],
        }),

        submitConnectionRequest: builder.mutation({
            query: (id) => ({
                url: `/api/91/whatsapp/onboarding/${id}/submit`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Onboarding'],
        }),

        cancelOnboardingRequest: builder.mutation({
            query: (id) => ({
                url: `/api/91/whatsapp/onboarding/${id}/cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Onboarding'],
        }),

        getMyOnboardingRequests: builder.query({
            query: ({ status } = {}) => ({
                url: '/api/91/whatsapp/onboarding',
                params: status ? { status } : {},
            }),
            providesTags: ['Onboarding'],
        }),

        // ─────────────────────────────────────────────
        // ADMIN — Get all onboarding requests
        // GET /api/91/whatsapp/onboarding/admin/all
        // ─────────────────────────────────────────────
        adminGetAllOnboardingRequests: builder.query({
            query: ({ status, page = 1, limit = 20 } = {}) => ({
                url: '/api/91/whatsapp/onboarding/admin/all',
                params: { ...(status && { status }), page, limit },
            }),
            providesTags: ['Onboarding'],
        }),

        // ─────────────────────────────────────────────
        // ADMIN — Approve / partial approve request
        // PATCH /api/91/whatsapp/onboarding/:id/approve
        // body: { approvedNumbers?, rejectedNumbers?, adminNotes? }
        // ─────────────────────────────────────────────
        adminApproveOnboardingRequest: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/api/91/whatsapp/onboarding/${id}/approve`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Onboarding'],
        }),

        // ─────────────────────────────────────────────
        // ADMIN — Reject entire request
        // PATCH /api/91/whatsapp/onboarding/:id/reject
        // body: { rejectionReason?, adminNotes? }
        // ─────────────────────────────────────────────
        adminRejectOnboardingRequest: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/api/91/whatsapp/onboarding/${id}/reject`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Onboarding'],
        }),

        connectEmbeddedWhatsapp: builder.mutation({
            query: (body) => ({
                url: "/api/whatsapp/campaign/connect-embedded",
                method: "POST",
                body,
            }),
            invalidatesTags: ["MetaWhatsapp"],
        }),


    }),
    overrideExisting: false,
})

export const {
    useMsg91GetTemplatesQuery,
    useMsg91GetWhatsappActivationQuery,
    useMsg91AddMsg91ClientMutation,
    useMsg91UploadMediaMutation,
    useMsg91CreateTemplateMutation,
    useMsg91UpdateTemplateMutation,
    useMsg91DeleteTemplateMutation,
    useMsg91SyncTemplatesMutation,
    useMsg91SubmitTemplateMutation,
    useMsg91CloneTemplateMutation,
    useMsg91SendWhatsappCampaignMutation,
    useMsg91GetAllCampaignsQuery,
    useMsg91GetCampaignStatusQuery,
    useMsg91GetMsg91WhatsappLogsQuery,
    useMsg91SyncCampaignLogsMutation,

    // Submission
    useSubmitOnboardingFormMutation,
    useConfirmFbAdminMutation,
    useSubmitConnectionRequestMutation,
    useCancelOnboardingRequestMutation,
    useGetMyOnboardingRequestsQuery,

    useAdminGetAllOnboardingRequestsQuery,
    useAdminApproveOnboardingRequestMutation,
    useAdminRejectOnboardingRequestMutation,

    useConnectEmbeddedWhatsappMutation,
} = templateApi