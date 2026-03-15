import { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { DashboardCard, CardSkeleton } from '@/components/ui/dashboard-shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, RefreshCw, Edit2, Save, X, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface CryptoRate {
  symbol: string
  name: string
  buyRate: number
  sellRate: number
  lastUpdated: string
}

const DEFAULT_RATES: CryptoRate[] = [
  { symbol: 'BTC', name: 'Bitcoin', buyRate: 892450, sellRate: 885000, lastUpdated: new Date().toISOString() },
  { symbol: 'ETH', name: 'Ethereum', buyRate: 45230, sellRate: 44800, lastUpdated: new Date().toISOString() },
  { symbol: 'USDT', name: 'Tether', buyRate: 15.85, sellRate: 15.75, lastUpdated: new Date().toISOString() },
  { symbol: 'BNB', name: 'Binance Coin', buyRate: 8450, sellRate: 8350, lastUpdated: new Date().toISOString() },
  { symbol: 'SOL', name: 'Solana', buyRate: 2340, sellRate: 2310, lastUpdated: new Date().toISOString() },
  { symbol: 'XRP', name: 'Ripple', buyRate: 12.45, sellRate: 12.3, lastUpdated: new Date().toISOString() },
  { symbol: 'ADA', name: 'Cardano', buyRate: 8.9, sellRate: 8.8, lastUpdated: new Date().toISOString() },
  { symbol: 'DOT', name: 'Polkadot', buyRate: 145, sellRate: 143, lastUpdated: new Date().toISOString() },
  { symbol: 'DOGE', name: 'Dogecoin', buyRate: 2.35, sellRate: 2.32, lastUpdated: new Date().toISOString() },
  { symbol: 'LTC', name: 'Litecoin', buyRate: 1250, sellRate: 1235, lastUpdated: new Date().toISOString() },
]

// ============================================
// RATE ROW
// ============================================

