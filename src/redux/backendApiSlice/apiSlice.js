import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'

import { setAuth, clearAuth, setGuest } from '@/redux/app/auth.slice'
import { decryptResponse } from '@/utils/cryptoUtil'
import toast from 'react-hot-toast'

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))

const mutex = new Mutex()

const baseQuery = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  credentials: 'include',

  prepareHeaders: (headers, { getState }) => {
    const reduxToken = getState()?.auth?.token

    const localToken =
      localStorage.getItem('accessToken') || localStorage.getItem('token')

    const token = reduxToken || localToken

    if (token && token !== 'undefined' && token !== 'null') {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const handledAccountId = localStorage.getItem('handledAccountId')
    // console.log("handledAccountId", handledAccountId);
    if (handledAccountId) {
      headers.set('x-handled-account-id', handledAccountId)
    }

    // Brave uses a Chrome-compatible User-Agent. Its JS API lets us preserve
    // the real browser name even when client-hint headers are unavailable.
    if (typeof navigator !== 'undefined' && navigator.brave) {
      headers.set('x-browser-name', 'Brave')
    }

    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // wait if refresh already running
  await mutex.waitForUnlock()

  let result = await baseQuery(args, api, extraOptions)

  if (result?.error?.status === 401) {
    // prevent multiple refresh calls
    if (!mutex.isLocked()) {
      const release = await mutex.acquire()

      try {
        const refreshResult = await baseQuery(
          {
            url: '/api/auth/user/refresh',
            method: 'POST',
            credentials: 'include',
          },
          api,
          extraOptions
        )

        if (refreshResult?.data?.accessToken) {
          const state = api.getState()

          const user = state?.auth?.user

          // save new access token
          api.dispatch(
            setAuth({
              user,
              token: refreshResult.data.accessToken,
            })
          )

          localStorage.setItem('accessToken', refreshResult.data.accessToken)

          // retry original request
          result = await baseQuery(args, api, extraOptions)
        } else {
          api.dispatch(clearAuth())

          // guest login
          const guestResult = await baseQuery(
            {
              url: '/api/auth/user/guest-login',
              method: 'POST',
              credentials: 'include',
            },
            api,
            extraOptions
          )

          if (guestResult?.data?.accessToken) {
            const decryptedUser = decryptResponse(guestResult.data.user)

            api.dispatch(
              setGuest({
                user: decryptedUser,
                encryptedUser: guestResult.data.user,
                token: guestResult.data.accessToken,
              })
            )

            result = await baseQuery(args, api, extraOptions)
          }
        }
      } finally {
        release()
      }
    } else {
      // wait for refresh to complete
      await mutex.waitForUnlock()

      result = await baseQuery(args, api, extraOptions)
    }
  } else if (result?.error?.status === 403) {
    const errorMessage = result?.error?.data?.message
    const hasDelegationId = localStorage.getItem('handledAccountId')

    if (hasDelegationId && errorMessage?.includes('delegation')) {
      localStorage.removeItem('handledAccountId')
      localStorage.removeItem('handledAccountName')
      api.dispatch(apiSlice.util.resetApiState())

      toast.error(
        'Workspace delegation access was revoked. Switched back to your personal workspace.'
      )

      setTimeout(() => {
        window.location.href = `/video-generator?tab=backend&t=${Date.now()}`
      }, 800)
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,

  tagTypes: [
    'User',
    'Devices',
    'Users',
    'Business',
    'SocialLinkAnalysis',
    'SocialAccount',
    'SocialPost',
    'FacebookAnalytics',
    'YoutubeAnalytics',
    'TwitterAnalytics',
    'ThreadsAnalytics',
    'SocialAutomation',
    'Credits',
    'CreditLogs',
    'PersonalEvent',
    'Notifications',
    'NotificationsCount',
    'YoutubePlaylists',
    'StoryDraft',
    'StoryDrafts',
    'StoryHistory',
    'EmailAuth',
  ],

  endpoints: () => ({}),
})
