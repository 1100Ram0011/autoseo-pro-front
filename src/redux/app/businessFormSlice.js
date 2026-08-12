import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  businessName: '',
  website: '',
  isIndividual: false,
  step: 'details', // STEP.DETAILS
  email: '',          // full email used for OTP (manual or crawl flow)
  selectedEmails: [],
  selectedPhones: [],
  emailPrefix: '',
  domain: '',
  crawledEmails: [],
  crawledPhones: [],
  otp: '',
}

const businessFormSlice = createSlice({
  name: 'businessForm',
  initialState,
  reducers: {
    updateBusinessField: (state, action) => {
      const { field, value } = action.payload
      state[field] = value
    },
    setBusinessStep: (state, action) => {
      state.step = action.payload
    },
    addSelectedEmail: (state, action) => {
      if (!state.selectedEmails.includes(action.payload)) {
        state.selectedEmails.push(action.payload)
      }
    },
    removeSelectedEmail: (state, action) => {
      state.selectedEmails = state.selectedEmails.filter((e) => e !== action.payload)
    },
    addSelectedPhone: (state, action) => {
      if (!state.selectedPhones.includes(action.payload)) {
        state.selectedPhones.push(action.payload)
      }
    },
    removeSelectedPhone: (state, action) => {
      state.selectedPhones = state.selectedPhones.filter((p) => p !== action.payload)
    },
    setCrawledData: (state, action) => {
      state.crawledEmails = action.payload.emails || []
      state.crawledPhones = action.payload.phones || []
    },
    // Clears all crawl-related data when user navigates back from CRAWL_PICK to EMAIL
    clearCrawlData: (state) => {
      state.crawledEmails = []
      state.crawledPhones = []
      state.selectedEmails = []
      state.selectedPhones = []
      state.email = ''
      state.emailPrefix = ''
    },
    resetBusinessForm: () => initialState,
  },
})

export const {
  updateBusinessField,
  setBusinessStep,
  addSelectedEmail,
  removeSelectedEmail,
  addSelectedPhone,
  removeSelectedPhone,
  setCrawledData,
  clearCrawlData,
  resetBusinessForm,
} = businessFormSlice.actions

export default businessFormSlice.reducer