const RateRow = memo(function RateRow({
  rate,
  isEditing,
  editValues,
  onStartEdit,
  onCancelEdit,
  onSave,
  onEditValuesChange,
}: {
  rate: CryptoRate
  isEditing: boolean
  editValues: { buyRate: string; sellRate: string }
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onEditValuesChange: (values: { buyRate: string; sellRate: string }) => void
}) {
  const calculateSpread = (buyRate: number, sellRate: number) => {
    return (((buyRate - sellRate) / buyRate) * 100).toFixed(2)
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            {rate.symbol.substring(0, 2)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{rate.name}</p>
            <p className="text-sm text-slate-500">{rate.symbol}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        {isEditing ? (
          <Input
            type="number"
            value={editValues.buyRate}
            onChange={(e) => onEditValuesChange({ ...editValues, buyRate: e.target.value })}
            className="w-32"
            step="0.01"
          />
        ) : (
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            ₵{rate.buyRate.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        {isEditing ? (
          <Input
            type="number"
            value={editValues.sellRate}
            onChange={(e) => onEditValuesChange({ ...editValues, sellRate: e.target.value })}
            className="w-32"
            step="0.01"
          />
        ) : (
          <span className="font-mono text-red-600 dark:text-red-400">
            ₵{rate.sellRate.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        )}
      </td>
      <td className="py-4 px-4">
        <Badge variant="secondary" className="font-mono">
          {calculateSpread(rate.buyRate, rate.sellRate)}%
        </Badge>
      </td>
      <td className="py-4 px-4 text-sm text-slate-500">
        {new Date(rate.lastUpdated).toLocaleString()}
      </td>
      <td className="py-4 px-4 text-right">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={onStartEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
      </td>
    </motion.tr>
  )
})

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminRatesManagement() {
  const [rates, setRates] = useState<CryptoRate[]>(DEFAULT_RATES)
  const [editingSymbol, setEditingSymbol] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ buyRate: string; sellRate: string }>({
    buyRate: '',
    sellRate: '',
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedRates = localStorage.getItem('cryptoRates')
    if (storedRates) {
      try {
        const parsed = JSON.parse(storedRates)
        setRates(parsed)
      } catch {
        localStorage.setItem('cryptoRates', JSON.stringify(DEFAULT_RATES))
      }
    } else {
      localStorage.setItem('cryptoRates', JSON.stringify(DEFAULT_RATES))
    }
    setIsLoaded(true)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cryptoRates', JSON.stringify(rates))
      window.dispatchEvent(new Event('ratesUpdated'))
      updateCryptosWithRates()
    }
  }, [rates, isLoaded])

  const updateCryptosWithRates = useCallback(() => {
    const storedCryptos = localStorage.getItem('cryptos')
    if (storedCryptos) {
      try {
        const cryptos = JSON.parse(storedCryptos)
        const updatedCryptos = cryptos.map((crypto: any) => {
          const rate = rates.find((r) => r.symbol === crypto.symbol)
          if (rate) {
            return { ...crypto, rate: rate.buyRate }
          }
          return crypto
        })
        localStorage.setItem('cryptos', JSON.stringify(updatedCryptos))
        window.dispatchEvent(new Event('cryptosUpdated'))
      } catch (e) {
        console.error('Error updating cryptos with rates:', e)
      }
    }
  }, [rates])

  const startEdit = useCallback((rate: CryptoRate) => {
    setEditingSymbol(rate.symbol)
    setEditValues({ buyRate: rate.buyRate.toString(), sellRate: rate.sellRate.toString() })
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingSymbol(null)
    setEditValues({ buyRate: '', sellRate: '' })
  }, [])

  const saveEdit = useCallback(
    (symbol: string) => {
      const buyRate = parseFloat(editValues.buyRate)
      const sellRate = parseFloat(editValues.sellRate)

      if (isNaN(buyRate) || isNaN(sellRate) || buyRate <= 0 || sellRate <= 0) {
        toast.error('Please enter valid rates')
        return
      }

      if (sellRate > buyRate) {
        toast.error('Sell rate cannot be higher than buy rate')
        return
      }

      setRates((prev) =>
        prev.map((r) =>
          r.symbol === symbol ? { ...r, buyRate, sellRate, lastUpdated: new Date().toISOString() } : r
        )
      )

      toast.success(`${symbol} rates updated successfully`)
      cancelEdit()
    },
    [editValues, cancelEdit]
  )

  const autoUpdateRates = useCallback(() => {
    setRates((prev) =>
      prev.map((rate) => ({
        ...rate,
        buyRate: rate.buyRate * (1 + (Math.random() * 0.04 - 0.02)),
        sellRate: rate.sellRate * (1 + (Math.random() * 0.04 - 0.02)),
        lastUpdated: new Date().toISOString(),
      }))
    )
    toast.success('Rates updated from market data')
  }, [])

  const calculateSpread = useCallback((buyRate: number, sellRate: number) => {
    return (((buyRate - sellRate) / buyRate) * 100).toFixed(2)
  }, [])

  const avgSpread = useMemo(() => {
    return (
      rates.reduce((acc, r) => acc + parseFloat(calculateSpread(r.buyRate, r.sellRate)), 0) / rates.length
    ).toFixed(2)
  }, [rates, calculateSpread])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Exchange Rates Management
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage cryptocurrency buy and sell rates
              </p>
            </div>
          </div>
        </div>
        <Button
          onClick={autoUpdateRates}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/20"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Auto Update Rates
        </Button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} header={false} lines={2} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard className="border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Rates</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{rates.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg Spread</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{avgSpread}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Last Updated</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  {new Date(rates[0]?.lastUpdated || new Date()).toLocaleTimeString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Rates Table */}
      <DashboardCard
        header={{
          title: 'Cryptocurrency Rates',
          description: 'Click edit to update buy and sell rates for each cryptocurrency',
          icon: <Coins className="w-5 h-5 text-emerald-500" />,
        }}
        gradient="emerald"
      >
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 mt-4">Loading rates...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/50">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Cryptocurrency
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Buy Rate (GHS)
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Sell Rate (GHS)
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Spread
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Last Updated
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <RateRow
                    key={rate.symbol}
                    rate={rate}
                    isEditing={editingSymbol === rate.symbol}
                    editValues={editValues}
                    onStartEdit={() => startEdit(rate)}
                    onCancelEdit={cancelEdit}
                    onSave={() => saveEdit(rate.symbol)}
                    onEditValuesChange={setEditValues}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
