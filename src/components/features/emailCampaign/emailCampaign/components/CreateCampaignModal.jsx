import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import {
  Loader,
  Plus,
  X,
  Check,
  Sparkles,
  ChevronDown,
  AlertCircle,
  Eye,
  Users,
  Trash2,
  CheckSquare,
  Settings,
  Database,
  CheckCircle2,
  Circle,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  ChevronUp,
  ClipboardCheckIcon,
} from 'lucide-react'

import { useCreateEmailCampaignMutation } from '../../../../redux/apis/emailCampaignApi'
import { useGetEmailTemplatesQuery } from '../../../../redux/apis/emailTemplateApi'
import { useGetEmailAuthStatusQuery } from '@/redux/apis/emailConnect.api'

import {
  useGetTemplatesQuery as useGetWhatsappTemplatesQuery,
  useCreateCampaignMutation as useCreateWhatsappCampaignMutation,
  useGetWhatsappNumberQuery
} from '@/redux/apis/metaWhatsapp.api'

import { useTheme } from '@/Components/global/theme-provider'
import { useSelector, useDispatch } from 'react-redux'
import RecipientDataSource from '@/Components/common/RecipientDataSource/RecipientDataSource'
import {
  setColumns,
  setEditableData,
  addRecipientRow,
  updateRecipientRow,
  removeRecipientRows,
  setSelectedRows,
  toggleRowSelection,
  clearRecipientState,
  setUploadedFiles,
} from '@/redux/backendApiSlice/emailSelectionSlice'

const NAME_MAX = 25
const NAME_REGEX = /^[A-Za-z0-9 ]*$/

const isValidEmail = (email) => {
  if (!email || email.length > 254) return false;
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1 || atIndex !== email.lastIndexOf('@')) return false; 

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex + 1);

  if (localPart.length === 0 || localPart.length > 64) return false;
  if (domainPart.length === 0 || domainPart.length > 255) return false;

  if (email.includes('..')) return false;
  
  if (!/^[a-zA-Z0-9._\-+]+$/.test(localPart)) return false;
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainPart)) return false;

  const domainLabels = domainPart.split('.');
  if (domainLabels.some(label => label.length > 63)) return false;

  return true;
}

