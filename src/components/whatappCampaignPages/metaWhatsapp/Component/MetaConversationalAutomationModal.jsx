import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Trash2,
  Save,
  RefreshCw,
  Info,
  MessageCircle,
  Send,
  Terminal,
  X,
  Smartphone,
  Sparkles,
  Command,
  MessageSquare,
  Bot,
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Camera
} from 'lucide-react'
import {
  useGetConversationalAutomationQuery,
  useUpdateConversationalAutomationMutation,
} from '@/redux/apis/metaWhatsapp.api'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function MetaConversationalAutomationModal({
  isOpen,
  onClose,
  selectedNumber,
  initialTab = 'ice_breakers',
}) {
  if (!isOpen || !selectedNumber) return null

  const numberId =
    selectedNumber?.phoneNumberId ||
    selectedNumber?.phone_number_id ||
    selectedNumber?.id ||
    selectedNumber?._id ||
    null

  // Fetch conversational automation from backend/Meta for selected number
  const {
    data: automationData,
    isLoading,
    isFetching,
    refetch,
  } = useGetConversationalAutomationQuery(numberId, { skip: !numberId })

  const [updateAutomation, { isLoading: isSaving }] =
    useUpdateConversationalAutomationMutation()

  // Form states
  const [prompts, setPrompts] = useState([])
  const [commands, setCommands] = useState([])
  const [enableWelcomeMessage, setEnableWelcomeMessage] = useState(true)
  const [activeTab, setActiveTab] = useState(initialTab) // 'ice_breakers' | 'slash_commands'

  // Update active tab when modal opens or initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab, isOpen])

  // Helper to normalize commands array regardless of Meta or DB key format
  const normalizeCommands = (rawCommands) => {
    if (!Array.isArray(rawCommands)) return []
    return rawCommands.map((c) => ({
      command_name: c?.command_name || c?.name || c?.command || '',
      command_description: c?.command_description || c?.description || '',
    }))
  }

  // Sync form states with pre-fetched selectedNumber data & incoming query data
  useEffect(() => {
    let rawPrompts = []
    let rawCommands = []

    let rawWelcome = true

    if (automationData?.data) {
      rawPrompts = automationData.data.prompts || []
      rawCommands = automationData.data.commands || []
      if (automationData.data.enable_welcome_message !== undefined) rawWelcome = automationData.data.enable_welcome_message
    } else if (selectedNumber?.conversationalAutomation) {
      rawPrompts = selectedNumber.conversationalAutomation.prompts || []
      rawCommands = selectedNumber.conversationalAutomation.commands || []
      if (selectedNumber.conversationalAutomation.enable_welcome_message !== undefined) rawWelcome = selectedNumber.conversationalAutomation.enable_welcome_message
    } else if (selectedNumber?.prompts || selectedNumber?.commands) {
      rawPrompts = selectedNumber.prompts || []
      rawCommands = selectedNumber.commands || []
    }

    setPrompts(Array.isArray(rawPrompts) ? rawPrompts : [])
    setCommands(normalizeCommands(rawCommands))
    setEnableWelcomeMessage(rawWelcome)
  }, [automationData, selectedNumber])

  // Reset simulator state when switching number, modal visibility or tab
  useEffect(() => {
    setMockMessages([])
    setMockInput('')
    setShowMockCommands(false)
  }, [selectedNumber, isOpen, activeTab])

  // Determine if content is ready (using prefetch or network data)
  const hasPrefetchedData = Boolean(
    automationData?.data ||
      selectedNumber?.conversationalAutomation ||
      selectedNumber?.prompts ||
      selectedNumber?.commands
  )
  const showFullLoading = isLoading && !hasPrefetchedData

  // Simulator states
  const [mockMessages, setMockMessages] = useState([])
  const [mockInput, setMockInput] = useState('')
  const [showMockCommands, setShowMockCommands] = useState(false)

  // Handle Prompts
  const handleAddPrompt = () => {
    if (prompts.length >= 4) {
      toast.error('You can add a maximum of 4 Ice Breaker prompts.')
      return
    }
    setPrompts([...prompts, ''])
  }

  const handlePromptChange = (index, value) => {
    const updated = [...prompts]
    updated[index] = value
    setPrompts(updated)
  }

  const handleRemovePrompt = (index) => {
    const updated = prompts.filter((_, i) => i !== index)
    setPrompts(updated)
  }

  // Handle Commands
  const handleAddCommand = () => {
    if (commands.length >= 30) {
      toast.error('Maximum of 30 Slash Commands allowed per phone number.')
      return
    }
    setCommands([...commands, { command_name: '', command_description: '' }])
  }

  const handleCommandChange = (index, field, value) => {
    const updated = [...commands]
    let val = value
    if (field === 'command_name') {
      val = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    }
    updated[index] = { ...updated[index], [field]: val }
    setCommands(updated)
  }

  const handleRemoveCommand = (index) => {
    const updated = commands.filter((_, i) => i !== index)
    setCommands(updated)
  }

  // Save configuration
  const handleSave = async () => {
    if (!numberId) {
      toast.error('Invalid WhatsApp number selected.')
      return
    }

    const cleanPrompts = prompts.filter((p) => p.trim() !== '')
    const cleanCommands = commands
      .filter(
        (c) =>
          (c.command_name || c.name || '').trim() !== '' &&
          (c.command_description || c.description || '').trim() !== ''
      )
      .map((c) => ({
        command_name: (c.command_name || c.name || '').trim().toLowerCase(),
        command_description: (c.command_description || c.description || '').trim(),
        name: (c.command_name || c.name || '').trim().toLowerCase(),
        description: (c.command_description || c.description || '').trim(),
      }))

    if (cleanPrompts.length > 4) {
      toast.error('Maximum 4 prompts are allowed.')
      return
    }

    for (const cmd of cleanCommands) {
      if (cmd.command_name.length > 32) {
        toast.error(
          `Command name '/${cmd.command_name}' exceeds 32 characters limit.`
        )
        return
      }
    }

    try {
      await updateAutomation({
        phoneNumberId: numberId,
        payload: {
          enable_welcome_message: enableWelcomeMessage,
          prompts: cleanPrompts,
          commands: cleanCommands,
        },
      }).unwrap()
      toast.success(
        'Conversational automation updated on Meta and saved successfully.'
      )
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update configuration.')
    }
  }

  // Simulator tap simulation
  const handleTapPrompt = (promptText) => {
    setMockMessages([
      ...mockMessages,
      { id: Date.now(), sender: 'user', text: promptText },
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: `🤖 (Triggered Workflow for: "${promptText}")`,
      },
    ])
  }

  const handleSendMockMessage = (text = mockInput) => {
    if (!text.trim()) return
    const newMsg = { id: Date.now(), sender: 'user', text }
    let replies = []

    if (text.startsWith('/')) {
      const cmdName = text.substring(1).trim().toLowerCase()
      const foundCmd = commands.find((c) => c.command_name === cmdName)
      if (foundCmd) {
        replies = [
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `⚡ Command Triggered: /${foundCmd.command_name}\nDescription: ${foundCmd.command_description}`,
          },
        ]
      } else {
        replies = [
          {
            id: Date.now() + 1,
            sender: 'bot',
            text: `❌ Unknown command: ${text}`,
          },
        ]
      }
    } else {
      replies = [
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '👋 Hi! Tap one of the Ice Breakers or type a /command to see me in action.',
        },
      ]
    }

    setMockMessages([...mockMessages, newMsg, ...replies])
    setMockInput('')
    setShowMockCommands(false)
  }

  // Input monitoring for '/' triggers
  const handleInputChange = (val) => {
    setMockInput(val)
    if (val === '/') {
      setShowMockCommands(true)
    } else if (!val.startsWith('/')) {
      setShowMockCommands(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/70">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-white/[0.08] dark:bg-[#0b0d14]">
        
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-white/[0.06] dark:bg-[#141721]">
          <div className="flex items-center gap-4">
            {/* <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-6 w-6" />
            </div> */}
            <div className='' >
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {activeTab === 'ice_breakers'  ? "Ice Breaker" : " Slash Commands"}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-green-600 px-2 py-1.5 text-xs font-medium text-white">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{selectedNumber?.displayName}</span>
                  <span className="">({selectedNumber?.phoneNumber})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
          {showFullLoading ? (
            <div className="h-48">
              <LoadingSpinner variant="spinner" text="Loading automation settings..." />
            </div>
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-12">
              
              {/* Configuration Form (Left 7 cols) */}
              <div className="flex h-full flex-col overflow-y-auto pr-3 lg:col-span-7 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                <div className="flex flex-col space-y-6">
                
                {/* Tab Switcher */}
                {/* <div className="flex space-x-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200/50 dark:bg-[#141721] dark:ring-white/[0.05]">
                  <button
                    onClick={() => setActiveTab('ice_breakers')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition-all ${
                      activeTab === 'ice_breakers'
                        ? 'bg-slate-100 text-emerald-700 dark:bg-slate-800/80 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Ice Breakers
                  </button>
                  <button
                    onClick={() => setActiveTab('slash_commands')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-all ${
                      activeTab === 'slash_commands'
                        ? 'bg-slate-100 text-emerald-700 dark:bg-slate-800/80 dark:text-emerald-400'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Command className="h-4 w-4" />
                    Slash Commands
                  </button>
                </div> */}

                {/* Global Welcome Toggle */}
                <div className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 sm:flex-row sm:items-center dark:border-white/[0.08] dark:bg-[#141721] dark:hover:border-emerald-500/30">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Welcome Message
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        When enabled, new users will see your Ice Breaker prompts when they first open the chat.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={enableWelcomeMessage}
                      onChange={(e) => setEnableWelcomeMessage(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 dark:bg-slate-700 dark:peer-focus:ring-emerald-800"></div>
                  </label>
                </div>

                {/* Render Ice Breakers View */}
                {activeTab === 'ice_breakers' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Configured Prompts</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Define up to 4 quick reply buttons for users.</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                        {prompts.length} / 4
                      </span>
                    </div>

                    <div className="space-y-3">
                      {prompts.map((prompt, index) => (
                        <div
                          key={index}
                          className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#141721] dark:focus-within:border-emerald-500"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 font-mono text-sm font-bold text-slate-400 dark:bg-slate-800/50 dark:text-slate-500">
                            {index + 1}
                          </div>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              value={prompt}
                              onChange={(e) => handlePromptChange(index, e.target.value)}
                              placeholder="e.g. Talk to sales"
                              className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100"
                              maxLength={80}
                            />
                          </div>
                          <div className="flex items-center gap-3 pr-2">
                            <span className="text-xs font-medium text-slate-400 transition-opacity group-focus-within:opacity-100 lg:opacity-0">
                              {prompt.length}/80
                            </span>
                            <button
                              onClick={() => handleRemovePrompt(index)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              title="Remove Prompt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {prompts.length === 0 && (
                        <div className="py-4">
                          <EmptyState
                            variant="simple"
                            icon={<MessageSquare className="text-slate-300 dark:text-slate-600" size={32} />}
                            description="No prompts configured."
                          />
                        </div>
                      )}

                      {prompts.length < 4 && (
                        <Button
                          label="Add Ice Breaker Prompt"
                          variant="outline"
                          onClick={handleAddPrompt}
                          icon={<Plus size={16} />}
                          className="w-full border-2 border-dashed py-4 hover:border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Render Slash Commands View */}
                {activeTab === 'slash_commands' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Slash Commands</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Create up to 30 shortcuts for your chat bot.</p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                        {commands.length} / 30
                      </span>
                    </div>

                    <div className="space-y-3">
                      {commands.map((cmd, index) => (
                        <div
                          key={index}
                          className="group relative flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 hover:border-slate-300 sm:flex-row sm:items-start dark:border-white/[0.08] dark:bg-[#141721] dark:focus-within:border-emerald-500"
                        >
                          <div className="w-full sm:w-1/3">
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Command
                            </label>
                            <div className="relative flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 transition-colors focus-within:border-emerald-500 focus-within:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-emerald-500 dark:focus-within:bg-slate-950">
                              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">/</span>
                              <input
                                type="text"
                                value={cmd.command_name}
                                onChange={(e) => handleCommandChange(index, 'command_name', e.target.value)}
                                placeholder="pricing"
                                className="w-full bg-transparent py-2 pl-1.5 font-mono text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100"
                                maxLength={32}
                              />
                            </div>
                          </div>
                          <div className="w-full sm:flex-1">
                            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Description
                            </label>
                            <div className="relative flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 transition-colors focus-within:border-emerald-500 focus-within:bg-white dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-emerald-500 dark:focus-within:bg-slate-950">
                              <input
                                type="text"
                                value={cmd.command_description}
                                onChange={(e) => handleCommandChange(index, 'command_description', e.target.value)}
                                placeholder="View product pricing list"
                                className="w-full bg-transparent py-2 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100"
                                maxLength={128}
                              />
                            </div>
                          </div>
                          <div className="flex h-[60px] items-end justify-end sm:h-auto sm:items-center sm:pt-6">
                            <button
                              onClick={() => handleRemoveCommand(index)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                              title="Remove Command"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {commands.length === 0 && (
                        <div className="py-4">
                          <EmptyState
                            variant="simple"
                            icon={<Command className="text-slate-300 dark:text-slate-600" size={32} />}
                            description="No slash commands configured."
                          />
                        </div>
                      )}

                      {commands.length < 30 && (
                        <Button
                          label="Add Slash Command"
                          variant="outline"
                          onClick={handleAddCommand}
                          icon={<Plus size={16} />}
                          className="w-full border-2 border-dashed py-4 hover:border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                        />
                      )}
                    </div>
                  </div>
                )}

                </div>
              </div>

              {/* Smartphone Simulator Preview (Right 5 cols) */}
              <div className="flex h-full flex-col items-center justify-center lg:col-span-5">
                  
                  <div className="relative mx-auto flex h-[520px] w-[300px] shrink-0 flex-col overflow-hidden rounded-[14px] bg-[#E5DDD5] shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                  {/* WhatsApp Header */}
                  <div className="flex shrink-0 items-center justify-between bg-[#008069] px-3 py-2.5 text-white shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <ArrowLeft className="h-4.5 w-4.5 opacity-90" />
                      <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-blue-500 text-white shadow-sm">
                        {selectedNumber?.displayName ? selectedNumber.displayName.charAt(0) : 'W'}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-[13px] font-medium leading-tight">{selectedNumber?.displayName || 'Borade AI'}</h4>
                        <p className="text-[10.5px] opacity-90">{selectedNumber?.phoneNumber || '919 13770 4001x'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pr-1">
                      <Video className="h-4.5 w-4.5" fill="currentColor" />
                      <Phone className="h-4 w-4" fill="currentColor" />
                      <MoreVertical className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  {/* Chat Background Image */}
                  <div className="absolute inset-0 top-[52px] z-0 opacity-[0.25] mix-blend-overlay" style={{backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`, backgroundSize: 'cover'}}></div>

                  {/* Chat Body */}
                  <div className="relative z-10 flex min-h-0 flex-1 flex-col space-y-2.5 overflow-y-auto p-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                    {/* Default Welcome Message */}
                    {mockMessages.length === 0 && (
                      <div className="max-w-[85%] self-start rounded-lg rounded-tl-none bg-white p-2 text-[12px] text-slate-800 shadow-sm dark:bg-[#1f2c34] dark:text-slate-200">
                        <p className="font-medium">
                          👋 Welcome to <strong className="font-bold text-[#008069] dark:text-emerald-400">{selectedNumber?.displayName || 'Our Bot'}</strong>!
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {activeTab === 'ice_breakers'
                            ? 'Tap any suggested prompt below to test.'
                            : 'Type / below to test slash commands.'}
                        </p>
                      </div>
                    )}

                    {/* Messages */}
                    {mockMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[85%] rounded-lg p-2 text-[12.5px] shadow-sm ${
                          msg.sender === 'user'
                            ? 'self-end rounded-tr-none bg-[#d9fdd3] text-slate-900 dark:bg-[#005c4b] dark:text-slate-100'
                            : 'self-start rounded-tl-none bg-white text-slate-900 dark:bg-[#1f2c34] dark:text-slate-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-500">
                          <span>9:41 AM</span>
                          {msg.sender === 'user' && (
                            <span className="font-bold text-blue-500">✓✓</span>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Ice Breaker Buttons */}
                    {activeTab === 'ice_breakers' && prompts.filter((p) => p.trim() !== '').length > 0 && (
                      <div className="mt-auto flex w-full flex-col gap-2 pt-4">
                        {prompts
                          .filter((p) => p.trim() !== '')
                          .map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleTapPrompt(p)}
                              className="mx-auto flex w-full items-center justify-center rounded-full bg-white px-3 py-1.5 text-center text-[12.5px] font-medium text-[#00a884] shadow-sm active:scale-[0.98] dark:bg-[#1f2c34] dark:text-[#00a884]"
                            >
                              <span className="truncate">{p}</span>
                            </button>
                          ))}
                      </div>
                    )}

                    {/* Slash Command Autocomplete overlay */}
                    {showMockCommands && commands.length > 0 && (
                      <div className="absolute bottom-14 left-2 right-2 flex flex-col overflow-hidden rounded-[20px] bg-white shadow-xl dark:bg-[#1f2c34]">
                        <div className="max-h-[180px] overflow-y-auto p-1 py-1.5">
                          {commands.map((cmd, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMockMessage(`/${cmd.command_name}`)}
                              className="flex w-full flex-col px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                                /{cmd.command_name}
                              </span>
                              <span className="text-[12px] text-slate-500 dark:text-slate-400">
                                {cmd.command_description || 'No description'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Footer Input */}
                  <div className="relative z-10 p-2.5 pt-1">
                    <div className="flex min-h-[44px] w-full items-center rounded-full bg-white px-3 shadow-sm dark:bg-[#2a3942]">
                      <Smile className="mr-2 h-[22px] w-[22px] shrink-0 text-slate-400" />
                      <input
                        type="text"
                        value={mockInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMockMessage()}
                        placeholder="Type a message"
                        className="w-full bg-transparent text-[14px] text-slate-800 placeholder-slate-400 outline-none dark:text-slate-100"
                      />
                      <div className="flex items-center gap-3 pl-2 pr-0.5 text-slate-400">
                        <Paperclip className="h-5 w-5 shrink-0" />
                        <Camera className="h-[18px] w-[18px] shrink-0" />
                      </div>
                    </div>
                  </div>
                </div>

                  {/* <p className="mt-4 text-[12.5px] font-medium text-slate-500">This experience may look different across devices.</p> */}
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/80 bg-white px-6 py-4 dark:border-white/[0.06] dark:bg-[#141721]">
          {/* <button
            onClick={refetch}
            disabled={isLoading || isFetching}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:bg-[#181b26] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
            title="Reload from Meta"
          >
            <RefreshCw
              className={`h-4.5 w-4.5 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button> */}

          <Button
            label="Save Changes"
            variant="primary"
            loading={isSaving}
            disabled={isSaving || isLoading || isFetching}
            onClick={handleSave}
            icon={<Save size={16} />}
          />
        </div>

      </div>
    </div>
  )
}

