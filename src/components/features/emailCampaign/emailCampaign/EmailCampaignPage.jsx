import { useState, useEffect } from 'react'
import { useGetEmailCampaignsQuery } from '../../../redux/apis/emailCampaignApi'
import { getSocket } from '@/services/socket.service'

import CampaignTable from './components/CampaignTable'
import CampaignStats from './components/CampaignStats'
import DynamicEmailCampaignModal from './components/DynamicEmailCampaignModal'
import CampaignSkeleton from './components/CampaignSkeleton'
import EmailCampaignReportDrawer from './components/EmailCampaignReportDrawer'
import { useSelector } from 'react-redux'
import DemoAnimatedAuthModal from '@/ReUseAbleComponents/DemoAnimatedAuthModal'
import AuthPage from '@/pages/user/AuthPage'
import { useTheme } from '@/Components/global/theme-provider'
import { Search, RefreshCw, Calendar, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'

export default function EmailCampaignPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState(null)
  const { isDark } = useTheme()

  const {
    data: campaignsData,
    isLoading,
    isError,
    refetch,
    isFetching
  } = useGetEmailCampaignsQuery()

  const socket = getSocket()

  useEffect(() => {
    if (!socket) return

    let timeoutId;
    const onCampaignUpdated = (data) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        refetch()
      }, 500)
    }

    socket.on('campaign:updated', onCampaignUpdated)
    return () => {
      socket.off('campaign:updated', onCampaignUpdated)
      clearTimeout(timeoutId)
    }
  }, [socket, refetch])

  const [showAuthModal, setShowAuthModal] = useState(false)
  const reduxUser = useSelector((state) => state.auth?.user)

  // Filters State
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [channelFilter, setChannelFilter] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  
  // Pagination State
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Data processing
  const rawCampaigns = campaignsData?.campaigns || []
  
  // Get unique providers/senders for the dropdown
  const senders = Array.from(new Set(rawCampaigns.map(c => c.provider || 'Unknown').filter(Boolean)))

  const filteredCampaigns = rawCampaigns.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                        c.subject?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter ? c.status?.toLowerCase() === statusFilter.toLowerCase() : true;
    
    const matchChannel = channelFilter ? (c.provider === channelFilter || c.senderEmail === channelFilter) : true;

    let matchDate = true;
    if (dateFrom || dateTo) {
      const cDate = new Date(c.createdAt || c.scheduledAt);
      if (dateFrom) {
         matchDate = matchDate && (cDate >= new Date(dateFrom));
      }
      if (dateTo) {
         const to = new Date(dateTo);
         to.setHours(23,59,59,999);
         matchDate = matchDate && (cDate <= to);
      }
    }

    return matchSearch && matchStatus && matchChannel && matchDate;
  });

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize) || 1;
  const currentCampaigns = filteredCampaigns.slice((page - 1) * pageSize, page * pageSize);

  const handleOpenCreateModel = () => {
    setIsModalOpen(true)
  }

  const handleOnRefresh = () => {
    if (reduxUser?.isGuest) {
      setShowAuthModal(true)
      return
    }
    refetch()
  }

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] overflow-hidden relative transition-colors duration-200 font-sans">
        
        {/* ── Page Header ── */}
        <div className="px-2 pt-2 pb-2 shrink-0 bg-[var(--app-pages-bg)] border-b border-[var(--app-pages-border)] my-2">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-[var(--app-pages-text)]">Email Campaigns</h1>
                    <p className="text-[var(--app-pages-subhead)] text-xs mt-0.5">Send bulk email messages to your contacts</p>
                </div>
                <button 
                    onClick={handleOpenCreateModel}
                    className="flex shrink-0 whitespace-nowrap items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer border-none text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90"
                >
                    <Plus className="w-4 h-4" />
                    Create Campaign
                </button>
            </div>

            {/* Executive Summary Stats Cards */}
            <div className="mb-4">
                <CampaignStats campaigns={rawCampaigns} />
            </div>
        </div>

        {/* ── Table & Filter Panel ── */}
        <div className="flex-1 mx-2 sm:mx-6 mb-6 flex flex-col overflow-hidden rounded-xl border border-[var(--app-pages-border)] bg-[var(--app-pages-card)] relative">
            
            {/* Search & Select Filters */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--app-pages-bg)] border-b border-[var(--app-pages-border)] shrink-0 flex-wrap">
                
                {/* Search */}
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--app-pages-subhead)] pointer-events-none" />
                    <input 
                        value={search} 
                        onChange={e => { setSearch(e.target.value); setPage(1); }} 
                        placeholder="Search by campaign name, template..."
                        className="pl-8 pr-3 py-1.5 w-full sm:w-64 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-subhead-text)] text-xs placeholder-[var(--app-pages-subhead)] focus:outline-none focus:border-blue-500 transition" 
                    />
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-1.5 text-xs text-[var(--app-pages-text)]">
                    <span>Status:</span>
                    <select 
                        value={statusFilter} 
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] text-xs focus:outline-none cursor-pointer"
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="queued">Queued</option>
                        <option value="processing">Processing</option>
                        <option value="sending">Sending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="paused">Paused</option>
                    </select>
                </div>

                {/* Channel Selector */}
                <div className="flex items-center gap-1.5 text-xs text-[var(--app-pages-text)]">
                    <span>From Email:</span>
                    <select 
                        value={channelFilter} 
                        onChange={e => { setChannelFilter(e.target.value); setPage(1); }}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] text-xs focus:outline-none cursor-pointer"
                    >
                        <option value="">All</option>
                        {senders.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                {/* Date Picker Filter */}
                <div className="flex items-center gap-1.5 text-xs text-[var(--app-pages-text)]">
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] text-xs px-2.5 py-1.5 shadow-sm hover:border-blue-500/50 transition-all">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0 pointer-events-none" />
                        <div className="relative flex items-center">
                            <input 
                                type="date" 
                                value={dateFrom}
                                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs outline-none border-none cursor-pointer p-0 w-[100px] font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                style={{ colorScheme: isDark ? 'dark' : 'light' }}
                            />
                        </div>
                        <span className="text-slate-400 text-xs font-semibold px-0.5 pointer-events-none">to</span>
                        <div className="relative flex items-center">
                            <input 
                                type="date" 
                                value={dateTo}
                                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs outline-none border-none cursor-pointer p-0 w-[100px] font-medium [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                style={{ colorScheme: isDark ? 'dark' : 'light' }}
                            />
                        </div>
                        {(dateFrom || dateTo) && (
                            <button
                                type="button"
                                onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}
                                className="ml-1 text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Clear date filter"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Refresh & Reset Buttons */}
                <div className="ml-auto flex items-center gap-2">
                    <button 
                        onClick={() => { handleOnRefresh() }}
                        className="px-3 h-8 rounded-lg bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] hover:text-blue-500 hover:border-blue-500/30 flex items-center gap-1.5 justify-center transition cursor-pointer text-xs font-semibold"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-blue-500" : ""}`} /> {isFetching ? "Syncing..." : "Sync"}
                    </button>
                </div>
            </div>

            {/* Pagination Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 bg-[var(--app-pages-bg)] border-b border-[var(--app-pages-border)] shrink-0 gap-4 py-2">
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--app-pages-text)] shrink-0 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5">
                        <span>Show</span>
                        <select 
                            value={pageSize} 
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setPage(1);
                            }}
                            className="px-2 py-1 rounded bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] focus:outline-none cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="font-semibold text-[var(--app-pages-text)]">
                        Showing {filteredCampaigns.length > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filteredCampaigns.length)} of {filteredCampaigns.length.toLocaleString()} results
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            className="p-1 rounded bg-[var(--app-pages-bg)] border border-[var(--app-pages-border)] text-[var(--app-pages-text)] hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                            const p = start + i;
                            if (p > totalPages) return null;
                            const isActive = page === p;
                            return (
                                <button 
                                    key={p} 
                                    onClick={() => setPage(p)} 
                                    className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold border-none transition cursor-pointer ${
                                        isActive 
                                            ? "bg-blue-600 text-white shadow-sm" 
                                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            className="p-1 rounded bg-white dark:bg-[#141724] border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="flex-1 overflow-auto bg-[var(--app-pages-bg)] min-h-[50vh]">
              {isLoading ? (
                <CampaignSkeleton />
              ) : isError ? (
                <div className="p-6 text-sm text-[var(--app-pages-text)]">
                  Failed to load campaigns.
                </div>
              ) : (
                <CampaignTable
                  campaigns={currentCampaigns}
                  isGuest={reduxUser?.isGuest}
                  onRequireAuth={() => setShowAuthModal(true)}
                  onViewLogs={(id) => setSelectedCampaignId(id)}
                />
              )}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <DynamicEmailCampaignModal
            campaignType="email"
            onClose={() => setIsModalOpen(false)}
            onRequireAuth={() => { setIsModalOpen(false); setShowAuthModal(true) }}
          />
        )}

        {selectedCampaignId && (
          <EmailCampaignReportDrawer
            campaign={rawCampaigns.find(c => c._id === selectedCampaignId)}
            onClose={() => setSelectedCampaignId(null)}
          />
        )}



      {showAuthModal && (
        <DemoAnimatedAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        >
          <AuthPage onSuccess={() => setShowAuthModal(false)} />
        </DemoAnimatedAuthModal>
      )}
    </>
  )
}
