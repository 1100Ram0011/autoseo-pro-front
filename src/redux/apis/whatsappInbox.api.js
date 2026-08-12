// whatsappInbox.api.js

import { apiSlice } from "../backendApiSlice/apiSlice";

export const whatsappInboxApi =
    apiSlice.injectEndpoints({

        endpoints: builder => ({

            /*
            |--------------------------------------------------------------------------
            | CHATS
            |--------------------------------------------------------------------------
            */

            getWhatsappChats:
                builder.query({
                    query:
                        connectionId =>
                            `/api/whatsapp/inbox/chats/${connectionId}`,
                }),

            getWhatsappChatMessages:
                builder.query({
                    query:
                        ({
                            connectionId,
                            chatId,
                        }) =>
                            `/api/whatsapp/inbox/chats/${connectionId}/${encodeURIComponent(chatId)}`,
                }),


            /*
            |--------------------------------------------------------------------------
            | GROUPS
            |--------------------------------------------------------------------------
            */

            getGroups:
                builder.query({

                    query:
                        connectionId =>
                        ({
                            url:
                                `/api/whatsapp/inbox/groups/${connectionId}`,

                            method:
                                "GET",
                        }),

                    providesTags:
                        ["WhatsappGroups"],
                }),

            getGroupDetails:
                builder.query({

                    query:
                        ({
                            connectionId,
                            groupId,
                        }) => ({

                            url:
                                `/api/whatsapp/inbox/groups/${connectionId}/${encodeURIComponent(groupId)}`,

                            method:
                                "GET",
                        }),

                    providesTags:
                        (
                            result,
                            error,
                            {
                                groupId,
                            }
                        ) => [
                                {
                                    type:
                                        "WhatsappGroup",

                                    id:
                                        groupId,
                                },
                            ],
                }),

            getGroupMembers:
                builder.query({

                    query:
                        ({
                            connectionId,
                            groupId,
                        }) => ({

                            url:
                                `/api/whatsapp/inbox/groups/${connectionId}/${encodeURIComponent(groupId)}/members`,

                            method:
                                "GET",
                        }),

                    providesTags:
                        (
                            result,
                            error,
                            {
                                groupId,
                            }
                        ) => [
                                {
                                    type:
                                        "WhatsappGroupMembers",

                                    id:
                                        groupId,
                                },
                            ],
                }),

            /*
            |--------------------------------------------------------------------------
            | SEND NOW
            |--------------------------------------------------------------------------
            */

            sendWhatsAppInboxMessage:
                builder.mutation({

                    query:
                        data => ({

                            url:
                                "/api/whatsapp/messages/send",

                            method:
                                "POST",

                            body:
                                data,
                        }),
                }),

            /*
            |--------------------------------------------------------------------------
            | SCHEDULES
            |--------------------------------------------------------------------------
            */

            createSchedule:
                builder.mutation({

                    query:
                        data => ({

                            url:
                                "/api/whatsapp/messages/schedule",

                            method:
                                "POST",

                            body:
                                data,
                        }),

                    invalidatesTags:
                        ["WhatsappSchedules"],
                }),

            getSchedules:
                builder.query({

                    query:
                        () => ({

                            url:
                                "/api/whatsapp/messages/schedule",

                            method:
                                "GET",
                        }),

                    providesTags:
                        ["WhatsappSchedules"],
                }),

            getSchedule:
                builder.query({

                    query:
                        scheduleId => ({

                            url:
                                `/api/whatsapp/messages/schedule/${scheduleId}`,

                            method:
                                "GET",
                        }),

                    providesTags:
                        (
                            result,
                            error,
                            scheduleId
                        ) => [
                                {
                                    type:
                                        "WhatsappSchedule",

                                    id:
                                        scheduleId,
                                },
                            ],
                }),

            pauseSchedule:
                builder.mutation({

                    query:
                        scheduleId => ({

                            url:
                                `/api/whatsapp/messages/schedule/${scheduleId}/pause`,

                            method:
                                "POST",
                        }),

                    invalidatesTags:
                        [
                            "WhatsappSchedules",
                        ],
                }),

            resumeSchedule:
                builder.mutation({

                    query:
                        scheduleId => ({

                            url:
                                `/api/whatsapp/messages/schedule/${scheduleId}/resume`,

                            method:
                                "POST",
                        }),

                    invalidatesTags:
                        [
                            "WhatsappSchedules",
                        ],
                }),

            deleteSchedule:
                builder.mutation({

                    query:
                        scheduleId => ({

                            url:
                                `/api/whatsapp/messages/schedule/${scheduleId}`,

                            method:
                                "DELETE",
                        }),

                    invalidatesTags:
                        [
                            "WhatsappSchedules",
                        ],
                }),

            runNowSchedule:
                builder.mutation({

                    query:
                        scheduleId => ({

                            url:
                                `/api/whatsapp/messages/schedule/${scheduleId}/run-now`,

                            method:
                                "POST",
                        }),

                    invalidatesTags:
                        [
                            "WhatsappSchedules",
                        ],
                }),
        }),
    });

export const {

    /*
    |--------------------------------------------------------------------------
    | CHATS
    |--------------------------------------------------------------------------
    */

    useGetWhatsappChatsQuery,
    useGetWhatsappChatMessagesQuery,

    /*
    |--------------------------------------------------------------------------
    | GROUPS
    |--------------------------------------------------------------------------
    */

    useGetGroupsQuery,
    useGetGroupDetailsQuery,
    useGetGroupMembersQuery,

    /*
    |--------------------------------------------------------------------------
    | SEND
    |--------------------------------------------------------------------------
    */

    useSendWhatsAppInboxMessageMutation,

    /*
    |--------------------------------------------------------------------------
    | SCHEDULES
    |--------------------------------------------------------------------------
    */

    useCreateScheduleMutation,
    useGetSchedulesQuery,
    useGetScheduleQuery,
    usePauseScheduleMutation,
    useResumeScheduleMutation,
    useDeleteScheduleMutation,
    useRunNowScheduleMutation,

} = whatsappInboxApi;