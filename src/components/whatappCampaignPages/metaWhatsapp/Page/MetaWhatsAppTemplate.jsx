import { useState, useCallback, useMemo, useEffect } from 'react'
import { useOutletContext, useLocation, useNavigate } from '@/components/react-router-dom'

import CreateTemplateModal from '../Component/MetaTemplates/CreateTemplateModal.jsx'
import CreateTemplateJsonModal from '../Component/MetaTemplates/CreateTemplateJsonModal.jsx'
import TemplateTable from '../Component/MetaTemplates/TemplateTable'
import TemplateToolbar from '../Component/MetaTemplates/TemplateToolbar'
import ViewTemplateModal from '../Component/MetaTemplates/ViewTemplateModal'

import {
  useGetTemplatesQuery,
  useSyncTemplateMutation,
  useDeleteTemplateMutation,
} from '../../../../../redux/apis/metaWhatsapp.api'

// ── Reusable Components ──
import ConfirmDialog from '../Component/ConfirmDialog'
import InfoBanner from '../Component/InfoBanner'
import PageHeader from '../Component/PageHeader'

// ─── Status normaliser ────────────────────────────────────────────────────────
const normaliseStatus = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'Enabled'
    case 'DISABLED':
    case 'REJECTED':
    case 'PAUSED':
      return 'Disabled'
    case 'PENDING':
    case 'SUBMITTED':
    case 'DRAFT':
    default:
      return 'Pending'
  }
}

const normaliseTemplates = (templates = []) =>
  templates.map((t) => ({
    ...t,
    id: t._id,
    status: normaliseStatus(t.status),
    clicks: t.clicks || 0,
  }))

