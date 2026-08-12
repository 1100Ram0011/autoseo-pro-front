import { createSlice } from '@reduxjs/toolkit'

const whatsappSelectionSlice = createSlice({
  name: 'whatsappSelection',
  initialState: {
    selectedNumber: null,
  },
  reducers: {
    setSelectedNumber: (state, action) => {
      state.selectedNumber = action.payload
    },
    clearSelectedNumber: (state) => {
      state.selectedNumber = null
    },
  },
})

export const { setSelectedNumber, clearSelectedNumber } = whatsappSelectionSlice.actions
export default whatsappSelectionSlice.reducer
