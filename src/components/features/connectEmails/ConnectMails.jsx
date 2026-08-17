import { useState, useEffect } from 'react'
import {
  useGetEmailAuthStatusQuery,
  useDisconnectGoogleMutation,
  useDisconnectMicrosoftMutation,
  useSendTestEmailMutation,
  useConnectCustomEmailMutation,
  useDisconnectCustomEmailMutation,
  useUpdateEmailDailyLimitMutation,
  useGetEmailUtilizationHistoryQuery,
} from '@/redux/apis/emailConnect.api'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  CheckCircle2,
  Mail,
  Unlink,
  Calendar,
  Loader2,
  Info,
  ChevronRight,
  Send,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit2,
  BarChart3,
} from 'lucide-react'
import AuthPage from '@/pages/user/AuthPage'
import { isApkRuntime } from '@/utils/isApk'
import toast from 'react-hot-toast'
import CustomEmailModal from './CustomEmailModal'
import { formatDate } from '@/utils/dateFormat'

// ─── Brand Icons ──────────────────────────────────────────────────────────────
const GoogleIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className || "h-6 w-6"}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

const MicrosoftIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className || "h-6 w-6"}>
    <path fill="#F25022" d="M1 1h10v10H1z" />
    <path fill="#00A4EF" d="M13 1h10v10H13z" />
    <path fill="#7FBA00" d="M1 13h10v10H1z" />
    <path fill="#FFB900" d="M13 13h10v10H13z" />
  </svg>
)


// ─── Toast Component ──────────────────────────────────────────────────────────
// const Toast = ({ toasts }) => (
//   <div className="pointer-events-none fixed bottom-4 right-4 z-[150] flex flex-col gap-2 sm:bottom-6 sm:right-6 sm:w-[340px]">
//     <AnimatePresence>
//       {toasts.map((t) => (
//         <motion.div
//           key={t.id}
//           initial={{ opacity: 0, y: 20, scale: 0.95 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
//           className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium shadow-lg backdrop-blur-sm ${t.type === 'success'
//             ? 'border border-emerald-200/50 bg-emerald-50/95 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/95 dark:text-emerald-200'
//             : t.type === 'error'
//               ? 'border border-red-200/50 bg-red-50/95 text-red-800 dark:border-red-900/50 dark:bg-red-950/95 dark:text-red-200'
//               : 'border border-gray-200/50 bg-gray-50/95 text-gray-800 dark:border-gray-800/50 dark:bg-gray-900/95 dark:text-gray-200'
//             }`}
//         >
//           {t.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
//           {t.type === 'error' && <X className="h-5 w-5 shrink-0" />}
//           {t.type === 'info' && <Info className="h-5 w-5 shrink-0" />}
//           <span className="min-w-0 flex-1 break-words leading-tight">{t.message}</span>
//         </motion.div>
//       ))}
//     </AnimatePresence>
//   </div>
// )

