import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Eye,
  X,
  Filter,
  Clock,
  Users,
  Star,
  Loader2,
  ChevronDown,
  Mail,
  Wand2,
  Pencil,
  Trash2,
  Database,
  FolderOpen,
} from 'lucide-react'
import { useTheme } from '@/components/global/theme-provider'
import {
  useGetAITemplatesQuery,
  useUseAITemplateMutation,
  useGenerateAITemplateMutation,
} from '@/redux/apis/aiTemplateApi'
import { aiTemplateApi } from '@/redux/apis/aiTemplateApi'
import { useGetEmailTemplatesQuery } from '@/redux/apis/emailTemplateApi'
import { useSocketEvents } from '@/hooks/useSocket'
import { useDispatch, useSelector } from 'react-redux'
import { createPortal } from 'react-dom'
import { useNavigate } from '@/components/react-router-dom'
import toast from 'react-hot-toast'
import BillingDetailsModal from '@/components/global/BillingDetailsModal.jsx'
import {
  savePostPaymentTask,
  usePostPaymentResume,
  CreditTopupSummary,
} from '@/ReUseAbleComponents/CreditDialog.jsx'
import {
  useGetCreditsQuery,
  useGetServiceCostsQuery,
  useInitializePayUMutation,
  useGetInvoiceStatusQuery,
} from '@/redux/apis/payment.api.js'
import { useGetSettingValuesQuery } from '@/redux/apis/settingsApi.js'
import useCountry from '@/hooks/useCountry.jsx'

const CATEGORIES = [
  'All',
  'General',
  'Welcome',
  'Newsletter',
  'Promotional',
  'Transactional',
  'Event',
  'Follow-up',
  'Onboarding',
  'Feedback',
  'Other',
]

