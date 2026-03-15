import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { publicApi, reviewsApi } from '@/lib/apiClient'
import { motion, AnimatePresence, useInView, useSpring, useMotionValue } from 'framer-motion'
import { 
  Moon, Sun, ArrowRight, TrendingUp, Shield, Zap, 
  CheckCircle, Menu, X, Wallet, Globe, Clock, Star,
  ChevronRight, Sparkles, Bitcoin, TrendingDown,
  HelpCircle, ChevronDown, MessageSquare, Quote,
  Rocket, ArrowUpRight, Users, Loader2
} from 'lucide-react'

// ─── Typewriter rotating words ───
const DEFAULT_ROTATING_WORDS = ['Buy Bitcoin', 'Sell Ethereum', 'Trade USDT', 'Exchange Crypto']

function RotatingWords({ words }: { words?: string[] }) {
  const items = words && words.length > 0 ? words : DEFAULT_ROTATING_WORDS
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), 3000)
    return () => clearInterval(id)
  }, [items.length])

  return (
    <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={items[index]}
          initial={{ y: '100%', opacity: 0, rotateX: -90 }}
          animate={{ y: '0%', opacity: 1, rotateX: 0 }}
          exit={{ y: '-100%', opacity: 0, rotateX: 90 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
          style={{ perspective: 600 }}
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

// ─── Shimmer gradient text ───
function ShimmerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 ${className}`}
    >
      {children}
    </span>
  )
}

// ─── Mouse parallax hook (desktop only) ───
function useMouseParallax(strength = 20) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 50, damping: 20 })
  const springY = useSpring(y, { stiffness: 50, damping: 20 })

  const handleMouse = useCallback((e: MouseEvent) => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    x.set(((e.clientX - centerX) / centerX) * strength)
    y.set(((e.clientY - centerY) / centerY) * strength)
  }, [x, y, strength])

  useEffect(() => {
    // Skip on touch devices / small screens — icons are hidden anyway
    if (window.innerWidth < 1024) return
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [handleMouse])

  return { x: springX, y: springY }
}

// ─── Scroll reveal wrapper ───
function Reveal({ children, delay = 0, direction = 'up' }: { children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const directionMap = { up: { y: 60 }, left: { x: -60 }, right: { x: 60 } }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─── Floating 3D crypto icons with real logos ───
function FloatingCryptoIcons() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const mouse = useMouseParallax(15)

  const icons = [
    { logo: '/crypto-logos/btc.png', name: 'BTC', size: 'w-14 h-14', pos: 'top-[15%] left-[8%]', delay: 0 },
    { logo: '/crypto-logos/eth.png', name: 'ETH', size: 'w-12 h-12', pos: 'top-[25%] right-[10%]', delay: 0.5 },
    { logo: '/crypto-logos/usdt.png', name: 'USDT', size: 'w-10 h-10', pos: 'bottom-[30%] left-[12%]', delay: 1 },
    { logo: '/crypto-logos/sol.png', name: 'SOL', size: 'w-11 h-11', pos: 'bottom-[20%] right-[15%]', delay: 1.5 },
    { logo: '/crypto-logos/bnb.png', name: 'BNB', size: 'w-9 h-9', pos: 'top-[50%] left-[5%]', delay: 0.8 },
    { logo: '/crypto-logos/doge.png', name: 'DOGE', size: 'w-10 h-10', pos: 'top-[60%] right-[8%]', delay: 1.2 },
    { logo: '/crypto-logos/trx.png', name: 'TRX', size: 'w-9 h-9', pos: 'top-[35%] left-[15%]', delay: 2 },
  ]

  return (
    <>
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          className={`absolute ${icon.pos} ${icon.size} z-10 hidden lg:flex`}
          style={{ x: mouse.x, y: mouse.y }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: icon.delay },
            rotate: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: icon.delay },
          }}
        >
          <div className={`w-full h-full rounded-2xl ${isDark ? 'bg-slate-800/60 shadow-lg shadow-black/20 border border-white/10' : 'bg-white/80 shadow-xl shadow-black/10 border border-slate-200/50'} backdrop-blur-md flex items-center justify-center p-2`}>
            <img src={icon.logo} alt={icon.name} className="w-full h-full object-contain drop-shadow-sm" />
          </div>
        </motion.div>
      ))}
    </>
  )
}

// ─── Testimonial data ───
const FALLBACK_REVIEWS = [
  { firstName: 'Kwame', lastName: 'A.', rating: 5, text: 'Fastest crypto exchange I\'ve ever used in Ghana. Bought BTC and it was in my wallet in under a minute!', title: 'Lightning Fast' },
  { firstName: 'Ama', lastName: 'S.', rating: 5, text: 'I love that I can use Mobile Money. No complicated bank transfers. Just simple and fast.', title: 'So Convenient' },
  { firstName: 'Kofi', lastName: 'M.', rating: 5, text: 'The rates are unbeatable. I\'ve compared with other platforms and JDExchange always gives the best value.', title: 'Best Rates' },
  { firstName: 'Abena', lastName: 'D.', rating: 4, text: 'Customer support replied to me within minutes at midnight. That\'s dedication. Very impressed.', title: 'Great Support' },
  { firstName: 'Yaw', lastName: 'B.', rating: 5, text: 'Been trading for 6 months now. Never had an issue. My go-to platform for crypto in Ghana.', title: 'Reliable Platform' },
  { firstName: 'Efua', lastName: 'K.', rating: 5, text: 'The UI is beautiful and so easy to use. Even my friends who are new to crypto found it simple.', title: 'Easy to Use' },
]

const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500',
  'from-cyan-400 to-blue-500',
]

function ReviewsSection() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [paused, setPaused] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch approved reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewsApi.getApproved()
        const data = res.data?.data || []
        if (data.length > 0) {
          setReviews(data)
          const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length
          setAverageRating(Math.round(avg * 10) / 10)
        } else {
          setReviews(FALLBACK_REVIEWS)
          const avg = FALLBACK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / FALLBACK_REVIEWS.length
          setAverageRating(Math.round(avg * 10) / 10)
        }
      } catch {
        setReviews(FALLBACK_REVIEWS)
        setAverageRating(4.8)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  // Auto-scroll effect
  useEffect(() => {
    const container = containerRef.current
    if (!container || paused || loading) return
    let raf: number
    const speed = 0.4

    const scroll = () => {
      container.scrollLeft += speed
      if (container.scrollLeft >= container.scrollWidth / 2) {
        container.scrollLeft = 0
      }
      raf = requestAnimationFrame(scroll)
    }
    raf = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(raf)
  }, [paused, loading])

  const cards = reviews.length >= 3 ? [...reviews, ...reviews] : reviews // only duplicate for seamless loop if enough reviews

  return (
    <section className="py-12 sm:py-20 lg:py-32 relative overflow-hidden">
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-slate-900 to-slate-950' : 'bg-gradient-to-b from-white to-slate-50'}`} />
      {/* Decorative blobs */}
      <div className={`absolute top-20 -left-40 w-[500px] h-[500px] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-400/8'} rounded-full blur-[120px]`} />
      <div className={`absolute bottom-20 -right-40 w-[400px] h-[400px] ${isDark ? 'bg-teal-500/5' : 'bg-teal-400/8'} rounded-full blur-[100px]`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-8 sm:mb-16">
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium mb-4">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Real Reviews from Real Users
            </span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Trusted by <span className="text-emerald-500">Traders</span> Across Ghana
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              See what our community says about their trading experience on JDExchange
            </p>

            {/* Aggregate rating badge */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 sm:mt-8 inline-flex items-center gap-4"
              >
                <div className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl border ${isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-lg shadow-slate-200/50'}`}>
                  <div className="flex items-center gap-2 sm:gap-1">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < Math.floor(averageRating)
                            ? 'text-amber-400 fill-amber-400'
                            : i < averageRating
                              ? 'text-amber-400 fill-amber-400/50'
                              : 'text-slate-300 dark:text-slate-600'
                        }`} />
                      ))}
                    </div>
                    <span className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{averageRating}</span>
                  </div>
                  <div className={`hidden sm:block h-8 w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  <span className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
              </motion.div>
            )}
          </div>
        </Reveal>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            {/* Mobile: vertical stack — show max 4 to keep page short */}
            <div className="flex flex-col gap-4 sm:hidden">
              {reviews.slice(0, 4).map((review, i) => {
                const name = review.firstName
                  ? `${review.firstName} ${review.lastName?.[0] || ''}.`
                  : review.name || 'User'
                const initial = (review.firstName || review.name || 'U')[0].toUpperCase()
                const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`w-full p-4 rounded-2xl border relative ${isDark ? 'bg-slate-800/40 border-slate-700/40' : 'bg-white/90 border-slate-200 shadow-md shadow-slate-200/30'}`}
                  >
                    {/* Quote icon */}
                    <Quote className={`absolute top-3 right-3 w-6 h-6 ${isDark ? 'text-emerald-500/10' : 'text-emerald-500/8'}`} />

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} aria-hidden="true" />
                      ))}
                    </div>

                    {/* Review title */}
                    {review.title && (
                      <h4 className={`font-semibold text-sm mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {review.title}
                      </h4>
                    )}

                    {/* Review text */}
                    <p className={`mb-4 leading-relaxed text-sm line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{review.text}"
                    </p>

                    {/* Reviewer */}
                    <div className="flex items-center gap-2.5">
                      {review.profileImage ? (
                        <img
                          src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${review.profileImage}`}
                          alt={name}
                          className="w-8 h-8 rounded-full object-cover shadow-sm"
                          onError={(e) => {
                            const el = e.currentTarget
                            el.style.display = 'none'
                            const fallback = el.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} items-center justify-center text-white font-bold text-xs shadow-sm ${review.profileImage ? 'hidden' : 'flex'}`}>
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</p>
                        {review.createdAt && (
                          <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Tablet+: horizontal auto-scroll carousel */}
            <div
              ref={containerRef}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              className="hidden sm:flex gap-6 overflow-x-hidden no-scrollbar"
            >
              {cards.map((review, i) => {
                const name = review.firstName
                  ? `${review.firstName} ${review.lastName?.[0] || ''}.`
                  : review.name || 'User'
                const initial = (review.firstName || review.name || 'U')[0].toUpperCase()
                const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]

                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`flex-shrink-0 w-[360px] p-6 rounded-2xl border relative group ${isDark ? 'bg-slate-800/40 border-slate-700/40 hover:border-emerald-500/30' : 'bg-white/90 border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-xl shadow-slate-200/30'} transition-all duration-300`}
                  >
                    {/* Quote icon */}
                    <Quote className={`absolute top-4 right-4 w-8 h-8 ${isDark ? 'text-emerald-500/10' : 'text-emerald-500/8'} group-hover:text-emerald-500/20 transition-colors`} />

                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-3" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className={`w-4 h-4 ${s < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} aria-hidden="true" />
                      ))}
                    </div>

                    {/* Review title */}
                    {review.title && (
                      <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {review.title}
                      </h4>
                    )}

                    {/* Review text */}
                    <p className={`mb-5 leading-relaxed text-sm line-clamp-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{review.text}"
                    </p>

                    {/* Reviewer */}
                    <div className="flex items-center gap-3 mt-auto">
                      {review.profileImage ? (
                        <img
                          src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${review.profileImage}`}
                          alt={name}
                          className="w-10 h-10 rounded-full object-cover shadow-md"
                          onError={(e) => {
                            const el = e.currentTarget
                            el.style.display = 'none'
                            const fallback = el.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} items-center justify-center text-white font-bold text-sm shadow-md ${review.profileImage ? 'hidden' : 'flex'}`}>
                        {initial}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{name}</p>
                        {review.createdAt && (
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <div className="ml-auto">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </>
        )}

        {/* Fade edges for infinite scroll look (hidden on mobile where cards are stacked) */}
        <div className={`absolute inset-y-0 left-0 w-10 sm:w-20 bg-gradient-to-r ${isDark ? 'from-slate-950' : 'from-slate-50'} to-transparent pointer-events-none z-10 hidden sm:block`} />
        <div className={`absolute inset-y-0 right-0 w-10 sm:w-20 bg-gradient-to-l ${isDark ? 'from-slate-950' : 'from-slate-50'} to-transparent pointer-events-none z-10 hidden sm:block`} />
      </div>
    </section>
  )
}

// ─── FAQ Accordion ───
const DEFAULT_FAQ_ITEMS = [
  { q: 'How long do transactions take?', a: 'Most transactions are completed within 1-2 minutes. Once your payment is confirmed, your crypto or cash is delivered instantly to your wallet or Mobile Money account.' },
  { q: 'What payment methods are supported?', a: 'We support MTN Mobile Money, Telecel Cash, AirtelTigo Money, and direct bank transfers. You can also pay with cryptocurrency for exchanges.' },
  { q: 'Is my money safe on JDExchange?', a: 'Absolutely. We use 256-bit encryption, cold storage for crypto assets, and two-factor authentication. Your funds are protected by bank-grade security protocols.' },
  { q: 'What are the trading fees?', a: 'We charge a flat 0.5% trading fee on all transactions — one of the lowest in West Africa. No hidden charges, no withdrawal fees on Mobile Money.' },
  { q: 'Which cryptocurrencies can I trade?', a: 'You can trade Bitcoin (BTC), Ethereum (ETH), Tether (USDT), BNB, Solana (SOL), and 10+ other popular cryptocurrencies, all with Ghana Cedis.' },
  { q: 'Do I need to verify my identity?', a: 'Basic trading requires email verification. For higher limits, you\'ll need to complete KYC verification with a valid Ghana Card or passport, which takes under 5 minutes.' },
]

function FAQSection({ items }: { items?: { q: string; a: string }[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqItems = items && items.length > 0 ? items : DEFAULT_FAQ_ITEMS

  return (
    <section id="faq" className="py-20 lg:py-32 relative">
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-slate-950 to-slate-900' : 'bg-gradient-to-b from-slate-50 to-white'}`} />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </span>
            <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Frequently Asked <span className="text-emerald-500">Questions</span>
            </h2>
          </div>
        </Reveal>

        <div className="space-y-3">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <Reveal key={i} delay={i * 0.08}>
                <div className={`rounded-2xl border overflow-hidden transition-colors ${isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className={`w-full flex items-center justify-between p-5 text-left font-semibold transition-colors ${isDark ? 'text-white hover:text-emerald-400' : 'text-slate-900 hover:text-emerald-600'}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      {item.q}
                    </span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <ChevronDown className="w-5 h-5 text-emerald-500" />
                    </motion.span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        role="region"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className={`px-5 pb-5 pl-13 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Magical floating particles with trails - works in both themes
function MagicalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  
  useEffect(() => {
    // Respect reduced-motion preference
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // Fewer particles on mobile for better performance
    const isMobile = window.innerWidth < 768
    const particleCount = isMobile ? 20 : 60
    
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
    }> = []
    
    const isDark = resolvedTheme === 'dark'
    const particleColor = isDark ? '#10b981' : '#059669'
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: particleColor,
      })
    }
    
    let animationId: number
    
    const animate = () => {
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
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

      // Connection lines only on desktop (O(n²) is too expensive on mobile)
      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 100) {
              ctx.beginPath()
              ctx.moveTo(particles[i].x, particles[i].y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.strokeStyle = particleColor
              ctx.globalAlpha = (1 - dist / 100) * 0.15
              ctx.stroke()
            }
          }
        }
      }
      
      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }
    
    animate()
    
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [resolvedTheme])
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  )
}

// Animated gradient orbs - works in both themes
function GradientOrbs() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  return (
    <>
      <div className={`absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/30'} rounded-full blur-[80px] sm:blur-[120px] animate-pulse`} />
      <div className={`absolute bottom-0 right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] ${isDark ? 'bg-blue-500/15' : 'bg-blue-400/20'} rounded-full blur-[60px] sm:blur-[100px] animate-pulse`} style={{ animationDelay: '1s' }} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[800px] h-[350px] sm:h-[800px] ${isDark ? 'bg-purple-500/10' : 'bg-purple-400/15'} rounded-full blur-[80px] sm:blur-[150px] animate-pulse`} style={{ animationDelay: '2s' }} />
      <div className={`hidden sm:block absolute top-1/3 right-1/3 w-[400px] h-[400px] ${isDark ? 'bg-yellow-500/10' : 'bg-yellow-400/15'} rounded-full blur-[80px] animate-pulse`} style={{ animationDelay: '0.5s' }} />
    </>
  )
}

// Animated counter
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          const duration = 2000
          const steps = 60
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
        }
      },
      { threshold: 0.5 }
    )
    
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, hasStarted])
  
  return (
    <div ref={ref} className="text-4xl md:text-5xl lg:text-6xl font-bold">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
        {count.toLocaleString()}{suffix}
      </span>
    </div>
  )
}

// Feature card with 3D hover effect - works in both themes
function FeatureCard({ icon: Icon, title, description, delay }: { 
  icon: any
  title: string
  description: string
  delay: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 20
    const rotateY = (centerX - x) / 20
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
  }
  
  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'
  }
  
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative p-6 md:p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 ${
        isDark 
          ? 'bg-slate-800/40 border-slate-700/50' 
          : 'bg-white/60 border-slate-200/50 shadow-lg'
      }`}
      style={{ 
        animationDelay: `${delay}ms`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:to-emerald-500/5 transition-all duration-500" />
      
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      {/* Content */}
      <h3 className={`relative text-xl md:text-2xl font-bold mb-3 group-hover:text-emerald-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h3>
      <p className={`relative leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {description}
      </p>
    </div>
  )
}

// Step card with number animation
function StepCard({ step, title, description, icon: Icon }: { 
  step: string
  title: string
  description: string
  icon: any
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  return (
    <div className="relative text-center group">
      {/* Connector line */}
      <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
      
      {/* Step number with icon */}
      <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 rotate-3 group-hover:rotate-6 transition-transform duration-500" />
        <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex flex-col items-center justify-center shadow-xl shadow-emerald-500/30">
          <Icon className="w-8 h-8 text-white mb-1" />
          <span className="text-xs font-bold text-white/80">STEP {step}</span>
        </div>
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className={`max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
    </div>
  )
}

// Live price ticker
function PriceTicker() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const prices = [
    { coin: 'BTC', price: '₵892,450', change: '+2.4%', up: true },
    { coin: 'ETH', price: '₵45,230', change: '+1.8%', up: true },
    { coin: 'USDT', price: '₵15.85', change: '-0.1%', up: false },
    { coin: 'BNB', price: '₵8,450', change: '+3.2%', up: true },
    { coin: 'SOL', price: '₵2,340', change: '+5.6%', up: true },
  ]
  
  return (
    <div className={`overflow-hidden py-4 ${isDark ? 'bg-slate-900/50' : 'bg-slate-100/80'} backdrop-blur-sm border-y ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
      <div className="flex animate-marquee whitespace-nowrap">
        {[...prices, ...prices, ...prices].map((item, i) => (
          <div key={i} className="flex items-center gap-4 mx-8">
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.coin}</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{item.price}</span>
            <span className={`flex items-center gap-1 text-sm ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState({ totalUsers: 5000, totalOrders: 15000, totalVolume: 2500000 })
  const [isScrolled, setIsScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const [cms, setCms] = useState<Record<string, Record<string, any>>>({})
  
  const isDark = resolvedTheme === 'dark'

  // Helper to get CMS value with fallback
  const c = useCallback((section: string, key: string, fallback: string) => {
    return cms[section]?.[key] ?? fallback
  }, [cms])

  // Parse CMS JSON with fallback (handles both pre-parsed arrays and JSON strings)
  const cJson = useCallback((section: string, key: string, fallback: any[]) => {
    try {
      const val = cms[section]?.[key]
      if (!val) return fallback
      if (Array.isArray(val)) return val
      if (typeof val === 'string') return JSON.parse(val)
      return fallback
    } catch {
      return fallback
    }
  }, [cms])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    publicApi.getStats().then(res => setStats(res.data.data)).catch(() => {})
    publicApi.getSiteContent().then(res => {
      const data = res.data?.data || {}
      setCms(data)
    }).catch(() => {})
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  const defaultFeatures = [
    { icon: Zap, title: 'Instant Exchange', description: 'Complete transactions in under 2 minutes with our lightning-fast automated system.' },
    { icon: Shield, title: 'Bank-Grade Security', description: '256-bit encryption and cold storage protect your assets 24/7.' },
    { icon: TrendingUp, title: 'Best Rates', description: 'Competitive exchange rates with only 0.5% trading fee. Maximum value.' },
    { icon: Wallet, title: 'Mobile Money', description: 'Deposit and withdraw via MTN MoMo, Telecel Cash, and AirtelTigo.' },
    { icon: Clock, title: '24/7 Support', description: 'Our local support team is always ready to help you anytime, anywhere.' },
    { icon: Globe, title: 'Multi-Currency', description: 'Trade Bitcoin, Ethereum, USDT and 10+ cryptocurrencies in one place.' },
  ]
  const featureIcons = [Zap, Shield, TrendingUp, Wallet, Clock, Globe]
  const cmsFeatures = cJson('features', 'items', [])
  const features = cmsFeatures.length > 0
    ? cmsFeatures.map((f: any, i: number) => ({ icon: featureIcons[i % featureIcons.length], title: f.title, description: f.description }))
    : defaultFeatures

  // CMS: How It Works steps
  const defaultSteps = [
    { step: '1', title: 'Create Account', description: 'Sign up in seconds with your email and phone number', icon: Star },
    { step: '2', title: 'Add Funds', description: 'Deposit via Mobile Money or bank transfer instantly', icon: Wallet },
    { step: '3', title: 'Start Trading', description: 'Buy, sell, or exchange crypto with best rates', icon: Zap },
    { step: '4', title: 'Withdraw', description: 'Cash out to your Mobile Money wallet anytime', icon: CheckCircle },
  ]
  const stepIcons = [Star, Wallet, Zap, CheckCircle]
  const cmsSteps = cJson('how_it_works', 'steps', [])
  const howItWorksSteps = cmsSteps.length > 0
    ? cmsSteps.map((s: any, i: number) => ({ step: s.step || String(i + 1), title: s.title, description: s.description, icon: stepIcons[i % stepIcons.length] }))
    : defaultSteps

  // CMS: FAQ items  
  const faqItems = cJson('faq', 'items', [])

  // CMS: Hero
  const heroBadge = c('hero', 'badge', "West Africa's #1 Crypto Exchange")
  const heroSuffix = c('hero', 'headline_suffix', 'With Ghana Cedis')
  const heroSubtitle = c('hero', 'subtitle', 'Buy, sell, and exchange Bitcoin, Ethereum, USDT and more instantly. Secure, fast, and built for West Africa.')
  const heroHighlight = c('hero', 'subtitle_highlight', 'Secure, fast, and built for West Africa.')
  const heroRotatingWords = cJson('hero', 'rotating_words', [])
  const heroTrustBadges = cJson('hero', 'trust_badges', ['0.5% Fee', 'Instant Delivery', '24/7 Support', 'Bank-Grade Security'])

  // CMS: CTA
  const ctaBadge = c('cta', 'badge_text', 'Join 2,000+ Ghanaian traders')
  const ctaLine1 = c('cta', 'heading_line1', 'Your Crypto Journey')
  const ctaLine2 = c('cta', 'heading_line2', 'Starts Here')
  const ctaSubtitle = c('cta', 'subtitle', 'Trade Bitcoin, Ethereum & more with Ghana Cedis. Instant Mobile Money deposits, bank-grade security, and the best rates in West Africa.')
  const ctaTrustIndicators = cJson('cta', 'trust_indicators', [{ text: '256-bit Encryption' }, { text: 'Instant Settlements' }, { text: 'Trusted Community' }])
  const ctaNote = c('cta', 'note', 'No hidden fees \u00b7 Start with as little as GH\u20b5 50 \u00b7 24/7 support')

  // CMS: Features section text
  const featuresBadge = c('features', 'badge_text', 'Why Choose Us')
  const featuresHeading = c('features', 'heading', 'Everything You Need to Trade')
  const featuresSubheading = c('features', 'subheading', 'The most trusted cryptocurrency exchange in West Africa')

  // CMS: How It Works section text
  const hiwBadge = c('how_it_works', 'badge_text', 'Get Started')
  const hiwHeading = c('how_it_works', 'heading', 'How It Works')
  const hiwSubheading = c('how_it_works', 'subheading', 'Start trading in 4 simple steps')

  // CMS: Footer
  const footerDesc = c('footer', 'description', "Ghana's premier cryptocurrency exchange. Trade securely with Ghana Cedis.")
  const footerCopyright = c('footer', 'copyright', '© 2026 JDExchange. All rights reserved.')

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
              <span className={`font-bold text-xl lg:text-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                JD<span className="text-emerald-500">Exchange</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {['Features', 'How It Works', 'Stats', 'FAQ'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                  className={`relative font-medium transition-colors group ${isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-500'}`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" className={isDark ? 'text-slate-300' : 'text-slate-700'}>Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-xl ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`lg:hidden border-t overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <div className="px-4 py-4 space-y-2">
                {['Features', 'How It Works', 'Stats', 'FAQ'].map((item, i) => (
                  <motion.button
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.07 }}
                    onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
                    className={`block w-full text-left py-3 px-4 rounded-xl transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {item}
                  </motion.button>
                ))}
                {!isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} space-y-2`}
                  >
                    <Link to="/login" className="block">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/register" className="block">
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600">Get Started</Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}>
          <GradientOrbs />
          <MagicalParticles />
        </div>
        
        {/* Grid pattern overlay */}
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.05]'}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)'} 1px, transparent 1px),
                              linear-gradient(90deg, ${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />

        {/* Floating 3D crypto icons */}
        <FloatingCryptoIcons />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-8"
            >
              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </motion.span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {heroBadge}
              </span>
            </motion.div>

            {/* Main headline with rotating words */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className={`text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              <RotatingWords words={heroRotatingWords.length > 0 ? heroRotatingWords : undefined} />
              <br />
              <ShimmerText>{heroSuffix}</ShimmerText>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className={`text-lg sm:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              {heroSubtitle.replace(heroHighlight, '').trim()}
              {heroHighlight && <span className="text-emerald-500"> {heroHighlight}</span>}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {isAuthenticated ? (
                <Link to="/exchange">
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                    <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-lg px-10 h-14 shadow-xl shadow-emerald-500/30">
                      Start Trading
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-lg px-10 h-14 shadow-xl shadow-emerald-500/30 text-white">
                        Create Free Account
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" variant="outline" className={`text-lg px-10 h-14 border-2 font-semibold ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}>
                        Sign In
                      </Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className={`flex flex-wrap items-center justify-center gap-6 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
            >
              {heroTrustBadges.map((item: string, i: number) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          aria-hidden="true"
        >
          <div className={`w-6 h-10 rounded-full border-2 ${isDark ? 'border-slate-500' : 'border-slate-400'} flex justify-center pt-2`}>
            <motion.div
              className="w-1.5 h-3 rounded-full bg-emerald-500"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </section>

      {/* Price Ticker */}
      <PriceTicker />

      {/* Stats Section */}
      <section id="stats" className="py-20 lg:py-32 relative overflow-hidden">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-slate-950 to-slate-900' : 'bg-gradient-to-b from-slate-100 to-white'}`} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Trusted by <span className="text-emerald-500">Thousands</span>
              </h2>
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Join the fastest growing crypto community in West Africa</p>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: stats.totalUsers, label: 'Active Users' },
              { value: stats.totalOrders, label: 'Total Orders' },
              { value: Math.round(stats.totalVolume / 1000000), suffix: 'M+', label: 'GHS Volume' },
              { value: null, special: '<2min', label: 'Avg. Exchange' },
            ].map((stat, index) => (
              <Reveal key={index} delay={index * 0.12}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className={`text-center p-6 rounded-2xl backdrop-blur-sm border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-slate-200 shadow-lg'}`}
                >
                  {stat.value !== null ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} />
                  ) : (
                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                        {stat.special}
                      </span>
                    </div>
                  )}
                  <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900' : 'bg-gradient-to-b from-white via-slate-50 to-white'}`} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
                {featuresBadge}
              </span>
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {featuresHeading.includes('Trade') ? (
                  <>{featuresHeading.split('Trade')[0]}<span className="text-emerald-500">Trade</span>{featuresHeading.split('Trade')[1]}</>
                ) : featuresHeading}
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {featuresSubheading}
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <FeatureCard {...feature} delay={index * 100} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-400/10'} rounded-full blur-[100px]`} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
                {hiwBadge}
              </span>
              <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {hiwHeading.includes('Works') ? (
                  <>{hiwHeading.split('Works')[0]}<span className="text-emerald-500">Works</span>{hiwHeading.split('Works')[1]}</>
                ) : hiwHeading}
              </h2>
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{hiwSubheading}</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {howItWorksSteps.map((s: any, i: number) => (
              <Reveal key={i} delay={i * 0.15}>
                <StepCard {...s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection />

      {/* FAQ */}
      <FAQSection items={faqItems.length > 0 ? faqItems : undefined} />

      {/* CTA Section — Premium redesign */}
      <section className="py-24 lg:py-36 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50/60'}`} />
          {/* Accent orbs */}
          <motion.div
            className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/15'}`}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={`absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] ${isDark ? 'bg-teal-500/8' : 'bg-teal-300/15'}`}
            animate={{ scale: [1.1, 1, 1.1], x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Dot grid pattern */}
          <div
            className={`absolute inset-0 ${isDark ? 'opacity-10' : 'opacity-[0.04]'}`}
            style={{
              backgroundImage: `radial-gradient(circle at 1.5px 1.5px, ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(16,185,129,0.4)'} 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />
          {/* Light mode top/bottom border accents */}
          {!isDark && <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />}
          {!isDark && <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />}
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-8 ${isDark ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white/90' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700'}`}
              >
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <Rocket className="w-4 h-4" />
                </motion.div>
                Join {ctaBadge}
              </motion.div>

              <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {ctaLine1}
                <br />
                <span className={`bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-emerald-200 via-white to-teal-200' : 'from-emerald-600 via-teal-500 to-emerald-600'}`}>
                  {ctaLine2}
                </span>
              </h2>

              <p className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-emerald-100/80' : 'text-slate-600'}`}>
                {ctaSubtitle}
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
                {ctaTrustIndicators.map((item: any, i: number) => {
                  const trustIcons = [Shield, Zap, Users]
                  const TrustIcon = trustIcons[i % trustIcons.length]
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={`flex items-center gap-2 text-sm ${isDark ? 'text-white/70' : 'text-slate-500'}`}
                    >
                      <TrustIcon className={`w-4 h-4 ${isDark ? 'text-emerald-300' : 'text-emerald-500'}`} />
                      {item.text}
                    </motion.div>
                  )
                })}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated ? (
                  <Link to="/exchange">
                    <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                      <Button size="lg" className="text-lg px-10 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 font-bold shadow-xl shadow-emerald-500/25">
                        Start Trading Now
                        <ArrowUpRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" className="text-lg px-10 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 font-bold shadow-xl shadow-emerald-500/25">
                          Create Free Account
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                    </Link>
                    <Link to="/login">
                      <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
                        <Button size="lg" variant="outline" className={`text-lg px-10 h-14 border-2 font-semibold ${isDark ? 'border-white/30 text-white hover:bg-white/10 backdrop-blur-sm' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}>
                          Sign In
                        </Button>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>

              {/* Subtle note */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`mt-6 text-sm ${isDark ? 'text-white/40' : 'text-slate-400'}`}
              >
                {ctaNote}
              </motion.p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 border-t ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-white" />
                </div>
                <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  JD<span className="text-emerald-500">Exchange</span>
                </span>
              </Link>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {footerDesc}
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/exchange" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Exchange</Link></li>
                <li><Link to="/dashboard" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Dashboard</Link></li>
                <li><Link to="/orders" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@jdexchange.com" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Help Center</a></li>
                <li><a href="mailto:contact@jdexchange.com" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Contact Us</a></li>
                <li><a href="#faq" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/terms" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Terms of Service</a></li>
                <li><a href="/privacy" className={`hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className={`border-t pt-8 text-center text-sm ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-600'}`}>
            <p>{footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
