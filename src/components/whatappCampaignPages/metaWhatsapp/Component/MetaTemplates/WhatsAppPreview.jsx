import React, { useState } from 'react'
import {
  PhoneIcon,
  ExternalLinkIcon,
  ReplyIcon,
  ImageIcon,
  GiftIcon,
  CopyIcon,
} from './ui/WaIcons'
import {
  CATEGORIES,
  MARKETING_TYPES,
  PRODUCT_FORMATS,
  BUTTON_TYPES,
  UTILITY_TYPES,
} from './constants/templateConfig'

/* ─────────────────────────────────────────────────────────────────────────────
   FORMAT WHATSAPP RICH TEXT
   *bold* / _italic_ / ~strike~ / `mono` + line breaks
──────────────────────────────────────────────────────────────────────────────*/
const getUniqueVars = (text = '') => {
  const matches = text.match(/\{\{(\d+)\}\}/g)
  if (!matches) return []
  const numbers = [
    ...new Set(matches.map((m) => parseInt(m.replace(/[{}]/g, ''), 10))),
  ]
  return numbers.sort((a, b) => a - b)
}

const replaceVarsWithSamples = (text, samples = []) => {
  if (!text) return ''
  const vars = getUniqueVars(text)

  return text.replace(/\{\{(\d+)\}\}/g, (match, num) => {
    const numInt = parseInt(num, 10)
    const sampleIndex = vars.indexOf(numInt)
    if (sampleIndex !== -1 && samples[sampleIndex]) {
      return samples[sampleIndex]
    }
    return match
  })
}

const formatWhatsAppText = (text) => {
  if (!text) return ''

  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  formatted = formatted
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/~(.*?)~/g, '<s>$1</s>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>')

  return formatted
}