const CATEGORY_COLORS = {
  General: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Welcome:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Newsletter:
    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Promotional:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Transactional:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Event: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Follow-up':
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Onboarding:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Feedback:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

export default function AIGeneratedEmailTemplates({
  from,
  onEditTemplate,
  isShowGenerateActivate,
  handleCloseGenerateActivate,
  isModalOnly,
}) {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [customizationModal, setCustomizationModal] = useState(null)

  const reduxUser = useSelector((state) => state.auth?.user)

  const { data: creditsData } = useGetCreditsQuery(reduxUser?._id, {
    skip: !reduxUser?._id,
  })
  const availableCredits = creditsData?.credits?.availableTotal ?? 0

  const { data: serviceCostsData } = useGetServiceCostsQuery()
  const serviceCosts = serviceCostsData?.serviceCosts || []
  const aiTemplateCostConfig = serviceCosts.find(
    (c) =>
      c.serviceName === 'emailTemplateAiGeneration' ||
      c.serviceName === 'createTemplates' ||
      c.serviceName === 'aiEmailTemplateGen'
  )
  const aiTemplateCost = aiTemplateCostConfig
    ? Number(aiTemplateCostConfig.cost || aiTemplateCostConfig.creditCost || 1)
    : 1

  const [showBillingModal, setShowBillingModal] = useState(false)
  const [pendingPayment, setPendingPayment] = useState(null)
  const [payULoading, setPayULoading] = useState(false)

  const { data: walletConfig } = useGetSettingValuesQuery(
    'wallet_exchange_config'
  )
  const exchangeRate =
    walletConfig?.values?.exchange_rate ?? walletConfig?.exchange_rate ?? 1

  const { country: detectedCountry } = useCountry()
  const { data: invoiceStatus } = useGetInvoiceStatusQuery()
  const [initializePayU] = useInitializePayUMutation()

  const freeUsage = creditsData?.credits?.freeUsage?.aiEmailTemplateGen || {
    used: 0,
    limit: 0,
  }
  const remainingFree = Math.max(0, freeUsage.limit - freeUsage.used)
  const requiredCredits = Math.max(0, 1 - remainingFree) * aiTemplateCost
  const hasInsufficientCredits = requiredCredits > availableCredits
  const creditsNeeded = Math.ceil(
    Math.max(0, requiredCredits - availableCredits)
  )
  const amountToPay = Math.ceil(creditsNeeded / exchangeRate)

  const navigate = useNavigate();
  const handleDynamicPayment = async (taskData) => {
    navigate('/pricing')
  }

  // const handleDynamicPayment = async (taskData) => {
  //   const isBillingComplete = invoiceStatus?.success && invoiceStatus?.data?.isBillingComplete
  //   savePostPaymentTask('AI_EMAIL_TEMPLATE', taskData)

  //   if (!isBillingComplete) {
  //     setPendingPayment({ amount: amountToPay, credits: creditsNeeded })
  //     setShowBillingModal(true)
  //     return
  //   }
  //   await proceedDynamicPayU(amountToPay, creditsNeeded)
  // }

  const proceedDynamicPayU = async (amount, credits) => {
    try {
      setPayULoading(true)
      const res = await initializePayU({
        amount,
        planName: '1 yr pro plan',
        creditsPurchasing: Math.round(amount * exchangeRate),
        billingCycle: 'one-time',
        userId: reduxUser?._id,
        country: detectedCountry || 'IN',
        redirectUrl: window.location.pathname + window.location.search,
        redirectParam: 'wallet_topup',
        address: invoiceStatus?.data?.address || reduxUser?.address,
        city: invoiceStatus?.data?.district || reduxUser?.district,
        state: invoiceStatus?.data?.state || reduxUser?.state,
        pincode: invoiceStatus?.data?.pincode || reduxUser?.pincode,
        gstNumber: invoiceStatus?.data?.gstNumber || reduxUser?.gstNumber,
      }).unwrap()

      if (res?.action && res?.params) {
        const pf = document.createElement('form')
        pf.action = res.action
        pf.method = 'POST'
        Object.keys(res.params).forEach((k) => {
          const i = document.createElement('input')
          i.type = 'hidden'
          i.name = k
          i.value = res.params[k]
          pf.appendChild(i)
        })
        document.body.appendChild(pf)
        pf.submit()
      } else {
        toast.error('Failed to initialize payment')
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to initialize payment')
    } finally {
      setPayULoading(false)
    }
  }

  const [showGenerate, setShowGenerate] = useState(false)
  const [genPrompt, setGenPrompt] = useState(
    () => sessionStorage.getItem('aiGen_prompt') || ''
  )

  const isAdmin = reduxUser?.role === 'admin'
  const [genSaveAs, setGenSaveAs] = useState('ai_template')
  const [genDataType, setGenDataType] = useState('analysis')
  const [genStatus, setGenStatus] = useState(null)

  useEffect(() => {
    sessionStorage.removeItem('aiGen_showGenerate')
    sessionStorage.removeItem('aiGen_status')
  }, [])

  useEffect(() => {
    if (isShowGenerateActivate) setShowGenerate(true)
  }, [isShowGenerateActivate])

  useEffect(() => {
    sessionStorage.setItem('aiGen_prompt', genPrompt)
  }, [genPrompt])

  const {
    data: templates = [],
    isLoading,
    isError,
    refetch,
  } = useGetAITemplatesQuery({
    category: selectedCategory,
    search: search.trim(),
  })

  const { data: userTemplates = [] } = useGetEmailTemplatesQuery({
    select: 'sourceAITemplate',
  })
  const usedAITemplateIds = useMemo(() => {
    return new Set(userTemplates.map((t) => t.sourceAITemplate).filter(Boolean))
  }, [userTemplates])
  const [useTemplate, { isLoading: isUsing }] = useUseAITemplateMutation()
  const [generateTemplate] = useGenerateAITemplateMutation()
  const pendingAIEditRef = useRef(false)

  usePostPaymentResume({
    taskType: 'AI_EMAIL_TEMPLATE',
    onResume: useCallback(
      (taskData) => {
        toast.success('Payment successful! Resuming generation...')
        if (taskData.action === 'GENERATE') {
          setGenPrompt(taskData.prompt)
          setGenSaveAs(taskData.saveAs)
          setGenDataType(taskData.dataType)
          setShowGenerate(true)
          setGenStatus({
            status: 'generating',
            message: 'Queuing...',
            progress: 5,
          })
          generateTemplate({
            prompt: taskData.prompt,
            saveAs: taskData.saveAs,
            dataType: taskData.dataType,
          })
            .unwrap()
            .catch((err) => {
              setGenStatus({
                status: 'failed',
                message: err?.data?.message || 'Generation failed',
                progress: 0,
              })
            })
        } else if (taskData.action === 'CUSTOMIZE') {
          setGenStatus({
            status: 'generating',
            message: 'Queuing...',
            progress: 5,
          })
          setShowGenerate(true)
          generateTemplate({
            prompt: taskData.prompt,
            saveAs: taskData.saveAs,
            dataType: taskData.dataType,
            sourceAITemplateId: taskData.templateId,
          })
            .unwrap()
            .catch((err) => {
              setGenStatus({
                status: 'failed',
                message: err?.data?.message || 'Generation failed',
                progress: 0,
              })
            })
        }
      },
      [generateTemplate]
    ),
    enabled: !!creditsData && !isLoading,
  })

  const handleGenerating = useCallback((data) => {
    setGenStatus({
      status: 'generating',
      message: data.message,
      progress: data.progress,
    })
  }, [])
  const handleCompleted = useCallback(
    (data) => {
      setGenStatus({
        status: 'completed',
        message: data.message,
        progress: 100,
        template: data.template,
      })
      sessionStorage.removeItem('aiGen_prompt')
      setGenPrompt('')
      dispatch(
        aiTemplateApi.util.invalidateTags([
          { type: 'AIEmailTemplate', id: 'LIST' },
          { type: 'EmailTemplate', id: 'LIST' },
        ])
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (genStatus?.status !== 'completed') return
    const timer = setTimeout(() => {
      setShowGenerate(false)
      setGenStatus(null)
      setGenPrompt('')
      if (handleCloseGenerateActivate) handleCloseGenerateActivate()
      if (pendingAIEditRef.current && onEditTemplate && genStatus?.template) {
        onEditTemplate(genStatus.template)
        pendingAIEditRef.current = false
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [genStatus?.status])

  const handleFailed = useCallback((data) => {
    setGenStatus({ status: 'failed', message: data.message, progress: 0 })
  }, [])

  useSocketEvents({
    'email-template:generating': handleGenerating,
    'email-template:completed': handleCompleted,
    'email-template:failed': handleFailed,
  })

  const featuredTemplates = useMemo(
    () => templates.filter((t) => t.isFeatured),
    [templates]
  )
  const regularTemplates = useMemo(
    () => templates.filter((t) => !t.isFeatured),
    [templates]
  )
  const AllTemplatesForLoggedUser = [...featuredTemplates, ...regularTemplates]

  const handleUseTemplateClick = (template, openInEditor = false) => {
    setCustomizationModal({ template, openInEditor })
  }

  const handleProceedCustomization = async (type) => {
    if (!customizationModal) return
    const { template, openInEditor } = customizationModal
    setCustomizationModal(null)

    if (type === 'manual') {
      try {
        const result = await useTemplate({ id: template._id }).unwrap()
        setCopiedId(template._id)
        if (openInEditor && onEditTemplate && result?.template) {
          setPreviewTemplate(null)
          onEditTemplate(result.template)
        }
      } catch (err) {
        console.error('Failed to use template:', err)
      }
    } else {
      const saveAs = isAdmin ? genSaveAs : 'user_template'
      const dataType = isAdmin ? genDataType : 'analysis'
      const promptToUse =
        template.prompt ||
        `Generate an email template similar to ${template.name}`

      if (hasInsufficientCredits) {
        handleDynamicPayment({
          action: 'CUSTOMIZE',
          prompt: promptToUse,
          saveAs,
          dataType,
          templateId: template._id,
          openInEditor,
        })
        return
      }

      if (openInEditor) pendingAIEditRef.current = true
      setGenStatus({ status: 'generating', message: 'Queuing...', progress: 5 })
      setShowGenerate(true)
      try {
        await generateTemplate({
          prompt: promptToUse,
          saveAs,
          dataType,
          sourceAITemplateId: template._id,
        }).unwrap()
        setPreviewTemplate(null)
      } catch (err) {
        setGenStatus({
          status: 'failed',
          message: err?.data?.message || 'Generation failed',
          progress: 0,
        })
        pendingAIEditRef.current = false
      }
    }
  }

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return

    const saveAs = isAdmin ? genSaveAs : 'user_template'
    const dataType = isAdmin ? genDataType : 'analysis'

    if (hasInsufficientCredits) {
      handleDynamicPayment({
        action: 'GENERATE',
        prompt: genPrompt.trim(),
        saveAs,
        dataType,
      })
      return
    }

    setGenStatus({ status: 'generating', message: 'Queuing...', progress: 5 })
    try {
      await generateTemplate({
        prompt: genPrompt.trim(),
        saveAs,
        dataType,
      }).unwrap()
    } catch (err) {
      setGenStatus({
        status: 'failed',
        message: err?.data?.message || 'Generation failed',
        progress: 0,
      })
    }
  }

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const closeGenerateModal = () => {
    setShowGenerate(false)
    setGenStatus(null)
    setGenPrompt('')
    sessionStorage.removeItem('aiGen_prompt')
    if (handleCloseGenerateActivate) handleCloseGenerateActivate()
  }

  // ── Shared Generate Modal ──
  const GenerateModal = createPortal(
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        className="bg-black/50 absolute inset-0 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--app-pages-text)]">
            <Wand2 className="h-4.5 w-4.5 text-[var(--app-brand-primary)]" />
            Generate Email Template
          </h2>
          <button
            onClick={closeGenerateModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-pages-text)] transition-colors hover:text-[var(--app-pages-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {genStatus ? (
          <div className="space-y-4">
            <div className="bg-[var(--app-pages-border)]/10 rounded-xl border border-[var(--app-pages-border)] p-4">
              <div className="mb-3 flex items-center gap-2">
                {genStatus.status === 'generating' && (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--app-brand-primary)]" />
                )}
                {genStatus.status === 'completed' && (
                  <Sparkles className="h-4 w-4 text-[var(--app-brand-primary)]" />
                )}
                {genStatus.status === 'failed' && (
                  <X className="h-4 w-4 text-[var(--app-debit-color)]" />
                )}
                <span className="text-sm font-medium text-[var(--app-pages-text)]">
                  {genStatus.message}
                </span>
              </div>
              {/* Progress track with visible contrast */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-pages-border)]">
                <div
                  className="h-full rounded-full bg-[var(--app-brand-primary)] transition-all duration-500"
                  style={{ width: `${genStatus.progress}%` }}
                />
              </div>
              <p className="mt-2.5 text-xs text-[var(--app-pages-subhead-text)]">
                Your business profile data is being used to personalize the
                template.
              </p>
            </div>
            {genStatus.status === 'failed' && (
              <button
                onClick={() => setGenStatus(null)}
                className="hover:bg-[var(--app-pages-border)]/20 w-full rounded-lg border border-[var(--app-pages-border)] py-2.5 text-sm font-medium text-[var(--app-pages-text)] transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-[var(--app-pages-subhead-text)]">
              Describe the email you need. AI will use your business profile to
              personalize it automatically.
            </p>
            <textarea
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. A follow-up email for customers who visited our website but didn't sign up..."
              className="focus:ring-[var(--app-brand-primary)]/20 focus:border-[var(--app-brand-primary)]/50 w-full resize-none rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3.5 py-2.5 text-sm text-[var(--app-pages-text)] placeholder-[var(--app-pages-subhead-text)] transition-all focus:outline-none focus:ring-2"
            />
            {isAdmin && (
              <AdminGenOptions
                saveAs={genSaveAs}
                setSaveAs={setGenSaveAs}
                dataType={genDataType}
                setDataType={setGenDataType}
              />
            )}
            {creditsData && (
              <div className="mb-4 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-[var(--app-pages-text)]">
                    Available Credits:{' '}
                    <strong>{availableCredits.toLocaleString()}</strong>
                  </span>
                  {remainingFree > 0 && (
                    <span className="font-medium text-[var(--app-pages-text)]">
                      {remainingFree} free template
                      {remainingFree !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>
              </div>
            )}

            <CreditTopupSummary
              creditsNeeded={creditsNeeded}
              amountToPay={amountToPay}
              isVisible={hasInsufficientCredits && genPrompt.trim().length > 0}
            />

            <button
              onClick={
                hasInsufficientCredits
                  ? () =>
                      handleDynamicPayment({
                        action: 'GENERATE',
                        prompt: genPrompt.trim(),
                        saveAs: isAdmin ? genSaveAs : 'user_template',
                        dataType: isAdmin ? genDataType : 'analysis',
                      })
                  : handleGenerate
              }
              disabled={!genPrompt.trim() || payULoading}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                !genPrompt.trim()
                  ? 'cursor-not-allowed border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-subhead-text)]'
                  : hasInsufficientCredits
                    ? 'border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:opacity-90'
                    : 'bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] hover:opacity-90 active:scale-[0.97]'
              }`}
            >
              {payULoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {hasInsufficientCredits
                ? 'Add Credits & Continue'
                : 'Generate My Template'}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )

  if (isModalOnly) {
    return <>{showGenerate && GenerateModal}</>
  }

  return (
    <div className="flex max-h-[80vh] min-h-20 w-full flex-col gap-5 overflow-y-auto p-4 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Search + Filter Bar ── */}
      {from !== 'customizedTemplates' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-pages-subhead-text)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="focus:ring-[var(--app-brand-primary)]/20 focus:border-[var(--app-brand-primary)]/50 w-full rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] py-2.5 pl-10 pr-4 text-sm text-[var(--app-pages-text)] placeholder-[var(--app-pages-subhead-text)] transition-all focus:outline-none focus:ring-2"
            />
          </div>

          {/* Category dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="hover:border-[var(--app-brand-primary)]/40 flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-2.5 text-sm font-medium text-[var(--app-pages-text)] transition-all sm:w-48"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--app-pages-subhead-text)]" />
                {selectedCategory}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--app-pages-subhead-text)] transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`}
              />
            </button>
            {showCategoryDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowCategoryDropdown(false)}
                />
                <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] py-1 shadow-lg">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat)
                        setShowCategoryDropdown(false)
                      }}
                      className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-[var(--app-brand-primary)]/5 font-medium text-[var(--app-brand-primary)]'
                          : 'hover:bg-[var(--app-pages-border)]/20 text-[var(--app-pages-text)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Section heading for customizedTemplates ── */}
      {from === 'customizedTemplates' && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--app-pages-text)]">
              All AI Templates
            </h3>
            <span className="text-xs text-[var(--app-pages-subhead-text)]">
              {AllTemplatesForLoggedUser.length} templates
            </span>
          </div>
          <button
            onClick={() => setShowGenerate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--app-profile-btn-bg)] px-4 py-2 text-sm font-medium text-[var(--app-profile-btn-text)] transition-all hover:opacity-90 active:scale-[0.97]"
          >
            <Wand2 className="h-4 w-4" /> Generate
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="h-7 w-7 animate-spin text-[var(--app-brand-primary)]" />
          <p className="text-sm text-[var(--app-pages-subhead-text)]">
            Loading templates...
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {isError && !isLoading && (
        <div className="rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 text-center">
          <p className="text-sm text-[var(--app-pages-text)]">
            Failed to load.{' '}
            <button
              onClick={refetch}
              className="font-medium text-[var(--app-brand-primary)] underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        </div>
      )}

      {/* ── Cards grid ── */}
      <div className="themed-scrollbar w-full flex-1 overflow-y-auto pr-1">
        {!isLoading && !isError && templates.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[var(--app-pages-border)] px-4 py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
              <Mail className="h-5 w-5 text-[var(--app-pages-subhead-text)]" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-[var(--app-pages-text)]">
                No templates found
              </h3>
              <p className="mt-1 text-xs text-[var(--app-pages-subhead-text)]">
                {search || selectedCategory !== 'All'
                  ? 'Try changing your search or filters.'
                  : 'Click "Generate" to create one with AI!'}
              </p>
              {from === 'customizedTemplates' && (
                <button
                  onClick={() => setShowGenerate(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--app-profile-btn-bg)] px-4 py-2 text-sm font-medium text-[var(--app-profile-btn-text)] transition-all hover:opacity-90 active:scale-[0.97]"
                >
                  <Wand2 className="h-4 w-4" /> Generate Template
                </button>
              )}
            </div>
          </div>
        )}

        {!isLoading && AllTemplatesForLoggedUser.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {AllTemplatesForLoggedUser.map((t) => (
              <TemplateCard
                key={t._id}
                template={t}
                copiedId={copiedId}
                isUsing={isUsing}
                onUse={(tId) => {
                  if (reduxUser?.isGuest) {
                    window.dispatchEvent(new Event('openAuthModal'))
                    return
                  }
                  const tpl = AllTemplatesForLoggedUser.find(
                    (x) => x._id === tId
                  )
                  if (tpl) handleUseTemplateClick(tpl, false)
                }}
                onPreview={setPreviewTemplate}
                formatDate={formatDate}
                isFeatured={t.isFeatured}
                isAlreadyInLibrary={usedAITemplateIds.has(t._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Generate Modal ── */}
      {showGenerate && GenerateModal}

      {/* ── Customization Modal ── */}
      {customizationModal &&
        createPortal(
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div
              className="bg-[var(--app-pages-bg)]/60 absolute inset-0 backdrop-blur-sm"
            />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6 shadow-2xl">
              {/* Header */}
              <div className="mb-2 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-semibold text-[var(--app-pages-text)]">
                  <Wand2 className="h-4.5 w-4.5 text-[var(--app-brand-primary)]" />
                  Use Template
                </h2>
                <button
                  onClick={() => setCustomizationModal(null)}
                  className="hover:bg-[var(--app-pages-border)]/20 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--app-pages-border)] text-[var(--app-pages-text)] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-5 text-sm leading-relaxed text-[var(--app-pages-subhead-text)]">
                How would you like to use this template? You can generate a new
                version tailored with your business analysis, or copy it
                directly for manual edits.
              </p>
              <div className="flex flex-col gap-2.5">
                {/* AI option */}
                <button
                  onClick={() => handleProceedCustomization('ai')}
                  className="hover:border-[var(--app-brand-primary)]/50 hover:bg-[var(--app-brand-primary)]/5 group flex w-full items-center gap-4 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 text-left transition-all"
                >
                  <div className="bg-[var(--app-pages-border)]/20 group-hover:border-[var(--app-brand-primary)]/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-pages-border)] transition-colors">
                    <Sparkles className="h-5 w-5 text-[var(--app-brand-primary)]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[var(--app-pages-text)]">
                      Customize with AI Analysis
                    </h4>
                    <p className="mt-0.5 text-xs text-[var(--app-pages-subhead-text)]">
                      Generate a personalized version with your business data
                    </p>
                  </div>
                </button>

                {/* Manual option */}
                <button
                  onClick={() => handleProceedCustomization('manual')}
                  className="hover:border-[var(--app-brand-primary)]/50 hover:bg-[var(--app-brand-primary)]/5 group flex w-full items-center gap-4 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-4 text-left transition-all"
                >
                  <div className="bg-[var(--app-pages-border)]/20 group-hover:border-[var(--app-brand-primary)]/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-pages-border)] transition-colors">
                    <Pencil className="h-5 w-5 text-[var(--app-brand-primary)]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[var(--app-pages-text)]">
                      Manual Customization
                    </h4>
                    <p className="mt-0.5 text-xs text-[var(--app-pages-subhead-text)]">
                      Copy exactly as is and edit it yourself
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Preview Modal ── */}
      {previewTemplate &&
        createPortal(
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4">
            <div
              className="bg-[var(--app-pages-bg)]/60 absolute inset-0 backdrop-blur-sm"
            />
            <div className="relative z-10 flex max-h-[95dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-2xl">
              {/* Preview Header */}
              <div className="flex flex-col gap-2 border-b border-[var(--app-pages-border)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-[var(--app-pages-text)]">
                    {previewTemplate.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-[var(--app-pages-subhead-text)]">
                    Subject: {previewTemplate.subject}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {onEditTemplate && (
                    <button
                      onClick={() =>
                        handleUseTemplateClick(previewTemplate, true)
                      }
                      disabled={isUsing}
                      className="hover:border-[var(--app-brand-primary)]/50 flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3.5 py-2 text-sm font-medium text-[var(--app-pages-text)] transition-all hover:text-[var(--app-brand-primary)] disabled:opacity-50 sm:flex-none"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Use & Edit
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleUseTemplateClick(previewTemplate, false)
                    }
                    disabled={isUsing || copiedId === previewTemplate._id}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all sm:flex-none ${
                      copiedId === previewTemplate._id
                        ? 'bg-[var(--app-credit-color)]/10 border-[var(--app-credit-color)]/30 border text-[var(--app-credit-color)]'
                        : 'bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] hover:opacity-90'
                    }`}
                  >
                    {copiedId === previewTemplate._id ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy to Library
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="hover:bg-[var(--app-pages-border)]/20 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--app-pages-border)] text-[var(--app-pages-subhead-text)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* iframe */}
              <div className="bg-[var(--app-pages-border)]/10 flex-1 overflow-auto p-3 sm:p-4">
                <div className="mx-auto overflow-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm">
                  <iframe
                    srcDoc={previewTemplate.html}
                    title="Preview"
                    className="h-[50vh] w-full sm:h-[60vh]"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      {showBillingModal && (
        <BillingDetailsModal
          isOpen={showBillingModal}
          onClose={() => {
            setShowBillingModal(false)
            setPendingPayment(null)
          }}
          onSuccess={() => {
            setShowBillingModal(false)
            if (pendingPayment) {
              proceedDynamicPayU(pendingPayment.amount, pendingPayment.credits)
              setPendingPayment(null)
            }
          }}
          user={reduxUser}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Admin Generation Options
// ─────────────────────────────────────────────────────
function AdminGenOptions({ saveAs, setSaveAs, dataType, setDataType }) {
  return (
    <div className="bg-[var(--app-pages-border)]/10 space-y-4 rounded-xl border border-[var(--app-pages-border)] p-4">
      {/* Label */}
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-pages-subhead-text)]">
        <Wand2 className="h-3 w-3" /> Admin Options
      </p>

      {/* Storage */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--app-pages-text)]">
          <FolderOpen className="h-3.5 w-3.5 text-[var(--app-pages-subhead-text)]" />
          Where to store this template
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSaveAs('ai_template')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              saveAs === 'ai_template'
                ? 'ring-[var(--app-brand-primary)]/40 border-transparent bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] ring-1'
                : 'hover:border-[var(--app-brand-primary)]/40 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Gallery
          </button>
          <button
            type="button"
            onClick={() => setSaveAs('user_template')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              saveAs === 'user_template'
                ? 'ring-[var(--app-brand-primary)]/40 border-transparent bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] ring-1'
                : 'hover:border-[var(--app-brand-primary)]/40 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" /> My Templates
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[var(--app-pages-subhead-text)]">
          {saveAs === 'ai_template'
            ? 'Saved to the global AI Gallery — visible to all users.'
            : 'Saved to your personal template library.'}
        </p>
      </div>

      {/* Data type */}
      <div>
        <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--app-pages-text)]">
          <Database className="h-3.5 w-3.5 text-[var(--app-pages-subhead-text)]" />
          Data to personalize with
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDataType('dummy')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              dataType === 'dummy'
                ? 'ring-[var(--app-brand-primary)]/40 border-transparent bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] ring-1'
                : 'hover:border-[var(--app-brand-primary)]/40 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Dummy Data
          </button>
          <button
            type="button"
            onClick={() => setDataType('analysis')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
              dataType === 'analysis'
                ? 'ring-[var(--app-brand-primary)]/40 border-transparent bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] ring-1'
                : 'hover:border-[var(--app-brand-primary)]/40 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)]'
            }`}
          >
            <Database className="h-3.5 w-3.5" /> Business Analysis
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-[var(--app-pages-subhead-text)]">
          {dataType === 'dummy'
            ? 'Uses placeholder content — ideal for generic gallery templates.'
            : 'Uses your real business profile data for personalized templates.'}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Template Card
// ─────────────────────────────────────────────────────
export function TemplateCard({
  template,
  copiedId,
  isUsing,
  onUse,
  onPreview,
  formatDate,
  isFeatured,
  mode = 'ai',
  onEdit,
  onDelete,
  isAlreadyInLibrary,
}) {
  const isCopied = copiedId === template._id
  const categoryColor =
    CATEGORY_COLORS[template.category] || CATEGORY_COLORS.General

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isFeatured
          ? 'border-[var(--app-brand-primary)]/30 bg-[var(--app-pages-bg)]'
          : 'hover:border-[var(--app-brand-primary)]/30 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]'
      }`}
    >
      {/* ── Thumbnail ── */}
      <div
        className="bg-[var(--app-pages-border)]/10 relative flex aspect-[16/9] w-full cursor-pointer items-center justify-center overflow-hidden"
        onClick={() => onPreview(template)}
      >
        {template.thumbnailUrl ? (
          <img
            src={template.thumbnailUrl}
            alt={template.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : template.html ? (
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 z-[5]" />
            <iframe
              srcDoc={template.html}
              title={template.name}
              className="pointer-events-none absolute left-0 top-0 border-0"
              style={{
                width: '400%',
                height: '400%',
                transform: 'scale(0.25)',
                transformOrigin: 'top left',
              }}
              sandbox="allow-same-origin"
              tabIndex="-1"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-30">
            <Mail className="h-7 w-7 text-[var(--app-pages-text)]" />
            <span className="text-[10px] font-medium text-[var(--app-pages-text)]">
              Click to preview
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="bg-[var(--app-pages-bg)]/60 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm">
            <Eye className="h-4 w-4 text-[var(--app-brand-primary)]" />
          </div>
        </div>

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[var(--app-brand-primary)] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            <Star className="h-3 w-3" /> Featured
          </div>
        )}

        {/* AI badge */}
        {template?.isAIGenerated && !isFeatured && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--app-brand-primary)] shadow-sm backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-[var(--app-brand-primary)]" />
            {template?.sourceAITemplate ? 'AI · From Template' : 'AI Generated'}
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Tags */}
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <span
            className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryColor}`}
          >
            {template.category}
          </span>
          {template.prompt && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-pages-subhead-text)]">
              <Sparkles className="h-2.5 w-2.5 text-[var(--app-brand-primary)]" />{' '}
              AI
            </span>
          )}
          {template.tags?.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex shrink-0 rounded-full border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--app-pages-subhead-text)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h4 className="mb-1 line-clamp-1 text-sm font-semibold leading-snug text-[var(--app-pages-text)] transition-colors group-hover:text-[var(--app-brand-primary)]">
          {template.name}
        </h4>

        {/* Description */}
        {template.description && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[var(--app-pages-subhead-text)]">
            {template.description}
          </p>
        )}

        {/* ── Footer ── */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--app-pages-border)] pt-2.5">
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--app-pages-subhead-text)]">
            <Clock className="h-3 w-3" />
            {formatDate(template.createdAt)}
          </span>

          {mode === 'ai' ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUse && onUse(template._id)
              }}
              disabled={isUsing || isCopied || isAlreadyInLibrary}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 disabled:opacity-60 ${
                isAlreadyInLibrary
                  ? 'cursor-not-allowed border-[var(--app-pages-border)] text-[var(--app-pages-subhead-text)]'
                  : isCopied
                    ? 'border-[var(--app-credit-color)]/30 bg-[var(--app-credit-color)]/10 text-[var(--app-credit-color)]'
                    : 'bg-[var(--app-profile-btn-bg)] text-[var(--app-profile-btn-text)] transition-all hover:opacity-90'
              }`}
            >
              {isAlreadyInLibrary ? (
                <>
                  <Check className="h-3.5 w-3.5" /> In Library
                </>
              ) : isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Use
                </>
              )}
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit && onEdit(template)
                }}
                className="hover:border-[var(--app-credit-color)]/40 flex items-center gap-1 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-credit-color)] transition-all"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete && onDelete(template)
                }}
                className="hover:border-[var(--app-debit-color)]/40 flex items-center gap-1 rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-debit-color)] transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
