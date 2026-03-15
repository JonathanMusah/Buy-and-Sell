import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { userApi } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  RefreshCw,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle,
  Bitcoin,
  ArrowLeftRight,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

// ============================================
// TYPES
// ============================================
interface Balances {
  BTC: number
  ETH: number
  USDT: number
  BNB: number
  SOL: number
  XRP: number
  ADA: number
  GHS: number
}

interface Order {
  id: string
  type: string
  cryptoSymbol: string
  amount: number
  total: number
  status: string
  createdAt: string
}

// ============================================
// CRYPTO CONFIG
// ============================================
const CRYPTO_CONFIG: Record<string, { name: string; color: string; icon: string; logo?: string }> = {
  BTC: { name: 'Bitcoin', color: 'from-orange-400 to-orange-600', icon: '₿', logo: '/crypto-logos/btc.png' },
  ETH: { name: 'Ethereum', color: 'from-indigo-400 to-indigo-600', icon: 'Ξ', logo: '/crypto-logos/eth.png' },
  USDT: { name: 'Tether', color: 'from-green-400 to-green-600', icon: '₮', logo: '/crypto-logos/usdt.png' },
  BNB: { name: 'BNB', color: 'from-yellow-400 to-yellow-600', icon: 'B', logo: '/crypto-logos/bnb.png' },
  SOL: { name: 'Solana', color: 'from-purple-400 to-purple-600', icon: 'S', logo: '/crypto-logos/sol.png' },
  XRP: { name: 'Ripple', color: 'from-blue-400 to-blue-600', icon: 'X', logo: '/crypto-logos/xrp.png' },
  ADA: { name: 'Cardano', color: 'from-cyan-400 to-cyan-600', icon: 'A', logo: '/crypto-logos/ada.png' },
  DOT: { name: 'Polkadot', color: 'from-pink-400 to-pink-600', icon: 'D', logo: '/crypto-logos/dot.png' },
  SHIB: { name: 'Shiba Inu', color: 'from-amber-400 to-amber-600', icon: 'S', logo: '/crypto-logos/shib.png' },
  GHS: { name: 'Ghana Cedis', color: 'from-emerald-400 to-emerald-600', icon: '₵', logo: '/crypto-logos/ghs.webp' },
}

// ============================================
// ASSET CARD
// ============================================
function AssetCard({
  symbol,
  balance,
  showBalance,
  index,
}: {
  symbol: string
  balance: number
  showBalance: boolean
  index: number
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const config = CRYPTO_CONFIG[symbol]
  const [copied, setCopied] = useState(false)

  if (!config) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(balance.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className={`border overflow-hidden group hover:shadow-md transition-all duration-300 ${isDark ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.logo ? 'p-1.5' : `bg-gradient-to-br ${config.color} text-white font-bold text-lg`} flex items-center justify-center shadow-sm overflow-hidden`}>
                {config.logo ? <img src={config.logo} alt={symbol} className="w-full h-full object-contain" /> : config.icon}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{symbol}</p>
                <p className="text-xs text-slate-500">{config.name}</p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy balance"
            >
              {copied ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {showBalance ? (
                symbol === 'GHS' ? `₵${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                balance.toFixed(balance > 1 ? 4 : 8)
              ) : (
                '••••••'
              )}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {showBalance ? `${symbol} balance` : 'Hidden'}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// TRANSACTION ROW
// ============================================
function TransactionRow({ order, index }: { order: Order; index: number }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const isBuy = order.type === 'buy'

  const statusConfig: Record<string, { color: string; bg: string }> = {
    completed: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    processing: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    rejected: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
    cancelled: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-900/30' },
  }
  const sc = statusConfig[order.status] || statusConfig.pending

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isBuy ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
          {isBuy ? (
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-sm text-slate-900 dark:text-white">
            {isBuy ? 'Buy' : 'Sell'} {order.cryptoSymbol}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-sm text-slate-900 dark:text-white">
          {order.amount?.toFixed(4)} {order.cryptoSymbol}
        </p>
        <Badge variant="outline" className={`text-[10px] ${sc.color} ${sc.bg} border-0`}>
          {order.status}
        </Badge>
      </div>
    </motion.div>
  )
}

// ============================================
// WALLET PAGE
// ============================================
export default function WalletPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [balances, setBalances] = useState<Balances | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    try {
      const [walletRes, ordersRes] = await Promise.all([
        userApi.getWallet(),
        userApi.getOrders(),
      ])
      const walletData = walletRes.data?.data?.balances || walletRes.data?.balances || {}
      setBalances(walletData as Balances)
      setOrders((ordersRes.data?.data || []).slice(0, 10))
      setError(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr?.response?.data?.error || 'Failed to load wallet')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    loadData(true)
    toast.success('Wallet refreshed')
  }

  // Calculate total portfolio value (GHS only for now)
  const totalGHS = balances?.GHS || 0
  const cryptoAssets = balances
    ? Object.entries(balances).filter(([k]) => k !== 'GHS' && CRYPTO_CONFIG[k])
    : []
  const activeCryptos = cryptoAssets.filter(([, v]) => v > 0).length

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-3" />
            <p className="text-slate-500">Loading wallet...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-slate-900 dark:text-white font-medium">{error}</p>
            <Button onClick={() => loadData()} className="mt-4 bg-emerald-500 hover:bg-emerald-600">
              Try Again
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage your crypto portfolio</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="gap-1.5"
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showBalances ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Portfolio Overview */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`border overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'}`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">GHS Balance</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                      {showBalances ? `₵${totalGHS.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '₵••••••'}
                    </h2>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Bitcoin className="w-4 h-4" />
                        <span>{activeCryptos} active asset{activeCryptos !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <TrendingUp className="w-4 h-4" />
                        <span>{orders.length} recent transaction{orders.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="bg-emerald-500 hover:bg-emerald-600 gap-1.5">
                      <Link to="/buy">
                        <ArrowDownLeft className="w-4 h-4" />
                        Buy Crypto
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="gap-1.5">
                      <Link to="/sell">
                        <ArrowUpRight className="w-4 h-4" />
                        Sell Crypto
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Assets Grid */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Assets</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {balances && Object.entries(balances)
                .filter(([symbol]) => CRYPTO_CONFIG[symbol])
                .sort(([, a], [, b]) => b - a)
                .map(([symbol, balance], i) => (
                  <AssetCard
                    key={symbol}
                    symbol={symbol}
                    balance={balance}
                    showBalance={showBalances}
                    index={i}
                  />
                ))
              }
            </div>
          </div>

          {/* Recent Transactions */}
          <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-md bg-blue-500">
                      <ArrowLeftRight className="w-4 h-4 text-white" />
                    </div>
                    Recent Transactions
                  </CardTitle>
                  <CardDescription>Your latest trading activity</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to="/orders">
                    View All
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Wallet className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No transactions yet</p>
                    <Button asChild className="mt-3 bg-emerald-500 hover:bg-emerald-600" size="sm">
                      <Link to="/exchange">Start Trading</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {orders.map((order, i) => (
                      <TransactionRow key={order.id} order={order} index={i} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
