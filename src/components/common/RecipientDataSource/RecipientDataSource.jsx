import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import {
  Upload,
  FileText,
  Users,
  Edit3,
  Eye,
  Download,
  AlertCircle,
  X,
  Check,
  ChevronDown,
  Trash2,
  Plus,
  CheckSquare,
  Sparkles,
  FileSpreadsheet,
  BriefcaseBusiness,
} from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'

import {
  useGetEmailCampaignsQuery,
  useLazyGetCampaignLogsQuery,
} from '@/redux/apis/emailCampaignApi'
import {
  useGetCampaignsQuery as useGetWhatsappCampaignsQuery,
  useLazyGetCampaignByIdQuery as useLazyGetWhatsappCampaignByIdQuery,
} from '@/redux/apis/metaWhatsapp.api'
import {
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
} from '@/redux/backendApiSlice/emailSelectionSlice'
import { useGetMyLeadsQuery } from '@/redux/apis/googlemap.api'
import { countryPhoneRules } from '@/utils/countryDetails'

const formatPhoneNumber = (rawPhone) => {
  let digitsOnly = String(rawPhone).replace(/\D/g, '')

  const sortedCodes = Object.keys(countryPhoneRules).sort(
    (a, b) => b.length - a.length
  )

  for (const code of sortedCodes) {
    const rule = countryPhoneRules[code]
    const codeDigits = code.replace('+', '')
    if (digitsOnly.startsWith(codeDigits)) {
      const localPart = digitsOnly.slice(codeDigits.length)
      if (localPart.length === rule.length && rule.startsWith.test(localPart)) {
        return digitsOnly
      }
    }
  }

  if (digitsOnly.length === 10) {
    return '91' + digitsOnly
  }

  return digitsOnly
}

const isValidEmail = (email) => {
  if (!email || email.length > 254) return false
  const atIndex = email.indexOf('@')
  if (atIndex === -1 || atIndex !== email.lastIndexOf('@')) return false
  const localPart = email.substring(0, atIndex)
  const domainPart = email.substring(atIndex + 1)
  if (localPart.length === 0 || localPart.length > 64) return false
  if (domainPart.length === 0 || domainPart.length > 255) return false
  if (email.includes('..')) return false
  if (!/^[a-zA-Z0-9._\-+]+$/.test(localPart)) return false
  if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainPart)) return false
  const domainLabels = domainPart.split('.')
  if (domainLabels.some((label) => label.length > 63)) return false
  return true
}

const Label = ({ children, required }) => (
  <div className="mb-1.5 text-[13px] font-semibold text-[var(--app-pages-text)]">
    {children} {required && <span className="text-red-500">*</span>}
  </div>
)

const SelectField = ({ value, onChange, options, placeholder, disabled }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full appearance-none rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 pr-10 font-sans text-[13px] font-medium text-[var(--app-pages-text)] outline-none transition-colors focus:border-[var(--app-brand-primary)]"
      disabled={disabled}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
)

