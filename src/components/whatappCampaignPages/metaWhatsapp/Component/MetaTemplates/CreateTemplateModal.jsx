import React, { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  Btn,
  FloatingInput,
  FloatingSelect,
  TabGroup,
  Divider,
  Skeleton,
  Toggle,
  Tooltip,
} from './ui/WaBaseUI'

import {
  useGetTemplatesQuery,
  useGetTemplateQuery,
  useCreateTemplateMutation,
  useSyncTemplateMutation,
  useSubmitTemplateMutation,
  useDeleteTemplateMutation,
  useUpdateTemplateMutation,
  useUploadMetaMediaMutation,
} from '@/redux/apis/metaWhatsapp.api'

import { CloseIcon, LoaderIcon } from './ui/WaIcons.jsx'
import WhatsAppPreview from './WhatsAppPreview.jsx'
import {
  CustomForm,
  ProductForm,
  CarouselForm,
  AuthenticationForm,
  UtilityForm,
  getUniqueVariables,
} from './ui/WaFormsections.jsx'
import {
  CATEGORIES,
  MARKETING_TYPES,
  LANGUAGES,
  HEADER_OPTIONS,
  createDefaultForm,
  BUTTON_TYPES,
  OTP_DELIVERY_TYPES,
  UTILITY_TYPES,
} from './constants/templateConfig.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildApiPayload = (form, numberId) => {
  const payload = {
    numberId,
    name: form.name.trim().toLowerCase().replace(/\s+/g, '_'),
    category: form.category?.toUpperCase() || CATEGORIES.MARKETING,
    language: form.language || 'en_US',
    body: form.body,
    footer: form.footer || undefined,
    allowCategoryChange: form.allowCategoryChange || false,
  }

  if (form.messageSendTtlSeconds) {
    payload.messageSendTtlSeconds = Number(form.messageSendTtlSeconds)
  }

  const vars = getUniqueVariables(form.body)
  if (
    vars.length > 0 &&
    form.bodySamples &&
    form.bodySamples.length === vars.length
  ) {
    payload.bodySamples = [form.bodySamples.slice(0, vars.length)]
  }

  if (form.header?.type && form.header.type !== 'NONE') {
    payload.header = { format: form.header.type }
    if (form.header.type === 'TEXT') {
      payload.header.text = form.header.text || ''
      const hVars = getUniqueVariables(form.header.text)
      if (
        hVars.length > 0 &&
        form.headerSamples &&
        form.headerSamples.length === hVars.length
      ) {
        payload.header.example = {
          header_text: form.headerSamples.slice(0, hVars.length),
        }
      }
    }
    if (
      ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(form.header.type) &&
      form.headerHandle
    ) {
      payload.header.headerHandle = form.headerHandle
    }
  }

  if (form.buttons?.length > 0) {
    const copyCodeButtons = form.buttons.filter(b => b.type === 'COPY_CODE')
    const urlButtons = form.buttons.filter(b => b.type === 'URL')
    const otherCtaButtons = form.buttons.filter(b => 
      b.type !== 'QUICK_REPLY' && 
      b.type !== 'COPY_CODE' && 
      b.type !== 'URL'
    )
    const qrButtons = form.buttons.filter(b => b.type === 'QUICK_REPLY')
    payload.buttons = [
      ...copyCodeButtons, 
      ...urlButtons, 
      ...otherCtaButtons, 
      ...qrButtons
    ].map(({ id, ...rest }) => rest)
  }

  if (form.category === CATEGORIES.AUTHENTICATION) {
    if (form.ttl) payload.ttl = Number(form.ttl)
    payload.authConfig = {
      addSecurityRecommendation: Boolean(
        form.authConfig?.addSecurityRecommendation
      ),
      codeExpirationMinutes: form.authConfig?.codeExpirationMinutes
        ? Number(form.authConfig.codeExpirationMinutes)
        : null,
    }
  }

  if (form.category === CATEGORIES.UTILITY) {
    if (form.utilityType) payload.utilityType = form.utilityType
  }

  if (form.category === CATEGORIES.MARKETING) {
    if (form.marketingType) payload.marketingType = form.marketingType
    if (form.marketingType === MARKETING_TYPES.LIMITED_TIME_OFFER && form.offerMessage) {
      payload.offerMessage = form.offerMessage
    }
    if (form.marketingType === MARKETING_TYPES.CAROUSEL && form.carouselCards?.length > 0) {
      payload.carouselCards = form.carouselCards.map((card, index) => {
        const { id, button1Text, button1Url, button1PhoneNumber, button2Text, button2Url, button2PhoneNumber, ...rest } = card
        const buttons = []
        if (form.carouselButton1Type && form.carouselButton1Type !== 'NONE') {
          const btn = { type: form.carouselButton1Type, text: button1Text || '' }
          if (btn.type === 'URL' && button1Url) btn.url = button1Url
          if (btn.type === 'PHONE_NUMBER' && button1PhoneNumber) btn.phoneNumber = button1PhoneNumber
          buttons.push(btn)
        }
        if (form.carouselButton2Type && form.carouselButton2Type !== 'NONE') {
          const btn = { type: form.carouselButton2Type, text: button2Text || '' }
          if (btn.type === 'URL' && button2Url) btn.url = button2Url
          if (btn.type === 'PHONE_NUMBER' && button2PhoneNumber) btn.phoneNumber = button2PhoneNumber
          buttons.push(btn)
        }
        return { ...rest, id: index + 1, buttons }
      })
      if (form.carouselHeaderType) {
        payload.header = { format: form.carouselHeaderType }
      }
    }
  }

  const isCallRequest = 
    (form.category === CATEGORIES.UTILITY && form.utilityType === UTILITY_TYPES.CALL_REQUEST_PERMISSION) ||
    (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CALL_REQUEST_PERMISSION);

  if (isCallRequest) {
    payload.buttons = [];
  }

  if (form.category !== CATEGORIES.AUTHENTICATION) {
    const isCallRequest = 
      (form.category === CATEGORIES.UTILITY && form.utilityType === UTILITY_TYPES.CALL_REQUEST_PERMISSION) ||
      (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CALL_REQUEST_PERMISSION);
      
    if (form.variableType && !isCallRequest) {
      payload.variableType = form.variableType
    }
  }

  return payload
}

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form, hasMissingSamples) => {
  const errors = {}

  if (!form.name?.trim()) {
    errors.name = 'Template name is required'
  } else if (!/^[a-z0-9_]+$/i.test(form.name.trim())) {
    errors.name =
      'Name can only contain letters, numbers, and underscores (no spaces)'
  }

  if (!form.language) {
    errors.language = 'Language is required'
  }

  if (form.category !== CATEGORIES.AUTHENTICATION) {
    if (!form.body?.trim()) {
      errors.body = 'Message body is required'
    }
  }

  if (form.header?.type === 'TEXT') {
    if (!form.header?.text?.trim()) {
      errors.headerText = 'Header text is required'
    } else {
      const text = form.header.text.trim()
      if (/\{\{\d+\}\}$/.test(text)) {
        errors.headerText = 'Header cannot end with a variable. Meta requires text or punctuation after the variable.'
      }
    }
  }

  const isCallRequestForm = 
    (form.category === CATEGORIES.UTILITY && form.utilityType === UTILITY_TYPES.CALL_REQUEST_PERMISSION) ||
    (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CALL_REQUEST_PERMISSION);

  if (isCallRequestForm && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(form.header?.type)) {
    errors.headerType = 'Header must be Text or None for Call Request Permission';
  }

  if (
    form.category === CATEGORIES.MARKETING &&
    form.marketingType === MARKETING_TYPES.LIMITED_TIME_OFFER &&
    !form.offerMessage?.trim()
  ) {
    errors.offerMessage = 'The offer field is required'
  }

  if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(form.header?.type)) {
    if (!form.headerHandle) {
      errors.headerMedia = `A media file is required for ${form.header.type} header`
    }
  }

  if (hasMissingSamples) {
    errors.bodySamples = 'All variables must have an example value.'
  }

  if (
    form.marketingType === MARKETING_TYPES.CAROUSEL &&
    form.category === CATEGORIES.MARKETING
  ) {
    if (!form.carouselCards || form.carouselCards.length < 2) {
      errors.carousel = 'Carousel templates require at least 2 cards'
    } else {
      const isMediaHeader = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(form.carouselHeaderType)
      const invalidCards = form.carouselCards.filter((card) => {
        if (isMediaHeader && !card.headerHandle) return true
        return false
      })
      if (invalidCards.length > 0) {
        errors.carouselCards = `All cards must have a media file uploaded for ${form.carouselHeaderType} header.`
      }
    }
  }

  return errors
}

