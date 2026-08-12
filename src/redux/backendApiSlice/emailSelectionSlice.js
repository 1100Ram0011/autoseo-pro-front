// store/emailSelectionSlice.js
import { createSlice } from '@reduxjs/toolkit'

const emailSelectionSlice = createSlice({
    name: 'emailSelection',
    initialState: {
        selectedEmails: [],
        selectedPhones: [],
        // --- Campaign recipient source ---
        recipientFilter: 'all',       // 'all' | 'failed' | 'hold' | 'skipped'
        selectedCampaignId: null,      // previous campaign id to pull recipients from
        previousCampaignRecipients: [], // fetched recipients from the past campaign

        // --- Persistent Redesigned Recipient Editor State ---
        uploadedFiles: [],            // array of { id, name, size }
        editableData: [],             // array of recipient objects: { _id, fileId, ...fields }
        columns: [],                  // array of column header names
        selectedRows: [],             // array of selected _id strings
        inputMode: 'upload',          // 'upload' | 'manual' | 'previous'
    },
    reducers: {
        // --- Emails ---
        setSelectedEmails: (state, action) => {
            state.selectedEmails = action.payload
        },
        addEmail: (state, action) => {
            if (!state.selectedEmails.includes(action.payload)) {
                state.selectedEmails.push(action.payload)
            }
        },
        removeEmail: (state, action) => {
            state.selectedEmails = state.selectedEmails.filter(e => e !== action.payload)
        },
        clearEmails: (state) => {
            state.selectedEmails = []
        },

        // --- Phones ---
        setSelectedPhones: (state, action) => {
            state.selectedPhones = action.payload
        },
        addPhone: (state, action) => {
            if (!state.selectedPhones.includes(action.payload)) {
                state.selectedPhones.push(action.payload)
            }
        },
        removePhone: (state, action) => {
            state.selectedPhones = state.selectedPhones.filter(p => p !== action.payload)
        },
        clearPhones: (state) => {
            state.selectedPhones = []
        },

        // --- Campaign recipient source ---
        setRecipientFilter: (state, action) => {
            state.recipientFilter = action.payload
        },
        setSelectedCampaignId: (state, action) => {
            state.selectedCampaignId = action.payload
        },
        setPreviousCampaignRecipients: (state, action) => {
            state.previousCampaignRecipients = action.payload
        },

        // --- Editor Redesigned State Actions ---
        setUploadedFiles: (state, action) => {
            state.uploadedFiles = action.payload
        },
        addUploadedFile: (state, action) => {
            state.uploadedFiles.push(action.payload)
        },
        removeUploadedFile: (state, action) => {
            const fileId = action.payload
            state.uploadedFiles = state.uploadedFiles.filter(f => f.id !== fileId)
            // Clean up rows belonging to this file
            state.editableData = state.editableData.filter(row => row.fileId !== fileId)
            // Clean up selections
            const remainingIds = new Set(state.editableData.map(r => r._id))
            state.selectedRows = state.selectedRows.filter(id => remainingIds.has(id))
            // Recalculate columns if empty
            if (state.editableData.length === 0) {
                state.columns = []
            } else {
                const allCols = new Set()
                state.editableData.forEach(row => {
                    Object.keys(row).forEach(k => {
                        if (k !== '_id' && k !== 'fileId') allCols.add(k)
                    })
                })
                state.columns = Array.from(allCols)
            }
        },
        setEditableData: (state, action) => {
            state.editableData = action.payload
            const activeFileIds = new Set(state.editableData.map(r => r.fileId))
            state.uploadedFiles = state.uploadedFiles.filter(f => activeFileIds.has(f.id))
        },
        addRecipientRow: (state, action) => {
            state.editableData.push(action.payload)
        },
        updateRecipientRow: (state, action) => {
            const { _id, col, value } = action.payload
            const row = state.editableData.find(r => r._id === _id)
            if (row) {
                row[col] = value
            }
        },
        removeRecipientRows: (state, action) => {
            const idsToRemove = new Set(action.payload)
            state.editableData = state.editableData.filter(r => !idsToRemove.has(r._id))
            state.selectedRows = state.selectedRows.filter(id => !idsToRemove.has(id))
            if (state.editableData.length === 0) {
                state.columns = []
            }
            const activeFileIds = new Set(state.editableData.map(r => r.fileId))
            state.uploadedFiles = state.uploadedFiles.filter(f => activeFileIds.has(f.id))
        },
        setColumns: (state, action) => {
            state.columns = action.payload
        },
        setSelectedRows: (state, action) => {
            state.selectedRows = action.payload
        },
        toggleRowSelection: (state, action) => {
            const id = action.payload
            if (state.selectedRows.includes(id)) {
                state.selectedRows = state.selectedRows.filter(x => x !== id)
            } else {
                state.selectedRows.push(id)
            }
        },
        setInputMode: (state, action) => {
            state.inputMode = action.payload
        },
        clearRecipientState: (state) => {
            state.uploadedFiles = []
            state.editableData = []
            state.columns = []
            state.selectedRows = []
            state.selectedCampaignId = null
            state.previousCampaignRecipients = []
            state.recipientFilter = 'all'
        }
    },
})

export const {
    setSelectedEmails,
    addEmail,
    removeEmail,
    clearEmails,
    setSelectedPhones,
    addPhone,
    removePhone,
    clearPhones,
    setRecipientFilter,
    setSelectedCampaignId,
    setPreviousCampaignRecipients,

    setUploadedFiles,
    addUploadedFile,
    removeUploadedFile,
    setEditableData,
    addRecipientRow,
    updateRecipientRow,
    removeRecipientRows,
    setColumns,
    setSelectedRows,
    toggleRowSelection,
    setInputMode,
    clearRecipientState,
} = emailSelectionSlice.actions

export default emailSelectionSlice.reducer