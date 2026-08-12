import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    fields: {
        whatIDo: '',
        myAudience: '',
        myStory: '',
        myProof: '',
        contentStyle: '',
        brandGoal: '',
    },

    fieldErrors: {
        whatIDo: '',
        myAudience: '',
        myStory: '',
        myProof: '',
    },

    socialLinks: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        youtube: '',
    },

    socialErrors: {
        instagram: '',
        facebook: '',
        twitter: '',
        linkedin: '',
        youtube: '',
    },

    media: {
        photo: null,
        photoPreview: null,
        logo: null,
        logoPreview: null,
        photoError: '',
    },

    ui: {
        acceptedTerms: false,
        termsError: '',
        previewOpen: false,
        termsOpen: false,
        sampleWarningOpen: false,
        stage: 'form',
    },

    analysis: {
        data: null,
        error: '',
    },
}

export const individualFormSlice = createSlice({
    name: 'individualForm',
    initialState,
    reducers: {
        // 🔹 Generic field update
        setField: (state, action) => {
            const { key, value } = action.payload
            state.fields[key] = value
            state.fieldErrors[key] = ''
        },

        setFieldError: (state, action) => {
            const { key, value } = action.payload
            state.fieldErrors[key] = value
        },

        // 🔹 Social
        setSocial: (state, action) => {
            const { key, value } = action.payload
            state.socialLinks[key] = value
            state.socialErrors[key] = ''
        },

        setSocialError: (state, action) => {
            const { key, value } = action.payload
            state.socialErrors[key] = value
        },

        // 🔹 Media
        setPhoto: (state, action) => {
            state.media.photo = action.payload.file
            state.media.photoPreview = action.payload.preview
            state.media.photoError = ''
        },

        clearPhoto: (state) => {
            state.media.photo = null
            state.media.photoPreview = null
            state.media.photoError = ''
        },

        setLogo: (state, action) => {
            state.media.logo = action.payload.file
            state.media.logoPreview = action.payload.preview
        },

        clearLogo: (state) => {
            state.media.logo = null
            state.media.logoPreview = null
        },

        setPhotoError: (state, action) => {
            state.media.photoError = action.payload
        },

        // 🔹 UI controls
        setUI: (state, action) => {
            const { key, value } = action.payload
            state.ui[key] = value
        },

        // 🔹 Terms
        setAcceptedTerms: (state, action) => {
            state.ui.acceptedTerms = action.payload
            state.ui.termsError = ''
        },

        setTermsError: (state, action) => {
            state.ui.termsError = action.payload
        },

        // 🔹 Analysis
        setAnalysisData: (state, action) => {
            state.analysis.data = action.payload
        },

        setAnalysisError: (state, action) => {
            state.analysis.error = action.payload
        },

        setStage: (state, action) => {
            state.ui.stage = action.payload
        },

        // 🔹 Reset form
        resetForm: () => initialState,
    },
})

export const {
    setField,
    setFieldError,
    setSocial,
    setSocialError,
    setPhoto,
    clearPhoto,
    setLogo,
    clearLogo,
    setPhotoError,
    setUI,
    setAcceptedTerms,
    setTermsError,
    setAnalysisData,
    setAnalysisError,
    setStage,
    resetForm,
} = individualFormSlice.actions

export default individualFormSlice.reducer