// ─── Media Upload Button ──────────────────────────────────────────────────────
export const MediaUploadButton = ({
  numberId,
  mediaType,
  onUploaded,
  uploading,
  setUploading,
  currentHandle,
}) => {
  const inputRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [uploadMetaMedia] = useUploadMetaMediaMutation()

  const acceptMap = {
    IMAGE: 'image/png,image/jpeg,image/webp',
    VIDEO: 'video/mp4',
    DOCUMENT: 'application/pdf',
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setFileName(file.name)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('numberId', numberId)
      formData.append('media', file)

      const result = await uploadMetaMedia(formData).unwrap()
      if (result.success && result.header_handle) {
        onUploaded(result.header_handle)
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (err) {
      console.error('❌ Media upload failed:', err)
      setError(
        err?.data?.message || err?.message || 'Upload failed. Please try again.'
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        accept={acceptMap[mediaType] || '*'}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Btn
          variant="secondary"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          icon={uploading ? <LoaderIcon size={13} /> : null}
        >
          {uploading
            ? 'Uploading…'
            : currentHandle
              ? 'Replace Media'
              : `Upload ${mediaType}`}
        </Btn>

        {currentHandle && !uploading && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {fileName || 'Uploaded'}
          </span>
        )}

        {!currentHandle && fileName && !uploading && (
          <span className="text-xs text-slate-500">{fileName}</span>
        )}
      </div>

      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}

      <p className="mt-1 text-[11px] text-slate-500">
        {mediaType === 'IMAGE' && 'Accepted: PNG, JPG, WEBP (max 5 MB)'}
        {mediaType === 'VIDEO' && 'Accepted: MP4 (max 16 MB)'}
        {mediaType === 'DOCUMENT' && 'Accepted: PDF (max 10 MB)'}
      </p>
      <p className="mt-0.5 text-[11px] italic text-slate-600">
        Note: Media is attached at send time, not stored with the template.
      </p>
    </div>
  )
}

// ─── Language Tab Bar ─────────────────────────────────────────────────────────
const LanguageTabs = ({ language, onChange, disabled }) => {
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
        {LANGUAGES.find((l) => l.code === language)?.label || language}
      </div>

      {!adding && !disabled && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-transparent text-base text-slate-500 transition-colors hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
          title="Change language"
        >
          ±
        </button>
      )}

      {adding && !disabled && (
        <select
          autoFocus
          value={language}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value)
              setAdding(false)
            }
          }}
          onBlur={() => setAdding(false)}
          className="h-8 rounded-lg border border-emerald-500 bg-white dark:bg-slate-900 px-2 text-[13px] text-slate-900 dark:text-slate-100 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="">Select language…</option>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label} ({l.code})
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

