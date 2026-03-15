import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  Shield,
  Clock,
  Gem,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react'
import CryptoBuyPage from '@/pages/CryptoBuyPage'
import CryptoSellPage from '@/pages/CryptoSellPage'

// ============================================
// CLEAN HEADER
// ============================================
function CleanHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-800 gap-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Exchange</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          Buy and sell cryptocurrency with Ghana Cedis
        </p>
      </div>
      <div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium w-fit">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Live Market
      </div>
    </div>
  )
}

// ============================================
// COMPACT CRYPTO CARD
// ============================================
const coinNameMap: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDT: 'Tether USD',
  BNB: 'BNB',
  SOL: 'Solana',
  XRP: 'Ripple',
  ADA: 'Cardano',
  DOT: 'Polkadot'
}

const coinLogos: Record<string, string> = {
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
  GHS: '/crypto-logos/ghs.webp',
  DOT: '/crypto-logos/dot.png',
  SHIB: '/crypto-logos/shib.png',
}

function CryptoCard({ coin, price, change, up, index }: {
  coin: string
  price: string
  change: string
  up: boolean
  index: number
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const fullName = coinNameMap[coin] || coin
  const logo = coinLogos[coin]

  const coinColors: Record<string, string> = {
    BTC: 'bg-orange-500',
    ETH: 'bg-blue-500',
    USDT: 'bg-emerald-500',
    BNB: 'bg-yellow-500',
    SOL: 'bg-purple-500',
    XRP: 'bg-cyan-500',
    ADA: 'bg-indigo-500',
    DOT: 'bg-pink-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        "p-2.5 sm:p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
        isDark 
          ? "bg-slate-800/50 border-slate-700 hover:border-slate-600" 
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden shrink-0",
          logo ? '' : (coinColors[coin] || 'bg-slate-500') + ' text-white font-bold text-sm sm:text-lg'
        )}>
          {logo ? <img src={logo} alt={coin} className="w-full h-full object-contain p-0.5 sm:p-1" /> : coin[0]}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{coin}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 truncate">{fullName}</p>
        </div>
      </div>

      <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
        ₵{price}
      </p>

      <div className={cn(
        "inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium",
        up
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      )}>
        {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {change}
      </div>
    </motion.div>
  )
}

// ============================================
// CLEAN TAB BUTTONS
// ============================================
function TabButton({ active, onClick, icon: Icon, label, tabId }: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  tabId: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200",
        active
          ? tabId === 'buy'
            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
            : "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

// ============================================
// FEATURE ITEM
// ============================================
function FeatureItem({ icon: Icon, label, description }: {
  icon: React.ElementType
  label: string
  description: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border",
      isDark 
        ? "bg-slate-800/50 border-slate-700" 
        : "bg-white border-slate-200"
    )}>
      <div className={cn(
        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
        isDark ? "bg-slate-700" : "bg-slate-100"
      )}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-300" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">{label}</p>
        <p className="text-[10px] sm:text-xs text-slate-500 truncate">{description}</p>
      </div>
    </div>
  )
}

// ============================================
// COMPACT TICKER ITEM
// ============================================
function TickerItem({ coin, price, change, up }: {
  coin: string
  price: string
  change: string
  up: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap">
      <span className="font-bold text-slate-900 dark:text-white text-sm">{coin}</span>
      <span className="text-slate-600 dark:text-slate-300 text-sm">₵{price}</span>
      <span className={cn(
        "text-xs font-medium",
        up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      )}>
        {up ? '+' : ''}{change}
      </span>
    </div>
  )
}

// ============================================
// EXPANDABLE LIVE MARKET SECTION
// ============================================

// ============================================
// EXCHANGE TOUR STEPS
// ============================================
const TOUR_STEPS = [
  {
    target: 'tour-features',
    title: 'Quick Features',
    description: 'These highlights show you the key benefits of trading with JDExchange — instant execution, bank-grade security, 24/7 availability, and the best rates.',
    position: 'bottom' as const,
  },
  {
    target: 'tour-market',
    title: 'Live Market Prices',
    description: 'Track real-time cryptocurrency prices in Ghana Cedis. You can collapse this panel to a compact ticker by clicking the minimize button, and expand it again anytime.',
    position: 'bottom' as const,
  },
  {
    target: 'tour-tabs',
    title: 'Buy & Sell Tabs',
    description: 'Switch between buying and selling crypto here. Select "Buy Crypto" to purchase with Ghana Cedis, or "Sell Crypto" to convert your crypto back to Cedis.',
    position: 'bottom' as const,
  },
  {
    target: 'tour-form',
    title: 'Trade Form',
    description: 'This is where you place your orders. Choose your crypto, enter the amount, select a payment method, and submit your transaction. It\'s fast and straightforward!',
    position: 'top' as const,
  },
]

