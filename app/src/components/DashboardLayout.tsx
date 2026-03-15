import { useState, useEffect, useCallback, memo, useRef, Suspense } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  ArrowLeftRight,
  History,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Bell,
  Menu,
  X,
  TrendingUp,
  Users,
  Bitcoin,
  Crown,
  Activity,
  Zap,
  MailWarning,
  Loader2,
  Shield,
  Wallet,
  Settings,
  HelpCircle,
  Star,
  FileText,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { authApi, userApi } from '@/lib/apiClient'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

// ============================================
// NAVIGATION ITEM COMPONENT - Compact
// ============================================
interface NavItemProps {
  to: string
  icon: React.ElementType
  label: string
  isActive: boolean
  badge?: number
  isCollapsed: boolean
  onClick?: () => void
}

const NavItem = memo(function NavItem({
  to,
  icon: Icon,
  label,
  isActive,
  badge,
  isCollapsed,
  onClick
}: NavItemProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Link to={to} className="block" onClick={onClick}>
      <motion.div
        whileHover={{ x: isCollapsed ? 0 : 2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative flex items-center rounded-lg transition-all duration-200',
          isCollapsed
            ? 'justify-center px-0 py-1.5'
            : 'gap-2 px-3 py-2.5',
          isActive
            ? 'text-white'
            : isDark
              ? 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-emerald-600'
        )}
      >
        {/* Animated active pill background — wraps tightly around icon when collapsed */}
        {isActive && !isCollapsed && (
          <motion.div
            layoutId="activeNavPill"
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-md shadow-emerald-500/20"
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          />
        )}
        <div
          className={cn(
            'relative z-10 w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200',
            isCollapsed && isActive
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20'
              : isActive
                ? 'bg-white/20'
                : isDark
                  ? 'bg-slate-800 group-hover:bg-emerald-500/20'
                  : 'bg-slate-100 group-hover:bg-emerald-500/10'
          )}
        >
          <Icon className="w-4 h-4" />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="relative z-10 font-medium text-sm whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
})

