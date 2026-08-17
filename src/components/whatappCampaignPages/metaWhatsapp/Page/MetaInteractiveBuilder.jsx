import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useOutletContext, Link } from '@/components/react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus,
  Trash2,
  Send,
  Layers,
  List,
  Smartphone,
  LayoutGrid,
  Trash,
  SendHorizontal,
  FileText,
  Info,
  Sparkles,
  AlertCircle,
  X,
  Pencil,
} from 'lucide-react'
import {
  useGetInteractiveMessagesQuery,
  useCreateInteractiveMessageMutation,
  useDeleteInteractiveMessageMutation,
  useSendInteractiveMessageMutation,
  useUpdateInteractiveMessageMutation,
} from '@/redux/apis/metaWhatsapp.api'

export default function MetaInteractiveBuilder(props) {
  const context = useOutletContext() || {}
  const selectedNumber = props.selectedNumber || context.selectedNumber
  const whatsappNumbers = props.whatsappNumbers || context.whatsappNumbers || []
  const setSelectedNumber = props.setSelectedNumber || context.setSelectedNumber

  const numberId = selectedNumber?.phoneNumberId || null
  const numberVal = selectedNumber?._id || ''

  // Fetch saved interactive templates
  const {
    data: interactiveData,
    isLoading,
    isFetching,
    refetch,
  } = useGetInteractiveMessagesQuery(numberId, { skip: !numberId })

  const [createInteractive, { isLoading: isCreating }] =
    useCreateInteractiveMessageMutation()
  const [deleteInteractive] = useDeleteInteractiveMessageMutation()
  const [sendInteractive, { isLoading: isSendingTest }] =
    useSendInteractiveMessageMutation()
  const [updateInteractive, { isLoading: isUpdating }] =
    useUpdateInteractiveMessageMutation()
  const [editingId, setEditingId] = useState(null)

  // Form builder states
  const [activeTab, setActiveTab] = useState(props.defaultTab || 'saved') // 'saved' or 'builder'
  const [layoutName, setLayoutName] = useState('')
  const [msgType, setMsgType] = useState('button') // 'button' or 'list'
  const [headerText, setHeaderText] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [footerText, setFooterText] = useState('')

  // Buttons state (Quick Reply)
  const [buttons, setButtons] = useState([{ id: 'opt_1', title: 'Option 1' }])

  // List menu state
  const [listButtonText, setListButtonText] = useState('Select Option')
  const [sections, setSections] = useState([
    {
      title: 'Main Category',
      rows: [
        { id: 'item_1', title: 'Item 1', description: 'First service option' },
      ],
    },
  ])

  // Modal state for testing send
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [testPhone, setTestPhone] = useState('')

  // Helpers to manage Quick Reply buttons
  const handleAddButton = () => {
    if (buttons.length >= 3) {
      toast.error('Quick Reply supports a maximum of 3 buttons.')
      return
    }
    const nextIdx = buttons.length + 1
    setButtons([
      ...buttons,
      { id: `opt_${nextIdx}`, title: `Option ${nextIdx}` },
    ])
  }

  const handleButtonChange = (idx, field, val) => {
    const updated = [...buttons]
    updated[idx][field] = val
    setButtons(updated)
  }

  const handleRemoveButton = (idx) => {
    setButtons(buttons.filter((_, i) => i !== idx))
  }

  // Helpers to manage List Sections & Rows
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        title: 'New Category',
        rows: [
          { id: `item_${Date.now()}`, title: 'New Item', description: '' },
        ],
      },
    ])
  }

  const handleRemoveSection = (secIdx) => {
    setSections(sections.filter((_, i) => i !== secIdx))
  }

  const handleSectionTitleChange = (secIdx, val) => {
    const updated = [...sections]
    updated[secIdx].title = val
    setSections(updated)
  }

  const handleAddRow = (secIdx) => {
    const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0)
    if (totalRows >= 10) {
      toast.error(
        'List menu supports a maximum of 10 row items across all sections.'
      )
      return
    }
    const updated = [...sections]
    const nextId = `item_${Date.now()}`
    updated[secIdx].rows.push({
      id: nextId,
      title: 'New Item',
      description: '',
    })
    setSections(updated)
  }

  const handleRowChange = (secIdx, rowIdx, field, val) => {
    const updated = [...sections]
    updated[secIdx].rows[rowIdx][field] = val
    setSections(updated)
  }

  const handleRemoveRow = (secIdx, rowIdx) => {
    const updated = [...sections]
    updated[secIdx].rows = updated[secIdx].rows.filter((_, i) => i !== rowIdx)
    setSections(updated)
  }

  // Helper function for validating Body Text variable formatting
  const validateInteractiveBodyText = (text) => {
    if (!text || !text.trim()) {
      return { valid: false, message: 'Please fill in the body message text.' }
    }

    // Check for single curly brace patterns e.g. {1} or {name} instead of double curly braces {{1}} or {{name}}
    const singleBraceMatches = text.match(/(?<!\{)\{([^{}\s]+)\}(?!\})/g);
    if (singleBraceMatches && singleBraceMatches.length > 0) {
      return {
        valid: false,
        message: `Invalid variable syntax: "${singleBraceMatches[0]}". Use double curly braces like {{1}} or {{name}}, not single braces like {1}.`
      }
    }

    // Check for unclosed {{ or unopened }}
    const openCount = (text.match(/\{\{/g) || []).length;
    const closeCount = (text.match(/\}\}/g) || []).length;
    if (openCount !== closeCount) {
      return {
        valid: false,
        message: 'Unmatched curly braces in body text. Make sure every {{ has a matching }}.'
      }
    }

    // Check for empty placeholders like {{}} or {{ }}
    if (/\{\{\s*\}\}/.test(text)) {
      return {
        valid: false,
        message: 'Empty variable placeholders like {{}} are not allowed.'
      }
    }

    // Check numeric variable sequence if numbers like {{1}}, {{2}} are used
    const numericVars = text.match(/\{\{(\d+)\}\}/g);
    if (numericVars && numericVars.length > 0) {
      const nums = Array.from(new Set(numericVars.map(m => parseInt(m.replace(/[\{\}]/g, ''), 10))))
        .sort((a, b) => a - b);
      
      if (nums[0] !== 1) {
        return {
          valid: false,
          message: `Numeric variables must start at {{1}} (found {{${nums[0]}}}).`
        }
      }
      for (let i = 0; i < nums.length; i++) {
        if (nums[i] !== i + 1) {
          return {
            valid: false,
            message: `Numeric variable sequence is missing {{${i + 1}}}. Variables must be sequential ({{1}}, {{2}}, {{3}}...).`
          }
        }
      }
    }

    return { valid: true }
  }

  // Save Template
  const handleSaveTemplate = async () => {
    if (!numberId) {
      toast.error('Please select a WhatsApp number first.')
      return
    }
    if (!layoutName.trim()) {
      toast.error('Please enter a layout name.')
      return
    }
    
    const bodyValidation = validateInteractiveBodyText(bodyText);
    if (!bodyValidation.valid) {
      toast.error(bodyValidation.message);
      return;
    }

    const payload = {
      phoneNumberId: numberId,
      name: layoutName,
      type: msgType,
      headerText,
      bodyText,
      footerText,
    }

    if (msgType === 'button') {
      if (buttons.length === 0) {
        toast.error('Please add at least 1 Quick Reply button.')
        return
      }
      payload.buttons = buttons
    } else {
      if (!listButtonText.trim()) {
        toast.error('Please specify a list button label.')
        return
      }
      const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0)
      if (totalRows === 0) {
        toast.error('Please add at least 1 menu item row.')
        return
      }
      payload.listButtonText = listButtonText
      payload.sections = sections
    }

    try {
      let savedResult
      if (editingId) {
        savedResult = await updateInteractive({
          phoneNumberId: numberId,
          id: editingId,
          ...payload,
        }).unwrap()
        toast.success('Interactive message template updated successfully.')
      } else {
        savedResult = await createInteractive(payload).unwrap()
        toast.success('Interactive message template saved successfully.')
      }
      // Reset builder form
      setEditingId(null)
      setLayoutName('')
      setHeaderText('')
      setBodyText('')
      setFooterText('')
      setButtons([{ id: 'opt_1', title: 'Option 1' }])
      setSections([
        {
          title: 'Main Category',
          rows: [
            {
              id: 'item_1',
              title: 'Item 1',
              description: 'First service option',
            },
          ],
        },
      ])
      refetch()
      setActiveTab('saved')

      if (props.onSaveSuccess) {
        props.onSaveSuccess(savedResult?.data || savedResult)
      }
    } catch (err) {
      toast.error(
        err?.data?.message ||
          `Failed to ${editingId ? 'update' : 'save'} template.`
      )
    }
  }

  // Delete Template
  const handleDelete = async (id) => {
    try {
      await deleteInteractive({ phoneNumberId: numberId, id }).unwrap()
      toast.success('Interactive template deleted.')
      if (editingId === id) {
        setEditingId(null)
      }
      refetch()
    } catch (err) {
      toast.error(
        err?.data?.message || 'Failed to delete interactive template.'
      )
    }
  }

  // Edit Template
  const handleEdit = (item) => {
    setEditingId(item._id)
    setLayoutName(item.name)
    setMsgType(item.type)
    setHeaderText(item.headerText || '')
    setBodyText(item.bodyText)
    setFooterText(item.footerText || '')

    if (item.type === 'button') {
      setButtons(item.buttons || [])
    } else {
      setListButtonText(item.listButtonText || 'Select Option')
      setSections(item.sections || [])
    }
    setActiveTab('builder')
  }

  useEffect(() => {
    if (props.initialEditingId && interactiveData?.data) {
      const item = interactiveData.data.find(
        (t) => t._id === props.initialEditingId
      )
      if (item) {
        handleEdit(item)
      }
    }
  }, [props.initialEditingId, interactiveData])

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    setEditingId(null)
    setLayoutName('')
    setHeaderText('')
    setBodyText('')
    setFooterText('')
    setButtons([{ id: 'opt_1', title: 'Option 1' }])
    setSections([
      {
        title: 'Main Category',
        rows: [
          {
            id: 'item_1',
            title: 'Item 1',
            description: 'First service option',
          },
        ],
      },
    ])
    setActiveTab('saved')
  }

  // Send Test Message
  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      toast.error('Please enter a recipient phone number.')
      return
    }
    try {
      await sendInteractive({
        phoneNumberId: numberId,
        id: selectedTemplateId,
        to: testPhone,
      }).unwrap()
      toast.success('Test interactive message sent successfully!')
      setTestModalOpen(false)
      setTestPhone('')
    } catch (err) {
      toast.error(
        err?.data?.message || err?.message || 'Failed to send test message.'
      )
    }
  }

  const openSendModal = (id) => {
    setSelectedTemplateId(id)
    setTestModalOpen(true)
  }

  return (
    <div
      className={`flex h-full flex-col ${props.onCancel ? 'space-y-6 bg-slate-50 dark:bg-background p-6 text-slate-900 dark:text-slate-100' : props.hideHeader ? '' : 'space-y-6 bg-slate-50 dark:bg-background p-6 text-slate-900 dark:text-slate-100'}`}
    >
      {/* Toolbar Header */}
      {(!props.hideHeader || props.onCancel) && (
        <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-slate-200 dark:border-border pb-5 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              <Layers className="h-5.5 w-5.5 text-[#25d366]" />
              {props.onCancel
                ? editingId
                  ? 'Edit Interactive Template'
                  : 'Create Interactive Template'
                : 'Interactive Message Builder'}
            </h1>
            {!props.onCancel && (
              <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">
                Design Quick Reply buttons and List Menu templates to initiate
                interactive conversations.
              </p>
            )}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            {!props.hideHeader && (
              <select
                value={numberVal}
                onChange={(e) => {
                  const num = whatsappNumbers?.data?.find(
                    (n) => n._id === e.target.value
                  )
                  setSelectedNumber(num)
                  handleCancelEdit()
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
            )}

            {props.onCancel && (
              <button
                type="button"
                onClick={props.onCancel}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-colors hover:bg-muted"
                title="Close Builder"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Notification */}
      {!numberId && (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-600 dark:text-yellow-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              {whatsappNumbers?.data?.length === 0
                ? 'No Meta WhatsApp Business numbers connected to MyTekAI. Connect your number via Meta Integration first.'
                : 'Please select a WhatsApp Business Number from the top bar to design interactive messages.'}
            </span>
          </div>
          {whatsappNumbers?.data?.length === 0 && (
            <Link
              to="/whatsapp/connect"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-yellow-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-yellow-700"
            >
              Go to Meta Connect
            </Link>
          )}
        </div>
      )}

      {/* Sub-tab navigation bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'saved'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Saved Layouts ({interactiveData?.data?.length || 0})
          </button>
          <button
            onClick={() => {
              if (activeTab !== 'builder') {
                handleCancelEdit()
                setActiveTab('builder')
              }
            }}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'builder'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            {editingId ? 'Edit Layout' : 'Create New Layout'}
          </button>
        </div>

        {activeTab === 'saved' ? (
          <button
            onClick={() => {
              handleCancelEdit()
              setActiveTab('builder')
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Layout
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('saved')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm transition-all hover:bg-muted"
          >
            ← View Saved Layouts ({interactiveData?.data?.length || 0})
          </button>
        )}
      </div>

      {/* Content Tabs */}
      {activeTab === 'saved' ? (
        // --- SAVED LAYOUTS LIST ---
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {interactiveData?.data?.map((item) => (
            <div
              key={item._id}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-semibold text-foreground">
                    {item.name}
                  </h3>
                  <span className="rounded-full bg-[#25d366]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#25d366]">
                    {item.type}
                  </span>
                </div>
                <div className="bg-muted/30 line-clamp-3 rounded-lg p-2.5 font-mono text-xs text-muted-foreground">
                  {item.headerText && (
                    <div className="mb-1 border-b border-border pb-1 font-bold">
                      {item.headerText}
                    </div>
                  )}
                  <div>{item.bodyText}</div>
                  {item.footerText && (
                    <div className="text-muted-foreground/70 mt-1 border-t border-border pt-1 text-[10px]">
                      {item.footerText}
                    </div>
                  )}
                </div>

                {/* Quick statistics/options snippet */}
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {item.type === 'button' ? (
                    item.buttons?.map((b) => (
                      <span
                        key={b.id}
                        className="rounded bg-muted px-2 py-0.5 font-mono text-[9px]"
                      >
                        {b.title}
                      </span>
                    ))
                  ) : (
                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-[9px]">
                      {item.listButtonText} (
                      {item.sections?.reduce((a, c) => a + c.rows.length, 0)}{' '}
                      items)
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border pt-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-teal-600 transition-colors hover:bg-teal-500/10"
                  title="Edit Layout"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="hover:bg-destructive/10 inline-flex items-center justify-center rounded-lg p-2 text-destructive transition-colors"
                  title="Delete Layout"
                >
                  <Trash className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openSendModal(item._id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#25d366]/10 px-3.5 py-1.5 text-xs font-bold text-[#25d366] transition-all hover:bg-[#25d366]/20"
                >
                  <SendHorizontal className="h-3.5 w-3.5" />
                  Test Send
                </button>
              </div>
            </div>
          ))}

          {(!interactiveData?.data || interactiveData.data.length === 0) && (
            <div className="col-span-full rounded-xl border border-dashed border-border py-12 text-center">
              <Layers className="text-muted-foreground/30 mx-auto mb-3 h-10 w-10" />
              <p className="text-sm font-medium text-muted-foreground">
                No interactive templates saved yet. Switch to the "Builder" tab
                to create one.
              </p>
            </div>
          )}
        </div>
      ) : (
        // --- BUILDER WORKSPACE ---
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Settings Form Panel (Left 7 Columns) */}
          <div className="space-y-6 lg:col-span-7">
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
              {editingId && (
                <div className="flex items-center justify-between rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-yellow-600 dark:text-yellow-400">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                    <span className="text-xs font-bold">
                      You are in Edit Mode
                    </span>
                  </div>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded bg-yellow-500/10 px-2.5 py-1 text-xs font-bold underline transition-all hover:bg-yellow-500/20 hover:no-underline"
                  >
                    Cancel Edit
                  </button>
                </div>
              )}
              {/* Layout Setup Header */}
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <LayoutGrid className="h-5 w-5 text-[#25d366]" />
                  Interactive Layout Settings
                </h2>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Layout Name
                    </label>
                    <input
                      type="text"
                      value={layoutName}
                      onChange={(e) => setLayoutName(e.target.value)}
                      placeholder="e.g. Appointment Scheduler Quick Reply"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-[#25d366]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Layout Type
                    </label>
                    <div className="flex h-10 rounded-lg border border-border bg-background p-1">
                      <button
                        onClick={() => setMsgType('button')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-all ${
                          msgType === 'button'
                            ? 'bg-[#25d366] text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Smartphone className="h-3.5 w-3.5" />
                        Quick Reply (Buttons)
                      </button>
                      <button
                        onClick={() => setMsgType('list')}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-bold transition-all ${
                          msgType === 'list'
                            ? 'bg-[#25d366] text-white'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <List className="h-3.5 w-3.5" />
                        List Menu
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content Customization */}
              <div className="space-y-4 border-t border-border pt-4">
                <h3 className="text-sm font-bold text-foreground">
                  Message Structure
                </h3>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Header Text (Optional)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {headerText.length}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. Booking confirmation"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-[#25d366]"
                      maxLength={60}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Body Text (Required)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {bodyText.length}/1024
                      </span>
                    </div>
                    <textarea
                      value={bodyText}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Hi {{1}}! Welcome to {{2}}. Please choose an option below."
                      className="min-h-[100px] w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus:ring-1 focus:ring-[#25d366]"
                      maxLength={1024}
                    />
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">💡 Variables Tip:</span>
                      Use double curly braces like <code className="bg-muted px-1 rounded text-foreground font-mono text-[10px]">&#123;&#123;1&#125;&#125;</code>, <code className="bg-muted px-1 rounded text-foreground font-mono text-[10px]">&#123;&#123;2&#125;&#125;</code> or <code className="bg-muted px-1 rounded text-foreground font-mono text-[10px]">&#123;&#123;name&#125;&#125;</code>, <code className="bg-muted px-1 rounded text-foreground font-mono text-[10px]">&#123;&#123;company&#125;&#125;</code> to pass dynamic data in flows.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Footer Text (Optional)
                      </label>
                      <span className="text-[10px] text-muted-foreground">
                        {footerText.length}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g. MyTekAI Automated Assistant"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-[#25d366]"
                      maxLength={60}
                    />
                  </div>
                </div>
              </div>

              {/* Option Configuration */}
              <div className="space-y-4 border-t border-border pt-4">
                {msgType === 'button' ? (
                  // BUTTON BUILDER
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground">
                        Buttons Configuration (Max 3)
                      </h4>
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {buttons.length}/3
                      </span>
                    </div>

                    <div className="space-y-3">
                      {buttons.map((btn, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-background p-3.5 md:grid-cols-12"
                        >
                          <div className="space-y-1.5 md:col-span-5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">
                              Button Text
                            </label>
                            <input
                              type="text"
                              value={btn.title}
                              onChange={(e) =>
                                handleButtonChange(idx, 'title', e.target.value)
                              }
                              className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-[#25d366]"
                              maxLength={20}
                            />
                          </div>
                          <div className="space-y-1.5 md:col-span-5">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">
                              Button ID / Payload
                            </label>
                            <input
                              type="text"
                              value={btn.id}
                              onChange={(e) =>
                                handleButtonChange(idx, 'id', e.target.value)
                              }
                              className="h-9 w-full rounded-md border border-input bg-background px-3 font-mono text-xs focus:ring-1 focus:ring-[#25d366]"
                            />
                          </div>
                          <div className="flex items-end justify-center md:col-span-2">
                            <button
                              onClick={() => handleRemoveButton(idx)}
                              className="hover:bg-destructive/10 inline-flex h-9 w-9 items-center justify-center rounded-md text-destructive transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {buttons.length < 3 && (
                        <button
                          onClick={handleAddButton}
                          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-xs font-semibold text-foreground transition-all hover:border-[#25d366] hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                          Add Quick Reply Button
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  // LIST MENU BUILDER
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-foreground">
                      List Menu Configuration (Max 10 rows)
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">
                        List Menu Button Label
                      </label>
                      <input
                        type="text"
                        value={listButtonText}
                        onChange={(e) => setListButtonText(e.target.value)}
                        placeholder="e.g. View Services"
                        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-[#25d366]"
                        maxLength={20}
                      />
                    </div>

                    {/* Sections List */}
                    <div className="space-y-5 pt-3">
                      {sections.map((sec, secIdx) => (
                        <div
                          key={secIdx}
                          className="relative space-y-4 rounded-xl border border-border bg-background p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                                Section Category Name
                              </label>
                              <input
                                type="text"
                                value={sec.title}
                                onChange={(e) =>
                                  handleSectionTitleChange(
                                    secIdx,
                                    e.target.value
                                  )
                                }
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs font-bold focus:ring-1 focus:ring-[#25d366]"
                                maxLength={24}
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveSection(secIdx)}
                              className="hover:bg-destructive/10 mt-5 inline-flex h-9 w-9 items-center justify-center rounded-md text-destructive transition-colors"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>

                          {/* Section Rows (List Items) */}
                          <div className="space-y-3">
                            {sec.rows.map((row, rowIdx) => (
                              <div
                                key={rowIdx}
                                className="relative grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-3 md:grid-cols-12"
                              >
                                <div className="space-y-1.5 md:col-span-3">
                                  <label className="text-[9px] font-bold uppercase text-muted-foreground">
                                    Item ID
                                  </label>
                                  <input
                                    type="text"
                                    value={row.id}
                                    onChange={(e) =>
                                      handleRowChange(
                                        secIdx,
                                        rowIdx,
                                        'id',
                                        e.target.value
                                      )
                                    }
                                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 font-mono text-[11px] focus:ring-1 focus:ring-[#25d366]"
                                  />
                                </div>
                                <div className="space-y-1.5 md:col-span-4">
                                  <label className="text-[9px] font-bold uppercase text-muted-foreground">
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    value={row.title}
                                    onChange={(e) =>
                                      handleRowChange(
                                        secIdx,
                                        rowIdx,
                                        'title',
                                        e.target.value
                                      )
                                    }
                                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[11px] focus:ring-1 focus:ring-[#25d366]"
                                    maxLength={24}
                                  />
                                </div>
                                <div className="space-y-1.5 md:col-span-4">
                                  <label className="text-[9px] font-bold uppercase text-muted-foreground">
                                    Description
                                  </label>
                                  <input
                                    type="text"
                                    value={row.description}
                                    onChange={(e) =>
                                      handleRowChange(
                                        secIdx,
                                        rowIdx,
                                        'description',
                                        e.target.value
                                      )
                                    }
                                    className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-[11px] focus:ring-1 focus:ring-[#25d366]"
                                    maxLength={72}
                                  />
                                </div>
                                <div className="flex items-end justify-center md:col-span-1">
                                  <button
                                    onClick={() =>
                                      handleRemoveRow(secIdx, rowIdx)
                                    }
                                    className="hover:bg-destructive/10 inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              onClick={() => handleAddRow(secIdx)}
                              className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-[10px] font-bold text-foreground transition-all hover:border-[#25d366] hover:bg-muted"
                            >
                              <Plus className="h-3 w-3" />
                              Add Row Item
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={handleAddSection}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#25d366] text-xs font-semibold text-[#25d366] transition-all hover:bg-[#25d366]/5"
                      >
                        <Plus className="h-4 w-4" />
                        Add Section Category
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleSaveTemplate}
                disabled={!numberId || isCreating || isUpdating}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25d366] to-[#0e7a52] text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:brightness-110 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {editingId ? 'Update Layout' : 'Save Layout'}
              </button>
            </div>
          </div>

          {/* Smartphone Preview Panel (Right 5 Columns) */}
          <div className="sticky top-6 flex justify-center lg:col-span-5">
            <div className="relative flex aspect-[9/18] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border-[10px] border-slate-800 bg-[#ece5dd] shadow-2xl">
              {/* StatusBar */}
              <div className="flex h-8 items-center justify-between bg-slate-900 px-6 text-[10px] text-white">
                <span>9:41</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-3.5 rounded-sm border border-white"></div>
                </div>
              </div>

              {/* WhatsApp Header */}
              <div className="flex shrink-0 items-center gap-3.5 bg-[#075e54] p-3 text-white shadow-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 text-sm font-bold uppercase text-[#075e54]">
                  {selectedNumber?.displayName?.charAt(0) || 'W'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-xs font-semibold leading-normal">
                    {selectedNumber?.displayName || 'WhatsApp Business'}
                  </h3>
                  <p className="text-[9px] font-medium leading-tight text-[#128c7e]">
                    online
                  </p>
                </div>
              </div>

              {/* Message Box Simulator */}
              <div className="relative flex min-h-0 flex-1 flex-col justify-end space-y-2.5 p-3">
                <div className="flex max-w-[90%] flex-col self-start overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                  {/* Header Text */}
                  {headerText.trim() && (
                    <div className="truncate border-b border-slate-100 bg-slate-50 px-3.5 py-2 text-[11px] font-bold text-slate-500">
                      {headerText}
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-wrap px-3.5 py-2.5 text-xs leading-normal text-slate-800">
                    {bodyText.trim()
                      ? bodyText
                      : 'Your interactive text message content goes here. Specify options below.'}
                  </div>

                  {/* Footer Text */}
                  {footerText.trim() && (
                    <div className="px-3.5 pb-2 text-[9px] font-medium text-slate-400">
                      {footerText}
                    </div>
                  )}

                  {/* Interactive Bottom Sheet Button for List Menu */}
                  {msgType === 'list' && (
                    <div className="flex cursor-pointer items-center justify-center border-t border-none border-slate-100 bg-slate-50/50 py-2.5 text-xs font-bold text-[#00a884] transition-all hover:bg-slate-50 active:bg-slate-100">
                      <List className="mr-1.5 h-3.5 w-3.5" />
                      {listButtonText || 'Select Option'}
                    </div>
                  )}
                </div>

                {/* Quick Reply Option Buttons */}
                {msgType === 'button' && buttons.length > 0 && (
                  <div className="flex w-full max-w-[90%] flex-col gap-1.5 self-start">
                    {buttons.map((btn, idx) => (
                      <div
                        key={idx}
                        className="w-full cursor-default truncate rounded-lg border border-slate-100 bg-white px-3 py-2 text-center text-xs font-bold text-[#00a884] shadow-sm"
                      >
                        {btn.title || `Button #${idx + 1}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Footer Input Bar */}
              <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-[#f0f0f0] p-2">
                <div className="flex min-w-0 flex-1 items-center rounded-full bg-white px-3 py-1 shadow-sm">
                  <input
                    type="text"
                    disabled
                    placeholder="Interactive message preview..."
                    className="w-full border-none bg-transparent py-1 text-xs text-slate-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Dialog Modal */}
      {testModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-[420px] space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Send className="h-5 w-5 text-[#25d366]" />
                  Test Interactive Layout
                </h3>
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Send this layout instantly to a test WhatsApp number to preview
                exactly how it functions on actual devices.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Recipient Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) =>
                    setTestPhone(e.target.value.replace(/[^0-9+]/g, ''))
                  }
                  placeholder="e.g. +15551234567"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-[#25d366]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  onClick={() => setTestModalOpen(false)}
                  className="h-10 rounded-lg border border-border bg-transparent px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25d366] px-5 text-sm font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-50"
                >
                  {isSendingTest ? 'Sending...' : 'Send Now'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