const CSVMappingField = ({
  campaignType,
  variables,
  csvColumns,
  mapping,
  onChange,
  phoneColumn,
  setPhoneColumn,
  nameColumn,
  setNameColumn,
}) => {
  return (
    <div className="relative z-40 space-y-4">
      <div className="rounded-xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm">
        <Label required>
          {campaignType === 'whatsapp' ? 'Phone Number Column' : 'Email Column'}
        </Label>
        <SelectField
          value={phoneColumn || ''}
          onChange={(val) => setPhoneColumn(val)}
          options={csvColumns.map((c) => ({ value: c, label: c }))}
          placeholder={`Select ${campaignType === 'whatsapp' ? 'phone' : 'email'} column`}
        />
      </div>

      <div className="rounded-xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm">
        <Label>Map Name Column (Optional)</Label>
        <SelectField
          value={nameColumn || ''}
          onChange={(val) => setNameColumn(val)}
          options={[
            { value: '', label: 'Skip name mapping' },
            ...csvColumns.map((c) => ({ value: c, label: c })),
          ]}
          placeholder="Select name column (optional)"
        />
        <p className="m-0 mt-2 font-sans text-xs text-[var(--app-pages-subhead-text)]">
          Helps personalize messages if your template uses name mapping.
        </p>
      </div>

      {variables.map((v) => {
        const isCustom = mapping[v] === '__custom__'
        const isSpecific = mapping[v] && mapping[v] !== '__custom__'
        return (
          <div
            key={v}
            className="rounded-xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm transition-all hover:border-[var(--app-brand-primary)]"
          >
            <Label>{v}</Label>
            <div className="mb-3 mt-2 flex gap-6">
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`type_${v}`}
                  checked={isSpecific}
                  onChange={() => onChange(v, csvColumns[0] || '')}
                  className="h-4 w-4 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
                />
                <span className="font-sans text-sm font-medium text-gray-700 transition-colors group-hover:text-indigo-600 dark:text-zinc-300 dark:group-hover:text-indigo-400">
                  Specific from Column
                </span>
              </label>
              <label className="group flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name={`type_${v}`}
                  checked={isCustom}
                  onChange={() => onChange(v, '__custom__')}
                  className="h-4 w-4 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
                />
                <span className="font-sans text-sm font-medium text-gray-700 transition-colors group-hover:text-indigo-600 dark:text-zinc-300 dark:group-hover:text-indigo-400">
                  Common for All
                </span>
              </label>
            </div>
            {isSpecific && (
              <div className="mt-3">
                <SelectField
                  value={mapping[v] === '__custom__' ? '' : mapping[v]}
                  onChange={(val) => onChange(v, val)}
                  options={csvColumns.map((c) => ({ value: c, label: c }))}
                  placeholder={`Select column for ${v}`}
                />
              </div>
            )}
            {isCustom && (
              <div className="relative mt-3">
                <input
                  type="text"
                  placeholder={`Enter common value for ${v}`}
                  value={mapping[`${v}_custom`] || ''}
                  onChange={(e) => onChange(`${v}_custom`, e.target.value)}
                  className="w-full rounded-lg border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 font-sans text-sm text-[var(--app-pages-text)] placeholder-[var(--app-pages-subhead-text)] shadow-sm outline-none transition-all focus:border-[var(--app-brand-primary)]"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RecipientDataSource({
  campaignType = 'email',
  templateVariables = [],
  onChange,
}) {
  const dispatch = useDispatch()
  const baseCol = campaignType === 'whatsapp' ? 'Phone' : 'Email'

  // API hooks scoped to this component
  const { data: emailCampaigns } = useGetEmailCampaignsQuery(undefined, {
    skip: campaignType !== 'email',
  })
  const { data: whatsappCampaignsRes } = useGetWhatsappCampaignsQuery(
    undefined,
    { skip: campaignType !== 'whatsapp' }
  )
  const [fetchCampaignLogs, { isFetching: isFetchingLogs }] =
    useLazyGetCampaignLogsQuery()
  const [fetchWhatsappCampaign, { isFetching: isFetchingWhatsappCampaign }] =
    useLazyGetWhatsappCampaignByIdQuery()
  const { data: leadsData, isLoading: isLoadingLeads } = useGetMyLeadsQuery()

  const extractArray = (payload) => {
    if (!payload) return []
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload.data)) return payload.data
    if (Array.isArray(payload.campaigns)) return payload.campaigns
    return []
  }
  const pastCampaigns = extractArray(
    campaignType === 'email' ? emailCampaigns : whatsappCampaignsRes
  )

  // Select all Editor State from Redux
  const {
    recipientFilter = 'all',
    selectedCampaignId = null,
    previousCampaignRecipients = [],
    uploadedFiles = [],
    editableData = [],
    columns = [],
    selectedRows = [],
    inputMode = 'upload',
  } = useSelector((state) => state.emailSelection || {})

  const [error, setError] = useState('')
  const [fileToRemove, setFileToRemove] = useState(null)
  // per-cell validation errors: { rowId: { fieldName: errorMsg } }
  const [cellErrors, setCellErrors] = useState({})

  const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false)
  const [selectedTitles, setSelectedTitles] = useState([])
  const [availableStatuses, setAvailableStatuses] = useState(['all'])

  // File Upload & Mapping State
  const [csvFileObj, setCsvFileObj] = useState(null)
  const [activeFileId, setActiveFileId] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [csvColumns, setCsvColumns] = useState([])
  const [phoneColumn, setPhoneColumn] = useState('')
  const [nameColumn, setNameColumn] = useState('')
  const [csvMapping, setCsvMapping] = useState({})
  const fileRef = useRef(null)

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 5000)
    return () => clearTimeout(t)
  }, [error])

  // Manual grid rows state: [{ _id, [baseCol]: '', ...templateVariables }]
  const [manualRows, setManualRows] = useState([
    { _id: crypto.randomUUID(), [baseCol]: '' },
  ])
  const [newlyAddedRowId, setNewlyAddedRowId] = useState(null)

  // Re-init rows when templateVariables/baseCol changes
  useEffect(() => {
    setManualRows((prev) =>
      prev.map((row) => {
        const next = { _id: row._id, [baseCol]: row[baseCol] || '' }
        templateVariables.forEach((v) => {
          next[v] = row[v] || ''
        })
        return next
      })
    )
  }, [templateVariables, baseCol])

  const validateCell = (field, val) => {
    if (field === baseCol && campaignType === 'email') {
      if (!val.trim()) return 'Required'
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim()))
        return 'Invalid email'
    }
    if (field === baseCol && campaignType === 'whatsapp') {
      if (!val.trim()) return 'Required'
      if (!/^\+?[1-9]\d{1,14}$/.test(val.trim())) return 'Invalid number'
    }
    return ''
  }

  const handleCellChange = (rowId, field, val) => {
    setManualRows((prev) =>
      prev.map((r) => (r._id === rowId ? { ...r, [field]: val } : r))
    )
    // Live-validate only if there was already an error
    if (cellErrors[rowId]?.[field]) {
      const errMsg = validateCell(field, val)
      setCellErrors((prev) => ({
        ...prev,
        [rowId]: { ...(prev[rowId] || {}), [field]: errMsg },
      }))
    }
  }

  const handleCellBlur = (rowId, field, val) => {
    const errMsg = validateCell(field, val)
    setCellErrors((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [field]: errMsg },
    }))
  }

  const handleAddRow = () => {
    if (manualRows.length > 0) {
      const lastRow = manualRows[manualRows.length - 1]
      const isBlank = [baseCol, ...templateVariables].every((col) => {
        const val = lastRow[col]
        return val === undefined || val === null || val.toString().trim() === ''
      })
      if (isBlank) {
        toast.error('Please fill in the existing blank row first.')
        return
      }
    }

    const newRowId = crypto.randomUUID()
    const newRow = { _id: newRowId, [baseCol]: '' }
    templateVariables.forEach((v) => {
      newRow[v] = ''
    })
    setManualRows((prev) => [...prev, newRow])
    setNewlyAddedRowId(newRowId)
  }

  const handleDeleteManualRow = (rowId) => {
    setManualRows((prev) => prev.filter((r) => r._id !== rowId))
    setCellErrors((prev) => {
      const n = { ...prev }
      delete n[rowId]
      return n
    })
  }

  const handleCommitManualRows = () => {
    // Validate all rows
    const newCellErrors = {}
    let hasError = false
    manualRows.forEach((row) => {
      const errMsg = validateCell(baseCol, row[baseCol] || '')
      if (errMsg) {
        newCellErrors[row._id] = {
          ...(newCellErrors[row._id] || {}),
          [baseCol]: errMsg,
        }
        hasError = true
      }
    })
    setCellErrors(newCellErrors)
    if (hasError) {
      setError('Please fix validation errors before adding recipients.')
      return
    }

    const validRows = manualRows.filter((r) => (r[baseCol] || '').trim() !== '')
    if (validRows.length === 0) {
      setError('Enter at least one recipient.')
      return
    }

    const formatted = validRows.map((row) => ({
      _id: row._id,
      fileId: 'manual',
      ...Object.fromEntries(
        Object.entries(row)
          .filter(([k]) => k !== '_id')
          .map(([k, v]) => [k, (v || '').trim()])
      ),
    }))

    const nonManual = editableData.filter((r) => r.fileId !== 'manual')
    dispatch(setEditableData([...nonManual, ...formatted]))
    dispatch(setSelectedRows([]))
    setError('')
  }

  // Compute missing variables dynamically
  const missingVariables = useMemo(() => {
    if (editableData.length === 0 && inputMode === 'upload') return []
    return templateVariables.filter((v) => !columns.includes(v))
  }, [templateVariables, columns, editableData.length, inputMode])

  // Automatically sync missing variables in manual mode
  useEffect(() => {
    if (inputMode === 'manual' && templateVariables.length > 0) {
      const missing = templateVariables.filter((v) => !columns.includes(v))
      if (missing.length > 0) {
        dispatch(setColumns([...columns, ...missing]))
        const updated = editableData.map((row) => {
          const newRow = { ...row }
          missing.forEach((m) => {
            if (!(m in newRow)) newRow[m] = ''
          })
          return newRow
        })
        dispatch(setEditableData(updated))
      }
    }
  }, [templateVariables, inputMode, columns, editableData, dispatch])

  // Automatic immediate fetching & merging for previous campaign recipients
  useEffect(() => {
    const loadCampaignData = async () => {
      if (!selectedCampaignId || inputMode !== 'previous') return
      setError('')
      try {
        let responseData = null
        if (campaignType === 'email') {
          const response = await fetchCampaignLogs(selectedCampaignId).unwrap()
          responseData = response?.logs || response?.data?.logs || []
        } else if (campaignType === 'whatsapp') {
          const response = await fetchWhatsappCampaign(selectedCampaignId).unwrap()
          responseData = response?.data?.recipients || response?.recipients || []
        }

        if (responseData && responseData.length > 0) {
          const getStatus = (log) => log.status || log.variables?.status

          const uniqueStatuses = Array.from(
            new Set(responseData.map((log) => getStatus(log)))
          ).filter(status => status && status.toLowerCase() !== 'all')

          setAvailableStatuses(['all', ...uniqueStatuses])

          let filteredLogs = responseData
          if (recipientFilter !== 'all') {
            filteredLogs = responseData.filter((log) => {
              const logStatus = getStatus(log)
              if (logStatus === recipientFilter) return true
              if (recipientFilter === 'failed' && ['bounced', 'rejected'].includes(logStatus)) return true
              if (recipientFilter === 'hold' && ['queued', 'dispatching'].includes(logStatus)) return true
              return false
            })
          }

          const nonCampaignRows = editableData.filter(
            (row) => !row.fileId?.startsWith('campaign-')
          )

          if (!filteredLogs || filteredLogs.length === 0) {
            setError(`No recipients found with status: ${recipientFilter}`)
            dispatch(setEditableData(nonCampaignRows))
            const remainingSelected = selectedRows.filter((id) =>
              nonCampaignRows.some((r) => r._id === id)
            )
            dispatch(setSelectedRows(remainingSelected))
            return
          }

          const baseCol = campaignType === 'whatsapp' ? 'Phone' : 'Email'
          const requiredKeys = [baseCol, ...templateVariables]
          const lowerRequiredKeys = requiredKeys.map((k) => k.toLowerCase())

          const mappedData = filteredLogs.map((log) => {
            const dataFile = log.dataFile || log.variables || {}
            const filteredData = {}

            // Check dataFile fields for required keys
            Object.keys(dataFile).forEach((rawKey) => {
              const rawLower = rawKey.toLowerCase()
              const reqIndex = lowerRequiredKeys.indexOf(rawLower)
              if (reqIndex !== -1) {
                const targetKey = requiredKeys[reqIndex]
                filteredData[targetKey] = dataFile[rawKey]
              }
            })

            // Fallback for email field
            const emailIndex = lowerRequiredKeys.indexOf('email')
            if (emailIndex !== -1) {
              const emailTargetKey = requiredKeys[emailIndex]
              if (!filteredData[emailTargetKey] && log.recipientEmail) {
                filteredData[emailTargetKey] = log.recipientEmail
              }
            }

            // Fallback for phone field
            const phoneIndex = lowerRequiredKeys.indexOf('phone')
            if (phoneIndex !== -1) {
              const phoneTargetKey = requiredKeys[phoneIndex]
              if (!filteredData[phoneTargetKey] && log.phoneNumber) {
                filteredData[phoneTargetKey] = log.phoneNumber
              }
            }

            // Fallback for name field
            const nameIndex = lowerRequiredKeys.indexOf('name')
            const firstNameIndex = lowerRequiredKeys.indexOf('firstname')
            if (nameIndex !== -1 || firstNameIndex !== -1) {
              const nameTargetKey =
                requiredKeys[nameIndex !== -1 ? nameIndex : firstNameIndex]
              if (!filteredData[nameTargetKey] && (log.recipientName || log.name)) {
                filteredData[nameTargetKey] = log.recipientName || log.name
              }
            }

            // Ensure all required fields exist
            requiredKeys.forEach((reqKey) => {
              if (!(reqKey in filteredData)) {
                filteredData[reqKey] = ''
              }
            })

            return {
              _id: crypto.randomUUID(),
              fileId: `campaign-${selectedCampaignId}`,
              ...filteredData,
            }
          })

          // Compute merged columns
          const finalCols = [...requiredKeys]

          const mergedData = [...nonCampaignRows, ...mappedData]
          const remainingSelected = selectedRows.filter((id) =>
            nonCampaignRows.some((r) => r._id === id)
          )

          const fileIdStr = `campaign-${selectedCampaignId}`
          dispatch(removeUploadedFile(fileIdStr))
          dispatch(
            addUploadedFile({
              id: fileIdStr,
              name: `Campaign Data (${recipientFilter})`,
              size: mappedData.length * 1024,
            })
          )
          dispatch(setColumns(finalCols))
          dispatch(setEditableData(mergedData))
          dispatch(setSelectedRows(remainingSelected))
          dispatch(setPreviousCampaignRecipients(mappedData))
        }
      } catch (err) {
        setError('Failed to fetch previous campaign recipients.')
      }
    }
    loadCampaignData()
  }, [
    selectedCampaignId,
    recipientFilter,
    inputMode,
    campaignType,
    fetchCampaignLogs,
    dispatch,
  ])

  // Handle clearing past campaign selection from the editor
  useEffect(() => {
    if (inputMode === 'previous' && !selectedCampaignId) {
      const nonCampaignRows = editableData.filter(
        (row) => !row.fileId?.startsWith('campaign-')
      )
      if (editableData.length !== nonCampaignRows.length) {
        dispatch(setEditableData(nonCampaignRows))
        const remainingSelected = selectedRows.filter((id) =>
          nonCampaignRows.some((r) => r._id === id)
        )
        dispatch(setSelectedRows(remainingSelected))

        const allCols = new Set()
        nonCampaignRows.forEach((row) => {
          Object.keys(row).forEach((k) => {
            if (k !== '_id' && k !== 'fileId') allCols.add(k)
          })
        })
        const finalCols = Array.from(allCols)
        dispatch(setColumns(finalCols))
      }
    }
  }, [selectedCampaignId, inputMode, dispatch])

  // State is now cleared by the parent modal (CreateCampaignModal) on close,
  // preventing data loss when switching between accordion sections.

  // Handle file uploads (Multiple files supported)
  const handleFileChange = async (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ]
    if (
      !allowedTypes.includes(selected.type) &&
      !selected.name.endsWith('.csv') &&
      !selected.name.endsWith('.xlsx')
    ) {
      setError('Only .xlsx or .csv files are allowed.')
      return
    }

    // Prevent uploading the exact same file twice
    if (
      uploadedFiles.some(
        (f) => f.name === selected.name && f.size === selected.size
      )
    ) {
      toast.error(`File "${selected.name}" has already been uploaded.`)
      if (e.target) e.target.value = ''
      return
    }

    setError('')

    try {
      const data = await selected.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]

      const rawJson = XLSX.utils.sheet_to_json(sheet)
      if (!rawJson.length) {
        setError(`${selected.name} contains no records.`)
        return
      }

      const columnsList = Object.keys(rawJson[0] || {})
      setCsvColumns(columnsList)
      setCsvData(rawJson)
      setCsvFileObj(selected)
      setActiveFileId(crypto.randomUUID())

      // Auto-select phone column if found
      const lowerCols = columnsList.map((c) => c.toLowerCase())
      const baseColKeyword = campaignType === 'whatsapp' ? 'phone' : 'email'
      const baseMatch = columnsList.find(
        (c, i) =>
          lowerCols[i].includes(baseColKeyword) ||
          lowerCols[i].includes(campaignType === 'whatsapp' ? 'number' : 'mail')
      )
      if (baseMatch) setPhoneColumn(baseMatch)

      const nameMatch = columnsList.find(
        (c, i) => lowerCols[i] === 'name' || lowerCols[i] === 'firstname'
      )
      if (nameMatch) setNameColumn(nameMatch)

      if (e.target) e.target.value = '' // reset input value
    } catch (err) {
      setError(`Failed to read file ${selected.name}`)
    }
  }

  const handleConfirmMapping = () => {
    if (!phoneColumn) {
      setError(
        `Please select the ${campaignType === 'whatsapp' ? 'Phone' : 'Email'} column`
      )
      return
    }
    const fileId = activeFileId || crypto.randomUUID()
    if (!activeFileId) setActiveFileId(fileId)

    if (!uploadedFiles.some((f) => f.id === fileId)) {
      dispatch(
        addUploadedFile({
          id: fileId,
          name: csvFileObj.name,
          size: csvFileObj.size,
        })
      )
    }

    const requiredKeys = [baseCol, ...templateVariables]
    const nonUpdatedRows = editableData.filter((r) => r.fileId !== fileId)

    const mappedData = csvData.map((row) => {
      let contactVal = row[phoneColumn] ? String(row[phoneColumn]).trim() : ''
      if (campaignType === 'whatsapp' && contactVal) {
        contactVal = formatPhoneNumber(contactVal)
      }

      const filteredRow = {
        _id: crypto.randomUUID(),
        fileId: fileId,
        [baseCol]: contactVal,
        Name: nameColumn ? row[nameColumn] || '' : '',
      }

      templateVariables.forEach((v) => {
        const mapped = csvMapping[v]
        if (mapped === '__custom__') {
          filteredRow[v] = csvMapping[`${v}_custom`] || ''
        } else if (mapped) {
          filteredRow[v] = String(row[mapped] || '')
        } else {
          filteredRow[v] = ''
        }
      })

      return filteredRow
    })

    const allRowKeys = new Set([...columns, ...requiredKeys, 'Name'])
    dispatch(setColumns(Array.from(allRowKeys)))

    const mergedData = [...nonUpdatedRows, ...mappedData]
    dispatch(setEditableData(mergedData))

    toast.success('Data imported successfully!')
    setError('')
  }

  const handleImportLeads = () => {
    if (!leadsData || !leadsData.results || leadsData.results.length === 0) {
      setError('No leads found to import.')
      return
    }

    const baseCol = campaignType === 'whatsapp' ? 'Phone' : 'Email'
    const leadsWithContact = leadsData.results.filter((l) => {
      const title = l.search_query || 'Unknown'
      if (!selectedTitles.includes(title)) return false

      if (campaignType === 'whatsapp') {
        return l.phone && l.phone !== 'N/A'
      } else {
        return l.emails && l.emails.length > 0
      }
    })

    if (leadsWithContact.length === 0) {
      setError(
        `No leads with contact ${campaignType === 'whatsapp' ? 'phones' : 'emails'} available in the selected groups.`
      )
      return
    }

    const requiredKeys = [baseCol, ...templateVariables]
    const nonLeadsRows = editableData.filter(r => r.fileId !== 'leads')

    const newRows = leadsWithContact.flatMap((lead) => {
      if (campaignType === 'whatsapp') {
        const phoneStr = formatPhoneNumber(lead.phone || '')

        const row = {
          _id: crypto.randomUUID(),
          fileId: 'leads',
          [baseCol]: phoneStr,
          Name: lead.name || '',
          isWhatsAppNumber: lead.isWhatsAppNumber,
        }
        templateVariables.forEach((v) => {
          if (v.toLowerCase() !== 'phone' && v.toLowerCase() !== 'name') {
            row[v] = ''
          }
        })
        return [row]
      } else {
        return lead.emails.map((email) => {
          const row = {
            _id: crypto.randomUUID(),
            fileId: 'leads',
            [baseCol]: email,
            Name: lead.name || '',
          }
          templateVariables.forEach((v) => {
            if (v.toLowerCase() !== 'email' && v.toLowerCase() !== 'name') {
              row[v] = ''
            }
          })
          return row
        })
      }
    })

    const nextCols = new Set([...columns, ...requiredKeys, 'Name'])
    dispatch(setColumns(Array.from(nextCols)))

    const mergedData = [...nonLeadsRows, ...newRows]

    dispatch(removeUploadedFile('leads'))
    dispatch(
      addUploadedFile({
        id: 'leads',
        name: `My Leads Data`,
        size: newRows.length * 1024,
      })
    )
    dispatch(setEditableData(mergedData))

    const nextSelected = selectedRows.filter((id) =>
      nonLeadsRows.some((r) => r._id === id)
    )
    dispatch(setSelectedRows(nextSelected))
    setError('')
  }

  const accentGradientClasses =
    'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90'

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)]">
            Recipient Data Source
          </p>
          {editableData.length > 0 && (
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {selectedRows.length} Selected
            </span>
          )}
        </div>

        {error && (
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
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

        {/* Mode Toggle Tabs */}
        <div className="flex flex-nowrap gap-1 overflow-x-auto rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-1 pb-1.5">
          {[
            { mode: 'upload', icon: Upload, label: 'Upload Excel / CSV' },
            { mode: 'manual', icon: Edit3, label: 'Manual Entry' },
            { mode: 'previous', icon: FileText, label: 'Previous Campaign' },
            { mode: 'leads', icon: BriefcaseBusiness, label: 'My Leads' },
          ].map(({ mode, icon: Icon, label }) => {
            const isActive = inputMode === mode
            return (
              <button
                key={mode}
                onClick={() => {
                  dispatch(setInputMode(mode))
                  setError('')
                  if (mode === 'manual') {
                    const initialCols = [baseCol, ...templateVariables]
                    const cols = [...new Set(initialCols)]
                    dispatch(setColumns(cols))
                    const hasActiveData = editableData.some((row) =>
                      Object.entries(row).some(
                        ([k, v]) => k !== '_id' && k !== 'fileId' && v !== ''
                      )
                    )
                    if (!hasActiveData) {
                      const newRow = {
                        _id: crypto.randomUUID(),
                        ...Object.fromEntries(cols.map((v) => [v, ''])),
                      }
                      dispatch(setEditableData([newRow]))
                      dispatch(setSelectedRows([]))
                    }
                  }
                }}
                className={`flex flex-1 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[11px] font-semibold transition-all sm:text-xs ${
                  isActive
                    ? 'border border-gray-200/50 bg-white text-[var(--app-pages-text)] shadow-sm dark:border-slate-700 dark:bg-slate-800'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400'
                }`}
              >
                <Icon
                  size={13}
                  className={
                    isActive
                      ? 'text-gray-700 dark:text-gray-200'
                      : 'text-gray-400'
                  }
                />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Upload Zone */}
        {inputMode === 'upload' && !csvFileObj && (
          <div className="space-y-4">
            <div className="bg-[var(--app-pages-border)]/10 hover:bg-[var(--app-pages-border)]/15 group relative cursor-pointer rounded-2xl border-2 border-dashed border-[var(--app-pages-border)] p-7 text-center transition-all">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div className="pointer-events-none flex flex-col items-center gap-3">
                <div className="bg-[var(--app-profile-btn-bg)]/15 flex h-12 w-12 items-center justify-center rounded-2xl">
                  <Upload
                    size={20}
                    style={{ color: 'var(--app-profile-btn-bg)' }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--app-pages-text)]">
                    Drop Excel/CSV here or{' '}
                    <span style={{ color: 'var(--app-profile-btn-bg)' }}>
                      browse
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--app-pages-subhead-text)]">
                    Supports multiple files, merged on load
                  </p>
                </div>
              </div>
            </div>

            {/* Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)]">
                  Uploaded Datasets ({uploadedFiles.length})
                </p>
                <div className="divide-[var(--app-pages-border)]/30 border-[var(--app-pages-border)]/40 divide-y overflow-hidden rounded-xl border bg-white/40 dark:bg-slate-900/30">
                  {uploadedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/10"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileSpreadsheet className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <div className="min-w-0">
                          <p className="dark:text-gray-150 truncate text-xs font-bold leading-snug text-gray-800">
                            {f.name}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {(f.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFileToRemove({
                            id: f.id,
                            type: 'file',
                            name: f.name,
                          })
                        }
                        className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                        title="Remove file and associated records"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CSV Mapping Mode */}
        {inputMode === 'upload' && csvFileObj && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-3">
                <FileSpreadsheet className="text-[#16a34a]" size={20} />
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[13px] font-medium text-[var(--app-pages-text)]">
                  {csvFileObj.name}
                </span>
                <button
                  onClick={() => {
                    setCsvFileObj(null)
                    setCsvData([])
                    setCsvColumns([])
                    setPhoneColumn('')
                    setNameColumn('')
                    setCsvMapping({})
                    setActiveFileId(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                  className="cursor-pointer border-none bg-transparent font-sans text-[13px] font-medium text-red-500 hover:underline"
                >
                  {editableData.some((r) => r.fileId === activeFileId) ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>

            <CSVMappingField
              campaignType={campaignType}
              variables={templateVariables}
              csvColumns={csvColumns}
              mapping={csvMapping}
              onChange={(k, v) => setCsvMapping((p) => ({ ...p, [k]: v }))}
              phoneColumn={phoneColumn}
              setPhoneColumn={setPhoneColumn}
              nameColumn={nameColumn}
              setNameColumn={setNameColumn}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={handleConfirmMapping}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--app-brand-primary)] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {editableData.some((r) => r.fileId === activeFileId) ? 'Update Mapping' : 'Confirm & Import'}
              </button>
            </div>
          </div>
        )}

        {/* Manual Entry Mode — Excel-like Grid */}
        {inputMode === 'manual' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--app-pages-bg)] dark:border-slate-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
              <div className="flex items-center gap-2 flex-wrap">
                <Edit3 size={14} className="text-blue-600" />
                <p className="text-xs font-bold text-[var(--app-pages-text)] whitespace-nowrap">
                  Manual Entry
                </p>
                <span className="rounded-full border border-blue-200/60 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-400 whitespace-nowrap">
                  {manualRows.length} row{manualRows.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={handleCommitManualRows}
                className="w-full sm:w-auto flex justify-center items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] whitespace-nowrap"
              >
                <Check size={12} strokeWidth={2.5} />
                Add to Recipients
              </button>
            </div>

            {/* Excel Grid */}
            <div className="overflow-x-auto w-full">
              <table
                className="w-full border-collapse text-xs min-w-[500px]"
                style={{ tableLayout: 'fixed' }}
              >
                {/* Column Headers */}
                <thead>
                  <tr>
                    <th
                      className="select-none border border-slate-200 bg-slate-100 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)] dark:border-slate-700 dark:bg-slate-800"
                      style={{ width: 32 }}
                    >
                      #
                    </th>
                    {[baseCol, ...templateVariables].map((col) => (
                      <th
                        key={col}
                        className="select-none whitespace-nowrap border border-slate-200 bg-slate-100 px-2 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)] dark:border-slate-700 dark:bg-slate-800"
                      >
                        {col === baseCol ? (
                          <span className="flex items-center gap-1">
                            {col} <span className="text-red-500">*</span>
                          </span>
                        ) : (
                          col
                        )}
                      </th>
                    ))}
                    <th
                      className="border border-slate-200 bg-slate-100 px-2 py-2 dark:border-slate-700 dark:bg-slate-800"
                      style={{ width: 36 }}
                    />
                  </tr>
                </thead>
                <tbody>
                  {manualRows.map((row, idx) => (
                    <tr
                      key={row._id}
                      className="group transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-950/10"
                    >
                      {/* Row Number */}
                      <td className="select-none border border-slate-200 bg-slate-50 px-2 py-1.5 text-center font-mono text-[10px] text-[var(--app-pages-subhead-text)] dark:border-slate-700 dark:bg-slate-900/50">
                        {idx + 1}
                      </td>
                      {/* Cells */}
                      {[baseCol, ...templateVariables].map((col) => {
                        const cellErr = cellErrors[row._id]?.[col] || ''
                        return (
                          <td
                            key={col}
                            className={`relative border p-0 ${
                              cellErr
                                ? 'border-red-400 dark:border-red-500'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <input
                              autoFocus={
                                row._id === newlyAddedRowId && col === baseCol
                              }
                              type={
                                col === baseCol && campaignType === 'email'
                                  ? 'email'
                                  : col === baseCol &&
                                      campaignType === 'whatsapp'
                                    ? 'tel'
                                    : 'text'
                              }
                              value={row[col] || ''}
                              onChange={(e) =>
                                handleCellChange(row._id, col, e.target.value)
                              }
                              onBlur={(e) =>
                                handleCellBlur(row._id, col, e.target.value)
                              }
                              placeholder={
                                col === baseCol
                                  ? campaignType === 'email'
                                    ? 'name@example.com'
                                    : '+1234567890'
                                  : col
                              }
                              spellCheck={false}
                              className={`placeholder:text-[var(--app-pages-subhead-text)]/50 h-full w-full bg-transparent px-2 py-1.5 text-xs text-[var(--app-pages-text)] outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/40 ${
                                cellErr ? 'focus:ring-red-400/40' : ''
                              }`}
                            />
                            {cellErr && (
                              <div className="pointer-events-none absolute left-0 top-full z-20 mt-0.5 whitespace-nowrap rounded-md border border-red-300 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600 shadow-md dark:border-red-800 dark:bg-red-950/80 dark:text-red-400">
                                {cellErr}
                              </div>
                            )}
                          </td>
                        )
                      })}
                      {/* Delete row */}
                      <td className="border border-slate-200 p-0 text-center dark:border-slate-700">
                        <button
                          onClick={() => handleDeleteManualRow(row._id)}
                          disabled={manualRows.length === 1}
                          className="flex h-full w-full items-center justify-center py-1.5 text-gray-400 transition hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Delete row"
                        >
                          <X size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Row Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-transparent px-3 py-1.5 text-[11px] font-semibold text-[var(--app-pages-subhead-text)] transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
              >
                <Plus size={13} strokeWidth={2.5} />
                Add Row
              </button>
            </div>
          </div>
        )}

        {/* Previous Campaign Mode */}
        {inputMode === 'previous' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)]">
                  Select Past Campaign
                </label>
                <div className="relative">
                  <select
                    value={selectedCampaignId || ''}
                    onChange={(e) =>
                      dispatch(setSelectedCampaignId(e.target.value))
                    }
                    className="w-full appearance-none rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 pr-9 text-sm text-[var(--app-pages-text)] outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  >
                    <option value="">Choose campaign</option>
                    {pastCampaigns?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--app-pages-subhead-text)]">
                  Recipient Filter
                </label>
                <div className="relative">
                  <select
                    value={recipientFilter || 'all'}
                    onChange={(e) => dispatch(setRecipientFilter(e.target.value))}
                    className="w-full appearance-none rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 pr-9 text-sm text-[var(--app-pages-text)] capitalize outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                    disabled={!selectedCampaignId}
                  >
                    {availableStatuses.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {(isFetchingLogs || isFetchingWhatsappCampaign) && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
                  <span>Loading past recipients...</span>
                </div>
              )}

              {(() => {
                const count = editableData.filter(
                  (row) => row.fileId === `campaign-${selectedCampaignId}`
                ).length
                if (isFetchingLogs || count === 0) return null
                return (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200/50 bg-emerald-50/15 px-3 py-2 text-xs font-semibold text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/10">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="shrink-0 text-emerald-500" />
                      <span>
                        Loaded {count} past campaign recipients into the editor
                        grid.
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setFileToRemove({
                          id: `campaign-${selectedCampaignId}`,
                          type: 'campaign',
                          name: `Campaign Data`,
                        })
                      }
                      className="flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/40"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Leads Mode */}
        {inputMode === 'leads' && (
          <div className="border-gray-150 rounded-2xl border bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-900/30">
            <div className="flex flex-col gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-[0_1px_3px_rgba(59,130,246,0.08)] dark:bg-blue-950/40 dark:text-blue-400">
                  <BriefcaseBusiness size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-gray-850 dark:text-gray-155 text-sm font-bold leading-snug">
                    Import Collected Leads
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    Directly load your business leads with{' '}
                    {campaignType === 'whatsapp' ? 'phones' : 'emails'}{' '}
                    generated from Google Maps into the Recipients Grid on the
                    right side.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={isLoadingLeads || !leadsData?.results?.length}
                  onClick={() => setIsLeadsModalOpen(true)}
                  className="flex shrink-0 whitespace-nowrap items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoadingLeads ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <span>Loading Leads...</span>
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      <span>Load Leads Data</span>
                    </>
                  )}
                </button>

                {!isLoadingLeads &&
                  editableData.some((r) => r.fileId === 'leads') && (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200/50 bg-emerald-50/20 px-3 py-2 text-xs font-semibold text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/10 dark:text-emerald-400">
                      <div className="flex items-center gap-1.5">
                        <Check size={13} className="text-emerald-500" />
                        <span>
                          Imported{' '}
                          {
                            editableData.filter((r) => r.fileId === 'leads')
                              .length
                          }{' '}
                          leads successfully!
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setFileToRemove({
                            id: 'leads',
                            type: 'leads',
                            name: `Imported Leads`,
                          })
                        }
                        className="ml-2 flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/40"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Missing variables warning */}
        {editableData.length > 0 && missingVariables.length > 0 && (
          <div
            className="flex items-start gap-3 rounded-xl p-4 text-sm"
            style={{
              background:
                'color-mix(in srgb, var(--app-debit-color) 8%, transparent)',
              border:
                '1.5px solid color-mix(in srgb, var(--app-debit-color) 35%, transparent)',
              color: 'var(--app-debit-color)',
            }}
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>
              Missing required template variables:{' '}
              <strong>{missingVariables.join(', ')}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {fileToRemove && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--app-pages-bg)] p-6 shadow-2xl ring-1 ring-[var(--app-pages-border)]">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-[var(--app-pages-text)]">
              <Trash2 size={18} className="text-red-500" /> Confirm Removal
            </h3>
            <p className="mb-6 text-sm text-[var(--app-pages-subhead-text)]">
              Are you sure you want to remove{' '}
              <strong>{fileToRemove.name}</strong>? This will instantly remove
              all associated recipients from your grid.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setFileToRemove(null)}
                className="hover:bg-[var(--app-pages-border)]/50 rounded-xl px-4 py-2 text-xs font-bold text-[var(--app-pages-text)] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(removeUploadedFile(fileToRemove.id))
                  if (fileToRemove.type === 'campaign') {
                    dispatch(setSelectedCampaignId(null))
                  }
                  setFileToRemove(null)
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-red-700"
              >
                Remove Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Selection Modal */}
      {isLeadsModalOpen && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--app-pages-bg)] p-6 shadow-2xl ring-1 ring-[var(--app-pages-border)]">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-[var(--app-pages-text)]">
              <BriefcaseBusiness size={18} className="text-blue-600" /> Select Leads to Import
            </h3>
            <p className="mb-4 text-xs text-[var(--app-pages-subhead-text)]">
              Choose which search groups you want to load into the recipients grid.
            </p>
            
            <div className="mb-6 max-h-[50vh] space-y-2 overflow-y-auto pr-2">
              {Array.from(
                new Set((leadsData?.results || []).map((l) => l.search_query || 'Unknown'))
              ).map((title) => {
                const count = leadsData.results.filter(
                  (l) => (l.search_query || 'Unknown') === title
                ).length
                const isSelected = selectedTitles.includes(title)

                return (
                  <label
                    key={title}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--app-pages-border)] p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTitles([...selectedTitles, title])
                          } else {
                            setSelectedTitles(selectedTitles.filter((t) => t !== title))
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
                      />
                      <span className="text-sm font-semibold text-[var(--app-pages-text)]">
                        {title}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {count}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsLeadsModalOpen(false)}
                className="hover:bg-[var(--app-pages-border)]/50 rounded-xl px-4 py-2 text-xs font-bold text-[var(--app-pages-text)] transition"
              >
                Cancel
              </button>
              <button
                disabled={selectedTitles.length === 0}
                onClick={() => {
                  handleImportLeads()
                  setIsLeadsModalOpen(false)
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