// ─── Account Row ──────────────────────────────────────────────────────────────
// ─── Utilization History Helper ───────────────────────────────────────────────
const UtilizationHistory = ({ email, days, setDays }) => {
  const { data, isLoading } = useGetEmailUtilizationHistoryQuery({ email, days })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-3">
        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
      </div>
    )
  }

  const history = data?.history || []

  return (
    <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 text-xs border border-[var(--app-pages-border)]">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" /> Day-Wise Utilization
        </h5>
        <div className="flex gap-1">
          {[7, 30].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`px-1.5 py-0.5 rounded text-[10px] ${days === d ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-805 text-slate-600 dark:text-slate-400'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
        {history.map((h, i) => (
          <div key={i} className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/50 pb-1 last:border-0 last:pb-0">
            <span>{h.date}</span>
            <div className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sent: {h.sentCount}</span>
              <span className="text-red-500 dark:text-red-400">Failed: {h.failedCount}</span>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-slate-400 text-center py-2">No utilization logs found for this period.</p>
        )}
      </div>
    </div>
  )
}

// ─── Account Avatar ───────────────────────────────────────────────────────────
const AccountAvatar = ({ email, profilePicture }) => {
  const [imgFailed, setImgFailed] = useState(false)
  if (profilePicture && !imgFailed) {
    return (
      <img
        src={profilePicture}
        alt={email}
        referrerPolicy="no-referrer"
        className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-[var(--app-pages-border)]"
        onError={() => setImgFailed(true)}
      />
    )
  }
  return <Mail className="h-4 w-4 shrink-0 text-[var(--app-pages-subhead-text)]" />
}

// ─── Account Row ──────────────────────────────────────────────────────────────
const AccountRow = ({
  account,
  provider,
  onDisconnect,
  onTestEmail,
  onConnect,
  isGuest,
  onRequireAuth,
}) => {
  const [disconnecting, setDisconnecting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testSent, setTestSent] = useState(false)

  const [isEditingLimit, setIsEditingLimit] = useState(false)
  const [newLimit, setNewLimit] = useState(account.dailyLimit || 500)
  const [updatingLimit, setUpdatingLimit] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyDays, setHistoryDays] = useState(7)
  const [updateEmailDailyLimit] = useUpdateEmailDailyLimitMutation()

  const handleDisconnect = async () => {
    if (isGuest) {
      onRequireAuth?.()
      return
    }
    setDisconnecting(true)
    await onDisconnect(provider, account.email)
    setDisconnecting(false)
  }

  const handleTest = async () => {
    if (isGuest) {
      onRequireAuth?.()
      return
    }
    setTesting(true)
    setTestSent(false)
    await onTestEmail(provider, account.email)
    setTesting(false)
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const handleSaveLimit = async () => {
    try {
      setUpdatingLimit(true)
      await updateEmailDailyLimit({ email: account.email, dailyLimit: Number(newLimit) }).unwrap()
      setIsEditingLimit(false)
      toast.success("Daily limit updated successfully!")
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update limit")
    } finally {
      setUpdatingLimit(false)
    }
  }

  const isExpired = account.status === 'expired' || account.status === 'revoked'

  return (
    <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-3.5 shadow-sm transition-all duration-200">

      {/* Line 1 — Profile pic or Mail icon + email (●) status inline */}
      <div className="flex min-w-0 items-center gap-2">
        <AccountAvatar email={account.email} profilePicture={account.profilePicture} />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
          <span className="min-w-0 truncate text-sm font-semibold text-[var(--app-pages-text)]">
            {account.email}
          </span>
          {/* Dot inline right after email */}
          {isExpired ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 ring-1 ring-inset ring-amber-400/30 dark:bg-amber-950/30 dark:text-amber-400">
              <AlertCircle className="h-2.5 w-2.5" /> Expired
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] text-[var(--app-pages-subhead-text)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" title="Active" />
            </span>
          )}
        </div>
      </div>

      {/* Line 2 — Connected date */}
      {/* {account.connectedAt && (
        <p className="mt-1 pl-6 text-[11px] text-[var(--app-pages-subhead-text)]">
          {formatDate(account.connectedAt)}
        </p>
      )} */}

      {/* Line 3 — Badge + action buttons in one row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {/* Account type badge */}
        {account.accountType && !isExpired && (
          <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
            account.accountType === 'workplace'
              ? 'border-purple-200/70 bg-purple-50 text-purple-700 dark:border-purple-800/40 dark:bg-purple-950/30 dark:text-purple-300'
              : 'border-blue-200/70 bg-blue-50 text-blue-700 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-300'
          }`}>
            {account.accountType === 'workplace' ? 'Workplace' : 'Personal'}
          </span>
        )}

        {/* Push buttons to the right */}
        <div className="ml-auto flex items-center gap-1.5">
          {isExpired ? (
            <button
              onClick={() => onConnect(provider)}
              className="flex items-center gap-1 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--app-pages-text)] transition-all hover:shadow-sm active:scale-95"
            >
              <RefreshCw className="h-3 w-3" /> Reconnect
            </button>
          ) : (
            <button
              onClick={handleTest}
              disabled={testing || testSent}
              className="flex items-center gap-1 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--app-pages-text)] transition-all hover:shadow-sm disabled:opacity-50 active:scale-95"
            >
              {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : testSent ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Send className="h-3 w-3" />}
              {testing ? 'Sending...' : testSent ? 'Sent!' : 'Test Email'}
            </button>
          )}
          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="flex items-center gap-1 rounded-lg border border-red-200/70 bg-red-50/60 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400 active:scale-95"
          >
            {disconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" />}
            {disconnecting ? '...' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Provider Card ────────────────────────────────────────────────────────────
const ProviderCard = ({
  provider,
  config,
  accounts,
  onConnect,
  onDisconnect,
  onTestEmail,
  isGuest,
  onRequireAuth,
}) => {
  const isConnected = accounts.length > 0

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-[var(--app-pages-bg)] transition-all duration-300 ${isConnected
        ? 'border-[var(--app-pages-border)]'
        : 'border-[var(--app-pages-border)] hover:border-[var(--app-pages-text)]'
        }`}
    >
      <div className={`absolute left-0 right-0 top-0 h-1 ${config.accentGradient}`} />

      <div className="p-4 sm:p-5">
        {/* Header row — always single line */}
        <div className="mb-4 flex items-center gap-3">
          {/* Provider icon */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg} border ${config.iconBorder}`}>
            <config.icon className="h-6 w-6" />
          </div>

          {/* Name + description */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[var(--app-pages-text)] leading-tight">{config.name}</h3>
            <p className="text-[11px] text-[var(--app-pages-subhead-text)] leading-tight">{config.description}</p>
          </div>

          {/* Add button — always right-aligned on same row */}
          {isConnected && accounts.length < 10 && (
            <button
              onClick={() => onConnect(provider)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--app-pages-text)] transition-all hover:shadow-sm active:scale-95"
              title={`Add another ${config.name} account`}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-5 sm:p-8 text-center">
            <config.icon className="h-10 w-10 text-[var(--app-pages-text)] mb-4 opacity-50" />
            <p className="text-sm font-medium text-[var(--app-pages-text)] mb-6">
              No accounts connected yet.
            </p>
            <button
              onClick={() => onConnect(provider)}
              className={`flex w-full max-w-xs items-center justify-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 ${config.connectBtn} border shadow-md hover:scale-[1.02] active:scale-[0.98]`}
            >
              <config.icon className="h-5 w-5" />
              Connect {config.name}
            </button>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-1.5 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {accounts.map((acc, idx) => (
              <AccountRow
                key={`${provider}-${acc.email}-${idx}`}
                account={acc}
                provider={provider}
                onDisconnect={onDisconnect}
                onTestEmail={onTestEmail}
                onConnect={onConnect}
                isGuest={isGuest}
                onRequireAuth={onRequireAuth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmailConnectPage() {
  const { data: status, isLoading: loading, refetch } =
    useGetEmailAuthStatusQuery()

  const isDev = import.meta.env.VITE_NODE_ENV === 'development'
  const [showAuthModal, setShowAuthModal] = useState(false)
  const reduxUser = useSelector((state) => state.auth?.user)

  const [disconnectGoogle] = useDisconnectGoogleMutation()
  const [disconnectMicrosoft] = useDisconnectMicrosoftMutation()
  const [sendTestEmail] = useSendTestEmailMutation()
  const [disconnectCustomEmail] = useDisconnectCustomEmailMutation()

  const [showCustomModal, setShowCustomModal] = useState(false)

  // const [toasts, setToasts] = useState([])

  // const addToast = (message, type = 'info') => {
  //   const id = Date.now()
  //   setToasts((prev) => [...prev, { id, message, type }])
  //   setTimeout(() => {
  //     setToasts((prev) => prev.filter((t) => t.id !== id))
  //   }, 4000)
  // }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success === 'google_connected')
      toast.success('Google connected successfully!', 'success')
    if (success === 'microsoft_connected')
      toast.success('Microsoft connected successfully!', 'success')
    if (error === 'access_denied') toast.error('Connection cancelled.', 'error')
    if (error === 'auth_failed')
      toast.error('Authentication failed. Please try again.', 'error')

    if (success || error) {
      window.history.replaceState({}, '', window.location.pathname)
      refetch()
    }
  }, [refetch])

  const getAccountsByProvider = (provider) =>
    status?.connected?.filter((a) => a.provider === provider) || []

  const handleConnect = async (provider) => {
    if (reduxUser?.isGuest) {
      setShowAuthModal(true)
      return
    }
    if (provider === 'custom') {
      setShowCustomModal(true)
      return
    }
    const isApk = isApkRuntime()
    const suffix = isApk ? '?apk=1' : ''
    window.location.href = `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/email/${provider}/connect${suffix}`
  }

  const handleDisconnect = async (provider, email) => {
    try {
      if (provider === 'google') await disconnectGoogle({ email }).unwrap()
      else if (provider === 'microsoft') await disconnectMicrosoft({ email }).unwrap()
      else if (provider === 'custom') await disconnectCustomEmail({ email }).unwrap()
      toast.success(`${email} disconnected successfully.`)
      refetch()
    } catch (err) {
      console.error('[Disconnect]', err)
      toast.error(err?.data?.message || 'Disconnect failed. Please try again.')
    }
  }

  const handleTestEmail = async (provider, email) => {
    try {
      await sendTestEmail({ provider, email }).unwrap()
      toast.success('Test email sent successfully!')
    } catch (err) {
      console.error('[TestEmail]', err)
      toast.error(err?.data?.message || 'Failed to send test email.')
    }
  }

  const connectedCount = status?.connected?.length || 0

  const providers = {
    google: {
      name: 'Gmail',
      description: 'Connect to send campaigns via Google Workspace.',
      icon: GoogleIcon,
      iconBg: 'bg-[var(--app-pages-bg)]',
      iconBorder: 'border-[var(--app-pages-border)]',
      accentGradient: 'bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500',
      connectBtn:
        'bg-white text-slate-900 hover:bg-slate-100 border-slate-200 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white dark:border-slate-200',
    },
    microsoft: {
      name: 'Outlook',
      description: 'Connect to send campaigns via Microsoft 365.',
      icon: MicrosoftIcon,
      iconBg: 'bg-[var(--app-pages-bg)]',
      iconBorder: 'border-[var(--app-pages-border)]',
      accentGradient: 'bg-gradient-to-r from-blue-500 to-cyan-400',
      connectBtn:
        'bg-[#0078d4] text-white hover:bg-[#106ebe] border-transparent',
    },
    custom: {
      name: 'IMAP & SMTP',
      description: 'Connect to send campaigns via any custom provider.',
      icon: Mail,
      iconBg: 'bg-[var(--app-pages-bg)]',
      iconBorder: 'border-[var(--app-pages-border)]',
      accentGradient: 'bg-gradient-to-r from-slate-600 to-slate-400',
      connectBtn:
        'bg-slate-800 text-white hover:bg-slate-900 border-transparent dark:bg-slate-700 dark:hover:bg-slate-600',
    },
  }

  return (
    <>
      <div className="min-h-full w-full p-3 transition-colors duration-300 sm:p-4 lg:p-6">
        <div className="mx-auto w-full max-w-7xl">
          {/* Header Section */}
          {/* <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Email Connections
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Manage your sender accounts and monitor their connection health.
              </p>
            </div>

            <div className="inline-flex items-center gap-3 rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-5 py-2.5 shadow-sm">
              <div
                className={`h-3 w-3 rounded-full ${connectedCount > 0
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-[var(--app-pages-bg)]'
                  }`}
              />
              <span className="text-sm font-bold text-[var(--app-pages-text)]">
                {connectedCount === 0
                  ? 'No accounts active'
                  : `${connectedCount} Sender Account${connectedCount > 1 ? 's' : ''} Connected`}
              </span>
            </div>
          </div> */}

          {/* Cards Section */}
          <div className="w-full">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[260px] animate-pulse rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ProviderCard
                  provider="google"
                  config={providers.google}
                  accounts={getAccountsByProvider('google')}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onTestEmail={handleTestEmail}
                  isGuest={reduxUser?.isGuest}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
                <ProviderCard
                  provider="microsoft"
                  config={providers.microsoft}
                  accounts={getAccountsByProvider('microsoft')}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onTestEmail={handleTestEmail}
                  isGuest={reduxUser?.isGuest}
                  onRequireAuth={() => setShowAuthModal(true)}
                />
                {isDev && (
                  <ProviderCard
                    provider="custom"
                    config={providers.custom}
                    accounts={getAccountsByProvider('custom')}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onTestEmail={handleTestEmail}
                    isGuest={reduxUser?.isGuest}
                    onRequireAuth={() => setShowAuthModal(true)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Enhanced Footer Note */}
          {/* <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 dark:border-indigo-900/30 dark:bg-indigo-900/10">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/40">
                <Info className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                  How Background Monitoring Works
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-indigo-800/80 dark:text-indigo-400/80">
                  Your connections are automatically verified every hour. If a token expires or access is revoked, we'll mark the account as <span className="font-bold text-amber-600 dark:text-amber-400">Needs Reconnect</span> and pause any active campaigns associated with it to protect your sender reputation.
                </p>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Auth Modal Overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            key="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[var(--app-pages-bg)]/80 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowAuthModal(false)
            }}
          >
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <motion.div
                key="auth-modal"
                initial={{ scale: 0.96, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 16 }}
                className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="absolute right-4 top-4 z-10 rounded-full p-2 text-[var(--app-pages-text)] transition-colors hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-text)]"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="max-h-[85vh] overflow-y-auto">
                  <AuthPage onSuccess={() => setShowAuthModal(false)} />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCustomModal && (
          <CustomEmailModal
            isOpen={showCustomModal}
            onClose={() => {
              setShowCustomModal(false)
              refetch()
            }}
          />
        )}
      </AnimatePresence>

      {/* <Toast toasts={toasts} /> */}
    </>
  )
}
// ="absolute right-4 top-4 z-10 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
//                   aria-label="Close"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>

//                 <div className="max-h-[85vh] overflow-y-auto p-0">
//                   <AuthPage onSuccess={() => setShowAuthModal(false)} />
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <Toast toasts={toasts} />
//     </>
//   )
// }