/* ─────────────────────────────────────────────────────────────────────────────
   BUBBLE COMPONENTS  (all preserved from original)
──────────────────────────────────────────────────────────────────────────────*/
const Bubble = ({ children, buttons = [] }) => (
  <div style={{ maxWidth: '92%', position: 'relative' }}>
    <div
      style={{
        background: '#fff',
        borderRadius: '0 10px 10px 10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      {children}
    </div>
    {buttons.length > 0 && (
      <div
        style={{
          marginTop: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {buttons.map((btn, i) => (
          <div
            key={i}
            style={{
              background: '#fff',
              borderRadius: 10,
              padding: '8px 10px',
              textAlign: 'center',
              fontSize: 12,
              color: '#1a73e8',
              fontWeight: 500,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            {btn.icon && btn.icon}
            {btn.label || btn}
          </div>
        ))}
      </div>
    )}
  </div>
)

const BubbleText = ({ text, color = 'var(--text)', samples = [] }) => {
  const textWithSamples = replaceVarsWithSamples(text, samples)
  return (
    <div
      style={{
        padding: '8px 10px 4px',
        fontSize: 13,
        color,
        lineHeight: 1.55,
        wordBreak: 'break-word',
        fontFamily: "'DM Sans', sans-serif",
      }}
      dangerouslySetInnerHTML={{ __html: formatWhatsAppText(textWithSamples) }}
    />
  )
}

const BubbleFooter = ({ text }) => (
  <div
    style={{
      padding: '2px 10px 6px',
      fontSize: 11,
      color: '#aaa',
      fontFamily: "'DM Sans', sans-serif",
    }}
  >
    {text}
  </div>
)

const BubbleHeader = ({ text, bold, samples = [] }) => {
  const textWithSamples = replaceVarsWithSamples(text, samples)
  return (
    <div
      style={{
        padding: '8px 10px 2px',
        fontSize: 13,
        fontWeight: bold ? 700 : 400,
        color: '#111',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {textWithSamples}
    </div>
  )
}

const BubbleMedia = () => (
  <div
    style={{
      background: '#f0f0f0',
      height: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottom: '1px solid #e8eaed',
    }}
  >
    <ImageIcon size={28} color="#ccc" />
  </div>
)

/* ─────────────────────────────────────────────────────────────────────────────
   HEADER RENDERER  — updated to read form.header object (schema-aligned)
   Original used: form.header (string) + form.headerText (string)
   New uses:       form.header.type + form.header.text + form.header.mediaUrl
──────────────────────────────────────────────────────────────────────────────*/
const renderHeaderInBubble = (header, samples = []) => {
  if (!header) return null

  const type = (header.format || header.type || 'NONE').toUpperCase()

  switch (type) {
    case 'TEXT':
      return header.text ? (
        <BubbleHeader text={header.text} bold samples={samples} />
      ) : null

    case 'IMAGE':
    case 'VIDEO':
    case 'DOCUMENT':
      // Show a tick if media has been uploaded, otherwise placeholder
      if (header.mediaUrl) {
        return (
          <div
            style={{
              background: '#e8f5e9',
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #e8eaed',
              gap: 6,
              fontSize: 11,
              color: '#388e3c',
              fontWeight: 600,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {type} ready
          </div>
        )
      }
      return <BubbleMedia />

    case 'LOCATION':
      return (
        <div
          style={{
            background: '#e8f4f8',
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: '#555',
            gap: 6,
          }}
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Location
        </div>
      )

    case 'NONE':
    default:
      return null
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PREVIEW COMPONENT
   Preserves all original branch logic.
   Only change: header reading updated to use form.header object.
──────────────────────────────────────────────────────────────────────────────*/
const WhatsAppPreview = ({ form, hideShell = false }) => {
  const [showCallRequestOptions, setShowCallRequestOptions] = useState(false)
  const [selectedPreference, setSelectedPreference] =
    useState('Always allow calls')

  if (!form) return null

  const {
    category,
    marketingType,
    productFormat,
    header,
    body,
    footer,
    buttons = [],
    carouselCards = [],
    carouselButton1Type,
    carouselButton2Type,
    authConfig,
  } = form

  console.log('form', form)

  // Build button display objects
  const ctaButtons = buttons.filter((b) => b.type !== BUTTON_TYPES.QUICK_REPLY)
  const qrButtons = buttons.filter((b) => b.type === BUTTON_TYPES.QUICK_REPLY)

  const renderButtons = () => {
    const all = []
    ctaButtons.forEach((b) => {
      if (b.type === BUTTON_TYPES.PHONE_NUMBER || b.type === 'PHONE')
        all.push({
          label: b.text || 'Call Phone Number',
          icon: <PhoneIcon size={13} />,
        })
      if (b.type === BUTTON_TYPES.URL || b.type === 'URL')
        all.push({
          label: b.text || 'Visit Website',
          icon: <ExternalLinkIcon size={13} />,
        })
      if (b.type === BUTTON_TYPES.COPY_CODE)
        all.push({ label: b.text || 'Copy Code', icon: <CopyIcon size={13} /> })
    })
    qrButtons.forEach((b) => {
      all.push({
        label: b.text || 'Quick Reply',
        icon: <ReplyIcon size={13} />,
      })
    })
    return all
  }

  // ── Authentication ─────────────────────────────────────────────────────────
  if (category === CATEGORIES.AUTHENTICATION || category === 'AUTHENTICATION') {
    return (
      <PreviewShell hideShell={hideShell}>
        <Bubble buttons={[{ label: '📋 Copy code' }]}>
          <BubbleText text="*XXXXXX* is your verification code." />
          {authConfig?.addSecurityRecommendation !== false && (
            <BubbleText
              text="For your security, do not share this code."
              color="#888"
            />
          )}
          {authConfig?.codeExpirationMinutes && (
            <BubbleText
              text={`This code expires in ${authConfig.codeExpirationMinutes} minutes.`}
              color="#aaa"
            />
          )}
        </Bubble>
        <p
          style={{
            fontSize: 10,
            color: '#888',
            marginTop: 10,
            lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <strong>Note:</strong> The message content might change according to
          your selected language.
        </p>
      </PreviewShell>
    )
  }

  // ── Call Request Permission (Utility & Marketing) ─────────────────────────
  const isCallRequest =
    ((category === CATEGORIES.UTILITY || category === 'UTILITY') &&
      form.utilityType === UTILITY_TYPES.CALL_REQUEST_PERMISSION) ||
    ((category === CATEGORIES.MARKETING || category === 'MARKETING') &&
      form.marketingType === MARKETING_TYPES.CALL_REQUEST_PERMISSION)

  if (isCallRequest) {
    const headerType = (header?.format || header?.type || 'NONE').toUpperCase()
    const hasTopContent = headerType !== 'NONE' || body || footer

    return (
      <PreviewShell hideShell={hideShell}>
        <Bubble>
          {/* Header, Body, Footer */}
          {hasTopContent && (
            <div style={{ paddingBottom: '4px' }}>
              {renderHeaderInBubble(header, form.headerSamples || [])}
              {body && (
                <BubbleText text={body} samples={form.bodySamples || []} />
              )}
              {footer && <BubbleFooter text={footer} />}
            </div>
          )}

          {/* Phone Block */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              padding: '12px 10px 12px',
              borderTop: hasTopContent ? '1px solid #e8eaed' : 'none',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#e8f0fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <PhoneIcon size={14} color="#1a73e8" />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text)',
                  lineHeight: 1.5,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Can {`{{business_name}}`} call you?
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#888',
                  lineHeight: 1.4,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                You can update your preference anytime in the business profile
              </div>
            </div>
          </div>

          {/* Choose Preference Button */}
          <div
            onClick={() => setShowCallRequestOptions(!showCallRequestOptions)}
            style={{
              borderTop: '1px solid #e8eaed',
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a73e8',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Choose preference
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              style={{ marginLeft: 4 }}
            >
              <polyline
                points={
                  showCallRequestOptions ? '18 15 12 9 6 15' : '6 9 12 15 18 9'
                }
              />
            </svg>
          </div>

          {/* Expanded Radio Buttons Section */}
          {showCallRequestOptions && (
            <div
              style={{
                padding: '0 10px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginTop: '4px',
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--text)',
                    lineHeight: 1.5,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Can {`{{business_name}}`} call you?
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#888',
                    lineHeight: 1.4,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  You can update your preference anytime in the business profile
                </div>
              </div>

              <div
                onClick={() => setSelectedPreference('Always allow calls')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedPreference === 'Always allow calls' && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#555',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#111',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Always allow calls
                </span>
              </div>

              <div
                onClick={() => setSelectedPreference('Temporary allow calls')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedPreference === 'Temporary allow calls' && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#555',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#111',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Temporary allow calls
                </span>
              </div>

              <div
                onClick={() => setSelectedPreference('Not at this time')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #555',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedPreference === 'Not at this time' && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#555',
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#111',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Not at this time
                </span>
              </div>
            </div>
          )}
        </Bubble>
        <p
          style={{
            fontSize: 10,
            color: '#888',
            marginTop: 10,
            lineHeight: 1.5,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <strong>Note:</strong> Meta requires specific components for this
          template type.
        </p>
      </PreviewShell>
    )
  }

  // ── Marketing > Product > Catalogue ────────────────────────────────────────
  if (
    (category === CATEGORIES.MARKETING || category === 'MARKETING') &&
    marketingType === MARKETING_TYPES.PRODUCT &&
    productFormat === PRODUCT_FORMATS.CATALOGUE
  ) {
    return (
      <PreviewShell hideShell={hideShell}>
        <Bubble buttons={[{ label: '🛍️ View catalog' }]}>
          {body && <BubbleText text={body} samples={form.bodySamples || []} />}
          {footer && <BubbleFooter text={footer} />}
        </Bubble>
      </PreviewShell>
    )
  }

  // ── Marketing > Product > Multi-product ────────────────────────────────────
  if (
    (category === CATEGORIES.MARKETING || category === 'MARKETING') &&
    marketingType === MARKETING_TYPES.PRODUCT &&
    productFormat === PRODUCT_FORMATS.MULTI_PRODUCT
  ) {
    return (
      <PreviewShell hideShell={hideShell}>
        <Bubble buttons={[{ label: '📦 View items' }]}>
          {/* Header text for multi-product uses form.header.text */}
          {header?.text && (
            <BubbleHeader
              text={header.text}
              samples={form.headerSamples || []}
            />
          )}
          {body && <BubbleText text={body} samples={form.bodySamples || []} />}
          {footer && <BubbleFooter text={footer} />}
        </Bubble>
      </PreviewShell>
    )
  }

  // ── Marketing > Carousel ───────────────────────────────────────────────────
  if (
    (category === CATEGORIES.MARKETING || category === 'MARKETING') &&
    marketingType === MARKETING_TYPES.CAROUSEL
  ) {
    const btns = []
    if (carouselButton1Type && carouselButton1Type !== BUTTON_TYPES.NONE)
      btns.push({
        label: 'Button 1',
        icon:
          carouselButton1Type === BUTTON_TYPES.PHONE_NUMBER ? (
            <PhoneIcon size={12} />
          ) : carouselButton1Type === BUTTON_TYPES.URL ? (
            <ExternalLinkIcon size={12} />
          ) : (
            <ReplyIcon size={12} />
          ),
      })
    if (carouselButton2Type && carouselButton2Type !== BUTTON_TYPES.NONE)
      btns.push({
        label: 'Button 2',
        icon:
          carouselButton2Type === BUTTON_TYPES.PHONE_NUMBER ? (
            <PhoneIcon size={12} />
          ) : carouselButton2Type === BUTTON_TYPES.URL ? (
            <ExternalLinkIcon size={12} />
          ) : (
            <ReplyIcon size={12} />
          ),
      })

    return (
      <PreviewShell hideShell={hideShell}>
        {body && (
          <Bubble>
            <BubbleText text={body} samples={form.bodySamples || []} />
          </Bubble>
        )}
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {carouselCards.map((card, i) => (
            <div
              key={card.id || i}
              style={{
                minWidth: 150,
                background: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            >
              {form.carouselHeaderType &&
                form.carouselHeaderType !== 'NONE' &&
                (card.headerHandle ? (
                  <div
                    style={{
                      background: '#e8f5e9',
                      height: 80,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid #e8eaed',
                      gap: 6,
                      fontSize: 11,
                      color: '#388e3c',
                      fontWeight: 600,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {form.carouselHeaderType} ready
                  </div>
                ) : (
                  <BubbleMedia />
                ))}
              <div
                style={{
                  padding: '6px 8px',
                  fontSize: 11,
                  color: '#333',
                  minHeight: 24,
                }}
              >
                {card.body || `Card ${i + 1}`}
              </div>
              {btns.map((btn, bi) => (
                <div
                  key={bi}
                  style={{
                    borderTop: '1px solid #f0f0f0',
                    padding: '6px 8px',
                    fontSize: 11,
                    color: '#1a73e8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {btn.icon} {card.buttons?.[bi]?.text || card[`button${bi + 1}Text`] || `Button ${bi + 1}`}
                </div>
              ))}
            </div>
          ))}
          <div
            style={{
              minWidth: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
            }}
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </PreviewShell>
    )
  }

  // ── Marketing > Limited Time Offer ─────────────────────────────────────────
  if (
    (category === CATEGORIES.MARKETING || category === 'MARKETING') &&
    marketingType === MARKETING_TYPES.LIMITED_TIME_OFFER
  ) {
    const previewBtns = renderButtons()

    return (
      <PreviewShell hideShell={hideShell}>
        <Bubble buttons={previewBtns}>
          {/* Header — now reads from form.header object */}
          {renderHeaderInBubble(header, form.headerSamples || [])}

          {/* Offer Message Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '12px 10px',
              background: '#f8f9fa',
              borderBottom: '1px solid #e8eaed',
              borderTop:
                header?.type && header?.type !== 'NONE'
                  ? 'none'
                  : '1px solid #e8eaed',
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <GiftIcon size={16} color="#555" />
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {form.offerMessage || 'Offer details'}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Offer ends in expiration time
              </div>
            </div>
          </div>

          {body && <BubbleText text={body} samples={form.bodySamples || []} />}
          {footer && <BubbleFooter text={footer} />}
        </Bubble>
      </PreviewShell>
    )
  }

  // ── Default: Custom / Utility ──────────────────────────────────────────────
  const headerType = (header?.format || header?.type || 'NONE').toUpperCase()
  const hasHeader = headerType !== 'NONE'
  const hasContent = body || footer || hasHeader || buttons.length > 0
  const previewBtns = renderButtons()

  return (
    <PreviewShell hideShell={hideShell}>
      {hasContent ? (
        <Bubble buttons={previewBtns}>
          {/* Header — now reads from form.header object */}
          {renderHeaderInBubble(header, form.headerSamples || [])}
          {body && <BubbleText text={body} samples={form.bodySamples || []} />}
          {footer && <BubbleFooter text={footer} />}
        </Bubble>
      ) : (
        <EmptyState />
      )}
    </PreviewShell>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHELL + EMPTY STATE  (preserved from original)
──────────────────────────────────────────────────────────────────────────────*/
const PreviewShell = ({ children, hideShell = false }) => {
  if (hideShell) return <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>{children}</div>;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: 1,
          background: '#e5ddd5',
          borderRadius: 10,
          padding: 12,
          overflowY: 'auto',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='3' cy='3' r='1' fill='%23c9bdb2' opacity='0.3'/%3E%3C/svg%3E")`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

const EmptyState = () => (
  <div
    style={{
      textAlign: 'center',
      paddingTop: 50,
      color: '#bbb',
      fontSize: 11,
      fontFamily: "'DM Sans', sans-serif",
      lineHeight: 1.8,
    }}
  >
    Preview will
    <br />
    appear here
  </div>
)

export default WhatsAppPreview
