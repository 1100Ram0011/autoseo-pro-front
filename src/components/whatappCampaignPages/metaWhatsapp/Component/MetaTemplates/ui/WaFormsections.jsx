import React, { useRef, useState } from 'react'
import {
  FormField,
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  TabGroup,
  Checkbox,
  Btn,
  Tooltip,
} from './WaBaseUI'
import { PlusIcon, TrashIcon, InfoIcon } from './WaIcons'
import BodyToolbar from './WaBodyToolbar'
import ButtonSection, { AddButtonDropdown } from './WaButtonsection'
import { MediaUploadButton } from '../CreateTemplateModal'
import {
  CATEGORIES,
  MARKETING_TYPES,
  PRODUCT_FORMATS,
  CAROUSEL_HEADER_TYPES,
  BUTTON_TYPES,
  createCarouselCard,
  UTILITY_TYPES,
  OTP_DELIVERY_TYPES,
} from '../constants/templateConfig'

/* ─────────────────────────────────────────────────────────────────────────────
   CONSTANTS — header type options aligned to schema enum
   schema: header.type ∈ { TEXT, IMAGE, VIDEO, DOCUMENT, LOCATION, NONE }
──────────────────────────────────────────────────────────────────────────────*/
const HEADER_TYPE_OPTIONS = [
  { value: 'NONE', label: 'None' },
  { value: 'TEXT', label: 'Text' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'LOCATION', label: 'Location' },
]

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER: next {{n}} variable index from existing text
──────────────────────────────────────────────────────────────────────────────*/
const getNextVariableIndex = (text = '') => {
  const matches = text.match(/\{\{(\d+)\}\}/g)
  if (!matches) return 1
  const numbers = matches.map((m) => parseInt(m.replace(/[{}]/g, ''), 10))
  return Math.max(...numbers) + 1
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER: get unique variables from text
──────────────────────────────────────────────────────────────────────────────*/
export const getUniqueVariables = (text = '') => {
  const matches = text.match(/\{\{(\d+)\}\}/g)
  if (!matches) return []
  const numbers = [
    ...new Set(matches.map((m) => parseInt(m.replace(/[{}]/g, ''), 10))),
  ]
  return numbers.sort((a, b) => a - b)
}

export const getNextGlobalVariableIndex = (text) => {
  return getNextVariableIndex(text)
}

/* ─────────────────────────────────────────────────────────────────────────────
   MEDIA STATUS BADGE
   Shows upload status for IMAGE / VIDEO / DOCUMENT header types.
   Actual file upload is handled by HeaderMediaSection in CreateTemplateModal.
──────────────────────────────────────────────────────────────────────────────*/
const MediaStatusBadge = ({ mediaUrl, headerType }) => {
  const hintMap = {
    IMAGE: 'PNG, JPG or WEBP — max 5 MB',
    VIDEO: 'MP4 — max 16 MB',
    DOCUMENT: 'PDF — max 10 MB',
  }

  return (
    <div
      style={{
        marginTop: 10,
        padding: '10px 14px',
        background: mediaUrl ? '#f0fdf4' : '#eff6ff',
        border: `1.5px ${mediaUrl ? 'solid #bbf7d0' : 'dashed #93c5fd'}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      {mediaUrl ? (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            style={{ marginTop: 1, flexShrink: 0 }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: '#15803d',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {headerType} uploaded — ready to submit
          </p>
        </>
      ) : (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            style={{ marginTop: 1, flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: '#2563eb',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {headerType} sample required
            </p>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 12,
                color: '#6b7280',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {hintMap[headerType]} — use the upload button below the form.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER SECTION
   Matches screenshots 1 & 2:
     • Single dropdown: None / Text / Image / Video / Document / Location
     • TEXT   → inline text input + "Add Variable" button
     • MEDIA  → MediaStatusBadge (upload handled in modal footer area)
     • LOCATION → info note only

   Schema writes to: form.header = { type, text?, mediaUrl? }
──────────────────────────────────────────────────────────────────────────────*/
const HeaderSection = ({ form, setField, allowedOptions = HEADER_TYPE_OPTIONS }) => {
  const headerType = form.header?.type || 'NONE'

  const handleTypeChange = (e) => {
    const t = e.target.value
    if (t === 'NONE') return setField('header', { type: 'NONE' })
    if (t === 'TEXT')
      return setField('header', { type: 'TEXT', text: form.header?.text || '' })
    if (t === 'LOCATION') return setField('header', { type: 'LOCATION' })
    // IMAGE / VIDEO / DOCUMENT — clear mediaUrl when switching type
    setField('header', { type: t, mediaUrl: '' })
  }

  const isMedia = ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType)

  return (
    <FormField
      label="Header"
      optional
      description="Add a title or choose which type of media you'll use for this header."
    >
      <div className="flex w-full flex-wrap items-start gap-4">
        {/* ── Header Type dropdown ── */}
        <div className="w-[140px] shrink-0">
          <FloatingSelect
            label="Header Type"
            value={headerType}
            onChange={handleTypeChange}
            options={allowedOptions}
          />
        </div>

        {/* ── TEXT: inline input + Add Variable ── */}
        {headerType === 'TEXT' && (
          <>
            <FloatingInput
              label="Header Text"
              value={form.header?.text || ''}
              onChange={(e) =>
                setField('header', { ...form.header, text: e.target.value })
              }
              style={{ flex: 1 }}
            />
            <div
              style={{ display: 'flex', alignItems: 'center', paddingTop: 22 }}
            >
              <button
                type="button"
                disabled={!!(form.header?.text || '').match(/\{\{\d+\}\}/)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: (form.header?.text || '').match(/\{\{\d+\}\}/)
                    ? 'not-allowed'
                    : 'pointer',
                  color: (form.header?.text || '').match(/\{\{\d+\}\}/)
                    ? 'var(--text-light)'
                    : 'var(--blue)',
                  opacity: (form.header?.text || '').match(/\{\{\d+\}\}/)
                    ? 0.5
                    : 1,
                  fontSize: 12,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  whiteSpace: 'nowrap',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'color 0.15s, opacity 0.15s',
                }}
                onClick={() => {
                  if ((form.header?.text || '').match(/\{\{\d+\}\}/)) return
                  const next = getNextVariableIndex(form.header?.text)
                  setField('header', {
                    ...form.header,
                    text: (form.header?.text || '') + `{{${next}}}`,
                  })
                }}
              >
                <PlusIcon size={11} /> Add Variable
              </button>
              <Tooltip content="Header supports maximum 1 variable. Variables are sequentially numbered across the template.">
                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'none',
                    marginLeft: 4,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--text-light)',
                  }}
                >
                  <InfoIcon size={13} />
                </button>
              </Tooltip>
            </div>
          </>
        )}
      </div>

      {/* ── MEDIA: upload status badge ── */}
      {isMedia && (
        <MediaStatusBadge
          headerType={headerType}
          mediaUrl={form.header?.mediaUrl}
        />
      )}

      {/* ── LOCATION: info note ── */}
      {headerType === 'LOCATION' && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 14px',
            background: '#eff6ff',
            border: '1.5px solid #bfdbfe',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            style={{ marginTop: 1, flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              color: '#4b5563',
              lineHeight: 1.5,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            The location header displays a map pin in the message. No additional
            input is required here.
          </p>
        </div>
      )}
    </FormField>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED BODY + FOOTER BLOCK  (preserved exactly from original + samples)
──────────────────────────────────────────────────────────────────────────────*/
export const BodyFooterBlock = ({
  form,
  onBodyChange,
  footer,
  onFooterChange,
  errors = {},
}) => {
  const bodyRef = useRef(null)

  return (
    <>
      <FormField
        label="Body"
        description="Enter the text for your message in the language that you've selected."
      >
        <FloatingTextarea
          ref={bodyRef}
          value={form.body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Enter text in English"
          minHeight={110}
          error={errors.body}
          toolbar={
            <BodyToolbar
              value={form.body}
              onChange={onBodyChange}
              textareaRef={bodyRef}
              showInfo
              nextIndex={getNextVariableIndex(form.body)}
            />
          }
        />
      </FormField>

      <FormField
        label="Footer"
        optional
        description="Add a short line of text to the bottom of your message template."
      >
        <FloatingInput
          value={footer}
          onChange={(e) => onFooterChange(e.target.value)}
          placeholder="Enter text in English"
        />
      </FormField>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CUSTOM FORM  (MARKETING custom + UTILITY)
──────────────────────────────────────────────────────────────────────────────*/
export const CustomForm = ({ form, setField, errors }) => (
  <>
    {/* Marketing sub-type tabs */}
    {form.category === CATEGORIES.MARKETING && (
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            margin: '0 0 10px',
            fontFamily: "'DM Sans', sans-serif",
            marginBottom : 10
          }}
        >
          Send promotions or information about your products, services or
          business.
        </p>
        <TabGroup
          value={form.marketingType}
          onChange={(v) => setField('marketingType', v)}
          tabs={[
            {
              value: MARKETING_TYPES.CUSTOM,
              label: 'Custom',
              info: 'Create a custom marketing message',
            },
            {
              value: MARKETING_TYPES.PRODUCT,
              label: 'Product',
              info: 'Showcase your products',
            },
            {
              value: MARKETING_TYPES.CAROUSEL,
              label: 'Carousel',
              info: 'Display multiple cards',
            },
            {
              value: MARKETING_TYPES.LIMITED_TIME_OFFER,
              label: 'Limited Time Offer',
              info: 'Send an offer with expiration',
            },
            {
              value: MARKETING_TYPES.CALL_REQUEST_PERMISSION,
              label: 'Call Request Permission',
              info: 'Request permission to call',
            },
          ]}
        />
        
        {form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.LIMITED_TIME_OFFER && (
          <div style={{ marginTop: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
              Limited Time Offer <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Note: We need the copy offer code as the first button and visit website as the second button )</span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              Add a short message with an expiration for the offer.
            </p>
            <FloatingInput
              label="Offer message*"
              value={form.offerMessage || ''}
              onChange={(e) => setField('offerMessage', e.target.value)}
              error={errors.offerMessage}
            />
          </div>
        )}
        
        {form.category === CATEGORIES.MARKETING &&
          (form.marketingType === MARKETING_TYPES.CUSTOM ||
           form.marketingType === MARKETING_TYPES.LIMITED_TIME_OFFER) && (
          <div
            style={{
              marginTop: 36,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ width: '180px' }}>
              <FloatingSelect
                label="Variable Type"
                value={form.variableType || 'NUMBER'}
                onChange={(e) => setField('variableType', e.target.value)}
                options={[
                  { value: 'NUMBER', label: 'Number' },
                  { value: 'TEXT', label: 'Text' },
                ]}
              />
            </div>
            <Tooltip content="Choose the type of variable format">
              <span style={{ color: 'var(--text-light)', cursor: 'help' }}>
                <InfoIcon size={14} />
              </span>
            </Tooltip>
          </div>
        )}
      </div>
    )}

    {/* Header — updated component with schema alignment */}
    <HeaderSection 
      form={form} 
      setField={setField} 
      allowedOptions={
        form.marketingType === MARKETING_TYPES.LIMITED_TIME_OFFER 
          ? [
              { value: 'IMAGE', label: 'Image' },
              { value: 'VIDEO', label: 'Video' }
            ]
          : form.marketingType === MARKETING_TYPES.CALL_REQUEST_PERMISSION
          ? [
              { value: 'NONE', label: 'None' },
              { value: 'TEXT', label: 'Text' }
            ]
          : undefined
      }
    />

    {/* Body + Footer — original unchanged */}
    <BodyFooterBlock
      form={form}
      onBodyChange={(v) => setField('body', v)}
      footer={form.footer}
      onFooterChange={(v) => setField('footer', v)}
      errors={errors}
    />

    {/* Buttons — conditionally rendered */}
    {form.marketingType !== MARKETING_TYPES.CALL_REQUEST_PERMISSION && (
      <ButtonSection
        buttons={form.buttons}
        onChange={(btns) => setField('buttons', btns)}
        enableClickCount={form.enableClickCount}
        onToggleClickCount={(v) => setField('enableClickCount', v)}
        nextIndex={1}
        allowedTypes={['QUICK_REPLY', 'PHONE_NUMBER', 'URL', 'COPY_CODE']}
      />
    )}
  </>
)

/* ─────────────────────────────────────────────────────────────────────────────
   PRODUCT FORM  (MARKETING + PRODUCT)
──────────────────────────────────────────────────────────────────────────────*/
export const ProductForm = ({ form, setField, errors }) => {
  const isMultiProduct = form.productFormat === PRODUCT_FORMATS.MULTI_PRODUCT

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            margin: '0 0 10px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Send promotions or information about your products, services or
          business.
        </p>
        <TabGroup
          value={form.marketingType}
          onChange={(v) => setField('marketingType', v)}
          tabs={[
            {
              value: MARKETING_TYPES.CUSTOM,
              label: 'Custom',
              info: 'Create a custom marketing message',
            },
            {
              value: MARKETING_TYPES.PRODUCT,
              label: 'Product',
              info: 'Showcase your products',
            },
            {
              value: MARKETING_TYPES.CAROUSEL,
              label: 'Carousel',
              info: 'Display multiple cards',
            },
            {
              value: MARKETING_TYPES.LIMITED_TIME_OFFER,
              label: 'Limited Time Offer',
              info: 'Send an offer with expiration',
            },
            {
              value: MARKETING_TYPES.CALL_REQUEST_PERMISSION,
              label: 'Call Request Permission',
              info: 'Request permission to call',
            },
          ]}
        />
      </div>

      <FormField
        label="Template Format"
        description="Choose the message format that best fits your needs."
      >
        <TabGroup
          value={form.productFormat}
          onChange={(v) => setField('productFormat', v)}
          tabs={[
            {
              value: PRODUCT_FORMATS.CATALOGUE,
              label: 'Catalogue',
              info: 'Show your full product catalogue',
            },
            {
              value: PRODUCT_FORMATS.SINGLE_PRODUCT,
              label: 'Single Product',
              info: 'Showcase a single product',
            },
            {
              value: PRODUCT_FORMATS.MULTI_PRODUCT,
              label: 'Multi-product',
              info: 'Showcase multiple specific products',
            },
          ]}
        />
      </FormField>

      <div
        style={{
          marginTop: 16,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ width: '180px' }}>
          <FloatingSelect
            label="Variable Type"
            value={form.variableType || 'NUMBER'}
            onChange={(e) => setField('variableType', e.target.value)}
            options={[
              { value: 'NUMBER', label: 'Number' },
              { value: 'TEXT', label: 'Text' },
            ]}
          />
        </div>
        <Tooltip content="Choose the type of variable format">
          <span style={{ color: 'var(--text-light)', cursor: 'help' }}>
            <InfoIcon size={14} />
          </span>
        </Tooltip>
      </div>

      {isMultiProduct && (
        <FormField
          label="Header"
          optional
          description="Add a title for header."
        >
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 100 }}>
              <FloatingSelect
                label="Header Type"
                value="TEXT"
                onChange={() => {}}
                options={[{ value: 'TEXT', label: 'Text' }]}
              />
            </div>
            <FloatingInput
              label="Enter text in English"
              value={form.header?.text || ''}
              onChange={(e) =>
                setField('header', { type: 'TEXT', text: e.target.value })
              }
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <button
              type="button"
              disabled={!!(form.header?.text || '').match(/\{\{\d+\}\}/)}
              style={{
                border: 'none',
                background: 'none',
                cursor: (form.header?.text || '').match(/\{\{\d+\}\}/)
                  ? 'not-allowed'
                  : 'pointer',
                color: (form.header?.text || '').match(/\{\{\d+\}\}/)
                  ? 'var(--text-light)'
                  : 'var(--blue)',
                opacity: (form.header?.text || '').match(/\{\{\d+\}\}/)
                  ? 0.5
                  : 1,
                fontSize: 12,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onClick={() => {
                if ((form.header?.text || '').match(/\{\{\d+\}\}/)) return
                const next = getNextVariableIndex(form.header?.text)
                setField('header', {
                  type: 'TEXT',
                  text: (form.header?.text || '') + `{{${next}}}`,
                })
              }}
            >
              <PlusIcon size={11} /> Add Variable
            </button>
          </div>
        </FormField>
      )}

      <BodyFooterBlock
        form={form}
        onBodyChange={(v) => setField('body', v)}
        footer={form.footer}
        onFooterChange={(v) => setField('footer', v)}
        errors={errors}
      />

      {/* <ButtonSection
        buttons={form.buttons}
        onChange={(btns) => setField('buttons', btns)}
        enableClickCount={form.enableClickCount}
        onToggleClickCount={(v) => setField('enableClickCount', v)}
        nextIndex={1}
        allowedTypes={isMultiProduct ? ['MPM'] : ['CATALOG']}
      /> */}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CAROUSEL CARD  (preserved exactly from original)
──────────────────────────────────────────────────────────────────────────────*/
const CarouselCard = ({
  card,
  index,
  onChange,
  onDelete,
  button1Type,
  button2Type,
  headerType,
  numberId
}) => {
  const bodyRef = useRef(null)
  const body = card.body || ''
  const setBody = (val) => onChange({ ...card, body: val })
  const [uploading, setUploading] = useState(false)

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Card {index + 1}
        </span>
        <button
          type="button"
          onClick={onDelete}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#bbb',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#bbb')}
        >
          <TrashIcon size={13} color="currentColor" />
        </button>
      </div>

      <div style={{ padding: 14 }}>
        {headerType && headerType !== 'NONE' && (
          <div style={{ marginBottom: 12 }}>
            <MediaUploadButton
              numberId={numberId}
              mediaType={headerType}
              uploading={uploading}
              setUploading={setUploading}
              currentHandle={card.headerHandle}
              onUploaded={(handle) => onChange({ ...card, headerHandle: handle })}
            />
          </div>
        )}

        <FormField
          label="Body"
          description="Enter the text for your message in the language that you've selected."
        >
          <FloatingTextarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter text in English"
            minHeight={70}
            toolbar={
              <BodyToolbar
                value={body}
                onChange={setBody}
                textareaRef={bodyRef}
              />
            }
          />
        </FormField>

        {button1Type && button1Type !== BUTTON_TYPES.NONE && (
          <div style={{ padding: 16, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              Button 1: {
                button1Type === BUTTON_TYPES.QUICK_REPLY ? 'Quick Reply' :
                button1Type === BUTTON_TYPES.URL ? 'Visit Website' :
                button1Type === BUTTON_TYPES.PHONE_NUMBER ? 'Call Phone Number' : button1Type
              }
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: button1Type === BUTTON_TYPES.QUICK_REPLY ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <FloatingInput
                label="Button Text *"
                value={card.button1Text || ''}
                onChange={(e) => onChange({ ...card, button1Text: e.target.value })}
              />
              {button1Type === BUTTON_TYPES.URL && (
                <FloatingInput
                  label="URL *"
                  value={card.button1Url || ''}
                  onChange={(e) => onChange({ ...card, button1Url: e.target.value })}
                  placeholder="https://www.example.com"
                />
              )}
              {button1Type === BUTTON_TYPES.PHONE_NUMBER && (
                <FloatingInput
                  label="Phone Number *"
                  value={card.button1PhoneNumber || ''}
                  onChange={(e) => onChange({ ...card, button1PhoneNumber: e.target.value })}
                  placeholder="+15551234567"
                />
              )}
            </div>
          </div>
        )}

        {button2Type && button2Type !== BUTTON_TYPES.NONE && (
          <div style={{ padding: 16, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
              Button 2: {
                button2Type === BUTTON_TYPES.QUICK_REPLY ? 'Quick Reply' :
                button2Type === BUTTON_TYPES.URL ? 'Visit Website' :
                button2Type === BUTTON_TYPES.PHONE_NUMBER ? 'Call Phone Number' : button2Type
              }
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: button2Type === BUTTON_TYPES.QUICK_REPLY ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <FloatingInput
                label="Button Text *"
                value={card.button2Text || ''}
                onChange={(e) => onChange({ ...card, button2Text: e.target.value })}
              />
              {button2Type === BUTTON_TYPES.URL && (
                <FloatingInput
                  label="URL *"
                  value={card.button2Url || ''}
                  onChange={(e) => onChange({ ...card, button2Url: e.target.value })}
                  placeholder="https://www.example.com"
                />
              )}
              {button2Type === BUTTON_TYPES.PHONE_NUMBER && (
                <FloatingInput
                  label="Phone Number *"
                  value={card.button2PhoneNumber || ''}
                  onChange={(e) => onChange({ ...card, button2PhoneNumber: e.target.value })}
                  placeholder="+15551234567"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   CAROUSEL FORM  (MARKETING + CAROUSEL)  — preserved exactly from original
──────────────────────────────────────────────────────────────────────────────*/
export const CarouselForm = ({ form, setField, errors, numberId }) => {
  const bodyRef = useRef(null)
  const body = form.body
  const setBody = (val) => setField('body', val)
  const [selectedCardIndex, setSelectedCardIndex] = useState(0)

  const activeButtons = []
  if (form.carouselButton1Type && form.carouselButton1Type !== BUTTON_TYPES.NONE) {
    activeButtons.push({ id: 1, type: form.carouselButton1Type })
  }
  if (form.carouselButton2Type && form.carouselButton2Type !== BUTTON_TYPES.NONE) {
    activeButtons.push({ id: 2, type: form.carouselButton2Type })
  }

  const handleAddButton = (type) => {
    if (!form.carouselButton1Type || form.carouselButton1Type === BUTTON_TYPES.NONE) {
      setField('carouselButton1Type', type)
    } else if (!form.carouselButton2Type || form.carouselButton2Type === BUTTON_TYPES.NONE) {
      setField('carouselButton2Type', type)
    }
  }

  const handleDeleteButton = (id) => {
    if (id === 1) {
      // Shift button 2 up
      setField('carouselButton1Type', form.carouselButton2Type || BUTTON_TYPES.NONE)
      setField('carouselButton2Type', BUTTON_TYPES.NONE)
    } else {
      setField('carouselButton2Type', BUTTON_TYPES.NONE)
    }
  }

  const buttonCounts = {
    canAddCall: !activeButtons.find(b => b.type === BUTTON_TYPES.PHONE_NUMBER),
    canAddWebsite: activeButtons.filter(b => b.type === BUTTON_TYPES.URL).length < 2,
    canAddCopyCode: false,
    canAddOtp: false,
    canAddFlow: false,
    canAddCatalog: false,
    canAddMpm: false,
  }
  const allowedButtonTypes = [BUTTON_TYPES.QUICK_REPLY, BUTTON_TYPES.PHONE_NUMBER, BUTTON_TYPES.URL]

  const addCard = () => {
    if (form.carouselCards.length >= 10) return
    setField('carouselCards', [
      ...form.carouselCards,
      createCarouselCard(form.carouselCards.length + 1),
    ])
  }
  const updateCard = (id, updated) =>
    setField(
      'carouselCards',
      form.carouselCards.map((c) => (c.id === id ? updated : c))
    )
  const deleteCard = (id) =>
    setField(
      'carouselCards',
      form.carouselCards.filter((c) => c.id !== id)
    )

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            margin: '0 0 10px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Send promotions or information about your products, services or
          business.
        </p>
        <TabGroup
          value={form.marketingType}
          onChange={(v) => setField('marketingType', v)}
          tabs={[
            {
              value: MARKETING_TYPES.CUSTOM,
              label: 'Custom',
              info: 'Create a custom marketing message',
            },
            {
              value: MARKETING_TYPES.PRODUCT,
              label: 'Product',
              info: 'Showcase your products',
            },
            {
              value: MARKETING_TYPES.CAROUSEL,
              label: 'Carousel',
              info: 'Display multiple cards',
            },
            {
              value: MARKETING_TYPES.LIMITED_TIME_OFFER,
              label: 'Limited Time Offer',
              info: 'Send an offer with expiration',
            },
            {
              value: MARKETING_TYPES.CALL_REQUEST_PERMISSION,
              label: 'Call Request Permission',
              info: 'Request permission to call',
            },
          ]}
        />
      </div>

      <FormField
        label="Body"
        description="Enter the text for your message in the language that you've selected."
      >
        <FloatingTextarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter text in English"
          minHeight={100}
          error={errors.body}
          toolbar={
            <BodyToolbar
              value={body}
              onChange={setBody}
              textareaRef={bodyRef}
              showInfo
            />
          }
        />
      </FormField>

      {/* Carousel settings */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          background: 'var(--surface-2)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 3,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Carousel
        </div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            margin: '0 0 12px',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          In a carousel the Header type and buttons type will be same for all
          the cards.
        </p>
        <div style={{ marginTop: 16 }}>
          <FloatingSelect
            label="Header Type"
            value={form.carouselHeaderType}
            onChange={(e) => setField('carouselHeaderType', e.target.value)}
            options={CAROUSEL_HEADER_TYPES}
            style={{ maxWidth: 180 }}
          />
        </div>

        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3, fontFamily: "'DM Sans', sans-serif", marginTop: '40px' }}>
          Button <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Optional)</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif", marginTop: 10 }}>
          Create buttons that let customers respond to your message or take action.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 12, marginTop: 12 }}>
          <AddButtonDropdown
            onAdd={handleAddButton}
            counts={buttonCounts}
            totalButtons={activeButtons.length}
            allowedTypes={allowedButtonTypes}
          />
        </div>

        {/* Display selected buttons */}
        {activeButtons.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeButtons.map(btn => (
              <div key={btn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, background: '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', fontFamily: "'DM Sans', sans-serif" }}>
                  {btn.type === BUTTON_TYPES.QUICK_REPLY && 'Quick Reply Button'}
                  {btn.type === BUTTON_TYPES.URL && 'Visit Website Button'}
                  {btn.type === BUTTON_TYPES.PHONE_NUMBER && 'Call Phone Number Button'}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteButton(btn.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                  title="Remove button"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card page indicators */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 8,
        }}
      >
        {form.carouselCards.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setSelectedCardIndex(i)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: selectedCardIndex === i ? '#ffedd5' : 'var(--blue)',
              color: selectedCardIndex === i ? '#ea580c' : '#fff',
              border: `1px solid ${selectedCardIndex === i ? '#fdba74' : 'transparent'}`,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {i + 1}
          </button>
        ))}
        {form.carouselCards.length < 10 && (
          <button
            type="button"
            onClick={addCard}
            style={{
              padding: '0 16px',
              height: 36,
              borderRadius: 8,
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px dashed var(--border)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              gap: 6,
              flexShrink: 0,
            }}
          >
            <PlusIcon size={14} /> Add Card
          </button>
        )}
      </div>

      {form.carouselCards.length > 0 && form.carouselCards[selectedCardIndex] && (
        <CarouselCard
          key={form.carouselCards[selectedCardIndex].id}
          card={form.carouselCards[selectedCardIndex]}
          index={selectedCardIndex}
          onChange={(updated) => updateCard(form.carouselCards[selectedCardIndex].id, updated)}
          onDelete={() => {
            deleteCard(form.carouselCards[selectedCardIndex].id)
            setSelectedCardIndex(Math.max(0, selectedCardIndex - 1))
          }}
          button1Type={form.carouselButton1Type}
          button2Type={form.carouselButton2Type}
          headerType={form.carouselHeaderType}
          numberId={numberId}
        />
      )}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   UTILITY FORM  (UTILITY)
──────────────────────────────────────────────────────────────────────────────*/
export const UtilityForm = ({ form, setField, errors }) => (
  <>
    <div style={{ marginBottom: 32, marginTop: '-10px' }}>
      <p
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          margin: '0 0 10px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Send promotions or information about your products, services or
        business.
      </p>
      <TabGroup
        value={form.utilityType || UTILITY_TYPES.CUSTOM}
        onChange={(v) => setField('utilityType', v)}
        tabs={[
          {
            value: UTILITY_TYPES.CUSTOM,
            label: 'Custom',
            info: 'Create a custom utility message',
          },
          {
            value: UTILITY_TYPES.CALL_REQUEST_PERMISSION,
            label: 'Call Request Permission',
            info: 'Request permission to call',
          },
        ]}
      />
    </div>

    {form.utilityType === UTILITY_TYPES.CUSTOM && (
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ width: '180px' }}>
          <FloatingSelect
            label="Variable Type"
            value={form.variableType || 'NUMBER'}
            onChange={(e) => setField('variableType', e.target.value)}
            options={[
              { value: 'NUMBER', label: 'Number' },
              { value: 'TEXT', label: 'Text' },
            ]}
          />
        </div>
        <Tooltip content="Choose the type of variable format">
          <span style={{ color: 'var(--text-light)', cursor: 'help' }}>
            <InfoIcon size={14} />
          </span>
        </Tooltip>
      </div>
    )}

    <HeaderSection 
      form={form} 
      setField={setField} 
      allowedOptions={
        form.utilityType === UTILITY_TYPES.CALL_REQUEST_PERMISSION
          ? [
              { value: 'NONE', label: 'None' },
              { value: 'TEXT', label: 'Text' }
            ]
          : undefined
      }
    />

    <BodyFooterBlock
      form={form}
      onBodyChange={(v) => setField('body', v)}
      footer={form.footer}
      onFooterChange={(v) => setField('footer', v)}
      errors={errors}
    />

    {form.utilityType !== UTILITY_TYPES.CALL_REQUEST_PERMISSION && (
      <ButtonSection
        buttons={form.buttons}
        onChange={(btns) => setField('buttons', btns)}
        enableClickCount={form.enableClickCount}
        onToggleClickCount={(v) => setField('enableClickCount', v)}
        nextIndex={1}
        allowedTypes={['QUICK_REPLY', 'PHONE_NUMBER', 'URL']}
      />
    )}
  </>
)

/* ─────────────────────────────────────────────────────────────────────────────
   AUTHENTICATION FORM — reads/writes form.authConfig (schema-aligned)
──────────────────────────────────────────────────────────────────────────────*/
export const AuthenticationForm = ({ form, setField }) => {
  const authConfig = form.authConfig || {}

  const otpButton = form.buttons?.find((b) => b.type === BUTTON_TYPES.OTP) || {}
  const otpType = otpButton.otpType || OTP_DELIVERY_TYPES.COPY_CODE

  const handleOtpTypeChange = (val) => {
    const newBtns = (form.buttons || []).filter(
      (b) => b.type !== BUTTON_TYPES.OTP
    )
    newBtns.push({
      id: Date.now(),
      type: BUTTON_TYPES.OTP,
      otpType: val,
      text: 'Copy code',
    })
    setField('buttons', newBtns)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 4,
              fontFamily: "'DM Sans', sans-serif",
              margin: 0,
            }}
          >
            Code delivery setup
          </h3>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Choose how customers send the code from WhatsApp to your app. Edits
            to this section won't require review or count towards edit limits.
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 8,
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <input
                type="radio"
                name="codeDeliverySetup"
                value={OTP_DELIVERY_TYPES.COPY_CODE}
                checked={otpType === OTP_DELIVERY_TYPES.COPY_CODE}
                onChange={() =>
                  handleOtpTypeChange(OTP_DELIVERY_TYPES.COPY_CODE)
                }
                style={{ marginTop: 2 }}
              />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text)',
                  }}
                >
                  Copy code
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Basic authentication with quick setup. Your customers copy and
                  paste the code into your app.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <input
                type="radio"
                name="codeDeliverySetup"
                value={OTP_DELIVERY_TYPES.ZERO_TAP}
                checked={otpType === OTP_DELIVERY_TYPES.ZERO_TAP}
                onChange={() =>
                  handleOtpTypeChange(OTP_DELIVERY_TYPES.ZERO_TAP)
                }
                style={{ marginTop: 2 }}
              />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text)',
                  }}
                >
                  Zero-tap auto-fill
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  This is recommended as the easiest option for your customers.
                  Zero-tap will automatically send the code without requiring
                  your customer to tap a button. An auto-fill or copy code
                  message will be sent if zero-tap and auto-fill aren't
                  possible.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <input
                type="radio"
                name="codeDeliverySetup"
                value={OTP_DELIVERY_TYPES.ONE_TAP}
                checked={otpType === OTP_DELIVERY_TYPES.ONE_TAP}
                onChange={() => handleOtpTypeChange(OTP_DELIVERY_TYPES.ONE_TAP)}
                style={{ marginTop: 2 }}
              />
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text)',
                  }}
                >
                  One-tap auto-fill
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  The code sends to your app when customers tap the button. A
                  copy code message will be sent if auto-fill isn't possible.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: "'DM Sans', sans-serif",
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
          }}
        >
          Optionally add a security line to the message body and set how long
          the code is valid.
        </div>

        <Checkbox
          checked={authConfig.addSecurityRecommendation ?? true}
          onChange={(v) =>
            setField('authConfig', {
              ...authConfig,
              addSecurityRecommendation: v,
            })
          }
          label="Add Security Recommendation"
        />
        <div
          style={{
            position: 'relative',
            maxWidth: 240,
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            padding: '2px',
          }}
        >
          <FloatingInput
            label="Code Expiration Minutes"
            value={authConfig.codeExpirationMinutes || ''}
            onChange={(e) =>
              setField('authConfig', {
                ...authConfig,
                codeExpirationMinutes: e.target.value
                  ? Number(e.target.value)
                  : null,
              })
            }
            type="number"
            placeholder="Enter number (e.g. 3)"
          />
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '8px',
              background: 'white',
              padding: '0 4px',
              fontSize: '10px',
              color: '#3b82f6',
            }}
          >
            Code Expiration Minutes
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: 240, marginTop: 8 }}>
          <div
            style={{
              position: 'absolute',
              top: '-8px',
              left: '8px',
              background: 'white',
              padding: '0 4px',
              fontSize: '10px',
              color: '#3b82f6',
            }}
          >
            Button Text
          </div>
          <input
            value={
              otpType === OTP_DELIVERY_TYPES.COPY_CODE
                ? 'Copy code'
                : 'Autofill'
            }
            disabled
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: '#f8fafc',
              color: '#94a3b8',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {otpType === OTP_DELIVERY_TYPES.ZERO_TAP && (
          <div style={{ marginTop: 16 }}>
            <Checkbox
              checked={otpButton.zeroTapTermsAccepted || false}
              onChange={(v) => {
                const newBtns = (form.buttons || []).filter(
                  (b) => b.type !== BUTTON_TYPES.OTP
                )
                newBtns.push({
                  ...otpButton,
                  id: otpButton.id || Date.now(),
                  type: BUTTON_TYPES.OTP,
                  otpType: otpType,
                  zeroTapTermsAccepted: v,
                })
                setField('buttons', newBtns)
              }}
              label={
                <span>
                  I accept the terms and conditions for Zero-tap{' '}
                  <a
                    href="https://www.whatsapp.com/legal/business-terms/?lang=en_GB&fbclid=IwY2xjawRgL5VleHRuA2FlbQIxMABicmlkETE4ek1oYW03dUlVdGJZSG43c3J0YwZhcHBfaWQPNTE0NzcxNTY5MjI4MDYxAAEefFYxuHhok-X3WgF2A9lp6sJ_itR5PVtmTVa8KeMzQZ_1ZTewuWgovTCs3Aw_aem_AYlFY4M8VLTUD9cfKOeLUA"
                    target="_blank"
                    style={{ color: '#2D6EF3', textDecoration: 'none' }}
                  >
                    read here
                  </a>
                </span>
              }
            />
          </div>
        )}

        {otpType !== OTP_DELIVERY_TYPES.COPY_CODE && (
          <div
            style={{
              marginTop: 24,
              borderTop: '1px solid var(--border)',
              paddingTop: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text)',
                marginBottom: 4,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              App setup
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginBottom: 16,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              You can add up to 5 apps.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(
                otpButton.supportedApps || [
                  { packageName: '', signatureHash: '' },
                ]
              ).map((app, index) => (
                <div
                  key={index}
                  style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ flex: 1, display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '8px',
                          background: 'white',
                          padding: '0 4px',
                          fontSize: '10px',
                          color: !app.packageName ? '#ef4444' : '#64748b',
                        }}
                      >
                        Package name*
                      </div>
                      <input
                        value={app.packageName}
                        onChange={(e) => {
                          const apps = [
                            ...(otpButton.supportedApps || [
                              { packageName: '', signatureHash: '' },
                            ]),
                          ]
                          apps[index].packageName = e.target.value
                          const newBtns = (form.buttons || []).filter(
                            (b) => b.type !== BUTTON_TYPES.OTP
                          )
                          newBtns.push({
                            ...otpButton,
                            type: BUTTON_TYPES.OTP,
                            otpType: otpType,
                            supportedApps: apps,
                            id: otpButton.id || Date.now(),
                          })
                          setField('buttons', newBtns)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: !app.packageName
                            ? '1px solid #ef4444'
                            : '1px solid #cbd5e1',
                          borderRadius: '4px',
                          background: '#fff',
                          color: '#334155',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                        placeholder="Package name*"
                      />
                      {!app.packageName && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#ef4444',
                            marginTop: '4px',
                          }}
                        >
                          Package name is required.
                        </div>
                      )}
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '8px',
                          background: 'white',
                          padding: '0 4px',
                          fontSize: '10px',
                          color: !app.signatureHash ? '#ef4444' : '#64748b',
                        }}
                      >
                        App signature hash*
                      </div>
                      <input
                        value={app.signatureHash}
                        onChange={(e) => {
                          const apps = [
                            ...(otpButton.supportedApps || [
                              { packageName: '', signatureHash: '' },
                            ]),
                          ]
                          apps[index].signatureHash = e.target.value
                          const newBtns = (form.buttons || []).filter(
                            (b) => b.type !== BUTTON_TYPES.OTP
                          )
                          newBtns.push({
                            ...otpButton,
                            type: BUTTON_TYPES.OTP,
                            otpType: otpType,
                            supportedApps: apps,
                            id: otpButton.id || Date.now(),
                          })
                          setField('buttons', newBtns)
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: !app.signatureHash
                            ? '1px solid #ef4444'
                            : '1px solid #cbd5e1',
                          borderRadius: '4px',
                          background: '#fff',
                          color: '#334155',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                        placeholder="App signature hash*"
                      />
                      {!app.signatureHash && (
                        <div
                          style={{
                            fontSize: '10px',
                            color: '#ef4444',
                            marginTop: '4px',
                          }}
                        >
                          Signature hash is required.
                        </div>
                      )}
                    </div>
                  </div>

                  {(
                    otpButton.supportedApps || [
                      { packageName: '', signatureHash: '' },
                    ]
                  ).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const apps = [...(otpButton.supportedApps || [])]
                        apps.splice(index, 1)
                        const newBtns = (form.buttons || []).filter(
                          (b) => b.type !== BUTTON_TYPES.OTP
                        )
                        newBtns.push({
                          ...otpButton,
                          type: BUTTON_TYPES.OTP,
                          otpType: otpType,
                          supportedApps: apps,
                          id: otpButton.id || Date.now(),
                        })
                        setField('buttons', newBtns)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b',
                        padding: '8px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {(
              otpButton.supportedApps || [
                { packageName: '', signatureHash: '' },
              ]
            ).length < 5 && (
              <button
                type="button"
                onClick={() => {
                  const apps = [
                    ...(otpButton.supportedApps || [
                      { packageName: '', signatureHash: '' },
                    ]),
                  ]
                  apps.push({ packageName: '', signatureHash: '' })
                  const newBtns = (form.buttons || []).filter(
                    (b) => b.type !== BUTTON_TYPES.OTP
                  )
                  newBtns.push({
                    ...otpButton,
                    type: BUTTON_TYPES.OTP,
                    otpType: otpType,
                    supportedApps: apps,
                    id: otpButton.id || Date.now(),
                  })
                  setField('buttons', newBtns)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2D6EF3',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '12px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 16 }}>+</span> Add another app
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
