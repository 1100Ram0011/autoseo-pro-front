import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import {
  Loader,
  Plus,
  X,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Users,
  Trash2,
  CheckSquare,
  Settings,
  Database,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Mail,
  Clock,
  Send,
  UploadCloud,
  Zap,
  RefreshCw,
  Copy,
  ClipboardCheck,
  Info,
  LayoutTemplate,
  FileText,
  Upload,
  Hash,
  BriefcaseBusiness,
  Edit3,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'

import {
  useGetEmailAuthStatusQuery,
} from '@/redux/apis/emailConnect.api'

import {
  useCreateEmailCampaignMutation,
} from '@/redux/apis/emailCampaignApi'

import {
  useGetEmailTemplatesQuery,
} from '@/redux/apis/emailTemplateApi'
import RecipientDataSource from '@/components/common/RecipientDataSource/RecipientDataSource'
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

// ─── Constants ───────────────────────────────────────────────────────────────
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DynamicEmailCampaignModal({
  onClose,
  isGuest,
  onRequireAuth,
}) {
  const campaignType = 'email'
  const dispatch = useDispatch()
  const reduxUser = useSelector((state) => state.auth?.user)

  // ── API Hooks ──
  const { data: emailStatusRes } = useGetEmailAuthStatusQuery()
  const [createCampaign, { isLoading: isCreating }] = useCreateEmailCampaignMutation()
  const isEstimating = false

  // ── Form State ──
  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [error, setError] = useState('')
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showApplyToAllModal, setShowApplyToAllModal] = useState(false)
  const [applyToAllCol, setApplyToAllCol] = useState('')
  const [applyToAllValue, setApplyToAllValue] = useState('')

  // ── Template Fetching (depends on selected provider) ──
  const { data: templatesData, isFetching: templatesFetching } =
    useGetEmailTemplatesQuery()
  const approvedTemplates = useMemo(() => templatesData || [], [templatesData])

  // ── Active Providers ──
  const activeProviders = useMemo(
    () =>
      emailStatusRes?.connected?.length > 0
        ? Array.from(new Set(emailStatusRes.connected.map((c) => c.provider)))
        : [],
    [emailStatusRes]
  )

  // Reset template when provider changes
  useEffect(() => {
    setTimeout(() => setTemplateId(''), 0)
  }, [provider])

  // ── Template Variables ──
  const selectedTemplate = useMemo(
    () => approvedTemplates.find((t) => t._id === templateId),
    [templateId, approvedTemplates]
  )

  const templateVariables = useMemo(
    () => selectedTemplate?.variables || [],
    [selectedTemplate]
  )

  // ── Redux Recipient State ──
  const {
    editableData = [],
    columns = [],
    selectedRows = [],
    inputMode = 'upload',
    uploadedFiles = [],
  } = useSelector((state) => state.emailSelection || {})

  const emailCol = useMemo(() => {
    return columns.find((c) => c.toLowerCase() === 'email') || 'Email'
  }, [columns])

  const selectedRecipients = useMemo(() => {
    const rows = selectedRows.length > 0
      ? editableData.filter((r) => selectedRows.includes(r._id))
      : editableData
    return rows
      .map((r) => String(r[emailCol] || r.email || '').trim())
      .filter(Boolean)
  }, [selectedRows, editableData, emailCol])

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      dispatch(clearRecipientState())
    }
  }, [dispatch])

  // ── Row Highlight Tracking ──
  const [newlyAddedRowIds, setNewlyAddedRowIds] = useState(new Set())
  const [focusedNewRowId, setFocusedNewRowId] = useState(null)
  const prevRowIdsRef = useRef(new Set())
  const tableContainerRef = useRef(null)
  const timeoutsRef = useRef([])

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
    }
  }, [])

  useEffect(() => {
    const currentIds = new Set(editableData.map((r) => r._id))
    const prevIds = prevRowIdsRef.current
    const addedIds = []
    if (prevIds.size > 0) {
      currentIds.forEach((id) => {
        if (!prevIds.has(id)) addedIds.push(id)
      })
    }
    prevRowIdsRef.current = currentIds

    if (addedIds.length > 0) {
      setTimeout(() => { 
        setNewlyAddedRowIds((prev) => {
          const next = new Set(prev)
          addedIds.forEach((id) => next.add(id))
          return next
        })
      }, 0)

      setTimeout(() => {
        if (tableContainerRef.current) {
          tableContainerRef.current.scrollTo({
            top: tableContainerRef.current.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 50)

      const t = setTimeout(() => {
        setNewlyAddedRowIds((prev) => {
          const next = new Set(prev)
          addedIds.forEach((id) => next.delete(id))
          return next
        })
      }, 3000)
      timeoutsRef.current.push(t)
    }
  }, [editableData])

  // ── Auto-dismiss error ──
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 4000)
    return () => clearTimeout(t)
  }, [error])

  

  // ── Sync template variables with columns ──
  useEffect(() => {
    const baseCol = 'Email'
    const requiredCols = [baseCol, ...templateVariables]
    
    // Find missing using case-insensitive check
    const missing = requiredCols.filter(req => 
      !columns.some(col => col.toLowerCase() === req.toLowerCase())
    )
    
    // Find extraneous (columns that are present but no longer required)
    const extraneous = columns.filter(col =>
      !requiredCols.some(req => req.toLowerCase() === col.toLowerCase())
    )
    
    // Check for case mismatches
    const hasCaseMismatch = columns.some(col => {
      if (extraneous.includes(col)) return false;
      const matchedReq = requiredCols.find(req => req.toLowerCase() === col.toLowerCase());
      return matchedReq && matchedReq !== col;
    })
    
    if (missing.length === 0 && extraneous.length === 0 && !hasCaseMismatch) return

    const nextCols = columns.map(col => {
      if (extraneous.includes(col)) return null;
      const matchedReq = requiredCols.find(req => req.toLowerCase() === col.toLowerCase());
      return matchedReq || col;
    }).filter(Boolean).concat(missing)

    dispatch(setColumns(nextCols))

    const nextData = editableData.map((row) => {
      const updated = { ...row }
      
      // Fix case mismatch
      columns.forEach(col => {
        if (!extraneous.includes(col)) {
          const matchedReq = requiredCols.find(req => req.toLowerCase() === col.toLowerCase());
          if (matchedReq && matchedReq !== col) {
            updated[matchedReq] = updated[col]
            delete updated[col]
          }
        }
      })
      
      missing.forEach((m) => {
        if (!(m in updated)) updated[m] = ''
      })
      extraneous.forEach((ext) => {
        delete updated[ext]
      })
      return updated
    })
    dispatch(setEditableData(nextData))
  }, [templateVariables, columns, editableData, dispatch])

  // ── Duplicate Detection ──
  const duplicateEmails = useMemo(() => {
    const emailCol = columns.find((c) => c.toLowerCase() === 'email') || columns[0]
    if (!emailCol || editableData.length === 0) return new Set()
    const counts = {}
    editableData.forEach((row) => {
      const val = (row[emailCol] || '').trim()
      if (val) counts[val] = (counts[val] || 0) + 1
    })
    const dups = new Set()
    Object.keys(counts).forEach((email) => {
      if (counts[email] > 1) dups.add(email)
    })
    return dups
  }, [editableData, columns])

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

    const remainingFileIds = new Set(
      validRows
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

  const handleDeduplicate = () => {
    const emailCol =
      columns.find((c) => c.toLowerCase() === 'email') || columns[0]
    if (!emailCol) return
    const seen = new Set()
    const uniqueRows = []
    const removedIds = []
    editableData.forEach((row) => {
      const val = (row[emailCol] || '').trim()
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
    const nextSelected = selectedRows.filter((id) => !removedIds.includes(id))
    dispatch(setSelectedRows(nextSelected))

    const remainingFileIds = new Set(
      uniqueRows
        .filter((r) => r.fileId && !r.fileId.startsWith('campaign-'))
        .map((r) => r.fileId)
    )
    if (uploadedFiles.length > 0) {
      const updatedFiles = uploadedFiles.filter((f) =>
        remainingFileIds.has(f.id)
      )
      if (updatedFiles.length !== uploadedFiles.length) {
        dispatch(setUploadedFiles(updatedFiles))
      }
    }
  }

  // ── Row Management ──
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

  const handleAddRow = () => {
    if (editableData.length > 0) {
      const lastRow = editableData[editableData.length - 1]
      const isBlank = columns.every((col) => {
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
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTo({
          top: tableContainerRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 50)
  }

  // ── Missing Variables ──
  const missingVariables = useMemo(() => {
    if (editableData.length === 0 && inputMode === 'upload') return []
    return templateVariables.filter((v) => !columns.includes(v))
  }, [templateVariables, columns, editableData.length, inputMode])

  // ── Name Validation ──
  const normalizedName = name.trim()
  const isNameValid = useMemo(() => {
    if (!normalizedName) return false
    if (normalizedName.length > NAME_MAX) return false
    if (!NAME_REGEX.test(normalizedName)) return false
    return true
  }, [normalizedName])

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
    const { value: sanitizedValue, error: nameErr } =
      validateAndSanitize(inputValue)
    setName(sanitizedValue)
    setError(nameErr)
  }

  // ── Grid Perfect Check ──
  const isGridPerfect = useMemo(() => {
    if (editableData.length === 0) return false
    const emailCol = columns.find((c) => c.toLowerCase() === 'email') || 'Email'
    for (const row of editableData) {
      const emailVal = (row[emailCol] || '').toString().trim()
      if (!emailVal || !emailVal.includes('@')) return false
      for (const variable of templateVariables) {
        const cellVal = (row[variable] || '').trim()
        if (!cellVal) return false
      }
    }
    return true
  }, [editableData, templateVariables, columns])

  // ── Readiness ──
  const requiredFieldsFilled = useMemo(() => {
    return (
      isNameValid &&
      Boolean(provider) &&
      Boolean(templateId) &&
      editableData.length > 0 &&
      missingVariables.length === 0 &&
      isGridPerfect
    )
  }, [
    isNameValid,
    provider,
    templateId,
    editableData.length,
    missingVariables.length,
    isGridPerfect,
  ])

  const checklistItems = useMemo(() => {
    const items = [
      { label: 'Campaign name', done: isNameValid, icon: Mail },
      { label: 'Provider selected', done: Boolean(provider), icon: Mail },
      {
        label: 'Template selected',
        done: Boolean(templateId),
        icon: LayoutTemplate,
      },
      {
        label: 'Recipients loaded',
        done: editableData.length > 0,
        icon: Users,
      },
    ]

    if (templateVariables.length > 0) {
      items.push({
        label: 'Variables mapped',
        done: missingVariables.length === 0,
        icon: Database,
      })
      items.push({
        label: 'Variables filled',
        done: isGridPerfect,
        icon: Check,
      })
    }

    return items
  }, [
    isNameValid,
    provider,
    templateId,
    editableData.length,
    templateVariables.length,
    missingVariables.length,
    isGridPerfect,
  ])

  const progressPct = useMemo(() => {
    const done = checklistItems.filter((i) => i.done).length
    return Math.round((done / checklistItems.length) * 100)
  }, [checklistItems])

  // ── Submit ──
  const handleSubmit = async () => {
    if (reduxUser?.isGuest || isGuest) {
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
      const { _id, fileId: _fileId, ...rest } = row
      return rest
    })
    
    const emailCol = columns.find((c) => c.toLowerCase() === 'email') || columns[0]
    
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
      let finalPayload = new FormData()
      finalPayload.append('name', normalizedName)
      finalPayload.append('templateId', templateId)
      finalPayload.append('provider', provider)
      if (scheduledAt) finalPayload.append('scheduledAt', scheduledAt)
      
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

      await createCampaign(finalPayload).unwrap()
      toast.success('Campaign created successfully!')
      onClose()
    } catch (err) {
      setError(err?.data?.message || 'Failed to create campaign.')
    }
  }

  // ── Accent Classes ──
  const accentGradientClasses =
    'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90'

  // ── Render ──
  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md transition-all sm:p-6">
      <div
        className="ring-[var(--app-pages-border)]/50 mx-auto flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded bg-[var(--app-pages-bg)] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-1"
        style={{ animation: 'modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <style>{`
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes progressPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}</style>
        {/* ── Header ── */}
        <div
          className="relative overflow-hidden px-4 py-3 sm:px-6 sm:py-4"
          style={{
            borderBottom:
              '1px solid color-mix(in srgb, var(--app-pages-border) 50%, transparent)',
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div>
                <h2 className="text-[15px] font-bold leading-tight text-[var(--app-pages-text)]">
                  Create Email Campaign
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-[var(--app-pages-border)]/40 rounded-lg p-1.5 text-[var(--app-pages-subhead-text)] transition duration-200 hover:rotate-90 hover:text-[var(--app-pages-text)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          {/* ── Left Column: Campaign Information & Quick Tips ── */}
          <div
            className={`no-scrollbar flex flex-col bg-[var(--app-pages-bg)] transition-all duration-300 ease-in-out ${
              isEditorExpanded
                ? 'w-0 overflow-hidden opacity-0 lg:border-r-0'
                : 'lg:border-[var(--app-pages-border)]/45 w-full shrink-0 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:w-[28%] lg:border-r'
            }`}
          >
            {/* Global Error Banner */}
            {error && (
              <div
                className="flex shrink-0 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
                style={{
                  background:
                    'color-mix(in srgb, var(--app-debit-color) 8%, transparent)',
                  border:
                    '1px solid color-mix(in srgb, var(--app-debit-color) 40%, transparent)',
                  color: 'var(--app-debit-color)',
                }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <AlertCircle size={15} className="shrink-0" />
                  <span className="truncate text-xs font-medium">{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ── Section 1: Campaign Details ── */}
            <div className="shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-4 px-4 pb-5 pt-5 sm:px-5">
                {/* Campaign Name */}
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                    <span>
                      Campaign Name{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                      {normalizedName.length}/{NAME_MAX}
                    </span>
                  </label>
                  <input
                    value={name}
                    placeholder="e.g. Black Friday Promo"
                    onChange={handleNameChange}
                    inputMode="text"
                    className={`w-full rounded-xl border bg-white px-4 py-2.5 text-[13px] text-[var(--app-pages-text)] outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600/10 dark:bg-slate-950 ${
                      nameError
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-gray-100 focus:border-blue-500 dark:border-slate-800'
                    }`}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Email Provider */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                      Email Provider{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={provider}
                        onChange={(e) => {
                          setProvider(e.target.value)
                          setTemplateId('')
                          setError('')
                        }}
                        className="w-full appearance-none rounded-xl border border-gray-100 bg-white px-4 py-2.5 pr-9 text-[13px] text-[var(--app-pages-text)] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <option value="">Select provider…</option>
                        {activeProviders.length > 1 && (
                          <option value="multi">All Connected Mailboxes (Distributed)</option>
                        )}
                        {activeProviders.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov.charAt(0).toUpperCase() + prov.slice(1)} Account
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    {activeProviders.length === 0 && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: 'var(--app-debit-color)' }}
                      >
                        No active email providers found.
                      </p>
                    )}
                  </div>

                  {/* Template */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
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
                        disabled={!provider || templatesFetching}
                        className={`w-full appearance-none rounded-xl border border-gray-100 bg-white px-4 py-2.5 pr-9 text-[13px] text-[var(--app-pages-text)] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-950 ${
                          !provider
                            ? 'bg-gray-50 opacity-50 dark:bg-slate-900/50'
                            : ''
                        }`}
                      >
                        <option value="">
                          {!provider
                            ? 'Select a provider first…'
                            : templatesFetching
                              ? 'Loading…'
                              : 'Select template…'}
                        </option>
                        {approvedTemplates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    {provider &&
                      !templatesFetching &&
                      approvedTemplates.length === 0 && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: 'var(--app-debit-color)' }}
                        >
                          No approved templates for this provider.
                        </p>
                      )}
                  </div>
                </div>

                {/* Schedule */}
                {/* <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                    <Clock
                      size={13}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    Schedule{' '}
                    <span className="text-[11px] font-normal normal-case text-gray-400 dark:text-gray-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={(() => {
                      const now = new Date()
                      const offset = now.getTimezoneOffset() * 60000
                      return new Date(now.getTime() - offset).toISOString().slice(0, 16)
                    })()}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val && new Date(val) < new Date()) {
                        toast.error('Cannot schedule campaigns in the past.')
                        setScheduledAt('')
                      } else {
                        setScheduledAt(val)
                      }
                    }}
                    className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-[13px] text-[var(--app-pages-text)] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-950"
                  />
                  <p className="mt-1 text-xs text-[var(--app-pages-subhead-text)]">
                    Leave blank to run immediately when launched
                  </p>
                </div> */}
              </div>
            </div>

            {/* ── Section 2: Variable Mapping (Data Source) ── */}
            <div className="shrink-0">
              <RecipientDataSource
                campaignType="email"
                templateVariables={templateVariables}
              />
            </div>
          </div>

          {/* ── Middle Column: Recipients Editor ── */}
          <div
            className={`flex min-w-0 flex-col justify-start space-y-4 overflow-y-auto border-t bg-slate-50/20 p-4 transition-all duration-300 ease-in-out dark:bg-slate-900/10 sm:p-5 lg:border-t-0 ${
              isEditorExpanded
                ? 'w-full lg:w-full'
                : `w-full shrink-0 ${selectedTemplate ? 'border-[var(--app-pages-border)]/45 lg:w-[44%] lg:border-r' : 'lg:w-[44%]'}`
            }`}
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  }}
                >
                  <Users size={14} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Recipients Editor
                  </p>
                  {editableData.length > 0 && (
                    <p className="mt-0.5 text-[10px] text-[var(--app-pages-subhead-text)]">
                      {editableData.length} recipient
                      {editableData.length !== 1 ? 's' : ''} loaded
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editableData.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {selectedRows.length}/{editableData.length} selected
                  </span>
                )}
                <button
                  onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                  className="hidden h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200 dark:hover:bg-slate-800 lg:flex"
                  title={isEditorExpanded ? 'Collapse Editor' : 'Expand Editor'}
                >
                  {isEditorExpanded ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Invalid Email Warning Alert */}
            {invalidEmailsCount > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3 text-xs border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
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
                    onClick={handleDeleteInvalid}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 dark:bg-red-500 px-3 py-1.5 text-xs font-bold text-white dark:text-red-950 shadow-sm hover:bg-red-700 dark:hover:bg-red-400 transition-colors"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                    <span>Delete Invalid</span>
                  </button>
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {duplicateEmails.size > 0 && (
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-start gap-2.5">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Duplicate Emails Found</p>
                    <p className="mt-0.5 text-[10px] opacity-90">
                      We detected {duplicateEmails.size} duplicate email addresses.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeduplicate}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:text-amber-950 dark:hover:bg-amber-400"
                >
                  <Trash2 size={12} strokeWidth={2.5} />
                  <span>Deduplicate</span>
                </button>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="border-[var(--app-pages-border)]/30 flex flex-col gap-3 border-t pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRow}
                    className="text-blue-650 flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-semibold transition hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    <Plus size={11} /> Add Row
                  </button>
                  {columns.length > 0 && (
                    <button
                      onClick={() => setShowApplyToAllModal(true)}
                      className="flex items-center gap-1 ml-1 border-l border-[var(--app-pages-border)] pl-3 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-[var(--app-pages-text)] hover:bg-[var(--app-pages-border)]/50 transition"
                    >
                      <ClipboardCheck size={11} className="text-blue-500" /> Apply to All
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowDeleteSelectedConfirm(true)}
                  disabled={selectedRows.length === 0}
                  className="text-red-650 flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold transition hover:bg-red-100/80 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400"
                >
                  <Trash2 size={11} /> Delete Selected
                </button>
              </div>
            </div>

            {/* Grid Table */}
            <div className="flex min-h-[250px] flex-1 flex-col overflow-hidden rounded border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm">
              <div
                ref={tableContainerRef}
                className="scrollbar flex-1 overflow-auto"
              >
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr>
                      <th className="sticky top-0 z-10 w-10 border border-slate-200 bg-slate-100 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500">
                        <button
                          onClick={() => {
                            if (
                              selectedRows.length === editableData.length &&
                              editableData.length > 0
                            ) {
                              dispatch(setSelectedRows([]))
                            } else {
                              dispatch(
                                setSelectedRows(editableData.map((r) => r._id))
                              )
                            }
                          }}
                          className={`mx-auto flex h-4 w-4 items-center justify-center rounded transition ${
                            selectedRows.length === editableData.length &&
                            editableData.length > 0
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-transparent hover:border-blue-600 dark:border-gray-600'
                          }`}
                        >
                          <CheckSquare size={11} strokeWidth={3} />
                        </button>
                      </th>
                      <th className="sticky top-0 z-10 w-10 border border-slate-200 bg-slate-100 px-2 py-2 text-center text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-500">
                        #
                      </th>
                      {columns.map((col) => {
                        const isEmail = col.toLowerCase() === 'email'
                        const isName = col.toLowerCase() === 'name'
                        const isVariable = !isEmail && !isName

                        return (
                          <th
                            key={col}
                            className="sticky top-0 z-10 min-w-[120px] whitespace-nowrap border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-pages-text)] dark:border-slate-700 dark:bg-slate-800/60"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                {col}
                                {isEmail && (
                                  <span className="text-red-400">*</span>
                                )}
                              </span>
                              {isVariable && editableData.length > 1 && (
                                <button
                                  onClick={() => {
                                    const firstVal = editableData[0][col] || ''
                                    const updated = editableData.map((r) => ({
                                      ...r,
                                      [col]: firstVal,
                                    }))
                                    dispatch(setEditableData(updated))
                                  }}
                                  className="ml-2 flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-500 shadow-sm transition hover:bg-gray-50 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
                                  title="Apply first row's value to all rows below"
                                >
                                  <Copy size={10} />
                                </button>
                              )}
                            </div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {editableData.map((row) => {
                      const isSelected = selectedRows.includes(row._id)
                      const emailCol = columns.find((c) => c.toLowerCase() === 'email') || columns[0]
                      const isDuplicate = row[emailCol] && duplicateEmails.has(row[emailCol].trim())

                      return (
                        <tr
                          key={row._id}
                          className={`group transition-all duration-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 ${
                            newlyAddedRowIds.has(row._id)
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                              : isSelected
                                ? 'bg-[var(--app-profile-btn-bg)]/[0.04]'
                                : isDuplicate
                                  ? 'bg-amber-500/[0.02]'
                                  : ''
                          }`}
                        >
                          <td className="w-10 border border-slate-200 px-2 py-1.5 dark:border-slate-700">
                            <div className="flex justify-center">
                              <button
                                onClick={() =>
                                  dispatch(toggleRowSelection(row._id))
                                }
                                className={`flex h-4 w-4 items-center justify-center rounded transition ${
                                  isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 text-transparent group-hover:border-blue-400 dark:border-gray-600'
                                }`}
                              >
                                <CheckSquare size={11} strokeWidth={3} />
                              </button>
                            </div>
                          </td>
                          <td className="w-10 select-none border border-slate-200 px-2 py-1.5 text-center font-mono text-[10px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
                            {editableData.indexOf(row) + 1}
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
                              <td
                                key={`${row._id}-${col}`}
                                className={`relative border p-0 ${
                                  isInvalid
                                    ? 'border-amber-400/80'
                                    : 'border-slate-200 dark:border-slate-700'
                                } min-w-[120px]`}
                              >
                                <div className="relative flex h-full w-full items-center">
                                  <input
                                    autoFocus={
                                      row._id === focusedNewRowId &&
                                      col === columns[0]
                                    }
                                    value={cellValue}
                                    onChange={(e) => {
                                      dispatch(
                                        updateRecipientRow({
                                          _id: row._id,
                                          col,
                                          value: e.target.value,
                                        })
                                      )
                                    }}
                                    className={`h-full w-full bg-transparent px-2.5 py-1.5 text-xs text-[var(--app-pages-text)] outline-none transition ${
                                      isInvalid
                                        ? 'bg-amber-500/5 pr-5 focus:ring-2 focus:ring-inset focus:ring-amber-500/40'
                                        : 'focus:ring-2 focus:ring-inset focus:ring-blue-500/40'
                                    }`}
                                  />
                                  {isInvalid && (
                                    <AlertCircle
                                      size={10}
                                      className="pointer-events-none absolute right-1.5 text-amber-500"
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
                          colSpan={columns.length + 2}
                          className="px-4 py-14 text-center text-xs text-[var(--app-pages-subhead-text)]"
                        >
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                              <div
                                className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--app-pages-border)]"
                                style={{
                                  background:
                                    'color-mix(in srgb, var(--app-profile-btn-bg) 5%, transparent)',
                                }}
                              >
                                <Users
                                  className="h-7 w-7"
                                  style={{
                                    color:
                                      'color-mix(in srgb, var(--app-profile-btn-bg) 40%, transparent)',
                                  }}
                                />
                              </div>
                              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
                                <Plus
                                  size={10}
                                  className="text-[var(--app-pages-subhead-text)]"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-[var(--app-pages-text)]">
                                No Recipients Yet
                              </p>
                              <p className="max-w-[280px] text-[11px] leading-relaxed text-[var(--app-pages-subhead-text)]">
                                Use the Data Source panel on the left to upload
                                a spreadsheet, enter manually, or import from
                                leads.
                              </p>
                            </div>
                            <div className="flex items-center gap-4 pt-1">
                              {[
                                { icon: Upload, label: 'Upload' },
                                { icon: Edit3, label: 'Manual' },
                                { icon: BriefcaseBusiness, label: 'Leads' },
                              ].map(({ icon: Icon, label }) => (
                                <div
                                  key={label}
                                  className="flex items-center gap-1 text-[10px] text-[var(--app-pages-subhead-text)]"
                                >
                                  <div
                                    className="flex h-5 w-5 items-center justify-center rounded-md"
                                    style={{
                                      backgroundColor:
                                        'color-mix(in srgb, var(--app-pages-border) 40%, transparent)',
                                    }}
                                  >
                                    <Icon size={12} className="text-gray-500 dark:text-gray-400" />
                                  </div>
                                  <span>{label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ── Right Column: Live Summary & Preview ── */}
          <div
            className={`flex flex-col items-stretch space-y-4 overflow-y-auto bg-slate-50/50 p-4 transition-all duration-300 ease-in-out dark:bg-slate-900/30 sm:p-5 ${
              isEditorExpanded
                ? 'w-0 overflow-hidden border-none p-0 px-0 opacity-0 sm:p-0 sm:px-0'
                : 'lg:border-[var(--app-pages-border)]/45 w-full shrink-0 lg:w-[28%] lg:border-l'
            }`}
          >
            {/* Live Summary */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Zap size={14} /> Live Summary
              </h3>
              <div className="space-y-2.5 text-[11px] text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users size={12} /> Total Recipients
                  </span>
                  <span className=" text-black font-semibold">
                    {editableData?.length > 0 ? editableData.length : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} /> Email Provider
                  </span>
                  <span className=" text-black font-semibold text-right">
                    {provider === 'multi' 
                      ? 'Distributed (Multi)' 
                      : provider 
                        ? provider.charAt(0).toUpperCase() + provider.slice(1) + ' Account' 
                        : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet size={12} /> Template
                  </span>
                  <span className=" text-black font-semibold">
                    {selectedTemplate ? selectedTemplate.name : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} /> Schedule
                  </span>
                  <span className=" text-black font-semibold">
                    {scheduledAt
                      ? new Date(scheduledAt).toLocaleString()
                      : 'Run Instant Campaign'}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 flex items-center justify-between">
                <span>Estimated Cost</span>
                {isEstimating && (
                  <Loader size={10} className="animate-spin text-[#FB6218]" />
                )}
              </h3>
              <div className="space-y-2.5 text-[11px] text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Conversations</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedRecipients.length > 0 ? selectedRecipients.length : '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Category</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {selectedTemplate?.category || 'N/A'}
                  </span>
                </div>
              </div>
            </div> 

            {/* Campaign Readiness */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                Campaign Readiness
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700'}`}
                      >
                        {item.done ? (
                          <Check
                            size={8}
                            className="text-white"
                            strokeWidth={3}
                          />
                        ) : (
                          <div className="h-1 w-1 rounded-full bg-white dark:bg-slate-400" />
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-medium uppercase tracking-wider ${item.done ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="fill-none stroke-gray-100 dark:stroke-slate-800"
                      strokeWidth="4"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`fill-none ${progressPct === 100 ? 'stroke-emerald-500' : 'stroke-blue-500'} transition-all duration-1000 ease-out`}
                      strokeWidth="4"
                      strokeDasharray={`${progressPct}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {progressPct}%
                    </span>
                  </div>
                </div>
              </div>
              {progressPct === 100 && (
                <p className="mt-2 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Ready to Send
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4"
          style={{
            borderTop:
              '1px solid color-mix(in srgb, var(--app-pages-border) 50%, transparent)',
          }}
        >
          {/* Left: Cancel button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2 text-[13px] font-semibold text-[var(--app-pages-text)] transition hover:opacity-80"
              style={{
                border:
                  '1.5px solid color-mix(in srgb, var(--app-pages-border) 70%, transparent)',
                background:
                  'color-mix(in srgb, var(--app-pages-border) 20%, transparent)',
              }}
            >
              Cancel
            </button>
          </div>

          {/* Right: buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSubmit}
              disabled={isCreating || !requiredFieldsFilled}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-bold shadow-sm transition-all active:scale-[0.98] ${accentGradientClasses} disabled:cursor-not-allowed disabled:opacity-50`}
              title={
                !requiredFieldsFilled
                  ? 'Fill all required fields to create campaign'
                  : 'Create Campaign'
              }
            >
              {isCreating ? (
                <Loader size={15} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {isCreating ? 'Creating…' : 'Create Campaign'}
            </button>
          </div>
        </div>
        {/* </div> */}
      </div>

      {showApplyToAllModal && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--app-pages-bg)] p-6 shadow-2xl ring-1 ring-[var(--app-pages-border)]">
            <h3 className="mb-4 text-sm font-bold text-[var(--app-pages-text)] flex items-center gap-2">
              <ClipboardCheck size={16} className="text-blue-500" /> Apply to All
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
      </div>,
    document.body
  )
}
