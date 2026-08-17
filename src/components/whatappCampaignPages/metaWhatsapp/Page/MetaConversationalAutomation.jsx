import { useState, useEffect, useCallback } from 'react'
import { useOutletContext, Link } from '@/components/react-router-dom'
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
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import {
  useGetConversationalAutomationQuery,
  useUpdateConversationalAutomationMutation,
} from '@/redux/apis/metaWhatsapp.api'

export default function MetaConversationalAutomation(props) {
  const context = useOutletContext() || {}
  const selectedNumber = props.selectedNumber || context.selectedNumber
  const whatsappNumbers = props.whatsappNumbers || context.whatsappNumbers || []
  const setSelectedNumber = props.setSelectedNumber || context.setSelectedNumber

  const numberId = selectedNumber?.phoneNumberId || null
  const numberVal = selectedNumber?._id || ''

  // Fetch conversational automation from backend/Meta
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

  // Sync form states with query data
  useEffect(() => {
    if (automationData?.data) {
      setPrompts(automationData.data.prompts || [])
      setCommands(automationData.data.commands || [])
    } else {
      setPrompts([])
      setCommands([])
    }
  }, [automationData])

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
    setCommands([...commands, { command_name: '', command_description: '' }])
  }

  const handleCommandChange = (index, field, value) => {
    const updated = [...commands]
    let val = value
    if (field === 'command_name') {
      // Lowercase and alphanumeric only for command name
      val = value.toLowerCase().replace(/[^a-z0-9]/g, '')
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
      toast.error('Please select a WhatsApp number first.')
      return
    }

    // Clean arrays
    const cleanPrompts = prompts.filter((p) => p.trim() !== '')
    const cleanCommands = commands.filter(
      (c) => c.command_name.trim() !== '' && c.command_description.trim() !== ''
    )

    // Validation
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
        prompts: cleanPrompts,
        commands: cleanCommands,
      }).unwrap()
      toast.success(
        'Conversational automation updated on Meta and saved locally.'
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
    <div className="flex h-full flex-col space-y-6 bg-slate-50 dark:bg-background p-6 text-slate-900 dark:text-slate-100">
      {/* Header Toolbar */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 dark:border-border pb-5 md:flex-row md:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-6 w-6 text-[#25d366]" />
            Conversational Components
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-muted-foreground">
            Configure native Ice Breakers (prompts) and Slash Commands to guide
            customers initiating chat threads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={numberVal}
            onChange={(e) => {
              const num = whatsappNumbers?.data?.find(
                (n) => n._id === e.target.value
              )
              setSelectedNumber(num)
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

          <button
            onClick={refetch}
            disabled={!numberId || isLoading || isFetching}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-input bg-card text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
            title="Reload from Meta"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
          </button>

          <button
            onClick={handleSave}
            disabled={!numberId || isSaving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#25d366] to-[#0e7a52] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.25)] transition-all hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Error state if no number selected */}
      {!numberId && (
        <div className="flex flex-col justify-between gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-600 dark:text-yellow-400 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">
              {whatsappNumbers?.data?.length === 0
                ? 'No Meta WhatsApp Business numbers connected to MyTekAI. Connect your number via Meta Integration first.'
                : 'Please select a WhatsApp Business Number from the top bar to configure conversational automation.'}
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

      {/* Main Workspace Layout */}
      <div className="grid min-h-0 grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Configuration Panels (Left 7 Columns) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Ice Breakers Panel */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#25d366]" />
                <h2 className="text-lg font-semibold text-foreground">
                  Ice Breakers (Prompts)
                </h2>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {prompts.length}/4
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Pre-written clickable prompts shown to first-time chat users.
              Tapping immediately sends the selected text.
            </p>

            <div className="space-y-3">
              {prompts.map((prompt, index) => (
                <div key={index} className="group flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) =>
                        handlePromptChange(index, e.target.value)
                      }
                      placeholder={`Prompt #${index + 1} e.g. Book a consultation`}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                      maxLength={80}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-muted-foreground">
                      {prompt.length}/80
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemovePrompt(index)}
                    className="text-destructive/80 hover:bg-destructive/10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {prompts.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No prompts defined. Tapping "+ Add Prompt" below to create
                    some.
                  </p>
                </div>
              )}

              {prompts.length < 4 && (
                <button
                  onClick={handleAddPrompt}
                  disabled={!numberId}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-sm font-medium text-foreground transition-all hover:border-[#25d366] hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                  Add Prompt
                </button>
              )}
            </div>
          </div>

          {/* Slash Commands Panel */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-[#25d366]" />
                <h2 className="text-lg font-semibold text-foreground">
                  Slash Commands
                </h2>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {commands.length} Commands
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Create keyboard shortcuts (e.g., /pricing) with clean descriptions
              to assist users during active chats.
            </p>

            <div className="space-y-4">
              {commands.map((cmd, index) => (
                <div
                  key={index}
                  className="group relative grid grid-cols-1 gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-12"
                >
                  <div className="md:col-span-4">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Command
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-mono text-sm text-muted-foreground">
                        /
                      </span>
                      <input
                        type="text"
                        value={cmd.command_name}
                        onChange={(e) =>
                          handleCommandChange(
                            index,
                            'command_name',
                            e.target.value
                          )
                        }
                        placeholder="pricing"
                        className="h-10 w-full rounded-lg border border-input bg-background pl-6 pr-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                        maxLength={32}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-7">
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Description
                    </label>
                    <input
                      type="text"
                      value={cmd.command_description}
                      onChange={(e) =>
                        handleCommandChange(
                          index,
                          'command_description',
                          e.target.value
                        )
                      }
                      placeholder="View current product pricing list"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                      maxLength={128}
                    />
                  </div>
                  <div className="flex items-end justify-center md:col-span-1">
                    <button
                      onClick={() => handleRemoveCommand(index)}
                      className="text-destructive/80 hover:bg-destructive/10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-transparent transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {commands.length === 0 && (
                <div className="rounded-xl border border-dashed border-border py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No commands configured. Tap "+ Add Command" below to
                    configure slash actions.
                  </p>
                </div>
              )}

              <button
                onClick={handleAddCommand}
                disabled={!numberId}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input text-sm font-medium text-foreground transition-all hover:border-[#25d366] hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
                Add Slash Command
              </button>
            </div>
          </div>
        </div>

        {/* Smartphone Simulator Preview (Right 5 Columns) */}
        <div className="flex justify-center lg:col-span-5">
          <div className="relative flex aspect-[9/18] w-full max-w-[340px] flex-col overflow-hidden rounded-[36px] border-[10px] border-slate-800 bg-[#ece5dd] shadow-2xl">
            {/* Status bar */}
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

            {/* WhatsApp Chat Body */}
            <div className="relative flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto p-3">
              {mockMessages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
                  <Info className="mb-2 h-8 w-8 text-[#075e54]/30" />
                  <p className="text-[11px] font-medium text-slate-500/70">
                    This is a simulator to preview your configured components.
                    Type in the input or click prompts to simulate.
                  </p>
                </div>
              ) : (
                mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] rounded-lg p-2 text-xs leading-normal shadow-[0_1px_0.5px_rgba(0,0,0,0.15)] ${
                      msg.sender === 'user'
                        ? 'self-end rounded-tr-none bg-[#dcf8c6] text-slate-800'
                        : 'self-start rounded-tl-none border border-slate-100 bg-white text-slate-800'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                ))
              )}

              {/* Slash Command Autocomplete suggestions Overlay */}
              {showMockCommands && commands.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Commands suggestions
                    </span>
                  </div>
                  <div className="max-h-[140px] divide-y divide-slate-100 overflow-y-auto">
                    {commands.map((cmd, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleSendMockMessage(`/${cmd.command_name}`)
                        }
                        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-slate-50"
                      >
                        <span className="font-mono text-xs font-semibold text-[#075e54]">
                          /{cmd.command_name}
                        </span>
                        <span className="truncate text-[10px] text-slate-500">
                          {cmd.command_description || 'No description provided'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prompts Overlay (Ice Breakers) - Displayed only if no user messages sent yet */}
            {mockMessages.length === 0 && prompts.length > 0 && (
              <div className="z-10 shrink-0 space-y-2 border-t border-slate-200/50 bg-slate-100/50 bg-transparent px-3 py-2 backdrop-blur-sm">
                <p className="mb-1 px-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Suggested Prompts
                </p>
                <div className="flex max-h-[120px] flex-col gap-1.5 overflow-y-auto">
                  {prompts
                    .filter((p) => p.trim() !== '')
                    .map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTapPrompt(p)}
                        className="w-full truncate rounded-lg border border-[#25d366]/30 bg-white px-2.5 py-1.5 text-left text-[11px] font-semibold text-[#075e54] shadow-sm transition-all hover:border-[#25d366] active:scale-[0.98]"
                      >
                        {p}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* WhatsApp Input Footer */}
            <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-[#f0f0f0] p-2">
              <div className="flex min-w-0 flex-1 items-center rounded-full bg-white px-3 py-1 shadow-sm">
                <input
                  type="text"
                  value={mockInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && handleSendMockMessage()
                  }
                  placeholder="Type a message..."
                  className="w-full border-none bg-transparent py-1 text-xs text-slate-700 placeholder-slate-400 outline-none"
                />
                <span className="ml-1 shrink-0 select-none font-mono text-sm font-bold text-slate-400">
                  /
                </span>
              </div>
              <button
                onClick={() => handleSendMockMessage()}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#128c7e] text-white transition-all hover:bg-[#075e54] active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
