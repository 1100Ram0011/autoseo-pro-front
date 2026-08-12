import React, { useRef } from 'react'
import {
  FormField,
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
  TabGroup,
  Checkbox,
  Btn
} from '../ui/Msg91WaBaseUI'
import { PlusIcon, TrashIcon } from '../ui/Msg91WaIcons'
import BodyToolbar from '../ui/Msg91WaBodyToolbar'
import ButtonSection from './Msg91WaButtonsection'
import {
  HEADER_OPTIONS,
  MARKETING_TYPES,
  PRODUCT_FORMATS,
  CAROUSEL_HEADER_TYPES,
  BUTTON_TYPES,
  createCarouselCard
} from '../../constants/Msg91TemplateConfig'

// ─── Helpers ────────────────────────────────────────────────────────────────
const getNextVariableIndex = (text = "") => {
  const matches = text.match(/\{\{(\d+)\}\}/g)
  if (!matches) return 1

  const numbers = matches.map(m =>
    parseInt(m.replace(/[{}]/g, ""), 10)
  )

  return Math.max(...numbers) + 1
}



// ─── Shared Body + Footer ───────────────────────────────────────────────────
export const BodyFooterBlock = ({
  body,
  onBodyChange,
  bodySamples = [],
  onBodySamplesChange,
  footer,
  onFooterChange,
  errors = {}
}) => {
  const bodyRef = useRef(null)

  return (
    <div className="space-y-4">
      <FormField
        label="Body"
        description="Enter the text for your message."
      >
        <FloatingTextarea
          ref={bodyRef}
          value={body}
          onChange={e => onBodyChange(e.target.value)}
          placeholder="Enter text"
          minHeight={110}
          error={errors.body}
          toolbar={
            <BodyToolbar
              value={body}
              onChange={onBodyChange}
              textareaRef={bodyRef}
              showInfo
            />
          }
        />

      </FormField>

      <FormField
        label="Footer"
        optional
        description="Short line at bottom"
      >
        <FloatingInput
          value={footer}
          onChange={e => onFooterChange(e.target.value)}
          placeholder="Enter footer"
        />
      </FormField>
    </div>
  )
}

// ─── Custom Form ────────────────────────────────────────────────────────────
export const CustomForm = ({ form, setField, errors }) => {
  const headerType = form.header

  return (
    <div className="space-y-5">
      {form.category === 'Marketing' && (
        <div>
          <p className="text-xs text-[var(--app-pages-text)] mb-2">
            Send promotions or information about your business.
          </p>

          <TabGroup
            value={form.marketingType}
            onChange={v => setField('marketingType', v)}
            tabs={[
              { value: MARKETING_TYPES.CUSTOM, label: 'Custom' },
              { value: MARKETING_TYPES.PRODUCT, label: 'Product' },
              { value: MARKETING_TYPES.CAROUSEL, label: 'Carousel' }
            ]}
          />
        </div>
      )}

      {/* Header */}
      <FormField label="Header" optional>
        <div className="flex flex-col sm:flex-row gap-3">
          <FloatingSelect
            // label="Header Type"
            value={form.header}
            onChange={e => setField('header', e.target.value)}
            options={HEADER_OPTIONS}
            className="sm:max-w-[140px]"
          />

          {headerType === 'Text' && (
            <>
              <FloatingInput
                label="Header Text"
                value={form.headerText}
                onChange={e => setField('headerText', e.target.value)}
                error={errors.headerText}
              />

              <button
                type="button"
                className="flex items-center gap-1 text-xs font-medium text-[var(--app-pages-btn-text)] shrink-0"
                onClick={() => {
                  const next = getNextVariableIndex(form.headerText)
                  setField('headerText', form.headerText + `{{${next}}}`)
                }}
              >
                <PlusIcon size={12} /> Add Variable
              </button>
            </>
          )}

          {['Image', 'Video', 'Document'].includes(headerType) && (
            <FloatingInput
              label={`Sample ${headerType} URL *`}
              value={form.mediaUrl || ''}
              onChange={e => setField('mediaUrl', e.target.value)}
              placeholder={`https://example.com/sample.${headerType === 'Image' ? 'jpg' : headerType === 'Video' ? 'mp4' : 'pdf'}`}
              error={errors.mediaUrl}
              style={{ flex: 1 }}
            />
          )}
        </div>
      </FormField>

      <BodyFooterBlock
        body={form.body}
        onBodyChange={v => setField('body', v)}
        bodySamples={form.bodySamples}
        onBodySamplesChange={v => setField('bodySamples', v)}
        footer={form.footer}
        onFooterChange={v => setField('footer', v)}
        errors={errors}
      />

      <ButtonSection
        buttons={form.buttons}
        onChange={btns => setField('buttons', btns)}
        enableClickCount={form.enableClickCount}
        onToggleClickCount={v => setField('enableClickCount', v)}
      />
    </div>
  )
}

