import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { adminApi } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Users, TrendingUp, DollarSign, Settings, Clock, ArrowLeft, Shield,
  Crown, Sparkles, BarChart3
} from 'lucide-react'
import AdminCryptoManagement from './AdminCryptoManagement'
import AdminPaymentMethods from './AdminPaymentMethods'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// Dashboard data interfaces
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalOrders: number
  totalVolume: number
  pendingOrders: number
  blockedUsers: number
}

interface Order {
  id: string
  userId: string
  type: string
  crypto: string
  amount: number
  rate: number
  total: number
  status: string
  createdAt: string
  userEmail?: string
  userFirstName?: string
  userLastName?: string
}

interface UserRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  isBlocked: boolean
  kycStatus: string
  createdAt: string
}

// ============================================
// MAGICAL BACKGROUND - Particle Network
// ============================================
function MagicalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()

    const isDark = resolvedTheme === 'dark'

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
    }> = []

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: isDark ? '#10b981' : '#059669'
      })
    }

    let frameCount = 0
    const animate = () => {
      frameCount++
      if (frameCount % 2 === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach((p) => {
          p.x += p.vx
          p.y += p.vy

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fill()
        })

        ctx.globalAlpha = 0.1
        ctx.strokeStyle = isDark ? '#10b981' : '#059669'
        ctx.lineWidth = 0.5

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 100) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [resolvedTheme])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

