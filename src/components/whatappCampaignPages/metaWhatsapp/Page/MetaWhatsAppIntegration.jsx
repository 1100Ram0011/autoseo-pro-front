import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useNavigate } from '@/components/react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import {
  useGetWhatsappNumberQuery,
  useConnectWhatsappMutation,
  useDisconnectWhatsappMutation,
  useSyncNumberLimitMutation,
  useLazyGetBusinessProfileQuery,
} from '@/redux/apis/metaWhatsapp.api'
import { cn } from '@/lib/utils.js'
import DemoAnimatedAuthModal from '@/ReUseAbleComponents/DemoAnimatedAuthModal'
import Modal from '@/ReUseAbleComponents/Modal'
import AuthPage from '@/pages/user/AuthPage'
import { Smartphone, RefreshCw, Zap, ShieldCheck, TrendingUp, MoreVertical, MessageCircle, Terminal, Sparkles, Building2, Settings } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ── Reusable Components ──
import { STATUS_MAP } from '../Component/metaWhatsappConstants'
import StatusBadge from '../Component/StatusBadge'
import QualityDot from '../Component/QualityDot'
import PageHeader from '../Component/PageHeader'
import InfoBanner from '../Component/InfoBanner'
import EmptyState from '../Component/EmptyState'
import LoadingSpinner from '../Component/LoadingSpinner'
import Button from '../Component/Button'
import WhatsAppIconBox from '../Component/WhatsAppIconBox'
import ConfirmDialog from '../Component/ConfirmDialog'
import MetaConversationalAutomationModal from '../Component/MetaConversationalAutomationModal'
import MetaBusinessProfileModal from '../Component/MetaBusinessProfileModal'
import MetaNumberSettingsModal from '../Component/MetaNumberSettingsModal'

// ── Onboarding Components ──
import OnboardingWizard from '../Component/Onboarding/OnboardingWizard'

