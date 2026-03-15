import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import {
  TrendingUp,
  History,
  Users,
  Bitcoin,
  CreditCard,
  DollarSign,
  Shield,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Clock,
  BarChart3,
  Star,
  MessageSquare,
  Megaphone,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminOrders from './AdminOrders'
import AdminUsers from './AdminUsers'
import AdminCryptoManagement from './AdminCryptoManagement'
import AdminPaymentMethods from './AdminPaymentMethods'
import AdminRatesManagement from './AdminRatesManagement'
import AdminReviews from './AdminReviews'
import AdminTickets from './AdminTickets'
import AdminBroadcast from './AdminBroadcast'
import AdminSettings from './AdminSettings'
import { adminApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ============================================
// CLEAN HEADER - Simple & Professional
// ============================================
function CleanHeader() {
  return (
    <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your platform and monitor performance
        </p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        System Online
      </div>
    </div>
  )
}

// ============================================
// CLEAN STAT CARD - Minimal Design
// ============================================
function StatCard({ icon: Icon, label, value, trend, trendUp }: {
  icon: React.ElementType
  label: string
  value: string
  trend?: string
  trendUp?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={cn(
      "p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
      isDark 
        ? "bg-slate-800/50 border-slate-700 hover:border-slate-600" 
        : "bg-white border-slate-200 hover:border-slate-300"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isDark ? "bg-slate-700" : "bg-slate-100"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              isDark ? "text-slate-300" : "text-slate-600"
            )} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp 
              ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
              : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
          )}>
            {trendUp ? '+' : ''}{trend}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// ACTIVITY ITEM - Clean List Item
// ============================================
function ActivityItem({ icon: Icon, title, time, status }: {
  icon: React.ElementType
  title: string
  time: string
  status: 'success' | 'pending' | 'warning'
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const statusColors = {
    success: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
    pending: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
    warning: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg",
      isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center",
          isDark ? "bg-slate-700" : "bg-slate-100"
        )}>
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>
      </div>
      <span className={cn(
        "text-xs px-2 py-1 rounded-full font-medium",
        statusColors[status]
      )}>
        {status === 'success' ? 'Completed' : status === 'pending' ? 'Pending' : 'Failed'}
      </span>
    </div>
  )
}

// ============================================
// QUICK ACTION BUTTON
// ============================================
function QuickAction({ icon: Icon, label, onClick }: {
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group",
        isDark 
          ? "bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600" 
          : "bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
        isDark ? "bg-slate-700 group-hover:bg-slate-600" : "bg-slate-100 group-hover:bg-slate-200"
      )}>
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      </div>
      <span className="flex-1 text-left text-sm font-medium text-slate-900 dark:text-white">
        {label}
      </span>
      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
    </button>
  )
}

