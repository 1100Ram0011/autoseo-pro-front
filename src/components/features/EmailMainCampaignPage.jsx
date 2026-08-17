import React, { useState, lazy, Suspense } from 'react'
import { Mail, LayoutTemplate, Megaphone, Sparkle, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { FaEnvelope } from 'react-icons/fa'
import AIGeneratedEmailTemplates from './emailTemplate/components/AIGeneratedEmailTemplates.jsx'

const EmailTemplatesPage = lazy(() =>
  import('./emailTemplate/EmailTemplatesPage.jsx')
)
const EmailCampaignPage = lazy(() =>
  import('./emailCampaign/EmailCampaignPage.jsx')
)
const ConnectMails = lazy(() =>
  import('./connectEmails/ConnectMails.jsx')
)

const TABS = [
  {
    key: 'connectmails',
    label: 'Connect Email',
    subLabel: 'Email Integrations',
    Description: 'Connect your preferred email provider to start sending automated campaigns and messages directly from your own domain.',
    icon: Mail,
  },
  {
    key: 'templates',
    label: 'Custom Templates',
    subLabel: 'Customized Templates',
    Description: 'Create and manage custom email templates.',
    icon: LayoutTemplate,
  },
  {
    key: 'aiTemplates',
    label: 'Ai Templates',
    subLabel: 'Ai Generated Templates',
    Description: 'Create and manage ai email templates.',
    icon: Sparkles,
  },
  {
    key: 'campaigns',
    label: 'Campaigns',
    subLabel: 'Email Campaigns',
    Description: 'Schedule and manage your email campaigns.',
    icon: Megaphone,
  },
]

const EmailMainCampaignPage = () => {
  const [activeTab, setActiveTab] = useState('connectmails')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const activeItemClasses = `
    relative overflow-hidden rounded-md
    bg-[var(--app-profile-active-bg)]
    text-[var(--app-profile-link-text)]
    before:absolute before:bottom-0 before:left-0 before:top-0
    before:w-[7px] before:rounded-r-full
    before:bg-[var(--app-profile-active-border)]
  `
  const inactiveItemClasses = `
    rounded-md
    text-[var(--app-profile-title-text)]
    hover:bg-[var(--app-brand-surface-alt)]
    hover:text-[var(--app-brand-text)]
  `
  const activeIconClasses = `
    text-[var(--app-profile-btn-bg)]
  `
  const inactiveIconClasses = `
    text-[var(--app-profile-title-text)]
    transition-colors
    group-hover:text-[var(--app-brand-text)]
  `

  return (
    <div className="flex h-full bg-[var(--app-pages-bg)]">
      {/* ───────── LEFT SIDEBAR ───────── */}
      <aside className={`hidden sm:flex relative flex-col border-r border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Header */}
        <div className={`flex h-16 shrink-0 items-center gap-3 border-b border-[var(--app-pages-border)] px-4 ${isSidebarOpen ? 'justify-start' : 'justify-center px-0'}`}>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.1)] ${!isSidebarOpen && 'mx-auto'}`}>
            <FaEnvelope size={18} className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
          </div>
          <div className={`flex flex-1 flex-col gap-1 overflow-hidden ${isSidebarOpen ? 'block' : 'hidden'}`}>
            <span className="truncate text-base font-semibold tracking-tight text-[var(--app-pages-text)]">
              Email Campaigns
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-2 ${isSidebarOpen ? 'p-3' : 'p-2'}`}>
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key

            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`group flex w-full items-center gap-3 font-medium transition-all duration-200 ${isSidebarOpen ? 'justify-start px-4 py-3 text-sm' : 'justify-center p-3'} ${isActive
                  ? activeItemClasses
                  : inactiveItemClasses
                  }`}
              >
                <Icon
                  className={`flex-shrink-0 transition-colors ${isSidebarOpen ? 'h-4 w-4' : 'h-5 w-5'} ${isActive
                    ? activeIconClasses
                    : inactiveIconClasses
                    }`}
                />
                <span className={`truncate ${isSidebarOpen ? 'block' : 'hidden'}`}>{label}</span>

                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && (
                  <div className="pointer-events-none absolute left-full ml-3 hidden sm:group-hover:block z-50 rounded-md bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-pages-text)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
                    {label}
                    <div className="absolute left-0 top-1/2 -ml-1 -mt-1 h-2 w-2 rotate-45 bg-[var(--app-pages-bg)]"></div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Collapse Button */}
        <div className="p-2 border-t border-[var(--app-pages-border)] mt-auto">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`group relative flex w-full items-center gap-3 rounded-lg font-medium transition-all text-[var(--app-pages-subhead-text)] hover:text-[var(--app-pages-text)] hover:bg-[var(--app-surface-glass-border)] ${isSidebarOpen ? 'justify-start px-4 py-3 text-sm' : 'justify-center p-3'}`}
          >
            {isSidebarOpen ? <ChevronLeft className={`flex-shrink-0 transition-colors ${isSidebarOpen ? 'h-4 w-4' : 'h-5 w-5'}`} /> : <ChevronRight className={`flex-shrink-0 transition-colors ${isSidebarOpen ? 'h-4 w-4' : 'h-5 w-5'}`} />}
            <span className={`truncate ${isSidebarOpen ? 'block' : 'hidden'}`}>
              Collapse
            </span>

            {/* Tooltip for collapsed state */}
            {!isSidebarOpen && (
              <div className="pointer-events-none absolute left-full ml-3 hidden sm:group-hover:block z-50 rounded-md bg-[var(--app-pages-bg)] px-2.5 py-1.5 text-xs font-medium text-[var(--app-pages-text)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 whitespace-nowrap">
                Expand
                <div className="absolute left-0 top-1/2 -ml-1 -mt-1 h-2 w-2 rotate-45 bg-[var(--app-pages-bg)]"></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ───────── MAIN CONTENT ───────── */}
      <div className="themed-scrollbar flex flex-1 flex-col p-1 overflow-hidden rounded-xl text-base bg-[var(--app-pages-bg)] ">
        {/* Mobile Tabs */}
        <div className="sm:hidden border-b  border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
          <div className="flex overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`whitespace-nowrap flex items-center gap-4 px-4 py-3 text-xs font-medium ${isActive
                    ? 'text-[var(--app-brand-primary)] border-b-2 border-[var(--app-brand-primary)]'
                    : 'text-[var(--app-pages-subhead-text)]'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Suspense fallback={<div className="flex items-center justify-center p-6">
            <Loader2 size={50} className="h-10 w-10 animate-spin text-[var(--app-brand-primary)]" />
          </div>}>
            {activeTab === 'connectmails' && <ConnectMails />}
            {activeTab === 'campaigns' && <EmailCampaignPage />}
            {activeTab === 'templates' && <EmailTemplatesPage />}
            {activeTab === 'aiTemplates' && <AIGeneratedEmailTemplates />}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default EmailMainCampaignPage
