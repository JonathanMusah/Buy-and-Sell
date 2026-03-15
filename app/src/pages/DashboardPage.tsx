import { useEffect, useState, useMemo, memo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { userApi } from '@/lib/apiClient'
import {
  DashboardCard,
  StatCard,
  EmptyState,
  CardSkeleton,
  StatsSkeleton,
  ErrorBoundary,
} from '@/components/ui/dashboard-shared'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Activity,
  Bitcoin,
  History,
  Shield,
  BarChart3,
  ArrowDownLeft,
  ChevronRight,
  Crown,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface WalletData {
  balances: Record<string, number>
}

interface Order {
  id: string
  fromCurrency: string
  toCurrency: string
  amount: number
  finalAmount: number
  status: string
  createdAt: string
  type: string
  crypto: string
}

const currencyLogos: Record<string, string> = {
  BTC: '/crypto-logos/btc.png',
  ETH: '/crypto-logos/eth.png',
  USDT: '/crypto-logos/usdt.png',
  BNB: '/crypto-logos/bnb.png',
  SOL: '/crypto-logos/sol.png',
  DOGE: '/crypto-logos/doge.png',
  TRX: '/crypto-logos/trx.png',
  USDC: '/crypto-logos/usdc.png',
  XRP: '/crypto-logos/xrp.png',
  ADA: '/crypto-logos/ada.png',
  DOT: '/crypto-logos/dot.png',
  SHIB: '/crypto-logos/shib.png',
  GHS: '/crypto-logos/ghs.webp',
}

const currencyFallbackIcons: Record<string, string> = {
  GHS: '₵',
  USD: '$',
  XRP: 'X',
  ADA: 'A',
}

const currencyColors: Record<string, string> = {
  BTC: 'from-orange-500 to-yellow-500',
  ETH: 'from-blue-500 to-purple-500',
  USDT: 'from-emerald-500 to-green-500',
  BNB: 'from-yellow-500 to-orange-500',
  SOL: 'from-purple-500 to-pink-500',
  XRP: 'from-blue-400 to-cyan-500',
  ADA: 'from-blue-600 to-purple-500',
  GHS: 'from-emerald-500 to-teal-500',
  USD: 'from-green-500 to-emerald-500',
}

// ============================================
// WELCOME BANNER
// ============================================

const WelcomeBanner = memo(function WelcomeBanner({
  user,
  isAdmin,
}: {
  user: any
  isAdmin: boolean
}) {
  return (
    <div className="rounded-xl p-5 bg-gradient-to-r from-emerald-500 to-teal-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15">
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span className="text-xs font-medium text-white/90">Premium</span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/30 border border-purple-400/30">
                <Shield className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-xs font-medium text-purple-100">Admin</span>
              </div>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-white/80 text-sm">
            Track your portfolio and make your next move.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/exchange">
            <Button className="bg-white text-emerald-600 hover:bg-white/90 font-semibold px-4 h-9 text-sm">
              <Zap className="w-4 h-4 mr-2" />
              New Exchange
            </Button>
          </Link>
          <Link to="/orders">
            <Button
              variant="outline"
              className="bg-emerald-600/50 border-white/30 text-white hover:bg-emerald-600/70 font-semibold px-4 h-9 text-sm"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
})

// ============================================
// LIVE PRICE TICKER
// ============================================

const LivePriceTicker = memo(function LivePriceTicker() {
  const prices = [
    { coin: 'BTC', price: '892,450', change: '+2.4%', up: true },
    { coin: 'ETH', price: '45,230', change: '+1.8%', up: true },
    { coin: 'USDT', price: '15.85', change: '-0.1%', up: false },
    { coin: 'BNB', price: '8,450', change: '+3.2%', up: true },
    { coin: 'SOL', price: '1,000', change: '+5.6%', up: true },
  ]

  return (
    <DashboardCard compact>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Live Market</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
        {prices.map((item, index) => (
          <motion.div
            key={item.coin}
            className="flex flex-col min-w-[70px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="text-xs font-medium text-slate-500">{item.coin}</span>
            <span className="font-semibold text-sm text-slate-900 dark:text-white">₵{item.price}</span>
            <span
              className={cn(
                'text-xs flex items-center gap-0.5',
                item.up ? 'text-emerald-500' : 'text-red-500'
              )}
            >
              {item.up ? '↑' : '↓'} {item.change}
            </span>
          </motion.div>
        ))}
      </div>
    </DashboardCard>
  )
})

// ============================================
// PORTFOLIO CHART
// ============================================

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-emerald-500">
          ₵{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

const PortfolioChart = memo(function PortfolioChart({ orders }: { orders: Order[] }) {
  const chartData = useMemo(() => {
    if (!orders || orders.length === 0) {
      // Generate placeholder data showing growth
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      return days.map((day, i) => ({
        name: day,
        value: 1000 + Math.round(Math.sin(i * 0.8) * 300 + i * 200),
      }))
    }

    // Group orders by date and compute cumulative volume
    const grouped: Record<string, number> = {}
    const sortedOrders = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    sortedOrders.forEach((order) => {
      const dateKey = format(new Date(order.createdAt), 'MMM d')
      grouped[dateKey] = (grouped[dateKey] || 0) + (order.amount || 0)
    })

    let cumulative = 0
    return Object.entries(grouped).map(([name, amount]) => {
      cumulative += amount
      return { name, value: Math.round(cumulative * 100) / 100 }
    })
  }, [orders])

  return (
    <DashboardCard
      header={{
        title: 'Portfolio Activity',
        description: 'Trading volume over time',
        icon: <TrendingUp className="w-4 h-4" />,
      }}
      gradient="emerald"
      compact
    >
      <div className="h-[180px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `₵${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#portfolioGradient)"
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  )
})

// ============================================
// COIN CARD
// ============================================

const CoinCard = memo(function CoinCard({
  currency,
  amount,
  showBalance,
  index,
}: {
  currency: string
  amount: number
  showBalance: boolean
  index: number
}) {
  const getGHSValue = (curr: string, amt: number) => {
    const rates: Record<string, number> = {
      BTC: 892450,
      ETH: 45230,
      USDT: 15.85,
      BNB: 8450,
      SOL: 1000,
      XRP: 20,
      ADA: 15,
      GHS: 1,
      USD: 15.85,
    }
    return amt * (rates[curr] || 1)
  }

  const ghsValue = getGHSValue(currency, amount)
  const gradient = currencyColors[currency] || 'from-emerald-500 to-teal-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <div
        className={cn(
          'h-full p-3 rounded-lg border transition-all duration-200',
          'bg-white dark:bg-slate-800',
          'border-slate-200 dark:border-slate-700',
          'hover:border-emerald-500/30'
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-9 h-9 rounded-lg ${currencyLogos[currency] ? 'p-1' : `bg-gradient-to-br ${gradient}`} flex items-center justify-center flex-shrink-0 overflow-hidden`}
          >
            {currencyLogos[currency] ? (
              <img src={currencyLogos[currency]} alt={currency} className="w-full h-full object-contain" />
            ) : (
              <span className="font-bold text-white text-sm">
                {currencyFallbackIcons[currency] || currency[0]}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{currency}</p>
            <p className="text-xs text-slate-500">
              {currency === 'GHS' ? 'GHS' : currency === 'USD' ? 'USD' : `${currency}`}
            </p>
          </div>
        </div>

        <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
          {showBalance ? amount.toFixed(4) : '****'}{' '}
          <span className="text-xs font-medium text-slate-500">{currency}</span>
        </p>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          {showBalance ? (
            <>
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              ≈ ₵{ghsValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </>
          ) : (
            '****'
          )}
        </p>
      </div>
    </motion.div>
  )
})

// ============================================
// ORDER ITEM
// ============================================

const OrderItem = memo(function OrderItem({
  order,
  index,
}: {
  order: Order
  index: number
}) {
  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    pending: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
      label: 'Pending',
    },
    processing: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      label: 'Processing',
    },
    completed: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
      label: 'Completed',
    },
    cancelled: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      label: 'Cancelled',
    },
  }

  const config = statusConfig[order.status] || statusConfig.pending
  const isBuy = order.type === 'buy'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'p-3 rounded-lg border transition-all duration-200',
        'bg-white dark:bg-slate-800',
        'border-slate-200 dark:border-slate-700',
        'hover:border-emerald-500/30'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
            <Activity className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
              {isBuy ? (
                <>
                  <span className="text-emerald-500">Buy</span> {order.crypto}
                </>
              ) : (
                <>
                  <span className="text-blue-500">Sell</span> {order.crypto}
                </>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {format(new Date(order.createdAt), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-semibold text-slate-900 dark:text-white text-sm">
            {order.amount} {order.crypto}
          </p>
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              config.bg,
              config.color
            )}
          >
            {config.label}
          </span>
        </div>
      </div>
    </motion.div>
  )
})

// ============================================
// QUICK ACTION CARD
// ============================================

const QuickActionCard = memo(function QuickActionCard({
  icon: Icon,
  label,
  href,
  gradient,
  description,
  delay,
}: {
  icon: React.ElementType
  label: string
  href: string
  gradient: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="group"
    >
      <Link to={href} className="block h-full">
        <div
          className={cn(
            'relative p-4 rounded-lg border transition-all duration-200 overflow-hidden h-full',
            'bg-white dark:bg-slate-800',
            'border-slate-200 dark:border-slate-700',
            'hover:border-emerald-500/30'
          )}
        >
          <div
            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5">{label}</h3>
          <p className="text-xs text-slate-500">{description}</p>

          <div className="flex items-center gap-1 mt-3 text-emerald-500 font-medium text-xs">
            Get Started
            <ChevronRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

// ============================================
// ADMIN BANNER
// ============================================

const AdminBanner = memo(function AdminBanner() {
  return (
    <div className="rounded-xl bg-purple-600 p-4 text-white">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold">Admin Access</h3>
            <p className="text-white/80 text-xs">
              Access the admin dashboard to manage users and orders.
            </p>
          </div>
        </div>
        <Link to="/admin">
          <Button className="bg-white text-purple-600 hover:bg-white/90 font-semibold whitespace-nowrap h-9 px-3 text-sm">
            <Shield className="w-4 h-4 mr-2" />
            Admin
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  )
})

// ============================================
// MAIN DASHBOARD PAGE
// ============================================

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [transactionVolume, setTransactionVolume] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showBalances, setShowBalances] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [walletRes, ordersRes] = await Promise.all([
        userApi.getWallet(),
        userApi.getOrders(),
      ])

      const walletData = walletRes.data?.data?.balances || walletRes.data?.balances || {}
      setWallet({ balances: walletData })

      const ordersData = ordersRes.data?.data || ordersRes.data || []
      setOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : [])

      const allOrdersData = ordersRes.data?.data || ordersRes.data || []
      const volumeBySymbol: Record<string, number> = {}
      if (Array.isArray(allOrdersData)) {
        allOrdersData.forEach((order: any) => {
          const symbol = order.crypto || 'Unknown'
          volumeBySymbol[symbol] = (volumeBySymbol[symbol] || 0) + (order.amount || 0)
        })
      }
      setTransactionVolume(volumeBySymbol)
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalBalance = useMemo(() => {
    if (!wallet) return 0
    return Object.entries(wallet.balances).reduce((total, [currency, amount]) => {
      if (currency === 'GHS') return total + amount
      if (currency === 'USD') return total + amount * 15.85
      return total
    }, 0)
  }, [wallet])

  const stats = useMemo(
    () => ({
      totalBalance: getTotalBalance,
      pendingOrders: orders.filter((o) => o.status === 'pending').length,
      completedOrders: orders.filter((o) => o.status === 'completed').length,
      successRate:
        orders.length > 0
          ? Math.round((orders.filter((o) => o.status === 'completed').length / orders.length) * 100)
          : 0,
    }),
    [getTotalBalance, orders]
  )

  if (isLoading) {
    return (
      <>
        <div className="space-y-6">
          <CardSkeleton className="h-32" />
          <StatsSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CardSkeleton className="lg:col-span-2 h-64" />
            <CardSkeleton className="h-64" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ErrorBoundary>
        <div className="min-h-screen space-y-5">
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Admin Banner */}
            {isAdmin && <AdminBanner />}

            {/* Welcome Section */}
            <WelcomeBanner user={user} isAdmin={isAdmin || false} />

            {/* Live Price Ticker */}
            <LivePriceTicker />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                title="Total Balance"
                value={showBalances ? `₵${stats.totalBalance.toLocaleString()}` : '****'}
                subtitle="All currencies"
                icon={<Wallet className="w-4 h-4" />}
                trend={{ value: '+5.2%', positive: true }}
                color="emerald"
                delay={0}
              />
              <StatCard
                title="Pending"
                value={stats.pendingOrders}
                subtitle="Awaiting"
                icon={<Clock className="w-4 h-4" />}
                color="amber"
                delay={1}
              />
              <StatCard
                title="Completed"
                value={stats.completedOrders}
                subtitle="Successful"
                icon={<CheckCircle className="w-4 h-4" />}
                trend={{ value: '+12%', positive: true }}
                color="blue"
                delay={2}
              />
              <StatCard
                title="Success Rate"
                value={`${stats.successRate}%`}
                subtitle="All orders"
                icon={<TrendingUp className="w-4 h-4" />}
                color="purple"
                delay={3}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Portfolio Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="lg:col-span-2"
              >
                <PortfolioChart orders={orders} />
              </motion.div>

              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <DashboardCard
                  header={{
                    title: 'Recent Activity',
                    description: 'Latest transactions',
                    icon: <Activity className="w-4 h-4" />,
                  }}
                  gradient="blue"
                >
                  <div className="space-y-2">
                    {orders.length === 0 ? (
                      <EmptyState
                        icon={<History className="w-6 h-6" />}
                        title="No orders yet"
                        description="Recent orders appear here"
                      />
                    ) : (
                      orders.map((order, index) => (
                        <OrderItem key={order.id} order={order} index={index} />
                      ))
                    )}
                  </div>
                  {orders.length > 0 && (
                    <Link to="/orders">
                      <Button
                        variant="ghost"
                        className="w-full mt-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 h-9 text-sm"
                      >
                        View all
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </DashboardCard>
              </motion.div>
            </div>

            {/* Trading Volume Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <DashboardCard
                  header={{
                    title: 'Trading Volume',
                    description: 'Your crypto transaction history',
                    icon: <BarChart3 className="w-4 h-4" />,
                    action: (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setShowBalances(!showBalances)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          {showBalances ? (
                            <EyeOff className="w-4 h-4 text-slate-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-slate-500" />
                          )}
                        </button>
                        <Link to="/exchange">
                          <Button
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 h-8 text-xs"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
                            Trade
                          </Button>
                        </Link>
                      </div>
                    ),
                  }}
                  gradient="emerald"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(transactionVolume).length > 0 ? (
                      Object.entries(transactionVolume)
                        .sort(([, a], [, b]) => b - a)
                        .map(([currency, amount], index) => (
                          <CoinCard
                            key={currency}
                            currency={currency}
                            amount={amount}
                            showBalance={showBalances}
                            index={index}
                          />
                        ))
                    ) : (
                      <div className="col-span-full">
                        <EmptyState
                          icon={<Bitcoin className="w-8 h-8" />}
                          title="No transactions yet"
                          description="Start trading to see your volume here"
                          action={{
                            label: 'Start Trading',
                            onClick: () => {},
                          }}
                        />
                      </div>
                    )}
                  </div>
                </DashboardCard>
              </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <QuickActionCard
                icon={ArrowUpRight}
                label="Exchange"
                href="/exchange"
                gradient="from-emerald-500 to-teal-500"
                description="Buy & sell crypto"
                delay={0}
              />
              <QuickActionCard
                icon={History}
                label="History"
                href="/orders"
                gradient="from-blue-500 to-indigo-500"
                description="View transactions"
                delay={1}
              />
              <QuickActionCard
                icon={ArrowDownLeft}
                label="Deposit"
                href="/exchange"
                gradient="from-amber-500 to-orange-500"
                description="Add funds"
                delay={2}
              />
              <QuickActionCard
                icon={Wallet}
                label="Wallet"
                href="/profile"
                gradient="from-purple-500 to-pink-500"
                description="Manage balances"
                delay={3}
              />
            </div>
          </motion.div>
        </div>
      </ErrorBoundary>
    </>
  )
}