export default function ConnectWhatsApp() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const reduxUser = useSelector((state) => state.auth?.user)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [targetNumberToDisconnect, setTargetNumberToDisconnect] = useState(null)
  const [disconnectingId, setDisconnectingId] = useState(null)
  const [syncingId, setSyncingId] = useState(null)
  const [automationNumber, setAutomationNumber] = useState(null)
  const [automationInitialTab, setAutomationInitialTab] = useState('ice_breakers')
  const [profileNumber, setProfileNumber] = useState(null)
  const [settingsNumber, setSettingsNumber] = useState(null)

  const status = searchParams.get('status')
  const message = searchParams.get('message')
  const connectedCount = searchParams.get('numbers')

  const { data, isLoading, refetch } = useGetWhatsappNumberQuery()
  const [connectWhatsapp, { isLoading: connecting }] =
    useConnectWhatsappMutation()
  const [disconnectWhatsapp] = useDisconnectWhatsappMutation()
  const [syncNumberLimit] = useSyncNumberLimitMutation()
  const [triggerGetProfile] = useLazyGetBusinessProfileQuery()
  const numbers = data?.data || []

  const showToast = useCallback((msg, type = 'info') => {
    if (type === 'success') toast.success(msg)
    else if (type === 'error') toast.error(msg)
    else toast.info(msg)
  }, [])

  const handleConnect = useCallback(() => {
    setShowTerms(true)
  }, [])

  const handleAgreeTerms = () => {
    setShowTerms(false)
    setShowWizard(true)
  }

  const handleWizardComplete = () => {
    setShowWizard(false)
    refetch()
  }

  const handleDisconnectClick = (numDoc) => {
    setTargetNumberToDisconnect(numDoc)
  }

  const handleSyncLimit = async (numId) => {
    setSyncingId(numId)
    try {
      const res = await syncNumberLimit(numId).unwrap()
      toast.success(res?.message || 'Messaging limit tier synced from Meta!')
      refetch()
    } catch (err) {
      console.error('Failed to sync tier:', err)
      toast.error(err?.data?.message || err?.message || 'Failed to sync tier with Meta')
    } finally {
      setSyncingId(null)
    }
  }

  const handleConfirmDisconnect = async () => {
    if (!targetNumberToDisconnect) return
    const id = targetNumberToDisconnect._id
    setDisconnectingId(id)
    try {
      const res = await disconnectWhatsapp(id).unwrap()
      toast.success(res?.message || 'WhatsApp number disconnected successfully')
      refetch()
    } catch (err) {
      console.error('Failed to disconnect WhatsApp number:', err)
      toast.error(err?.data?.message || err?.message || 'Failed to disconnect number')
    } finally {
      setDisconnectingId(null)
      setTargetNumberToDisconnect(null)
    }
  }

  const handleSetPrimary = async (id) => {
    // try { await setPrimary(id).unwrap(); } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (profileNumber?.phoneNumberId) {
      triggerGetProfile(profileNumber.phoneNumberId)
    }
  }, [profileNumber, triggerGetProfile])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0c0e14] dark:text-slate-200">
      {/* ── Top Section (Header & Banners) ── */}
      <div className="shrink-0 px-8 pb-3 pt-7">
        {status === 'success' && (
          <InfoBanner
            type="success"
            message={`${connectedCount} number(s) connected successfully!`}
            icon="✅"
            onDismiss={() => navigate('.', { replace: true })}
            className="mb-6"
          />
        )}
        {status === 'error' && (
          <InfoBanner
            type="error"
            message={message || 'Connection failed'}
            icon="❌"
            onDismiss={() => navigate('.', { replace: true })}
            className="mb-6"
          />
        )}

        {/* ── Header ── */}
        <PageHeader
          title="WhatsApp Numbers"
          subtitle="Connect and manage your WhatsApp Business numbers"
          titleTag="h4"
          actionLabel="Connect WhatsApp"
          onAction={handleConnect}
          disabled={false}
          loading={false}
          className="mb-6"
        />

        {/* ── Meta Messaging Limit Roadmap Banner ── */}
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-blue-500/5 p-5 shadow-xs dark:border-emerald-500/30 dark:bg-emerald-950/20">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Meta Messaging Limit Scale-Up
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Meta automatically upgrades your messaging limit from <strong>TIER_250</strong> → <strong>TIER_1K</strong> → <strong>TIER_10K</strong> → <strong>TIER_100K</strong> → <strong>UNLIMITED</strong>. 
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> 1. Meta Business Verification (TIER_1K Baseline)
                </span>
                <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <Zap className="h-4 w-4" /> 2. Send 500+ chats in 24h with High Quality Rating (Auto Scale to TIER_10K)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Numbers List Panel ── */}
      <div className="mx-8 mb-8 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm delay-100 duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both dark:border-white/[0.07] dark:bg-[#10121a]">
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-16">
              <LoadingSpinner variant="spinner" text="Loading numbers…" />
            </div>
          ) : numbers.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-20">
              <EmptyState
                variant="fancy"
                icon={
                  <Smartphone
                    className="text-emerald-600 dark:text-emerald-400"
                    size={32}
                  />
                }
                title="No numbers connected"
                description='Click "+ Connect WhatsApp" to get started with your first WhatsApp Business number.'
              />
            </div>
          ) : (
            numbers?.map((n, i) => (
              <div
                key={n._id}
                className={cn(
                  'group flex items-center gap-5 px-7 py-6 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-[#141720]',
                  i < numbers.length - 1 &&
                    'border-b border-slate-200/70 dark:border-white/[0.04]'
                )}
              >
                {/* WA Icon */}
                <WhatsAppIconBox
                  size="lg"
                  className="shrink-0 shadow-[0_0_20px_rgba(37,211,102,0.18)]"
                />

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {n.displayName}
                    </span>
                    <StatusBadge status={n.status} variant="pill" />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-5 text-[13px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {n.phoneNumber}
                    </span>
                    <QualityDot rating={n.qualityRating} />
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      Messaging Limit:{' '}
                      <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                        {n.messagingLimit || 'TIER_1K'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-3">
                  <Button
                    label="Sync Tier"
                    variant="secondary"
                    size="sm"
                    loading={syncingId === n._id}
                    disabled={syncingId === n._id}
                    onClick={() => handleSyncLimit(n._id)}
                    className="px-3.5 py-2 text-xs font-bold"
                  />
                  <Button
                    label="Disconnect"
                    variant="danger"
                    size="sm"
                    loading={disconnectingId === n._id}
                    disabled={disconnectingId === n._id}
                    onClick={() => handleDisconnectClick(n)}
                    className="px-4 py-2 text-xs font-bold"
                  />

                  {/* 3-Dots Action Dropdown Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/[0.08] dark:bg-[#181b26] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="More Features"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
                      <DropdownMenuItem
                        onClick={() => {
                          setProfileNumber(n)
                        }}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>Edit Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setAutomationNumber(n)
                          setAutomationInitialTab('ice_breakers')
                        }}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <MessageCircle className="h-4 w-4 text-emerald-500" />
                        <span>Ice Breakers</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setAutomationNumber(n)
                          setAutomationInitialTab('slash_commands')
                        }}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <Terminal className="h-4 w-4 text-emerald-500" />
                        <span>Slash Commands</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSettingsNumber(n)
                        }}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      >
                        <Settings className="h-4 w-4 text-slate-500" />
                        <span>Advanced Settings</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(targetNumberToDisconnect)}
        message={`Are you sure you want to disconnect ${
          targetNumberToDisconnect?.displayName ||
          targetNumberToDisconnect?.phoneNumber ||
          'this WhatsApp Business number'
        }? You will need to re-authorize it to use it again.`}
        confirmLabel="Disconnect Number"
        confirmClassName="bg-red-600 hover:bg-red-700 font-bold"
        onConfirm={handleConfirmDisconnect}
        onCancel={() => setTargetNumberToDisconnect(null)}
      />

      {showAuthModal && (
        <DemoAnimatedAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        >
          <AuthPage onSuccess={() => setShowAuthModal(false)} />
        </DemoAnimatedAuthModal>
      )}

      {/* Terms and Conditions Modal */}
      <Modal
        isOpen={showTerms}
        onClose={() => setShowTerms(false)}
        onAgree={handleAgreeTerms}
      />

      {/* Conversational Automation Modal */}
      <MetaConversationalAutomationModal
        isOpen={Boolean(automationNumber)}
        onClose={() => setAutomationNumber(null)}
        selectedNumber={automationNumber}
        initialTab={automationInitialTab}
      />

      {/* Business Profile Modal */}
      <MetaBusinessProfileModal
        isOpen={Boolean(profileNumber)}
        onClose={() => setProfileNumber(null)}
        selectedNumber={profileNumber}
      />

      {/* Advanced Settings Modal */}
      <MetaNumberSettingsModal
        isOpen={Boolean(settingsNumber)}
        onClose={() => setSettingsNumber(null)}
        selectedNumber={settingsNumber}
      />

      {/* Onboarding Wizard Overlay */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-200 animate-in fade-in dark:bg-black/70">
          <div className="flex max-h-[85vh] w-3/4 max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Connect WhatsApp to Borade AI
              </h2>
              <button
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                onClick={() => setShowWizard(false)}
                aria-label="Close"
              >
                ✖
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 text-slate-700 dark:text-slate-300">
              <OnboardingWizard onComplete={handleWizardComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