// ============================================
// EMAIL VERIFICATION BANNER
// ============================================
function EmailVerificationBanner({ email }: { email: string }) {
  const [isResending, setIsResending] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleResend = async () => {
    setIsResending(true)
    try {
      await authApi.resendVerification(email)
      toast.success('Verification email sent! Check your inbox.')
    } catch {
      toast.error('Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <MailWarning className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            Please verify your email address to unlock all features.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            {isResending ? (
              <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Sending...</span>
            ) : 'Resend email'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-500/60 hover:text-amber-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// SIDEBAR ANIMATED BACKGROUND COMPONENTS
// ============================================
const SidebarParticles = memo(function SidebarParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    // Respect reduced-motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    const PARTICLE_COUNT = 20

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(16, 185, 129, ${p.opacity * 0.5})` : `rgba(16, 185, 129, ${p.opacity * 1.2})`
        ctx.fill()
      })
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${(1 - dist / 80) * (isDark ? 0.12 : 0.15)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    animate()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(animationId); ro.disconnect() }
  }, [isDark])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
})

const SidebarOrbs = memo(function SidebarOrbs() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ y: [0, -15, 0], opacity: isDark ? [0.08, 0.14, 0.08] : [0.25, 0.45, 0.25], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-emerald-400 blur-3xl"
        style={{ opacity: 0 }}
      />
      <motion.div
        animate={{ y: [0, 10, 0], opacity: isDark ? [0.06, 0.12, 0.06] : [0.2, 0.35, 0.2], scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -right-8 w-24 h-24 rounded-full bg-teal-400 blur-3xl"
        style={{ opacity: 0 }}
      />
      <motion.div
        animate={{ y: [0, -10, 0], opacity: isDark ? [0.05, 0.1, 0.05] : [0.15, 0.3, 0.15], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-20 -left-6 w-28 h-28 rounded-full bg-cyan-400 blur-3xl"
        style={{ opacity: 0 }}
      />
    </div>
  )
})

const SidebarUserCard = memo(function SidebarUserCard({ user, isCollapsed }: { user: any; isCollapsed: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
  const hasImage = !!user?.profileImage

  if (isCollapsed) {
    return (
      <div className="p-2 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-emerald-500/20"
        >
          {hasImage ? (
            <img src={`${API_BASE}${user.profileImage}`} alt="" className="w-full h-full object-cover" />
          ) : initials}
        </motion.button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mx-3 mb-3 p-3 rounded-xl border backdrop-blur-sm cursor-pointer transition-all duration-200',
        isDark ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/80' : 'bg-white/60 border-slate-200/60 hover:bg-white/80'
      )}
      onClick={() => navigate('/profile')}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-emerald-500/20 flex-shrink-0">
          {hasImage ? (
            <img src={`${API_BASE}${user.profileImage}`} alt="" className="w-full h-full object-cover" />
          ) : initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-emerald-500 truncate flex items-center gap-1">
            {user?.role === 'admin' ? <><Crown className="w-3 h-3" /> Admin</> : <><Zap className="w-3 h-3" /> Member</>}
          </p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 rotate-[-90deg]" />
      </div>
    </motion.div>
  )
})

// ============================================
// COMPACT LOGO COMPONENT
// ============================================
const Logo = memo(function Logo({ isCollapsed }: { isCollapsed: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="flex items-center gap-2 group">
      <motion.div
        whileHover={{ rotate: 10, scale: 1.05 }}
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0"
      >
        <Bitcoin className="w-5 h-5 text-white" />
      </motion.div>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
          >
            <span className={cn(
              'font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r',
              isDark
                ? 'from-white to-slate-400'
                : 'from-slate-900 to-slate-600'
            )}>
              JD<span className="text-emerald-500">Exchange</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ============================================
// NOTIFICATION LINK RESOLVER
// ============================================
function getNotificationLink(notification: any): string | null {
  const title = (notification.title || '').toLowerCase()
  const message = (notification.message || '').toLowerCase()

  // Order-related
  if (title.includes('order')) return '/orders'

  // KYC / Verification
  if (title.includes('kyc') || title.includes('verification') || title.includes('identity')) return '/kyc'

  // Welcome / Onboarding
  if (title.includes('welcome')) return '/dashboard'

  // Security: password, 2FA
  if (title.includes('password') || title.includes('2fa') || title.includes('two-factor')) return '/settings'

  // Account suspended / reactivated
  if (title.includes('account suspended') || title.includes('account reactivated')) return '/profile'

  // Email verified
  if (title.includes('email verified')) return '/dashboard'

  // Review
  if (title.includes('review')) return '/reviews'

  // Support ticket
  if (title.includes('ticket') || title.includes('reply')) return '/support'

  // Admin-specific
  if (title.includes('new kyc submission')) return '/admin/users'
  if (title.includes('new order received')) return '/admin/orders'

  return null
}

// ============================================
// COMPACT NOTIFICATION DROPDOWN
// ============================================
const NotificationDropdown = memo(function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadNotifications = useCallback(async () => {
    try {
      const response = await userApi.getNotifications()
      const raw = response.data?.data?.notifications || []
      // Normalize isRead (int 0/1 from backend) → read (boolean) for frontend
      setNotifications(raw.map((n: any) => ({ ...n, read: !!n.isRead || !!n.read })))
    } catch (e) {
      // Silently fail - notifications are non-critical
    }
  }, [])

  // Initial load + poll every 30 seconds
  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  // Refetch when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
      setExpandedId(null)
    }
  }, [isOpen, loadNotifications])

  const markAsRead = async (id: string) => {
    try {
      await userApi.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (e) {
      // Silently fail
    }
  }

  const markAllRead = async () => {
    try {
      await userApi.markNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e) {
      // Silently fail
    }
  }

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    if (!notification.read) markAsRead(notification.id)

    const link = getNotificationLink(notification)
    if (link) {
      setIsOpen(false)
      navigate(link)
    }
  }

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setExpandedId(prev => prev === id ? null : id)
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <motion.button 
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          {unreadCount > 0 && (
            <motion.span 
              className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold shadow-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); markAllRead() }}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-medium cursor-pointer"
            >
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 15).map((notification) => {
              const link = getNotificationLink(notification)
              const isExpanded = expandedId === notification.id
              const messageLength = (notification.message || '').length
              const isTruncated = messageLength > 80

              return (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group',
                    !notification.read && 'bg-emerald-50/50 dark:bg-emerald-900/10'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNotificationClick(notification) }}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      notification.type === 'success' ? 'bg-emerald-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          'text-sm font-medium',
                          !notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                        )}>
                          {notification.title}
                        </p>
                        {link && (
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        )}
                      </div>
                      <p className={cn(
                        'text-xs text-slate-500 mt-0.5',
                        !isExpanded && 'line-clamp-2'
                      )}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-400">
                          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                        </p>
                        {isTruncated && (
                          <button
                            onClick={(e) => toggleExpand(e, notification.id)}
                            className="text-xs text-emerald-500 hover:text-emerald-600 font-medium"
                          >
                            {isExpanded ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout, isAdmin } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  // Scroll main content to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  // Check screen size and handle mobile state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }, [logout, navigate])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev)
  }, [])

  // Close sidebar when clicking a link on mobile
  const handleMobileNavClick = useCallback(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }, [isMobile])

  // Navigation items
  const userNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/exchange', icon: ArrowLeftRight, label: 'Exchange' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/orders', icon: History, label: 'Orders', badge: 0 },
    { to: '/kyc', icon: Shield, label: 'Verification' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/support', icon: HelpCircle, label: 'Support' },
    { to: '/reviews', icon: Star, label: 'Reviews' },
  ]

  const adminNavItems = [
    { to: '/admin', icon: TrendingUp, label: 'Overview' },
    { to: '/admin/orders', icon: History, label: 'All Orders' },
    { to: '/admin/users', icon: Users, label: 'All Users' },
    { to: '/admin/site-content', icon: FileText, label: 'Site Content' },
  ]

  const isCollapsed = !isSidebarOpen && !isMobile
  const isHoverExpanded = isCollapsed && isHoveringSidebar
  const effectiveCollapsed = isCollapsed && !isHoveringSidebar
  const sidebarWidth = isMobile ? 256 : (isSidebarOpen ? 260 : (isHoveringSidebar ? 260 : 72))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: isMobile && !isSidebarOpen ? -sidebarWidth : 0
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => !isMobile && isCollapsed && setIsHoveringSidebar(true)}
        onMouseLeave={() => setIsHoveringSidebar(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-[1000] shadow-xl',
          isMobile ? 'shadow-2xl' : 'shadow-black/5 dark:shadow-black/20'
        )}
      >
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Solid background base — prevents dark bleed-through on mobile */}
          <div className="absolute inset-0 bg-white dark:bg-slate-900" />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-emerald-50/40 dark:from-slate-900/90 dark:via-slate-800/70 dark:to-slate-900/80" />
          <SidebarOrbs />
          <SidebarParticles />

          {/* Grid pattern overlay — synced with hero */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Subtle gradient border */}
          <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-emerald-500/60 via-teal-500/40 to-cyan-500/60" />

          {/* Logo Section - Compact */}
          <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 relative z-10">
            <Link to="/">
              <Logo isCollapsed={effectiveCollapsed} />
            </Link>
            
            {/* Mobile close button */}
            {isMobile && (
              <motion.button
                onClick={() => setIsSidebarOpen(false)}
                className="ml-auto p-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                whileTap={{ scale: 0.95 }}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-slate-500" />
              </motion.button>
            )}
          </div>

          {/* Navigation - Compact */}
          <div className="p-3 space-y-4 overflow-y-auto flex-1 relative z-10">
            {/* User Section */}
            <div>
              <AnimatePresence>
                {!effectiveCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 px-3"
                  >
                    Trading
                  </motion.p>
                )}
              </AnimatePresence>
              <nav className="space-y-0.5">
                {userNavItems.map((item) => (
                  <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isActive={location.pathname === item.to}
                    badge={item.badge}
                    isCollapsed={effectiveCollapsed}
                    onClick={handleMobileNavClick}
                  />
                ))}
              </nav>
            </div>

            {/* Animated section divider */}
            {isAdmin && (
              <div className="px-3">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
              </div>
            )}

            {/* Admin Section */}
            {isAdmin && (
              <div>
                <AnimatePresence>
                  {!effectiveCollapsed && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-2 px-3"
                    >
                      Admin
                    </motion.p>
                  )}
                </AnimatePresence>
                <nav className="space-y-0.5">
                  {adminNavItems.map((item) => (
                    <NavItem
                      key={item.to}
                      to={item.to}
                      icon={item.icon}
                      label={item.label}
                      isActive={location.pathname === item.to}
                      isCollapsed={effectiveCollapsed}
                      onClick={handleMobileNavClick}
                    />
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* User profile card at bottom */}
          {user && (
            <div className="relative z-10 border-t border-slate-200/60 dark:border-slate-700/40 pt-3">
              <SidebarUserCard user={user} isCollapsed={effectiveCollapsed} />
            </div>
          )}

          {/* Hover expand indicator */}
          <AnimatePresence>
            {isHoverExpanded && !isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-emerald-500/80 text-white text-[10px] rounded-full shadow-md whitespace-nowrap z-20"
              >
                Click to pin
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.div
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : (isSidebarOpen ? 260 : 72)
        }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 flex flex-col min-w-0 min-h-screen"
      >
        {/* Compact Header */}
        <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 flex-shrink-0">
          {/* Subtle gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-cyan-500/40" />
          
          <div className="h-full flex items-center justify-between px-4">
            {/* Left: Toggle & Page Info */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle sidebar"
              >
                <AnimatePresence mode="wait">
                  {isSidebarOpen && !isMobile ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2">
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={location.pathname}
                  className="flex items-center gap-1.5"
                >
                  <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <span className="font-medium text-sm text-slate-900 dark:text-white capitalize">
                    {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Right: Actions - Compact */}
            <div className="flex items-center gap-1">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-0.5 mr-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                  onClick={() => navigate('/exchange')}
                  aria-label="Quick exchange"
                >
                  <Zap className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                  onClick={() => navigate('/orders')}
                  aria-label="Order history"
                >
                  <History className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Toggle theme"
                  >
                    <AnimatePresence mode="wait">
                      {resolvedTheme === 'dark' ? (
                        <motion.div
                          key="moon"
                          initial={{ rotate: -30, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 30, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Moon className="w-4 h-4 text-amber-400" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="sun"
                          initial={{ rotate: 30, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -30, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Sun className="w-4 h-4 text-slate-600" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="w-4 h-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="w-4 h-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="w-4 h-4 mr-2" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <NotificationDropdown />

              {/* User Menu - Compact */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button 
                    className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-sm overflow-hidden">
                      {user?.profileImage ? (
                        <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profileImage}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
                        {user?.firstName}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                      {isAdmin && (
                        <span className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/orders')}>
                    <History className="w-4 h-4 mr-2" />
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Email Verification Banner */}
        {user && !user.emailVerified && user.role !== 'admin' && (
          <EmailVerificationBanner email={user.email} />
        )}

        {/* Page Content */}
        <main ref={mainRef} className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children || (
              <Suspense fallback={
                <div className="flex items-center justify-center py-32">
                  <motion.div
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.div>
                </div>
              }>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                >
                  <Outlet />
                </motion.div>
              </Suspense>
            )}
          </div>
        </main>
      </motion.div>
    </div>
  )
}
