import { useEffect, useState, useCallback, useMemo } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { userApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { format, subDays, isWithinInterval } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  MoreHorizontal,
  FileText
} from 'lucide-react'

// ============================================
// TYPES & INTERFACES
// ============================================
interface Order {
  id: string
  type: 'buy' | 'sell'
  crypto: string
  amount: number
  rate: number
  total: number
  paymentMethod: string
  transactionId?: string
  proofUrl?: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  createdAt: string
}

interface StatusConfig {
  icon: React.ElementType
  color: string
  bg: string
  label: string
  description: string
}

// ============================================
// STATUS CONFIGURATION
// ============================================
const statusConfig: Record<string, StatusConfig> = {
  pending: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    label: 'Pending',
    description: 'Awaiting confirmation'
  },
  processing: {
    icon: RefreshCw,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    label: 'Processing',
    description: 'In progress'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    label: 'Completed',
    description: 'Successfully processed'
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    label: 'Cancelled',
    description: 'Order cancelled'
  }
}

// ============================================
// STAT CARD COMPONENT
// ============================================
interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  trend?: string
  trendUp?: boolean
}

function StatCard({ title, value, icon: Icon, color, trend, trendUp }: StatCardProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-slate-200 dark:bg-slate-700'
    },
    amber: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-200 dark:bg-amber-800'
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      iconBg: 'bg-blue-200 dark:bg-blue-800'
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-emerald-200 dark:bg-emerald-800'
    },
  }

  const colors = colorClasses[color] || colorClasses.slate

  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</p>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {value.toLocaleString()}
          </p>
          {trend && (
            <div className={`flex items-center gap-1 mt-1 text-sm ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
    </div>
  )
}

// ============================================
// ORDER CARD COMPONENT
// ============================================
interface OrderCardProps {
  order: Order
  index: number
}

function OrderCard({ order, index }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const config = statusConfig[order.status]
  const StatusIcon = config.icon
  const isBuy = order.type === 'buy'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.005 }}
      className="relative"
    >
      <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Icon & Basic Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 rounded-xl shrink-0 ${config.bg} flex items-center justify-center border`}>
                <StatusIcon className={`w-6 h-6 ${config.color}`} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${isBuy
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                    {isBuy ? 'Buy' : 'Sell'}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate">{order.crypto}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="truncate">{format(new Date(order.createdAt), 'MMM d, yyyy • h:mm a')}</span>
                </div>
              </div>
            </div>

            {/* Middle: Amount */}
            <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6 lg:gap-8 pl-0 sm:pl-0 ml-0">
              <div className="sm:text-center">
                <p className="text-xs text-slate-500 mb-0.5 uppercase">Amount</p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {order.amount.toFixed(4)}
                </p>
                <p className="text-xs text-slate-400">{order.crypto}</p>
              </div>

              <div className="sm:text-center">
                <p className="text-xs text-slate-500 mb-0.5 uppercase">{isBuy ? 'You Pay' : 'You Receive'}</p>
                <p className="font-semibold text-emerald-600">
                  ₵{order.total.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">Ghana Cedis</p>
              </div>
            </div>

            {/* Right: Status */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className={`px-3 py-2 rounded-lg border flex-1 sm:flex-initial ${config.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${config.color.replace('text-', 'bg-')}`} />
                  <div>
                    <span className={`font-medium text-sm ${config.color}`}>
                      {config.label}
                    </span>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {config.description}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg shrink-0 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-white font-medium">#{order.id.slice(0, 12).toUpperCase()}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Exchange Rate</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">₵{order.rate?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{order.paymentMethod || 'N/A'}</p>
                  </div>
                </div>

                {order.transactionId && (
                  <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <p className="text-xs text-slate-500 mb-1">Transaction ID</p>
                    <p className="font-mono text-sm text-slate-900 dark:text-white break-all">{order.transactionId}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <FileText className="w-3.5 h-3.5" />
                    View Receipt
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// FILTER BUTTON COMPONENT
// ============================================
interface FilterButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  count?: number
}

function FilterButton({ label, isActive, onClick, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
          ? 'bg-emerald-600 text-white'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
        }`}
    >
      <span className="flex items-center gap-1.5">
        {label}
        {count !== undefined && count > 0 && (
          <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
            {count}
          </span>
        )}
      </span>
    </button>
  )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
interface EmptyStateProps {
  searchQuery: string
  hasFilters: boolean
}

function EmptyState({ searchQuery, hasFilters }: EmptyStateProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`p-12 rounded-xl border text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600">
        <Package className="w-8 h-8 text-slate-400" />
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {searchQuery || hasFilters ? 'No orders found' : 'No orders yet'}
      </h3>

      <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
        {searchQuery || hasFilters
          ? 'Try adjusting your search or filters to see more results'
          : 'Start trading to see your order history here. Your journey begins with the first trade!'
        }
      </p>

      {!searchQuery && !hasFilters && (
        <a href="/exchange">
          <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6">
            <ArrowUpRight className="w-4 h-4 mr-1.5" />
            Start Trading Now
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </a>
      )}
    </div>
  )
}

// ============================================
// MAIN ORDERS PAGE COMPONENT
// ============================================
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Fetch orders
  useEffect(() => {
    fetchOrders()
  }, [])

  // Memoize filtered orders
  const filteredOrders = useMemo(() => {
    let filtered = orders

    if (filter !== 'all') {
      filtered = filtered.filter(o => o.status === filter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.createdAt)
        switch (dateFilter) {
          case 'today':
            return format(orderDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
          case 'week':
            return isWithinInterval(orderDate, { start: subDays(now, 7), end: now })
          case 'month':
            return isWithinInterval(orderDate, { start: subDays(now, 30), end: now })
          default:
            return true
        }
      })
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.crypto.toLowerCase().includes(query) ||
        o.type.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [orders, filter, searchQuery, dateFilter])

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await userApi.getOrders()
      const ordersData = response.data?.data || response.data || []
      setOrders(ordersData)
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    processing: orders.filter(o => o.status === 'processing').length,
  }), [orders])

  const hasActiveFilters = useMemo(() =>
    filter !== 'all' || dateFilter !== 'all' || searchQuery !== '',
    [filter, dateFilter, searchQuery]
  )

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Order History
                </h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {stats.total} Orders
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Track and manage all your cryptocurrency transactions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={fetchOrders}
                className="gap-1.5 h-9"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 h-9" onClick={() => {
                if (filteredOrders.length === 0) {
                  toast.error('No orders to export')
                  return
                }
                const headers = ['Order ID', 'Date', 'Type', 'Crypto', 'Amount', 'Rate (GHS)', 'Total (GHS)', 'Status', 'Payment Method']
                const rows = filteredOrders.map(o => [
                  o.id,
                  format(new Date(o.createdAt), 'yyyy-MM-dd HH:mm:ss'),
                  o.type.toUpperCase(),
                  o.crypto,
                  o.amount,
                  o.rate,
                  o.total,
                  o.status,
                  o.paymentMethod || ''
                ])
                const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `jdexchange-orders-${format(new Date(), 'yyyy-MM-dd')}.csv`
                link.click()
                URL.revokeObjectURL(url)
                toast.success(`Exported ${filteredOrders.length} orders`)
              }}>
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: 'Total Orders', value: stats.total, icon: Package, color: 'slate', trend: '+12%', trendUp: true },
              { title: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
              { title: 'Processing', value: stats.processing, icon: RefreshCw, color: 'blue' },
              { title: 'Completed', value: stats.completed, icon: CheckCircle, color: 'emerald', trend: '+8%', trendUp: true },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
              >
                <StatCard {...s} />
              </motion.div>
            ))}
          </div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
          <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </div>
                  <Input
                    placeholder="Search orders by ID, crypto, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-9 h-10 text-sm rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 focus:border-emerald-500'}`}
                  />
                </div>

                {/* Status Filters */}
                <div className="flex gap-2 flex-wrap">
                  <FilterButton label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} count={stats.total} />
                  <FilterButton label="Pending" isActive={filter === 'pending'} onClick={() => setFilter('pending')} count={stats.pending} />
                  <FilterButton label="Processing" isActive={filter === 'processing'} onClick={() => setFilter('processing')} count={stats.processing} />
                  <FilterButton label="Completed" isActive={filter === 'completed'} onClick={() => setFilter('completed')} count={stats.completed} />
                </div>
              </div>

              {/* Date Filters */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex-wrap items-center">
                <span className="text-xs text-slate-500 py-1.5 font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Filter by date:
                </span>
                {(['all', 'today', 'week', 'month'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDateFilter(d)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${dateFilter === d
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setFilter('all')
                      setDateFilter('all')
                      setSearchQuery('')
                    }}
                    className="ml-auto px-3 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Orders List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.55 }}
            className="space-y-3"
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm text-slate-500">Loading orders...</p>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <EmptyState searchQuery={searchQuery} hasFilters={hasActiveFilters} />
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((order, index) => (
                  <OrderCard key={order.id} order={order} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
