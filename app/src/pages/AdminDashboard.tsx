import { useEffect, useState, useRef, memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { DashboardCard, CardSkeleton, ErrorBoundary } from '@/components/ui/dashboard-shared'
import { adminApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import {
  Users,
  History,
  Clock,
  ArrowRight,
  RefreshCw,
  DollarSign,
  Activity,
  Zap,
  BarChart3,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Stats {
  totalUsers: number
  totalOrders: number
  totalVolume: number
  todayOrders: number
  pendingOrders: number
  completedOrders: number
}

// ============================================
// ANIMATED COUNTER HOOK
// ============================================

function useAnimatedCounter(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          const steps = 40
          const increment = end / steps
          let current = 0

          const timer = setInterval(() => {
            current += increment
            if (current >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)

          return () => clearInterval(timer)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, hasStarted, duration])

  return { count, ref }
}

// ============================================
// ADMIN STAT CARD WITH COUNTER
// ============================================

const AdminStatCard = memo(function AdminStatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'pink' | 'cyan'
  trend?: { value: number; isPositive: boolean }
}) {
  const { count, ref } = useAnimatedCounter(value)

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-orange-500',
    pink: 'from-pink-500 to-rose-500',
    cyan: 'from-cyan-500 to-teal-500',
  }

  return (
    <DashboardCard
      className={cn(
        'relative overflow-hidden text-white border-0',
        'bg-gradient-to-br',
        colorClasses[color]
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm flex items-center gap-2">{icon} {title}</span>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                trend.isPositive ? 'bg-white/20 text-white' : 'bg-red-400/30 text-white'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </div>
          )}
        </div>
        <div ref={ref} className="text-4xl font-bold">
          {count.toLocaleString()}
        </div>
        <p className="text-white/70 text-sm mt-1">{subtitle}</p>
      </div>
    </DashboardCard>
  )
})

// ============================================
// ACTIVITY CHART
// ============================================

const ActivityChart = memo(function ActivityChart() {
  const bars = [40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95]

  return (
    <div className="h-48 flex items-end gap-2">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm cursor-pointer group relative"
          initial={{ height: 0 }}
          animate={{ height: `${height}%` }}
          transition={{ delay: i * 0.05, duration: 0.5 }}
          whileHover={{ opacity: 0.8 }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ₵{(height * 1000).toLocaleString()}
          </div>
        </motion.div>
      ))}
    </div>
  )
})

// ============================================
// QUICK ACTION BUTTON
// ============================================

const QuickAction = memo(function QuickAction({
  icon,
  title,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full p-4 rounded-xl border text-left transition-all duration-300',
        'bg-white dark:bg-slate-800',
        'border-slate-200 dark:border-slate-700',
        'hover:border-emerald-500/50 hover:shadow-lg'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110',
          color
        )}
      >
        {icon}
      </div>
      <p className="font-semibold text-slate-900 dark:text-white mb-1">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </button>
  )
})

// ============================================
// ACTIVITY ITEM
// ============================================

const ActivityItem = memo(function ActivityItem({
  action,
  time,
  type,
}: {
  action: string
  time: string
  type: 'user' | 'order' | 'system'
}) {
  const typeConfig = {
    user: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: <Users className="w-5 h-5 text-blue-500" />,
    },
    order: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      icon: <History className="w-5 h-5 text-emerald-500" />,
    },
    system: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      icon: <Activity className="w-5 h-5 text-purple-500" />,
    },
  }

  const config = typeConfig[type]

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
          {config.icon}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white text-sm">{action}</p>
          <p className="text-xs text-slate-500">{time}</p>
        </div>
      </div>
    </div>
  )
})

// ============================================
// MAIN ADMIN DASHBOARD
// ============================================

