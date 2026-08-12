import React, { useState } from 'react'
import { Btn, Toggle, FloatingInput, FloatingSelect } from './WaBaseUI'
import { PlusIcon, DragIcon, TrashIcon, InfoIcon } from './WaIcons'
import { BUTTON_TYPES, createButton } from '../constants/templateConfig'
import { Tooltip } from './WaBaseUI'

// ─── Add Button Dropdown ──────────────────────────────────────────────────────
export const AddButtonDropdown = ({ onAdd, counts, totalButtons, allowedTypes }) => {
  const [open, setOpen] = useState(false)

  const canAdd = totalButtons < 10

  const allSections = [
    {
      title: 'Quick Reply Button',
      items: [
        {
          label: 'Custom',
          sub: null,
          type: BUTTON_TYPES.QUICK_REPLY,
          disabled: !canAdd,
        },
      ],
    },
    {
      title: 'Call-To-Action Buttons',
      items: [
        {
          label: 'Call Phone Number',
          sub: '1 button maximum',
          type: BUTTON_TYPES.PHONE_NUMBER,
          disabled: !counts.canAddCall || !canAdd,
        },
        {
          label: 'Visit Website',
          sub: '2 buttons maximum',
          type: BUTTON_TYPES.URL,
          disabled: !counts.canAddWebsite || !canAdd,
        },
        {
          label: 'Copy Offer Code',
          sub: '1 button maximum',
          type: BUTTON_TYPES.COPY_CODE,
          disabled: !counts.canAddCopyCode || !canAdd,
        },
        {
          label: 'Authentication (OTP)',
          sub: '1 button maximum',
          type: BUTTON_TYPES.OTP,
          disabled: !counts.canAddOtp || !canAdd,
        },
        {
          label: 'Complete Form (Flow)',
          sub: '1 button maximum',
          type: BUTTON_TYPES.FLOW,
          disabled: !counts.canAddFlow || !canAdd,
        },
        {
          label: 'View Catalog',
          sub: '1 button maximum',
          type: BUTTON_TYPES.CATALOG,
          disabled: !counts.canAddCatalog || !canAdd,
        },
        {
          label: 'Multi-Product',
          sub: '1 button maximum',
          type: BUTTON_TYPES.MPM,
          disabled: !counts.canAddMpm || !canAdd,
        },
      ],
    },
  ]

  const sections = allSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !allowedTypes || allowedTypes.includes(item.type)
      ),
    }))
    .filter((section) => section.items.length > 0)

  const allItems = sections.flatMap((s) => s.items)

  // If there's only one valid button type, skip the dropdown and add it directly
  if (allItems.length === 1) {
    const singleItem = allItems[0]
    return (
      <Btn
        variant="primary"
        size="md"
        icon={<PlusIcon />}
        onClick={() => {
          if (!singleItem.disabled) {
            onAdd(singleItem.type)
          }
        }}
        disabled={singleItem.disabled}
      >
        Add {singleItem.label}
      </Btn>
    )
  }

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
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 498 }}
            onClick={() => setOpen(false)}
          />
          <div
            className="wa-fade-in"
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 5px)',
              left: 0,
              background: '#fff',
              border: '1px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
              zIndex: 499,
              minWidth: 230,
              overflow: 'hidden',
            }}
          >
            {sections.map((section, si) => (
              <div key={si}>
                {si > 0 && (
                  <div
                    style={{
                      height: 1,
                      background: '#f3f4f6',
                      margin: '4px 0',
                    }}
                  />
                )}
                <div
                  style={{
                    padding: '10px 14px 4px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {section.title}
                </div>
                {section.items.map((item, ii) => (
                  <button
                    key={ii}
                    disabled={item.disabled}
                    type="button"
                    onClick={() => {
                      if (!item.disabled) {
                        onAdd(item.type)
                        setOpen(false)
                      }
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 14px',
                      border: 'none',
                      background: 'none',
                      cursor: item.disabled ? 'not-allowed' : 'pointer',
                      opacity: item.disabled ? 0.38 : 1,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      if (!item.disabled)
                        e.currentTarget.style.background = '#f9fafb'
                    }}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'none')
                    }
                  >
                    <div style={{ fontSize: 13, color: 'var(--text)' }}>
                      {item.label}
                    </div>
                    {item.sub && (
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--text-light)',
                          marginTop: 2,
                        }}
                      >
                        {item.sub}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Single Button Row ────────────────────────────────────────────────────────
const ButtonRow = ({ btn, onChange, onDelete, nextIndex }) => {
  const isQR = btn.type === BUTTON_TYPES.QUICK_REPLY
  const isCall = btn.type === BUTTON_TYPES.PHONE_NUMBER
  const isWebsite = btn.type === BUTTON_TYPES.URL
  const isCopyCode = btn.type === BUTTON_TYPES.COPY_CODE
  const isFlow = btn.type === BUTTON_TYPES.FLOW
  const isOtp = btn.type === BUTTON_TYPES.OTP

  const up = (k, v) => onChange({ ...btn, [k]: v })

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '12px 12px 12px 6px',
        background: '#fff',
        marginBottom: 8,
        transition: 'box-shadow 0.15s',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {/* Drag handle */}
        <div
          style={{
            paddingTop: 13,
            cursor: 'grab',
            flexShrink: 0,
            opacity: 0.5,
          }}
        >
          <DragIcon size={13} />
        </div>

        {/* Fields */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {/* Row 1: type selector + text */}
          {!isQR ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <FloatingSelect
                label="Type of Action *"
                value={btn.type}
                onChange={(e) => up('type', e.target.value)}
                options={[
                  {
                    value: BUTTON_TYPES.PHONE_NUMBER,
                    label: 'Call Phone Number',
                  },
                  { value: BUTTON_TYPES.URL, label: 'Visit Website' },
                  { value: BUTTON_TYPES.COPY_CODE, label: 'Copy Offer Code' },
                  { value: BUTTON_TYPES.OTP, label: 'Authentication (OTP)' },
                  { value: BUTTON_TYPES.FLOW, label: 'Complete Form (Flow)' },
                  { value: BUTTON_TYPES.CATALOG, label: 'View Catalog' },
                  { value: BUTTON_TYPES.MPM, label: 'Multi-Product' },
                ]}
                style={{ maxWidth: 220 }}
              />
              <FloatingInput
                label="Button Text *"
                value={btn.text}
                onChange={(e) => up('text', e.target.value)}
              />
            </div>
          ) : (
            <FloatingInput
              label="Button Text *"
              value={btn.text}
              onChange={(e) => up('text', e.target.value)}
            />
          )}

          {/* Row 2: context field */}
          {isCall && (
            <FloatingInput
              label="Mobile Number"
              value={btn.phoneNumber || ''}
              onChange={(e) => up('phoneNumber', e.target.value)}
              prefix={<span style={{ fontSize: 16 }}>🇮🇳</span>}
            />
          )}
          {isWebsite && (
            <div>
              <FloatingInput
                label="URL *"
                value={btn.url || ''}
                onChange={(e) => up('url', e.target.value)}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 5,
                }}
              >
                <button
                  type="button"
                  disabled={(btn.url || '').includes('{{1}}')}
                  onClick={() => {
                    const currentUrl = btn.url || ''
                    if (!currentUrl.includes('{{1}}')) {
                      up('url', currentUrl + '{{1}}')
                    }
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: (btn.url || '').includes('{{1}}')
                      ? 'not-allowed'
                      : 'pointer',
                    color: 'var(--blue)',
                    fontSize: 12,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: "'DM Sans', sans-serif",
                    opacity: (btn.url || '').includes('{{1}}') ? '0.5' : '1',
                  }}
                  onMouseEnter={(e) => {
                    if (!(btn.url || '').includes('{{1}}'))
                      e.currentTarget.style.opacity = '0.75'
                  }}
                  onMouseLeave={(e) => {
                    if (!(btn.url || '').includes('{{1}}'))
                      e.currentTarget.style.opacity = '1'
                  }}
                >
                  <PlusIcon size={11} /> Add Variable
                </button>
                <Tooltip content="Variables will be replaced with dynamic URL values when sending">
                  <InfoIcon size={12} color="var(--text-light)" />
                </Tooltip>
              </div>
            </div>
          )}
          {isCopyCode && (
            <FloatingInput
              label="Example Code *"
              value={btn.example?.[0] || ''}
              onChange={(e) => up('example', [e.target.value])}
              placeholder="e.g. SUMMER25"
            />
          )}
          {isFlow && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <FloatingInput
                  label="Flow ID *"
                  value={btn.flowId || ''}
                  onChange={(e) => up('flowId', e.target.value)}
                  style={{ flex: 1 }}
                />
                <FloatingInput
                  label="Flow Name"
                  value={btn.flowName || ''}
                  onChange={(e) => up('flowName', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <FloatingSelect
                  label="Action"
                  value={btn.flowAction || 'navigate'}
                  onChange={(e) => up('flowAction', e.target.value)}
                  options={[
                    { value: 'navigate', label: 'Navigate' },
                    { value: 'data_exchange', label: 'Data Exchange' },
                  ]}
                  style={{ flex: 1 }}
                />
                <FloatingInput
                  label="Navigate Screen (Optional)"
                  value={btn.navigateScreen || ''}
                  onChange={(e) => up('navigateScreen', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            paddingTop: 11,
            flexShrink: 0,
            color: '#bbb',
            display: 'flex',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#bbb')}
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
  nextIndex,
  allowedTypes,
}) => {
  const counts = {
    canAddCall:
      buttons.filter((b) => b.type === BUTTON_TYPES.PHONE_NUMBER).length < 1,
    canAddWebsite:
      buttons.filter((b) => b.type === BUTTON_TYPES.URL).length < 2,
    canAddCopyCode:
      buttons.filter((b) => b.type === BUTTON_TYPES.COPY_CODE).length < 1,
    canAddFlow: buttons.filter((b) => b.type === BUTTON_TYPES.FLOW).length < 1,
    canAddCatalog:
      buttons.filter((b) => b.type === BUTTON_TYPES.CATALOG).length < 1,
    canAddMpm: buttons.filter((b) => b.type === BUTTON_TYPES.MPM).length < 1,
    canAddOtp: buttons.filter((b) => b.type === BUTTON_TYPES.OTP).length < 1,
  }

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
          marginTop: '40px',
        }}
      >
        Button{' '}
        <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
          (Optional)
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          margin: '0 0 12px',
          fontFamily: "'DM Sans', sans-serif",
          marginTop: 10,
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
          marginBottom: 12,
          marginTop: 12,
        }}
      >
        <AddButtonDropdown
          onAdd={handleAdd}
          counts={counts}
          totalButtons={buttons.length}
          allowedTypes={allowedTypes}
        />
        {/* <Toggle
          checked={enableClickCount}
          onChange={onToggleClickCount}
          label="Enable Click Count"
        /> */}
      </div>

      {/* <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: '6px 0 16px',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <strong>Note:</strong> Do not enable click tracking when using any
        plugin connector.
      </p> */}

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
              nextIndex={nextIndex}
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
              nextIndex={nextIndex}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ButtonSection