// ============================================
// PERFORMANCE CHART - Real Data
// ============================================
function PerformanceChart() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [period, setPeriod] = useState<'7D' | '30D' | '90D'>('30D')
  const [chartData, setChartData] = useState<{ label: string; volume: number; orders: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [period])

  const loadChartData = async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getOrders({ page: 1, limit: 1000 })
      const orders: any[] = res.data?.data || []
      const now = new Date()
      const daysBack = period === '7D' ? 7 : period === '30D' ? 30 : 90

      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - daysBack)

      const filtered = orders.filter((o: any) => new Date(o.createdAt) >= cutoff)

      if (period === '7D') {
        // Group by day (last 7 days)
        const buckets: Record<string, { volume: number; orders: number }> = {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          const key = d.toLocaleDateString('en', { weekday: 'short' })
          buckets[key] = { volume: 0, orders: 0 }
        }
        filtered.forEach((o: any) => {
          const d = new Date(o.createdAt)
          const key = d.toLocaleDateString('en', { weekday: 'short' })
          if (buckets[key]) {
            buckets[key].orders += 1
            if (o.status === 'completed') buckets[key].volume += o.total || 0
          }
        })
        setChartData(Object.entries(buckets).map(([label, d]) => ({ label, ...d })))
      } else if (period === '30D') {
        // Group into ~6 segments of 5 days
        const segments = 6
        const segDays = 5
        const result: { label: string; volume: number; orders: number }[] = []
        for (let i = segments - 1; i >= 0; i--) {
          const segEnd = new Date(now)
          segEnd.setDate(segEnd.getDate() - i * segDays)
          const segStart = new Date(segEnd)
          segStart.setDate(segStart.getDate() - segDays)
          const label = segStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })
          const segOrders = filtered.filter((o: any) => {
            const d = new Date(o.createdAt)
            return d >= segStart && d < segEnd
          })
          result.push({
            label,
            orders: segOrders.length,
            volume: segOrders.filter((o: any) => o.status === 'completed').reduce((s: number, o: any) => s + (o.total || 0), 0)
          })
        }
        setChartData(result)
      } else {
        // 90D — group by month
        const buckets: Record<string, { volume: number; orders: number }> = {}
        for (let i = 2; i >= 0; i--) {
          const d = new Date(now)
          d.setMonth(d.getMonth() - i)
          const key = d.toLocaleDateString('en', { month: 'short' })
          buckets[key] = { volume: 0, orders: 0 }
        }
        filtered.forEach((o: any) => {
          const d = new Date(o.createdAt)
          const key = d.toLocaleDateString('en', { month: 'short' })
          if (buckets[key]) {
            buckets[key].orders += 1
            if (o.status === 'completed') buckets[key].volume += o.total || 0
          }
        })
        setChartData(Object.entries(buckets).map(([label, d]) => ({ label, ...d })))
      }
    } catch {
      setChartData([])
    } finally {
      setIsLoading(false)
    }
  }

  const maxVolume = Math.max(...chartData.map(d => d.volume), 1)
  const maxOrders = Math.max(...chartData.map(d => d.orders), 1)

  return (
    <div className={cn(
      "rounded-xl border p-6",
      isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isDark ? "bg-slate-700" : "bg-slate-100"
          )}>
            <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Overview</h3>
            <p className="text-sm text-slate-500">Trading volume and order activity</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(['7D', '30D', '90D'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                period === p
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
          <span className="text-xs text-slate-500">Volume (₵)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500/60" />
          <span className="text-xs text-slate-500">Orders</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm text-slate-500">No data for this period</p>
        </div>
      ) : (
        <div className="h-64 flex items-end justify-between gap-2 px-4">
          {chartData.map((d, i) => {
            const volPct = maxVolume > 0 ? (d.volume / maxVolume) * 100 : 0
            const ordPct = maxOrders > 0 ? (d.orders / maxOrders) * 100 : 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className={cn(
                  "absolute -top-16 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg",
                  isDark ? "bg-slate-700 text-white" : "bg-slate-800 text-white"
                )}>
                  <div>₵{d.volume.toLocaleString()}</div>
                  <div>{d.orders} order{d.orders !== 1 ? 's' : ''}</div>
                </div>
                <div className="w-full flex gap-1 items-end" style={{ height: '100%' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(volPct, 2)}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={cn(
                      "flex-1 rounded-t-md",
                      isDark ? "bg-emerald-500/40" : "bg-emerald-500/30"
                    )}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(ordPct, 2)}%` }}
                    transition={{ delay: i * 0.05 + 0.1, duration: 0.5 }}
                    className={cn(
                      "flex-1 rounded-t-md",
                      isDark ? "bg-blue-500/40" : "bg-blue-500/30"
                    )}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============================================
// OVERVIEW CONTENT - Clean & Professional
// ============================================
function OverviewContent({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalVolume: '₵0',
    pendingOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [recentActivity, setRecentActivity] = useState<any[]>([])

  const refreshStats = async () => {
    setIsLoading(true)
    try {
      const [statsRes, activityRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getActivityLog(5)
      ])
      const data = statsRes.data?.data || statsRes.data || {}
      const volume = data.totalVolume || 0
      const formattedVolume = volume >= 1000000
        ? `₵${(volume / 1000000).toFixed(1)}M`
        : volume >= 1000
          ? `₵${(volume / 1000).toFixed(1)}K`
          : `₵${volume.toLocaleString()}`
      setStats({
        totalUsers: data.totalUsers || 0,
        totalOrders: data.totalOrders || 0,
        totalVolume: formattedVolume,
        pendingOrders: data.pendingOrders || 0,
      })
      setRecentActivity(activityRes.data?.data || [])
    } catch (error) {
      toast.error('Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats.totalUsers.toLocaleString()}
        />
        <StatCard 
          icon={History} 
          label="Total Orders" 
          value={stats.totalOrders.toLocaleString()}
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Volume" 
          value={stats.totalVolume}
        />
        <StatCard 
          icon={Clock} 
          label="Pending Orders" 
          value={stats.pendingOrders.toString()}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className={cn(
          "lg:col-span-2 rounded-xl border p-6",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <button 
              onClick={() => onTabChange('orders')}
              className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => {
              const getIcon = (action: string) => {
                if (action?.includes('order') || action?.includes('Order')) return History
                if (action?.includes('user') || action?.includes('register') || action?.includes('login')) return Users
                if (action?.includes('crypto') || action?.includes('bitcoin')) return Bitcoin
                if (action?.includes('password') || action?.includes('security')) return Shield
                return CheckCircle
              }
              const getStatus = (action: string): 'success' | 'pending' | 'warning' => {
                if (action?.includes('pending') || action?.includes('processing')) return 'pending'
                if (action?.includes('failed') || action?.includes('rejected') || action?.includes('blocked')) return 'warning'
                return 'success'
              }
              const timeAgo = (date: string) => {
                const diff = Date.now() - new Date(date).getTime()
                const mins = Math.floor(diff / 60000)
                if (mins < 1) return 'Just now'
                if (mins < 60) return `${mins} min ago`
                const hrs = Math.floor(mins / 60)
                if (hrs < 24) return `${hrs}h ago`
                return `${Math.floor(hrs / 24)}d ago`
              }
              return (
                <ActivityItem
                  key={item.id || i}
                  icon={getIcon(item.action)}
                  title={item.action || 'Activity'}
                  time={timeAgo(item.createdAt)}
                  status={getStatus(item.action)}
                />
              )
            }) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={cn(
          "rounded-xl border p-6",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <button
              onClick={refreshStats}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4 text-slate-500", isLoading && "animate-spin")} />
            </button>
          </div>
          <div className="space-y-3">
            <QuickAction 
              icon={History}
              label="View All Orders"
              onClick={() => onTabChange('orders')}
            />
            <QuickAction 
              icon={Users}
              label="Manage Users"
              onClick={() => onTabChange('users')}
            />
            <QuickAction 
              icon={Bitcoin}
              label="Cryptocurrencies"
              onClick={() => onTabChange('cryptos')}
            />
            <QuickAction 
              icon={CreditCard}
              label="Payment Methods"
              onClick={() => onTabChange('payments')}
            />
            <QuickAction 
              icon={DollarSign}
              label="Exchange Rates"
              onClick={() => onTabChange('rates')}
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <PerformanceChart />
    </div>
  )
}

// ============================================
// ANIMATED TAB BUTTON
// ============================================
interface AnimatedTabButtonProps {
  value: string
  activeTab: string
  onClick: (value: string) => void
  icon: React.ElementType
  label: string
  index: number
}

function AnimatedTabButton({ value, activeTab, onClick, icon: Icon, label, index }: AnimatedTabButtonProps) {
  const isActive = activeTab === value
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.button
      onClick={() => onClick(value)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
        isActive
          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
          : isDark 
            ? "bg-slate-800/60 text-slate-300 hover:text-emerald-400 hover:bg-emerald-900/20" 
            : "bg-white/60 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
    </motion.button>
  )
}

// ============================================
// MAIN ADMIN PAGE
// ============================================
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    const handleTabSwitch = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail)
      }
    }

    window.addEventListener('switchAdminTab', handleTabSwitch)
    return () => window.removeEventListener('switchAdminTab', handleTabSwitch)
  }, [])

  const tabs = [
    { value: 'overview', icon: TrendingUp, label: 'Overview' },
    { value: 'orders', icon: History, label: 'Orders' },
    { value: 'users', icon: Users, label: 'Users' },
    { value: 'cryptos', icon: Bitcoin, label: 'Cryptocurrencies' },
    { value: 'payments', icon: CreditCard, label: 'Payment Methods' },
    { value: 'rates', icon: DollarSign, label: 'Exchange Rates' },
    { value: 'reviews', icon: Star, label: 'Reviews' },
    { value: 'tickets', icon: MessageSquare, label: 'Tickets' },
    { value: 'broadcast', icon: Megaphone, label: 'Broadcast' },
    { value: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      <div className="min-h-screen space-y-6">
        {/* Clean Header */}
        <CleanHeader />

        {/* Tabs Navigation */}
        <div className={cn(
          "flex flex-wrap gap-2 p-2 rounded-xl",
          isDark ? "bg-slate-800/50" : "bg-slate-100/50"
        )}>
          {tabs.map((tab, index) => (
            <AnimatedTabButton
              key={tab.value}
              value={tab.value}
              activeTab={activeTab}
              onClick={setActiveTab}
              icon={tab.icon}
              label={tab.label}
              index={index}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && (
                <OverviewContent onTabChange={setActiveTab} />
              )}

              {activeTab === 'orders' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminOrders embedded />
                </div>
              )}

              {activeTab === 'users' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminUsers embedded />
                </div>
              )}

              {activeTab === 'cryptos' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminCryptoManagement />
                </div>
              )}

              {activeTab === 'payments' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminPaymentMethods />
                </div>
              )}

              {activeTab === 'rates' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminRatesManagement />
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminReviews embedded />
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminTickets embedded />
                </div>
              )}

              {activeTab === 'broadcast' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminBroadcast />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className={cn(
                  "rounded-xl border p-6",
                  isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                )}>
                  <AdminSettings />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
