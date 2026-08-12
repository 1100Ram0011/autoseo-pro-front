import React, { useState } from 'react'
import { Btn, Toggle, FloatingInput, FloatingSelect } from '../ui/Msg91WaBaseUI'
import { PlusIcon, DragIcon, TrashIcon, InfoIcon } from '../ui/Msg91WaIcons'
import { BUTTON_TYPES, createButton } from '../../constants/Msg91TemplateConfig'
import { Tooltip } from '../ui/Msg91WaBaseUI'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getNextVariableIndex = (text = "") => {
  const matches = text.match(/\{\{(\d+)\}\}/g)
  if (!matches) return 1
  const numbers = matches.map(m => parseInt(m.replace(/[{}]/g, ""), 10))
  return Math.max(...numbers) + 1
}


// ─── Add Button Dropdown ──────────────────────────────────────────────────────
const AddButtonDropdown = ({
  onAdd,
  callCount,
  websiteCount,
  totalButtons,
}) => {
  const [open, setOpen] = useState(false)

  const qrCount = totalButtons - callCount - websiteCount
  const ctaCount = callCount + websiteCount
  const hasQR = qrCount > 0
  const hasCTA = ctaCount > 0

  const canAddCall = callCount < 1 && !hasQR
  const canAddWebsite = websiteCount < 2 && !hasQR
  const canAddQR = totalButtons < 10 && !hasCTA
  const canAdd = totalButtons < 10

  const sections = [
    // {
    //   title: 'Quick Reply Button',
    //   items: [
    //     {
    //       label: 'Custom',
    //       sub: null,
    //       type: BUTTON_TYPES.QUICK_REPLY,
    //       disabled: !canAddQR,
    //     },
    //   ],
    // },
    {
      title: 'Call-To-Action Buttons',
      items: [
        {
          label: 'Call Phone Number',
          sub: '1 button maximum',
          type: BUTTON_TYPES.CALL_PHONE,
          disabled: !canAddCall,
        },
        {
          label: 'Visit Website',
          sub: '2 buttons maximum',
          type: BUTTON_TYPES.VISIT_WEBSITE,
          disabled: !canAddWebsite,
        },
      ],
    },
  ]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Btn
        variant="primary"
        size="md"
        icon={<PlusIcon />}
        onClick={() => setOpen((o) => !o)}
      >
        Add Button
      </Btn>

      {open && (
        <>
          <div style={{}} onClick={() => setOpen(false)} />
          <div className="wa-fade-in absolute left-0 top-[calc(100%+5px)] z-[499] min-w-[230px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--app-pages-bg)] shadow-[0_8px_28px_rgba(0,0,0,0.13)]">
            {sections.map((section, si) => (
              <div key={si}>
                {/* Divider */}
                {si > 0 && (
                  <div className="my-1 h-[1px] bg-[var(--surface-2)]" />
                )}

                {/* Section Title */}
                <div className="px-3.5 pb-1 pt-2.5 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                  {section.title}
                </div>

                {/* Items */}
                {section.items.map((item, ii) => (
                  <button
                    key={ii}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) {
                        onAdd(item.type)
                        setOpen(false)
                      }
                    }}
                    className={`w-full px-3.5 py-2 text-left font-['DM_Sans',sans-serif] text-[13px] transition-colors ${item.disabled
                        ? 'cursor-not-allowed opacity-40'
                        : 'cursor-pointer hover:bg-[var(--surface-2)]'
                      } `}
                  >
                    <div className="text-[var(--text)]">{item.label}</div>

                    {item.sub && (
                      <div className="mt-0.5 text-[10px] text-[var(--text-light)]">
                        {item.sub}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}

            {/* Bottom CTA */}
            {/* <div className="border-t border-[var(--border)] px-3.5 py-2.5">
              <Btn
                variant="primary"
                size="sm"
                icon={<PlusIcon />}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setOpen(false)}
              >
                Add Button
              </Btn>
            </div> */}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Single Button Row ────────────────────────────────────────────────────────
const ButtonRow = ({ btn, onChange, onDelete, groupType }) => {
  const isQR = btn.type === BUTTON_TYPES.QUICK_REPLY
  const isCall = btn.type === BUTTON_TYPES.CALL_PHONE
  const isWebsite = btn.type === BUTTON_TYPES.VISIT_WEBSITE
  const up = (k, v) => onChange({ ...btn, [k]: v })

  return (
    <div
      className="
    border border-[var(--border)]
    rounded-lg
    bg-[var(--app-pages-bg)]
    mb-2
    px-3 py-3 pl-1.5
    transition-shadow
    hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]
  "
    >
      <div className="flex items-start gap-1.5">

        {/* Drag handle */}
        <div className="pt-3 cursor-grab shrink-0 opacity-50">
          <DragIcon size={13} />
        </div>

        {/* Fields */}
        <div className="flex-1 flex flex-col gap-2">

          {/* Row 1 */}
          {!isQR ? (
            <div className="flex gap-2">
              <FloatingSelect
                label="Type of Action *"
                value={btn.type}
                onChange={(e) => up('type', e.target.value)}
                options={[BUTTON_TYPES.CALL_PHONE, BUTTON_TYPES.VISIT_WEBSITE]}
                style={{ maxWidth: 220 }}
              />

              <FloatingInput
                label="Button Text *"
                value={btn.text}
                onChange={(e) => up('text', e.target.value)}
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <FloatingInput
                label="Button Text *"
                value={btn.text}
                onChange={(e) => up('text', e.target.value)}
              />
              <FloatingInput
                label="Payload ID (Hidden)"
                value={btn.payload || ''}
                onChange={(e) => up('payload', e.target.value)}
                placeholder="e.g. YES_BTN_1"
              />
            </div>
          )}

          {/* Row 2 */}
          {isCall && (
            <FloatingInput
              label="Mobile Number"
              value={btn.phone || ''}
              onChange={(e) => up('phone', e.target.value)}
              prefix={<span className="text-base">🇮🇳</span>}
            />
          )}

          {isWebsite && (
            <div>
              <FloatingInput
                label="URL *"
                value={btn.url || ''}
                onChange={(e) => up('url', e.target.value)}
              />

              <div className="flex justify-end items-center gap-1 mt-1.5">

                <button
                  type="button"
                  onClick={() => {
                    const next = getNextVariableIndex(btn.url)
                    up('url', (btn.url || '') + `{{${next}}}`)
                  }}
                  className="
                flex items-center gap-1
                text-[12px] font-medium
                text-[var(--blue)]
                hover:opacity-75
                transition-opacity
              "
                >
                  <PlusIcon size={11} />
                  Add Variable
                </button>

                <Tooltip content="Variables will be replaced with dynamic URL values when sending">
                  <InfoIcon size={12} color="var(--text-light)" />
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="
        pt-3 shrink-0 flex
        text-gray-400
        hover:text-red-600
        transition-colors
      "
        >
          <TrashIcon size={15} color="currentColor" />
        </button>

      </div>
    </div>
  )
}

// ─── Section divider (dots) ───────────────────────────────────────────────────
const SectionDivider = () => (
  <div
    style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0' }}
  >
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    <div style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--border)',
          }}
        />
      ))}
    </div>
    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
  </div>
)

// ─── Main ButtonSection ───────────────────────────────────────────────────────
const ButtonSection = ({
  buttons,
  onChange,
  enableClickCount,
  onToggleClickCount,
}) => {
  const callCount = buttons.filter(
    (b) => b.type === BUTTON_TYPES.CALL_PHONE
  ).length
  const websiteCount = buttons.filter(
    (b) => b.type === BUTTON_TYPES.VISIT_WEBSITE
  ).length
  const ctaButtons = buttons.filter((b) => b.type !== BUTTON_TYPES.QUICK_REPLY)
  const qrButtons = buttons.filter((b) => b.type === BUTTON_TYPES.QUICK_REPLY)

  const handleAdd = (type) => onChange([...buttons, createButton(type)])
  const handleUpd = (id, updated) =>
    onChange(buttons.map((b) => (b.id === id ? { ...b, ...updated } : b)))
  const handleDel = (id) => onChange(buttons.filter((b) => b.id !== id))

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: 3,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Button{' '}
        <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
          (Optional)
        </span>
      </div>
      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: '0 0 12px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Create buttons that let customers respond to your message or take
        action.
      </p>

      {/* Toolbar row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 6,
        }}
      >
        <AddButtonDropdown
          onAdd={handleAdd}
          callCount={callCount}
          websiteCount={websiteCount}
          totalButtons={buttons.length}
        />
        {/* <Toggle checked={enableClickCount} onChange={onToggleClickCount} label="Enable Click Count" /> */}
      </div>

      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: '6px 0 16px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <strong>Note:</strong> Do not enable click tracking when using any
        plugin connector.
      </p>

      {/* CTA section */}
      {ctaButtons.length > 0 && (
        <div style={{ marginBottom: 4 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Call to Action
          </div>
          {ctaButtons.map((btn) => (
            <ButtonRow
              key={btn.id}
              btn={btn}
              onChange={(upd) => handleUpd(btn.id, upd)}
              onDelete={() => handleDel(btn.id)}
            />
          ))}
        </div>
      )}

      {ctaButtons.length > 0 && qrButtons.length > 0 && <SectionDivider />}

      {/* Quick Reply section */}
      {qrButtons.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 8,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Quick Reply
          </div>
          {qrButtons.map((btn) => (
            <ButtonRow
              key={btn.id}
              btn={btn}
              onChange={(upd) => handleUpd(btn.id, upd)}
              onDelete={() => handleDel(btn.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ButtonSection