// ─── Product Form ───────────────────────────────────────────────────────────
export const ProductForm = ({ form, setField, errors }) => {
  const isMulti = form.productFormat === PRODUCT_FORMATS.MULTI_PRODUCT

  return (
    <div className="space-y-5">
      <TabGroup
        value={form.productFormat}
        onChange={v => setField('productFormat', v)}
        tabs={[
          { value: PRODUCT_FORMATS.CATALOGUE, label: 'Catalogue' },
          { value: PRODUCT_FORMATS.MULTI_PRODUCT, label: 'Multi-product' }
        ]}
      />

      {isMulti && (
        <FormField label="Header">
          <FloatingInput
            value={form.headerText}
            onChange={e => setField('headerText', e.target.value)}
          />

          <button
            className="text-xs text-[var(--app-pages-btn-text)] mt-1"
            onClick={() => {
              const next = getNextVariableIndex(form.headerText)
              setField('headerText', form.headerText + `{{${next}}}`)
            }}
          >
            + Add Variable
          </button>
        </FormField>
      )}

      <BodyFooterBlock
        body={form.body}
        onBodyChange={v => setField('body', v)}
        bodySamples={form.bodySamples}
        onBodySamplesChange={v => setField('bodySamples', v)}
        footer={form.footer}
        onFooterChange={v => setField('footer', v)}
        errors={errors}
      />
    </div>
  )
}

