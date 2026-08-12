import React from 'react'
import { PhoneIcon, ExternalLinkIcon, ReplyIcon, ImageIcon } from '../ui/Msg91WaIcons'
import { CATEGORIES, MARKETING_TYPES, PRODUCT_FORMATS, BUTTON_TYPES } from '../../constants/Msg91TemplateConfig'

const formatWhatsAppText = (text) => {
    if (!text) return "";

    let formatted = text;

    formatted = formatted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    formatted = formatted
        .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
        .replace(/_(.*?)_/g, "<em>$1</em>")
        .replace(/~(.*?)~/g, "<s>$1</s>")
        .replace(/`(.*?)`/g, "<code>$1</code>")

    formatted = formatted.replace(/\n/g, "<br/>");

    return formatted;
};


// ─── Preview bubble ───────────────────────────────────────────────────────────
const Bubble = ({ children, footer, buttons = [], showTime = true }) => (
    <div className="max-w-[92%] relative">
        <div className="bg-[var(--app-pages-bg)] rounded-[0_10px_10px_10px] overflow-hidden shadow-sm">
            {children}
        </div>
        {buttons.length > 0 && (
            <div className="mt-0.5 flex flex-col gap-0.5">
                {buttons.map((btn, i) => (
                    <div
                        key={i}
                        className="bg-[var(--app-pages-bg)] rounded-[10px] py-2 px-2.5 text-center text-xs font-medium
                                   text-[var(--app-pages-text)]
                                   shadow-sm
                                   flex items-center justify-center gap-1.5"
                    >
                        {btn.icon && btn.icon}
                        {btn.label || btn}
                    </div>
                ))}
            </div>
        )}
    </div>
)

const BubbleText = ({ text, color }) => (
    <div
        className="px-2.5 pt-2 pb-1 text-xs leading-[1.55] break-words text-[var(--app-pages-text)]"
        style={{ color: color || undefined }}
        dangerouslySetInnerHTML={{ __html: formatWhatsAppText(text) }}
    />
)

const BubbleFooter = ({ text }) => (
    <div className="px-2.5 pt-0.5 pb-1.5 text-[10px] text-[var(--app-pages-text)]">{text}</div>
)

const BubbleHeader = ({ text, bold }) => (
    <div className={`px-2.5 pt-2 pb-0.5 text-xs text-[var(--app-pages-text)] ${bold ? 'font-bold' : 'font-normal'}`}>
        {text}
    </div>
)

const BubbleMedia = ({ url, type }) => (
    <div className="bg-[var(--app-pages-bg)] h-32 flex items-center justify-center border-b border-[var(--app-pages-bg)] overflow-hidden">
        {url ? (
            type === 'VIDEO' ? (
                <video src={url} className="w-full h-full object-cover" />
            ) : type === 'DOCUMENT' ? (
                <div className="flex flex-col items-center text-[var(--app-pages-text)]">
                   <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                   <span className="text-xs mt-1">Document</span>
                </div>
            ) : (
                <img src={url} alt="Media" className="w-full h-full object-cover" />
            )
        ) : (
            <ImageIcon size={28} color="var(--app-pages-text)" />
        )}
    </div>
)

