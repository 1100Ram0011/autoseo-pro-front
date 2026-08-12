import { createSlice } from '@reduxjs/toolkit'

export const creditModalSlice = createSlice({
  name: 'creditModal',
  initialState: {
    isOpen: false,
    featureKey: null,
    subFeature: null,
  },
  reducers: {
    openCreditModal: (state, action) => {
      state.isOpen = true
      state.featureKey = action.payload.featureKey
      state.subFeature = action.payload.subFeature || null
    },
    closeCreditModal: (state) => {
      state.isOpen = false
      state.featureKey = null
      state.subFeature = null
    },
  },
})

export const { openCreditModal, closeCreditModal } = creditModalSlice.actions

export default creditModalSlice.reducer
