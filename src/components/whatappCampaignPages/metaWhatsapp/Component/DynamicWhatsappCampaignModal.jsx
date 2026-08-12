import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
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
  Phone as PhoneIcon,
  MessageSquare,
  Clock,
  Send,
  Hash,
  Upload,
  Zap,
  RefreshCw,
  Copy,
  ClipboardCheck,
  Edit3,
  BriefcaseBusiness,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'

import {
  useGetWhatsappNumberQuery,
  useGetTemplatesQuery,
  useCreateCampaignMutation,
  useEstimateCampaignCostMutation,
} from '@/redux/apis/metaWhatsapp.api'
import RecipientDataSource from '@/components/common/RecipientDataSource/RecipientDataSource'
import MetaWhatsAppPreview from './MetaTemplates/WhatsAppPreview'
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

const WhatsAppPreview = ({ fromNumber, template, bodyValues }) => {
  if (!template) return null

  const hType = (template.header?.format || template.header?.type || 'NONE').toUpperCase()

  const renderText = (str, prefix = 'body') => {
    if (!str) return ''
    return str.replace(/\{\{(\d+)\}\}/g, (_, n) => {
      const key = prefix === 'header_text' ? 'header_text' : `${prefix}_${n}`
      const val = bodyValues[key]
      return val && val.trim() ? val : `{{${n}}}`
    })
  }

  const form = {
    category: template.category,
    marketingType: template.marketingType,
    productFormat: template.productFormat,
    header: template.header ? {
      ...template.header,
      format: hType,
      type: hType,
      text: hType === 'TEXT' ? renderText(template.header?.text || template.header?.value, 'header_text') : '',
      mediaUrl: bodyValues['header_url'] || template.header?.mediaUrl || ''
    } : undefined,
    body: renderText(template.body, 'body'),
    footer: template.footer || '',
    buttons: template.buttons || [],
    carouselCards:
      template.carouselCards?.map((card, idx) => ({
        ...card,
        header: card.header ? {
          ...card.header,
          format: (card.header?.format || card.header?.type || 'IMAGE').toUpperCase(),
          type: (card.header?.format || card.header?.type || 'IMAGE').toUpperCase(),
          mediaUrl: bodyValues[`card_${idx}_header_url`] || card.header?.mediaUrl || ''
        } : undefined,
        body: renderText(card.body, `card_${idx}_body`),
      })) || [],
    carouselHeaderType: hType,
    carouselButton1Type: template.carouselCards?.[0]?.buttons?.[0]?.type,
    carouselButton2Type: template.carouselCards?.[0]?.buttons?.[1]?.type,
    authConfig: template.authConfig
  }

  return (
    <div className="relative mx-auto flex h-[480px] w-full max-w-[280px] flex-col overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-[#efeae2] shadow-2xl">
      {/* Phone Notch */}
      <div className="absolute left-1/2 top-0 z-50 h-4 w-24 -translate-x-1/2 rounded-b-xl bg-gray-900"></div>

      {/* WhatsApp Header */}
      <div className="z-10 flex shrink-0 items-center gap-2.5 bg-[#075e54] px-3 py-2 pt-6 text-white shadow-md">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-semibold tracking-wide">
            {fromNumber || 'Select a number'}
          </div>
          <div className="mt-0.5 text-[9px] leading-none text-white/80">
            online
          </div>
        </div>
      </div>

      {/* Chat Background */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='3' cy='3' r='1' fill='%23c9bdb2' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      >
        <div className="no-scrollbar absolute inset-0 overflow-y-auto p-3 pt-5">
          <div className="flex min-h-full flex-col justify-end">
            <MetaWhatsAppPreview form={form} hideShell={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DynamicWhatsappCampaignModal({
  onClose,
  isGuest,
  onRequireAuth,
}) {
  const dispatch = useDispatch()
  const reduxUser = useSelector((state) => state.auth?.user)

  // ── API Hooks ──
  const { data: whatsappNumberRes } = useGetWhatsappNumberQuery()
  const [createCampaign, { isLoading: isCreating }] =
    useCreateCampaignMutation()
  const [estimateCampaignCost, { isLoading: isEstimating }] =
    useEstimateCampaignCostMutation()
  const [estimatedCost, setEstimatedCost] = useState(null)

  // ── Form State ──
  const [name, setName] = useState('')
  const [numberId, setNumberId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [error, setError] = useState('')
  const [isEditorExpanded, setIsEditorExpanded] = useState(false)
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false)
  const [showApplyToAllModal, setShowApplyToAllModal] = useState(false)
  const [applyToAllCol, setApplyToAllCol] = useState('')
  const [applyToAllValue, setApplyToAllValue] = useState('')

  // ── Template Fetching (depends on selected number) ──
  const { data: templatesData, isFetching: templatesFetching } =
    useGetTemplatesQuery({ numberId }, { skip: !numberId })
  const approvedTemplates = useMemo(
    () => (templatesData?.data || []).filter((t) => t.status === 'APPROVED'),
    [templatesData]
  )

  // ── Active Numbers ──
  const activeNumbers = useMemo(
    () =>
      (whatsappNumberRes?.data || []).filter(
        (n) => n.status === 'active' || n.status === 'connected'
      ),
    [whatsappNumberRes]
  )

  // Auto-select first number if only one
  useEffect(() => {
    if (activeNumbers.length > 0 && !numberId) {
      setNumberId(activeNumbers[0]._id)
    }
  }, [activeNumbers, numberId])

  // Reset template when number changes
  useEffect(() => {
    setTemplateId('')
  }, [numberId])

  // ── Template Variables ──
  const selectedTemplate = useMemo(
    () => approvedTemplates.find((t) => t._id === templateId),
    [templateId, approvedTemplates]
  )

  console.log("selectedTemplate ",selectedTemplate)

  const templateVariables = useMemo(() => {
    if (!selectedTemplate) return []
    
    const vars = [];

    // 1. Header
    if (selectedTemplate.header) {
      const hFormat = (selectedTemplate.header.format || "NONE").toUpperCase();
      if (hFormat === "TEXT" && selectedTemplate.header.text?.includes("{{1}}")) {
        vars.push("header_text");
      } else if (["IMAGE", "VIDEO", "DOCUMENT"].includes(hFormat)) {
        // Required if no default media URL or upload handle is specified
        const isRequired = !selectedTemplate.header.mediaUrl && !selectedTemplate.header.headerHandle;
        if (isRequired) {
          vars.push("header_url");
        }
        if (hFormat === "DOCUMENT") {
          vars.push("header_filename");
        }
      } else if (hFormat === "LOCATION") {
        vars.push("header_latitude");
        vars.push("header_longitude");
        vars.push("header_location_name");
        vars.push("header_location_address");
      }
    }

    // 2. Body
    if (selectedTemplate.body) {
      const matches = [...selectedTemplate.body.matchAll(/\{\{(\d+)\}\}/g)];
      const uniqueNums = [...new Set(matches.map(m => parseInt(m[1], 10)))].sort((a, b) => a - b);
      uniqueNums.forEach(n => {
        vars.push(`body_${n}`);
      });
    }

    // 3. Buttons
    if (selectedTemplate.buttons && selectedTemplate.buttons.length > 0) {
      selectedTemplate.buttons.forEach((btn, idx) => {
        const btnNum = idx + 1;
        if (btn.type === "URL" && btn.url?.includes("{{1}}")) {
          vars.push(`button_${btnNum}`);
        } else if (btn.type === "COPY_CODE") {
          vars.push(`button_${btnNum}`);
        } else if (btn.type === "QUICK_REPLY") {
          vars.push(`button_${btnNum}_payload`);
        }
      });
    }

    // 4. Carousel Cards
    if (selectedTemplate.marketingType === "CAROUSEL" && selectedTemplate.carouselCards && selectedTemplate.carouselCards.length > 0) {
      selectedTemplate.carouselCards.forEach((card, cardIdx) => {
        vars.push(`card_${cardIdx}_header_url`);

        if (card.body) {
          const matches = [...card.body.matchAll(/\{\{(\d+)\}\}/g)];
          const uniqueNums = [...new Set(matches.map(m => parseInt(m[1], 10)))].sort((a, b) => a - b);
          uniqueNums.forEach(n => {
            vars.push(`card_${cardIdx}_body_${n}`);
          });
        }
      });
    }

    return vars;
  }, [selectedTemplate])

  // ── Redux Recipient State ──
  const {
    editableData = [],
    columns = [],
    selectedRows = [],
    inputMode = 'upload',
    uploadedFiles = [],
  } = useSelector((state) => state.emailSelection || {})

  const phoneCol = useMemo(() => {
    return columns.find((c) => c.toLowerCase() === 'phone') || 'Phone'
  }, [columns])

  const selectedRecipients = useMemo(() => {
    const rows = selectedRows.length > 0
      ? editableData.filter((r) => selectedRows.includes(r._id))
      : editableData
    return rows
      .map((r) => String(r[phoneCol] || r.phone || r.phoneNumber || '').trim())
      .filter(Boolean)
  }, [selectedRows, editableData, phoneCol])

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
      setNewlyAddedRowIds((prev) => {
        const next = new Set(prev)
        addedIds.forEach((id) => next.add(id))
        return next
      })
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

  // ── Dynamic WhatsApp Campaign Cost Estimation ──
  useEffect(() => {
    if (!templateId || selectedRecipients.length === 0) {
      setEstimatedCost(null)
      return
    }

    const triggerEstimate = async () => {
      try {
        const res = await estimateCampaignCost({
          templateId,
          recipients: selectedRecipients,
        }).unwrap()
        if (res.success) {
          setEstimatedCost(res.data)
        }
      } catch (err) {
        console.error('Failed to estimate campaign cost:', err)
      }
    }

    const t = setTimeout(triggerEstimate, 350)
    return () => clearTimeout(t)
  }, [templateId, selectedRecipients, estimateCampaignCost])

  // ── Sync template variables with columns ──
  useEffect(() => {
    const baseCol = 'Phone'
    const requiredCols = [baseCol, ...templateVariables]
    const missing = requiredCols.filter(
      (req) => !columns.some((col) => col.toLowerCase() === req.toLowerCase())
    )
    
    // Check for case mismatches
    const hasCaseMismatch = columns.some(col => {
      const matchedReq = requiredCols.find(req => req.toLowerCase() === col.toLowerCase());
      return matchedReq && matchedReq !== col;
    })

    if (missing.length === 0 && !hasCaseMismatch) return

    const nextCols = columns.map(col => {
      const matchedReq = requiredCols.find(req => req.toLowerCase() === col.toLowerCase());
      return matchedReq || col;
    }).concat(missing)

    dispatch(setColumns(nextCols))

    const nextData = editableData.map((row) => {
      const updated = { ...row }
      
      // Fix case mismatch
      columns.forEach(col => {
        const matchedReq = requiredCols.find(req => req.toLowerCase() === col.toLowerCase());
        if (matchedReq && matchedReq !== col) {
          updated[matchedReq] = updated[col]
          delete updated[col]
        }
      })
      
      missing.forEach((m) => {
        if (!(m in updated)) updated[m] = ''
      })
      return updated
    })
    dispatch(setEditableData(nextData))
  }, [templateVariables, columns, editableData, dispatch])

  // ── Duplicate Detection ──
  const duplicatePhones = useMemo(() => {
    const phoneCol =
      columns.find((c) => c.toLowerCase() === 'phone') || columns[0]
    if (!phoneCol || editableData.length === 0) return new Set()
    const counts = {}
    editableData.forEach((row) => {
      const val = (row[phoneCol] || '').trim()
      if (val) counts[val] = (counts[val] || 0) + 1
    })
    const dups = new Set()
    Object.keys(counts).forEach((phone) => {
      if (counts[phone] > 1) dups.add(phone)
    })
    return dups
  }, [editableData, columns])

  // ── Non-WhatsApp Detection ──
  const nonWhatsappPhones = useMemo(() => {
    const phoneCol = columns.find((c) => c.toLowerCase() === 'phone') || columns[0]
    if (!phoneCol || editableData.length === 0) return new Set()
    
    const nonWa = new Set()
    editableData.forEach((row) => {
      if (row.isWhatsAppNumber === false) {
        const val = (row[phoneCol] || '').trim()
        if (val) nonWa.add(val)
      }
    })
    return nonWa
  }, [editableData, columns])

  const handleRemoveNonWhatsapp = () => {
    const phoneCol = columns.find((c) => c.toLowerCase() === 'phone') || columns[0]
    if (!phoneCol) return
    const uniqueRows = []
    const removedIds = []
    editableData.forEach((row) => {
      if (row.isWhatsAppNumber === false) {
        removedIds.push(row._id)
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

  const handleDeduplicate = () => {
    const phoneCol =
      columns.find((c) => c.toLowerCase() === 'phone') || columns[0]
    if (!phoneCol) return
    const seen = new Set()
    const uniqueRows = []
    const removedIds = []
    editableData.forEach((row) => {
      const val = (row[phoneCol] || '').trim()
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
    const phoneCol = columns.find((c) => c.toLowerCase() === 'phone') || 'Phone'
    for (const row of editableData) {
      const phoneVal = (row[phoneCol] || '').toString().trim()
      if (!phoneVal || phoneVal.length < 5) return false
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
      Boolean(numberId) &&
      Boolean(templateId) &&
      editableData.length > 0 &&
      missingVariables.length === 0 &&
      isGridPerfect
    )
  }, [
    isNameValid,
    numberId,
    templateId,
    editableData.length,
    missingVariables.length,
    isGridPerfect,
  ])

  const checklistItems = useMemo(() => {
    const items = [
      { label: 'Campaign name', done: isNameValid, icon: MessageSquare },
      { label: 'Number selected', done: Boolean(numberId), icon: PhoneIcon },
      {
        label: 'Template selected',
        done: Boolean(templateId),
        icon: FileSpreadsheet,
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
    numberId,
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
      if (!numberId) {
        setError('Please select a WhatsApp number.')
        return
      }
      if (!templateId) {
        setError('Please select a template.')
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
      setError(
        'Please fill all required fields and ensure all recipient data is complete.'
      )
      return
    }

    const normalizedData = editableData.map((row) => {
      const { _id, fileId, ...rest } = row
      return rest
    })

    // Validate phone numbers
    const phoneCol = columns.find((c) => c.toLowerCase() === 'phone') || 'Phone'
    const invalidRows = normalizedData.filter((r) => {
      const phone = (r[phoneCol] || '').trim()
      return !phone || phone.length < 5
    })
    if (invalidRows.length > 0) {
      setError(
        `Found ${invalidRows.length} recipients with invalid or missing phone numbers.`
      )
      return
    }

    try {
      const payload = {
        name: normalizedName,
        numberId,
        templateId,
        type: 'whatsapp',
        recipients: normalizedData,
      }
      if (scheduledAt) payload.scheduledAt = scheduledAt

      await createCampaign(payload).unwrap()
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
                  Create WhatsApp Campaign
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
                  {/* WhatsApp Number */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                      WhatsApp Number{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={numberId}
                        onChange={(e) => {
                          setNumberId(e.target.value)
                          setError('')
                        }}
                        className="w-full appearance-none rounded-xl border border-gray-100 bg-white px-4 py-2.5 pr-9 text-[13px] text-[var(--app-pages-text)] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-950"
                      >
                        <option value="">Select number…</option>
                        {activeNumbers.map((n) => (
                          <option key={n._id} value={n._id}>
                            {n.displayName} ({n.phoneNumber})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    {activeNumbers.length === 0 && (
                      <p
                        className="mt-1 text-xs"
                        style={{ color: 'var(--app-debit-color)' }}
                      >
                        No active WhatsApp numbers found.
                      </p>
                    )}
                  </div>

                  {/* Template */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                      Template{' '}
                      <span style={{ color: 'var(--app-debit-color)' }}>*</span>
                      {/* <span className="ml-1 text-[11px] font-normal normal-case text-gray-400 dark:text-gray-500">
                        (approved only)
                      </span> */}
                    </label>
                    <div className="relative">
                      <select
                        value={templateId}
                        onChange={(e) => {
                          setTemplateId(e.target.value)
                          setError('')
                        }}
                        disabled={!numberId || templatesFetching}
                        className={`w-full appearance-none rounded-xl border border-gray-100 bg-white px-4 py-2.5 pr-9 text-[13px] text-[var(--app-pages-text)] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:border-slate-800 dark:bg-slate-950 ${
                          !numberId
                            ? 'bg-gray-50 opacity-50 dark:bg-slate-900/50'
                            : ''
                        }`}
                      >
                        <option value="">
                          {!numberId
                            ? 'Select a number first…'
                            : templatesFetching
                              ? 'Loading…'
                              : 'Select template…'}
                        </option>
                        {approvedTemplates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    {numberId &&
                      !templatesFetching &&
                      approvedTemplates.length === 0 && (
                        <p
                          className="mt-1 text-xs"
                          style={{ color: 'var(--app-debit-color)' }}
                        >
                          No approved templates for this number.
                        </p>
                      )}
                  </div>
                </div>

                {/* Template Preview Badge */}
                {/* {selectedTemplate && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                    <MessageSquare
                      size={14}
                      className="shrink-0 text-emerald-600 dark:text-emerald-400"
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Template Preview
                    </span>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400">
                      {selectedTemplate.category}
                    </span>
                  </div>
                )} */}

                {/* Schedule */}
                <div>
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
                </div>
              </div>
            </div>

            {/* ── Quick Tips ── */}
            {/* <div className="shrink-0 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
              <h3 className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Sparkles size={14} /> Quick Tips
              </h3>
              <ul className="space-y-2 text-[11px] text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-1.5">
                  <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                  <span>Use approved templates only.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                  <span>Add header media for better engagement.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                  <span>Schedule campaigns in recipient's active hours.</span>
                </li>
              </ul>
            </div> */}

            {/* ── Section 2: Variable Mapping (Data Source) ── */}
            <div className="shrink-0">
              <RecipientDataSource
                campaignType="whatsapp"
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

            {/* Non-WhatsApp Warning */}
            {nonWhatsappPhones.size > 0 && (
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-400 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-start gap-2.5">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Non-WhatsApp Numbers Found</p>
                    <p className="mt-0.5 text-[10px] opacity-90">
                      We detected {nonWhatsappPhones.size} numbers that are not on WhatsApp.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveNonWhatsapp}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-rose-700 dark:bg-rose-500 dark:text-rose-950 dark:hover:bg-rose-400"
                >
                  <Trash2 size={12} strokeWidth={2.5} />
                  <span>Remove Non-WhatsApp</span>
                </button>
              </div>
            )}

            {/* Duplicate Warning */}
            {duplicatePhones.size > 0 && (
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-start gap-2.5">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Duplicate Phones Found</p>
                    <p className="mt-0.5 text-[10px] opacity-90">
                      We detected {duplicatePhones.size} duplicate phone
                      numbers.
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
                        const isPhone = col.toLowerCase() === 'phone'
                        const isName = col.toLowerCase() === 'name'
                        const isVariable = !isPhone && !isName

                        return (
                          <th
                            key={col}
                            className="sticky top-0 z-10 min-w-[120px] whitespace-nowrap border border-slate-200 bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--app-pages-text)] dark:border-slate-700 dark:bg-slate-800/60"
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                {col}
                                {isPhone && (
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
                      const phoneCol =
                        columns.find((c) => c.toLowerCase() === 'phone') ||
                        columns[0]
                      const isDuplicate =
                        row[phoneCol] &&
                        duplicatePhones.has(row[phoneCol].trim())
                      const isNonWhatsapp = row.isWhatsAppNumber === false

                      return (
                        <tr
                          key={row._id}
                          className={`group transition-all duration-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 ${
                            newlyAddedRowIds.has(row._id)
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                              : isSelected
                                ? 'bg-[var(--app-profile-btn-bg)]/[0.04]'
                                : isNonWhatsapp
                                  ? 'bg-rose-500/[0.03]'
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
                            const isPhoneField = col === phoneCol

                            let isInvalid = false
                            let errorTooltip = ''
                            if (isPhoneField) {
                              if (
                                cellValue.trim() !== '' &&
                                cellValue.trim().length < 5
                              ) {
                                isInvalid = true
                                errorTooltip = 'Invalid phone number'
                              } else if (isNonWhatsapp) {
                                isInvalid = true
                                errorTooltip = 'Not a WhatsApp number'
                              } else if (isDuplicate) {
                                isInvalid = true
                                errorTooltip = 'Duplicate phone number'
                              }
                            }

                            return (
                              <td
                                key={`${row._id}-${col}`}
                                className={`relative border ${isPhoneField ? 'p-1.5' : 'p-0'} ${
                                  isInvalid
                                    ? 'border-amber-400/80'
                                    : 'border-slate-200 dark:border-slate-700'
                                } min-w-[120px]`}
                              >
                                <div className="relative flex h-full w-full items-center">
                                  {isPhoneField ? (
                                    <PhoneInput
                                      country="in"
                                      enableSearch={true}
                                      value={cellValue}
                                      onChange={(value, country, e, formattedValue) => {
                                        dispatch(
                                          updateRecipientRow({
                                            _id: row._id,
                                            col,
                                            value: formattedValue,
                                          })
                                        )
                                      }}
                                      inputClass={`!w-full !text-xs !text-[var(--app-pages-text)] !transition ${
                                        isInvalid
                                          ? '!border-amber-400/80 focus:!ring-2 focus:!ring-inset focus:!ring-amber-500/40'
                                          : 'focus:!ring-2 focus:!ring-inset focus:!ring-blue-500/40'
                                      }`}
                                      dropdownClass="!bg-[var(--app-pages-bg)] !text-[var(--app-pages-text)]"
                                      containerClass="!w-full"
                                    />
                                  ) : (
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
                                  )}
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
                                      background:
                                        'color-mix(in srgb, var(--app-pages-border) 40%, transparent)',
                                    }}
                                  >
                                    <Icon size={10} />
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
           
            {/* Message Preview */}
            {selectedTemplate && (
              <div className="rounded-2xl border border-gray-100 bg-white p-4 pb-1 dark:border-slate-800 dark:bg-slate-900">
                {/* <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                    Message Preview
                  </h3>
                </div> */}
                <div className="mx-auto w-[280px] h-[480px]">
                  <WhatsAppPreview
                    fromNumber={
                      activeNumbers.find((n) => n._id === numberId)?.displayName
                    }
                    template={selectedTemplate}
                    bodyValues={editableData[0] || {}}
                  />
                </div>
              </div>
            )}

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
                    <PhoneIcon size={12} /> WhatsApp Number
                  </span>
                  <span className=" text-black font-semibold text-right">
                    {activeNumbers.find((n) => n._id === numberId)
                      ?.displayName || 'N/A'}
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
                <div className="flex justify-between">
                  <span>Amount (₹)</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {estimatedCost ? (
                      `₹${estimatedCost.estimatedAmountINR.toFixed(2)}`
                    ) : selectedRecipients.length > 0 ? (
                      <span className="text-[10px] text-gray-400 animate-pulse">Calculating...</span>
                    ) : (
                      '0.00'
                    )}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-bold dark:border-slate-800">
                  <span className="text-gray-900 dark:text-gray-100">
                    Total (₹)
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {estimatedCost ? (
                      `₹${estimatedCost.totalAmountINR.toFixed(2)}`
                    ) : selectedRecipients.length > 0 ? (
                      <span className="text-[10px] text-gray-400 animate-pulse">Calculating...</span>
                    ) : (
                      '0.00'
                    )}
                  </span>
                </div>
                {estimatedCost?.breakdown && (estimatedCost.breakdown.usd > 0 || estimatedCost.breakdown.gbp > 0) && (
                  <div className="mt-1.5 text-[9px] text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-slate-850 pt-1.5 leading-relaxed text-right">
                    Includes international pricing ({estimatedCost.breakdown.usd > 0 ? `$${estimatedCost.breakdown.usd.toFixed(2)} USD` : ''} {estimatedCost.breakdown.gbp > 0 ? `£${estimatedCost.breakdown.gbp.toFixed(2)} GBP` : ''}) converted to INR.
                  </div>
                )}
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
            <h3 className="mb-4 text-base font-bold text-[var(--app-pages-text)] flex items-center gap-2">
              <ClipboardCheck size={18} className="text-blue-500" /> Apply Value to All
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--app-pages-text)] opacity-80">
                  Select Column
                </label>
                <select
                  value={applyToAllCol}
                  onChange={(e) => setApplyToAllCol(e.target.value)}
                  className="w-full rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Column --</option>
                  {columns.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--app-pages-text)] opacity-80">
                  Value to Apply
                </label>
                <input
                  type="text"
                  value={applyToAllValue}
                  onChange={(e) => setApplyToAllValue(e.target.value)}
                  placeholder="Enter value..."
                  className="w-full rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 text-sm text-[var(--app-pages-text)] outline-none focus:border-blue-500"
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
