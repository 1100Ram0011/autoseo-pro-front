import { setAuth, clearAuth } from '@/redux/app/auth.slice'
import { apiSlice } from '@/redux/backendApiSlice/apiSlice'
import { decryptResponse } from '@/utils/cryptoUtil'
import { androidSaveAuth, androidClearAuth } from '@/utils/androidBridge'
import { connectSocket } from '@/services/socket.service'

const persistAuthResponse = (dispatch, data) => {
  if (!data?.user || !data?.accessToken) return

  const user = decryptResponse(data.user)
  if (!user) return

  dispatch(setAuth({ user, token: data.accessToken, encryptedUser: data.user }))
  // dispatch(apiSlice.util.resetApiState()) //no need here ajay its breaking the flow ...

  androidSaveAuth(data.accessToken, user)
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendSignupOtp: builder.mutation({
      query: (data) => ({
        url: '/api/auth/user/signup/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    verifySignupOtp: builder.mutation({
      query: (data) => ({
        url: '/api/auth/user/signup/verify-otp',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          persistAuthResponse(dispatch, data)
          dispatch(apiSlice.util.resetApiState())
        } catch {
          // Keep the current auth/guest state intact on invalid OTP responses.
        }
      },
    }),

    sendLoginOtp: builder.mutation({
      query: (data) => ({
        url: '/api/auth/user/login/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    verifyLoginOtp: builder.mutation({
      query: (data) => ({
        url: '/api/auth/user/login/verify-otp',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          persistAuthResponse(dispatch, data)
          dispatch(apiSlice.util.resetApiState())
        } catch {
          // Do not clear auth on OTP validation failure; the user should stay in the OTP modal.
        }
      },
    }),

    resendOtp: builder.mutation({
      query: ({ identifier, otpMethod = 'email' }) => ({
        url: '/api/auth/user/resend-otp',
        method: 'POST',
        body: { identifier, otpMethod },
      }),
    }),

    completeSignup: builder.mutation({
      query: ({ name, email, phone, countryCode, parentId }) => ({
        url: '/api/auth/user/signup/complete',
        method: 'POST',
        body: { name, email, phone, countryCode, parentId },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          persistAuthResponse(dispatch, data)
          dispatch(apiSlice.util.resetApiState())
        } catch {
          // Preserve the current auth/guest session when signup completion fails.
        }
      },
    }),

    logOut: builder.mutation({
      query: () => ({
        url: '/api/auth/user/logout',
        method: 'POST',
        credentials: 'include',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(clearAuth())
        dispatch(apiSlice.util.resetApiState())
        androidClearAuth()
      },
    }),

    getLoggedInUser: builder.query({
      query: () => '/api/auth/user/me',
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const hasDelegationBefore = localStorage.getItem('handledAccountId')
        try {
          const { data } = await queryFulfilled
          if (data?.user) {
            const user = decryptResponse(data.user)
            if (user) {
              dispatch(setAuth({ user, encryptedUser: data.user }))
            }
          }
        } catch (err) {
          const status = err?.error?.status || err?.status || err?.originalStatus
          const errorData = err?.error?.data || err?.data
          const errorMessage = errorData?.message || errorData?.error || ''
          
          let errString = ''
          try {
            errString = JSON.stringify(err).toLowerCase()
          } catch {
            errString = String(err).toLowerCase()
          }

          const isDelegationError =
            status === 403 ||
            status === 'PARSING_ERROR' ||
            !!hasDelegationBefore ||
            errorMessage.toLowerCase().includes('delegation') ||
            errString.includes('delegation')

          if (isDelegationError) {
            // Revoked delegation access is globally intercepted and handled by apiSlice.js
            return
          }
          dispatch(clearAuth())
          androidClearAuth()
        }
      },
    }),

    googleLogin: builder.mutation({
      query: (body) => ({
        url: 'api/auth/user/google/login',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          persistAuthResponse(dispatch, data)
          if (data?.accessToken) {
            dispatch(apiSlice.util.resetApiState())
            connectSocket(data.accessToken)
          }
        } catch {
          dispatch(clearAuth())
          androidClearAuth()
        }
      },
    }),

    googleSignup: builder.mutation({
      query: (body) => ({
        url: 'api/auth/user/google/signup',
        method: 'POST',
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          persistAuthResponse(dispatch, data)
          if (data?.accessToken) {
            dispatch(apiSlice.util.resetApiState())
            connectSocket(data.accessToken)
          }
        } catch {
          dispatch(clearAuth())
          androidClearAuth()
        }
      },
    }),

    checkWebsiteDomainExistance: builder.mutation({
      query: ({ websiteUrl }) => ({
        url: '/api/auth/admin/business/checkwebsite',
        method: 'POST',
        body: { websiteUrl },
      }),
    }),

    guestLogin: builder.mutation({
      query: () => ({
        url: '/api/auth/user/guest-login',
        method: 'POST',
      }),
    }),
    // async onQueryStarted(_, { dispatch, queryFulfilled }) {
    //   try {
    //     const { data } = await queryFulfilled
    //     persistAuthResponse(dispatch, data)
    //     if (data?.accessToken) {
    //       connectSocket(data.accessToken)
    //     }
    //   } catch {
    //     dispatch(clearAuth())
    //     androidClearAuth()
    //   }
    // },


    sendPhoneOtp: builder.mutation({
      query: (data) => ({
        url: '/api/auth/user/phone/send-otp',
        method: 'POST',
        body: data,
      }),
    }),

    verifyPhoneOtp: builder.mutation({
      query: (data) => ({
        url: '/api/auth/user/phone/verify-otp',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data?.user) {
            const user = decryptResponse(data.user)
            if (user) {
              dispatch(setAuth({ user, encryptedUser: data.user }))
            }
          }
        } catch {
          // Keep current state
        }
      },
    }),

    getDevices: builder.query({
      query: () => '/api/auth/user/devices',
      providesTags: ['Devices'],
    }),

    logoutDevice: builder.mutation({
      query: (body) => ({
        url: '/api/auth/user/devices/logout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Devices'],
    }),

    logoutAllDevices: builder.mutation({
      query: (body) => ({
        url: '/api/auth/user/devices/logout-all',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Devices'],
    }),
  }),
})

export const {
  useSendSignupOtpMutation,
  useVerifySignupOtpMutation,
  useSendLoginOtpMutation,
  useVerifyLoginOtpMutation,
  useResendOtpMutation,
  useCompleteSignupMutation,
  useGetLoggedInUserQuery,
  useGoogleLoginMutation,
  useGoogleSignupMutation,
  useCheckWebsiteDomainExistanceMutation,
  useGuestLoginMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
  useGetDevicesQuery,
  useLogoutDeviceMutation,
  useLogoutAllDevicesMutation,
} = authApi

