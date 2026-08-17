import { useState, useMemo } from 'react'
import { useOutletContext } from '@/components/react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  Key,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ShieldOff,
  Phone,
  Clock,
  Activity,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Globe,
  Lock,
  Zap,
  Terminal,
  Code2,
  Server,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Reusable Components ──
import PageHeader from '../Component/PageHeader'
import Button from '../Component/Button'
import LoadingSpinner from '../Component/LoadingSpinner'
import EmptyState from '../Component/EmptyState'
import ConfirmDialog from '../Component/ConfirmDialog'

// ── Redux Hooks ──
import {
  useGetApiKeysQuery,
  useGenerateApiKeyMutation,
  useRegenerateApiKeyMutation,
  useRevokeApiKeyMutation,
  useGetWhatsappNumberQuery,
} from '@/redux/apis/metaWhatsapp.api'

// ── Copy to Clipboard Hook ──
function useCopyToClipboard() {
  const [copied, setCopied] = useState(null)

  const copy = async (text, id = 'default') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return { copied, copy }
}

// ── Time Ago Helper ──
function timeAgo(date) {
  if (!date) return 'Never'
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ── Expiry Options ──
const EXPIRY_OPTIONS = [
  { value: 'never', label: 'Never expires' },
  { value: '30d', label: '30 days' },
  { value: '60d', label: '60 days' },
  { value: '90d', label: '90 days' },
]

// ════════════════════════════════════════════════════════════════
// CopyBlock — Sleek code block styled with standard slate colors
// ════════════════════════════════════════════════════════════════
function CopyBlock({ code, language = '', id, copied, onCopy, title = '' }) {
  return (
    <div className="group relative rounded-xl border border-slate-800 bg-slate-900 dark:bg-slate-950 overflow-hidden shadow-sm transition-all duration-200 hover:border-slate-700">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700/80" />
          </div>
          {title && (
            <span className="ml-2 text-xs font-mono font-medium text-white">
              {title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white border border-slate-700">
              {language}
            </span>
          )}
          <button
            type="button"
            onClick={() => onCopy(code, id)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 outline-none focus:outline-none cursor-pointer',
              copied === id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-700  text-white hover:text-white border border-slate-700'
            )}
          >
            {copied === id ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code body */}
      <pre className="p-4 text-[13px] leading-[1.7] text-white overflow-x-auto font-mono scrollbar-thin scrollbar-thumb-slate-700">
        <code>{code}</code>
      </pre>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// KeyCard — Per-number API key card
// ════════════════════════════════════════════════════════════════
function KeyCard({
  number,
  keyData,
  expirySelection,
  onExpiryChange,
  onGenerate,
  onRegenerate,
  onRevoke,
  isGenerating,
  isRegenerating,
  isRevoking,
}) {
  const { copied, copy } = useCopyToClipboard()
  const hasKey = !!keyData
  const isActive = keyData?.status === 'active'
  const isExpired = keyData?.expiresAt && new Date() > new Date(keyData.expiresAt)

  const fullKey = keyData?.rawKey || keyData?.displayKey || (keyData?.keySuffix ? `...${keyData.keySuffix}` : '')

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      {/* Number Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <Phone size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {number.phoneNumber || number.phoneNumberId}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {number.label || number.displayName || 'WhatsApp Number'}
            </p>
          </div>
        </div>

        {hasKey && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border',
              isExpired
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                : isActive
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20'
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isExpired
                  ? 'bg-amber-500'
                  : isActive
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              )}
            />
            {isExpired ? 'Expired' : isActive ? 'Active' : 'Revoked'}
          </span>
        )}
      </div>

      {/* Key Info */}
      {(isExpired || isActive) && hasKey ? (
        <div className="space-y-3">
          {/* API Key Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Key size={13} className="text-orange-500" />
                API Key
              </span>
              {/* {fullKey.length > 0 && (
                <span className="text-[11px] font-mono text-slate-400 font-normal">
                  {fullKey.length} chars
                </span>
              )} */}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-3.5 py-2.5 font-mono text-xs">
              <code className="flex-1 font-mono font-bold text-slate-900 dark:text-slate-100 break-all select-all leading-relaxed">
                {fullKey}
              </code>

              <button
                type="button"
                onClick={() => copy(fullKey, `card-key-${keyData._id}`)}
                className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-600 shrink-0 cursor-pointer shadow-2xs outline-none focus:outline-none"
                title="Copy Complete API Key"
              >
                {copied === `card-key-${keyData._id}` ? (
                  <>
                    <Check size={13} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              Expires:{' '}
              {keyData.expiresAt
                ? new Date(keyData.expiresAt).toLocaleDateString()
                : 'Never'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Activity size={12} className="text-slate-400" />
              {(keyData.totalRequests || 0).toLocaleString()} requests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              Last used: {timeAgo(keyData.lastUsedAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {isActive && !isExpired && (
              <>
                <Button
                  label="Regenerate"
                  onClick={() => onRegenerate(keyData._id)}
                  loading={isRegenerating}
                  loadingLabel="Regenerating..."
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs shadow-xs"
                  icon={<RefreshCw size={13} />}
                />
                <Button
                  label="Revoke"
                  onClick={() => onRevoke(keyData._id)}
                  loading={isRevoking}
                  loadingLabel="Revoking..."
                  size="sm"
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 text-xs"
                  icon={<ShieldOff size={13} />}
                />
              </>
            )}
            {(keyData.status === 'revoked' || isExpired) && (
              <div className="flex items-center gap-3">
                {/* Expiry selector for regeneration */}
                <div className="relative">
                  <select
                    value={expirySelection}
                    onChange={(e) => onExpiryChange(e.target.value)}
                    className="appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 pr-8 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer"
                  >
                    {EXPIRY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
                <Button
                  label="Generate New Key"
                  onClick={() => onGenerate(number._id)}
                  loading={isGenerating}
                  loadingLabel="Generating..."
                  size="sm"
                  variant="primary"
                  icon={<Key size={13} />}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No API key generated for this number yet.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={expirySelection}
                onChange={(e) => onExpiryChange(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 pr-8 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/30 cursor-pointer"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <Button
              label="Generate Key"
              onClick={() => onGenerate(number._id)}
              loading={isGenerating}
              loadingLabel="Generating..."
              size="sm"
              variant="primary"
              icon={<Key size={13} />}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// KeyRevealModal — One-time key display modal
// ════════════════════════════════════════════════════════════════
function KeyRevealModal({ rawKey, onClose }) {
  const { copied, copy } = useCopyToClipboard()

  if (!rawKey) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header Notice */}
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">
              API Key Generated Successfully
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
              Your API key is ready to use. Copy it now or access it anytime from your Developers dashboard.
            </p>
          </div>
        </div>

        {/* Key Display */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <code className="flex-1 break-all text-[13px] font-mono text-emerald-400 leading-relaxed">
              {rawKey}
            </code>
            <button
              type="button"
              onClick={() => copy(rawKey, 'modal-key')}
              className="shrink-0 rounded-lg p-2.5 transition-all hover:bg-slate-800 text-slate-300 outline-none focus:outline-none cursor-pointer"
            >
              {copied === 'modal-key' ? (
                <Check size={16} className="text-emerald-400" />
              ) : (
                <Copy size={16} className="text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {copied === 'modal-key' && (
          <p className="mt-2 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ Copied to clipboard
          </p>
        )}

        <div className="mt-5 flex justify-end">
          <Button
            label="Done"
            onClick={onClose}
            size="md"
            variant="primary"
            className="px-4 py-2"
          />
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// Language Icons — SVG inline icons for code example tabs
// ════════════════════════════════════════════════════════════════
const TerminalIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
)

const JavaScriptIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <rect width="24" height="24" rx="3" fill="#F7DF1E" />
    <path d="M6.5 17.5c.4.8 1.1 1.3 2 1.3 1 0 1.6-.5 1.6-1.3 0-.9-.6-1.2-1.7-1.7l-.6-.3c-1.6-.7-2.7-1.6-2.7-3.4 0-1.7 1.3-3 3.3-3 1.4 0 2.5.5 3.2 1.8l-1.8 1.1c-.4-.7-.8-1-1.5-1-.7 0-1.1.4-1.1.9 0 .7.4.9 1.4 1.3l.6.3c1.9.8 3 1.6 3 3.5 0 2-1.6 3.1-3.7 3.1-2.1 0-3.4-1-4.1-2.3l1.9-1.1zm8.5 0c.3.5.5 1 1.2 1 .6 0 1-.2 1-1.1V9.2h2.3v8.3c0 1.8-1.1 2.7-2.6 2.7-1.4 0-2.3-.7-2.7-1.6l1.8-1.1z" fill="#323330" />
  </svg>
)

const NodeJsIcon = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#339933" />
    <path d="M12 6.5c-.3 0-.5.1-.7.2L8.5 8.4c-.4.2-.5.5-.5.8v3.5c0 .3.2.6.5.8l.8.4c.6.3 1 .3 1.4.3.8 0 1.3-.5 1.3-1.3V9.6c0-.1-.1-.2-.2-.2h-.5c-.1 0-.2.1-.2.2v3.3c0 .4-.4.7-.8.5l-.9-.5c-.1 0-.1-.1-.1-.2V9.2c0-.1 0-.2.1-.2l2.8-1.6c.1-.1.2-.1.3 0l2.8 1.6c.1.1.1.1.1.2v3.3c0 .1 0 .2-.1.2l-2.8 1.6c-.1.1-.2.1-.3 0l-.7-.4c-.1-.1-.2-.1-.3 0l-.1.1c-.3.2 0 .3.1.3l1.1.6c.2.1.4.1.6 0l2.9-1.7c.2-.1.3-.4.3-.7V9.1c0-.3-.1-.5-.3-.7L12.7 6.7c-.2-.1-.5-.2-.7-.2z" fill="white" />
  </svg>
)

// ════════════════════════════════════════════════════════════════
// CodeExampleTabs — Tabbed code examples with language icons
// ════════════════════════════════════════════════════════════════
const CODE_EXAMPLE_TABS = [
  { id: 'curl', label: 'cURL', icon: TerminalIcon },
  { id: 'javascript', label: 'JavaScript (Fetch)', icon: JavaScriptIcon },
  { id: 'nodejs', label: 'Node.js (Axios)', icon: NodeJsIcon },
]

function CodeExampleTabs({ baseUrl, copied, onCopy }) {
  const [activeExample, setActiveExample] = useState('curl')

  const examples = {
    curl: {
      code: `curl -X POST "${baseUrl}/send-template" \\
  -H "x-api-key: <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "919876543210",
    "templateName": "hello_world",
    "templateLanguage": "en",
    "components": []
  }'`,
      language: 'bash',
      id: 'curl-example',
      title: 'cURL Request',
    },
    javascript: {
      code: `const response = await fetch('${baseUrl}/send-template', {
  method: 'POST',
  headers: {
    'x-api-key': '<your-api-key>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '919876543210',
    templateName: 'hello_world',
    templateLanguage: 'en',
    components: [],
  }),
});

const data = await response.json();
console.log(data);`,
      language: 'javascript',
      id: 'js-example',
      title: 'Fetch API',
    },
    nodejs: {
      code: `const axios = require('axios');

const { data } = await axios.post(
  '${baseUrl}/send-template',
  {
    to: '919876543210',
    templateName: 'hello_world',
    templateLanguage: 'en',
    components: [],
  },
  {
    headers: {
      'x-api-key': '<your-api-key>',
    },
  }
);

console.log(data);`,
      language: 'javascript',
      id: 'axios-example',
      title: 'Axios Client',
    },
  }

  const active = examples[activeExample]

  return (
    <div className="space-y-3">
      {/* Sub-Tab Bar */}
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 w-fit">
        {CODE_EXAMPLE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveExample(id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all outline-none focus:outline-none cursor-pointer',
              activeExample === id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <CopyBlock
        code={active.code}
        language={active.language}
        id={active.id}
        copied={copied}
        onCopy={onCopy}
        title={active.title}
      />
    </div>
  )
}

function InteractiveCodeExampleTabs({ baseUrl, copied, onCopy }) {
  const [activeExample, setActiveExample] = useState('curl')

  const examples = {
    curl: {
      code: `curl -X POST "${baseUrl}/send-interactive" \\
  -H "x-api-key: <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "919876543210",
    "name": "appointment_confirmation"
  }'`,
      language: 'bash',
      id: 'curl-interactive-example',
      title: 'cURL Request (By Template Name)',
    },
    javascript: {
      code: `const response = await fetch('${baseUrl}/send-interactive', {
  method: 'POST',
  headers: {
    'x-api-key': '<your-api-key>',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '919876543210',
    name: 'appointment_confirmation',
  }),
});

const data = await response.json();
console.log(data);`,
      language: 'javascript',
      id: 'js-interactive-example',
      title: 'Fetch API (By Template Name)',
    },
    nodejs: {
      code: `const axios = require('axios');

const { data } = await axios.post(
  '${baseUrl}/send-interactive',
  {
    to: '919876543210',
    name: 'appointment_confirmation',
  },
  {
    headers: {
      'x-api-key': '<your-api-key>',
    },
  }
);

console.log(data);`,
      language: 'javascript',
      id: 'axios-interactive-example',
      title: 'Axios Client (By Template Name)',
    },
  }

  const active = examples[activeExample]

  return (
    <div className="space-y-3">
      {/* Sub-Tab Bar */}
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 w-fit">
        {CODE_EXAMPLE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveExample(id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all outline-none focus:outline-none cursor-pointer',
              activeExample === id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Code Block */}
      <CopyBlock
        code={active.code}
        language={active.language}
        id={active.id}
        copied={copied}
        onCopy={onCopy}
        title={active.title}
      />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// DocumentationTab — Production Grade Light & Dark Theme API Reference
// ════════════════════════════════════════════════════════════════
function DocumentationTab() {
  const { copied, copy } = useCopyToClipboard()
  const baseUrl = `${(process.env.NEXT_PUBLIC_API_URL.replace('/api', ''))}/api/v1/whatsapp`
  const [activeSection, setActiveSection] = useState('sec-send-template')

  const scrollToSection = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Section 1: Quick Overview Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base URL Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5 transition-all shadow-xs hover:shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20">
              <Globe size={16} />
            </div>
            Base Endpoint URL
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            All public API requests must use this base path.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2">
            <code className="text-xs font-mono text-slate-800 dark:text-slate-200 flex-1 truncate font-medium">
              {baseUrl}
            </code>
            <button
              type="button"
              onClick={() => copy(baseUrl, 'overview-baseurl')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors outline-none focus:outline-none shrink-0 cursor-pointer"
              title="Copy Base URL"
            >
              {copied === 'overview-baseurl' ? (
                <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5 transition-all shadow-xs hover:shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <Lock size={16} />
            </div>
            Header Authentication
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Pass your generated API key in request headers.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2">
            <code className="text-xs font-mono text-emerald-700 dark:text-emerald-400 flex-1 truncate font-medium">
              x-api-key: &lt;your-key&gt;
            </code>
            <button
              type="button"
              onClick={() => copy('x-api-key: <your-key>', 'overview-auth')}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors outline-none focus:outline-none shrink-0 cursor-pointer"
              title="Copy Header"
            >
              {copied === 'overview-auth' ? (
                <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Rate Limiting Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2.5 transition-all shadow-xs hover:shadow-sm">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
              <Zap size={16} />
            </div>
            Rate Limits & Quota
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Backed by Redis per API key.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Limit</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              100 req / 10 mins
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 2: 2-Column Sidebar & API Documentation Reference ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-orange-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              API Endpoints Reference
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            2 Endpoints Available
          </span>
        </div>

        {/* 2-Column Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Documentation Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-3 sticky top-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center gap-1.5">
                <FileText size={13} className="text-orange-500" />
                WhatsApp Endpoints
              </div>

              <nav className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('sec-send-template')}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer border',
                    activeSection === 'sec-send-template'
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 shadow-xs'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      POST
                    </span>
                    <span className="truncate">Send Template</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-400 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('sec-send-interactive')}
                  className={cn(
                    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer border',
                    activeSection === 'sec-send-interactive'
                      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 shadow-xs'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                      POST
                    </span>
                    <span className="truncate">Send Interactive</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-400 shrink-0" />
                </button>
              </nav>
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-3 space-y-8">

        {/* Send Template Endpoint Container */}
        <div id="sec-send-template" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs scroll-mt-6">
          {/* Endpoint Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-extrabold font-mono tracking-wide">
                POST
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                /send-template
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 font-medium">
              Sends Meta WhatsApp Template Message
            </span>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Send a pre-approved Meta WhatsApp business template to any phone number.
              The associated Meta Phone Number ID and system access token will be
              automatically resolved from your API key.
            </p>

            {/* Request Body Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Layers size={14} /> Request Body Parameters
              </h3>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="px-4 py-2.5">Field</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Required</th>
                      <th className="px-4 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        to
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold px-2 py-0.5 text-[10px]">
                          Required
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Recipient phone number in E.164 format without '+' (e.g., 919876543210).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        templateName
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold px-2 py-0.5 text-[10px]">
                          Required
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Approved Meta template name e.g. <code className="font-mono text-slate-800 dark:text-slate-200">hello_world</code>.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        templateLanguage
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        ISO language code. Defaults to <code className="font-mono text-slate-800 dark:text-slate-200">"en"</code>.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        components
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        array
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Dynamic parameter components array (header/body variables, buttons).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white dark:text-slate-400 flex items-center gap-2">
                <Code2 size={14} /> Request Example
              </h3>
              <CodeExampleTabs baseUrl={baseUrl} copied={copied} onCopy={copy} />
            </div>

            {/* Response Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" /> Success Response (200 OK)
              </h3>
              <CopyBlock
                code={JSON.stringify(
                  {
                    status: 'success',
                    result: {
                      messaging_product: 'whatsapp',
                      contacts: [{ input: '919876543210', wa_id: '919876543210' }],
                      messages: [{ id: 'wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSQTU...' }],
                    },
                  },
                  null,
                  2
                )}
                language="json"
                id="res-success-200"
                copied={copied}
                onCopy={copy}
                title="Response 200 OK"
              />
            </div>

            {/* Error Responses Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <AlertCircle size={14} className="text-amber-500" /> Error Responses & HTTP Statuses
              </h3>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Reason & Solution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-red-600 dark:text-red-400">400</td>
                      <td className="px-4 py-2.5 font-semibold">Bad Request</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Missing required body fields (<code className="font-mono text-slate-800 dark:text-slate-200">to</code> or <code className="font-mono text-slate-800 dark:text-slate-200">templateName</code>).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-red-600 dark:text-red-400">401</td>
                      <td className="px-4 py-2.5 font-semibold">Unauthorized</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Invalid, revoked, or expired API key. Generate a new key from the dashboard.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-amber-600 dark:text-amber-400">429</td>
                      <td className="px-4 py-2.5 font-semibold">Rate Limited</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Exceeded 100 requests per 10 minutes limit. Wait before retrying.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-red-600 dark:text-red-400">500</td>
                      <td className="px-4 py-2.5 font-semibold">Internal Error</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Meta API integration error or server connectivity failure.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Send Interactive Endpoint Container */}
        <div id="sec-send-interactive" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs scroll-mt-6">
          {/* Endpoint Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 px-3 py-1 text-xs font-extrabold font-mono tracking-wide">
                POST
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                /send-interactive
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 font-medium">
              Sends Interactive WhatsApp Message (Buttons & Lists)
            </span>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Send interactive WhatsApp messages containing quick reply buttons or list menus to recipients.
              You can send by referencing a saved <code className="font-mono text-slate-800 dark:text-slate-200">interactiveId</code> OR by providing a direct payload (<code className="font-mono text-slate-800 dark:text-slate-200">type</code>, <code className="font-mono text-slate-800 dark:text-slate-200">bodyText</code>, <code className="font-mono text-slate-800 dark:text-slate-200">buttons</code>).
            </p>

            {/* Request Body Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Layers size={14} /> Request Body Parameters
              </h3>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="px-4 py-2.5">Field</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Required</th>
                      <th className="px-4 py-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        to
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold px-2 py-0.5 text-[10px]">
                          Required
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Recipient phone number in E.164 format without '+' (e.g., 919876543210).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        name
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional*
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Name of a pre-configured interactive template saved in your account (e.g., <code className="font-mono text-slate-800 dark:text-slate-200">"appointment_confirmation"</code>).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        interactiveId
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        ID of a pre-configured interactive template saved in your account.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        type
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional*
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Interactive message type: <code className="font-mono text-slate-800 dark:text-slate-200">"button"</code> or <code className="font-mono text-slate-800 dark:text-slate-200">"list"</code>. (Required if not using interactiveId).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        bodyText
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        string
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional*
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Main body message text. (Required if not using interactiveId).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        buttons
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">
                        array
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold px-2 py-0.5 text-[10px]">
                          Optional
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">
                        Array of quick reply buttons: <code className="font-mono text-slate-800 dark:text-slate-200">[&#123; id, title &#125;]</code> (Max 3 buttons).
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white dark:text-slate-400 flex items-center gap-2">
                <Code2 size={14} /> Request Example
              </h3>
              <InteractiveCodeExampleTabs baseUrl={baseUrl} copied={copied} onCopy={copy} />
            </div>

            {/* Response Section */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" /> Success Response (200 OK)
              </h3>
              <CopyBlock
                code={JSON.stringify(
                  {
                    status: 'success',
                    message: 'Interactive message sent successfully',
                    messageId: 'wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSQTU...',
                    result: {
                      messaging_product: 'whatsapp',
                      contacts: [{ input: '919876543210', wa_id: '919876543210' }],
                      messages: [{ id: 'wamid.HBgLOTE5ODc2NTQzMjEwFQIAERgSQTU...' }],
                    },
                  },
                  null,
                  2
                )}
                language="json"
                id="res-interactive-success-200"
                copied={copied}
                onCopy={copy}
                title="Response 200 OK"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  )
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════
const TABS = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'documentation', label: 'Documentation', icon: FileText },
]

export default function MetaWhatsappDevelopers() {
  const [activeTab, setActiveTab] = useState('api-keys')
  const [revealedKey, setRevealedKey] = useState(null)
  const [expirySelections, setExpirySelections] = useState({})
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [actionTokenId, setActionTokenId] = useState(null)

  // Data
  const {
    data: whatsappNumbers,
    isLoading: numbersLoading,
    isFetching: numbersFetching,
    refetch: refetchNumbers,
  } = useGetWhatsappNumberQuery()

  const {
    data: apiKeysResponse,
    isLoading: keysLoading,
    isFetching: keysFetching,
    refetch: refetchKeys,
  } = useGetApiKeysQuery()

  const apiKeys = apiKeysResponse?.data || []
  const isSyncing = numbersFetching || keysFetching

  const handleSyncAll = async () => {
    try {
      await Promise.all([refetchNumbers(), refetchKeys()])
      toast.success('API keys refreshed successfully!')
    } catch (err) {
      console.error('[Sync] Error:', err)
      toast.error('Failed to sync API keys.')
    }
  }

  // Mutations
  const [generateApiKey, { isLoading: isGenerating }] =
    useGenerateApiKeyMutation()
  const [regenerateApiKey, { isLoading: isRegenerating }] =
    useRegenerateApiKeyMutation()
  const [revokeApiKey, { isLoading: isRevoking }] = useRevokeApiKeyMutation()

  // Map API keys by whatsappTokenId for quick lookup
  const keysByTokenId = useMemo(() => {
    const map = {}
    apiKeys.forEach((key) => {
      // Keep the most recent key per token (active > revoked)
      if (
        !map[key.whatsappTokenId] ||
        key.status === 'active' ||
        new Date(key.createdAt) > new Date(map[key.whatsappTokenId].createdAt)
      ) {
        map[key.whatsappTokenId] = key
      }
    })
    return map
  }, [apiKeys])

  const numbers = whatsappNumbers?.data || whatsappNumbers || []

  // Handlers
  const handleGenerate = (whatsappTokenId) => {
    const num = numbers.find((n) => n._id === whatsappTokenId)
    const phoneStr = num?.phoneNumber || num?.displayName || 'this WhatsApp number'
    setConfirmDialog({
      title: 'Generate API Key?',
      message: `Are you sure you want to generate an API key for ${phoneStr}?`,
      confirmLabel: 'Generate Key',
      onConfirm: async () => {
        setActionTokenId(whatsappTokenId)
        try {
          const expiresIn = expirySelections[whatsappTokenId] || 'never'
          const result = await generateApiKey({ whatsappTokenId, expiresIn }).unwrap()
          if (result?.data?.rawKey) {
            setRevealedKey(result.data.rawKey)
          }
          toast.success(result?.message || 'API key generated successfully!')
        } catch (err) {
          console.error('[Generate] Error:', err)
          const errorMsg = err?.data?.error || err?.data?.message || err?.message || 'Failed to generate API key.'
          toast.error(errorMsg)
        } finally {
          setActionTokenId(null)
        }
        setConfirmDialog(null)
      },
    })
  }

  const handleRegenerate = (keyId) => {
    const keyDoc = apiKeys.find((k) => k._id === keyId)
    const tokenId = keyDoc?.whatsappTokenId
    setConfirmDialog({
      title: 'Regenerate API Key?',
      message:
        'The current key will be immediately revoked. Any integrations using the old key will stop working. A new key will be generated.',
      confirmLabel: 'Regenerate',
      variant: 'warning',
      onConfirm: async () => {
        setActionTokenId(tokenId)
        try {
          const expiresIn =
            expirySelections[tokenId] || 'never'
          const result = await regenerateApiKey({
            id: keyId,
            expiresIn,
          }).unwrap()
          if (result?.data?.rawKey) {
            setRevealedKey(result.data.rawKey)
          }
          toast.success(result?.message || 'API key regenerated successfully!')
        } catch (err) {
          console.error('[Regenerate] Error:', err)
          const errorMsg = err?.data?.error || err?.data?.message || err?.message || 'Failed to regenerate API key.'
          toast.error(errorMsg)
        } finally {
          setActionTokenId(null)
        }
        setConfirmDialog(null)
      },
    })
  }

  const handleRevoke = (keyId) => {
    const keyDoc = apiKeys.find((k) => k._id === keyId)
    const tokenId = keyDoc?.whatsappTokenId
    setConfirmDialog({
      title: 'Revoke API Key?',
      message:
        'This action cannot be undone. Any integrations using this key will immediately stop working.',
      confirmLabel: 'Revoke Key',
      variant: 'danger',
      onConfirm: async () => {
        setActionTokenId(tokenId)
        try {
          const result = await revokeApiKey(keyId).unwrap()
          toast.success(result?.message || 'API key revoked successfully.')
        } catch (err) {
          console.error('[Revoke] Error:', err)
          const errorMsg = err?.data?.error || err?.data?.message || err?.message || 'Failed to revoke API key.'
          toast.error(errorMsg)
        } finally {
          setActionTokenId(null)
        }
        setConfirmDialog(null)
      },
    })
  }

  const isLoading = numbersLoading || keysLoading

  return (
    <div className="mx-auto w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <PageHeader
        title="Developers"
        subtitle="Manage API keys and explore the API documentation"
        titleTag="h1"
      />

      {/* Main Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex gap-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'group inline-flex items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium transition-all outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer',
                activeTab === id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-500 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700'
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'transition-colors',
                  activeTab === id
                    ? 'text-orange-500'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                )}
              />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          {/* Section Header with Sync Button */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Connected WhatsApp API Keys
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage API key credentials for your WhatsApp business accounts
              </p>
            </div>
            <Button
              label={isSyncing ? 'Syncing...' : 'Sync Keys'}
              onClick={handleSyncAll}
              loading={isSyncing}
              loadingLabel="Syncing..."
              size="sm"
              variant="outline"
              icon={<RefreshCw size={13} className={cn(isSyncing && 'animate-spin')} />}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <LoadingSpinner size="lg" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
                Loading API keys and numbers...
              </p>
            </div>
          ) : numbers.length === 0 ? (
            <EmptyState
              title="No WhatsApp Numbers Connected"
              description="Connect a WhatsApp number first to generate API keys."
              icon={<Phone className="text-slate-400" size={32} />}
            />
          ) : (
            numbers.map((number) => (
              <KeyCard
                key={number._id}
                number={number}
                keyData={keysByTokenId[number._id]}
                expirySelection={expirySelections[number._id] || 'never'}
                onExpiryChange={(val) =>
                  setExpirySelections((prev) => ({
                    ...prev,
                    [number._id]: val,
                  }))
                }
                onGenerate={handleGenerate}
                onRegenerate={handleRegenerate}
                onRevoke={handleRevoke}
                isGenerating={isGenerating && actionTokenId === number._id}
                isRegenerating={isRegenerating && actionTokenId === number._id}
                isRevoking={isRevoking && actionTokenId === number._id}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'documentation' && <DocumentationTab />}

      {/* Key Reveal Modal */}
      <KeyRevealModal
        rawKey={revealedKey}
        onClose={() => setRevealedKey(null)}
      />

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          open={!!confirmDialog}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  )
}
