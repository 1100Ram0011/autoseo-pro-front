import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  useDeleteEmailTemplateMutation,
  useGetEmailTemplatesQuery,
} from '../../../redux/apis/emailTemplateApi'

import TemplateTable from './components/TemplateTable'
import TemplateDrawer from './components/TemplateDrawer'
import TemplateSkeleton from './components/TemplateSkeleton'
import TemplateFilters from './components/TemplateFilters'
import AIGeneratedEmailTemplates from './components/AIGeneratedEmailTemplates'
import { Plus, Sparkles, Wand2, X, Pencil } from 'lucide-react'
import { useSelector } from 'react-redux'
import DemoAnimatedAuthModal from '@/ReUseAbleComponents/DemoAnimatedAuthModal'
import AuthPage from '@/pages/user/AuthPage'
import { useTheme } from '@/components/global/theme-provider'

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeTab, setActiveTab] = useState('my_templates')
  const reduxUser = useSelector((state) => state.auth?.user)
  const { isDark } = useTheme()
  const accentGradientClasses = isDark
    ? 'from-[#FB6218] to-[#FEBC02]'
    : 'from-sky-400 to-blue-600'

  const {
    data: templates,
    isLoading,
    isError,
    refetch,
  } = useGetEmailTemplatesQuery()

  const [deleteTemplate] = useDeleteEmailTemplateMutation()

  const handleDeleteTemplate = async (template) => {
    try {
      await deleteTemplate(template._id).unwrap()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const handleOpenCreateModel = () => {
    setSelectedTemplate(true)
  }

  const handleOnRefresh = () => {
    if (reduxUser?.isGuest) {
      setShowAuthModal(true)
      return
    }
    refetch()
  }

  /**
   * Called from AIGeneratedEmailTemplates when user clicks
   * "Edit" or "Preview" on a template that was already copied.
   * Opens the TemplateDrawer with that template's data.
   */
  const handleEditFromAI = (templateData) => {
    setSelectedTemplate(templateData)
  }

  const [isShowGenerateActivate, setisShowGenerateActivate] = useState(false)

  const handleOnClickOpenAiGenerated = () => {
    if (reduxUser?.isGuest) {
      setShowAuthModal(true)
      return
    }
    setisShowGenerateActivate(true)
  }

  const handleCloseGenerateActivate = () => {
    setisShowGenerateActivate(false)
  }

  return (
    <>
      <div className="min-h-full sm:p-2 lg:p-4">
        {/* ── TABS CONTAINER ── */}
        <div className="mb-6 w-full">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* ── TAB SWITCHER ── */}
            {/* <div
              role="tablist"
              className="flex w-full sm:w-fit items-center gap-1 rounded-xl bg-gray-200/60 p-1 dark:bg-gray-800/60"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'my_templates'}
                onClick={() => setActiveTab('my_templates')}
                className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all
          ${activeTab === 'my_templates'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-[#0f172a] dark:text-white dark:border dark:border-gray-800'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                My Templates
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'ai_templates'}
                onClick={() => setActiveTab('ai_templates')}
                className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-all
          ${activeTab === 'ai_templates'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-[#0f172a] dark:text-white dark:border dark:border-gray-800'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
              >
                <div className='flex items-center justify-center gap-1.5'>
                  AI Generated <Sparkles size={16} className='animate-pulse text-amber-500 dark:text-amber-400' />
                </div>
              </button>
            </div> */}

            {/* ── ACTIONS (ONLY FOR MY TEMPLATES) ── */}
            {activeTab === 'my_templates' && (
              <div className="w-full flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                {/* LEFT: FILTERS */}
                <div className="w-full sm:w-auto ml-1">
                  <TemplateFilters onRefresh={handleOnRefresh} />
                </div>

                <div className="mt-2 flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto justify-center">
                  {/* RIGHT: ACTION BUTTONS */}

                  {/* GENERATE BUTTON */}
                  <button
                    onClick={() => handleOnClickOpenAiGenerated()}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90 active:scale-[0.97]"
                  >
                    <Wand2 className="h-4 w-6" />
                    Generate
                  </button>

                  {/* CREATE TEMPLATE BUTTON */}
                  <button
                    onClick={handleOpenCreateModel}
                    className={`inline-flex items-center gap-2 rounded-lg
          px-4 py-2 text-sm font-medium text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all duration-150
          hover:opacity-90 active:scale-[0.97]`}
                  >
                    {/* <Plus className="h-4 w-6" /> */}
                    Create Template
                  </button>

                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── MY TEMPLATES TAB ── */}
        {activeTab === 'my_templates' && (
          <>
            {isLoading ? (
              <TemplateSkeleton />
            ) : isError ? (
              <div className="rounded-lg border border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] text-[var(--app-debit-color)] p-3 text-sm sm:p-4">
                Failed to load templates.{' '}
                <button
                  onClick={refetch}
                  className="ml-1 font-medium underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="w-full h-fit max-h-[calc(90vh-180px)] overflow-auto rounded-lg">
                <TemplateTable
                  templates={templates || []}
                  onEdit={setSelectedTemplate}
                  onPreview={setPreviewTemplate}
                  onDelete={handleDeleteTemplate}
                />
              </div>
            )}
          </>
        )}

        {/* ── AI TEMPLATES TAB & MODAL ── */}
        {(activeTab === 'ai_templates' || isShowGenerateActivate) && (
          <AIGeneratedEmailTemplates
            from="customizedTemplates"
            onEditTemplate={handleEditFromAI}
            isShowGenerateActivate={isShowGenerateActivate}
            handleCloseGenerateActivate={handleCloseGenerateActivate}
            isModalOnly={activeTab !== 'ai_templates'}
          />
        )}

        {/* ── DRAWER ── */}
        {selectedTemplate && (
          <TemplateDrawer
            template={selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
          />
        )}

        {/* ── PREVIEW MODAL ── */}
        {previewTemplate && createPortal(
          <div className="fixed inset-0 z-[1200] flex items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] shadow-2xl  max-h-[95dvh]">

              {/* Header */}
              <div className="flex flex-col gap-2 border-b border-[var(--app-pages-border)] px-4 py-3  sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-[var(--app-pages-text)] sm:text-lg">
                    {previewTemplate.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-[var(--app-pages-subhead-text)]">Subject: {previewTemplate.subject}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTemplate(previewTemplate)
                      setPreviewTemplate(null)
                    }}
                    className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--app-debit-color)] border border-[var(--app-debit-color)] bg-[var(--app-debit-bg)] transition-all hover:brightness-110"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit Template</span>
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Preview iframe */}
              <div className="flex-1 overflow-auto bg-[var(--app-pages-bg)] p-2 dark:bg-[var(--app-pages-bg)] sm:p-4">
                <div className="mx-auto rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] shadow-sm ">
                  <iframe
                    srcDoc={previewTemplate.html}
                    title="Preview"
                    className="h-[50vh] w-full rounded-lg sm:h-[60vh]"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {
        showAuthModal && (
          <DemoAnimatedAuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          >
            <AuthPage onSuccess={() => setShowAuthModal(false)} />
          </DemoAnimatedAuthModal>
        )
      }

    </>
  )
}