// ─── Modal Header ─────────────────────────────────────────────────────────────
const ModalHeader = ({ title, onClose }) => (
  <div className="flex shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
    <div className="flex items-center gap-2.5">
      <h2 className="m-0 text-[16px] font-bold text-slate-900 dark:text-slate-100">{title}</h2>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
    >
      <CloseIcon size={18} />
    </button>
  </div>
)

// ─── Modal Footer ─────────────────────────────────────────────────────────────
const ModalFooter = ({
  onCancel,
  onAddSample,
  onSave,
  saving,
  hasMissingSamples,
  varsCount,
}) => (
  <div className="flex shrink-0 items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-6 py-4">
    <div>
      {varsCount > 0 && (
        <div className="flex items-center gap-3">
          <span
            className={`text-[13px] font-medium ${hasMissingSamples ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
          >
            {hasMissingSamples
              ? 'Add sample values'
              : 'Samples provided'}
          </span>
          <Btn
            variant={hasMissingSamples ? 'primary' : 'secondary'}
            size="sm"
            onClick={onAddSample}
          >
            {hasMissingSamples ? 'Add Samples Required' : 'Edit Samples'}
          </Btn>
        </div>
      )}
    </div>
    <div className="flex items-center gap-3">
      <Btn variant="ghost" onClick={onCancel} size="md">
        Cancel
      </Btn>
      <Btn
        variant="primary"
        onClick={onSave}
        disabled={saving || hasMissingSamples}
        size="md"
        icon={saving ? <LoaderIcon size={14} color="#fff" /> : null}
      >
        {saving ? 'Saving…' : 'Save & Submit'}
      </Btn>
    </div>
  </div>
)

// ─── Samples Modal ────────────────────────────────────────────────────────────
const SamplesModal = ({
  open,
  onClose,
  bodyVars,
  headerVars,
  urlButtonsWithVars,
  bodySamples,
  headerSamples,
  onBodyChange,
  onHeaderChange,
  buttons,
  onButtonsChange,
}) => {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-black/40 dark:bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex w-[420px] animate-[fadeIn_0.15s_ease_forwards] flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-5 py-4">
          <h3 className="m-0 text-[15px] font-bold text-slate-800 dark:text-slate-100">
            Provide Sample Values
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-slate-600"
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto bg-white p-6">
          <p className="m-0 text-[13px] leading-relaxed text-slate-600">
            Meta requires an example value for each variable in your template to
            review them properly.
          </p>

          {headerVars.length > 0 && (
            <div className="flex flex-col gap-4">
              <h4 className="m-0 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Header Variables
              </h4>
              {headerVars.map((v, i) => (
                <FloatingInput
                  key={`h-${v}`}
                  label={`Example for Header {{${v}}} *`}
                  value={headerSamples[i] || ''}
                  onChange={(e) => {
                    const newSamples = [...headerSamples]
                    newSamples[i] = e.target.value
                    onHeaderChange(newSamples)
                  }}
                  placeholder="e.g. Summer Sale"
                />
              ))}
            </div>
          )}

          {bodyVars.length > 0 && (
            <div className="flex flex-col gap-4">
              <h4 className="m-0 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                Body Variables
              </h4>
              {bodyVars.map((v, i) => (
                <FloatingInput
                  key={`b-${v}`}
                  label={`Example for Body {{${v}}} *`}
                  value={bodySamples[i] || ''}
                  onChange={(e) => {
                    const newSamples = [...bodySamples]
                    newSamples[i] = e.target.value
                    onBodyChange(newSamples)
                  }}
                  placeholder="e.g. John, 50%, etc."
                />
              ))}
            </div>
          )}

          {urlButtonsWithVars?.length > 0 && (
            <div className="flex flex-col gap-4">
              <h4 className="m-0 text-[12px] font-bold uppercase tracking-wider text-slate-500">
                URL Button Variables
              </h4>
              {urlButtonsWithVars.map((b, i) => (
                <FloatingInput
                  key={`btn-${b.id || i}`}
                  label={`Example for Button "${b.text || 'URL'}" *`}
                  value={b.example?.[0] || ''}
                  onChange={(e) => {
                    const newBtns = buttons.map((btn) =>
                      btn.id === b.id
                        ? { ...btn, example: [e.target.value] }
                        : btn
                    )
                    onButtonsChange(newBtns)
                  }}
                  placeholder="e.g. user-12345"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <Btn variant="primary" onClick={onClose}>
            Done
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ─── Top Row (Name / Category / TTL) ─────────────────────────────────────────
const TopRow = ({ form, setField, errors, isEdit }) => (
  <div className="flex shrink-0 flex-row flex-wrap items-start gap-4 border-b border-slate-200 bg-white px-6 py-4">
    <div className="w-[300px] shrink-0">
      <FloatingInput
        label="Name *"
        value={form.name}
        onChange={(e) => setField('name', e.target.value)}
        error={errors.name}
        disabled={isEdit}
      />
    </div>
    <div className="w-[180px] shrink-0">
      <FloatingSelect
        label="Category"
        value={form.category}
        onChange={(e) => setField('category', e.target.value)}
        options={[
          { label: 'Utility', value: CATEGORIES.UTILITY },
          { label: 'Marketing', value: CATEGORIES.MARKETING },
          { label: 'Authentication', value: CATEGORIES.AUTHENTICATION },
        ]}
      />
    </div>

    <div className="w-[180px] shrink-0 relative flex items-center">
      <FloatingInput
        label="TTL (seconds)"
        value={form.category === CATEGORIES.AUTHENTICATION ? form.ttl : form.messageSendTtlSeconds}
        onChange={(e) => {
          if (form.category === CATEGORIES.AUTHENTICATION) {
            setField('ttl', e.target.value)
          } else {
            setField('messageSendTtlSeconds', e.target.value)
          }
        }}
        type="number"
        suffix={
          <Tooltip content="Time To Live in seconds for the message">
            <span style={{ color: 'var(--text-light)', cursor: 'help', paddingRight: '4px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </span>
          </Tooltip>
        }
      />
    </div>
  </div>
)

// ─── Header Media Section ─────────────────────────────────────────────────────
const HeaderMediaSection = ({ form, setField, numberId, errors }) => {
  const [uploading, setUploading] = useState(false)

  const mediaFormat = (form.header?.type || '').toUpperCase()
  if (!['IMAGE', 'VIDEO', 'DOCUMENT'].includes(mediaFormat)) return null

  const handleUploaded = (handle) => {
    setField('headerHandle', handle)
  }

  return (
    <div className="py-4">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {mediaFormat} Sample
        <span className="ml-1.5 font-normal normal-case text-slate-500">
          (optional — attached at send time)
        </span>
      </label>
      <MediaUploadButton
        numberId={numberId}
        mediaType={mediaFormat}
        onUploaded={handleUploaded}
        uploading={uploading}
        setUploading={setUploading}
        currentHandle={form.headerHandle}
      />
      {errors.headerMedia && (
        <p className="mt-1 text-xs text-red-500">{errors.headerMedia}</p>
      )}
    </div>
  )
}

// ─── CreateTemplateModal ──────────────────────────────────────────────────────
const CreateTemplateModal = ({
  open,
  onClose,
  onSave,
  initialData,
  numberId,
}) => {
  const [form, setForm] = useState(() =>
    initialData ? mapDocToForm(initialData) : createDefaultForm()
  )
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false)

  // Sync form state when modal opens or initialData changes
  React.useEffect(() => {
    if (open) {
      setForm(initialData ? mapDocToForm(initialData) : createDefaultForm())
      setErrors({})
    }
  }, [open, initialData])

  const [createTemplate] = useCreateTemplateMutation()
  const [updateTemplate] = useUpdateTemplateMutation()
  const [submitTemplate] = useSubmitTemplateMutation()

  const setField = useCallback(
    (key, value) => {
      setForm((f) => ({ ...f, [key]: value }))
      if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
    },
    [errors]
  )

  const handleSetField = useCallback(
    (key, value) => {
      if (key === 'category') {
        const newForm = {
          ...createDefaultForm(),
          name: form.name,
          language: form.language,
          category: value,
        }
        if (value === CATEGORIES.AUTHENTICATION) {
          newForm.buttons = [
            {
              id: Date.now(),
              type: BUTTON_TYPES.OTP,
              otpType: OTP_DELIVERY_TYPES.COPY_CODE,
              text: 'Copy code',
            },
          ]
        }
        setForm(newForm)
      } else if (key === 'marketingType') {
        setForm((f) => ({
          ...createDefaultForm(),
          name: f.name,
          language: f.language,
          category: f.category,
          marketingType: value,
        }))
      } else if (key === 'headerFormat') {
        setForm((f) => ({
          ...f,
          header: { format: value, text: '' },
          headerHandle: null,
        }))
      } else if (key === 'headerText') {
        setForm((f) => ({
          ...f,
          header: { ...f.header, text: value },
        }))
      } else if (key === 'utilityType') {
        setForm((f) => {
          const newForm = { ...f, utilityType: value }
          if (value === UTILITY_TYPES.CALL_REQUEST_PERMISSION) {
            newForm.buttons = []
          }
          return newForm
        })
      } else {
        setField(key, value)
      }
    },
    [setField]
  )

  const handleSave = async () => {
    const newErrors = validate(form, hasMissingSamples)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstError = Object.values(newErrors)[0]
      toast.error(firstError)
      return
    }
    setSaving(true)

    try {
      let result

      if (initialData?._id) {
        const targetNumberId =
          initialData.numberId?._id || initialData.numberId || numberId
        const payload = buildApiPayload(form, targetNumberId)
        await updateTemplate({ id: initialData._id, ...payload }).unwrap()
        result = await submitTemplate(initialData._id).unwrap()
        console.log(
          '%c✅ Updated and Resubmitted to Meta:',
          'color:#16a34a;font-weight:600',
          result
        )
      } else {
        if (!numberId)
          throw new Error('numberId is required to create a template')

        console.log("form - ",form)
        const payload = buildApiPayload(form, numberId)
        console.log("payload - ",payload)
        result = await createTemplate(payload).unwrap()
        console.log(
          '%c✅ Template created:',
          'color:#16a34a;font-weight:600',
          result
        )
        result = await submitTemplate(result.data?._id).unwrap()
        console.log(
          '%c✅ Template created + submitted to Meta:',
          'color:#16a34a;font-weight:600',
          result
        )
      }

      onSave?.(form, result)
      handleClose()
    } catch (err) {
      console.error(
        '%c❌ Save / submit failed:',
        'color:#dc2626;font-weight:600',
        err
      )
      toast.error(
        err?.data?.message ||
          err?.message ||
          'Submission failed. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setForm(createDefaultForm())
    setErrors({})
    onClose?.()
  }
  

  if (!open) return null

  const bodyVars = getUniqueVariables(form.body || '')
  const hasMissingBodySamples =
    bodyVars.length > 0 &&
    bodyVars.some((_, i) => !form.bodySamples?.[i]?.trim())

  const headerVars =
    form.header?.type === 'TEXT'
      ? getUniqueVariables(form.header?.text || '')
      : []
  const hasMissingHeaderSamples =
    headerVars.length > 0 &&
    headerVars.some((_, i) => !form.headerSamples?.[i]?.trim())

  const urlButtonsWithVars = (form.buttons || []).filter(
    (b) => b.type === 'URL' && (b.url || '').includes('{{1}}')
  )
  const hasMissingButtonSamples =
    urlButtonsWithVars.length > 0 &&
    urlButtonsWithVars.some((b) => !b.example?.[0]?.trim())

  const hasMissingSamples =
    hasMissingBodySamples || hasMissingHeaderSamples || hasMissingButtonSamples
  const totalVarsCount =
    bodyVars.length + headerVars.length + urlButtonsWithVars.length

  const renderForm = () => {
    if (form.category === CATEGORIES.AUTHENTICATION)
      return (
        <AuthenticationForm
          form={form}
          setField={handleSetField}
          errors={errors}
        />
      )

    if (form.category === CATEGORIES.UTILITY)
      return (
        <UtilityForm form={form} setField={handleSetField} errors={errors} />
      )

    if (form.category === CATEGORIES.MARKETING) {
      if (form.marketingType === MARKETING_TYPES.PRODUCT)
        return (
          <ProductForm form={form} setField={handleSetField} errors={errors} />
        )
      if (form.marketingType === MARKETING_TYPES.CAROUSEL)
        return (
          <CarouselForm form={form} setField={handleSetField} errors={errors} numberId={numberId} />
        )
    }

    return <CustomForm form={form} setField={handleSetField} errors={errors} />
  }

  const showPreview =
    form.category === CATEGORIES.AUTHENTICATION ||
    (form.category === CATEGORIES.MARKETING &&
      form.marketingType === MARKETING_TYPES.CAROUSEL) ||
    (form.category === CATEGORIES.MARKETING &&
      form.marketingType === MARKETING_TYPES.PRODUCT)

  const needsMediaUpload = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(
    (form.header?.type || '').toUpperCase()
  )

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 dark:bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        style={{ maxHeight: '94vh' }}
      >
        <ModalHeader
          title={initialData ? 'Edit Template' : 'Create Template'}
          onClose={handleClose}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            {/* ── Main form area ── */}
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 min-w-0">
              <div className="mb-2">
                <TopRow form={form} setField={handleSetField} errors={errors} isEdit={Boolean(initialData?._id)} />
                <LanguageTabs
                  language={form.language}
                  onChange={(lang) => handleSetField('language', lang)}
                  disabled={Boolean(initialData?._id)}
                />
              </div>

              <div className="px-6 py-4">
                {renderForm()}

                {needsMediaUpload && (
                  <div className="py-4">
                    <HeaderMediaSection
                      form={form}
                      setField={handleSetField}
                      numberId={numberId}
                      errors={errors}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── Preview panel ── */}
            <div className="flex w-[380px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Preview
              </p>
              <WhatsAppPreview form={form} />
            </div>
          </div>
        </div>

        <ModalFooter
          onCancel={handleClose}
          onAddSample={() => setIsSampleModalOpen(true)}
          onSave={handleSave}
          saving={saving}
          hasMissingSamples={hasMissingSamples}
          varsCount={totalVarsCount}
        />

        <SamplesModal
          open={isSampleModalOpen}
          onClose={() => setIsSampleModalOpen(false)}
          bodyVars={bodyVars}
          headerVars={headerVars}
          urlButtonsWithVars={urlButtonsWithVars}
          bodySamples={form.bodySamples || []}
          headerSamples={form.headerSamples || []}
          onBodyChange={(samples) => handleSetField('bodySamples', samples)}
          onHeaderChange={(samples) => handleSetField('headerSamples', samples)}
          buttons={form.buttons || []}
          onButtonsChange={(btns) => handleSetField('buttons', btns)}
        />
      </div>
    </div>
  )
}

// ─── Map saved template doc → form state (edit mode) ─────────────────────────
const mapDocToForm = (doc) => ({
  ...createDefaultForm(),
  name: doc.name || '',
  category: (doc.category || CATEGORIES.MARKETING).toUpperCase(),
  language: doc.language || 'en_US',
  body: doc.body || '',
  footer: doc.footer || '',
  header: doc.header || { format: 'NONE', text: '' },
  buttons: (doc.buttons || []).map((b, i) => ({ ...b, id: Date.now() + i })),
  ttl: doc.ttl || '',
  authConfig: doc.authConfig || {
    addSecurityRecommendation: false,
    codeExpirationMinutes: '',
  },
  bodySamples: doc.bodySamples?.[0] || [],
  messageSendTtlSeconds: doc.messageSendTtlSeconds || '',
  allowCategoryChange: doc.allowCategoryChange || false,
  headerHandle: null,
  metaTemplateId: doc.metaTemplateId || null,
})

export default CreateTemplateModal