// ============================================
// FLOATING ORBS - Animated Gradient Orbs
// ============================================
function FloatingOrbs() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className={`absolute -top-20 -right-20 w-[500px] h-[500px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'} rounded-full blur-[100px]`}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className={`absolute -bottom-20 -left-20 w-[400px] h-[400px] ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'} rounded-full blur-[80px]`}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -30, 0],
          y: [0, 30, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isDark ? 'bg-purple-500/5' : 'bg-purple-400/10'} rounded-full blur-[120px]`}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  )
}

// ============================================
// ANIMATED STAT CARD with 3D Tilt & Glow
// ============================================
function AnimatedStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  trend,
  trendUp,
  delay = 0
}: {
  title: string
  value: string | number
  subtitle: string
  icon: any
  gradient: string
  trend?: string
  trendUp?: boolean
  delay?: number
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative p-6 rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'
        }`}
    >
      {/* Animated gradient background on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />

      {/* Floating particles */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -20],
                x: [0, (i - 1) * 15]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity
              }}
              style={{
                top: '20%',
                left: `${30 + i * 20}%`
              }}
            />
          ))}
        </>
      )}

      <div className="relative z-10">
        {/* SMALL SCREENS: Original layout */}
        <div className="flex md:hidden items-center justify-between">
          <div>
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</p>
            <motion.p
              className="text-3xl font-bold text-slate-900 dark:text-white"
              key={value}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {value}
            </motion.p>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>

            {trend && (
              <motion.div
                className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ y: trendUp ? [0, -2, 0] : [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                </motion.div>
                {trend}
              </motion.div>
            )}
          </div>
          <motion.div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            animate={{
              rotate: isHovered ? [0, -10, 10, 0] : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
        </div>

        {/* MEDIUM & LARGE SCREENS: Creative floating icon design */}
        <div className="hidden md:block relative">
          {/* Floating Icon Container - Top Right Corner */}
          <motion.div
            className={`absolute -top-2 -right-2 w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl z-0`}
            animate={{
              y: isHovered ? [0, -8, 0] : [0, -4, 0],
              rotate: isHovered ? [0, 5, -5, 0] : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 0.5 },
              scale: { duration: 0.3 }
            }}
            style={{
              boxShadow: isHovered
                ? `0 20px 40px -10px ${gradient.includes('emerald') ? 'rgba(16, 185, 129, 0.5)' : gradient.includes('amber') ? 'rgba(245, 158, 11, 0.5)' : gradient.includes('blue') ? 'rgba(59, 130, 246, 0.5)' : 'rgba(139, 92, 246, 0.5)'}`
                : '0 10px 30px -10px rgba(0,0,0,0.2)'
            }}
          >
            {/* Inner glow ring */}
            <div className="absolute inset-1 rounded-xl border-2 border-white/30" />

            {/* Rotating icon */}
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Icon className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-10 2xl:h-10 text-white drop-shadow-lg" />
            </motion.div>

            {/* Sparkle decorations */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 pr-14 lg:pr-16 xl:pr-20">
            <p className={`text-xs lg:text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</p>
            <motion.p
              className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white"
              key={value}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {value}
            </motion.p>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">{subtitle}</p>

            {trend && (
              <motion.div
                className={`flex items-center gap-1 mt-2 text-xs lg:text-sm ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ y: trendUp ? [0, -2, 0] : [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {trendUp ? <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" /> : <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 rotate-180" />}
                </motion.div>
                {trend}
              </motion.div>
            )}
          </div>
        </div>

        {/* Animated bar chart */}
        <div className="flex items-end gap-1 mt-4 h-8">
          {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50].map((height, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-sm ${isHovered ? 'bg-emerald-500/40' : 'bg-emerald-500/20'}`}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{
                delay: delay * 0.1 + i * 0.05,
                duration: 0.5,
                type: 'spring'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// PREMIUM HEADER BANNER
// ============================================
function PremiumHeaderBanner() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-3xl p-6 text-white w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      </div>

      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"
          animate={{
            scale: [1.2, 1, 1.2],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            style={{
              top: `${15 + Math.random() * 70}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Shield className="w-4 h-4 text-yellow-300" />
              </motion.div>
              <span className="text-sm font-medium text-white/90">Admin Access</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 backdrop-blur-sm border border-purple-400/30">
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span className="text-xs font-medium text-purple-100">Pro</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl font-bold mb-2 tracking-tight flex items-center gap-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            Admin Dashboard
          </motion.h1>
          <motion.p
            className="text-white/80 text-sm max-w-xl leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Manage your platform with powerful tools. Track users, orders, and platform performance in real-time.
          </motion.p>
        </div>

        <motion.div
          className="flex items-center gap-2"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/dashboard">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="icon" className="rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20 h-12 w-12">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ============================================
// PREMIUM CHART CARD
// ============================================
function PremiumChartCard({
  title,
  children,
  icon: Icon,
  gradient,
  delay = 0
}: {
  title: string
  children: React.ReactNode
  icon: any
  gradient: string
  delay?: number
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${gradient}`} />

      {/* Animated background on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.05 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.7 }}
      />

      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
            animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0, scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

// ============================================
// PREMIUM TABLE ROW with hover effects
// ============================================
function PremiumTableRow({
  children,
  isDark,
  index = 0
}: {
  children: React.ReactNode
  isDark: boolean
  index?: number
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative border-b transition-all duration-300 cursor-pointer ${isDark ? 'border-slate-700' : 'border-slate-200'
        } ${isHovered ? (isDark ? 'bg-slate-700/50' : 'bg-slate-100/50') : ''}`}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.tr>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminEnhancedDashboard() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalUsers: 0, activeUsers: 0, totalOrders: 0, totalVolume: 0, pendingOrders: 0, blockedUsers: 0
  })
  const [chartData, setChartData] = useState<Array<{ name: string; volume: number; orders: number }>>([])
  const [pendingOrdersList, setPendingOrdersList] = useState<Order[]>([])
  const [recentUsers, setRecentUsers] = useState<UserRecord[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, ordersRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getOrders(),
        adminApi.getUsers()
      ])

      const stats = statsRes.data?.data
      const orders: Order[] = ordersRes.data?.data || []
      const users: UserRecord[] = usersRes.data?.data || []

      // Compute dashboard stats from real data
      const pendingCount = orders.filter((o: Order) => o.status === 'pending').length
      const totalVolume = orders.filter((o: Order) => o.status === 'completed').reduce((sum: number, o: Order) => sum + (o.total || 0), 0)
      const blockedCount = users.filter((u: UserRecord) => u.isBlocked).length

      setDashboardData({
        totalUsers: stats?.totalUsers || users.length,
        activeUsers: stats?.activeUsers || users.filter((u: UserRecord) => !u.isBlocked).length,
        totalOrders: stats?.totalOrders || orders.length,
        totalVolume: stats?.totalVolume || totalVolume,
        pendingOrders: stats?.pendingOrders || pendingCount,
        blockedUsers: stats?.blockedUsers || blockedCount
      })

      // Build chart data from orders (group by month)
      const monthMap: Record<string, { volume: number; orders: number }> = {}
      orders.forEach((o: Order) => {
        const date = new Date(o.createdAt)
        const month = date.toLocaleString('default', { month: 'short' })
        if (!monthMap[month]) monthMap[month] = { volume: 0, orders: 0 }
        monthMap[month].orders += 1
        if (o.status === 'completed') monthMap[month].volume += o.total || 0
      })
      const chartEntries = Object.entries(monthMap).map(([name, data]) => ({ name, ...data }))
      setChartData(chartEntries.length > 0 ? chartEntries : [
        { name: 'No Data', volume: 0, orders: 0 }
      ])

      // Pending orders for the table
      setPendingOrdersList(orders.filter((o: Order) => o.status === 'pending').slice(0, 10))

      // Recent users for the table
      setRecentUsers(users.slice(0, 10))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBlockUser = async (userId: string) => {
    const user = recentUsers.find(u => u.id === userId)
    if (!user) return
    try {
      await adminApi.updateUser(userId, { isBlocked: !user.isBlocked })
      setRecentUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked')
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: 'completed' })
      setPendingOrdersList(prev => prev.filter(o => o.id !== orderId))
      setDashboardData(prev => ({ ...prev, pendingOrders: prev.pendingOrders - 1 }))
      toast.success('Order approved')
    } catch (error) {
      toast.error('Failed to approve order')
    }
  }

  const handleRejectOrder = async (orderId: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: 'rejected', adminNote: 'Rejected by admin' })
      setPendingOrdersList(prev => prev.filter(o => o.id !== orderId))
      setDashboardData(prev => ({ ...prev, pendingOrders: prev.pendingOrders - 1 }))
      toast.success('Order rejected')
    } catch (error) {
      toast.error('Failed to reject order')
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'} relative overflow-hidden`}>
      {/* Background Effects */}
      <FloatingOrbs />
      <div className="absolute inset-0 pointer-events-none">
        <MagicalBackground />
      </div>

      {/* Navigation */}
      <div className={`sticky top-0 z-40 border-b backdrop-blur-xl ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="icon" className="rounded-xl">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <motion.h1
                className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Settings className="w-6 h-6" />
                </motion.div>
                Admin Dashboard
              </motion.h1>
            </div>
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-sm"
              >
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Pro</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Premium Header Banner */}
        <PremiumHeaderBanner />

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <TabsList className={`grid grid-cols-4 gap-4 p-0 bg-transparent h-auto ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              {[
                { value: 'overview', label: 'Overview' },
                { value: 'cryptos', label: 'Cryptocurrencies' },
                { value: 'payments', label: 'Payment Methods' },
                { value: 'users', label: 'Users' }
              ].map((tab) => (
                <motion.div
                  key={tab.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <TabsTrigger
                    value={tab.value}
                    className={`rounded-xl px-6 py-3 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'} transition-all duration-300`}
                  >
                    {tab.label}
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            <TabsContent value="overview" className="space-y-6" asChild>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnimatedStatCard
                title="Total Users"
                value={dashboardData.totalUsers.toLocaleString()}
                subtitle="Across all regions"
                icon={Users}
                gradient="from-emerald-500 via-teal-500 to-cyan-500"
                trend="+12%"
                trendUp={true}
                delay={0}
              />
              <AnimatedStatCard
                title="Total Orders"
                value={dashboardData.totalOrders.toLocaleString()}
                subtitle="All time transactions"
                icon={BarChart3}
                gradient="from-blue-500 via-indigo-500 to-purple-500"
                trend="+28%"
                trendUp={true}
                delay={1}
              />
              <AnimatedStatCard
                title="Total Volume"
                value={`₵${(dashboardData.totalVolume / 1000000).toFixed(1)}M`}
                subtitle="Trading volume"
                icon={DollarSign}
                gradient="from-amber-500 via-orange-500 to-yellow-500"
                trend="+35%"
                trendUp={true}
                delay={2}
              />
              <AnimatedStatCard
                title="Pending Orders"
                value={dashboardData.pendingOrders}
                subtitle="Awaiting action"
                icon={Clock}
                gradient="from-purple-500 via-pink-500 to-rose-500"
                delay={3}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Chart */}
              <PremiumChartCard title="Trading Volume" icon={TrendingUp} gradient="from-emerald-500 to-teal-500" delay={0.4}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
                    <XAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                        borderRadius: '12px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </PremiumChartCard>

              {/* Orders Chart */}
              <PremiumChartCard title="Order Statistics" icon={BarChart3} gradient="from-blue-500 to-indigo-500" delay={0.5}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#475569' : '#e2e8f0'} />
                    <XAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                    <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        border: isDark ? '1px solid #475569' : '1px solid #e2e8f0',
                        borderRadius: '12px'
                      }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </PremiumChartCard>
            </div>

            {/* Pending Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'}`}
            >
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />

              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Pending Orders</h3>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Order ID</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>User</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Type</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Amount</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Status</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrdersList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No pending orders
                          </TableCell>
                        </TableRow>
                      ) : pendingOrdersList.map((order, index) => (
                        <PremiumTableRow key={order.id} isDark={isDark} index={index}>
                          <TableCell className={`font-mono text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.id.slice(0, 8)}...</TableCell>
                          <TableCell className={isDark ? 'text-slate-300' : 'text-slate-700'}>{order.userFirstName} {order.userLastName}</TableCell>
                          <TableCell>
                            <Badge className={order.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'} variant="outline">
                              {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className={isDark ? 'text-slate-300' : 'text-slate-700'}>{order.amount} {order.crypto}</TableCell>
                          <TableCell>
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30" variant="outline">
                              <motion.span
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="mr-1"
                              >
                                ●
                              </motion.span>
                              Pending
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleApproveOrder(order.id)}
                                className="px-3 py-1 rounded-lg text-sm font-medium bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Approve
                              </motion.button>
                              <motion.button
                                onClick={() => handleRejectOrder(order.id)}
                                className="px-3 py-1 rounded-lg text-sm font-medium bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Reject
                              </motion.button>
                            </div>
                          </TableCell>
                        </PremiumTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
              </motion.div>
          </TabsContent>

          <TabsContent value="cryptos" asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AdminCryptoManagement />
            </motion.div>
          </TabsContent>

          <TabsContent value="payments" asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <AdminPaymentMethods />
            </motion.div>
          </TabsContent>

          <TabsContent value="users" asChild>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'}`}
            >
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Users className="w-5 h-5 text-white" />
                    </motion.div>
                    <div>
                      <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        User Management
                      </h2>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Block, unblock, or manage user accounts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className={isDark ? 'border-slate-700' : 'border-slate-200'}>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>User</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Email</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Joined</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Verified</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Status</TableHead>
                        <TableHead className={isDark ? 'text-slate-300' : 'text-slate-700'}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : recentUsers.map((user, index) => (
                        <PremiumTableRow key={user.id} isDark={isDark} index={index}>
                          <TableCell className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{user.firstName} {user.lastName}</TableCell>
                          <TableCell className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{user.email}</TableCell>
                          <TableCell className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={user.emailVerified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'} variant="outline">
                              {user.emailVerified ? '✓ Verified' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={user.isBlocked ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} variant="outline">
                              {user.isBlocked ? (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center gap-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  Blocked
                                </motion.span>
                              ) : (
                                <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center gap-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Active
                                </motion.span>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <motion.button
                              onClick={() => handleBlockUser(user.id)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${user.isBlocked ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {user.isBlocked ? 'Unblock' : 'Block'}
                            </motion.button>
                          </TableCell>
                        </PremiumTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  )
}
