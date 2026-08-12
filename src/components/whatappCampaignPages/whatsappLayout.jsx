import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from '@/components/react-router-dom'
import { useGetWhatsappNumberQuery } from '../../../redux/apis/metaWhatsapp.api'
import {
  MessageSquare,
  LayoutTemplate,
  Users,
  Zap,
  FileText,
  ChevronLeft,
  Sparkles,
  Layers,
  Bot,
  BookOpen,
  Code,
  BotMessageSquare,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { cn } from '@/lib/utils.js'
import ComingSoon from '@/pages/public/ComingSoon'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedNumber as setSelectedNumberAction } from '@/redux/app/whatsappSelectionSlice'
import { useTheme } from '@/components/global/theme-provider'

// ── Reusable Components ──
import SidebarBrand from './metaWhatsapp/Component/SidebarBrand'
import SidebarNavItem from './metaWhatsapp/Component/SidebarNavItem'
import CollapseToggle from './metaWhatsapp/Component/CollapseToggle'
import MobileTopBar from './metaWhatsapp/Component/MobileTopBar'
import MobileDrawer from './metaWhatsapp/Component/MobileDrawer'

const NAV_ITEMS = [
  { id: 'connect', path: 'connect', label: 'Connect', icon: MessageSquare },
  {
    id: 'template',
    path: 'template',
    label: 'Templates',
    icon: LayoutTemplate,
  },
  {
    id: 'template-library',
    path: 'template-library',
    label: 'Template Library',
    icon: BookOpen,
  },
  // { id: 'contacts', path: 'contacts', label: 'Contacts', icon: Users },
  { id: 'campaigns', path: 'campaigns', label: 'Campaigns', icon: Zap },
  { id: 'logs', path: 'logs', label: 'Logs', icon: FileText },
  { id: 'developers', path: 'developers', label: 'Developers', icon: Code },
  // {
  //   id: 'automation',
  //   path: 'automation',
  //   label: 'Ice Breakers',
  //   icon: Sparkles,
  // },
  {
    id: 'chatbot',
    path: 'chatbot',
    label: 'Chat Bot',
    icon: BotMessageSquare,
  },
]

export default function WhatsappLayout() {
  const { isDark } = useTheme()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dispatch = useDispatch()
  const selectedNumber = useSelector(
    (state) => state.whatsappSelection?.selectedNumber
  )
  const setSelectedNumber = (number) =>
    dispatch(setSelectedNumberAction(number))
  const navigate = useNavigate()
  const location = useLocation()

  const {
    data: whatsappNumbers,
    isLoading,
    error,
  } = useGetWhatsappNumberQuery()

  const { user } = useSelector((state) => state.auth)

  const pathSegments = location.pathname.split('/')
  const activeTab =
    NAV_ITEMS.find((item) => pathSegments.includes(item.path))?.id ?? 'template'

  const isDevelopment = process.env.NODE_ENV === 'development'

  const SidebarContent = ({ isMobile = false }) => (
    <aside
      className={cn(
        'relative z-10 flex h-full shrink-0 flex-col',
        'border-border/40 border-r bg-card shadow-sm',
        'transition-[width] duration-300 ease-in-out',
        isMobile ? 'w-72 max-w-[85vw]' : collapsed ? 'w-20' : 'w-[260px]'
      )}
    >
      {/* ── Brand / Number Selector ── */}
      <SidebarBrand
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={() => setMobileOpen(false)}
      />

      {/* ── Nav section label ── */}
      {(!collapsed || isMobile) && (
        <p className="text-muted-foreground/60 px-4 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest">
          Navigation
        </p>
      )}

      {/* ── Nav Items ── */}
      <ScrollArea className="flex-1">
        <ul className="space-y-1.5 px-3 pb-4 pt-1">
          {NAV_ITEMS.filter((fil) => fil.id !== 'developers').map(
            ({ id, path, label, icon }) => (
              <SidebarNavItem
                key={id}
                id={id}
                label={label}
                icon={icon}
                isActive={activeTab === id}
                collapsed={collapsed}
                isMobile={isMobile}
                isDark={isDark}
                onClick={() => {
                  navigate(path)
                  // if (id === 'chatbot') {
                  //   setTimeout(() => {
                  //     setCollapsed(true)
                  //   }, 200)
                  // }
                  if (isMobile) setMobileOpen(false)
                }}
              />
            )
          )}
        </ul>
      </ScrollArea>

      {/* ── Collapse Toggle (desktop only) ── */}
      {!isMobile && (
        <div>
          <div className="py-0.5">
            {NAV_ITEMS.filter((item) => item.id === 'developers').map(
              ({ id, path, label, icon }) => (
                <SidebarNavItem
                  key={id}
                  id={id}
                  label={label}
                  icon={icon}
                  isActive={activeTab === id}
                  collapsed={collapsed}
                  isMobile={isMobile}
                  isDark={isDark}
                  onClick={() => {
                    navigate(path)
                    if (isMobile) setMobileOpen(false)
                  }}
                />
              )
            )}
          </div>
          <CollapseToggle
            collapsed={collapsed}
            onToggle={() => setCollapsed((p) => !p)}
          />
        </div>
      )}
    </aside>
  )

  return (
    <div
      className={cn(
        'whatsapp-theme flex w-full flex-1 flex-col',
        isDark ? 'whatsapp-theme-dark' : 'whatsapp-theme-light'
      )}
    >
      {isDevelopment || user?.role === 'admin' ? (
        <div className="flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden bg-slate-50 dark:bg-[#0c0e14] md:flex-row">
          {/* Mobile top bar */}
          <MobileTopBar onMenuOpen={() => setMobileOpen(true)} />

          {/* Desktop sidebar */}
          <div className="hidden md:flex">
            <SidebarContent />
          </div>

          {/* Mobile drawer */}
          <MobileDrawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            isDark={isDark}
          >
            <SidebarContent isMobile />
          </MobileDrawer>

          {/* Main Content */}
          <main className="flex min-h-0 flex-1 flex-col overflow-auto bg-slate-50 text-slate-900 dark:bg-[#0c0e14] dark:text-slate-100">
            <Outlet
              context={{ selectedNumber, whatsappNumbers, setSelectedNumber }}
            />
          </main>
        </div>
      ) : (
        <div>
          <ComingSoon />
        </div>
      )}
    </div>
  )
}
