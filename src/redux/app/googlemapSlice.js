import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  leadForm: {
    targetMarket: '',
    geographicFocus: '',
    locations: [],
    numberOfLeads: 10,
    locationInput: '',
  }
};

const googlemapSlice = createSlice({
  name: 'googlemap',
  initialState,
  reducers: {
    setLeadForm: (state, action) => {
      state.leadForm = { ...state.leadForm, ...action.payload };
    },
    resetLeadForm: (state) => {
      state.leadForm = initialState.leadForm;
    },
  },
});

export const { setLeadForm, resetLeadForm } = googlemapSlice.actions;
export default googlemapSlice.reducer;
