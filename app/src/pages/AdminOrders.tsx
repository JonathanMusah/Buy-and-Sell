import { useEffect, useState, useCallback, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { DashboardCard, EmptyState, CardSkeleton, ErrorBoundary } from '@/components/ui/dashboard-shared'
import { StaticGradient } from '@/components/ui/optimized-backgrounds'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  RefreshCw,
  Clock,
  Loader2,
  Eye,
  Search,
  Download,
  CheckCircle,
  ArrowRightLeft,
  Calendar,
  User,
  Shield,
  Filter,
  XCircle,
  Package,
  Image as ImageIcon,
  ExternalLink,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  userId: string
  type: 'buy' | 'sell'
  crypto: string
  amount: number
  rate: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  paymentMethod: string
  transactionId?: string
  proofUrl?: string
  createdAt: string
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    label: 'Pending',
  },
  processing: {
    icon: RefreshCw,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    label: 'Processing',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    label: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    label: 'Cancelled',
  },
}

// ============================================
// STAT CARD
// ============================================

const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
  delay,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: 'slate' | 'amber' | 'blue' | 'emerald'
  trend?: string
  trendUp?: boolean
  delay?: number
}) {
  const colorClasses = {
    slate: {
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      text: 'text-slate-600 dark:text-slate-400',
      icon: 'bg-slate-100 dark:bg-slate-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'bg-amber-100 dark:bg-amber-800',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-100 dark:bg-blue-800',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'bg-emerald-100 dark:bg-emerald-800',
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ? delay * 0.1 : 0, duration: 0.4 }}
      className="group"
    >
      <div
        className={cn(
          'relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300',
          'bg-white dark:bg-slate-800/60',
          'border-slate-200 dark:border-slate-700',
          'hover:border-emerald-500/30 hover:shadow-lg'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <motion.p
              className={cn('text-3xl font-bold', colors.text)}
              key={value}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {value.toLocaleString()}
            </motion.p>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 mt-2 text-sm',
                  trendUp ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                <span>{trendUp ? '↑' : '↓'}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
              colors.icon
            )}
          >
            <Icon className={cn('w-6 h-6', colors.text)} />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ============================================
// FILTER BUTTON
// ============================================

const FilterButton = memo(function FilterButton({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap',
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
      )}
    >
      <span className="flex items-center gap-2">
        {label}
        {count !== undefined && count > 0 && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs',
              isActive ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-700'
            )}
          >
            {count}
          </span>
        )}
      </span>
    </button>
  )
})

// ============================================
// ORDER ROW
// ============================================

const OrderRow = memo(function OrderRow({
  order,
  onView,
  index,
}: {
  order: Order
  onView: (order: Order) => void
  index: number
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const config = statusConfig[order.status]
  const StatusIcon = config.icon
  const isBuy = order.type === 'buy'

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={cn(
        'border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
      )}
    >
      <td className="py-4 px-4 w-[120px]">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            )}
          >
            <span className="text-xs text-slate-500">#</span>
          </div>
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400 truncate">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 w-[150px]">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            )}
          >
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <span className="font-mono text-sm text-slate-600 dark:text-slate-400 truncate">
            {order.userId.slice(0, 8)}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 w-[140px]">
        <div className="flex items-center gap-2">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
            <StatusIcon className={cn('w-4 h-4', config.color)} />
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="font-semibold text-slate-900 dark:text-white truncate text-sm">
              {order.crypto.toUpperCase()}
            </span>
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-semibold w-fit',
                isBuy
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              )}
            >
              {order.type.toUpperCase()}
            </span>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 w-[120px]">
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
            {order.amount} {order.crypto.toUpperCase()}
          </p>
          <p className="text-sm text-slate-500 truncate">@ ₵{order.rate.toFixed(2)}</p>
        </div>
      </td>
      <td className="py-4 px-4 w-[100px]">
        <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl', config.bg)}>
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              config.color.replace('text-', 'bg-'),
              order.status === 'processing' && 'animate-pulse'
            )}
          />
          <span className={cn('font-semibold text-sm whitespace-nowrap', config.color)}>
            {config.label}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 w-[120px]">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate whitespace-nowrap">
            {format(new Date(order.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 w-[120px]">
        <button
          onClick={() => onView(order)}
          className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      </td>
    </motion.tr>
  )
})

// ============================================
// MAIN PAGE
// ============================================

