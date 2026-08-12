import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Provider, useSelector } from 'react-redux'
import {
  useMsg91DeleteTemplateMutation,
  useMsg91CloneTemplateMutation,
  useMsg91GetWhatsappActivationQuery,
  useMsg91GetTemplatesQuery,
  useMsg91GetAllCampaignsQuery,
} from '@/redux/apis/Templateapi'
import { store } from '@/redux/store/store'
import Msg91WhatsappLogs from '@/components/Msg91/whatsappCampaign/components/whatsappLogs/Msg91whatsapplogs'
import Msg91TemplateTable from '../whatsappCampaign/components/template/Msg91TemplateTable'
import Msg91WaCampaignModal from '../whatsappCampaign/components/campaign/Msg91WaCampaignmodal'
import Msg91CreateTemplateModal from '../whatsappCampaign/components/template/Msg91CreateTemplateModal'
import Msg91WaCampaignListPage from '../whatsappCampaign/components/campaign/WaCampaignList/Msg91WaCampaignListPage'
import Msg91TemplateToolbar from '../whatsappCampaign/components/template/Msg91TemplateToolbar'
import { Msg91WhatsappOnboardingPage } from '../whatsappCampaign/components/campaign/Msg91WhatsappOnboarding'
import { ThemedToast } from '@/ReUseAbleComponents/ThemedToast'
import ComingSoon from '@/pages/public/ComingSoon'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const extractErrorMessage = (err) => {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  return (
    err?.data?.message ??
    err?.data?.error ??
    err?.error ??
    err?.message ??
    `Error ${err?.status ?? ''}`
  )
    .toString()
    .trim()
}

const normaliseActivation = (raw) => {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : []
  return list.map((item) => ({ value: String(item.integrated_number) }))
}

const normaliseTemplates = (raw) => {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : (raw?.data ?? [])
  return list.map((t) => ({
    id: t._id ?? t.id ?? t.template_id ?? String(Date.now() + Math.random()),
    name: t.template_name ?? t.name ?? '—',
    category: (t.category ?? 'UTILITY').toUpperCase(),
    language: t.language ?? 'en',
    clicks: t.clicks ?? 0,
    status:
      t.status === 'APPROVED'
        ? 'Enabled'
        : t.status === 'REJECTED'
          ? 'Disabled'
          : t.status === 'PENDING'
            ? 'Pending'
            : (t.status ?? 'Pending'),
    _raw: t,
  }))
}

// ─── Video Guide Modal ────────────────────────────────────────────────────────

const VideoGuideModal = ({ open, onClose }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play()
    } else if (!open && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm duration-200 animate-in fade-in sm:p-4">
      <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl duration-200 animate-in zoom-in-95 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white px-4 py-3 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 sm:px-6 sm:py-4">
          <div className="min-w-0 pr-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              WhatsApp Setup Guide
            </h2>
            <p className="mt-0.5 text-[13px] text-gray-500 dark:text-zinc-400">
              Watch this quick tutorial to get started
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video max-h-[calc(100dvh-190px)] shrink bg-black">
          <video
            ref={videoRef}
            className="h-full w-full"
            controls
            controlsList="nodownload"
            onEnded={() => {
              // Optionally auto-close on video end
              // onClose()
            }}
          >
            <source
              src="https://dvjoibo2qkfpj.cloudfront.net/logo/Meta+Eamail+Add+BoradeAI+4+1.webm"
              type="video/webm"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 text-[12px] text-gray-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-gray-500 dark:text-zinc-400">
              Watch the full guide to complete your setup
            </span>
          </div>
          <button
            onClick={onClose}
            className="min-w-[68px] shrink-0 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ErrorBanner = ({ message, onRetry, onDismiss }) => (
  <div className="mb-4 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 font-sans text-[13px] text-red-800 animate-in fade-in slide-in-from-top-1">
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 stroke-red-500"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <span className="flex-1 leading-relaxed">{message}</span>
    <div className="flex shrink-0 gap-2">
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-lg leading-none text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  </div>
)

