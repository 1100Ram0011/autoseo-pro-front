import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    isGuest: false,   // ✅ new
    loading: true,
  },
  reducers: {

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setAuth: (state, action) => {

      if (action.payload.user !== undefined)
        state.user = action.payload.user

      if (action.payload.token !== undefined)
        state.token = action.payload.token

      if (action.payload.encryptedUser !== undefined)
        state.encryptedUser = action.payload.encryptedUser

      state.isAuthenticated = !!state.user

      state.isGuest = action.payload.user?.isGuest || false

      state.loading = false

      if (state.token) {
        localStorage.setItem("accessToken", state.token)
        localStorage.setItem("token", state.token)
      }

      if (action.payload.encryptedUser) {
        localStorage.setItem("user", action.payload.encryptedUser)
      }
    },

    setGuest: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isGuest = true
      state.loading = false

      if (state.token) {
        localStorage.setItem(
          'accessToken',
          state.token
        )

        localStorage.setItem(
          'token',
          state.token
        )
        localStorage.setItem("user", action.payload.encryptedUser)
      }
    },

    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isGuest = false
      state.loading = false

      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
    },
  }
})

export const {
  setAuth,
  clearAuth,
  setGuest,
  setLoading
} = authSlice.actions
export default authSlice.reducer