export default function AdminDashboard({ embedded = false }: { embedded?: boolean }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getStats()
      const statsData = response.data?.data || response.data || {}

      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalOrders: statsData.totalOrders || 0,
        totalVolume: statsData.totalVolume || 0,
        todayOrders: statsData.todayOrders || 0,
        pendingOrders: statsData.pendingOrders || 0,
        completedOrders: statsData.completedOrders || 0,
      })
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to load admin stats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin && !embedded) {
      navigate('/dashboard')
      return
    }
    fetchStats()
  }, [isAdmin, embedded, navigate, fetchStats])

  if (!isAdmin) return null

  const content = (
    <div className="space-y-6">
      {/* Header */}
      {!embedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Monitor platform performance and manage operations
            </p>
          </div>
          <button
            onClick={fetchStats}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300',
              'bg-white dark:bg-slate-800',
              'border border-slate-200 dark:border-slate-700',
              'hover:bg-slate-50 dark:hover:bg-slate-700'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </button>
        </div>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} header={false} lines={2} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminStatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            subtitle="Registered accounts"
            icon={<Users className="w-4 h-4" />}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <AdminStatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            subtitle="All time transactions"
            icon={<History className="w-4 h-4" />}
            color="emerald"
            trend={{ value: 8, isPositive: true }}
          />
          <AdminStatCard
            title="Total Volume"
            value={stats?.totalVolume || 0}
            subtitle="All time trading volume"
            icon={<DollarSign className="w-4 h-4" />}
            color="purple"
            trend={{ value: 15, isPositive: true }}
          />
          <AdminStatCard
            title="Today's Orders"
            value={stats?.todayOrders || 0}
            subtitle="Orders placed today"
            icon={<Activity className="w-4 h-4" />}
            color="amber"
          />
          <AdminStatCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            subtitle="Awaiting processing"
            icon={<Clock className="w-4 h-4" />}
            color="pink"
          />
          <AdminStatCard
            title="Completed"
            value={stats?.completedOrders || 0}
            subtitle="Successfully processed"
            icon={<CheckCircle className="w-4 h-4" />}
            color="cyan"
            trend={{ value: 5, isPositive: true }}
          />
        </div>
      )}

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <DashboardCard
            header={{
              title: 'Trading Volume',
              description: 'Last 30 days activity',
              icon: <BarChart3 className="w-5 h-5" />,
            }}
            gradient="emerald"
          >
            <ActivityChart />
          </DashboardCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DashboardCard
            header={{
              title: 'Quick Actions',
              description: 'Manage platform operations',
              icon: <Zap className="w-5 h-5" />,
            }}
            gradient="amber"
          >
            <div className="grid grid-cols-1 gap-3">
              <QuickAction
                icon={<History className="w-6 h-6 text-white" />}
                title="Manage Orders"
                description="View and update order statuses"
                onClick={() => navigate('/admin/orders')}
                color="bg-gradient-to-br from-blue-500 to-indigo-500"
              />
              <QuickAction
                icon={<Users className="w-6 h-6 text-white" />}
                title="Manage Users"
                description="View and manage user accounts"
                onClick={() => navigate('/admin/users')}
                color="bg-gradient-to-br from-emerald-500 to-teal-500"
              />
              <QuickAction
                icon={<DollarSign className="w-6 h-6 text-white" />}
                title="Update Rates"
                description="Modify exchange rates"
                onClick={() => {
                  if (embedded) {
                    window.dispatchEvent(new CustomEvent('switchAdminTab', { detail: 'rates' }))
                  } else {
                    navigate('/admin#rates')
                  }
                }}
                color="bg-gradient-to-br from-amber-500 to-orange-500"
              />
            </div>
          </DashboardCard>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <DashboardCard
          header={{
            title: 'Recent Activity',
            description: 'Latest platform events',
            icon: <Activity className="w-5 h-5" />,
            action: (
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            ),
          }}
          gradient="purple"
        >
          <div className="space-y-3">
            {[
              { action: 'New user registered', time: '2 minutes ago', type: 'user' as const },
              { action: 'Order #12345 completed', time: '5 minutes ago', type: 'order' as const },
              { action: 'Exchange rates updated', time: '15 minutes ago', type: 'system' as const },
              { action: 'New order #12346 created', time: '30 minutes ago', type: 'order' as const },
            ].map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </DashboardCard>
      </motion.div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <>
      <ErrorBoundary>{content}</ErrorBoundary>
    </>
  )
}
