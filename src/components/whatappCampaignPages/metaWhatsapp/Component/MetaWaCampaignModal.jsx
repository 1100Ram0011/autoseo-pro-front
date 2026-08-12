import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  useGetTemplatesQuery,
  useCreateCampaignMutation,
} from '@/redux/apis/metaWhatsapp.api'
import {
  useUploadImageMutation,
  useUploadVideoMutation,
  useUploadChatImageMutation,
  useUploadChatVideoMutation
} from '@/redux/apis/chat.api'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { maxLength } from 'zod'
import MetaWhatsAppPreview from './MetaTemplates/WhatsAppPreview'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

// ─── Utilities ────────────────────────────────────────────────────────────────

const escapeHtml = (str = '') =>
  str.replace(
    /[&<>"']/g,
    (m) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[m]
  )

const formatCellValue = (val) => {
  if (typeof val === 'number') {
    return val.toLocaleString('fullwide', { useGrouping: false });
  }
  if (typeof val === 'string' && /^\d+(\.\d+)?[Ee]\+\d+$/.test(val.trim())) {
    const num = Number(val.trim());
    if (!isNaN(num)) {
      return num.toLocaleString('fullwide', { useGrouping: false });
    }
  }
  return val;
}

const splitCSV = (row) =>
  row
    .match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
    ?.map((c) => c.replace(/^"|"$/g, '').trim()) || []

// Sanitizes phone numbers by removing spaces and leading plus signs
const cleanPhone = (num) =>
  String(num).replace(/^\+/, '').replace(/\s+/g, '').trim()

const isValidPhone = (num) => /^[1-9]\d{7,14}$/.test(cleanPhone(num))

const parseTemplateVariables = (template) => {
  if (!template) return [];
  const vars = [];

  // Global Header
  if (template.header) {
    const hFormat = template.header.format?.toUpperCase();
    if (hFormat === 'TEXT' && template.header.text?.includes('{{1}}')) {
      vars.push({ key: 'header_text', label: 'Variable' });
    } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(hFormat)) {
      vars.push({ 
        key: 'header_url', 
        label: `Variable ${hFormat} URL`,
        optional: !!template.header.mediaUrl || !!template.header.headerHandle || !!template.header.example?.headerHandle
      });
    }
  }

  // Global Body
  if (template.body) {
    const matches = [...template.body.matchAll(/\{\{(\d+)\}\}/g)];
    const uniqueNums = [...new Set(matches.map((m) => parseInt(m[1])))].sort((a, b) => a - b);
    uniqueNums.forEach((n) => vars.push({ key: `body_${n}`, label: `Variable {{${n}}}` }));
  }

  // Global Buttons
  if (template.buttons && template.buttons.length > 0) {
    template.buttons.forEach((btn, i) => {
      if (btn.type === 'URL' && btn.url?.includes('{{')) {
        const btnIdx = btn.index || i + 1;
        vars.push({ key: `button_${btnIdx}`, label: `Button Variable ${btnIdx}` });
      }
    });
  }

  // Carousel Cards
  if (template.carouselCards && template.carouselCards.length > 0) {
    template.carouselCards.forEach((card, idx) => {
      // Card Header
      const cType = card.header?.type;
      if (cType && cType !== 'NONE') {
        vars.push({ 
          key: `card_${idx}_header_url`, 
          label: `Card ${idx + 1} Header ${cType} URL`,
          optional: !!card.header?.mediaUrl
        });
      }

      // Card Body
      if (card.body) {
        const matches = [...card.body.matchAll(/\{\{(\d+)\}\}/g)];
        const uniqueNums = [...new Set(matches.map((m) => parseInt(m[1])))].sort((a, b) => a - b);
        uniqueNums.forEach((n) => vars.push({ key: `card_${idx}_body_${n}`, label: `Card ${idx + 1} Body {{${n}}}` }));
      }
      
      // Note: MSG91 doesn't officially support carousel button variables dynamically in the same way, 
      // or at least our service builder doesn't map them currently. If needed, can be added later.
    });
  }

  return vars;
}

const renderPreview = (body, values) => {
  if (!body) return ''
  return body.replace(/\{\{(\d+)\}\}/g, (_, n) => {
    // Determine if this body is inside a card or global
    // Actually, renderPreview here is only used for manual contact preview of the global body if at all.
    // Wait, the preview in this component is used differently. I will just check if `body_${n}` or any key exists.
    // But since it's just a simple string replacement, we can just look up the key.
    // In Msg91WaCampaignStatusModel it's used extensively. Here it might be used less.
    const val = values[`body_${n}`]
    return val && val.trim()
      ? `<span style="color:#25D366;font-weight:600">${escapeHtml(val)}</span>`
      : `<span style="color:#aaa;font-style:italic">{{${n}}}</span>`
  })
}

// ─── File Parsers ─────────────────────────────────────────────────────────────

const parseCSVText = (text, isFirstRowHeader) => {
  const lines = text.split('\n').filter((r) => r.trim())
  if (!lines.length) return { columns: [], rows: [] }
  if (isFirstRowHeader) {
    const columns = splitCSV(lines[0])
    const rows = lines
      .slice(1)
      .map((r) => {
        const cells = splitCSV(r)
        return Object.fromEntries(
          columns.map((col, i) => [col, formatCellValue(cells[i] || '')])
        )
      })
      .filter((row) => Object.values(row).some((v) => v))
    return { columns, rows }
  } else {
    const firstRow = splitCSV(lines[0])
    const columns = firstRow.map((_, i) => `Column ${i + 1}`)
    const rows = lines
      .map((r) => {
        const cells = splitCSV(r)
        return Object.fromEntries(
          columns.map((col, i) => [col, formatCellValue(cells[i] || '')])
        )
      })
      .filter((row) => Object.values(row).some((v) => v))
    return { columns, rows }
  }
}

