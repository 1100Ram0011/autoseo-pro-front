import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  stagedItems: [],
}

const adminOutreachSlice = createSlice({
  name: 'adminOutreach',
  initialState,
  reducers: {
    stageItems: (state, action) => {
      const { items, source } = action.payload
      const itemsToStage = items.map(i => ({
        ...i,
        source: source || 'manual',
        stagedAt: Date.now()
      }))
      
      // Prevent duplicates by websiteUrl
      const newItems = itemsToStage.filter(newItem => 
        !state.stagedItems.some(ex => ex.websiteUrl === newItem.websiteUrl)
      )
      
      state.stagedItems = [...state.stagedItems, ...newItems]
    },
    updateStagedItems: (state, action) => {
      state.stagedItems = action.payload
    },
    clearStagedItems: (state) => {
      state.stagedItems = []
    }
  }
})

export const { stageItems, updateStagedItems, clearStagedItems } = adminOutreachSlice.actions
export default adminOutreachSlice.reducer