const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl dark:bg-blue-950/40">
      {icon}
    </div>
    <h3 className="mb-1.5 text-[15px] font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="mb-5 max-w-[320px] text-[13px] leading-relaxed text-gray-500 dark:text-zinc-400">
      {description}
    </p>
    {action}
  </div>
)

const Tab = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative min-w-0 flex-1 whitespace-nowrap px-1 pb-3 text-center font-sans text-[11px] font-medium transition-colors hover:text-[var(--app-brand-primary)] min-[380px]:text-[12px] sm:flex-none sm:shrink-0 sm:text-[13px] dark:text-white ${isActive ? 'text-[var(--app-brand-primary)]' : 'text-gray-500'}`}
    title={label}
  >
    {label}
    {isActive && (
      <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[var(--app-brand-primary)]" />
    )}
  </button>
)

const SkeletonRow = () => (
  <div className="border-bottom flex items-center gap-3 border-gray-100 px-5 py-3.5">
    {[180, 90, 70, 80, 60].map((w, i) => (
      <div
        key={i}
        style={{ width: w }}
        className="h-3 animate-pulse rounded-full bg-[var(--app-pages-bg)]"
      />
    ))}
  </div>
)

const ActivationSkeleton = () => (
  <div className="mb-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5">
    <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--app-pages-bg)]" />
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="h-3 w-40 animate-pulse rounded-full bg-[var(--app-pages-bg)]" />
      <div className="h-2.5 w-24 animate-pulse rounded-full bg-[var(--app-pages-bg)]" />
    </div>
  </div>
)
const isDev = process.env.NODE_ENV === 'development'

const TABS = [
  { key: 'connect', label: 'Connect' },
  { key: 'templates', label: 'Templates' },
  { key: 'campaigns', label: 'Campaigns' },
  isDev && { key: 'whatsappLogs', label: 'WhatsApp Logs' },
].filter(Boolean)

// ─── Inner page ───────────────────────────────────────────────────────────────

const MSG91TemplatePage = () => {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalWaCampaignOpen, setModalWaCampaignOpen] = useState(false)
  const [videoGuideOpen, setVideoGuideOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('connect')
  const reduxUser = useSelector((state) => state.auth?.user)
  const isGuestOrDemoUser =
    !reduxUser ||
    reduxUser?.isGuest === true ||
    Object.keys(reduxUser ?? {}).length === 0

  const [dismissedErrors, setDismissedErrors] = useState({})
  const [isSyncing, setIsSyncing] = useState(false)

  const toastTimerRef = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast(null)
  }, [])

  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    },
    []
  )

  const dismissError = useCallback(
    (key) => setDismissedErrors((prev) => ({ ...prev, [key]: true })),
    []
  )

  const {
    data: activationRaw,
    isLoading: isActivationLoading,
    isError: isActivationError,
    error: activationError,
    refetch: refetchActivation,
  } = useMsg91GetWhatsappActivationQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const integratedNumbers = useMemo(
    () => normaliseActivation(activationRaw),
    [activationRaw]
  )

  const defaultNumber = integratedNumbers?.[0]?.value

  const [selectedNumber, setSelectedNumber] = useState(defaultNumber || '')

  useEffect(() => {
    if (!selectedNumber && defaultNumber) {
      setSelectedNumber(defaultNumber)
    }
  }, [defaultNumber, selectedNumber])

  useEffect(() => {
    setDismissedErrors({})
  }, [selectedNumber])

  // 5. The Query (Keep 'skip' logic for safety)
  const {
    data: templatesRaw,
    isLoading,
    isError: isTemplateError,
    error: fetchError,
    refetch,
  } = useMsg91GetTemplatesQuery(selectedNumber, {
    skip: !selectedNumber,
  })

  const templates = useMemo(
    () => normaliseTemplates(templatesRaw),
    [templatesRaw]
  )
  const filtered = useMemo(
    () =>
      templates.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
      ),
    [templates, search]
  )

  const [deleteTemplate] = useMsg91DeleteTemplateMutation()
  const [cloneTemplate] = useMsg91CloneTemplateMutation()

  const openCreate = useCallback(() => {
    setEditTarget(null)
    setModalOpen(true)
  }, [])
  const openEdit = useCallback((tpl) => {
    setEditTarget(tpl)
    setModalOpen(true)
  }, [])
  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditTarget(null)
  }, [])

  const handleSave = useCallback(() => {
    showToast(
      editTarget
        ? 'Template updated successfully'
        : 'Template created successfully'
    )
    closeModal()
  }, [editTarget, showToast, closeModal])

  const handleDelete = useCallback(
    async (template) => {
      try {
        await deleteTemplate({
          integratedNumber: selectedNumber,
          templateName: template.name.toLowerCase().trim(),
          template_id: template._raw?._id,
        }).unwrap()
        showToast('Deleted', 'info')
      } catch (err) {
        showToast(extractErrorMessage(err), 'error')
      }
    },
    [deleteTemplate, selectedNumber, showToast]
  )

  const handleDuplicate = useCallback(
    async (tpl) => {
      try {
        await cloneTemplate(tpl.id).unwrap()
        showToast('Template cloned — new DRAFT created')
      } catch (err) {
        showToast(extractErrorMessage(err), 'error')
      }
    },
    [cloneTemplate, showToast]
  )

  const handleSync = useCallback(async () => {
    if (!selectedNumber) return
    setIsSyncing(true)
    try {
      await refetch()
      showToast(`Templates synced for ${selectedNumber}`)
    } catch (err) {
      showToast(extractErrorMessage(err), 'error')
    } finally {
      setIsSyncing(false)
    }
  }, [refetch, showToast, selectedNumber])

  const editInitialData = useMemo(() => {
    if (!editTarget) return undefined
    const r = editTarget._raw ?? editTarget
    return {
      id: editTarget.id,
      name: r.template_name ?? r.name ?? editTarget.name ?? '',
      category: r.category
        ? r.category.charAt(0).toUpperCase() + r.category.slice(1).toLowerCase()
        : 'Utility',
      ttl: r.ttl ?? '',
      languages: r.language ? [r.language] : ['en'],
      marketingType: 'Custom',
      productFormat: 'Catalogue',
      header: 'None',
      headerText: '',
      body: r.body ?? '',
      footer: r.footer ?? '',
      buttons: [],
      enableClickCount: false,
      carouselHeaderType: 'Image',
      carouselButton1Type: 'Custom',
      carouselButton2Type: 'None',
      carouselCards: [],
      addSecurityRecommendation: false,
      codeExpirationMinutes: '',
      buttonText: 'Copy code',
    }
  }, [editTarget])

  const showActivationError =
    isActivationError && !dismissedErrors['activation']
  const showTemplateError = isTemplateError && !dismissedErrors['template']
  const noNumbers =
    !isActivationLoading && !isActivationError && integratedNumbers.length === 0
  const hasNumbers = integratedNumbers.length > 0 || isActivationLoading

  const [campaignRefreshKey, setCampaignRefreshKey] = useState(0)
  const [campaignLoading, setCampaignLoading] = useState(false)

  const handleRefetchCampaign = () => {
    setCampaignRefreshKey((prev) => prev + 1)
  }

  return (
    <div
      className={`flex min-h-full flex-col border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] transition-colors duration-300 sm:h-[calc(100vh-130px)] sm:overflow-hidden ${
        isGuestOrDemoUser
          ? 'pb-[calc(132px_+_env(safe-area-inset-bottom))]'
          : 'pb-28'
      }`}
    >
      <div className="flex-1 overflow-y-auto px-4 pb-0 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {/* Page header */}
        <div className="mb-3 flex px-0 sm:mb-6 sm:justify-end">
  <button
    onClick={() => setVideoGuideOpen(true)}
    className="flex items-center gap-2 rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-1.5 text-[13px] font-medium text-[var(--app-text-color)] shadow-sm transition-colors hover:opacity-90"
  >
    <svg className="h-4 w-4 text-[var(--app-brand-primary)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
    </svg>
    Watch Setup Guide
  </button>
</div>

        {isActivationLoading && <ActivationSkeleton />}

        {showActivationError && (
          <ErrorBanner
            message={`Could not load WhatsApp numbers: ${extractErrorMessage(activationError)}`}
            onRetry={refetchActivation}
            onDismiss={() => dismissError('activation')}
          />
        )}

        {noNumbers && (
          <div
            className={`mb-4 max-w-full overflow-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] ${
              isGuestOrDemoUser
                ? 'mb-[calc(104px_+_env(safe-area-inset-bottom))]'
                : 'mb-4'
            }`}
          >
            <Msg91WhatsappOnboardingPage
              onWatchGuide={() => setVideoGuideOpen(true)}
            />
          </div>
        )}

        {hasNumbers && (
          <div className="max-w-full overflow-x-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
            {/* Tab bar */}
            <div className="touch-pan-x overflow-x-auto border-b border-[var(--app-pages-border)]">
              <div className="flex min-w-max gap-4 px-4 pt-2.5 sm:gap-7 sm:px-6">
                {TABS.map(({ key, label }) => (
                  <Tab
                    key={key}
                    label={label}
                    isActive={activeTab === key}
                    onClick={() => setActiveTab(key)}
                  />
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="max-w-full overflow-x-hidden duration-300 animate-in fade-in">
              {activeTab === 'connect' && (
                <Msg91WhatsappOnboardingPage
                  onWatchGuide={() => setVideoGuideOpen(true)}
                />
              )}
              {activeTab === 'templates' && (
                <TemplatesTab
                  search={search}
                  onSearchChange={setSearch}
                  selectedNumber={selectedNumber}
                  integratedNumbers={integratedNumbers}
                  onNumberChange={(num) => {
                    setSelectedNumber(num)
                    setSearch('')
                  }}
                  LoadingTable={isLoading}
                  onSync={handleSync}
                  isSyncing={isSyncing}
                  onCreate={openCreate}
                  onCreateWhatsAppCampaign={() => setModalWaCampaignOpen(true)}
                  isLoading={isLoading}
                  showTemplateError={showTemplateError}
                  fetchError={fetchError}
                  dismissError={dismissError}
                  refetch={refetch}
                  filtered={filtered}
                  templates={templates}
                  isTemplateError={isTemplateError}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  isTemplate={true}
                  isCampaign={false}
                  handleRefetchCampaign={handleRefetchCampaign}
                  campaignLoading={campaignLoading}
                />
              )}
              {activeTab === 'campaigns' && (
                <>
                  <TemplatesTab
                    search={search}
                    onSearchChange={setSearch}
                    selectedNumber={selectedNumber}
                    integratedNumbers={integratedNumbers}
                    onNumberChange={(num) => {
                      setSelectedNumber(num)
                      setSearch('')
                    }}
                    LoadingTable={isLoading}
                    onSync={handleSync}
                    isSyncing={isSyncing}
                    onCreate={openCreate}
                    onCreateWhatsAppCampaign={() =>
                      setModalWaCampaignOpen(true)
                    }
                    isLoading={isLoading}
                    showTemplateError={showTemplateError}
                    fetchError={fetchError}
                    dismissError={dismissError}
                    refetch={refetch}
                    filtered={filtered}
                    templates={templates}
                    isTemplateError={isTemplateError}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    isTemplate={false}
                    isCampaign={true}
                    ModalWaCampaignOpen={modalWaCampaignOpen}
                    handleRefetchCampaign={handleRefetchCampaign}
                    MaincampaignLoading={campaignLoading}
                  />
                  <Msg91WaCampaignListPage
                    ModalWaCampaignOpen={modalWaCampaignOpen}
                    refreshKey={campaignRefreshKey}
                    onLoadingChange={setCampaignLoading}
                    search={search}
                  />
                </>
              )}
              {activeTab === 'whatsappLogs' && (
                <Msg91WhatsappLogs
                  integratedNumbers={integratedNumbers}
                  selectedNumber={selectedNumber}
                  onNumberChange={(num) => {
                    setSelectedNumber(num)
                    setSearch('')
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Msg91CreateTemplateModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initialData={editInitialData}
        integratedNumber={selectedNumber}
      />
      <Msg91WaCampaignModal
        open={modalWaCampaignOpen}
        onClose={() => setModalWaCampaignOpen(false)}
        wabaNumbers={integratedNumbers}
        selectedNumber={selectedNumber}
      />
      <VideoGuideModal
        open={videoGuideOpen}
        onClose={() => setVideoGuideOpen(false)}
      />

      <div className="fixed bottom-5 right-5 z-[9999]">
        {toast && (
          <ThemedToast
            type={toast.type}
            message={toast.message}
            onDismiss={dismissToast}
          />
        )}
      </div>
    </div>
  )
}

const TemplatesTab = ({
  search,
  onSearchChange,
  selectedNumber,
  integratedNumbers,
  onNumberChange,
  LoadingTable,
  onSync,
  isSyncing,
  onCreate,
  onCreateWhatsAppCampaign,
  isLoading,
  showTemplateError,
  fetchError,
  dismissError,
  refetch,
  filtered,
  templates,
  isTemplateError,
  onEdit,
  onDelete,
  onDuplicate,
  isTemplate,
  isCampaign,
  handleRefetchCampaign,
  MaincampaignLoading,
}) => (
  <>
    {showTemplateError && (
      <div className="px-5 pt-4">
        <ErrorBanner
          message={`Failed to load templates: ${extractErrorMessage(fetchError)}`}
          onRetry={() => {
            dismissError('template')
            refetch()
          }}
          onDismiss={() => dismissError('template')}
        />
      </div>
    )}

    <Msg91TemplateToolbar
      search={search}
      onSearchChange={onSearchChange}
      selectedNumber={selectedNumber}
      numbers={integratedNumbers}
      onNumberChange={onNumberChange}
      isTemplate={isTemplate}
      isCampaign={isCampaign}
      onSync={onSync}
      onCreate={onCreate}
      onCreateWhatsAppCampaign={onCreateWhatsAppCampaign}
      onFilter={() => { }}
      syncing={isSyncing}
      handleRefetchCampaign={handleRefetchCampaign}
      subMaincampaignLoading={MaincampaignLoading}
    />

    {!isCampaign && isTemplate && (
      <>
        {isLoading && LoadingTable ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : (
          <Msg91TemplateTable
            templates={filtered}
            loading={false}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onCreateClick={onCreate}
          />
        )}
        {!isLoading &&
          !isTemplateError &&
          filtered.length === 0 &&
          templates.length > 0 && (
            <EmptyState
              icon="🔍"
              title="No templates match your search"
              description={`No results for "${search}". Try a different keyword.`}
              action={
                <button
                  onClick={() => onSearchChange('')}
                  className="rounded-lg border border-[var(--app-pages-border)] px-4 py-2 text-[13px] font-medium text-[var(--app-pages-text)] transition-colors hover:bg-[var(--app-pages-bg)]"
                >
                  Clear Search
                </button>
              }
            />
          )}

        {!isLoading &&
          !isTemplateError &&
          templates.length === 0 &&
          !search && (
            <EmptyState
              icon="📄"
              title="No templates yet"
              description="Create your first WhatsApp template to start sending campaigns."
              action={
                <button
                  onClick={onCreate}
                  className="px-4.5 rounded-lg py-2  font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90"
                >
                  + Create Template
                </button>
              }
            />
          )}

        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-2 text-[11px] text-gray-400 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-500">
          <span>
            {isLoading
              ? 'Loading templates…'
              : isTemplateError
                ? 'Could not load templates'
                : `${filtered.length} template${filtered.length !== 1 ? 's' : ''}${search ? ' matching search' : ''}`}
          </span>
          {selectedNumber && (
            <span className="flex items-center gap-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${isTemplateError ? 'bg-red-500' : 'bg-green-500'}`}
              />
              {selectedNumber}
            </span>
          )}
        </div>
      </>
    )}
  </>
)

const MSG91WhatsappTemplate = () => {
  const isDev = process.env.NODE_ENV
  return (
    <Provider store={store}>
      {/* {isDev === 'development' ? <MSG91TemplatePage /> : <ComingSoon />} */}
      <MSG91TemplatePage />
    </Provider>
  )
}

export default MSG91WhatsappTemplate