const parseExcelBuffer = (buffer, isFirstRowHeader) => {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  if (isFirstRowHeader) {
    const json = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      blankrows: false,
    })
    const formattedJson = json.map(row => 
      Object.fromEntries(Object.entries(row).map(([k, v]) => [k, formatCellValue(v)]))
    )
    const validRows = formattedJson.filter((row) =>
      Object.values(row).some((val) => String(val).trim() !== '')
    )
    const columns = validRows.length > 0 ? Object.keys(validRows[0]) : []
    return { columns, rows: validRows }
  } else {
    const arr = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    })
    const validArr = arr.filter((row) =>
      row.some((val) => String(val).trim() !== '')
    )
    if (!validArr.length) return { columns: [], rows: [] }
    const maxCols = Math.max(...validArr.map((r) => r.length))
    const columns = Array.from({ length: maxCols }, (_, i) => `Column ${i + 1}`)
    const rows = validArr.map((r) =>
      Object.fromEntries(columns.map((col, i) => [col, formatCellValue(r[i] ?? '')]))
    )
    return { columns, rows }
  }
}

const ACCEPTED_EXTENSIONS = '.csv,.xlsx,.xls'
const isExcelFile = (file) =>
  file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

// ─── Sub-components ───────────────────────────────────────────────────────────

