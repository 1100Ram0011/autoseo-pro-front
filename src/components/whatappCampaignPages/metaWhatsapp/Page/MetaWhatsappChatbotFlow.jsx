import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  Eye,
  MessageSquare,
  Layers,
  Smartphone,
  List,
  GitFork,
  ArrowLeft,
  Copy,
} from 'lucide-react'
import {
  useGetChatbotFlowsQuery,
  useCreateChatbotFlowMutation,
  useUpdateChatbotFlowMutation,
  useDeleteChatbotFlowMutation,
  useGetInteractiveMessagesQuery,
  useGetTemplatesQuery,
  useGetWhatsappNumberQuery,
  useGetChatbotFlowsListQuery,
  useCreateChatbotFlowListMutation,
  useUpdateChatbotFlowListMutation,
  useDeleteChatbotFlowListMutation,
  useDuplicateChatbotFlowListMutation,
} from '../../../../../redux/apis/metaWhatsapp.api'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedNumber as setSelectedNumberAction } from '../../../../../redux/app/whatsappSelectionSlice'
import MetaInteractiveBuilder from './MetaInteractiveBuilder'
import MetaWhatsappFlowCanvas from './MetaWhatsappFlowCanvas'

export default function MetaWhatsappChatbotFlow(props) {
  const dispatch = useDispatch()
  const selectedNumber = useSelector((state) => state.whatsappSelection?.selectedNumber)
  const setSelectedNumber = (number) => dispatch(setSelectedNumberAction(number))
  const [activeTab, setActiveTab] = useState('rules')
  const [rulesViewMode, setRulesViewMode] = useState('list')

  // Flow Management states
  const [currentFlow, setCurrentFlow] = useState(null)
  const [isOpenFlowModal, setIsOpenFlowModal] = useState(false)
  const [editingFlowItem, setEditingFlowItem] = useState(null)
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')

  // Unsaved changes & Discard Flow Modal states
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [isSavingFromModal, setIsSavingFromModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const saveCanvasRef = useRef(null)

  const handleBackToFlows = () => {
    if (hasUnsavedChanges) {
      setPendingAction('back')
      setShowDiscardModal(true)
    } else {
      setCurrentFlow(null)
    }
  }

  const handleConfirmDiscard = () => {
    setHasUnsavedChanges(false)
    setShowDiscardModal(false)
    if (pendingAction === 'back') {
      setCurrentFlow(null)
    } else if (pendingAction?.type === 'switchNumber') {
      setSelectedNumber(pendingAction.number)
      setCurrentFlow(null)
    } else {
      setCurrentFlow(null)
    }
    setPendingAction(null)
  }

  const handleConfirmSaveFromModal = async () => {
    if (saveCanvasRef.current) {
      setIsSavingFromModal(true)
      try {
        const res = await saveCanvasRef.current()
        if (res !== false) {
          setHasUnsavedChanges(false)
          setShowDiscardModal(false)
          if (pendingAction === 'back') {
            setCurrentFlow(null)
          } else if (pendingAction?.type === 'switchNumber') {
            setSelectedNumber(pendingAction.number)
            setCurrentFlow(null)
          } else {
            setCurrentFlow(null)
          }
          setPendingAction(null)
        }
      } catch (err) {
        console.error('Error saving flow from modal:', err)
      } finally {
        setIsSavingFromModal(false)
      }
    } else {
      setHasUnsavedChanges(false)
      setShowDiscardModal(false)
      setCurrentFlow(null)
      setPendingAction(null)
    }
  }

  const { data: whatsappNumbers, isLoading: numbersLoading } =
    useGetWhatsappNumberQuery()

  useEffect(() => {
    if (
      whatsappNumbers?.data &&
      whatsappNumbers.data.length > 0 &&
      !selectedNumber
    ) {
      dispatch(setSelectedNumberAction(whatsappNumbers.data[0]))
    }
  }, [whatsappNumbers, selectedNumber, dispatch])

  const numberId = selectedNumber?.phoneNumberId || null
  const numberVal = selectedNumber?._id || ''

  // Queries & Mutations
  const {
    data: flowListsData,
    isLoading: flowListsLoading,
    isFetching: flowListsFetching,
    refetch: refetchFlowLists,
  } = useGetChatbotFlowsListQuery(numberId, { skip: !numberId })

  const {
    data: flowsData,
    isLoading: flowsLoading,
    isFetching: flowsFetching,
    refetch: refetchFlows,
  } = useGetChatbotFlowsQuery(
    { phoneNumberId: numberId, flowId: currentFlow?._id },
    { skip: !numberId || !currentFlow?._id }
  )

  const { data: interactiveData } = useGetInteractiveMessagesQuery(numberId, {
    skip: !numberId,
  })

  const { data: metaTemplatesData } = useGetTemplatesQuery(
    { numberId: numberVal || numberId },
    { skip: !numberVal && !numberId }
  )

  const [createFlow, { isLoading: isCreating }] = useCreateChatbotFlowMutation()
  const [updateFlow, { isLoading: isUpdating }] = useUpdateChatbotFlowMutation()
  const [deleteFlow] = useDeleteChatbotFlowMutation()

  const [createFlowList] = useCreateChatbotFlowListMutation()
  const [updateFlowList] = useUpdateChatbotFlowListMutation()
  const [deleteFlowList] = useDeleteChatbotFlowListMutation()
  const [duplicateFlowList] = useDuplicateChatbotFlowListMutation()

  // Sync currentFlow state when the layout/flow list gets updated from DB refetches
  useEffect(() => {
    if (currentFlow && flowListsData?.data) {
      const updated = flowListsData.data.find((f) => f._id === currentFlow._id)
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentFlow)) {
        setCurrentFlow(updated)
      }
    }
  }, [flowListsData, currentFlow])

  // Form & Modal state
  const [isOpen, setIsOpen] = useState(false)
  const [editingFlow, setEditingFlow] = useState(null)

  const [triggerType, setTriggerType] = useState('keyword')
  const [triggerValue, setTriggerValue] = useState('')
  const [replyType, setReplyType] = useState('text')
  const [replyText, setReplyText] = useState('')
  const [replyInteractiveId, setReplyInteractiveId] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Simulator state
  const [simulatorMessages, setSimulatorMessages] = useState([])

  // Populate simulator messages when a rule is hovered or selected
  const previewRule = (rule) => {
    const userMsg = {
      id: 1,
      sender: 'user',
      text:
        rule.triggerType === 'keyword'
          ? rule.triggerValue
          : `Click: ${rule.triggerValue}`,
    }

    let botMsg = { id: 2, sender: 'bot' }
    if (rule.replyType === 'interactive' && rule.replyInteractiveId) {
      const item = rule.replyInteractiveId
      botMsg.isInteractive = true
      botMsg.interactive = item
    } else {
      botMsg.text = rule.replyText || '(No reply text set)'
    }

    setSimulatorMessages([userMsg, botMsg])
  }

  // Reset form
  const resetForm = () => {
    setEditingFlow(null)
    setTriggerType('keyword')
    setTriggerValue('')
    setReplyType('text')
    setReplyText('')
    setReplyInteractiveId('')
    setIsActive(true)
  }

  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [duplicateFlowToCopy, setDuplicateFlowToCopy] = useState(null)
  const [targetPhoneNumberId, setTargetPhoneNumberId] = useState('')

  // Handle Open Create/Edit modal
  const handleOpenModal = (flow = null) => {
    if (!numberId) {
      toast.error('Please select a WhatsApp number first.')
      return
    }
    if (flow) {
      setEditingFlow(flow)
      setTriggerType(flow.triggerType)
      setTriggerValue(flow.triggerValue)
      setReplyType(flow.replyType)
      setReplyText(flow.replyText || '')
      setReplyInteractiveId(flow.replyInteractiveId?._id || '')
      setIsActive(flow.isActive)
    } else {
      resetForm()
    }
    setIsOpen(true)
  }

  const handleCreateRuleForPayload = (payload) => {
    if (!numberId) {
      toast.error('Please select a WhatsApp number first.')
      return
    }
    setEditingFlow(null)
    setTriggerType('button_payload')
    setTriggerValue(payload)
    setReplyType('text')
    setReplyText('')
    setReplyInteractiveId('')
    setIsActive(true)
    setIsOpen(true)
  }

  // Save Flow
  const handleSaveFlow = async (e) => {
    e.preventDefault()
    if (!triggerValue.trim()) {
      toast.error('Trigger value is required')
      return
    }
    if (replyType === 'text' && !replyText.trim()) {
      toast.error('Reply text is required for text response')
      return
    }
    if (replyType === 'interactive' && !replyInteractiveId) {
      toast.error('Please select an Interactive Message template')
      return
    }

    const payload = {
      phoneNumberId: numberId,
      flowId: currentFlow?._id || null,
      triggerType,
      triggerValue: triggerValue.trim(),
      replyType,
      replyText: replyType === 'text' ? replyText : '',
      replyInteractiveId:
        replyType === 'interactive' ? replyInteractiveId : null,
      isActive,
    }

    try {
      if (editingFlow) {
        await updateFlow({
          phoneNumberId: numberId,
          id: editingFlow._id,
          ...payload,
        }).unwrap()
        toast.success('Chatbot rule updated successfully.')
      } else {
        await createFlow(payload).unwrap()
        toast.success('Chatbot rule created successfully.')
      }
      setIsOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save chatbot rule.')
    }
  }

  // Delete Flow
  const handleDeleteFlow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chatbot rule?'))
      return
    try {
      await deleteFlow({ phoneNumberId: numberId, id }).unwrap()
      toast.success('Chatbot rule deleted successfully.')
      setSimulatorMessages([])
    } catch (err) {
      if (err?.status === 404) {
        // If it is already deleted or not found, treat it as successful
        toast.success('Chatbot rule deleted successfully.')
        setSimulatorMessages([])
      } else {
        toast.error('Failed to delete chatbot rule.')
      }
    }
  }

  // Toggle active status
  const handleToggleActive = async (flow) => {
    try {
      await updateFlow({
        phoneNumberId: numberId,
        id: flow._id,
        isActive: !flow.isActive,
      }).unwrap()
      toast.success(`Chatbot rule ${!flow.isActive ? 'activated' : 'paused'}.`)
    } catch (err) {
      toast.error('Failed to update status.')
    }
  }

  // Flow management actions
  const handleOpenFlowModal = (flow = null) => {
    if (flow) {
      setEditingFlowItem(flow)
      setFlowName(flow.name)
      setFlowDescription(flow.description || '')
    } else {
      setEditingFlowItem(null)
      setFlowName('')
      setFlowDescription('')
    }
    setIsOpenFlowModal(true)
  }

  const handleSaveFlowItem = async (e) => {
    e.preventDefault()
    if (!flowName.trim()) {
      toast.error('Flow name is required')
      return
    }

    try {
      if (editingFlowItem) {
        await updateFlowList({
          phoneNumberId: numberId,
          id: editingFlowItem._id,
          name: flowName.trim(),
          description: flowDescription.trim(),
        }).unwrap()
        toast.success('Flow updated successfully')
      } else {
        await createFlowList({
          phoneNumberId: numberId,
          name: flowName.trim(),
          description: flowDescription.trim(),
        }).unwrap()
        toast.success('Flow created successfully')
      }
      setIsOpenFlowModal(false)
      setFlowName('')
      setFlowDescription('')
      setEditingFlowItem(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save flow')
    }
  }

  const handleDeleteFlowItem = async (flow) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the flow "${flow.name}"? This will delete all of its rules.`
      )
    )
      return
    try {
      await deleteFlowList({ phoneNumberId: numberId, id: flow._id }).unwrap()
      toast.success('Flow deleted successfully')
      if (currentFlow?._id === flow._id) {
        setCurrentFlow(null)
      }
    } catch (err) {
      toast.error('Failed to delete flow')
    }
  }

  const handleToggleFlowActive = async (flow) => {
    try {
      await updateFlowList({
        phoneNumberId: numberId,
        id: flow._id,
        isActive: !flow.isActive,
      }).unwrap()
      toast.success(
        `Flow ${!flow.isActive ? 'enabled' : 'disabled'} successfully`
      )
    } catch (err) {
      toast.error('Failed to toggle flow status')
    }
  }

  const handleDuplicateFlowItem = (flow) => {
    setDuplicateFlowToCopy(flow)
    setTargetPhoneNumberId(numberId) // Default to current number ID
    setDuplicateModalOpen(true)
  }

  const handleConfirmDuplicate = async () => {
    if (!duplicateFlowToCopy) return
    const toastId = toast.loading('Duplicating flow...')
    try {
      await duplicateFlowList({
        phoneNumberId: numberId,
        id: duplicateFlowToCopy._id,
        targetPhoneNumberId,
      }).unwrap()
      toast.success('Flow duplicated successfully', { id: toastId })
      setDuplicateModalOpen(false)
      setDuplicateFlowToCopy(null)
    } catch (err) {
      toast.error('Failed to duplicate flow', { id: toastId })
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] min-h-0 flex-col space-y-6 bg-slate-50 dark:bg-background p-6 text-slate-900 dark:text-slate-100">
      {/* Header Toolbar */}
      <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-slate-200 dark:border-border pb-5 md:flex-row md:items-center">
        {currentFlow ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToFlows}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-slate-300 dark:border-border bg-white dark:bg-card px-3 text-sm font-semibold text-slate-700 dark:text-muted-foreground transition-all hover:bg-slate-100 dark:hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Flows
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-foreground">
                  {currentFlow.name}
                </h1>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${currentFlow.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted-foreground/15 text-muted-foreground'}`}
                >
                  {currentFlow.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">
                {currentFlow.description ||
                  'Manage chatbot rules for this flow.'}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
              <Bot className="h-6 w-6 text-[#25d366]" />
              WhatsApp Flows Manager
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">
              Isolate, create, and manage chatbot conversation flows for your
              connected numbers.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={numberVal}
            onChange={(e) => {
              const num = whatsappNumbers?.data?.find(
                (n) => n._id === e.target.value
              )
              if (hasUnsavedChanges) {
                setPendingAction({ type: 'switchNumber', number: num })
                setShowDiscardModal(true)
              } else {
                setSelectedNumber(num)
                setCurrentFlow(null)
              }
            }}
            disabled={
              !whatsappNumbers?.data || whatsappNumbers?.data?.length === 0
            }
            className="h-10 rounded-lg border border-slate-300 dark:border-input bg-white dark:bg-card px-3 py-1.5 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#25d366] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {!whatsappNumbers?.data
                ? 'Loading Numbers...'
                : whatsappNumbers?.data?.length === 0
                  ? 'No Meta Numbers Connected'
                  : 'Select Phone Number'}
            </option>
            {whatsappNumbers?.data?.map((n) => (
              <option key={n._id} value={n._id}>
                {n.displayName} ({n.phoneNumber})
              </option>
            ))}
          </select>

          {activeTab === 'rules' &&
            (currentFlow ? (
              <>
                <button
                  onClick={refetchFlows}
                  disabled={!numberId || flowsLoading || flowsFetching}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  title="Reload rules"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${flowsFetching ? 'animate-spin' : ''}`}
                  />
                </button>

                <button
                  onClick={() => handleOpenModal()}
                  disabled={!numberId}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#25d366] to-[#0e7a52] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:brightness-110 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Create Rule
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={refetchFlowLists}
                  disabled={!numberId || flowListsLoading || flowListsFetching}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  title="Reload flows"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${flowListsFetching ? 'animate-spin' : ''}`}
                  />
                </button>

                <button
                  onClick={() => handleOpenFlowModal()}
                  disabled={!numberId}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#25d366] to-[#0e7a52] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:brightness-110 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Create Flow
                </button>
              </>
            ))}
        </div>
      </div>

      {/* Tab Navigation - Only shown on main flows/templates list */}
      {!currentFlow && (
        <div className="flex shrink-0 items-center justify-between border-b border-border">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('rules')
                setCurrentFlow(null)
              }}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'border-[#25d366] text-[#25d366]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bot className="h-4 w-4" />
              Your Flows
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'templates'
                  ? 'border-[#25d366] text-[#25d366]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Layers className="h-4 w-4" />
              Interactive Templates
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rules' ? (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Error state if no number selected */}
          {!numberId && (
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-600 dark:text-yellow-400 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  {whatsappNumbers?.data?.length === 0
                    ? 'You need to connect a Meta WhatsApp Business account before configuring flows.'
                    : 'Please select a connected WhatsApp Business number from the dropdown to manage chatbot rules.'}
                </span>
              </div>
            </div>
          )}

          {numberId &&
            (!currentFlow ? (
              /* RENDERING FLOWS LIST TABLE */
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="bg-muted/20 flex shrink-0 items-center justify-between border-b border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Available Flows
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Total: {flowListsData?.data?.length || 0} Flow(s)
                  </span>
                </div>
                <div className="flex-1 overflow-auto">
                  {flowListsLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-2 p-12 text-muted-foreground">
                      <RefreshCw className="h-8 w-8 animate-spin text-[#25d366]" />
                      <p className="text-sm">Fetching flows list...</p>
                    </div>
                  ) : !flowListsData?.data ||
                    flowListsData.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-4 p-16 text-center text-muted-foreground">
                      <Bot className="text-muted-foreground/45 h-16 w-16" />
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          No chatbot flows configured
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                          Create a flow to bundle chatbot rules (keywords,
                          buttons, and APIs) for this number.
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenFlowModal()}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25d366] px-5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#25d366]/90"
                      >
                        <Plus className="h-4 w-4" />
                        Create Your First Flow
                      </button>
                    </div>
                  ) : (
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-4">Flow Name</th>
                          <th className="px-6 py-4">Description</th>
                          <th className="px-6 py-4">Created By</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {flowListsData.data.map((flow) => (
                          <tr
                            key={flow._id}
                            className="hover:bg-muted/30 group transition-colors"
                          >
                            <td className="px-6 py-4 font-bold text-foreground">
                              <button
                                onClick={() => handleOpenFlowModal(flow)}
                                className="text-left font-bold text-foreground transition-all hover:text-[#25d366] hover:underline"
                                title="Edit Flow Name & Description"
                              >
                                {flow.name}
                              </button>
                            </td>
                            <td className="max-w-xs truncate px-6 py-4 text-muted-foreground">
                              {flow.description || (
                                <span className="text-muted-foreground/60 italic">
                                  No description
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {flow.userId?.name ||
                                flow.userId?.email ||
                                'Mahesh Rajole'}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleFlowActive(flow)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  flow.isActive
                                    ? 'bg-[#25d366]'
                                    : 'bg-muted-foreground/35'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    flow.isActive
                                      ? 'translate-x-4'
                                      : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleDuplicateFlowItem(flow)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted"
                                  title="Duplicate Flow"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setCurrentFlow(flow)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted"
                                  title="Open Flow Builder"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFlowItem(flow)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                                  title="Delete Flow"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ) : (
              /* RENDERING VISUAL FLOW CANVAS DIRECTLY FOR CURRENT FLOW */
              <MetaWhatsappFlowCanvas
                flows={flowsData?.data || []}
                interactiveTemplates={interactiveData?.data || []}
                metaTemplates={metaTemplatesData?.data || []}
                onEditRule={handleOpenModal}
                onDeleteRule={handleDeleteFlow}
                onToggleRule={handleToggleActive}
                onCreateRuleForPayload={handleCreateRuleForPayload}
                createFlow={createFlow}
                updateFlow={updateFlow}
                deleteFlow={deleteFlow}
                numberId={numberId}
                flowId={currentFlow._id}
                currentFlow={currentFlow}
                updateFlowList={updateFlowList}
                onHasUnsavedChangesChange={setHasUnsavedChanges}
                onRegisterSaveHandler={(saveFn) => {
                  saveCanvasRef.current = saveFn
                }}
              />
            ))}
        </div>
      ) : (
        <MetaInteractiveBuilder
          hideHeader={true}
          selectedNumber={selectedNumber}
          whatsappNumbers={whatsappNumbers}
          setSelectedNumber={setSelectedNumber}
        />
      )}

      {/* Create/Edit Rule Modal */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200 animate-in fade-in">
            <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="bg-muted/20 flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Bot className="h-5 w-5 text-[#25d366]" />
                  {editingFlow ? 'Edit Chatbot Rule' : 'Create Chatbot Rule'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSaveFlow}
                className="max-h-[75vh] space-y-4 overflow-y-auto p-6"
              >
                {/* Trigger Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trigger Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTriggerType('keyword')}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                        triggerType === 'keyword'
                          ? 'border-[#25d366] bg-[#25d366]/5 text-[#25d366]'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Keyword Match
                    </button>
                    <button
                      type="button"
                      onClick={() => setTriggerType('button_payload')}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                        triggerType === 'button_payload'
                          ? 'border-[#25d366] bg-[#25d366]/5 text-[#25d366]'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Button Click (Payload)
                    </button>
                  </div>
                </div>

                {/* Trigger Value */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {triggerType === 'keyword'
                      ? 'Trigger Keyword (lowercase match)'
                      : 'Button Payload/ID'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      triggerType === 'keyword'
                        ? 'e.g., hello, pricing, services'
                        : 'e.g., analyze_website, demo_schedule'
                    }
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {triggerType === 'keyword'
                      ? 'The bot triggers when a user sends exactly this word (case-insensitive).'
                      : 'The bot triggers when a user clicks a quick reply/interactive button with this ID.'}
                  </p>
                </div>

                {/* Reply Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Response Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyType('text')}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                        replyType === 'text'
                          ? 'border-[#25d366] bg-[#25d366]/5 text-[#25d366]'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Simple Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyType('interactive')}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-all ${
                        replyType === 'interactive'
                          ? 'border-[#25d366] bg-[#25d366]/5 text-[#25d366]'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      Interactive Message
                    </button>
                  </div>
                </div>

                {/* Reply Value */}
                {replyType === 'text' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Reply Text Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={1024}
                      placeholder="Type the response message here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full resize-none rounded-lg border border-input bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Select Interactive Layout Template
                    </label>
                    <select
                      required
                      value={replyInteractiveId}
                      onChange={(e) => setReplyInteractiveId(e.target.value)}
                      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]"
                    >
                      <option value="" disabled>
                        -- Choose Template --
                      </option>
                      {interactiveData?.data?.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} (
                          {item.type === 'button' ? 'Quick Reply' : 'List Menu'}
                          )
                        </option>
                      ))}
                    </select>
                    {(!interactiveData?.data ||
                      interactiveData.data.length === 0) && (
                      <p className="mt-1 text-xs text-red-500">
                        No interactive message layouts found. Please build one
                        first in the Interactive Builder!
                      </p>
                    )}
                  </div>
                )}

                {/* Active Switch */}
                <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Enable Rule</span>
                    <span className="text-xs text-muted-foreground">
                      Turn this rule on or off instantly.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? 'bg-[#25d366]' : 'bg-muted-foreground/35'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="h-10 rounded-lg bg-gradient-to-r from-[#25d366] to-[#0e7a52] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {isCreating || isUpdating ? 'Saving...' : 'Save Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Create/Edit Flow Modal */}
      {isOpenFlowModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200 animate-in fade-in">
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="bg-muted/20 flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Bot className="h-5 w-5 text-[#25d366]" />
                  {editingFlowItem
                    ? 'Edit Flow Details'
                    : 'Create Chatbot Flow'}
                </h2>
                <button
                  onClick={() => setIsOpenFlowModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFlowItem} className="space-y-4 p-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Flow Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Register Flow, Support Flow"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter a brief description for this chatbot flow..."
                    value={flowDescription}
                    onChange={(e) => setFlowDescription(e.target.value)}
                    className="w-full resize-none rounded-lg border border-input bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpenFlowModal(false)}
                    className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-gradient-to-r from-[#25d366] to-[#0e7a52] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:brightness-110"
                  >
                    {editingFlowItem ? 'Update Flow' : 'Create Flow'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      {/* Copy / Duplicate to target number modal */}
      {duplicateModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200 animate-in fade-in">
            <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="bg-muted/20 flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Copy className="h-5 w-5 text-[#25d366]" />
                  Duplicate Flow
                </h2>
                <button
                  onClick={() => {
                    setDuplicateModalOpen(false)
                    setDuplicateFlowToCopy(null)
                  }}
                  className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div className="bg-muted/40 space-y-1 rounded-lg border border-border p-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Flow to duplicate
                  </label>
                  <div className="text-sm font-semibold text-foreground">
                    {duplicateFlowToCopy?.name}
                  </div>
                  {duplicateFlowToCopy?.description && (
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {duplicateFlowToCopy?.description}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Select Destination Number
                  </label>
                  <select
                    value={targetPhoneNumberId}
                    onChange={(e) => setTargetPhoneNumberId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25d366]"
                  >
                    {whatsappNumbers?.data?.map((num) => (
                      <option key={num._id} value={num.phoneNumberId}>
                        {num.displayName} ({num.phoneNumber})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-muted-foreground">
                    This will clone the entire flow structure and associated
                    reply rules to the selected number.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDuplicateModalOpen(false)
                      setDuplicateFlowToCopy(null)
                    }}
                    className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDuplicate}
                    className="h-10 rounded-lg bg-[#25d366] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:bg-[#0e7a52]"
                  >
                    Duplicate Flow
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Discard Flow Confirmation Modal */}
      {showDiscardModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
              {/* Header with Title and Close X */}
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Discard Flow
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowDiscardModal(false)
                    setPendingAction(null)
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Description Body */}
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                If you discard this flow then all changes made by you will be lost. You can also save this flow.
              </p>

              {/* Modal Footer Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  disabled={isSavingFromModal}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50"
                >
                  Discard flow
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSaveFromModal}
                  disabled={isSavingFromModal}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#00382e] hover:bg-[#002821] dark:bg-emerald-600 dark:hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50"
                >
                  {isSavingFromModal ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save flow'
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