// ─── Main Preview ─────────────────────────────────────────────────────────────
const Msg91WhatsAppPreview = ({ form, hideShell = false }) => {
    const { category, marketingType, productFormat, header, headerText, body, footer, buttons = [], carouselCards = [], carouselButton1Type, carouselButton2Type } = form

    const ctaButtons = buttons.filter(b => b.type !== BUTTON_TYPES.QUICK_REPLY)
    const qrButtons = buttons.filter(b => b.type === BUTTON_TYPES.QUICK_REPLY)

    const renderButtons = () => {
        const all = []
        ctaButtons.forEach(b => {
            if (b.type === BUTTON_TYPES.CALL_PHONE)
                all.push({ label: b.text || 'Call Phone Number', icon: <PhoneIcon size={13} /> })
            if (b.type === BUTTON_TYPES.VISIT_WEBSITE)
                all.push({ label: b.text || 'Visit Website', icon: <ExternalLinkIcon size={13} /> })
        })
        qrButtons.forEach(b => {
            all.push({ label: b.text || 'Quick Reply', icon: <ReplyIcon size={13} /> })
        })
        return all
    }

    // ── Authentication ─────────────────────────────────────────────────────────
    if (category === CATEGORIES.AUTHENTICATION) {
        return (
            <PreviewShell hideShell={hideShell}>
                <Bubble buttons={[{ label: '📋 Copy code' }]}>
                    <BubbleText text="XXXXXX is your verification code." />
                </Bubble>
                <p className="text-[10px] text-[var(--app-pages-text)] mt-2.5 leading-relaxed font-[DM_Sans,sans-serif]">
                    <strong className="text-[var(--app-pages-text)]">Note:</strong> The message content might change according to your selected language
                </p>
            </PreviewShell>
        )
    }

    // ── Marketing > Product > Catalogue ────────────────────────────────────────
    if (category === CATEGORIES.MARKETING && marketingType === MARKETING_TYPES.PRODUCT && productFormat === PRODUCT_FORMATS.CATALOGUE) {
        return (
            <PreviewShell hideShell={hideShell}>
                <Bubble buttons={[{ label: '🛍️ View catalog' }]}>
                    {body && <BubbleText text={body} />}
                    {footer && <BubbleFooter text={footer} />}
                </Bubble>
            </PreviewShell>
        )
    }

    // ── Marketing > Product > Multi-product ────────────────────────────────────
    if (category === CATEGORIES.MARKETING && marketingType === MARKETING_TYPES.PRODUCT && productFormat === PRODUCT_FORMATS.MULTI_PRODUCT) {
        return (
            <PreviewShell hideShell={hideShell}>
                <Bubble buttons={[{ label: '📦 View items' }]}>
                    {form.headerText && <BubbleHeader text={form.headerText} />}
                    {body && <BubbleText text={body} />}
                    {footer && <BubbleFooter text={footer} />}
                </Bubble>
            </PreviewShell>
        )
    }

    // ── Marketing > Carousel ───────────────────────────────────────────────────
    if (category === CATEGORIES.MARKETING && marketingType === MARKETING_TYPES.CAROUSEL) {
        const btns = []
        if (carouselButton1Type && carouselButton1Type !== BUTTON_TYPES.NONE)
            btns.push({ label: 'Button 1', icon: carouselButton1Type === BUTTON_TYPES.CALL_PHONE ? <PhoneIcon size={12} /> : carouselButton1Type === BUTTON_TYPES.VISIT_WEBSITE ? <ExternalLinkIcon size={12} /> : <ReplyIcon size={12} /> })
        if (carouselButton2Type && carouselButton2Type !== BUTTON_TYPES.NONE)
            btns.push({ label: 'Button 2', icon: carouselButton2Type === BUTTON_TYPES.CALL_PHONE ? <PhoneIcon size={12} /> : carouselButton2Type === BUTTON_TYPES.VISIT_WEBSITE ? <ExternalLinkIcon size={12} /> : <ReplyIcon size={12} /> })

        return (
            <PreviewShell hideShell={hideShell}>
                {body && (
                    <Bubble>
                        <BubbleText text={body} />
                    </Bubble>
                )}
                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                    {carouselCards.map((card, i) => (
                        <div
                            key={card.id}
                            className="min-w-[150px] bg-[var(--app-pages-bg)] rounded-[10px] overflow-hidden
                                       shadow-sm flex-shrink-0"
                        >
                            <BubbleMedia url={card.headerUrl} type={card.headerMediaType} />
                            <div className="p-1.5 px-2 text-[11px] text-[var(--app-pages-text)] min-h-6">
                                {card.body || `Card ${i + 1}`}
                            </div>
                            {btns.map((btn, bi) => (
                                <div
                                    key={bi}
                                    className="border-t border-[var(--app-pages-bg)] p-1.5 px-2 text-[11px] text-[var(--app-pages-text)] flex items-center gap-1"
                                >
                                    {btn.icon} {btn.label}
                                </div>
                            ))}
                        </div>
                    ))}
                    <div className="min-w-7 flex items-center justify-center text-[var(--app-pages-text)]">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>
                </div>
            </PreviewShell>
        )
    }

    // ── Default: Custom / Utility ──────────────────────────────────────────────
    const hasHeader = header !== 'None'
    const hasContent = body || footer || hasHeader || buttons.length > 0
    const previewBtns = renderButtons()

    return (
        <PreviewShell hideShell={hideShell}>
            {hasContent ? (
                <Bubble buttons={previewBtns}>
                    {header === 'Text' && headerText && <BubbleHeader text={headerText} bold />}
                    {header === 'Media' && <BubbleMedia url={form.headerUrl} type={form.headerMediaType} />}
                    {header === 'Location' && (
                        <div className="bg-[var(--app-pages-bg)] h-[70px] flex items-center justify-center text-[11px] text-[var(--app-pages-text)] gap-1.5">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Location
                        </div>
                    )}
                    {body && <BubbleText text={body} />}
                    {footer && <BubbleFooter text={footer} />}
                </Bubble>
            ) : (
                <EmptyState />
            )}
        </PreviewShell>
    )
}

// ─── Shell ────────────────────────────────────────────────────────────────────
const PreviewShell = ({ children, hideShell }) => {
    if (hideShell) return <div className="flex flex-col w-full">{children}</div>;

    return (
        <div className="h-full flex flex-col w-full">
            <div className="text-xs font-semibold text-[var(--app-pages-text)] mb-3 font-[DM_Sans,sans-serif]">
                Preview
            </div>
            <div
                className="flex-1 rounded-[10px] p-3 overflow-y-auto
                        bg-[var(--app-pages-bg)]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Ccircle cx='3' cy='3' r='1' fill='%23c9bdb2' opacity='0.3'/%3E%3C/svg%3E")`,
                }}
            >
                {children}
            </div>
        </div>
    )
}

const EmptyState = () => (
    <div className="text-center pt-12 text-[var(--app-pages-text)] text-[11px] font-[DM_Sans,sans-serif] leading-loose">
        Preview will<br />appear here
    </div>
)

export default Msg91WhatsAppPreview