// ─── Carousel Card ──────────────────────────────────────────────────────────
export const CarouselCard = ({
  card,
  index,
  onChange,
  onDelete,
  button1Type,
  button2Type,
  form
}) => {
  const bodyRef = useRef(null)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
      
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          Card {index + 1}
        </span>

        <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
          <TrashIcon size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">

        {/* Media URL Input */}
        <FloatingInput
          label={`${form.carouselHeaderType || 'Media'} URL *`}
          value={card.mediaUrl || ''}
          onChange={e => onChange({ ...card, mediaUrl: e.target.value })}
        />

        <FloatingTextarea
          ref={bodyRef}
          value={card.body || ''}
          onChange={e => onChange({ ...card, body: e.target.value })}
          minHeight={70}
          toolbar={
            <BodyToolbar
              value={card.body || ''}
              onChange={val => onChange({ ...card, body: val })}
              textareaRef={bodyRef}
            />
          }
        />



        {button1Type && button1Type !== 'None' && (
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <FloatingInput
              label="Button 1 Text"
              value={card.button1Text || ''}
              onChange={e =>
                onChange({ ...card, button1Text: e.target.value })
              }
            />
            {button1Type === 'Visit website' && (
              <div className="flex gap-2">
                <FloatingSelect
                  label="URL Type"
                  value={card.button1UrlType || 'Static'}
                  onChange={e => onChange({ ...card, button1UrlType: e.target.value })}
                  options={['Static', 'Dynamic']}
                  style={{ width: 140 }}
                />
                <FloatingInput
                  label="Button 1 URL"
                  value={card.button1Url || ''}
                  onChange={e =>
                    onChange({ ...card, button1Url: e.target.value })
                  }
                  style={{ flex: 1 }}
                  placeholder={card.button1UrlType === 'Dynamic' ? 'https://example.com/{{1}}' : 'https://example.com'}
                />
              </div>
            )}
            {button1Type === 'Call phone number' && (
              <FloatingInput
                label="Phone Number"
                value={card.button1Phone || ''}
                onChange={e => onChange({ ...card, button1Phone: e.target.value })}
                placeholder="+919876543210"
              />
            )}
            {button1Type === 'Quick Reply' && (
              <FloatingInput
                label="Payload ID (Hidden)"
                value={card.button1Payload || ''}
                onChange={e => onChange({ ...card, button1Payload: e.target.value })}
                placeholder="e.g. YES_BTN_1"
              />
            )}
          </div>
        )}

        {button2Type && button2Type !== 'None' && (
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <FloatingInput
              label="Button 2 Text"
              value={card.button2Text || ''}
              onChange={e =>
                onChange({ ...card, button2Text: e.target.value })
              }
            />
            {button2Type === 'Visit website' && (
              <div className="flex gap-2">
                <FloatingSelect
                  label="URL Type"
                  value={card.button2UrlType || 'Static'}
                  onChange={e => onChange({ ...card, button2UrlType: e.target.value })}
                  options={['Static', 'Dynamic']}
                  style={{ width: 140 }}
                />
                <FloatingInput
                  label="Button 2 URL"
                  value={card.button2Url || ''}
                  onChange={e =>
                    onChange({ ...card, button2Url: e.target.value })
                  }
                  style={{ flex: 1 }}
                  placeholder={card.button2UrlType === 'Dynamic' ? 'https://example.com/{{1}}' : 'https://example.com'}
                />
              </div>
            )}
            {button2Type === 'Call phone number' && (
              <FloatingInput
                label="Phone Number"
                value={card.button2Phone || ''}
                onChange={e => onChange({ ...card, button2Phone: e.target.value })}
                placeholder="+919876543210"
              />
            )}
            {button2Type === 'Quick Reply' && (
              <FloatingInput
                label="Payload ID (Hidden)"
                value={card.button2Payload || ''}
                onChange={e => onChange({ ...card, button2Payload: e.target.value })}
                placeholder="e.g. NO_BTN_2"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Carousel Form ──────────────────────────────────────────────────────────
export const CarouselForm = ({ form, setField, errors }) => {

  const addCard = () => {
    if (form.carouselCards.length >= 10) return
    setField('carouselCards', [
      ...form.carouselCards,
      createCarouselCard(form.carouselCards.length + 1)
    ])
  }

  return (
    <div className="space-y-5">

      <FormField
        label="Carousel Global Body"
        description="Text displayed above all carousel cards."
      >
        <FloatingTextarea
          value={form.body}
          onChange={e => setField('body', e.target.value)}
          error={errors.body}
          minHeight={100}
        />

      </FormField>

      {/* Settings */}
      <div className="p-4 rounded-xl border bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 space-y-4">
        <FloatingSelect
          label="Header Type"
          value={form.carouselHeaderType}
          onChange={e => setField('carouselHeaderType', e.target.value)}
          options={CAROUSEL_HEADER_TYPES}
        />
        <div className="flex gap-4">
          <div className="flex-1">
            <FloatingSelect
              label="Button 1 Type"
              value={form.carouselButton1Type}
              onChange={e => setField('carouselButton1Type', e.target.value)}
              options={Object.values(BUTTON_TYPES)}
            />
          </div>
          <div className="flex-1">
            <FloatingSelect
              label="Button 2 Type"
              value={form.carouselButton2Type}
              onChange={e => setField('carouselButton2Type', e.target.value)}
              options={Object.values(BUTTON_TYPES)}
            />
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="flex gap-2 flex-wrap">
        {form.carouselCards.map((_, i) => (
          <div key={i} className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
            {i + 1}
          </div>
        ))}

        <Btn size="sm" onClick={addCard}>
          + Add
        </Btn>
      </div>

      {form.carouselCards.map((card, i) => (
        <CarouselCard
          key={card.id}
          card={card}
          index={i}
          onChange={updated =>
            setField(
              'carouselCards',
              form.carouselCards.map(c =>
                c.id === card.id ? updated : c
              )
            )
          }
          onDelete={() =>
            setField(
              'carouselCards',
              form.carouselCards.filter(c => c.id !== card.id)
            )
          }
          button1Type={form.carouselButton1Type}
          button2Type={form.carouselButton2Type}
          form={form}
        />
      ))}
    </div>
  )
}

// ─── Authentication Form ────────────────────────────────────────────────────
export const AuthenticationForm = ({ form, setField }) => (
  <div className="space-y-4">
    <Checkbox
      checked={form.addSecurityRecommendation}
      onChange={v => setField('addSecurityRecommendation', v)}
      label="Add Security Recommendation"
    />

    <FloatingInput
      label="Code Expiration Minutes"
      value={form.codeExpirationMinutes}
      onChange={e => setField('codeExpirationMinutes', e.target.value)}
      type="number"
      className="max-w-xs"
    />

    <FloatingInput
      label="Button Text"
      value="Copy code"
      disabled
      className="max-w-xs"
    />
  </div>
)