export default function CreateCampaignModal({ campaignType = 'email', onClose, onRequireAuth }) {
  const { isDark } = useTheme()
  
  // Email hooks
  const [createEmailCampaign, { isLoading: isEmailLoading }] = useCreateEmailCampaignMutation()
  const { data: emailTemplates } = useGetEmailTemplatesQuery(undefined, { skip: campaignType !== 'email' })
  const { data: emailStatus } = useGetEmailAuthStatusQuery(undefined, { skip: campaignType !== 'email' })

  // WhatsApp hooks
  const [createWhatsappCampaign, { isLoading: isWhatsappLoading }] = useCreateWhatsappCampaignMutation()
  const { data: whatsappNumberRes } = useGetWhatsappNumberQuery(undefined, { skip: campaignType !== 'whatsapp' })
  const defaultNumberId = whatsappNumberRes?.data?.[0]?._id
  const { data: whatsappTemplatesRes } = useGetWhatsappTemplatesQuery(
    { numberId: defaultNumberId },
    { skip: campaignType !== 'whatsapp' || !defaultNumberId }
  )

  // Centralized data
  const createCampaign = campaignType === 'email' ? createEmailCampaign : createWhatsappCampaign
  const isLoading = campaignType === 'email' ? isEmailLoading : isWhatsappLoading
  const templates = campaignType === 'email' ? emailTemplates : whatsappTemplatesRes?.data?.filter(t => t.status === 'APPROVED')
  const status = campaignType === 'email' ? emailStatus : whatsappNumberRes?.data // We can adapt this later

  const reduxUser = useSelector((state) => state.auth?.user)
  
  const [name, setName] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [provider, setProvider] = useState('')
  const [error, setError] = useState('')
  const [openSection, setOpenSection] = useState('details')
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false)
  const [applyToAllCol, setApplyToAllCol] = useState('')
  const [applyToAllValue, setApplyToAllValue] = useState('')
  const [showApplyToAllModal, setShowApplyToAllModal] = useState(false)
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)

  // Redux recipient selection state
  const {
    editableData = [],
    columns = [],
    selectedRows = [],
    inputMode = 'upload',
    selectedCampaignId = null,
    uploadedFiles = [],
  } = useSelector((state) => state.emailSelection || {})

  const dispatch = useDispatch()

  // Reset Redux state when the ENTIRE modal unmounts
  useEffect(() => {
    return () => {
      dispatch(clearRecipientState())
    }
  }, [dispatch])

  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [bulkEmails, setBulkEmails] = useState('')
  const [quickEmail, setQuickEmail] = useState('')
  // Track newly added rows to highlight them briefly
  const [newlyAddedRowIds, setNewlyAddedRowIds] = useState(new Set())
  const [focusedNewRowId, setFocusedNewRowId] = useState(null)
  const prevRowIdsRef = useRef(new Set())
  const tableContainerRef = useRef(null)
  const timeoutsRef = useRef([])

  // Clear all timeouts when the modal unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    const currentIds = new Set(editableData.map(r => r._id))
    const prevIds = prevRowIdsRef.current

    const addedIds = []
    if (prevIds.size > 0) {
      currentIds.forEach(id => {
        if (!prevIds.has(id)) {
          addedIds.push(id)
        }
      })
    }

    // Always update the ref immediately so it stays synchronized
    prevRowIdsRef.current = currentIds

    if (addedIds.length > 0) {
      setNewlyAddedRowIds(prev => {
        const next = new Set(prev)
        addedIds.forEach(id => next.add(id))
        return next
      })

      // Auto-scroll to the bottom of the container so the new rows are visible
      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTo({
            top: tableContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      }, 50)

      const t = setTimeout(() => {
        setNewlyAddedRowIds(prev => {
          const next = new Set(prev)
          addedIds.forEach(id => next.delete(id))
          return next
        })
      }, 3000)

      timeoutsRef.current.push(t)
    }
  }, [editableData])

  // Auto-dismiss error banner after 3 seconds
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 3000)
    return () => clearTimeout(t)
  }, [error])


  // Compute duplicate emails list
  const duplicateEmails = useMemo(() => {
    const emailCol = columns.find(c => c.toLowerCase() === 'email') || columns[0]
    if (!emailCol || editableData.length === 0) return new Set()
    
    const counts = {}
    editableData.forEach(row => {
      const val = (row[emailCol] || '').trim().toLowerCase()
      if (val) {
        counts[val] = (counts[val] || 0) + 1
      }
    })
    
    const duplicates = new Set()
    Object.keys(counts).forEach(email => {
      if (counts[email] > 1) {
        duplicates.add(email)
      }
    })
    return duplicates
  }, [editableData, columns])

  const handleDeduplicate = () => {
    const emailCol = columns.find(c => c.toLowerCase() === 'email') || columns[0]
    if (!emailCol) return
    
    const seen = new Set()
    const uniqueRows = []
    const removedIds = []
    
    editableData.forEach(row => {
      const val = (row[emailCol] || '').trim().toLowerCase()
      if (val) {
        if (seen.has(val)) {
          removedIds.push(row._id)
        } else {
          seen.add(val)
          uniqueRows.push(row)
        }
      } else {
        uniqueRows.push(row)
      }
    })
    
    dispatch(setEditableData(uniqueRows))
    const nextSelected = selectedRows.filter(id => !removedIds.includes(id))
    dispatch(setSelectedRows(nextSelected))

    // Cleanup uploaded files that no longer have any rows (if 100% duplicate)
    const remainingFileIds = new Set(
      uniqueRows
        .filter(r => r.fileId && !r.fileId.startsWith('campaign-'))
        .map(r => r.fileId)
    )
    if (uploadedFiles.length > 0) {
      const updatedFiles = uploadedFiles.filter(f => remainingFileIds.has(f.id))
      if (updatedFiles.length !== uploadedFiles.length) {
        dispatch(setUploadedFiles(updatedFiles))
      }
    }
  }

  const invalidEmailsCount = useMemo(() => {
    const emailCol = columns.find(c => c.toLowerCase() === 'email') || columns[0]
    if (!emailCol || editableData.length === 0) return 0
    let count = 0
    editableData.forEach(row => {
      const val = (row[emailCol] || '').trim()
      if (val && !isValidEmail(val)) {
        count++
      }
    })
    return count
  }, [editableData, columns])

  // If the user deletes invalid emails via "Delete Selected", 
  // the warning alert disappears, but the filter might still be active.
  // This automatically turns off the filter when there are no more invalid emails.
  useEffect(() => {
    if (invalidEmailsCount === 0 && showOnlyInvalid) {
      setShowOnlyInvalid(false)
    }
  }, [invalidEmailsCount, showOnlyInvalid])

  const handleDeleteInvalid = () => {
    const emailCol = columns.find(c => c.toLowerCase() === 'email') || columns[0]
    if (!emailCol) return
    
    const validRows = editableData.filter(row => {
      const val = (row[emailCol] || '').trim()
      if (val && !isValidEmail(val)) {
        return false // Invalid, remove
      }
      return true
    })
    
    dispatch(setEditableData(validRows))
    const validIds = new Set(validRows.map(r => r._id))
    const nextSelected = selectedRows.filter(id => validIds.has(id))
    dispatch(setSelectedRows(nextSelected))
    setShowOnlyInvalid(false) // Toggle off the filter to reveal remaining emails
  }

  const handleAddRow = () => {
    // If there is already at least one row, check if the last row is completely empty
    if (editableData.length > 0) {
      const lastRow = editableData[editableData.length - 1]
      // check if all columns except _id and fileId are empty
      const isBlank = columns.every(col => {
        const val = lastRow[col]
        return val === undefined || val === null || val.toString().trim() === ''
      })
      if (isBlank) {
        toast.error('Please fill in the existing blank row first.')
        return
      }
    }

    const newRowId = crypto.randomUUID()
    const newRow = { _id: newRowId }
    columns.forEach((col) => (newRow[col] = ''))
    dispatch(addRecipientRow(newRow))
    setFocusedNewRowId(newRowId)

    // Scroll to the bottom of the table container so the new row is visible
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({
          top: tableContainerRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }
    }, 50)
  }

  const handleApplyToAll = () => {
    const colToApply = applyToAllCol || columns[0]
    if (!colToApply) return
    const updatedData = editableData.map(row => ({
      ...row,
      [colToApply]: applyToAllValue
    }))
    dispatch(setEditableData(updatedData))
    setApplyToAllValue('')
    setShowApplyToAllModal(false)
    toast.success(`Applied to all ${editableData.length} recipients.`)
  }

  const handleQuickAdd = (e) => {
    e?.preventDefault()
    const val = quickEmail.trim()
    if (!val) return
    let emailCol = columns.find((c) => c.toLowerCase() === 'email')
    let nextCols = [...columns]
    if (!emailCol) {
      emailCol = 'Email'
      nextCols = ['Email', ...columns]
      dispatch(setColumns(nextCols))
    }
    const newRow = { _id: crypto.randomUUID(), [emailCol]: val }
    nextCols.forEach((c) => {
      if (c !== emailCol) newRow[c] = ''
    })
    dispatch(addRecipientRow(newRow))
    setQuickEmail('')
  }

  const handleBulkAdd = () => {
    const emails = bulkEmails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => e)
    if (emails.length === 0) return
    let emailCol = columns.find((c) => c.toLowerCase() === 'email')
    let nextCols = [...columns]
    if (!emailCol) {
      emailCol = 'Email'
      nextCols = ['Email', ...columns]
      dispatch(setColumns(nextCols))
    }
    const newRows = emails.map((email) => {
      const row = { _id: crypto.randomUUID(), [emailCol]: email }
      nextCols.forEach((c) => {
        if (c !== emailCol) row[c] = ''
      })
      return row
    })
    dispatch(setEditableData([...editableData, ...newRows]))
    setBulkEmails('')
    setShowBulkAdd(false)
  }

  const selectedTemplate = useMemo(
    () => templates?.find((t) => t._id === templateId),
    [templateId, templates]
  )
  const templateVariables = useMemo(
    () => selectedTemplate?.variables || [],
    [selectedTemplate]
  )

  const missingVariables = useMemo(() => {
    if (editableData.length === 0 && inputMode === 'upload') return []
    return templateVariables.filter((v) => !columns.includes(v))
  }, [templateVariables, columns, editableData.length, inputMode])

  const accentGradientClasses =
    'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90'

  const normalizedName = name.trim()

  const isNameValid = useMemo(() => {
    if (!normalizedName) return false
    if (normalizedName.length > NAME_MAX) return false
    if (!NAME_REGEX.test(normalizedName)) return false
    return true
  }, [normalizedName])

  // Verify that all cells for the required template variables and base columns are filled out in the selected rows
  const isGridPerfect = useMemo(() => {
    if (editableData.length === 0) return false
    const activeRows = editableData
    
    if (campaignType === 'whatsapp') {
      const phoneCol = columns.find((c) => c.toLowerCase() === 'phone') || 'Phone'
      for (const row of activeRows) {
        const phoneVal = (row[phoneCol] || '').toString().trim()
        if (!phoneVal || phoneVal.length < 5) return false

        for (const variable of templateVariables) {
          const cellVal = (row[variable] || '').trim()
          if (!cellVal) return false
        }
      }
    } else {
      const emailCol = columns.find((c) => c.toLowerCase() === 'email') || 'Email'
      for (const row of activeRows) {
        const emailVal = (row[emailCol] || '').trim()
        if (!emailVal || !emailVal.includes('@')) return false

        for (const variable of templateVariables) {
          const cellVal = (row[variable] || '').trim()
          if (!cellVal) return false
        }
      }
    }
    return true
  }, [editableData, templateVariables, columns, campaignType])

  // Automatically sync template variables and base columns with the columns list in Redux
  // If the template changes, missing columns are added and extraneous columns are removed.
  useEffect(() => {
    const baseCol = campaignType === 'whatsapp' ? 'Phone' : 'Email'
    const requiredCols = [baseCol, ...templateVariables]
    
    // Find missing using case-insensitive check
    const missing = requiredCols.filter(req => 
      !columns.some(col => col.toLowerCase() === req.toLowerCase())
    )
    
    // Find extraneous (columns that are present but no longer required)
    const extraneous = columns.filter(col =>
      !requiredCols.some(req => req.toLowerCase() === col.toLowerCase())
    )
    
    if (missing.length === 0 && extraneous.length === 0) return // Base case to prevent infinite loops!

    // Compute the next columns list
    const nextCols = columns.filter(col => !extraneous.includes(col)).concat(missing)
    dispatch(setColumns(nextCols))

    const nextData = editableData.map((row) => {
      const updated = { ...row }
      // Add new required variables
      missing.forEach((m) => {
        if (!(m in updated)) updated[m] = ''
      })
      // Delete unrequired variables to keep payload clean
      extraneous.forEach((ext) => {
        delete updated[ext]
      })
      return updated
    })
    dispatch(setEditableData(nextData))
  }, [templateVariables, columns, editableData, campaignType, dispatch])

  const requiredFieldsFilled = useMemo(() => {
    return (
      isNameValid &&
      Boolean(templateId) &&
      Boolean(provider) &&
      editableData.length > 0 &&
      missingVariables.length === 0 &&
      isGridPerfect
    )
  }, [
    isNameValid,
    templateId,
    provider,
    editableData.length,
    missingVariables.length,
    isGridPerfect,
  ])

  const nameError = useMemo(() => {
    if (!name) return ''
    const t = name.trim()
    if (!NAME_REGEX.test(name))
      return 'Only letters, numbers and spaces are allowed.'
    if (t.length > NAME_MAX) return `Max ${NAME_MAX} characters.`
    if (!t.length) return 'Campaign name is required.'
    return ''
  }, [name])

  function validateAndSanitize(value) {
    let sanitized = value.replace(/[^A-Za-z0-9 _.-]/g, '')
    if (sanitized.length > NAME_MAX) sanitized = sanitized.slice(0, NAME_MAX)
    const trimmed = sanitized.trim()
    if (!trimmed) return { value: sanitized, error: 'This field is required.' }
    if (!/[A-Za-z]/.test(trimmed))
      return { value: sanitized, error: 'Must contain at least one letter.' }
    if (/^[^A-Za-z0-9]+$/.test(trimmed))
      return {
        value: sanitized,
        error: 'Cannot contain only special characters.',
      }
    return { value: sanitized, error: '' }
  }

  const handleNameChange = (e) => {
    let inputValue = e.target.value
    if (inputValue.length > NAME_MAX) inputValue = inputValue.slice(0, NAME_MAX)
    const { value: sanitizedValue, error } = validateAndSanitize(inputValue)
    setName(sanitizedValue)
    setError(error)
  }

  const handleSubmit = async () => {
    if (reduxUser?.isGuest) {
      onRequireAuth?.()
      return
    }
    setError('')
    if (!requiredFieldsFilled) {
      if (!isNameValid) {
        setError(
          'Campaign name is required and must be alphanumeric (max 25 chars).'
        )
        return
      }
      if (!templateId || !provider) {
        setError('Campaign name, template, and provider are required.')
        return
      }
      if (editableData.length === 0) {
        setError('Please provide recipient data (upload file or manual entry).')
        return
      }
      if (missingVariables.length) {
        setError('Missing required template variables in the recipient list.')
        return
      }
      setError('Please fill all required fields.')
      return
    }
    const normalizedData = editableData.map((row) => {
      const { _id, fileId, ...rest } = row
      return rest
    })
    
    const emailCol = columns.find((c) => c.toLowerCase() === 'email') || columns.find((c) => c.toLowerCase() === 'phone') || columns[0]
    
    if (!emailCol && campaignType === 'email') {
      setError('Recipient list must contain an "Email" column to specify the target addresses.')
      return
    }
    
    const invalidRows = normalizedData.filter(
      (r) => !r[emailCol] || (campaignType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r[emailCol]))
    )
    if (invalidRows.length > 0 && campaignType === 'email') {
      setError(`Found ${invalidRows.length} selected recipients with invalid or missing emails in the '${emailCol}' column.`)
      return
    }

    try {
      let finalPayload
      
      if (campaignType === 'whatsapp') {
        // WhatsApp typically uses JSON
        finalPayload = {
          name: normalizedName,
          templateId,
          provider,
          type: campaignType,
          recipients: normalizedData
        }
      } else {
        // Email typically uses FormData with Excel
        finalPayload = new FormData()
        finalPayload.append('name', normalizedName)
        finalPayload.append('templateId', templateId)
        finalPayload.append('provider', provider)
        
        const worksheet = XLSX.utils.json_to_sheet(normalizedData, {
          header: columns,
        })
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients')
        const excelBuffer = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array',
        })
        const generatedExcelFile = new File([excelBuffer], 'recipients.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        finalPayload.append('file', generatedExcelFile)
      }

      await createCampaign(finalPayload).unwrap()
      onClose()
    } catch (err) {
      setError(err?.data?.message || 'Failed to create campaign.')
    }
  }

  const checklistItems = useMemo(() => {
    return [
      { label: 'Campaign name', done: isNameValid },
      { label: 'Template selected', done: Boolean(templateId) },
      { label: 'Provider selected', done: Boolean(provider) },
      { label: 'Recipients loaded', done: editableData.length > 0 },
      { label: 'Variables mapped', done: missingVariables.length === 0 },
      { label: 'Variables filled (Perfect)', done: isGridPerfect },
    ]
  }, [
    isNameValid,
    templateId,
    provider,
    editableData.length,
    missingVariables.length,
    isGridPerfect,
  ])

  /* ─── Step indicator ─── */
  const steps = ['Details', 'Recipients', 'Review']
  const currentStep =
    !isNameValid || !templateId || !provider
      ? 0
      : editableData.length === 0
        ? 1
        : 2

  const displayedData = useMemo(() => {
    return editableData.filter(row => {
      if (!showOnlyInvalid) return true
      const emailCol = columns.find(c => c.toLowerCase() === 'email') || columns[0]
      const val = (row[emailCol] || '').trim()
      return val && !isValidEmail(val)
    })
  }, [editableData, showOnlyInvalid, columns])

  return (
    <>
      {createPortal(
        <>
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 transition-all">
        <div
          className="flex w-full max-w-[1400px] w-[95vw] max-h-[90vh] sm:max-h-[85vh] flex-col overflow-hidden rounded-3xl bg-[var(--app-pages-bg)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-[var(--app-pages-border)]/50"
        >
          {/* ── Header ── */}
          <div
            className="relative overflow-hidden px-4 sm:px-8 py-5 sm:py-7"
            style={{
              borderBottom:
                '1px solid color-mix(in srgb, var(--app-pages-border) 50%, transparent)',
            }}
          >
            <div
              className="absolute left-0 top-0 h-[3px] w-full"
              style={{ background: 'var(--app-profile-btn-bg)', opacity: 0.85 }}
            />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background:
                      'color-mix(in srgb, var(--app-profile-btn-bg) 15%, transparent)',
                  }}
                >
                  <Sparkles
                    size={18}
                    style={{ color: 'var(--app-profile-btn-bg)' }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight text-[var(--app-pages-text)]">
                    Create {campaignType === 'whatsapp' ? 'WhatsApp' : 'Email'} Campaign
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--app-pages-subhead-text)]">
                    Configure, load recipients &amp; dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-[var(--app-pages-border)]/40 rounded-lg p-1.5 text-[var(--app-pages-subhead-text)] transition hover:text-[var(--app-pages-text)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step progress */}
            {/* <div className="mt-5 flex flex-row flex-wrap items-center justify-start gap-y-2.5">
              {steps.map((step, i) => {
                const isActive = i === currentStep
                const isCompleted = i < currentStep
                return (
                  <div key={step} className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-600/10'
                            : isCompleted
                              ? 'bg-blue-600/95 text-white'
                              : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span
                        className={`text-xs font-bold transition-colors ${
                          isActive || isCompleted
                            ? 'text-gray-800 dark:text-gray-200'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className="mx-3 h-px w-6 sm:w-12 rounded"
                        style={{
                          background:
                            i < currentStep
                              ? 'color-mix(in srgb, var(--app-profile-btn-bg) 60%, transparent)'
                              : 'color-mix(in srgb, var(--app-pages-border) 80%, transparent)',
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div> */}
          </div>

          {/* ── Minimal Responsive Readiness Checklist ── */}
          <div
            className="px-4 sm:px-8 py-3 flex flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/10 border-b border-[var(--app-pages-border)]/40"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)]">
                Readiness:
              </span>
            </div>
            
            {/* Scrollable flex container to prevent wrapping and vertical bloat on small screens */}
            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 sm:gap-5 pb-0.5 -mb-0.5">
              {checklistItems.map(({ label, done }, i) => (
                <div 
                  key={label} 
                  className="flex items-center gap-4 sm:gap-5 shrink-0"
                >
                  <div className={`flex items-center gap-1.5 transition-opacity duration-300 ${
                    done ? 'opacity-100' : 'opacity-40 grayscale'
                  }`}>
                    {done ? (
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_6px_rgba(16,185,129,0.4)]">
                        <Check size={9} strokeWidth={4} />
                      </div>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                    )}
                    <span className={`text-[11px] sm:text-[12px] font-semibold tracking-wide whitespace-nowrap ${
                      done ? 'text-slate-800 dark:text-slate-200' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {label}
                    </span>
                  </div>
                  
                  {/* Separator dot for all but last item */}
                  {i < checklistItems.length - 1 && (
                    <div className="h-1 w-1 rounded-full bg-[var(--app-pages-border)] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0 relative">
            
            {/* ── Left Column: Form Details & Recipient Selector ── */}
            <div className={`transition-all duration-300 ease-in-out flex flex-col no-scrollbar bg-[var(--app-pages-bg)] ${
              isEditorExpanded ? 'w-0 opacity-0 overflow-hidden lg:border-r-0' : 'flex-1 lg:w-[50%] overflow-y-auto px-4 sm:px-8 py-5 sm:py-6 space-y-4 lg:border-r lg:border-[var(--app-pages-border)]/45'
            }`}>
              
              {/* Global Error Banner */}
              {error && (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--app-debit-color) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--app-debit-color) 40%, transparent)',
                    color: 'var(--app-debit-color)',
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AlertCircle size={15} className="shrink-0" />
                    <span className="text-xs font-medium truncate">{error}</span>
                  </div>
                  <button
                    onClick={() => setError('')}
                    className="shrink-0 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Accordion 1: Campaign Details */}
              <div className="rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden shrink-0">
                <button
                  onClick={() => setOpenSection(openSection === 'details' ? '' : 'details')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Settings size={16} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                      1. Campaign Details
                    </p>
                  </div>
                  <ChevronUp size={18} className={`transition-transform duration-300 ${openSection === 'details' ? '' : 'rotate-180'} text-gray-400`} />
                </button>
                
                {openSection === 'details' && (
                  <div className="p-4 sm:p-5 space-y-4 border-t border-gray-100 dark:border-slate-800/80">

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <span>
                      Campaign Name{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                    </span>
                    <span className="text-xs text-[var(--app-pages-subhead-text)]">
                      {normalizedName.length}/{NAME_MAX}
                    </span>
                  </label>
                  <input
                    value={name}
                    placeholder="e.g. Summer Newsletter 2026"
                    onChange={handleNameChange}
                    inputMode="text"
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] outline-none transition-all placeholder:text-[var(--app-pages-subhead-text)] focus:ring-2 focus:ring-blue-600/10"
                    style={{
                      border: nameError
                        ? '1.5px solid var(--app-debit-color)'
                        : '1.5px solid color-mix(in srgb, var(--app-pages-border) 60%, transparent)',
                      boxShadow: nameError
                        ? '0 0 0 3px color-mix(in srgb, var(--app-debit-color) 12%, transparent)'
                        : 'none',
                    }}
                  />
                  {nameError && (
                    <p
                      className="mt-1.5 flex items-center gap-1 text-xs"
                      style={{ color: 'var(--app-debit-color)' }}
                    >
                      <AlertCircle size={11} /> {nameError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Template{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={templateId}
                        onChange={(e) => {
                          setTemplateId(e.target.value)
                          setError('')
                        }}
                        className="w-full appearance-none rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 pr-9 text-sm text-[var(--app-pages-text)] outline-none transition-all focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                      >
                        <option value="">Choose template</option>
                        {templates?.length > 0 ? (
                          templates.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name}
                            </option>
                          ))
                        ) : (
                          <option value="">No templates found</option>
                        )}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Provider{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={provider}
                        onChange={(e) => {
                          setProvider(e.target.value)
                          setError('')
                        }}
                        className="w-full appearance-none rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 pr-9 text-sm text-[var(--app-pages-text)] outline-none transition-all focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                      >
                        <option value="">Choose provider</option>
                        {status?.connected?.length > 0 && (
                          <option value="multi">All Connected Mailboxes (Distributed)</option>
                        )}
                        {status?.connected?.length > 0 ? (
                          Array.from(new Set(status.connected.map(c => c.provider))).map((prov) => (
                            <option key={prov} value={prov}>
                              {prov.charAt(0).toUpperCase() + prov.slice(1)} Account
                            </option>
                          ))
                        ) : (
                          <option value="">No providers found</option>
                        )}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                  </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: Data Source */}
              <div className="rounded-2xl border border-gray-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden shrink-0 mt-4">
                <button
                  onClick={() => setOpenSection(openSection === 'datasource' ? '' : 'datasource')}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Database size={16} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                      2. Data Source
                    </p>
                  </div>
                  <ChevronUp size={18} className={`transition-transform duration-300 ${openSection === 'datasource' ? '' : 'rotate-180'} text-gray-400`} />
                </button>
                
                {openSection === 'datasource' && (
                  <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800/80">
                    <RecipientDataSource 
                      campaignType={campaignType}
                      templateVariables={templateVariables}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Recipient Records Editor */}
            <div className={`transition-all duration-300 ease-in-out flex flex-col bg-slate-50/20 dark:bg-slate-900/10 p-4 sm:p-6 overflow-y-auto border-t lg:border-t-0 border-[var(--app-pages-border)]/20 justify-start space-y-4 min-w-0 ${isEditorExpanded ? 'w-full lg:w-full' : 'w-full lg:w-[50%]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users size={14} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Recipients Editor
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {editableData.length > 0 && (
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {showOnlyInvalid ? selectedRows.filter(id => displayedData.some(r => r._id === id)).length : selectedRows.length} of {showOnlyInvalid ? displayedData.length : editableData.length} Selected
                    </span>
                  )}
                  <button
                    onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                    className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    title={isEditorExpanded ? "Collapse Editor" : "Expand Editor"}
                  >
                    {isEditorExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>
              </div>

              

              {/* Duplicate Email Warning Alert */}
              {duplicateEmails.size > 0 && (
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 text-xs border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Duplicate Emails Found</p>
                      <p className="text-[10px] opacity-90 mt-0.5">
                        We detected {duplicateEmails.size} duplicate email addresses.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeduplicate}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 dark:bg-amber-500 px-3 py-1.5 text-xs font-bold text-white dark:text-amber-950 shadow-sm hover:bg-amber-700 dark:hover:bg-amber-400 transition-colors"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                    <span>Deduplicate</span>
                  </button>
                </div>
              )}

              {/* Invalid Email Warning Alert */}
              {invalidEmailsCount > 0 && (
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 text-xs border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold">Invalid Emails Found</p>
                      <p className="text-[10px] opacity-90 mt-0.5">
                        We detected {invalidEmailsCount} invalid email {invalidEmailsCount === 1 ? 'address' : 'addresses'}.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowOnlyInvalid(!showOnlyInvalid)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors ${
                        showOnlyInvalid 
                          ? 'bg-red-700 text-white dark:bg-red-400 dark:text-red-950'
                          : 'bg-red-600 dark:bg-red-500 text-white dark:text-red-950 hover:bg-red-700 dark:hover:bg-red-400'
                      }`}
                    >
                      <Eye size={12} strokeWidth={2.5} />
                      <span>{showOnlyInvalid ? 'Show All' : 'View Invalid'}</span>
                    </button>
                    <button
                      onClick={handleDeleteInvalid}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 dark:bg-red-500 px-3 py-1.5 text-xs font-bold text-white dark:text-red-950 shadow-sm hover:bg-red-700 dark:hover:bg-red-400 transition-colors"
                    >
                      <Trash2 size={12} strokeWidth={2.5} />
                      <span>Delete Invalid</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Actions & Inline Addition Toolbar */}
              <div className="flex flex-col gap-3 pt-1 border-t border-[var(--app-pages-border)]/30">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRow}
                      className="flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1.5 text-[11px] font-semibold text-blue-650 dark:text-blue-400 hover:bg-blue-100/80 transition"
                    >
                      <Plus size={11} /> Add Row
                    </button>
                    {columns.length > 0 && (
                      <button
                        onClick={() => setShowApplyToAllModal(true)}
                        className="flex items-center gap-1 ml-1 border-l border-[var(--app-pages-border)] pl-3 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[var(--app-pages-text)] hover:bg-[var(--app-pages-border)]/50 transition"
                      >
                        <ClipboardCheckIcon size={11} className="text-blue-500" /> Apply to All
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDeleteSelectedConfirm(true)}
                    disabled={selectedRows.length === 0}
                    className="flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-900/30 px-2.5 py-1.5 text-[11px] font-semibold text-red-650 dark:text-red-400 hover:bg-red-100/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={11} /> Delete Selected
                  </button>
                </div>
              </div>

              {/* Bulk Add Textbox */}
              {showBulkAdd && (
                <div
                  className="rounded-xl p-3 border border-[var(--app-pages-border)]/50 bg-[var(--app-pages-border)]/12"
                >
                  <label className="mb-1 block text-[10px] font-bold text-[var(--app-pages-text)] uppercase tracking-wider">
                    Paste raw email list
                  </label>
                  <textarea
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    placeholder="john@example.com, jane@example.com&#10;admin@company.com"
                    rows={3}
                    className="w-full rounded-xl px-2.5 py-1.5 text-xs text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600"
                  />
                  <div className="mt-2 flex justify-end gap-1.5">
                    <button
                      onClick={() => setShowBulkAdd(false)}
                      className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[var(--app-pages-text)] hover:bg-[var(--app-pages-border)]/50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkAdd}
                      className="rounded-lg bg-blue-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      Import
                    </button>
                  </div>
                </div>
              )}

              {/* Grid Table */}
              <div
                className="overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm flex-1 min-h-[250px] flex flex-col"
              >
                <div 
                  ref={tableContainerRef}
                  className="overflow-x-auto no-scrollbar flex-1 max-h-[40vh]"
                >
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 w-8 sticky top-0 bg-slate-100 dark:bg-slate-800/60 z-10 border border-slate-200 dark:border-slate-700 text-center">
                          <button
                            onClick={() => {
                              const displayedIds = displayedData.map(r => r._id)
                              const areAllDisplayedSelected = displayedIds.length > 0 && displayedIds.every(id => selectedRows.includes(id))
                              
                              if (areAllDisplayedSelected) {
                                dispatch(setSelectedRows(selectedRows.filter(id => !displayedIds.includes(id))))
                              } else {
                                dispatch(setSelectedRows(Array.from(new Set([...selectedRows, ...displayedIds]))))
                              }
                            }}
                            className={`flex h-4 w-4 items-center justify-center rounded transition mx-auto ${
                              displayedData.length > 0 && displayedData.every(r => selectedRows.includes(r._id))
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-transparent hover:border-blue-600'
                            }`}
                          >
                            <CheckSquare size={11} strokeWidth={3} />
                          </button>
                        </th>
                        {columns.map((col) => (
                          <th key={col} className="px-3 py-2 font-bold text-[var(--app-pages-text)] whitespace-nowrap min-w-[120px] uppercase tracking-wider text-[10px] sticky top-0 bg-slate-100 dark:bg-slate-800/60 z-10 border border-slate-200 dark:border-slate-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayedData.map((row) => {
                        const isSelected = selectedRows.includes(row._id)
                        const emailCol = columns.find(c => c.toLowerCase() === 'email') || columns[0]
                        const isDuplicate = row[emailCol] && duplicateEmails.has(row[emailCol].trim().toLowerCase())

                        return (
                          <tr
                            key={row._id}
                            className={`transition-all duration-500 group hover:bg-blue-50/30 dark:hover:bg-blue-950/10 ${
                              newlyAddedRowIds.has(row._id)
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                                : isSelected 
                                  ? 'bg-[var(--app-profile-btn-bg)]/[0.04]' 
                                  : isDuplicate 
                                    ? 'bg-amber-500/[0.02]' 
                                    : ''
                            }`}
                          >
                            <td className="px-3 py-1.5 w-8 border border-slate-200 dark:border-slate-700">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => dispatch(toggleRowSelection(row._id))}
                                  className={`flex h-4 w-4 items-center justify-center rounded transition ${
                                    isSelected
                                      ? 'bg-blue-600 text-white'
                                      : 'border border-gray-300 dark:border-gray-600 text-transparent group-hover:border-blue-400'
                                  }`}
                                >
                                  <CheckSquare size={11} strokeWidth={3} />
                                </button>
                              </div>
                            </td>
                            {columns.map((col) => {
                              const cellValue = row[col] ?? ''
                              const isEmailField = col === emailCol
                              
                              let isInvalid = false
                              let errorTooltip = ''
                              if (isEmailField) {
                                if (cellValue.trim() !== '' && !isValidEmail(cellValue.trim())) {
                                  isInvalid = true
                                  errorTooltip = 'Invalid email format'
                                } else if (isDuplicate) {
                                  isInvalid = true
                                  errorTooltip = 'Duplicate email address'
                                }
                              }

                              return (
                                <td key={`${row._id}-${col}`} className={`p-0 relative border ${isInvalid ? 'border-amber-400/80' : 'border-slate-200 dark:border-slate-700'} min-w-[120px]`}>
                                  <div className="relative flex items-center w-full h-full">
                                    <input
                                      autoFocus={row._id === focusedNewRowId && col === columns[0]}
                                      value={cellValue}
                                      onChange={(e) => {
                                        dispatch(updateRecipientRow({
                                          _id: row._id,
                                          col,
                                          value: e.target.value
                                        }))
                                      }}
                                      className={`w-full h-full bg-transparent px-2.5 py-1.5 text-xs text-[var(--app-pages-text)] outline-none transition ${
                                        isInvalid
                                          ? 'bg-amber-500/5 focus:ring-2 focus:ring-inset focus:ring-amber-500/40 pr-5'
                                          : 'focus:ring-2 focus:ring-inset focus:ring-blue-500/40'
                                      }`}
                                    />
                                    {isInvalid && (
                                      <AlertCircle
                                        size={10}
                                        className="absolute right-1.5 text-amber-500 pointer-events-none"
                                        title={errorTooltip}
                                      />
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                      {editableData.length === 0 && (
                        <tr>
                          <td
                            colSpan={columns.length + 1}
                            className="px-4 py-12 text-center text-xs text-[var(--app-pages-subhead-text)]"
                          >
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <FileSpreadsheet className="h-8 w-8 text-gray-350 dark:text-gray-600" />
                              <p className="font-semibold text-[var(--app-pages-text)]">No Recipients Loaded</p>
                              <p className="text-[10px] text-[var(--app-pages-subhead-text)] max-w-xs leading-relaxed">
                                Upload a spreadsheet, select a previous campaign on the left, or add rows manually.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div
            className="flex shrink-0 items-center justify-end gap-3 px-4 sm:px-8 py-4 sm:py-5"
            style={{
              borderTop:
                '1px solid color-mix(in srgb, var(--app-pages-border) 50%, transparent)',
            }}
          >
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--app-pages-text)] transition hover:opacity-80"
              style={{
                border:
                  '1.5px solid color-mix(in srgb, var(--app-pages-border) 70%, transparent)',
                background:
                  'color-mix(in srgb, var(--app-pages-border) 20%, transparent)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !requiredFieldsFilled}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition ${accentGradientClasses} disabled:cursor-not-allowed disabled:opacity-50`}
              title={
                !requiredFieldsFilled
                  ? 'Fill all required fields to create campaign'
                  : 'Create Campaign'
              }
            >
              {isLoading ? (
                <Loader size={15} className="animate-spin" />
              ) : (
                <Plus size={15} />
              )}
              {isLoading ? 'Queuing…' : 'Create Campaign'}
            </button>
          </div>
        </div>
      </div>
      {showApplyToAllModal && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--app-pages-bg)] p-6 shadow-2xl ring-1 ring-[var(--app-pages-border)]">
            <h3 className="mb-4 text-sm font-bold text-[var(--app-pages-text)] flex items-center gap-2">
              <ClipboardCheckIcon size={16} className="text-blue-500" /> Apply to All
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--app-pages-text)]">
                  Target Column
                </label>
                <select
                  value={applyToAllCol || columns[0]}
                  onChange={(e) => setApplyToAllCol(e.target.value)}
                  className="w-full rounded-xl bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] border border-[var(--app-pages-border)] outline-none focus:border-blue-500 transition"
                >
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--app-pages-text)]">
                  Value to Apply
                </label>
                <input
                  type="text"
                  placeholder="Type value here..."
                  value={applyToAllValue}
                  onChange={(e) => setApplyToAllValue(e.target.value)}
                  className="w-full rounded-xl bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] border border-[var(--app-pages-border)] outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowApplyToAllModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--app-pages-text)] hover:bg-[var(--app-pages-border)]/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyToAll}
                disabled={editableData.length === 0}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSelectedConfirm && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--app-pages-bg)] p-6 shadow-2xl ring-1 ring-[var(--app-pages-border)]">
            <h3 className="mb-2 text-base font-bold text-[var(--app-pages-text)] flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" /> Confirm Deletion
            </h3>
            <p className="text-sm text-[var(--app-pages-subhead-text)] mb-6">
              Are you sure you want to delete {selectedRows.length} selected row{selectedRows.length === 1 ? '' : 's'}?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteSelectedConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-[var(--app-pages-text)] hover:bg-[var(--app-pages-border)]/50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(removeRecipientRows(selectedRows))
                  setShowDeleteSelectedConfirm(false)
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-red-700 transition"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}
      </>,
      document.body
    )}
    </>
  )
}