// ─── MetaWhatsAppTemplate ─────────────────────────────────────────────────────
const MetaWhatsAppTemplate = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    selectedNumber,
    whatsappNumbers = [],
    setSelectedNumber,
  } = useOutletContext()

  const [modalOpen, setModalOpen] = useState(false)
  const [jsonModalOpen, setJsonModalOpen] = useState(false)
  const [editingTemplate, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [errorBanner, setErrorBanner] = useState('')
  const [viewingTemplate, setViewingTemplate] = useState(null)

  const numberId = selectedNumber?._id || null
  const numberVal = selectedNumber?._id || ''

  useEffect(() => {
    if (location.state?.importTemplate) {
      const libTpl = location.state.importTemplate

      // Map library template schema structure to our form's schema parameters
      const initialFormState = {
        name: libTpl.title
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .substring(0, 30),
        category: libTpl.category,
        marketingType: 'CUSTOM',
        utilityType: 'CUSTOM',
        language: libTpl.language || 'en_US',
        body: libTpl.body,
        footer: libTpl.footer || '',
        header: {
          format: libTpl.header?.format || 'NONE',
          text: libTpl.header?.text || '',
          mediaUrl: libTpl.header?.mediaUrl || '',
        },
        buttons: (libTpl.buttons || []).map((b, idx) => ({
          type: b.type,
          text: b.text,
          url: b.url || '',
          phoneNumber: b.phoneNumber || '',
        })),
        bodySamples: libTpl.bodySamples || libTpl.sampleVariables?.bodySamples || [],
        headerSamples: libTpl.headerSamples || libTpl.sampleVariables?.headerSamples || [],
      }

      setEditing(initialFormState)
      setJsonModalOpen(true)

      // Clear route state to prevent repeating the dialog
      navigate('.', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  const { data, isLoading, isFetching, refetch } = useGetTemplatesQuery(
    { numberId, search: search || undefined },
    { skip: !numberId }
  )

  const [syncTemplate, { isLoading: syncing }] = useSyncTemplateMutation()
  const [deleteTemplate] = useDeleteTemplateMutation()

  const templates = useMemo(() => normaliseTemplates(data?.data || []), [data])

  const requireNumber = useCallback(() => {
    if (!numberId) {
      setErrorBanner('Please select a WhatsApp number first.')
      return false
    }
    setErrorBanner('')
    return true
  }, [numberId])

  const handleOpenCreate = useCallback(() => {
    if (!requireNumber()) return
    setEditing(null)
    setModalOpen(true)
  }, [requireNumber])

  const handleOpenCreateJson = useCallback(() => {
    if (!requireNumber()) return
    setEditing(null)
    setJsonModalOpen(true)
  }, [requireNumber])

  const handleEdit = useCallback((template) => {
    setEditing(template)
    setJsonModalOpen(true)
  }, [])

  const handleView = useCallback((template) => {
    setViewingTemplate(template)
  }, [])

  const handleDuplicate = useCallback((template) => {
    setEditing({ ...template, _id: undefined, name: `${template.name}_copy` })
    setJsonModalOpen(true)
  }, [])

  const handleDeleteRequest = useCallback((template) => {
    setConfirmDelete(template)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDelete) return
    try {
      await deleteTemplate(confirmDelete._id).unwrap()
      refetch()
    } catch (err) {
      setErrorBanner(err?.data?.message || 'Failed to delete template.')
    } finally {
      setConfirmDelete(null)
    }
  }, [confirmDelete, deleteTemplate, refetch])

  const handleSync = useCallback(async () => {
    if (!requireNumber()) return
    try {
      await syncTemplate(numberId).unwrap()
      refetch()
    } catch (err) {
      setErrorBanner(err?.data?.message || 'Sync failed. Please try again.')
    }
  }, [numberId, requireNumber, syncTemplate, refetch])

  const handleSaved = useCallback(() => refetch(), [refetch])

  const handleModalClose = useCallback(() => {
    setModalOpen(false)
    setJsonModalOpen(false)
    setEditing(null)
  }, [])

  const handleViewModalClose = useCallback(() => {
    setViewingTemplate(null)
  }, [])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0c0e14] dark:text-slate-200">
      {/* ── Top Section (Header) ── */}
      <div className="shrink-0 px-6 pb-2 pt-5">
        <PageHeader
          title="WhatsApp Templates"
          subtitle="Manage and sync your WhatsApp message templates"
          titleTag="h4"
        />

        {/* Error banner */}
        {errorBanner && (
          <div className="duration-300 animate-in fade-in slide-in-from-top-2">
            <InfoBanner
              type="template-error"
              message={errorBanner}
              onDismiss={() => setErrorBanner('')}
              className="mb-2 mt-2"
            />
          </div>
        )}
      </div>

      {/* ── Table Panel ── */}
      <div className="ml-4 mr-4 mb-6 mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm delay-100 duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both dark:border-white/[0.07] dark:bg-[#10121a]">
        <TemplateToolbar
          search={search}
          onSearchChange={setSearch}
          numbers={whatsappNumbers?.data}
          selectedNumber={numberVal}
          onNumberChange={(val) => {
            const number = whatsappNumbers?.data?.find((n) => n._id === val)
            setSelectedNumber(number)
          }}
          onSync={handleSync}
          syncing={syncing || isFetching}
          onCreate={handleOpenCreate}
          onCreateJson={handleOpenCreateJson}
          onOpenLibrary={() => navigate('/whatsapp/template-library')}
        />

        {/* Table */}
        <TemplateTable
          templates={templates}
          loading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onDuplicate={handleDuplicate}
          onViewTemplate={handleView}
          onCreateClick={handleOpenCreateJson}
        />
      </div>

      {/* Original Template Modal */}
      <CreateTemplateModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaved}
        initialData={editingTemplate}
        numberId={numberId}
      />

      {/* JSON Schema Driven WhatsApp Template Modal */}
      <CreateTemplateJsonModal
        open={jsonModalOpen}
        onClose={handleModalClose}
        onSave={handleSaved}
        initialData={editingTemplate}
        numberId={numberId}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        message={`Delete template "${confirmDelete?.name}"? This cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      <ViewTemplateModal
        open={Boolean(viewingTemplate)}
        onClose={handleViewModalClose}
        template={viewingTemplate}
      />
    </div>
  )
}

export default MetaWhatsAppTemplate