const TabBtn = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
      active
        ? 'bg-white text-[var(--app-pages-text)] shadow-sm dark:bg-zinc-700'
        : 'text-gray-500 hover:text-[var(--app-pages-text)] dark:text-zinc-400'
    }`}
  >
    {children}
  </button>
)

const Label = ({ children, required }) => (
  <div className="mb-1.5 text-[13px] font-semibold text-[var(--app-pages-text)]">
    {children} {required && <span className="text-red-500">*</span>}
  </div>
)

const SelectField = ({ value, onChange, options, placeholder, loading }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 h-10 pr-10 font-sans text-[13px] font-medium text-[var(--app-pages-text)] outline-none transition-colors focus:border-[var(--app-brand-primary)]"
      disabled={loading}
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

const WhatsAppPreview = ({ fromNumber, template, bodyValues }) => {
  if (!template) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] font-sans shadow-xl h-[400px] flex items-center justify-center">
        <span className="text-gray-400 text-sm">Select a template to preview</span>
      </div>
    )
  }

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
    <div className="w-full overflow-hidden rounded-[2rem] border-[6px] border-gray-900 bg-[#efeae2] shadow-2xl h-[520px] flex flex-col relative mx-auto max-w-[300px]">
      {/* Phone Notch */}
      <div className="absolute left-1/2 top-0 h-5 w-28 -translate-x-1/2 rounded-b-xl bg-gray-900 z-50"></div>
      
      {/* WhatsApp Header */}
      <div className="flex items-center gap-2.5 bg-[#075e54] px-3 py-2 pt-7 shrink-0 z-10 text-white shadow-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold tracking-wide">
            {fromNumber || 'Select a number'}
          </div>
          <div className="text-[10px] text-white/80 leading-none mt-0.5">online</div>
        </div>
      </div>

      {/* Chat Background */}
      <div 
        className="flex-1 overflow-hidden relative"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='3' cy='3' r='1' fill='%23c9bdb2' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      >
        <div className="absolute inset-0 p-4 pt-6 overflow-y-auto scrollbar-hide">
          <div className="flex min-h-full flex-col justify-end">
            <MetaWhatsAppPreview form={form} hideShell={true} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Excel-Style Manual Contact Table ────────────────────────────────────────

const ManualContactsTable = ({ contacts, setContacts, variables }) => {
  const addRow = () => {
    const newContact = { id: Date.now(), name: '', phone: '' }
    variables.forEach((v) => {
      newContact[v.key] = ''
    })
    setContacts([...contacts, newContact])
  }

  const removeRow = (id) => {
    setContacts(contacts.filter((c) => c.id !== id))
  }

  const updateContact = (id, field, value) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    )
  }

  const [uploadImage] = useUploadImageMutation()
  const [uploadVideo] = useUploadVideoMutation()

  const handleFileUpload = async (file, contactId, colKey) => {
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('caption', 'Campaign Media')
    
    const toastId = toast.loading(`Uploading ${isVideo ? 'video' : 'image'}...`)
    try {
      let res
      if (isVideo) {
        res = await uploadVideo(formData).unwrap()
      } else {
        res = await uploadImage(formData).unwrap()
      }
      
      if (res?.data?.mediaUrl) {
        updateContact(contactId, colKey, res.data.mediaUrl)
        toast.success('Uploaded successfully!', { id: toastId })
      } else {
        throw new Error('No URL returned')
      }
    } catch (err) {
      toast.error(err?.data?.error || err?.message || 'Failed to upload file', { id: toastId })
    }
  }

  const columns = [
    { key: 'name', label: 'Name', width: '200px', placeholder: 'John Doe' },
    {
      key: 'phone',
      label: 'Phone Number',
      width: '260px',
      placeholder: '91989XXXXXX0',
      required: true,
    },
    ...variables.map((v) => ({
      key: v.key,
      label: v.label,
      width: '180px',
      placeholder: `Value for ${v.label}`,
      required: !v.optional,
    })),
  ]

  return (
    <div className="space-y-4">
      {contacts.length === 0 ? (
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] py-10 px-6 text-center transition-all hover:border-gray-300 dark:hover:border-zinc-700">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-[var(--app-brand-primary)] shadow-inner dark:bg-indigo-500/10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          {/* <h3 className="mb-2 font-sans text-base font-semibold text-[var(--app-pages-text)]">Start building your audience</h3> */}
          <p className="mb-6 max-w-sm font-sans text-[13px] leading-relaxed text-[var(--app-pages-subhead-text)]">
            You haven't added any contacts yet. Add your first contact manually to get started with this campaign.
          </p>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--app-brand-primary)] px-5 py-2.5 font-sans text-[13px] font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow active:translate-y-0 active:shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact, index) => (
            <div key={contact.id} className="relative rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-3 shadow-sm transition-all hover:border-[var(--app-brand-primary)]/40 group">
              {/* Header: Contact # and Delete */}
              <div className="mb-3 flex items-center justify-between border-b border-[var(--app-pages-border)] pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-500/10 text-[10px] font-bold text-[var(--app-brand-primary)]">
                    {index + 1}
                  </div>
                  <h4 className="font-sans text-[12px] font-semibold text-[var(--app-pages-text)]">
                    Contact Details
                  </h4>
                </div>
                <button
                  onClick={() => removeRow(contact.id)}
                  className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                  title="Remove contact"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {columns.map((col) => (
                  <div key={col.key} className="flex flex-col gap-1">
                    <label className="font-sans text-[10px] font-semibold text-gray-600 dark:text-zinc-400">
                      {col.label} {col.required && <span className="text-red-500">*</span>}
                    </label>

                    {col.key === 'phone' ? (
                      <PhoneInput
                        country={'in'}
                        value={contact[col.key] || ''}
                        onChange={(phone) => updateContact(contact.id, col.key, phone)}
                        enableSearch
                        inputClass={`!w-full !rounded-md !border !font-sans !text-[12px] !outline-none !transition-all !h-9 ${
                          col.required && !contact[col.key]?.trim()
                            ? '!border-red-300 !bg-red-50 focus:!border-red-500 dark:!border-red-800 dark:!bg-red-950/30 dark:focus:!border-red-600'
                            : '!border-[var(--app-pages-border)] !bg-[var(--app-pages-bg)] focus:!border-[var(--app-brand-primary)]'
                        } !text-[var(--app-pages-text)]`}
                        buttonClass="!border !border-r-0 !rounded-l-md !border-[var(--app-pages-border)] !bg-[var(--app-pages-bg)] hover:!bg-gray-50 dark:hover:!bg-zinc-800"
                        dropdownClass="!bg-[var(--app-pages-bg)] !text-[var(--app-pages-text)] !rounded-md !border !border-[var(--app-pages-border)] !shadow-lg !z-50"
                      />
                    ) : (
                      <input
                        type="text"
                        value={contact[col.key] || ''}
                        onChange={(e) => {
                          let value = e.target.value
                          if (col.key === 'name') value = value.replace(/[^A-Za-z\s]/g, '')
                          updateContact(contact.id, col.key, value)
                        }}
                        placeholder={col.placeholder}
                        className={`w-full rounded-md border px-2.5 py-1.5 h-9 font-sans text-[12px] outline-none transition-all ${
                          col.required && !contact[col.key]?.trim()
                            ? 'border-red-300 bg-red-50 text-gray-900 focus:border-red-500 dark:border-red-800 dark:bg-red-950/30 dark:focus:border-red-600'
                            : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] focus:border-[var(--app-brand-primary)]'
                        } placeholder-gray-400 dark:placeholder-zinc-500`}
                      />
                    )}
                    
                    {col.key.includes('header_url') && (
                      <label className="inline-flex cursor-pointer items-center justify-center gap-1 self-start rounded border border-[var(--app-pages-border)] bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-100">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,video/*"
                          onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) handleFileUpload(file, contact.id, col.key)
                            e.target.value = null
                          }}
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add Another button below the list */}
          <div className="flex justify-center pt-1">
            <button
              onClick={addRow}
              className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-[var(--app-brand-primary)]/40 bg-[var(--app-brand-primary)]/5 px-4 py-2 font-sans text-[12px] font-medium text-[var(--app-brand-primary)] transition-all hover:border-[var(--app-brand-primary)] hover:bg-[var(--app-brand-primary)]/10 active:scale-[0.98]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Another Contact
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CSV Mapping Field ────────────────────────────────────────────────────────

const CSVMappingField = ({
  variables,
  csvColumns,
  mapping,
  onChange,
  hasNameColumn,
  nameColumn,
  setNameColumn,
}) => {
  const [uploadChatImage] = useUploadChatImageMutation();
  const [uploadChatVideo] = useUploadChatVideoMutation();

  return (
    <div className="space-y-4 relative z-40">
    {/* Name column mapping (optional) */}
    <div className="rounded-xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm  ">
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

    {/* Variable mappings */}
    {variables.map((v) => {
      const key = v.key
      const isCustom = mapping[key] === '__custom__'
      const isSpecific = mapping[key] && mapping[key] !== '__custom__'

      return (
        <div
          key={key}
          className="rounded-xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm transition-all hover:border-[var(--app-brand-primary)]"
        >
          <Label required>{v.label}</Label>
          <div className="mb-3 mt-2 flex gap-6">
            <label className="group flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={`type_${key}`}
                checked={isSpecific}
                onChange={() => onChange(key, csvColumns[0] || '')}
                className="h-4 w-4 cursor-pointer border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-zinc-600"
              />
              <span className="font-sans text-sm font-medium text-gray-700 transition-colors group-hover:text-indigo-600 dark:text-zinc-300 dark:group-hover:text-indigo-400">
                Specific from Column
              </span>
            </label>
            <label className="group flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name={`type_${key}`}
                checked={isCustom}
                onChange={() => onChange(key, '__custom__')}
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
                value={mapping[key] === '__custom__' ? '' : mapping[key]}
                onChange={(val) => onChange(key, val)}
                options={csvColumns.map((c) => ({ value: c, label: c }))}
                placeholder={`Select column for ${v.label}`}
              />
            </div>
          )}

          {isCustom && (
            <div className="mt-3 relative">
              <input
                type="text"
                placeholder={`Enter common value for ${v.label}`}
                value={mapping[`${key}_custom`] || ''}
                onChange={(e) => onChange(`${key}_custom`, e.target.value)}
                className="w-full rounded-lg border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 font-sans text-sm text-[var(--app-pages-text)] placeholder-[var(--app-pages-subhead-text)] shadow-sm outline-none transition-all focus:border-[var(--app-brand-primary)]"
              />
              {key.includes('header_url') && (
                <div className="mt-2 flex justify-end">
                  <label className="cursor-pointer text-xs font-semibold text-[var(--app-brand-primary)] hover:underline flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Media
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (file) {
                          const isVideo = file.type.startsWith('video/')
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('caption', 'Campaign Media')
                          
                          // Quick hack: pass a custom event to update mapping
                          const uploadToast = toast.loading(`Uploading ${isVideo ? 'video' : 'image'}...`)
                          try {
                            let res;
                            if (isVideo) {
                              res = await uploadChatVideo(formData).unwrap();
                            } else {
                              res = await uploadChatImage(formData).unwrap();
                            }
                            
                            if (res?.mediaUrl) {
                              onChange(`${key}_custom`, res.mediaUrl)
                              toast.success('Uploaded successfully!', { id: uploadToast })
                            } else {
                              throw new Error('Upload failed')
                            }
                          } catch (err) {
                            toast.error('Failed to upload file', { id: uploadToast })
                          }
                        }
                        e.target.value = null
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
          {!isSpecific && !isCustom && (
            <div className="mt-2 font-sans text-xs text-red-500">
              Please select a mapping type
            </div>
          )}
        </div>
      )
    })}
  </div>
)
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Msg91WaCampaignModal({
  open,
  onClose,
  onSuccess,
  selectedNumber,
  wabaNumbers = [],
}) {
  const [tab, setTab] = useState('manual')
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Quick Reply custom responses
  const [quickReplyResponses, setQuickReplyResponses] = useState({})

  // Manual mode
  const [manualContacts, setManualContacts] = useState([])

  // CSV mode
  const [csvFile, setCsvFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [csvColumns, setCsvColumns] = useState([])
  const [phoneColumn, setPhoneColumn] = useState('')
  const [csvCountryCode, setCsvCountryCode] = useState('91')
  const [nameColumn, setNameColumn] = useState('')
  const [isFirstRowHeader, setIsFirstRowHeader] = useState(true)
  const [csvMapping, setCsvMapping] = useState({})
  const [fileParseError, setFileParseError] = useState('')

  const [templates, setTemplates] = useState([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const defaultNumber = selectedNumber

  const [fromNumber, setFromNumber] = useState(defaultNumber || '')

  const fileRef = useRef()

  console.log(fromNumber, 'fromNumber')

  const { data: apiTemplates, isLoading: templatesLoading, isError: templatesIsError, refetch } = useGetTemplatesQuery({ numberId: fromNumber }, { skip: !fromNumber || !open })

  useEffect(() => {
    if (!fromNumber && defaultNumber) {
      setFromNumber(defaultNumber)
    }
  }, [defaultNumber, fromNumber])

  useEffect(() => {
    if (!apiTemplates) return
    const raw = Array.isArray(apiTemplates)
      ? apiTemplates
      : apiTemplates.data || []
    console.log(raw, 'raw')
    setTemplates(
      raw
        ?.filter(
          (val) => val.status !== 'DISABLED' && val.status === 'APPROVED'
        )
        .map((t) => ({ value: t._id, label: t.name, template: t }))
    )
  }, [apiTemplates])

  useEffect(() => {
    if (wabaNumbers.length > 0 && !fromNumber) {
      const first = wabaNumbers[0]
      setFromNumber(typeof first === 'string' ? first : first.value)
    }
  }, [wabaNumbers, fromNumber])

  useEffect(() => {
    if (!open) {
      setTab('manual')
      setStep(1)
      setError('')
      setSuccess('')
      setManualContacts([])
      setCsvFile(null)
      setCsvData([])
      setCsvColumns([])
      setPhoneColumn('')
      setCsvCountryCode('91')
      setNameColumn('')
      setIsFirstRowHeader(true)
      setFromNumber(wabaNumbers?.[0]?.value || wabaNumbers?.[0] || '')
      setSelectedTemplateId('')
      setSelectedTemplate(null)
      setCsvMapping({})
      setFileParseError('')
    }
  }, [open, wabaNumbers])

  useEffect(() => {
    if (csvFile) handleFile(csvFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstRowHeader])

  const handleRefetchTemplates = useCallback(() => {
    if (selectedNumber) refetch()
  }, [refetch, selectedNumber])

  const variables = useMemo(() => {
    return selectedTemplate ? parseTemplateVariables(selectedTemplate) : []
  }, [selectedTemplate])

  useEffect(() => {
    if (!selectedTemplate || manualContacts.length === 0) return

    setManualContacts((prev) => {
      let hasChange = false

      const updatedContacts = prev.map((contact) => {
        const updated = { ...contact }

        variables.forEach((v) => {
          if (!updated[v.key]) {
            updated[v.key] = ''
            hasChange = true
          }
        })

        return updated
      })

      return hasChange ? updatedContacts : prev
    })
  }, [selectedTemplate, variables])

  const normalizedWabaNumbers = wabaNumbers?.map((n) =>
    typeof n === 'string'
      ? { value: n, label: n }
      : { value: String(n.value), label: n.label || n.value }
  )

  const handleFile = (file) => {
    if (!file) return
    setCsvFile(file)
    setFileParseError('')
    setPhoneColumn('')
    setNameColumn('')
    setCsvColumns([])
    setCsvData([])

    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const { columns, rows } = parseCSVText(
            e.target.result,
            isFirstRowHeader
          )
          setCsvColumns(columns)
          setCsvData(rows)
        } catch {
          setFileParseError(
            'Failed to parse CSV file. Please check the file format.'
          )
        }
      }
      reader.onerror = () => setFileParseError('Failed to read the file.')
      reader.readAsText(file)
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const { columns, rows } = parseExcelBuffer(
            new Uint8Array(e.target.result),
            isFirstRowHeader
          )
          setCsvColumns(columns)
          setCsvData(rows)
        } catch {
          setFileParseError(
            "Failed to parse Excel file. Please ensure it's a valid .xlsx or .xls file."
          )
        }
      }
      reader.onerror = () => setFileParseError('Failed to read the file.')
      reader.readAsArrayBuffer(file)
    } else {
      setFileParseError(
        'Unsupported file type. Please upload a CSV or Excel file.'
      )
    }
  }

  const handleTemplateSelect = (id) => {
    setSelectedTemplateId(id)
    const found = templates.find((t) => t.value === id)
    setSelectedTemplate(found ? found.template : null)
    setCsvMapping({})
  }

  const updateCsvMapping = (key, val) =>
    setCsvMapping((p) => ({ ...p, [key]: val }))

  const buildRecipients = () => {
    if (tab === 'manual') {
      return manualContacts
        .filter((c) => isValidPhone(c.phone))
        .map((contact) => {
          const vals = {}
          variables.forEach((v) => {
            vals[v.key] = contact[v.key] || ''
          })
          return {
            name: contact.name || '',
            phone: cleanPhone(contact.phone),
            values: vals,
          }
        })
    }
    if (tab === 'csv') {
      return csvData
        .map((row) => {
          const rawPhone = row[phoneColumn]
          if (!rawPhone) return null
          let phone = cleanPhone(rawPhone)
          
          if (phone.length <= 10 && csvCountryCode) {
            phone = `${csvCountryCode}${phone}`;
          }

          if (!isValidPhone(phone)) return null

          const vals = {}
          variables.forEach((v) => {
            const key = v.key
            const mapped = csvMapping[key]
            if (mapped === '__custom__')
              vals[key] = csvMapping[`${key}_custom`] || ''
            else if (mapped) vals[key] = String(row[mapped] || '')
          })
          return {
            name: nameColumn ? String(row[nameColumn] || '').trim() : '',
            phone,
            values: vals,
          }
        })
        .filter(Boolean)
    }
    return []
  }

  const recipients = buildRecipients()

  const validateStep1 = () => {
    if (!fromNumber) return 'Please select a From number'
    if (!selectedTemplateId) return 'Please select a WhatsApp template'

    if (tab === 'manual') {
      if (manualContacts.length === 0) return 'Please add at least one contact'
      for (const contact of manualContacts) {
        if (!contact.phone?.trim())
          return 'All contacts must have a phone number'
        if (!isValidPhone(contact.phone))
          return `Invalid phone number format: ${contact.phone}`
        for (const v of variables) {
          if (!v.optional && !contact[v.key]?.trim())
            return `Contact ${contact.name || contact.phone} is missing value for ${v.label}`
        }
      }
    }

    if (tab === 'csv') {
      if (!csvFile) return 'Please upload a CSV or Excel file'
      if (fileParseError) return fileParseError
      if (!phoneColumn) return 'Please select the phone column'

      for (const v of variables) {
        const key = v.key
        const mapped = csvMapping[key]
        if (!v.optional && !mapped) return `Please select a mapping type for ${v.label}`
        if (!v.optional && mapped === '__custom__' && !csvMapping[`${key}_custom`]?.trim())
          return `Please enter a common value for ${v.label}`
      }
    }
    return null
  }

  const [sendCampaign, { isLoading: sending }] =
    useCreateCampaignMutation()

  const handleSend = async () => {
    setError('')
    setSuccess('')
    try {
      const payload = {
        name: `Campaign ${new Date().toLocaleString()}`,
        numberId: fromNumber,
        templateId: selectedTemplateId,
        recipients: recipients.map((r) => ({
          phoneNumber: r.phone,
          name: r.name || "",
          variables: r.values,
        })),
      }
      const response = await sendCampaign(payload).unwrap()
      setSuccess(
        `Campaign sent successfully! ${response?.sent || recipients.length} messages dispatched.`
      )
      onSuccess?.(response)
      toast.success(
        `Campaign sent successfully! ${response?.sent || recipients.length} messages dispatched.`
      )
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Failed to send campaign')
      toast.error(err?.data?.message || err?.message || 'Failed to send campaign')
    }
  }

  const previewValues = (() => {
    if (tab === 'manual' && manualContacts.length > 0) {
      const first = manualContacts[0]
      const vals = {}
      variables.forEach((v) => {
        vals[v.key] = first[v.key] || ''
      })
      return vals
    }
    if (tab === 'csv' && csvData.length > 0) {
      const vals = {}
      variables.forEach((v) => {
        const key = v.key
        const mapped = csvMapping[key]
        if (mapped === '__custom__')
          vals[key] = csvMapping[`${key}_custom`] || ''
        else if (mapped) vals[key] = String(csvData[0]?.[mapped] || '')
      })
      return vals
    }
    return {}
  })()

  if (!open) return null

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px) scale(.96) }
          to   { opacity:1; transform:translateY(0) scale(1) }
        }
        @keyframes spin {
          from { transform:rotate(0deg) }
          to   { transform:rotate(360deg) }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(-5px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .modal-anim { animation: slideUp .35s cubic-bezier(.16,1,.3,1); }
        .spin { animation: spin 1s linear infinite; }
        .animate-fadeIn { animation: fadeIn .2s ease-out forwards; }
        .scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .scrollbar::-webkit-scrollbar-track { background: #27272a; }
        .dark .scrollbar::-webkit-scrollbar-thumb { background: #52525b; }
        .dark .scrollbar::-webkit-scrollbar-thumb:hover { background: #71717a; }
        
        /* react-phone-input-2 overrides */
        .react-tel-input .form-control {
          background-color: var(--app-pages-bg) !important;
          border-color: var(--app-pages-border) !important;
          color: var(--app-pages-text) !important;
        }
        .react-tel-input .flag-dropdown {
          background-color: var(--app-pages-bg) !important;
          border-color: var(--app-pages-border) !important;
        }
        .react-tel-input .selected-flag:hover, .react-tel-input .selected-flag:focus {
          background-color: var(--app-pages-muted) !important;
        }
        .react-tel-input .country-list {
          background-color: var(--app-pages-bg) !important;
          color: var(--app-pages-text) !important;
        }
        .react-tel-input .country-list .country:hover {
          background-color: var(--app-pages-muted) !important;
        }
        .react-tel-input .country-list .country.highlight {
          background-color: var(--app-pages-muted) !important;
        }
        .react-tel-input .country-list .search {
          background-color: var(--app-pages-bg) !important;
        }
        .react-tel-input .country-list .search-box {
          background-color: var(--app-pages-bg) !important;
          color: var(--app-pages-text) !important;
          border-color: var(--app-pages-border) !important;
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 dark:bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      >
        {/* Modal */}
        <div className="modal-anim flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-slate-900 dark:text-slate-100">
          <div className="scrollbar flex flex-1 flex-col overflow-hidden rounded-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
              <div>
                <h2 className="m-0 font-sans text-lg font-bold text-slate-900 dark:text-slate-100">
                  WhatsApp Campaign 
                </h2>
                {step === 2 && (
                  <p className="m-0 mt-1 font-sans text-[13px] text-slate-500 dark:text-slate-400">
                    Review {recipients.length} recipient
                    {recipients.length !== 1 ? 's' : ''} before sending
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="scrollbar flex-1 overflow-y-auto px-6 py-5 ">
              {/* Success */}
              {success ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--app-credit-color)] shadow-sm">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-1.5 font-sans text-lg font-bold text-[var(--app-pages-text)]">
                      Campaign Sent Successfully!
                    </div>
                    <div className="font-sans text-[13px] text-[var(--app-pages-text)] opacity-80">
                      {success}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-5 py-2 text-[13px] font-medium text-[var(--app-pages-text)] shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Close
                  </button>
                </div>
              ) : step === 1 ? (
                /* Step 1: Compose */
                <div className="flex gap-8">
                  {/* Left form */}
                  <div className="flex min-w-0 flex-1 flex-col gap-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* From Number */}
                      <div>
                        <Label required>From Number</Label>
                        <SelectField
                          value={fromNumber}
                          onChange={setFromNumber}
                          options={normalizedWabaNumbers}
                          placeholder="Select sender number"
                        />
                      </div>

                      {/* Template */}
                      <div>
                        <Label required>WhatsApp Template</Label>
                        {templatesIsError && (
                          <div className="mb-3 rounded-lg border-2 border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] px-4 py-3 font-sans text-sm text-[var(--app-debit-color)] ">
                            Failed to load templates. Please try again.
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <SelectField
                              value={selectedTemplateId}
                              onChange={handleTemplateSelect}
                              options={templates}
                              placeholder={
                                !selectedNumber
                                  ? 'No number provided'
                                  : templatesLoading
                                    ? 'Loading templates...'
                                    : templates.length === 0
                                      ? 'No approved templates found'
                                      : 'Select a template'
                              }
                              loading={templatesLoading}
                            />
                          </div>
                          <button
                            onClick={handleRefetchTemplates}
                            title="Refresh templates"
                            disabled={!selectedNumber || templatesLoading}
                            className={`flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] transition-all  ${!selectedNumber || templatesLoading
                              ? 'cursor-not-allowed opacity-40'
                              : 'cursor-pointer hover:border-[var(--app-pages-text)] hover:bg-gray-50 dark:hover:bg-zinc-800'
                              }`}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className={`text-[var(--app-pages-text)] ${templatesLoading ? 'spin' : ''}`}
                            >
                              <polyline points="23 4 23 10 17 10" />
                              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Empty State before template selection */}
                    {!selectedTemplate && (
                      <div className="animate-fadeIn mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] py-12 px-6 text-center transition-all">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-[var(--app-brand-primary)] shadow-inner dark:bg-indigo-500/10">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            <line x1="9" y1="10" x2="15" y2="10" />
                            <line x1="12" y1="7" x2="12" y2="13" />
                          </svg>
                        </div>
                        <h3 className="mb-2 font-sans text-base font-semibold text-[var(--app-pages-text)]">
                          Waiting for Template
                        </h3>
                        <p className="max-w-sm font-sans text-[13px] leading-relaxed text-[var(--app-pages-subhead-text)]">
                          Select a WhatsApp template from the dropdown above to continue configuring your campaign recipients.
                        </p>
                      </div>
                    )}
                    {/* Recipient Input Mode */}
                    {selectedTemplate && (
                      <>
                        <div>
                          <Label>Add Recipients</Label>
                          <div className="flex w-full max-w-md gap-0.5 rounded-lg bg-gray-100/80 p-1 shadow-inner dark:bg-zinc-800/80">
                            <TabBtn
                              active={tab === 'manual'}
                              onClick={() => setTab('manual')}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                                <circle cx="8.5" cy="7" r="4" />
                                <line x1="20" y1="8" x2="20" y2="14" />
                                <line x1="23" y1="11" x2="17" y2="11" />
                              </svg>
                              Enter Manually
                            </TabBtn>
                            <TabBtn
                              active={tab === 'csv'}
                              onClick={() => setTab('csv')}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              Upload File
                            </TabBtn>
                          </div>
                        </div>

                        {/* Manual Mode */}
                        {tab === 'manual' && (
                          <div className="animate-fadeIn">
                            <ManualContactsTable
                              contacts={manualContacts}
                              setContacts={setManualContacts}
                              variables={variables}
                            />
                            {/* <p className="mt-3 flex items-start gap-2 font-sans text-xs text-[var(--app-pages-text)]">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="mt-0.5 shrink-0"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                              </svg>
                              <span>
                                Enter phone numbers{' '}
                                <strong>with country code</strong> (e.g.,
                                91989XXXXXX0). Names are optional but help with
                                personalization.
                              </span>
                            </p> */}
                          </div>
                        )}

                        {/* CSV Mode */}
                        {tab === 'csv' && (
                          <div className="animate-fadeIn space-y-4">
                            {!csvFile ? (
                              <div
                                className="cursor-pointer rounded-lg border border-dashed border-[var(--app-pages-border)] p-8 text-center transition-all duration-200 hover:border-[var(--app-pages-border)] hover:bg-[var(--app-pages-bg)] "
                                onClick={() => fileRef.current.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  const f = e.dataTransfer.files[0]
                                  if (f) handleFile(f)
                                }}
                              >
                                <svg
                                  width="36"
                                  height="36"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  className="mx-auto mb-3 text-gray-400 "
                                >
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                  <line x1="12" y1="18" x2="12" y2="12" />
                                  <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                                <p className="m-0 mb-1.5 font-sans text-sm font-semibold text-[var(--app-pages-text)]">
                                  Click to upload or drag & drop
                                </p>
                                <p className="m-0 mb-3 font-sans text-[13px] text-[var(--app-pages-text)]">
                                  Supported:{' '}
                                  <strong className="text-[var(--app-pages-border)]">
                                    .csv, .xlsx, .xls
                                  </strong>
                                </p>
                                <div className="flex justify-center gap-1.5">
                                  {['CSV', 'XLSX'].map((fmt) => (
                                    <span
                                      key={fmt}
                                      className="rounded border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2 py-0.5 font-sans text-[10px] font-semibold text-[var(--app-pages-text)]"
                                    >
                                      {fmt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-3 ">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke={
                                    isExcelFile(csvFile) ? '#16a34a' : '#6366f1'
                                  }
                                  strokeWidth="2"
                                >
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[13px] font-medium text-[var(--app-pages-text)] ">
                                  {csvFile.name}
                                </span>
                                <span
                                  className={`rounded-md px-2 py-0.5 font-sans text-[10px] font-bold ${isExcelFile(csvFile)
                                    ? 'bg-[var(--app-pages-bg)] text-[var(--app-credit-color)]'
                                    : 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
                                    }`}
                                >
                                  {isExcelFile(csvFile) ? 'EXCEL' : 'CSV'}
                                </span>
                                <div className="flex gap-2.5">
                                  <button
                                    onClick={() => fileRef.current.click()}
                                    className="cursor-pointer border-none bg-transparent font-sans text-[13px] font-medium text-[var(--app-pages-text)]  hover:underline"
                                  >
                                    Change
                                  </button>
                                  <button
                                    onClick={() => {
                                      setCsvFile(null)
                                      setCsvData([])
                                      setCsvColumns([])
                                      setPhoneColumn('')
                                      setNameColumn('')
                                      setFileParseError('')
                                    }}
                                    className="cursor-pointer border-none bg-transparent font-sans text-[13px] font-medium text-[var(--app-pages-text)]  hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}

                            <input
                              ref={fileRef}
                              type="file"
                              accept={ACCEPTED_EXTENSIONS}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files[0]
                                if (f) handleFile(f)
                                e.target.value = ''
                              }}
                            />

                            {fileParseError && (
                              <div className="rounded-lg border-2 border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] px-4 py-3 font-sans text-sm text-[var(--app-debit-color)]">
                                {fileParseError}
                              </div>
                            )}

                            {csvFile &&
                              csvData.length > 0 &&
                              !fileParseError && (
                                <>
                                  {/* Preview Table */}
                                  <div className="animate-fadeIn overflow-hidden rounded-lg border-2 border-[var(--app-pages-border)]">
                                    <div className="scrollbar max-h-80 overflow-x-auto">
                                      <table className="w-full border-collapse font-sans text-sm">
                                        <thead className="sticky top-0 z-10 shadow-sm">
                                          <tr className="bg-[var(--app-pages-bg)]">
                                            {csvColumns.map((col) => (
                                              <th
                                                key={col}
                                                className="border-b-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-3 text-left font-bold text-[var(--app-pages-text)]"
                                              >
                                                {col}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {csvData.map((row, i) => (
                                            <tr
                                              key={i}
                                              className={
                                                i % 2 === 0
                                                  ? 'bg-white '
                                                  : 'bg-gray-50 '
                                              }
                                            >
                                              {csvColumns.map((col) => (
                                                <td
                                                  key={col}
                                                  className="whitespace-nowrap border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-1 text-[var(--app-pages-text)]"
                                                >
                                                  {col === phoneColumn ? (
                                                    <div className="phone-input-container !w-[220px]">
                                                      <PhoneInput
                                                        country={'in'}
                                                        value={
                                                          row[col]
                                                            ? String(row[col]).replace(/\D/g, '').length === 10
                                                              ? '91' + String(row[col]).replace(/\D/g, '')
                                                              : String(row[col])
                                                            : '91'
                                                        }
                                                        onChange={(value) => {
                                                          const newData = [...csvData]
                                                          newData[i] = { ...newData[i], [col]: value }
                                                          setCsvData(newData)
                                                        }}
                                                        enableSearch
                                                        inputClass="!w-full !bg-transparent !outline-none !border-b !border-transparent focus:!border-[var(--app-pages-border)] !font-sans !text-sm !h-[32px] !pl-10 !py-0 !text-[var(--app-pages-text)]"
                                                        buttonClass="!bg-transparent !border-none !left-0 !h-[32px] hover:!bg-transparent"
                                                        dropdownClass="!bg-[var(--app-pages-bg)] !text-[var(--app-pages-text)] z-50"
                                                      />
                                                    </div>
                                                  ) : (
                                                    <input
                                                      type="text"
                                                      className="w-full bg-transparent font-sans text-sm outline-none border-b border-transparent focus:border-[var(--app-pages-border)] px-1 py-1"
                                                      value={row[col] !== undefined ? row[col] : ''}
                                                      onChange={(e) => {
                                                        const newData = [...csvData]
                                                        newData[i] = { ...newData[i], [col]: e.target.value }
                                                        setCsvData(newData)
                                                      }}
                                                      placeholder={`Enter ${col}`}
                                                    />
                                                  )}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    <div className="border-t-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 font-sans text-xs text-[var(--app-pages-text)]">
                                      Showing all {csvData.length} rows (Editable)
                                    </div>
                                  </div>

                                  {/* Column Mappings */}
                                  <div className="animate-fadeIn grid grid-cols-2 gap-4 relative z-50 mb-4">
                                    <div>
                                      <Label required>
                                        Phone Number Column
                                      </Label>
                                      <SelectField
                                        value={phoneColumn}
                                        onChange={setPhoneColumn}
                                        options={csvColumns.map((c) => ({
                                          value: c,
                                          label: c,
                                        }))}
                                        placeholder="Select phone column"
                                      />
                                    </div>
                                    {/* <div>
                                      <Label>Default Country Code</Label>
                                      <div className="phone-input-container">
                                        <PhoneInput
                                          country={'in'}
                                          value={csvCountryCode}
                                          onChange={(value, country) => {
                                            setCsvCountryCode(country.dialCode)
                                          }}
                                          enableSearch
                                          inputClass="!w-full !rounded-lg !border-2 !border-[var(--app-pages-border)] !bg-[var(--app-pages-bg)] !text-[var(--app-pages-text)] !h-[48px]"
                                          buttonClass="!border-2 !border-[var(--app-pages-border)] !bg-[var(--app-pages-bg)] hover:!bg-[var(--app-pages-muted)]"
                                          dropdownClass="!bg-[var(--app-pages-bg)] !text-[var(--app-pages-text)]"
                                        />
                                      </div>
                                      <p className="mt-1 font-sans text-xs text-[var(--app-pages-subhead-text)] text-gray-500">Added to 10-digit numbers</p>
                                    </div> */}
                                  </div>
                                  <div className="animate-fadeIn mb-4 flex items-end">
                                      <label className="flex cursor-pointer items-center gap-3">
                                        <div
                                          onClick={() =>
                                            setIsFirstRowHeader((p) => !p)
                                          }
                                          className={`relative h-6 w-12 cursor-pointer rounded-full transition-colors duration-200 border-2 border-[var(--app-pages-border)] ${isFirstRowHeader
                                            ? ' bg-[var(--app-brand-primary)]'
                                            : 'bg-[var(--app-pages-bg)]'
                                            }`}
                                        >
                                          <div
                                            className={`absolute top-[2px] h-4 w-4 rounded-full bg-[var(--app-pages-bg)] shadow transition-all duration-200 ${isFirstRowHeader
                                              ? 'left-[22px]'
                                              : 'left-[2px]'
                                              }`}
                                          />
                                        </div>
                                        <span className="font-sans text-sm font-medium text-[var(--app-pages-text)] ">
                                          First row is header
                                        </span>
                                      </label>
                                  </div>

                                  {/* Variable Mappings */}
                                  <CSVMappingField
                                    variables={variables}
                                    csvColumns={csvColumns}
                                    mapping={csvMapping}
                                    onChange={updateCsvMapping}
                                    hasNameColumn={!!nameColumn}
                                    nameColumn={nameColumn}
                                    setNameColumn={setNameColumn}
                                  />

                                  {/* Quick Reply Configuration (CSV Mode) */}
                                  {selectedTemplate?.buttons?.filter(b => b.type === 'QUICK_REPLY')?.length > 0 && (
                                    <div className="animate-fadeIn mt-6 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm">
                                      <h3 className="mb-2 font-sans text-sm font-semibold text-[var(--app-pages-text)]">
                                        Quick Reply Auto-Responses
                                      </h3>
                                      <p className="mb-4 text-xs text-[var(--app-pages-text)] opacity-80">
                                        Set an automatic message to be sent when a user clicks the quick reply button.
                                      </p>
                                      <div className="space-y-4">
                                        {selectedTemplate.buttons.filter(b => b.type === 'QUICK_REPLY').map((btn, i) => (
                                          <div key={i} className="flex flex-col gap-1.5">
                                            <Label>Auto-Reply for "{btn.text}"</Label>
                                            <textarea
                                              className="w-full rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2 font-sans text-sm text-[var(--app-pages-text)] focus:border-[#4B83F3] focus:outline-none"
                                              rows={2}
                                              placeholder={`E.g., Thank you! We will get back to you.`}
                                              value={quickReplyResponses[btn.text] || ''}
                                              onChange={(e) => setQuickReplyResponses({ ...quickReplyResponses, [btn.text]: e.target.value })}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                          </div>
                        )}
                      </>
                    )}

                    {error && (
                      <div className="animate-fadeIn flex items-start gap-3 rounded-lg border-2 border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] px-4 py-3.5 font-sans text-sm text-[var(--app-debit-color)] ">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Preview */}
                  <div className="w-[320px] shrink-0">
                    <Label>Message Preview</Label>
                    <div className="sticky top-0">
                      <WhatsAppPreview
                        fromNumber={fromNumber}
                        template={selectedTemplate}
                        bodyValues={previewValues}
                      />
                      {selectedTemplate && (
                        <div className="animate-fadeIn mt-4 rounded-lg border-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4">
                          <p className="m-0 font-sans text-xs leading-relaxed text-[var(--app-pages-text)]">
                            <strong>Template:</strong> {selectedTemplate.name}
                            <br />
                            <strong>Variables:</strong>{' '}
                            {variables.length === 0 ? 'None' : variables.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Step 2: Review */
                <div className="animate-fadeIn">
                  {/* Summary Cards */}
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Recipients', value: recipients.length },
                      { label: 'From Number', value: fromNumber },
                      {
                        label: 'Template',
                        value: selectedTemplate?.name || '—',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 shadow-sm"
                      >
                        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[var(--app-pages-text)] opacity-70">
                          {item.label}
                        </div>

                        <div className="truncate text-lg font-bold text-[var(--app-pages-text)]">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <Label>All Recipients</Label>

                    <span className="rounded-full bg-[var(--app-pages-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--app-pages-text)]">
                      {recipients.length} total
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm">
                    <div className="scrollbar max-h-[400px] overflow-auto">
                      <table className="w-full border-collapse text-[13px]">
                        {/* Table Head */}
                        <thead className="sticky top-0 z-10 shadow-sm">
                          <tr className="border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] ">
                            {[
                              '#',
                              'Name',
                              'Phone',
                              ...variables.map((v) => v.label),
                            ].map((h) => (
                              <th
                                key={h}
                                className="whitespace-nowrap px-4 py-2.5 text-left font-semibold text-[var(--app-pages-text)]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody>
                          {recipients.map((r, i) => (
                            <tr
                              key={i}
                              className={`border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]`}
                            >
                              <td className="px-4 py-3 font-medium text-[var(--app-pages-text)] ">
                                {i + 1}
                              </td>

                              <td className="px-4 py-3 text-[var(--app-pages-text)] ">
                                {r.name || (
                                  <span className="text-[var(--app-pages-text)] ">
                                    —
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 font-mono text-xs text-[var(--app-pages-text)] ">
                                {r.phone}
                              </td>

                              {variables.map((v) => (
                                <td
                                  key={v.key}
                                  className="px-4 py-3 text-[var(--app-pages-text)] "
                                >
                                  {r.values[v.key] || (
                                    <span className="text-[var(--app-pages-text)] ">
                                      —
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mt-5 flex items-start gap-3 rounded-lg border-2 border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] px-4 py-3.5 text-sm text-[var(--app-debit-color)] ">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>

                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {!success && (
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 py-4">
                {step === 2 && (
                  <button
                    onClick={() => {
                      setStep(1)
                      setError('')
                    }}
                    className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-5 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    ← Back
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="cursor-pointer rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-5 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                {step === 1 ? (
                  <button
                    onClick={() => {
                      const err = validateStep1()
                      if (err) {
                        setError(err)
                        return
                      }
                      setError('')
                      setStep(2)
                    }}
                    className="cursor-pointer rounded-lg px-6 py-2 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                  >
                    Review & Send →
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={sending}
                    className={`flex items-center gap-2 rounded-lg px-6 py-2 text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sending && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        className="animate-spin"
                      >
                        <line x1="12" y1="2" x2="12" y2="6" />
                        <line x1="12" y1="18" x2="12" y2="22" />
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                        <line x1="2" y1="12" x2="6" y2="12" />
                        <line x1="18" y1="12" x2="22" y2="12" />
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                      </svg>
                    )}

                    {sending
                      ? 'Sending...'
                      : `Send to ${recipients.length} Recipients`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
