// WhatsappOnboardingPage.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/redux/store/store'
import AuthPage from '@/pages/user/AuthPage'

import { AnimatePresence, motion } from 'framer-motion'

import { useSelector } from 'react-redux'

import {
    useSubmitOnboardingFormMutation,
    useConfirmFbAdminMutation,
    useSubmitConnectionRequestMutation,
    useCancelOnboardingRequestMutation,
    useGetMyOnboardingRequestsQuery,
    useConnectEmbeddedWhatsappMutation,
} from '@/redux/apis/Templateapi'
import { ThemedToast } from '@/ReUseAbleComponents/ThemedToast'
import { parsePhoneNumberFromString, getCountryCallingCode } from 'libphonenumber-js';
import { useMemo } from 'react'
import { ConfirmModal } from '@/components/profile/BankDetails'
import { useTheme } from '@/components/global/theme-provider'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { FileText, Rocket, Search, UserStar } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractErrorMessage = (err) => {
    if (!err) return 'Unknown error'
    if (typeof err === 'string') return err
    return (
        err?.data?.message
        ?? err?.data?.error
        ?? err?.error
        ?? err?.message
        ?? `Error ${err?.status ?? ''}`
    )
}


const STATUS_META = {
    PENDING: { label: 'Pending', dot: 'bg-amber-400', badge: 'bg-[var(--app-pages-bg)] text-amber-600' },
    FB_CONFIRMED: { label: 'FB Confirmed', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
    SUBMITTED: { label: 'Submitted', dot: 'bg-violet-500', badge: 'bg-violet-50 text-violet-700' },
    APPROVED: { label: 'Approved', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
    REJECTED: { label: 'Rejected', dot: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
    CANCELLED: { label: 'Cancelled', dot: 'bg-red-400', badge: 'bg-red-50 text-red-700' },
}

const NUMBER_STATUS_META = {
    PENDING: { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-600' },
    APPROVED: { label: 'Approved', dot: 'bg-emerald-500', text: 'text-emerald-700' },
    REJECTED: { label: 'Rejected', dot: 'bg-red-500', text: 'text-red-600' },
}

// ── Steps per connection type ─────────────────────────────────────────────────
const MSG91_STEPS = [
    { key: 'form', label: 'Fill Form', icon: '📋' },
    { key: 'submit', label: 'Submitted', icon: '🚀' },
    { key: 'review', label: 'Under Review', icon: <Search /> },
    { key: 'done', label: 'Activated', icon: '✅' },
]

const FB_STEPS = [
    { key: 'form', label: 'Fill Form', icon: <FileText className="w-4 h-4" /> },
    { key: 'fb', label: 'Add FB Admin', icon: <UserStar className="w-4 h-4" /> },
    { key: 'submit', label: 'Submit', icon: <Rocket className="w-4 h-4 " /> },
    { key: 'review', label: 'Under Review', icon: <Search className="w-4 h-4" /> },
]

const getMsg91StepIndex = (status) => {
    if (!status || status === 'PENDING') return 0
    if (status === 'SUBMITTED') return 1
    if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) return 3
    return 0
}

const getFbStepIndex = (status) => {
    if (!status || status === 'PENDING') return 0
    if (status === 'FB_CONFIRMED') return 1
    if (status === 'SUBMITTED') return 2
    if (['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) return 3
    return 0
}

const STATUS_FILTERS = ['', 'PENDING', 'FB_CONFIRMED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED']

const INDUSTRY_OPTIONS = [
    'Technology', 'E-Commerce', 'Healthcare', 'Education',
    'Finance', 'Retail', 'Real Estate', 'Hospitality',
    'Manufacturing', 'Logistics', 'Media', 'Other',
]

const ALLOWED_FB_ORIGINS = [
    'https://www.facebook.com',
    'https://web.facebook.com',
    'https://business.facebook.com',
]


// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry, onDismiss }) => (
    <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-[var(--app-pages-bg)] rounded-lg text-sm text-[var(--app-debit-color)]">
        <svg width="16" height="16" fill="none" stroke="var(--app-debit-color)" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="flex-1 leading-relaxed">{message}</span>
        <div className="flex gap-2 shrink-0">
            {onRetry && <button onClick={onRetry} className="bg-[var(--app-pages-bg)] text-[var(--app-debit-color)] text-xs font-semibold rounded-md px-3 py-1 cursor-pointer">Retry</button>}
            {onDismiss && <button onClick={onDismiss} className="text-[var(--app-pages-text)] hover:text-[var(--app-pages-colormuted)] text-lg leading-none bg-transparent border-none cursor-pointer">×</button>}
        </div>
    </div>
)


// ─── Tab ──────────────────────────────────────────────────────────────────────
const Tab = ({ label, isActive, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`relative pb-3 text-sm font-medium border-none bg-transparent cursor-pointer flex items-center gap-1.5 transition-colors ${isActive ? 'text-[var(--app-brand-primary)]' : 'text-[var(--app-pages-text)]  hover:text-[var(--app-pages-text)] '}`}
    >
        {label}
        {badge != null && (
            <span className={`rounded-full text-[10px] font-bold px-1.5 py-px leading-4 ${isActive ? 'bg-[var(--app-pages-bg)] text-[var(--app-brand-primary)]' : 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] '}`}>{badge}</span>
        )}
        {isActive && <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[var(--app-brand-primary)] rounded-full" />}
    </button>
)


// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <div className="flex gap-3 px-5 py-3.5 border-b border-[var(--app-pages-border)] items-center">
        {[160, 100, 80, 80, 70].map((w, i) => (
            <div key={i} className="h-3 rounded-md bg-[var(--app-pages-bg)] animate-pulse" style={{ width: w }} />
        ))}
    </div>
)
const SkeletonTable = () => <div>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</div>


// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const m = STATUS_META[status] ?? { label: status, dot: 'bg-[var(--app-pages-bg)]', badge: 'bg-gray-100 text-[var(--app-pages-text)]' }
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full text-[11px] font-semibold px-2.5 py-0.5 whitespace-nowrap ${m.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
            {m.label}
        </span>
    )
}


// ─── Connection Type Badge ────────────────────────────────────────────────────
const ConnectionTypeBadge = ({ type }) => {
    if (type === 'msg91') return (
        <span className="inline-flex items-center gap-1 bg-[var(--app-pages-bg)] text-[var(--app-brand-primary)] border border-[var(--app-brand-primary)] rounded-full text-[10px] font-semibold px-2 py-0.5">
            ⚡ MSG91
        </span>
    )
    return (
        <span className="inline-flex items-center gap-1 bg-[var(--app-pages-bg)] text-[var(--app-brand-primary)] border border-[var(--app-brand-primary)] rounded-full text-[10px] font-semibold px-2 py-0.5">
            Facebook
        </span>
    )
}


// ─── Step Progress Bar ────────────────────────────────────────────────────────
const StepBar = ({ currentStatus, connectionType }) => {
    const isMSG91 = connectionType === 'msg91'
    const steps = isMSG91 ? MSG91_STEPS : FB_STEPS
    const activeIdx = isMSG91 ? getMsg91StepIndex(currentStatus) : getFbStepIndex(currentStatus)
    const isTerminal = ['APPROVED', 'REJECTED', 'CANCELLED'].includes(currentStatus)

    return (
        <div className="mb-6 flex max-w-full touch-pan-x items-center overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {steps.map((step, idx) => {
                const done = idx < activeIdx
                const active = idx === activeIdx
                const isLast = idx === steps.length - 1

                const dotCls = done
                    ? 'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)]'
                    : active && currentStatus === 'REJECTED' ? 'bg-[var(--app-debit-color)] ring-4 ring-[var(--app-debit-color)]'
                        : active && currentStatus === 'APPROVED' ? 'bg-[var(--app-credit-color)] ring-4 ring-[var(--app-credit-color)]'
                            : active && currentStatus === 'CANCELLED' ? 'bg-[var(--app-pages-bg)] ring-4 ring-gray-100'
                                : active ? ' bg-[var(--app-brand-primary)] ring-4 ring-[var(--app-brand-primary)]'
                                    : 'bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)]'

                const labelCls = done ? 'text-[var(--app-pages-primary)] font-semibold'
                    : active ? 'text-[var(--app-pages-text)] font-semibold'
                        : 'text-[var(--app-pages-subhead-text)]'

                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 72 }}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all mt-2 text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)]`}>
                                {done ? <span className=" text-xs font-bold">✓</span> : step.icon}
                            </div>
                            <span className={`text-[11px] text-center leading-tight ${labelCls}`}>
                                {isTerminal && idx === activeIdx
                                    ? currentStatus === 'APPROVED' ? '✅ Approved'
                                        : currentStatus === 'REJECTED' ? '❌ Rejected'
                                            : '🚫 Cancelled'
                                    : step.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`flex-1 h-0.5 mb-5 transition-colors ${done ? 'bg-[var(--app-brand-primary)]' : 'bg-[var(--app-pages-muted)]'}`} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}


export const NumberTagInput = ({ numbers, onChange }) => {
    const [input, setInput] = useState('');
    const [countryInfo, setCountryInfo] = useState(null);
    const [error, setError] = useState('');

    const parsedNumber = useMemo(() => {
        const digits = input.replace(/\D/g, '');
        if (!digits) return null;
        return parsePhoneNumberFromString(`+${digits}`);
    }, [input]);

    const addNumber = () => {
        const digits = input.replace(/\D/g, '');
        const phoneNumber = parsePhoneNumberFromString(`+${digits}`);

        if (!digits || !phoneNumber || !phoneNumber.isValid()) {
            setError('Enter a valid WhatsApp number');
            return;
        }

        const cleanVal = phoneNumber.number.replace('+', '');

        if (!numbers.includes(cleanVal)) {
            onChange([...numbers, cleanVal]);
        }

        setInput('');
        setError('');
    };

    const selectedRegion =
        parsedNumber?.country
        || countryInfo?.name
        || countryInfo?.countryCode?.toUpperCase()
        || 'selected country';

    return (
        <div className="w-full">
            <div
                className={`rounded-xl border bg-[var(--app-pages-bg)] transition-all duration-300
                ${error
                        ? 'border-[var(--app-debit-color)] ring-2 ring-[var(--app-debit-color)] '
                        : 'border-[var(--app-pages-border)] focus-within:border-[var(--app-brand-primary)] focus-within:ring-2 focus-within:ring-[var(--app-brand-primary)] '
                    }`}
            >
                {numbers.length > 0 && (
                    <div className="flex flex-wrap gap-2 border-b border-[var(--app-pages-border)] px-3 py-2">
                        {numbers.map(n => (
                            <span key={n} className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] px-2.5 py-1 text-sm font-semibold text-[var(--app-pages-text)]">
                                <span className="shrink-0 text-[var(--app-pages-text)] font-normal">+</span>
                                <span className="min-w-0 break-all">{n}</span>
                                <button
                                    type="button"
                                    onClick={() => onChange(numbers.filter(x => x !== n))}
                                    className="shrink-0 text-lg leading-none transition-colors hover:text-[var(--app-debit-color)]"
                                    aria-label={`Remove +${n}`}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 px-0">
                    <PhoneInput
                        country="in"
                        countryCodeEditable={false}
                        enableSearch={true}
                        disableDropdown={false}
                        containerClass="profile-phone-container"
                        inputClass="profile-phone-input"
                        buttonClass="profile-phone-button"
                        dropdownClass="profile-phone-dropdown"
                        searchClass="profile-phone-search"
                        value={input}
                        onChange={(phone, country) => {
                            setInput(phone || '');
                            setCountryInfo(country || null);
                            if (error) setError('');
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addNumber();
                            }
                        }}
                        placeholder={numbers.length === 0 ? 'WhatsApp number' : 'Add another number'}
                        containerStyle={{
                            width: '100%',
                            position: 'relative',
                            zIndex: 40,
                            borderRadius: '12px',
                            backgroundColor: 'transparent',
                        }}
                    />
                    <button
                        type="button"
                        onClick={addNumber}
                        disabled={!input}
                        className="mr-2 shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90 "
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="mt-1.5 min-h-[16px] px-1">
                {error ? (
                    <p className="text-[11px] text-red-600 font-medium">
                        {error}
                    </p>
                ) : (
                    <p className="text-[var(--app-pages-subhead-text)]  text-[11px]">
                        {input ? `Selected: ${selectedRegion}` : 'Choose country code and enter WhatsApp number'}
                    </p>
                )}
            </div>
        </div>
    );
};


// ─── Form Primitives ──────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
    <div className="mb-4">
        <label className=" block text-sm font-medium text-[var(--app-pages-text)] mb-1.5">
            {label} {required && <span className="text-[var(--app-debit-color)]">*</span>}
        </label>
        {children}
        {hint && <p className="mt-1 text-[11px] text-[var(--app-pages-text)]">{hint}</p>}
    </div>
);

const Input = ({ className = '', ...props }) => (
    <input {...props} className={`w-full border  border-[var(--app-pages-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] outline-none ${className}`} />
);

const Select = ({ className = '', children, ...props }) => (
    <select {...props} className={`w-full border border-[var(--app-pages-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] outline-none ${className}`}>
        {children}
    </select>
)

const Textarea = ({ className = '', ...props }) => (
    <textarea {...props} className={` w-full border border-[var(--app-pages-border)] rounded-lg px-3 py-2.5 text-sm text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] outline-none transition-colors resize-y min-h-[72px] placeholder-[var(--app-pages-subhead-text)] ${className}`} />
)


// ─── Connection Type Selector ──────────────────────────────────────────────────
const ConnectionTypeSelector = ({ value, onChange }) => (
    <div className="grid grid-cols-2 gap-3 mb-6 bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]">
        <button
            type="button"
            onClick={() => onChange('facebook')}
            className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${value === 'facebook'
                ? 'border-[var(--app-brand-primary)] bg-[var(--app-pages-bg)] '
                : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] hover:border-[var(--app-brand-primary)]'
                }`}
        >
            <div className="bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]  flex items-center justify-between w-full">
                <span className="text-xl"></span>
                {value === 'facebook' && (
                    <span className="w-4 h-4 rounded-full bg-[var(--app-brand-primary)] flex items-center justify-center">
                        <span className="text-[var(--app-profile-btn-text)] text-[8px] font-bold">✓</span>
                    </span>
                )}
            </div>
            <div>
                <p className={`m-0 text-sm font-semibold ${value === 'facebook' ? 'text-[var(--app-brand-primary)]' : 'text-[var(--app-pages-text)]'}`}>
                    Connect via Facebook
                </p>
                <p className="  m-0 mt-0.5 text-[11px] text-[var(--app-pages-subhead-text)] leading-relaxed">
                    Add our FB Business Manager as admin to your page.
                </p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${value === 'facebook' ? 'bg-[var(--app-brand-primary)] text-[var(--app-profile-btn-text)]' : 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'}`}>
                Manual steps · 2–3 days
            </span>
        </button>

        {/* <button
            type="button"
            disabled
            onClick={() => onChange('facebook_embedded')}
            className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${value === 'facebook_embedded'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-100 bg-[var(--app-pages-bg)] hover:border-gray-100'
                } cursor-not-allowed `}
        >
            <div className="flex items-center justify-between w-full">
                <span className="text-xl">⚡</span>
                {value === 'facebook_embedded' && (
                    <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold">✓</span>
                    </span>
                )}
            </div>
            <div>
                <p className={`m-0 text-sm font-semibold ${value === 'facebook_embedded' ? 'text-green-700' : 'text-[var(--app-pages-text)]'}`}>
                    Connect Instantly via Facebook
                </p>
                <p className="m-0 mt-0.5 text-[11px] text-[var(--app-pages-text)] leading-relaxed">
                    Login with Facebook &amp; select your WhatsApp number. Done in 2 minutes.
                </p>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${value === 'facebook_embedded' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-[var(--app-pages-text)]'}`}>
                Recommended · Instant ✨
            </span>
        </button> */}
    </div>
)


// ─── FB Admin Guide ───────────────────────────────────────────────────────────
const FB_METHODS = [
    {
        key: 'bm',
        icon: '',
        label: 'Via Meta Business Suite',
        badge: 'business.facebook.com',
        badgeCls: 'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)]',
        steps: [
            { n: 1, text: 'Go to business.facebook.com → Business Settings' },
            { n: 2, text: 'Click People → Add' },
            { n: 3, text: 'Click on invite people' },
            { n: 4, text: `Enter the ${process.env.NEXT_PUBLIC_EMAIL_ADDRESS} email address` },
            { n: 5, text: 'Assign them to your WhatsApp-linked Page' },
            { n: 6, text: 'Set role to Admin and send the invite' },
        ],
        note: 'We review before accepting the request.',
    },
    {
        key: 'fb',
        icon: '',
        // label: 'Via Facebook (New Pages Experience)',
        // badge: 'Most common ',
        badgeCls: 'bg-emerald-50 text-emerald-700',
        steps: [
            { n: 1, text: 'Go to your Facebook Page' },
            { n: 2, text: 'Click Settings (left side)' },
            { n: 3, text: 'Click Page access' },
            { n: 4, text: 'Under "People with Facebook access", click Add New' },
            { n: 5, text: 'Click Next, then enter their email' },
            {
                n: 6,
                text: 'Choose their access level:',
                sub: ['Full control (Admin)'],
            },
            { n: 7, text: 'Enter your Facebook password to confirm' },
        ],
        note: 'The we will accept the invitation.',
    },
]


const FbAdminGuide = ({ compact = false }) => {
    const [open, setOpen] = useState(!compact)
    const [activeMethod, setActiveMethod] = useState('bm')
    const method = FB_METHODS.find(m => m.key === activeMethod)

    return (
        <div className="mt-3 rounded-xl bg-[var(--app-profile-btn-bg)] overflow-hidden">
            {/* Collapsible header */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left"
            >
                <div className="flex items-center gap-2">
                    <span className="text-base"></span>
                    <span className="text-xs font-semibold text-[var(--app-profile-btn-text)]">
                        How to add our Business Manager as admin
                    </span>
                </div>
                <span className="text-[var(--app-profile-btn-text)] text-xs font-medium select-none">
                    {open ? '▲ Hide' : '▼ Show steps'}
                </span>
            </button>

            {open && (
                <div className="px-4 pb-4">
                    {/* Method switcher tabs */}
                    {/* <div className="flex gap-2 mb-3 flex-wrap">
                        {FB_METHODS.map(m => (
                            <button
                                key={m.key}
                                type="button"
                                onClick={() => setActiveMethod(m.key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${activeMethod === m.key
                                    ? 'bg-[var(--app-pages-bg)] border-blue-300 text-blue-800 shadow-sm'
                                    : 'bg-transparent border-transparent text-blue-500 hover:text-blue-700'
                                    }`}
                            >
                                <span>{m.icon}</span>
                                {m.label}
                            </button>
                        ))}
                    </div> */}

                    {/* Active method badge */}
                    {/* <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${method.badgeCls}`}>
                        {method.badge}
                    </span> */}

                    {/* Numbered steps */}
                    <ol className="flex flex-col gap-2 m-0 p-0 list-none">
                        {method.steps.map(step => (
                            <li key={step.n} className="flex items-start gap-2.5">
                                <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]  text-[10px] font-bold flex items-center justify-center mt-0.5">
                                    {step.n}
                                </span>
                                <div>
                                    <span className="text-xs text-[var(--app-profile-btn-text)] leading-relaxed">{step.text}</span>
                                    {step.sub && (
                                        <ul className="mt-1 ml-2 flex flex-col gap-0.5 list-none p-0">
                                            {step.sub.map((s, i) => (
                                                <li key={i} className="text-[11px] text-[var(--app-pages-text)] flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-[var(--app-pages-bg)] shrink-0" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>

                    {/* Optional note */}
                    {method.note && (
                        <div className="mt-3 px-3 py-2 text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] rounded-lg text-xs  font-medium">
                            {method.note}
                        </div>
                    )}

                    {/* BM ID quick-copy */}
                    {process.env.NEXT_PUBLIC_FB_BM_ID && (
                        <div className="mt-3 grid grid-cols-1 gap-2 px-3 py-2 bg-[var(--app-pages-bg)]  border border-[var(--app-pages-border)] rounded-lg sm:grid-cols-2">
                            <div className="min-w-0">
                                <span className="block text-[11px]   text-[var(--app-pages-text)] font-medium">Our BM ID:</span>
                                <code className="mt-1 block w-full text-[11px] leading-snug font-mono font-bold text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] px-1.5 py-0.5 rounded select-all break-all">
                                    {process.env.NEXT_PUBLIC_FB_BM_ID}
                                </code>
                            </div>
                            <div className="min-w-0">
                                <span className="block text-[11px]   text-[var(--app-pages-text)] font-medium">Our Email ID:</span>
                                <code className="mt-1 block w-full text-[11px] leading-snug font-mono font-bold text-[var(--app-pages-text)] bg-[var(--app-pages-bg)] px-1.5 py-0.5 rounded select-all break-all">
                                    {process.env.NEXT_PUBLIC_EMAIL_ADDRESS}
                                </code>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}




// ─── Onboarding Form Modal ────────────────────────────────────────────────────
const EMPTY_FORM = {
    connectionType: '',
    whatsappNumbers: [],
    businessName: '',
    businessEmail: '',
    userNotes: '',
    userFullName: '',
    userName: '',
    businessPhone: '',
    businessIndustry: '',
    facebookPageId: '',
    facebookPageName: '',
}

const OnboardingFormModal = ({ open, onClose, onSuccess, launchEmbeddedSignup, embeddedLoading, requireAuth }) => {
    const [form, setForm] = useState(EMPTY_FORM)
    const [errors, setErrors] = useState({})
    const [submitForm, { isLoading }] = useSubmitOnboardingFormMutation()

    const set = (key, val) => {
        setForm(p => ({ ...p, [key]: val }))
        setErrors(p => ({ ...p, [key]: '' }))
    }

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    // const businessNameRegex = /^[A-Za-z0-9\s&.-]{2,100}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{8,15}$/;
    const validate = () => {
        const e = {}

        if (!form.connectionType)
            e.connectionType = 'Please choose a connection method'

        if (form.connectionType !== 'facebook_embedded') {
            if (form.whatsappNumbers.length === 0)
                e.whatsappNumbers = 'At least one number is required'

            // if (!form.businessName.trim())
            //     e.businessName = 'Business name is required'
            // else if (!businessNameRegex.test(form.businessName))
            //     e.businessName = 'Invalid business name'

            if (!form.businessEmail.trim())
                e.businessEmail = 'Business email is required'
            else if (!emailRegex.test(form.businessEmail))
                e.businessEmail = 'Invalid email format'
        }

        if (form.connectionType === 'msg91') {
            if (!form.userFullName.trim())
                e.userFullName = 'Full name is required'
            else if (!nameRegex.test(form.userFullName))
                e.userFullName = 'Only alphabets allowed'

            if (!form.userName.trim())
                e.userName = 'Username is required'
            else if (!usernameRegex.test(form.userName))
                e.userName = 'Only letters, numbers, underscore (3–20 chars)'

            if (!form.businessPhone.trim())
                e.businessPhone = 'Business phone is required'
            else if (!phoneRegex.test(form.businessPhone))
                e.businessPhone = 'Invalid phone number (8–15 digits)'

            if (!form.businessIndustry)
                e.businessIndustry = 'Industry is required'
        }

        setErrors(e)
        return Object.keys(e).length === 0
    }


    const handleSubmit = async () => {
        console.log(form)
        if (!validate()) return

        if (requireAuth()) return

        try {
            const res = await submitForm(form).unwrap()
            onSuccess(res?.data)
            onClose()
            setForm(EMPTY_FORM)
            setErrors({})
        } catch (err) {
            setErrors({ _global: extractErrorMessage(err) })
        }
    }

    const handleClose = () => {
        onClose()
        setForm(EMPTY_FORM)
        setErrors({})
    }

    if (!open) return null

    const isMSG91 = form.connectionType === 'msg91'
    const isFacebook = form.connectionType === 'facebook'
    const isEmbedded = form.connectionType === 'facebook_embedded'

    return (
        <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="no-scrollbar bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeSlideIn_0.2s_ease]">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-[var(--app-pages-border)] flex justify-between items-start ">
                    <div>
                        <h2 className="m-0 text-base font-bold text-[var(--app-pages-text)]">Connect WhatsApp Number</h2>
                        <p className="mt-1 text-xs text-[var(--app-pages-subhead-text)]">Choose how you'd like to connect your number.</p>
                    </div>
                    <button onClick={handleClose} className="text-[var(--app-pages-subhead-text)] hover:text-[var(--app-pages-text)] text-xl leading-none bg-transparent border-none cursor-pointer">×</button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 ">
                    {errors._global && (
                        <ErrorBanner message={errors._global} onDismiss={() => setErrors(p => ({ ...p, _global: '' }))} />
                    )}

                    {/* Step 1: Connection type */}
                    <div className="mb-2">
                        <p className="text-xs font-semibold text-[var(--app-pages-text)] uppercase tracking-wide mb-3">
                            How would you like to connect?
                        </p>
                        <ConnectionTypeSelector
                            value={form.connectionType}
                            onChange={val => set('connectionType', val)}
                        />
                        {errors.connectionType && (
                            <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.connectionType}</p>
                        )}
                    </div>

                    {/* Embedded Signup — CTA only, no form fields */}
                    {isEmbedded && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-3xl">⚡</div>
                            <div className="text-center">
                                <p className="m-0 text-sm font-semibold text-[var(--app-pages-text)]">Click below to connect your WhatsApp</p>
                                <p className="mt-1 m-0 text-xs text-[var(--app-pages-subhead-text)] leading-relaxed max-w-xs">
                                    A Facebook popup will open. Log in and select your WhatsApp Business account and
                                    phone number. Done in 2 minutes — no manual steps required.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (requireAuth?.()) return
                                    launchEmbeddedSignup()
                                    handleClose()
                                }}
                                disabled={embeddedLoading}
                                className={`flex items-center gap-2 text-[var(--app-pages-text)] border-none rounded-xl px-7 py-3 text-sm font-bold cursor-pointer transition-colors shadow-lg ${embeddedLoading
                                    ? 'bg-[var(--app-pages-bg)] cursor-not-allowed'
                                    : 'bg-[var(--app-pages-bg)] hover:bg-[var(--app-pages-bg)]'
                                    }`}
                            >
                                {embeddedLoading
                                    ? <><span className="animate-spin">⏳</span> Connecting…</>
                                    : <><span className="text-base"></span> Continue with Facebook</>
                                }
                            </button>
                            <p className="m-0 text-[11px] text-[var(--app-pages-subhead-text)]">
                                Your number is registered automatically after the Facebook flow completes.
                            </p>
                        </div>
                    )}

                    {/* Step 2: Fields for non-embedded types */}
                    {form.connectionType && !isEmbedded && (
                        <>
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex-1 h-px bg-[var(--app-pages-bg)]" />
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isMSG91 ? 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]' : 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'}`}>
                                    {isMSG91 ? '⚡ MSG91 Details' : 'Facebook Details'}
                                </span>
                                <div className="flex-1 h-px bg-[var(--app-pages-bg)]" />
                            </div>

                            {/* WhatsApp Numbers — shared */}
                            <Field label="WhatsApp Numbers" required>
                                <NumberTagInput
                                    numbers={form.whatsappNumbers}
                                    onChange={val => set('whatsappNumbers', val)}
                                />
                                {errors.whatsappNumbers && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.whatsappNumbers}</p>}
                            </Field>

                            {/* MSG91 fields */}
                            {isMSG91 && (
                                <>
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <Field label="Full Name" required hint="Your name for the MSG91 sub-account">
                                            <Input
                                                placeholder="John Doe"
                                                value={form.userFullName}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                                                    set('userFullName', value)
                                                }}
                                            />
                                            {errors.userFullName && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.userFullName}</p>}
                                        </Field>
                                        <Field label="Username" required hint="MSG91 login username (no spaces)">
                                            <Input placeholder="johndoe91" value={form.userName} onChange={e => set('userName', e.target.value.replace(/^[a-zA-Z0-9_]{3,20}$/, ''))} />
                                            {errors.userName && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.userName}</p>}
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        <Field label="Business Name" required>
                                            <Input
                                                placeholder="Business Name"
                                                value={form.businessName}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^A-Za-z0-9\s&.-]/g, '')
                                                    set('businessName', value)
                                                }}
                                            />
                                            {errors.businessName && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.businessName}</p>}
                                        </Field>
                                        <Field label="Business Email" required>
                                            <Input
                                                type="email"
                                                placeholder="admin@domain.com"
                                                value={form.businessEmail}
                                                onChange={(e) => {
                                                    const value = e.target.value.trim()
                                                    set('businessEmail', value)
                                                }}
                                            />
                                            {errors.businessEmail && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.businessEmail}</p>}
                                        </Field>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3.5">
                                        <Field label="Business Phone" required hint="Primary contact number with country code">
                                            <Input
                                                placeholder="919876543210"
                                                value={form.businessPhone}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 15)
                                                    set('businessPhone', value)
                                                }}
                                            />
                                            {errors.businessPhone && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.businessPhone}</p>}
                                        </Field>
                                        <Field label="Industry" required>
                                            <Select value={form.businessIndustry} onChange={e => set('businessIndustry', e.target.value)}>
                                                <option value="">Select industry…</option>
                                                {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </Select>
                                            {errors.businessIndustry && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.businessIndustry}</p>}
                                        </Field>
                                    </div>
                                    <div className="flex items-start gap-2.5 p-3 bg-[var(--app-pages-bg)] border border-indigo-100 rounded-lg text-xs text-indigo-700 leading-relaxed mb-4">
                                        <span className="text-base shrink-0">ℹ️</span>
                                        <span>We'll create a MSG91 sub-account for you and connect your number directly. No Facebook steps needed.</span>
                                    </div>
                                </>
                            )}

                            {/* Facebook manual fields */}
                            {isFacebook && (
                                <>
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <Field label="User Name" required>
                                            <Input
                                                placeholder="John Doe"
                                                value={form.userFullName}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                                                    set('userFullName', value)
                                                }}
                                            />
                                            {errors.userFullName && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.userFullName}</p>}
                                        </Field>
                                        <Field label="Business Email" required>
                                            <Input
                                                type="email"
                                                placeholder="admin@domain.com"
                                                value={form.businessEmail}
                                                onChange={(e) => {
                                                    const value = e.target.value.trim()
                                                    set('businessEmail', value)
                                                }}
                                            />
                                            {errors.businessEmail && <p className="mt-1 text-[11px] text-[var(--app-debit-color)]">{errors.businessEmail}</p>}
                                        </Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <Field label="Facebook Page ID" hint="Optional — helps us verify faster">
                                            <Input
                                                placeholder="123456789"
                                                value={form.facebookPageId}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '')
                                                    set('facebookPageId', value)
                                                }}
                                            />
                                        </Field>
                                        <Field label="Facebook Page Name">
                                            <Input
                                                placeholder="Business Page Name"
                                                value={form.facebookPageName}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^A-Za-z0-9\s&.-]/g, '')
                                                    set('facebookPageName', value)
                                                }}
                                            />
                                        </Field>
                                    </div>

                                    {/* ── FB Admin Guide (expanded by default in modal) ── */}
                                    <div className="mb-4">
                                        <FbAdminGuide compact={false} />
                                    </div>
                                </>
                            )}

                            {/* Notes — shared */}
                            <Field label="Notes">
                                <Textarea
                                    placeholder="Any additional info for our team…"
                                    value={form.userNotes}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^A-Za-z0-9\s.,!?-]/g, '')
                                        set('userNotes', value)
                                    }}
                                />
                            </Field>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isEmbedded && (
                    <div className="bg-[var(--app-pages-bg)]  px-6 py-3.5 border-t border-[var(--app-pages-border)]  flex justify-end gap-2.5">
                        <button onClick={handleClose} className="border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]  text-[var(--app-pages-text)] rounded-lg px-5 py-2 text-sm font-medium cursor-pointer hover:border-[var(--app-pages-border)] ">
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || !form.connectionType}
                            className={`text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] border-none rounded-lg px-6 py-2 text-sm font-semibold cursor-pointer transition-colors ${isLoading || !form.connectionType
                                ? 'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] cursor-not-allowed'
                                : 'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)]'
                                }`}
                        >
                            {isLoading ? 'Submitting…' : isMSG91 ? 'Submit via MSG91' : 'Submit & Connect Facebook'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}


// ─── Request Card ─────────────────────────────────────────────────────────────
const RequestCard = ({ request, onFbConfirm, onSubmit, onCancel, actionLoading }) => {
    const isMSG91 = request.connectionType === 'msg91'
    const canFb = !isMSG91 && request.connectionStatus === 'PENDING'
    const canSub = !isMSG91 && request.connectionStatus === 'FB_CONFIRMED'
    const canCan = !['APPROVED', 'CANCELLED', 'REJECTED'].includes(request.connectionStatus)

    return (
        <div className="mb-3 min-w-0 overflow-hidden rounded-xl border border-[var(--app-pages-border)] shadow-sm transition-shadow hover:shadow-md mt-2 text-[var(--app-pages-text)]">
            <div className="flex flex-col gap-2 border-b border-[var(--app-pages-border)] px-4 py-3.5  sm:flex-row sm:items-start sm:justify-between sm:px-5">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--app-pages-text)]">{request.businessName}</span>
                        <StatusBadge status={request.connectionStatus} />
                        <ConnectionTypeBadge type={request.connectionType} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs text-[var(--app-pages-text)]">
                        {request.userFullName && <span>👤 {request.userFullName}</span>}
                        <span>{request.businessEmail}</span>
                        {request.businessPhone && <span>📞 +{request.businessPhone}</span>}
                        {request.businessIndustry && (
                            <span className="bg-gray-100 text-[var(--app-pages-text)] rounded-full px-2 py-0.5 text-[10px] font-medium">
                                {request.businessIndustry}
                            </span>
                        )}
                        {request.facebookPageName && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-[10px]">
                                {request.facebookPageName}
                            </span>
                        )}
                    </div>
                </div>
                <span className="shrink-0 text-[11px] text-[var(--app-pages-text)] sm:ml-4">
                    {new Date(request.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>

            <div className="px-4 pt-4 sm:px-5">
                <StepBar currentStatus={request.connectionStatus} connectionType={request.connectionType} />
            </div>

            <div className="px-4 pb-4 sm:px-5">
                <p className="text-[11px] font-semibold text-[var(--app-pages-text)] uppercase tracking-wide mb-2">Numbers</p>
                <div className="flex flex-wrap gap-1.5">
                    {request.whatsappNumbers?.map((entry, i) => {
                        const nm = NUMBER_STATUS_META[entry.status] ?? { dot: 'bg-[var(--app-pages-bg)]', text: 'text-[var(--app-pages-text)]', label: entry.status }
                        return (
                            <span key={i} className="inline-flex items-center gap-1.5 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-md px-2.5 py-1 text-xs text-[var(--app-pages-text)]">
                                <span className={`w-1.5 h-1.5 rounded-full ${nm.dot}`} />
                                +{entry.number}
                                <span className={`text-[10px] font-semibold ${nm.text}`}>{nm.label}</span>
                            </span>
                        )
                    })}
                </div>

                {isMSG91 && request.connectionStatus === 'PENDING' && request.msg91Error && (
                    <div className="mt-3 p-3 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-lg text-xs text-[var(--app-pages-text)]">
                        ⚠️ <strong>MSG91 submission pending.</strong> Our team will retry and activate your number shortly.
                    </div>
                )}
                {isMSG91 && request.connectionStatus === 'SUBMITTED' && (
                    <div className="mt-3 p-3 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-lg text-xs text-[var(--app-pages-text)]">
                        <Search/> <strong>Under review.</strong> Submitted to MSG91. We'll activate your number within 24 hours.
                    </div>
                )}

                {/* ── FB Admin Guide (collapsed by default in card) ── */}
                {canFb && (
                    <div className="mt-3">
                        <div className="mb-2 p-3 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-lg text-xs text-[var(--app-pages-text)] font-medium">
                            Action required — add our Business Manager as admin to your Facebook Page, then click <strong>"Confirm FB Admin"</strong> below.
                        </div>
                        <FbAdminGuide compact={true} />
                    </div>
                )}

                {canSub && (
                    <div className="mt-3 p-3 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-lg text-xs text-[var(--app-pages-text)] font-medium">
                        ✅ <strong>FB admin confirmed!</strong> You can now submit your connection request.
                    </div>
                )}
                {request.rejectionReason && (
                    <div className="mt-2.5 p-3 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-lg text-xs text-[var(--app-pages-text)] font-medium">
                        ❌ <strong>Reason:</strong> {request.rejectionReason}
                    </div>
                )}
                {request.adminNotes && (
                    <div className="mt-2.5 p-3 bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] rounded-lg text-xs text-[var(--app-pages-text)] font-medium">
                        💬 <strong>Admin note:</strong> {request.adminNotes}
                    </div>
                )}
            </div>

            {(canFb || canSub || canCan) && (
                <div className="flex flex-col gap-2 border-t border-[var(--app-pages-border)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                    {canCan && (
                        <button
                            onClick={() => onCancel(request._id)}
                            disabled={actionLoading === request._id}
                            className="w-full cursor-pointer rounded-lg border border-[var(--app-pages-border)] px-3.5 py-1.5 text-xs font-medium text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-colors hover:opacity-90  disabled:opacity-50 sm:w-auto"
                        >
                            Cancel Request
                        </button>
                    )}
                    {canFb && (
                        <button
                            onClick={() => onFbConfirm(request._id)}
                            disabled={actionLoading === request._id}
                            className="w-full cursor-pointer rounded-lg border-none px-4 py-1.5 text-xs font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-colors hover:opacity-90 disabled:opacity-50 sm:w-auto"
                        >
                            {actionLoading === request._id ? '…' : ' Confirm FB Admin'}
                        </button>
                    )}
                    {canSub && (
                        <button
                            onClick={() => onSubmit(request._id)}
                            disabled={actionLoading === request._id}
                            className="w-full cursor-pointer rounded-lg border-none px-4 py-1.5 text-xs font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-colors hover:opacity-90  disabled:opacity-50 sm:w-auto"
                        >
                            {actionLoading === request._id ? '…' : ' Submit Connection Request'}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}


// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[var(--app-pages-bg)]">
        {icon && <div className="w-14 h-14 rounded-2xl bg-[var(--app-pages-bg)] flex items-center justify-center mb-4 text-2xl">{icon}</div>}
        <h3 className="m-0 mb-1.5 text-[15px] font-semibold text-[var(--app-pages-text)]">{title}</h3>
        <p className="m-0 mb-5 text-sm text-[var(--app-pages-text)] max-w-xs leading-relaxed">{description}</p>
        {action}
    </div>
)


// ─── Inner Page ───────────────────────────────────────────────────────────────
export const Msg91WhatsappOnboardingPage = () => {
    const [activeTab, setActiveTab] = useState('requests')
    const [formOpen, setFormOpen] = useState(false)
    const [toast, setToast] = useState(null)
    const [dismissedErrors, setDismissedErrors] = useState({})
    const [actionLoading, setActionLoading] = useState(null)
    const [statusFilter, setStatusFilter] = useState('')
    const [embeddedLoading, setEmbeddedLoading] = useState(false)

    const [showAuthModal, setShowAuthModal] = useState(false)

    const reduxUser = useSelector((state) => state.auth?.user)

    const requireAuth = () => {
        if (reduxUser?.isGuest) {
            setShowAuthModal(true)
            return true
        }
        return false
    }

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type })
    }, [])

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(t);
    }, [toast]);

    const dismissError = useCallback((key) => setDismissedErrors(p => ({ ...p, [key]: true })), [])

    const [confirmFbAdmin] = useConfirmFbAdminMutation()
    const [submitConnectionRequest] = useSubmitConnectionRequestMutation()
    const [cancelRequest, { isLoading: cancelLoading }] = useCancelOnboardingRequestMutation()
    const [connectEmbeddedWhatsapp] = useConnectEmbeddedWhatsappMutation()

    const wabaIdRef = useRef(null)
    const phoneNumberIdRef = useRef(null)
    const embeddedCancelledRef = useRef(false)

    const { data: requestsData, isLoading, isError, error, refetch } =
        useGetMyOnboardingRequestsQuery({ status: statusFilter || undefined })

    const requests = React.useMemo(() => {
        if (!requestsData) return []
        return requestsData?.data ?? (Array.isArray(requestsData) ? requestsData : [])
    }, [requestsData])

    const total = requestsData?.pagination?.totalRecords ?? requests.length
    const showError = isError && !dismissedErrors['requests']

    // ── Load FB SDK once ──────────────────────────────────────────────────────
    useEffect(() => {
        if (window.FB) return

        window.fbAsyncInit = function () {
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FB_APP_ID,
                autoLogAppEvents: false,
                xfbml: false,
                version: 'v22.0',
            })
        }

        if (!document.getElementById('facebook-jssdk')) {
            const script = document.createElement('script')
            script.id = 'facebook-jssdk'
            script.src = 'https://connect.facebook.net/en_US/sdk.js'
            script.async = true
            script.defer = true
            document.body.appendChild(script)
        }
    }, [])

    // ── postMessage listener ──────────────────────────────────────────────────
    useEffect(() => {
        const handleMessage = (event) => {
            if (!ALLOWED_FB_ORIGINS.includes(event.origin)) return

            let msgData
            try {
                msgData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
            } catch {
                return
            }

            if (msgData?.type !== 'WA_EMBEDDED_SIGNUP') return

            if (msgData.event === 'FINISH') {
                const { waba_id, phone_number_id } = msgData.data ?? {}
                if (waba_id) {
                    wabaIdRef.current = waba_id
                    phoneNumberIdRef.current = phone_number_id ?? null
                } else {
                    showToast('Incomplete data received from Facebook. Please try again.', 'error')
                }
            } else if (msgData.event === 'CANCEL') {
                wabaIdRef.current = null
                phoneNumberIdRef.current = null
                embeddedCancelledRef.current = true
                showToast('WhatsApp connection was cancelled.', 'info')
            } else if (msgData.event === 'ERROR') {
                wabaIdRef.current = null
                phoneNumberIdRef.current = null
                showToast(
                    `Facebook error: ${msgData.data?.error_message || 'Something went wrong'}`,
                    'error'
                )
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [showToast])

    // ── Launch embedded signup popup ──────────────────────────────────────────
    const launchEmbeddedSignup = useCallback(() => {
        if (!window.FB) {
            showToast('Facebook SDK not loaded yet. Please wait a moment.', 'error')
            return
        }

        wabaIdRef.current = null
        phoneNumberIdRef.current = null
        embeddedCancelledRef.current = false

        window.FB.login(
            (response) => {
                if (!response.authResponse) {
                    if (!embeddedCancelledRef.current) {
                        showToast('WhatsApp connection was cancelled.', 'info')
                    }
                    embeddedCancelledRef.current = false
                    setEmbeddedLoading(false)
                    return
                }

                const code = response.authResponse.code
                const wabaId = wabaIdRef.current
                const phoneNumberId = phoneNumberIdRef.current

                if (!code) {
                    showToast('No authorisation code received from Facebook. Please try again.', 'error')
                    setEmbeddedLoading(false)
                    return
                }

                if (!wabaId) {
                    showToast('WABA ID not received from Facebook. Please try again.', 'error')
                    setEmbeddedLoading(false)
                    return
                }

                showToast('Connecting your WhatsApp number…', 'info')

                    ; (async () => {
                        try {
                            const result = await connectEmbeddedWhatsapp({
                                code,
                                wabaId,
                                phoneNumberId,
                            }).unwrap()

                            const connectedCount = result.connected_numbers?.filter(n => n.status === 'connected').length ?? 0

                            showToast(
                                connectedCount > 0
                                    ? `✅ ${connectedCount} WhatsApp number${connectedCount !== 1 ? 's' : ''} connected successfully!`
                                    : '⚠️ Flow completed but no numbers were connected. Please try again.',
                                connectedCount > 0 ? 'success' : 'error'
                            )
                            refetch()
                        } catch (err) {
                            showToast(
                                extractErrorMessage(err) || 'Connection failed. Please try again.',
                                'error'
                            )
                        } finally {
                            setEmbeddedLoading(false)
                            wabaIdRef.current = null
                            phoneNumberIdRef.current = null
                        }
                    })()
            },
            {
                config_id: process.env.NEXT_PUBLIC_FB_CONFIG_ID,
                response_type: 'code',
                override_default_response_type: true,
                extras: {
                    setup: {
                        solutionID: process.env.NEXT_PUBLIC_MSG91_SOLUTION_ID,
                    },
                    featureType: '',
                    sessionInfoVersion: '3',
                },
            }
        )

        setEmbeddedLoading(true)
    }, [connectEmbeddedWhatsapp, refetch, showToast])

    // ── Request action handlers ───────────────────────────────────────────────
    const handleFbConfirm = useCallback(async (id) => {
        setActionLoading(id)
        try {
            await confirmFbAdmin(id).unwrap()
            showToast('Facebook admin confirmed! You can now submit the connection request.')
            refetch()
        } catch (err) {
            showToast(extractErrorMessage(err), 'error')
        } finally { setActionLoading(null) }
    }, [confirmFbAdmin, refetch, showToast])

    const handleSubmit = useCallback(async (id) => {
        setActionLoading(id)
        try {
            await submitConnectionRequest(id).unwrap()
            showToast('Connection request submitted! Our team will review shortly.')
            refetch()
        } catch (err) {
            showToast(extractErrorMessage(err), 'error')
        } finally { setActionLoading(null) }
    }, [submitConnectionRequest, refetch, showToast])


    const handleFormSuccess = useCallback(() => {
        showToast('Request submitted successfully!')
        refetch()
        setActiveTab('requests')
    }, [refetch, showToast])


    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const userId = reduxUser?._id || reduxUser?.id;
    const user = reduxUser;
    const { isDark } = useTheme();
    const GRAD_A = "#1B2D45";
    const GRAD_B = "#2d4a6e";
    const gradientStyle = {
        backgroundImage: isDark
            ? `linear-gradient(135deg, ${GRAD_A}, ${GRAD_B})`
            : "var(--app-accent-gradient)",
    };


    const confirmDelete = async () => {
        if (!selectedRequestId) return;
        try {
            await cancelRequest(selectedRequestId).unwrap()
            setDeleteModalOpen(false);
            setSelectedRequestId(null);
            // if (expandedRow === selectedRequestId) setExpandedRow(null);
        } catch (error) {
            console.error("Failed to delete request:", error);
            toast.custom(
                <ThemedToast type="error" message={`${error?.message}`} />,
                { id: "delete-request-error", duration: 5000 }
            );
        }
    };



    const handleCancel = (id) => {
        setActionLoading(id)
        setSelectedRequestId(id)
        setDeleteModalOpen(true)
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* ✅ FIX 1: FULL HEIGHT */}
            <div className="flex max-w-full flex-col overflow-x-hidden bg-[var(--app-pages-bg)]">

                {/* HEADER */}
                <div className="shrink-0 px-4 py-4 bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] sm:px-6 lg:px-7">
    <h1 className="text-lg font-bold text-[var(--app-pages-text)]">
        WhatsApp Number Onboarding
    </h1>
    <p className="text-sm text-[var(--app-pages-subhead-text)] mt-1">
        Connect your WhatsApp numbers via Facebook Business Manager.
    </p>
    <button
        onClick={() => setFormOpen(true)}
        className="mt-3 text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90 rounded-lg px-4 py-2 text-sm font-semibold "
    >
        + Connect Number
    </button>
</div>

                {/* MAIN */}
                <div className="flex min-h-0 max-w-full flex-1 flex-col px-3 py-4 bg-[var(--app-pages-bg)] sm:px-6 lg:px-7">

                    {/* ✅ FIX 2: FLEX CONTAINER */}
                    <div className="flex min-h-0 max-w-full flex-col rounded border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm ">

                        {/* FILTER / HEADER (FIXED) */}
                        <div className="shrink-0 p-4 border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] ">

                            {showError && (
                                <ErrorBanner
                                    message={`Failed to load requests: ${extractErrorMessage(error)}`}
                                    onRetry={() => {
                                        setDismissedErrors(p => ({ ...p, requests: false }))
                                        refetch()
                                    }}
                                    onDismiss={() => setDismissedErrors(p => ({ ...p, requests: true }))}
                                />
                            )}

                            <div className="flex gap-2 flex-wrap">
                                {STATUS_FILTERS.map((s) => (
                                    <button
                                        key={s || 'all'}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1 text-xs rounded-full border transition ${statusFilter === s
                                            ? 'text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] font-semibold'
                                            : 'bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] border-[var(--app-pages-border)]'
                                            }`}
                                    >
                                        {s || 'All'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ✅ FIX 3: ONLY THIS SCROLLS */}
                        <div className="  no-scrollbar min-h-0 flex-1 overflow-visible px-3 bg-[var(--app-pages-bg)] sm:max-h-[40vh] sm:overflow-y-auto sm:px-5">

                            {isLoading && <SkeletonTable />}

                            {!isLoading &&
                                requests.map((req) => (
                                    <RequestCard
                                        key={req._id}
                                        request={req}
                                        actionLoading={actionLoading}
                                        onFbConfirm={handleFbConfirm}
                                        onSubmit={handleSubmit}
                                        onCancel={handleCancel}
                                    />
                                ))}

                            {!isLoading && requests.length === 0 && (
                                <EmptyState
                                    icon={null}
                                    title="No onboarding requests yet"
                                    description="Connect your WhatsApp number instantly or manually."
                                    action={
                                        <button
                                            onClick={() => setFormOpen(true)}
                                            className="
                                                text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90
                                                rounded-lg px-5 py-2 text-sm font-semibold
                                                
                                            "
                                        >
                                            + Connect Number
                                        </button>
                                    }
                                />
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="flex shrink-0 justify-between gap-3 border-t px-4 py-2 text-xs text-[var(--app-pages-subhead-text)] bg-[var(--app-pages-bg)] ">
                            <span>
                                {isLoading
                                    ? 'Loading...'
                                    : `${requests.length} request${requests.length !== 1 ? 's' : ''}`}
                            </span>
                            <span>WhatsApp Onboarding</span>
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                <OnboardingFormModal
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    onSuccess={handleFormSuccess}
                    launchEmbeddedSignup={launchEmbeddedSignup}
                    embeddedLoading={embeddedLoading}
                    requireAuth={requireAuth}
                />

                {toast && (
                    <ThemedToast
                        type={toast.type}
                        message={toast.message}
                        onDismiss={() => setToast(null)}
                    />
                )}

                <AnimatePresence>
                    {showAuthModal && (
                        <motion.div
                            key="auth-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1100] bg-[var(--app-pages-bg)]/70 backdrop-blur-sm"
                            onMouseDown={(e) => {
                                if (e.target === e.currentTarget) setShowAuthModal(false)
                            }}
                        >
                            <div className="flex min-h-full items-center justify-center p-4">
                                <motion.div
                                    initial={{ scale: 0.98, opacity: 0, y: 8 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.98, opacity: 0, y: 8 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                                    className="relative w-full max-w-xl rounded-2xl bg-[var(--app-pages-bg)]"
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    {/* Close button */}
                                    <button
                                        onClick={() => setShowAuthModal(false)}
                                        className="absolute right-4 top-4"
                                    >
                                        ✕
                                    </button>

                                    {/* 🔑 Actual Auth Page */}
                                    <AuthPage onSuccess={() => setShowAuthModal(false)} />
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>


            </div>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {deleteModalOpen && (
                    <ConfirmModal
                        isOpen={deleteModalOpen}
                        isDark={isDark}
                        gradientStyle={gradientStyle}
                        onClose={() => { setDeleteModalOpen(false); setActionLoading(null) }}
                        onConfirm={confirmDelete}
                        type="delete"
                        title="Delete Whatsapp Request"
                        message="Are you sure you want to delete this request? This action cannot be undone."
                        confirmLabel={cancelLoading ? "Deleting..." : "Delete Request"}
                    />
                )}
            </AnimatePresence>
        </>
    )

}

// ─── Root Export ──────────────────────────────────────────────────────────────
const Msg91WhatsappOnboarding = () => (
    <Provider store={store}>
        <Msg91WhatsappOnboardingPage />
    </Provider>
)

export default Msg91WhatsappOnboarding