export default function AdminOrders({ embedded = false }: { embedded?: boolean }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredOrders = useMemo(() => {
    let filtered = orders

    if (filter !== 'all') {
      filtered = filtered.filter((o) => o.status === filter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.userId.toLowerCase().includes(query) ||
          o.crypto.toLowerCase().includes(query) ||
          o.paymentMethod.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [orders, filter, searchQuery])

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
    }),
    [orders]
  )

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getOrders()
      const orderData = response.data.data || response.data
      setOrders(orderData)
    } catch (error) {
      toast.error('Failed to load orders')
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAdmin && !embedded) {
      navigate('/dashboard')
      return
    }
    fetchOrders()
  }, [isAdmin, embedded, navigate, fetchOrders])

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return

    setIsUpdating(true)
    try {
      await adminApi.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: adminNotes,
      })
      toast.success('Order status updated successfully!')
      setIsDialogOpen(false)
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  const openOrderDialog = useCallback((order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setAdminNotes('')
    setIsDialogOpen(true)
  }, [])

  const hasActiveFilters = useMemo(() => filter !== 'all' || searchQuery !== '', [filter, searchQuery])

  if (!isAdmin) return null

  const content = (
    <div className="relative min-h-screen space-y-6">
      {!embedded && <StaticGradient variant="emerald" className="opacity-30" />}

      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Orders</h1>
              <p className="text-slate-600 dark:text-slate-400">
                View and manage all exchange orders across the platform
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchOrders}
            className={cn(
              'gap-2',
              isLoading && '[&>svg]:animate-spin'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} header={false} lines={2} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Orders" value={stats.total} icon={Package} color="slate" trend="+12%" trendUp delay={0} />
          <StatCard title="Pending" value={stats.pending} icon={Clock} color="amber" delay={1} />
          <StatCard title="Processing" value={stats.processing} icon={RefreshCw} color="blue" delay={2} />
          <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="emerald" trend="+8%" trendUp delay={3} />
        </div>
      )}

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DashboardCard>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search orders by ID, user, crypto, or payment method..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'pl-12 h-12 rounded-xl',
                  isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-200'
                )}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <FilterButton label="All" isActive={filter === 'all'} onClick={() => setFilter('all')} count={stats.total} />
              <FilterButton label="Pending" isActive={filter === 'pending'} onClick={() => setFilter('pending')} count={stats.pending} />
              <FilterButton label="Processing" isActive={filter === 'processing'} onClick={() => setFilter('processing')} count={stats.processing} />
              <FilterButton label="Completed" isActive={filter === 'completed'} onClick={() => setFilter('completed')} count={stats.completed} />
              <FilterButton
                label="Cancelled"
                isActive={filter === 'cancelled'}
                onClick={() => setFilter('cancelled')}
                count={orders.filter((o) => o.status === 'cancelled').length}
              />
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Active filters:</span>
                <button
                  onClick={() => {
                    setFilter('all')
                    setSearchQuery('')
                  }}
                  className="ml-auto px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </DashboardCard>
      </motion.div>

      {/* Orders Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <DashboardCard
          header={{
            title: 'All Orders',
            description: `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} found`,
            icon: <ArrowRightLeft className="w-5 h-5 text-emerald-500" />,
          }}
          gradient="emerald"
        >
          {isLoading ? (
            <div className="py-12">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 rounded-full animate-spin" />
              </div>
              <p className="text-center text-slate-500 mt-4">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title={searchQuery || hasActiveFilters ? 'No orders found' : 'No orders yet'}
              description={
                searchQuery || hasActiveFilters
                  ? 'Try adjusting your search or filters'
                  : 'No exchange orders have been placed yet'
              }
            />
          ) : (
            <>
              {/* Mobile card view */}
              <div className="md:hidden space-y-3 p-2">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status]
                  const StatusIcon = config.icon
                  const isBuy = order.type === 'buy'
                  return (
                    <div
                      key={order.id}
                      className={cn(
                        'rounded-xl border p-4 space-y-3 transition-colors',
                        isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span
                            className={cn(
                              'text-xs px-1.5 py-0.5 rounded-full font-semibold',
                              isBuy
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            )}
                          >
                            {order.type.toUpperCase()}
                          </span>
                        </div>
                        <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs', config.bg)}>
                          <StatusIcon className={cn('w-3 h-3', config.color)} />
                          <span className={cn('font-semibold', config.color)}>{config.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {order.amount} {order.crypto.toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500">@ ₵{order.rate.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-slate-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                      <button
                        onClick={() => openOrderDialog(order)}
                        className="w-full py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[120px]">
                      Order ID
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[150px]">
                      User
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[140px]">
                      Crypto
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[120px]">
                      Amount
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[100px]">
                      Status
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[120px]">
                      Date
                    </th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap w-[120px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <OrderRow key={order.id} order={order} onView={openOrderDialog} index={index} />
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </DashboardCard>
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-500" />
              Order Details
            </DialogTitle>
            <DialogDescription>Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="p-2">
                  <p className="text-xs text-slate-500 mb-1">Type</p>
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      selectedOrder.type === 'buy' ? 'text-emerald-600' : 'text-red-600'
                    )}
                  >
                    {selectedOrder.type.toUpperCase()}
                  </p>
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-500 mb-1">Crypto</p>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {selectedOrder.crypto.toUpperCase()}
                  </p>
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-500 mb-1">Amount</p>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">
                    {selectedOrder.amount} {selectedOrder.crypto.toUpperCase()}
                  </p>
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-500 mb-1">Total (₵)</p>
                  <p className="font-semibold text-sm text-emerald-600">{selectedOrder.total.toFixed(2)}</p>
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-500 mb-1">Rate (₵)</p>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{selectedOrder.rate.toFixed(2)}</p>
                </div>
                <div className="p-2">
                  <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{selectedOrder.paymentMethod}</p>
                </div>
              </div>

              {selectedOrder.transactionId && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-slate-500" />
                    <p className="text-sm text-slate-500">Transaction ID / Reference</p>
                  </div>
                  <p className="font-mono text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded-lg break-all">
                    {selectedOrder.transactionId}
                  </p>
                </div>
              )}

              {selectedOrder.proofUrl && (() => {
                const token = localStorage.getItem('token')
                const backendOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')
                const proofSrc = backendOrigin + selectedOrder.proofUrl + (token ? `?token=${token}` : '')
                return (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <p className="text-sm text-slate-500">Payment Proof</p>
                    </div>
                    <a
                      href={proofSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open full
                    </a>
                  </div>
                  <div className="relative rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                    <img
                      src={proofSrc}
                      alt="Payment proof"
                      className="w-full max-h-48 object-contain cursor-pointer"
                      onClick={() => window.open(proofSrc, '_blank')}
                    />
                  </div>
                </div>
                )
              })()}

              {!selectedOrder.transactionId && !selectedOrder.proofUrl && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    No transaction ID or proof uploaded for this order
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Update Status</p>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this order..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || newStatus === selectedOrder?.status}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
