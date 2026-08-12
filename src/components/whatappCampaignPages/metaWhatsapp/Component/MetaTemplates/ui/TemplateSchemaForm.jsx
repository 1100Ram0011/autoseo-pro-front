import React, { useRef } from 'react'
import {
  FloatingInput,
  FloatingSelect,
  Toggle,
  Divider,
} from './WaBaseUI.jsx'
import {
  TEMPLATE_JSON_SCHEMA,
  CATEGORIES,
  BUTTON_TYPES,
  OTP_TYPES,
} from '../schema/templateJsonSchema.js'
import { CloseIcon } from './WaIcons.jsx'

export const TemplateSchemaForm = ({
  formState,
  numberId,
  onMediaUpload,
  uploadingMedia,
}) => {
  const {
    form,
    updateField,
    updateHeader,
    updateHeaderSample,
    updateBodySample,
    addButton,
    updateButton,
    removeButton,
    addCarouselCard,
    updateCarouselCard,
    removeCarouselCard,
    bodyVariables,
    headerVariables,
  } = formState

  const fileInputRef = useRef(null)

  // Rich Text helper: insert formatting or variable at cursor position in textarea
  const insertIntoBody = (insertion) => {
    const textarea = document.getElementById('template-body-textarea')
    if (!textarea) {
      updateField('body', (form.body || '') + insertion)
      return
    }
    const start = textarea.selectionStart || 0
    const end = textarea.selectionEnd || 0
    const current = form.body || ''
    const newText = current.substring(0, start) + insertion + current.substring(end)
    updateField('body', newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + insertion.length, start + insertion.length)
    }, 50)
  }

  // Insert next sequential variable {{N}} into body
  const insertNextVariable = () => {
    const nextVarNum = bodyVariables.length > 0 ? Math.max(...bodyVariables) + 1 : 1
    insertIntoBody(`{{${nextVarNum}}}`)
  }

  // Insert variable {{1}} into header text
  const insertHeaderVariable = () => {
    if (!form.header?.text?.includes('{{1}}')) {
      updateHeader('text', (form.header?.text || '') + ' {{1}}')
    }
  }

  // File Upload Handler for Media Headers
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !onMediaUpload) return
    await onMediaUpload(file)
  }

  return (
    <div className="space-y-6 text-[var(--app-pages-text)] font-sans">
      {/* ─── SECTION 1: IDENTITY & CLASSIFICATION ─── */}
      <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
            {TEMPLATE_JSON_SCHEMA.identity.title}
          </h3>
          <p className="text-xs text-[var(--app-pages-subhead-text)]">
            {TEMPLATE_JSON_SCHEMA.identity.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FloatingInput
            label={TEMPLATE_JSON_SCHEMA.identity.fields.name.label}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
            placeholder={TEMPLATE_JSON_SCHEMA.identity.fields.name.placeholder}
            helpText={TEMPLATE_JSON_SCHEMA.identity.fields.name.helpText}
            required
          />

          <FloatingSelect
            label={TEMPLATE_JSON_SCHEMA.identity.fields.category.label}
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            options={TEMPLATE_JSON_SCHEMA.identity.fields.category.options}
            required
          />

          {/* Marketing Sub-Type */}
          {TEMPLATE_JSON_SCHEMA.identity.fields.marketingType.visibleIf(form) && (
            <FloatingSelect
              label={TEMPLATE_JSON_SCHEMA.identity.fields.marketingType.label}
              value={form.marketingType}
              onChange={(e) => updateField('marketingType', e.target.value)}
              options={TEMPLATE_JSON_SCHEMA.identity.fields.marketingType.options}
            />
          )}

          {/* Utility Sub-Type */}
          {TEMPLATE_JSON_SCHEMA.identity.fields.utilityType.visibleIf(form) && (
            <FloatingSelect
              label={TEMPLATE_JSON_SCHEMA.identity.fields.utilityType.label}
              value={form.utilityType}
              onChange={(e) => updateField('utilityType', e.target.value)}
              options={TEMPLATE_JSON_SCHEMA.identity.fields.utilityType.options}
            />
          )}

          <FloatingSelect
            label={TEMPLATE_JSON_SCHEMA.identity.fields.language.label}
            value={form.language}
            onChange={(e) => updateField('language', e.target.value)}
            options={TEMPLATE_JSON_SCHEMA.identity.fields.language.options}
            required
          />
        </div>
      </div>

      {/* ─── SECTION 2: HEADER COMPONENT ─── */}
      {TEMPLATE_JSON_SCHEMA.header.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
              {TEMPLATE_JSON_SCHEMA.header.title}
            </h3>
            <p className="text-xs text-[var(--app-pages-subhead-text)]">
              {TEMPLATE_JSON_SCHEMA.header.description}
            </p>
          </div>

          <FloatingSelect
            label={TEMPLATE_JSON_SCHEMA.header.fields.format.label}
            value={form.header?.format || 'NONE'}
            onChange={(e) => updateHeader('format', e.target.value)}
            options={TEMPLATE_JSON_SCHEMA.header.fields.format.options}
          />

          {/* Text Header Input */}
          {form.header?.format === 'TEXT' && (
            <div className="space-y-3">
              <div className="relative">
                <FloatingInput
                  label="Header Text"
                  value={form.header?.text || ''}
                  onChange={(e) => updateHeader('text', e.target.value)}
                  placeholder="Header text (supports {{1}})"
                  maxLength={60}
                />
                <button
                  type="button"
                  onClick={insertHeaderVariable}
                  className="absolute right-3 top-3 rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-[var(--app-brand-primary)] hover:bg-indigo-100 dark:bg-indigo-950/40"
                >
                  + Add {"{{1}}"}
                </button>
              </div>

              {headerVariables.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-zinc-800/50 space-y-2">
                  <label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Header Variable Sample Value
                  </label>
                  <FloatingInput
                    label="Sample value for {{1}}"
                    value={form.headerSamples?.[0] || ''}
                    onChange={(e) => updateHeaderSample(0, e.target.value)}
                    placeholder="e.g. John"
                  />
                </div>
              )}
            </div>
          )}

          {/* Media Header Upload */}
          {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(form.header?.format) && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={
                    form.header?.format === 'IMAGE'
                      ? 'image/png,image/jpeg,image/webp'
                      : form.header?.format === 'VIDEO'
                      ? 'video/mp4'
                      : 'application/pdf'
                  }
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="rounded-lg bg-[var(--app-brand-primary)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 disabled:opacity-50"
                >
                  {uploadingMedia ? 'Uploading to Meta...' : `Upload ${form.header?.format} Sample`}
                </button>
                {form.header?.headerHandle && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ✅ Uploaded to Meta Session
                  </span>
                )}
              </div>
              <FloatingInput
                label="Or Direct Media URL"
                value={form.header?.mediaUrl || ''}
                onChange={(e) => updateHeader('mediaUrl', e.target.value)}
                placeholder="https://example.com/media.png"
              />
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 3: BODY COMPONENT & VARIABLE SAMPLES ─── */}
      {TEMPLATE_JSON_SCHEMA.body.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
                {TEMPLATE_JSON_SCHEMA.body.title}
              </h3>
              <p className="text-xs text-[var(--app-pages-subhead-text)]">
                {TEMPLATE_JSON_SCHEMA.body.description}
              </p>
            </div>

            {/* Rich Formatting Toolbar */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => insertIntoBody('*bold*')}
                className="px-2 py-1 text-xs font-bold hover:bg-white dark:hover:bg-zinc-700 rounded"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertIntoBody('_italic_')}
                className="px-2 py-1 text-xs italic hover:bg-white dark:hover:bg-zinc-700 rounded"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertIntoBody('~strikethrough~')}
                className="px-2 py-1 text-xs line-through hover:bg-white dark:hover:bg-zinc-700 rounded"
                title="Strikethrough"
              >
                S
              </button>
              <button
                type="button"
                onClick={() => insertIntoBody('```monospace```')}
                className="px-2 py-1 text-xs font-mono hover:bg-white dark:hover:bg-zinc-700 rounded"
                title="Monospace"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={insertNextVariable}
                className="ml-1 px-2.5 py-1 text-xs font-semibold bg-[var(--app-brand-primary)] text-white rounded shadow-sm hover:opacity-90"
              >
                + Add Variable {`{{${bodyVariables.length + 1}}}`}
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              id="template-body-textarea"
              value={form.body}
              onChange={(e) => updateField('body', e.target.value)}
              placeholder={TEMPLATE_JSON_SCHEMA.body.fields.text.placeholder}
              maxLength={1024}
              rows={5}
              className="w-full rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-3 text-xs font-sans text-[var(--app-pages-text)] outline-none focus:border-[var(--app-brand-primary)]"
            />
            <div className="text-right text-[10px] text-gray-400 mt-1">
              {form.body?.length || 0} / 1024 characters
            </div>
          </div>

          {/* Auto-Generated Body Variable Sample Fields */}
          {bodyVariables.length > 0 && (
            <div className="rounded-lg bg-indigo-50/50 p-4 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Required Variable Sample Values ({bodyVariables.length})
                </h4>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  Meta requires sample data for review
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bodyVariables.map((varNum, idx) => (
                  <FloatingInput
                    key={varNum}
                    label={`Sample value for {{${varNum}}}`}
                    value={form.bodySamples?.[idx] || ''}
                    onChange={(e) => updateBodySample(idx, e.target.value)}
                    placeholder={`e.g. Sample value for variable {{${varNum}}}`}
                    required
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 4: LIMITED TIME OFFER ─── */}
      {TEMPLATE_JSON_SCHEMA.limitedTimeOffer.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
              {TEMPLATE_JSON_SCHEMA.limitedTimeOffer.title}
            </h3>
            <p className="text-xs text-[var(--app-pages-subhead-text)]">
              {TEMPLATE_JSON_SCHEMA.limitedTimeOffer.description}
            </p>
          </div>
          <FloatingInput
            label={TEMPLATE_JSON_SCHEMA.limitedTimeOffer.fields.offerMessage.label}
            value={form.offerMessage}
            onChange={(e) => updateField('offerMessage', e.target.value)}
            placeholder={TEMPLATE_JSON_SCHEMA.limitedTimeOffer.fields.offerMessage.placeholder}
            required
          />
        </div>
      )}

      {/* ─── SECTION 5: FOOTER COMPONENT ─── */}
      {TEMPLATE_JSON_SCHEMA.footer.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
              {TEMPLATE_JSON_SCHEMA.footer.title}
            </h3>
            <p className="text-xs text-[var(--app-pages-subhead-text)]">
              {TEMPLATE_JSON_SCHEMA.footer.description}
            </p>
          </div>
          <FloatingInput
            label={TEMPLATE_JSON_SCHEMA.footer.fields.text.label}
            value={form.footer}
            onChange={(e) => updateField('footer', e.target.value)}
            placeholder={TEMPLATE_JSON_SCHEMA.footer.fields.text.placeholder}
            maxLength={60}
          />
        </div>
      )}

      {/* ─── SECTION 6: INTERACTIVE BUTTONS ─── */}
      {TEMPLATE_JSON_SCHEMA.buttons.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
                {TEMPLATE_JSON_SCHEMA.buttons.title}
              </h3>
              <p className="text-xs text-[var(--app-pages-subhead-text)]">
                {TEMPLATE_JSON_SCHEMA.buttons.description}
              </p>
            </div>

            {form.buttons.length < 10 && (
              <button
                type="button"
                onClick={() => addButton('QUICK_REPLY')}
                className="rounded-lg bg-[var(--app-brand-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
              >
                + Add Button
              </button>
            )}
          </div>

          <div className="space-y-3">
            {form.buttons.map((btn, index) => (
              <div
                key={btn.id || index}
                className="rounded-lg border border-[var(--app-pages-border)] bg-gray-50/50 p-3 dark:bg-zinc-800/40 relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Button #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeButton(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FloatingSelect
                    label="Button Type"
                    value={btn.type}
                    onChange={(e) => updateButton(index, 'type', e.target.value)}
                    options={BUTTON_TYPES}
                  />

                  {btn.type !== 'COPY_CODE' && (
                    <FloatingInput
                      label="Display Text"
                      value={btn.text || ''}
                      onChange={(e) => updateButton(index, 'text', e.target.value)}
                      placeholder="Button text"
                      maxLength={25}
                    />
                  )}

                  {btn.type === 'URL' && (
                    <FloatingInput
                      label="Target URL"
                      value={btn.url || ''}
                      onChange={(e) => updateButton(index, 'url', e.target.value)}
                      placeholder="https://example.com/shop/{{1}}"
                    />
                  )}

                  {btn.type === 'PHONE_NUMBER' && (
                    <FloatingInput
                      label="Phone Number"
                      value={btn.phoneNumber || ''}
                      onChange={(e) => updateButton(index, 'phoneNumber', e.target.value)}
                      placeholder="+1234567890"
                    />
                  )}

                  {btn.type === 'COPY_CODE' && (
                    <FloatingInput
                      label="Sample Promo Code"
                      value={btn.example?.[0] || ''}
                      onChange={(e) => updateButton(index, 'example', [e.target.value])}
                      placeholder="e.g. PROMO20"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SECTION 7: CAROUSEL CARDS ─── */}
      {TEMPLATE_JSON_SCHEMA.carousel.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
                {TEMPLATE_JSON_SCHEMA.carousel.title}
              </h3>
              <p className="text-xs text-[var(--app-pages-subhead-text)]">
                {TEMPLATE_JSON_SCHEMA.carousel.description}
              </p>
            </div>

            {form.carouselCards.length < 10 && (
              <button
                type="button"
                onClick={addCarouselCard}
                className="rounded-lg bg-[var(--app-brand-primary)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90"
              >
                + Add Card
              </button>
            )}
          </div>

          <div className="space-y-4">
            {form.carouselCards.map((card, cardIdx) => (
              <div
                key={card.id || cardIdx}
                className="rounded-lg border border-[var(--app-pages-border)] bg-gray-50/50 p-4 dark:bg-zinc-800/40 relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                    Card #{cardIdx + 1}
                  </span>
                  {form.carouselCards.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeCarouselCard(cardIdx)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <FloatingInput
                    label="Card Body Text"
                    value={card.body}
                    onChange={(e) => updateCarouselCard(cardIdx, 'body', e.target.value)}
                    placeholder="Card body text (max 160 chars)"
                    maxLength={160}
                  />

                  <FloatingInput
                    label="Card Header Image / Video URL"
                    value={card.mediaUrl || ''}
                    onChange={(e) => updateCarouselCard(cardIdx, 'mediaUrl', e.target.value)}
                    placeholder="https://example.com/card-image.png"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SECTION 8: AUTHENTICATION SETTINGS ─── */}
      {TEMPLATE_JSON_SCHEMA.authentication.visibleIf(form) && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
              {TEMPLATE_JSON_SCHEMA.authentication.title}
            </h3>
            <p className="text-xs text-[var(--app-pages-subhead-text)]">
              {TEMPLATE_JSON_SCHEMA.authentication.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FloatingSelect
              label={TEMPLATE_JSON_SCHEMA.authentication.fields.otpType.label}
              value={form.otpType}
              onChange={(e) => updateField('otpType', e.target.value)}
              options={OTP_TYPES}
            />

            <FloatingInput
              label={TEMPLATE_JSON_SCHEMA.authentication.fields.codeExpirationMinutes.label}
              type="number"
              value={form.authConfig?.codeExpirationMinutes || ''}
              onChange={(e) =>
                updateField('authConfig', {
                  ...form.authConfig,
                  codeExpirationMinutes: e.target.value,
                })
              }
              placeholder={TEMPLATE_JSON_SCHEMA.authentication.fields.codeExpirationMinutes.placeholder}
            />
          </div>

          <Toggle
            label={TEMPLATE_JSON_SCHEMA.authentication.fields.addSecurityRecommendation.label}
            checked={Boolean(form.authConfig?.addSecurityRecommendation)}
            onChange={(checked) =>
              updateField('authConfig', {
                ...form.authConfig,
                addSecurityRecommendation: checked,
              })
            }
            helpText={TEMPLATE_JSON_SCHEMA.authentication.fields.addSecurityRecommendation.helpText}
          />
        </div>
      )}

      {/* ─── SECTION 9: ADVANCED OPTIONS ─── */}
      <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
            {TEMPLATE_JSON_SCHEMA.advanced.title}
          </h3>
          <p className="text-xs text-[var(--app-pages-subhead-text)]">
            {TEMPLATE_JSON_SCHEMA.advanced.description}
          </p>
        </div>

        <div className="space-y-4">
          <Toggle
            label={TEMPLATE_JSON_SCHEMA.advanced.fields.allowCategoryChange.label}
            checked={form.allowCategoryChange}
            onChange={(checked) => updateField('allowCategoryChange', checked)}
            helpText={TEMPLATE_JSON_SCHEMA.advanced.fields.allowCategoryChange.helpText}
          />

          <FloatingInput
            label={TEMPLATE_JSON_SCHEMA.advanced.fields.messageSendTtlSeconds.label}
            type="number"
            value={form.messageSendTtlSeconds}
            onChange={(e) => updateField('messageSendTtlSeconds', e.target.value)}
            placeholder={TEMPLATE_JSON_SCHEMA.advanced.fields.messageSendTtlSeconds.placeholder}
          />
        </div>
      </div>
    </div>
  )
}