const TOUR_STORAGE_KEY = 'exchange_tour_completed'

// ============================================
// EXCHANGE TOUR OVERLAY
// ============================================
function ExchangeTour({ 
  refs, 
  onComplete 
}: { 
  refs: Record<string, React.RefObject<HTMLDivElement | null>>
  onComplete: () => void 
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null)
  const [isReady, setIsReady] = useState(false)
  const rafRef = useRef<number>(0)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Scroll to top on mount, then mark ready
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    const timer = setTimeout(() => setIsReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  // Scroll target element into view, then continuously track its position
  useEffect(() => {
    if (!isReady) return

    const step = TOUR_STEPS[currentStep]
    const ref = refs[step.target]
    if (!ref?.current) return

    // First: scroll element into view
    const el = ref.current
    const elRect = el.getBoundingClientRect()
    const scrollTarget = elRect.top + window.scrollY - 80
    window.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' })

    // Then: continuously track the element position via rAF
    // This keeps the spotlight locked to the element even while scrolling
    let active = true
    const track = () => {
      if (!active || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      setSpotlightRect(rect)
      rafRef.current = requestAnimationFrame(track)
    }
    // Small delay to let scroll start, then begin tracking
    const startTimer = setTimeout(() => {
      track()
    }, 50)

    return () => {
      active = false
      clearTimeout(startTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [currentStep, isReady, refs])

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  if (!isReady || !spotlightRect) return null

  const step = TOUR_STEPS[currentStep]
  const isLast = currentStep === TOUR_STEPS.length - 1
  const isFirst = currentStep === 0

  // Calculate tooltip position relative to viewport
  const getTooltipStyle = (): React.CSSProperties => {
    const padding = 16
    const tooltipWidth = Math.min(320, window.innerWidth - 24)
    const tooltipEstimatedHeight = 240

    let left = spotlightRect.left + spotlightRect.width / 2 - tooltipWidth / 2
    // Keep within viewport horizontally
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12))

    // Decide whether to place above or below based on available space
    const spaceBelow = window.innerHeight - spotlightRect.bottom
    const spaceAbove = spotlightRect.top

    if (step.position === 'top' || (spaceBelow < tooltipEstimatedHeight && spaceAbove > tooltipEstimatedHeight)) {
      // Place above
      return {
        position: 'fixed',
        bottom: window.innerHeight - spotlightRect.top + padding,
        left,
        width: tooltipWidth,
        zIndex: 10002,
      }
    }

    // Place below
    return {
      position: 'fixed',
      top: spotlightRect.bottom + padding,
      left,
      width: tooltipWidth,
      zIndex: 10002,
    }
  }

  const pad = 8

  return (
    <div className="fixed inset-0 z-[10000]" style={{ pointerEvents: 'auto' }}>
      {/* Dark overlay with cutout — use CSS box-shadow approach for reliability */}
      <div
        className="fixed inset-0"
        style={{
          zIndex: 10000,
          // Giant box-shadow to create the dark overlay, with the element "hole" being the div itself
          left: spotlightRect.left - pad,
          top: spotlightRect.top - pad,
          width: spotlightRect.width + pad * 2,
          height: spotlightRect.height + pad * 2,
          borderRadius: 12,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          border: '2px solid rgba(16, 185, 129, 0.5)',
          pointerEvents: 'none',
          transition: 'left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease',
        }}
      />

      {/* Block clicks on the overlay area (not the spotlight hole) */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9999 }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Tooltip */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut', delay: 0.15 }}
        style={getTooltipStyle()}
        className={cn(
          "rounded-xl border shadow-2xl p-5",
          isDark 
            ? "bg-slate-800 border-slate-700 text-white" 
            : "bg-white border-slate-200 text-slate-900"
        )}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={onComplete}
            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close tour"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <h3 className="font-semibold text-base mb-2">{step.title}</h3>
        <p className={cn(
          "text-sm leading-relaxed mb-4",
          isDark ? "text-slate-300" : "text-slate-600"
        )}>
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === currentStep
                  ? "w-6 bg-emerald-500"
                  : i < currentStep
                    ? "w-1.5 bg-emerald-500/50"
                    : "w-1.5 bg-slate-300 dark:bg-slate-600"
              )}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={onComplete}
            className={cn(
              "text-sm font-medium transition-colors",
              isDark ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={() => setCurrentStep(s => s - 1)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isDark
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                )}
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) {
                  onComplete()
                } else {
                  setCurrentStep(s => s + 1)
                }
              }}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-md shadow-emerald-500/20"
            >
              {isLast ? 'Get Started!' : 'Next'}
              {!isLast && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ExpandableLiveMarket({ 
  prices, 
  isExpanded, 
  onToggle, 
  isSticky 
}: { 
  prices: Array<{ coin: string; price: string; change: string; up: boolean }>
  isExpanded: boolean
  onToggle: () => void
  isSticky: boolean
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll ticker animation
  useEffect(() => {
    if (!isExpanded && scrollRef.current) {
      const scrollContainer = scrollRef.current
      let animationId: number
      let scrollPos = 0
      
      const animate = () => {
        scrollPos += 0.5
        if (scrollPos >= scrollContainer.scrollWidth / 2) {
          scrollPos = 0
        }
        scrollContainer.scrollLeft = scrollPos
        animationId = requestAnimationFrame(animate)
      }
      
      animationId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationId)
    }
  }, [isExpanded])

  if (isExpanded) {
    return (
      <motion.div
        key="expanded-market"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], opacity: { duration: 0.3 } }}
        className={cn(
          "rounded-xl border overflow-hidden transition-all duration-300",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200",
          isSticky && "sticky top-0 z-40 shadow-lg shadow-slate-900/10"
        )}
      >
        {/* Market Header */}
        <div className={cn(
          "px-3 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between",
          isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"
        )}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
              isDark ? "bg-slate-700" : "bg-slate-100"
            )}>
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Live Market</h3>
              <p className="text-[10px] sm:text-xs text-slate-500">Real-time prices</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live updates
            </div>
            <button
              onClick={onToggle}
              className={cn(
                "p-1.5 sm:p-2 rounded-lg transition-colors",
                isDark 
                  ? "hover:bg-slate-700 text-slate-400" 
                  : "hover:bg-slate-200 text-slate-600"
              )}
              title="Collapse"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Crypto Grid */}
        <div className="p-2 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {prices.map((price, index) => (
              <CryptoCard key={price.coin} {...price} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  // Compact ticker mode
  return (
    <motion.div
      key="compact-ticker"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "rounded-xl border overflow-hidden transition-all duration-300",
        isDark ? "bg-slate-800/90 border-slate-700" : "bg-white border-slate-200",
        isSticky && "sticky top-0 z-40 shadow-lg shadow-slate-900/10 backdrop-blur-sm"
      )}
    >
      <div className={cn(
        "px-4 py-2 flex items-center justify-between border-b",
        isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900 dark:text-white text-sm">Live Market</span>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
            isDark 
              ? "hover:bg-slate-700 text-slate-400" 
              : "hover:bg-slate-200 text-slate-600"
          )}
        >
          <Maximize2 className="w-3 h-3" />
          Expand
        </button>
      </div>
      
      {/* Scrolling Ticker */}
      <div className="relative overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Double the items for seamless loop */}
          {[...prices, ...prices].map((price, index) => (
            <TickerItem key={`${price.coin}-${index}`} {...price} />
          ))}
        </div>
        {/* Fade edges */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-8 pointer-events-none",
          isDark ? "bg-gradient-to-r from-slate-800 to-transparent" : "bg-gradient-to-r from-white to-transparent"
        )} />
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-8 pointer-events-none",
          isDark ? "bg-gradient-to-l from-slate-800 to-transparent" : "bg-gradient-to-l from-white to-transparent"
        )} />
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN EXCHANGE PAGE
// ============================================
export default function ExchangePage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [isMarketExpanded, setIsMarketExpanded] = useState(true)
  const [isMarketSticky, setIsMarketSticky] = useState(false)
  const marketRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Tour state
  const [showTour, setShowTour] = useState(false)
  const featuresRef = useRef<HTMLDivElement>(null)
  const marketTourRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const tourRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    'tour-features': featuresRef,
    'tour-market': marketTourRef,
    'tour-tabs': tabsRef,
    'tour-form': formRef,
  }

  // Show tour for first-time visitors
  useEffect(() => {
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!tourCompleted) {
      // Scroll to top first, then show tour after page fully renders
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      const timer = setTimeout(() => setShowTour(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const completeTour = useCallback(() => {
    setShowTour(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }, [])

  const prices = [
    { coin: 'BTC', price: '892,450', change: '+2.4%', up: true },
    { coin: 'ETH', price: '45,230', change: '+1.8%', up: true },
    { coin: 'USDT', price: '15.85', change: '-0.1%', up: false },
    { coin: 'BNB', price: '8,450', change: '+3.2%', up: true },
    { coin: 'SOL', price: '2,340', change: '+5.6%', up: true },
    { coin: 'XRP', price: '12.50', change: '+1.2%', up: true },
    { coin: 'ADA', price: '8.45', change: '+0.8%', up: true },
    { coin: 'DOT', price: '95.20', change: '-0.5%', up: false },
  ]

  const features = [
    { icon: Zap, label: 'Instant', description: 'Under 2 min' },
    { icon: Shield, label: 'Secure', description: 'Bank-grade' },
    { icon: Clock, label: '24/7', description: 'Always open' },
    { icon: Gem, label: 'Best Rates', description: 'Low fees' },
  ]

  // Handle scroll for sticky behavior only (no auto-collapse — user toggles manually)
  useEffect(() => {
    const handleScroll = () => {
      if (marketRef.current) {
        const rect = marketRef.current.getBoundingClientRect()
        // Only update sticky state when collapsed
        setIsMarketSticky(rect.top <= 0 && !isMarketExpanded)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMarketExpanded])

  const toggleMarket = () => {
    setIsMarketExpanded(!isMarketExpanded)
    if (!isMarketExpanded) {
      // Scroll back to top when expanding
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <div className={cn(
        "min-h-screen pb-12",
        isDark ? "bg-slate-950" : "bg-slate-50"
      )}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Clean Header */}
          <CleanHeader />

          <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Features Row */}
            <div ref={featuresRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {features.map((feature) => (
                <FeatureItem key={feature.label} {...feature} />
              ))}
            </div>

            {/* Live Market Section - Smooth Toggle */}
            <div ref={(el) => { marketRef.current = el; marketTourRef.current = el }}>
              <AnimatePresence mode="popLayout" initial={false}>
                <ExpandableLiveMarket
                  prices={prices}
                  isExpanded={isMarketExpanded}
                  onToggle={toggleMarket}
                  isSticky={isMarketSticky}
                />
              </AnimatePresence>
            </div>

            {/* Tabs */}
            <div ref={tabsRef} className="flex gap-3">
              <TabButton
                active={activeTab === 'buy'}
                onClick={() => setActiveTab('buy')}
                icon={ShoppingCart}
                label="Buy Crypto"
                tabId="buy"
              />
              <TabButton
                active={activeTab === 'sell'}
                onClick={() => setActiveTab('sell')}
                icon={Wallet}
                label="Sell Crypto"
                tabId="sell"
              />
            </div>

            {/* Tab Content */}
            <div ref={formRef}>
            <AnimatePresence mode="wait">
              {activeTab === 'buy' ? (
                <motion.div
                  key="buy"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-xl border p-2 sm:p-6",
                    isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0 text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Purchase cryptocurrency securely</span>
                  </div>
                  <CryptoBuyPage embedded />
                </motion.div>
              ) : (
                <motion.div
                  key="sell"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-xl border p-2 sm:p-6",
                    isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1 sm:px-0 text-blue-600 dark:text-blue-400">
                    <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Convert crypto to Ghana Cedis</span>
                  </div>
                  <CryptoSellPage embedded />
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Tour Overlay */}
      <AnimatePresence>
        {showTour && (
          <ExchangeTour refs={tourRefs} onComplete={completeTour} />
        )}
      </AnimatePresence>
    </>
  )
}
