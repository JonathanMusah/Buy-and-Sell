import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { publicApi, ordersApi } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Confetti } from '@/components/ui/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Upload, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  ShoppingCart, 
  Shield, 
  Zap,
  Coins,
  DollarSign,
  Sparkles,
  TrendingUp,
  Wallet,
  Mail,
  UserCheck,
  ArrowRight,
  ShieldAlert
} from 'lucide-react'
import { toast } from 'sonner'

interface Crypto {
  id: string
  name: string
  symbol: string
  rate: number
  networkFee: number
  minAmount: number
  maxAmount: number
  enabled: boolean
  walletAddress?: string
  image?: string
}

interface PaymentMethod {
  id: string
  name: string
  type: 'momo' | 'bank' | 'paypal' | 'stripe' | 'custom'
  accountName: string
  accountNumber: string
  fee: number
  minAmount: number
  maxAmount: number
  enabled: boolean
  icon: string
  image?: string
}

// ============================================
// MAGICAL BACKGROUND COMPONENT
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
    
    // Create magical particles
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
        
        // Connect nearby particles
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
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.6 }}
    />
  )
}

// ============================================
// FLOATING GRADIENT ORBS
// ============================================
function FloatingOrbs() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
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
        className={`absolute -bottom-20 -left-20 w-[400px] h-[400px] ${isDark ? 'bg-teal-500/10' : 'bg-teal-400/20'} rounded-full blur-[80px]`}
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
// ANIMATED CRYPTO CARD
// ============================================
interface CryptoCardProps {
  crypto: Crypto
  isSelected: boolean
  onClick: () => void
  index: number
  isDark: boolean
}

function AnimatedCryptoCard({ crypto, isSelected, onClick, index, isDark }: CryptoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.4, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative p-2 sm:p-3 rounded-xl border-2 transition-all text-left overflow-hidden ${
        isSelected
          ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 shadow-lg shadow-emerald-500/30'
          : isDark 
            ? 'border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-700/60' 
            : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-slate-50/80'
      }`}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl blur-xl"
        animate={{ opacity: isHovered || isSelected ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shine effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="relative z-10">
        {/* Compact vertical layout */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
          <motion.div 
            className="relative"
            animate={{ 
              rotate: isHovered ? [0, -5, 5, 0] : 0,
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ duration: 0.4 }}
          >
            {crypto.image ? (
              <img 
                src={crypto.image} 
                alt={crypto.symbol} 
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-lg ring-2 ring-white/20"
              />
            ) : (
              <img 
                src={`/crypto-logos/${crypto.symbol.toLowerCase()}.png`}
                alt={crypto.symbol}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain shadow-lg ring-2 ring-white/20 bg-white/10 p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.insertAdjacentHTML('afterbegin', `<div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg ring-2 ring-white/20">${crypto.symbol[0]}</div>`)
                }}
              />
            )}
            
            {/* Selection indicator */}
            <AnimatePresence>
              {isSelected && (
                <motion.div 
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <div className="text-center w-full">
            <p className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {crypto.symbol}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} break-words leading-tight`}>
              {crypto.name}
            </p>
          </div>
        </div>
        
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-200/30 dark:border-slate-700/30">
          <div className="flex items-center justify-between">
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rate</span>
            <motion.span 
              className={`text-xs sm:text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
              animate={{ scale: isHovered ? 1.05 : 1 }}
            >
              ₵{crypto.rate.toLocaleString()}
            </motion.span>
          </div>
          
          {/* Compact mini bar chart */}
          <div className="hidden sm:flex items-end gap-0.5 mt-1.5 h-2">
            {[30, 50, 40, 70, 60, 80, 45, 65].map((height, i) => (
              <motion.div
                key={i}
                className={`flex-1 rounded-sm ${isSelected ? 'bg-emerald-500/40' : isDark ? 'bg-slate-600/40' : 'bg-slate-300/40'}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ 
                  delay: index * 0.05 + i * 0.03,
                  duration: 0.4,
                  type: 'spring'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ============================================
// ANIMATED PAYMENT METHOD CARD
// ============================================
interface PaymentMethodCardProps {
  method: PaymentMethod
  isSelected: boolean
  onClick: () => void
  index: number
  isDark: boolean
}

function AnimatedPaymentMethodCard({ method, isSelected, onClick, index, isDark }: PaymentMethodCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.01, x: 5 }}
      whileTap={{ scale: 0.99 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative w-full p-5 rounded-2xl border-2 transition-all text-left overflow-hidden ${
        isSelected
          ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 shadow-lg shadow-emerald-500/20'
          : isDark 
            ? 'border-slate-700 bg-slate-800/60 hover:border-slate-600' 
            : 'border-slate-200 bg-white/80 hover:border-slate-300'
      }`}
    >
      {/* Glow effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-xl"
        animate={{ opacity: isHovered || isSelected ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shine effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shadow-lg ${
              isSelected 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' 
                : isDark 
                  ? 'bg-slate-700 text-slate-300' 
                  : 'bg-slate-100 text-slate-600'
            }`}
            animate={{ 
              rotate: isHovered ? [0, -5, 5, 0] : 0,
              scale: isHovered ? 1.1 : 1
            }}
            transition={{ duration: 0.4 }}
          >
            {method.image ? (
              <img src={method.image} alt={method.name} className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <span>{method.icon}</span>
            )}
          </motion.div>
          
          <div>
            <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {method.name}
            </p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {method.accountName}
            </p>
          </div>
        </div>
        
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  )
}

// ============================================
// PROGRESS STEP COMPONENT
// ============================================
interface ProgressStepProps {
  step: number
  title: string
  icon: React.ElementType
  isCompleted: boolean
  isCurrent: boolean
  isDark: boolean
}

function ProgressStep({ step, title, icon: Icon, isCompleted, isCurrent, isDark }: ProgressStepProps) {
  return (
    <motion.div 
      className="flex items-center gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: step * 0.1 }}
    >
      <motion.div 
        className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
          isCompleted 
            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' 
            : isCurrent 
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50' 
              : isDark 
                ? 'bg-slate-700' 
                : 'bg-slate-200'
        }`}
        animate={isCurrent ? { 
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 0 0 rgba(16, 185, 129, 0.4)',
            '0 0 0 10px rgba(16, 185, 129, 0)',
            '0 0 0 0 rgba(16, 185, 129, 0)'
          ]
        } : {}}
        transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
      >
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-white" />
        ) : (
          <Icon className={`w-6 h-6 ${isCurrent ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        )}
      </motion.div>
      
      <div>
        <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Step {step}
        </p>
        <p className={`font-bold text-sm ${isCurrent ? 'text-emerald-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </p>
      </div>
    </motion.div>
  )
}

export default function CryptoBuyPage({ embedded = false }: { embedded?: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { user } = useAuth()

  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [amountInputMode, setAmountInputMode] = useState<'crypto' | 'fiat'>('crypto')
  const [fiatCurrency, setFiatCurrency] = useState<'GHS' | 'USD'>('GHS')
  const [fiatAmount, setFiatAmount] = useState('')
  const [platformConfig, setPlatformConfig] = useState<{ emailVerification: boolean; kycRequired: boolean } | null>(null)

  const [buyData, setBuyData] = useState({
    cryptoId: '',
    cryptoAmount: '',
    ghsAmount: 0,
    paymentMethodId: '',
    transactionId: '',
  })
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)

  // Load cryptos and payment methods from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [cryptosResponse, methodsResponse, configResponse] = await Promise.all([
          publicApi.getCryptocurrencies(),
          publicApi.getPaymentMethods(),
          publicApi.getPlatformConfig().catch(() => null),
        ])

        const fetchedCryptos = cryptosResponse.data?.data || cryptosResponse.data || []
        const safeCryptos = Array.isArray(fetchedCryptos) ? fetchedCryptos : []
        setCryptos(safeCryptos)

        const fetchedMethods = methodsResponse.data?.data || methodsResponse.data || []
        const safeMethods = Array.isArray(fetchedMethods) ? fetchedMethods : []
        setPaymentMethods(safeMethods)

        if (configResponse?.data?.data) {
          setPlatformConfig(configResponse.data.data)
        }
      } catch (error) {
        console.error('Error loading data from backend:', error)
        toast.error('Failed to load cryptocurrencies. Please refresh.')
      }
    }

    loadData()
  }, [])

  // Set initial payment method
  useEffect(() => {
    if (paymentMethods.length > 0 && !buyData.paymentMethodId) {
      const enabledMethods = paymentMethods.filter(m => m.enabled)
      if (enabledMethods.length > 0) {
        setBuyData(prev => ({ ...prev, paymentMethodId: enabledMethods[0].id }))
      }
    }
  }, [paymentMethods])

  const USD_TO_GHS = 15.85

  const selectedPayment = paymentMethods.find(m => m.id === buyData.paymentMethodId)
  const selectedCrypto = cryptos.find(c => c.id === buyData.cryptoId)
  const enabledCryptos = cryptos.filter(c => c.enabled)
  const enabledPaymentMethods = paymentMethods.filter(m => m.enabled)
  const cryptoAmountValue = buyData.cryptoAmount ? parseFloat(buyData.cryptoAmount) : 0
  const usdEquivalent = buyData.ghsAmount > 0 ? buyData.ghsAmount / USD_TO_GHS : 0

  // Real-time conversions based on input mode
  useEffect(() => {
    if (amountInputMode !== 'crypto') return
    if (buyData.cryptoAmount && selectedCrypto) {
      const amount = parseFloat(buyData.cryptoAmount)
      if (!isNaN(amount)) {
        const ghsTotal = amount * selectedCrypto.rate
        setBuyData(prev => ({ ...prev, ghsAmount: ghsTotal }))
        return
      }
    }
    setBuyData(prev => ({ ...prev, ghsAmount: 0 }))
  }, [amountInputMode, buyData.cryptoAmount, selectedCrypto])

  useEffect(() => {
    if (amountInputMode !== 'fiat') return
    if (!selectedCrypto) {
      setBuyData(prev => ({ ...prev, ghsAmount: 0, cryptoAmount: '' }))
      return
    }
    if (fiatAmount) {
      const amount = parseFloat(fiatAmount)
      if (!isNaN(amount)) {
        const ghsTotal = fiatCurrency === 'USD' ? amount * USD_TO_GHS : amount
        const cryptoTotal = ghsTotal / selectedCrypto.rate
        setBuyData(prev => ({ ...prev, ghsAmount: ghsTotal, cryptoAmount: cryptoTotal ? cryptoTotal.toFixed(8) : '' }))
        return
      }
    }
    setBuyData(prev => ({ ...prev, ghsAmount: 0, cryptoAmount: '' }))
  }, [amountInputMode, fiatAmount, fiatCurrency, selectedCrypto])

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setProofFile(file)
      const previewUrl = URL.createObjectURL(file)
      setProofPreview(previewUrl)
      toast.success('Proof uploaded')
    }
  }

  const handleRemoveProof = () => {
    if (proofPreview) {
      URL.revokeObjectURL(proofPreview)
    }
    setProofFile(null)
    setProofPreview(null)
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!proofFile || !buyData.transactionId) {
      toast.error('Please upload proof and enter transaction ID')
      return
    }
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Step 1: Create the order without proof
      const orderData = {
        type: 'buy' as const,
        crypto: selectedCrypto?.symbol || '',
        amount: parseFloat(buyData.cryptoAmount),
        rate: selectedCrypto?.rate || 0,
        total: parseFloat(buyData.ghsAmount.toString()),
        paymentMethod: selectedPayment?.name || '',
        transactionId: buyData.transactionId,
      }

      const response = await ordersApi.create(orderData)
      const orderId = response.data?.data?.order?.id

      // Step 2: Upload proof as FormData
      if (orderId && proofFile) {
        const formData = new FormData()
        formData.append('proof', proofFile)
        await ordersApi.uploadProof(orderId, formData)
      }

      setCurrentStep(4)
      toast.success('Order submitted successfully!')
    } catch (error: any) {
      console.error('Order creation error:', error)
      toast.error(error.response?.data?.error || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 = buyData.cryptoId && cryptoAmountValue > 0 && selectedCrypto && cryptoAmountValue >= selectedCrypto.minAmount && cryptoAmountValue <= selectedCrypto.maxAmount
  const canProceedStep2 = buyData.paymentMethodId && selectedPayment

  // Verification gate
  const needsEmailVerification = platformConfig?.emailVerification && user && !user.emailVerified
  const needsKycVerification = platformConfig?.kycRequired && user && user.kycStatus !== 'verified'
  const isBlocked = needsEmailVerification || needsKycVerification

  return (
    <div className={embedded ? 'py-2 sm:py-6 relative' : `min-h-screen relative transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}`}>
      {/* Magical Background Effects */}
      {!embedded && <MagicalBackground />}
      {!embedded && <FloatingOrbs />}
      
      {!embedded && (
        <motion.div 
          className={`relative border-b backdrop-blur-xl ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-400/10" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <ShoppingCart className="w-6 h-6 text-white" />
              </motion.div>
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Fast Delivery
              </Badge>
            </div>
            <motion.h1 
              className={`text-4xl md:text-5xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Buy Cryptocurrency
            </motion.h1>
            <motion.p 
              className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Purchase crypto with Ghana Cedis in minutes
            </motion.p>
          </div>
        </motion.div>
      )}

      <div className={`relative max-w-6xl mx-auto ${embedded ? 'px-0 sm:px-4 py-2 sm:py-8' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
        {/* Verification Warning Banner */}
        {isBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className={`overflow-hidden border-2 ${isDark ? 'bg-slate-800/90 border-amber-500/40' : 'bg-white border-amber-400/60'}`}>
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 shrink-0">
                    <ShieldAlert className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Account Verification Required
                    </h3>
                    <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Complete the following steps before you can start trading on JDExchange.
                    </p>

                    <div className="space-y-3">
                      {needsEmailVerification && (
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Mail className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Email Verification</p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Check your inbox for the verification link</p>
                            </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0">
                            Pending
                          </Badge>
                        </div>
                      )}

                      {needsKycVerification && (
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <UserCheck className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                              <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>KYC Verification</p>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {user?.kycStatus === 'pending' ? 'Your documents are being reviewed' :
                                 user?.kycStatus === 'rejected' ? 'Your KYC was rejected — please resubmit' :
                                 'Submit your identity documents to start trading'}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            user?.kycStatus === 'pending'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800 shrink-0'
                              : user?.kycStatus === 'rejected'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 shrink-0'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800 shrink-0'
                          }>
                            {user?.kycStatus === 'pending' ? 'Under Review' : user?.kycStatus === 'rejected' ? 'Rejected' : 'Not Started'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-5">
                      {needsEmailVerification && (
                        <Link to="/settings">
                          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Mail className="w-4 h-4" />
                            Resend Verification Email
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      )}
                      {needsKycVerification && user?.kycStatus !== 'pending' && (
                        <Link to="/kyc">
                          <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                            <UserCheck className="w-4 h-4" />
                            Complete KYC
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className={isBlocked ? 'pointer-events-none opacity-40 select-none' : ''}>
        <div className={`grid grid-cols-1 lg:grid-cols-12 ${embedded ? 'gap-3 sm:gap-8' : 'gap-8'}`}>
          {/* Progress Sidebar — compact horizontal on mobile when embedded */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Desktop: full sidebar */}
              <Card className={`${embedded ? 'hidden lg:block' : ''} p-6 border sticky top-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Progress
                </h3>
                <div className="space-y-5">
                  {[
                    { step: 1, title: 'Select Crypto & Amount', icon: Coins },
                    { step: 2, title: 'Choose Payment Method', icon: DollarSign },
                    { step: 3, title: 'Upload Payment Proof', icon: Upload },
                    { step: 4, title: 'Receive Crypto', icon: Zap },
                  ].map((item) => (
                    <ProgressStep
                      key={item.step}
                      step={item.step}
                      title={item.title}
                      icon={item.icon}
                      isCompleted={currentStep > item.step}
                      isCurrent={currentStep === item.step}
                      isDark={isDark}
                    />
                  ))}
                </div>

                {/* Rate Info Card */}
                <AnimatePresence>
                  {selectedCrypto && (
                    <motion.div 
                      className={`mt-8 p-5 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-slate-700/60 border-slate-600' : 'bg-slate-100/80 border-slate-200'}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Current Rate
                        </p>
                      </div>
                      <motion.p 
                        className={`text-3xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                        key={selectedCrypto.rate}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        ₵{selectedCrypto.rate.toLocaleString()}
                      </motion.p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        per {selectedCrypto.symbol}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Mobile embedded: compact horizontal progress bar */}
              {embedded && (
                <div className={`lg:hidden flex items-center gap-1 p-2 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        currentStep > step
                          ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                          : currentStep === step
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                            : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {currentStep > step ? '✓' : step}
                      </div>
                      <span className={`text-[9px] leading-tight text-center ${currentStep === step ? 'text-emerald-500 font-semibold' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {step === 1 ? 'Crypto' : step === 2 ? 'Payment' : step === 3 ? 'Proof' : 'Done'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Main Content */}
          <div className={`lg:col-span-8 ${embedded ? 'space-y-3 sm:space-y-6' : 'space-y-6'}`}>
            <AnimatePresence mode="wait">
              {/* Step 1: Select Crypto & Amount */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className={`${embedded ? 'p-3 sm:p-6 md:p-8' : 'p-6 md:p-8'} border backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <div className={`${embedded ? 'mb-3 sm:mb-6' : 'mb-6'}`}>
                      <motion.div 
                        className="flex items-center gap-2 mb-1 sm:mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Select Cryptocurrency
                        </h2>
                      </motion.div>
                      <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Choose which crypto you want to buy
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className={`block mb-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Available Cryptocurrencies
                        </Label>
                        
                        {enabledCryptos.length === 0 ? (
                          <motion.div 
                            className={`p-8 rounded-2xl border-2 border-dashed text-center ${isDark ? 'border-slate-600 bg-slate-700/30' : 'border-slate-300 bg-slate-50'}`}
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <Coins className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              Loading cryptocurrencies...
                            </p>
                          </motion.div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-2 gap-2 sm:gap-3">
                            {enabledCryptos.map((crypto, index) => (
                              <AnimatedCryptoCard
                                key={crypto.id}
                                crypto={crypto}
                                isSelected={buyData.cryptoId === crypto.id}
                                onClick={() => {
                                  setBuyData({ ...buyData, cryptoId: crypto.id, cryptoAmount: '', ghsAmount: 0 })
                                  setFiatAmount('')
                                }}
                                index={index}
                                isDark={isDark}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      <AnimatePresence>
                        {selectedCrypto && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <Alert className={`border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                              <AlertTriangle className="w-4 h-4 text-emerald-500" />
                              <AlertDescription className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Min: {selectedCrypto.minAmount} {selectedCrypto.symbol} • Max: {selectedCrypto.maxAmount} {selectedCrypto.symbol}
                              </AlertDescription>
                            </Alert>

                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Amount to Buy
                              </Label>
                              <div className={`inline-flex p-1 rounded-xl mb-4 w-full ${isDark ? 'bg-slate-700/60' : 'bg-slate-100'}`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAmountInputMode('crypto')
                                    setFiatAmount('')
                                    setBuyData(prev => ({ ...prev, cryptoAmount: '', ghsAmount: 0 }))
                                  }}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    amountInputMode === 'crypto'
                                      ? isDark
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                        : 'bg-white text-emerald-700 shadow-sm'
                                      : isDark
                                        ? 'text-slate-400 hover:text-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                >
                                  <Coins className="w-4 h-4" />
                                  Enter Crypto
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAmountInputMode('fiat')
                                    setBuyData(prev => ({ ...prev, cryptoAmount: '', ghsAmount: 0 }))
                                  }}
                                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                    amountInputMode === 'fiat'
                                      ? isDark
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                        : 'bg-white text-emerald-700 shadow-sm'
                                      : isDark
                                        ? 'text-slate-400 hover:text-slate-200'
                                        : 'text-slate-500 hover:text-slate-700'
                                  }`}
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Enter Fiat
                                </button>
                              </div>

                              {amountInputMode === 'crypto' ? (
                                <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-white border border-slate-200'} focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all`}>
                                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <img
                                      src={selectedCrypto.image || `/crypto-logos/${selectedCrypto.symbol.toLowerCase()}.png`}
                                      alt={selectedCrypto.symbol}
                                      className="w-8 h-8 rounded-full object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.style.display = 'none'
                                        if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex'
                                      }}
                                    />
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 items-center justify-center text-white text-sm font-bold" style={{ display: 'none' }}>
                                      {selectedCrypto.symbol[0]}
                                    </div>
                                  </div>
                                  <Input
                                    type="number"
                                    step="any"
                                    placeholder="0.00"
                                    value={buyData.cryptoAmount}
                                    onChange={(e) => setBuyData({ ...buyData, cryptoAmount: e.target.value })}
                                    className={`h-16 text-xl font-semibold pl-16 pr-24 border-0 bg-transparent focus:ring-0 focus:outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                                  />
                                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-bold ${isDark ? 'bg-slate-600 text-emerald-400' : 'bg-slate-100 text-emerald-600'}`}>
                                    {selectedCrypto.symbol}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className={`relative rounded-xl overflow-hidden ${isDark ? 'bg-slate-700/50 border border-slate-600' : 'bg-white border border-slate-200'} focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all`}>
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                      {fiatCurrency === 'GHS' ? (
                                        <img src="/crypto-logos/ghs.webp" alt="GHS" className="w-8 h-8 rounded-full object-contain" />
                                      ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                          <span className="text-emerald-500 font-bold text-lg">$</span>
                                        </div>
                                      )}
                                    </div>
                                    <Input
                                      type="number"
                                      step="any"
                                      placeholder="0.00"
                                      value={fiatAmount}
                                      onChange={(e) => setFiatAmount(e.target.value)}
                                      className={`h-16 text-xl font-semibold pl-16 pr-24 border-0 bg-transparent focus:ring-0 focus:outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                                      <select
                                        value={fiatCurrency}
                                        onChange={(e) => setFiatCurrency(e.target.value as 'GHS' | 'USD')}
                                        className={`h-9 pl-3 pr-7 rounded-lg border-0 text-sm font-bold appearance-none cursor-pointer focus:ring-0 focus:outline-none ${isDark ? 'bg-slate-600 text-emerald-400' : 'bg-slate-100 text-emerald-600'}`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2310b981' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                                      >
                                        <option value="GHS">GHS</option>
                                        <option value="USD">USD</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span>You will receive approximately</span>
                                    <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                      {buyData.cryptoAmount || '0'} {selectedCrypto.symbol}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </motion.div>

                            <AnimatePresence>
                              {buyData.cryptoAmount && buyData.ghsAmount > 0 && (
                                <motion.div 
                                  className={`p-6 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'}`}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Wallet className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                      You need to pay
                                    </p>
                                  </div>
                                  <motion.p 
                                    className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                                    key={buyData.ghsAmount}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                  >
                                    ₵{buyData.ghsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </motion.p>
                                  <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Ghana Cedis
                                  </p>
                                  <p className={`text-sm mt-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                                    You will receive: {buyData.cryptoAmount} {selectedCrypto?.symbol}
                                  </p>
                                  {fiatCurrency === 'USD' && (
                                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                      ≈ ${usdEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.div 
                      className="flex gap-4 mt-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div className="flex-1" whileHover={canProceedStep1 ? { scale: 1.02 } : {}} whileTap={canProceedStep1 ? { scale: 0.98 } : {}}>
                        <Button 
                          onClick={() => setCurrentStep(2)} 
                          disabled={!canProceedStep1}
                          className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 rounded-xl"
                        >
                          Continue
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Choose Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className={`${embedded ? 'p-3 sm:p-6 md:p-8' : 'p-6 md:p-8'} border backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <div className={embedded ? 'mb-3 sm:mb-6' : 'mb-6'}>
                      <motion.div 
                        className="flex items-center gap-2 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <DollarSign className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Choose Payment Method
                        </h2>
                      </motion.div>
                      <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Select how you want to pay
                      </p>
                    </div>

                    <div className={embedded ? 'space-y-3 sm:space-y-6' : 'space-y-6'}>
                      <div>
                        <Label className={`block mb-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Payment Method
                        </Label>
                        <div className="space-y-3">
                          {enabledPaymentMethods.map((method, index) => (
                            <AnimatedPaymentMethodCard
                              key={method.id}
                              method={method}
                              isSelected={buyData.paymentMethodId === method.id}
                              onClick={() => setBuyData({ ...buyData, paymentMethodId: method.id })}
                              index={index}
                              isDark={isDark}
                            />
                          ))}
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPayment && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`p-6 rounded-xl space-y-3 border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                          >
                            <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              Payment Details
                            </p>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Account Name:</span>
                                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {selectedPayment.accountName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Account Number:</span>
                                <span className={`font-mono text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  {selectedPayment.accountNumber}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t" style={{ borderColor: isDark ? '#475569' : '#e2e8f0' }}>
                                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Amount to pay:</span>
                                <span className={`font-bold text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                  ₵{buyData.ghsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Alert className={`border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                          <Shield className="w-4 h-4 text-emerald-500" />
                          <AlertDescription className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            Send the exact amount shown above. Include your email as reference if possible.
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    </div>

                    <motion.div 
                      className={`flex gap-3 sm:gap-4 ${embedded ? 'mt-4 sm:mt-8' : 'mt-8'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={() => setCurrentStep(1)} variant="outline" className="w-full h-11 sm:h-14 rounded-xl border-2 text-sm sm:text-base">
                          Back
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={canProceedStep2 ? { scale: 1.02 } : {}} whileTap={canProceedStep2 ? { scale: 0.98 } : {}}>
                        <Button 
                          onClick={() => setCurrentStep(3)} 
                          disabled={!canProceedStep2}
                          className="w-full h-11 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-500/30 rounded-xl"
                        >
                          I've Made Payment
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Upload Proof */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className={`${embedded ? 'p-3 sm:p-6 md:p-8' : 'p-6 md:p-8'} border backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <div className={embedded ? 'mb-3 sm:mb-6' : 'mb-6'}>
                      <motion.div 
                        className="flex items-center gap-2 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Upload className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Upload Payment Proof
                        </h2>
                      </motion.div>
                      <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Provide proof of your payment
                      </p>
                    </div>

                    <div className={embedded ? 'space-y-3 sm:space-y-6' : 'space-y-6'}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Transaction ID / Reference
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter your payment transaction ID"
                          value={buyData.transactionId}
                          onChange={(e) => setBuyData({ ...buyData, transactionId: e.target.value })}
                          className={`${embedded ? 'h-11 sm:h-14 text-sm' : 'h-14'} font-mono rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'}`}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Screenshot (Optional but recommended)
                        </Label>
                        
                        {proofPreview ? (
                          <motion.div 
                            className={`relative rounded-2xl overflow-hidden border-2 ${isDark ? 'border-emerald-500/50' : 'border-emerald-500'}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <img 
                              src={proofPreview} 
                              alt="Payment proof preview" 
                              className="w-full max-h-64 object-contain bg-slate-100 dark:bg-slate-800"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                                <span className={`text-sm font-medium truncate max-w-[200px] ${isDark ? 'text-white' : 'text-white'}`}>
                                  {proofFile?.name}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <label 
                                  htmlFor="proof-upload-change" 
                                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium cursor-pointer backdrop-blur-sm transition-colors"
                                >
                                  Change
                                </label>
                                <button
                                  type="button"
                                  onClick={handleRemoveProof}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProofUpload}
                              className="hidden"
                              id="proof-upload-change"
                            />
                          </motion.div>
                        ) : (
                          <motion.div 
                            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                              isDark ? 'border-slate-600 hover:border-emerald-500 hover:bg-slate-800/50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProofUpload}
                              className="hidden"
                              id="proof-upload"
                            />
                            <label htmlFor="proof-upload" className="cursor-pointer block">
                              <motion.div 
                                className={embedded ? 'space-y-2 sm:space-y-3' : 'space-y-3'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <motion.div
                                  animate={{ y: [0, -5, 0] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                >
                                  <Upload className={`${embedded ? 'w-8 h-8 sm:w-12 sm:h-12' : 'w-12 h-12'} mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                </motion.div>
                                <div>
                                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    Click to upload screenshot
                                  </p>
                                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    PNG, JPG up to 5MB
                                  </p>
                                </div>
                              </motion.div>
                            </label>
                          </motion.div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Alert className={`border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                          <Shield className="w-4 h-4 text-emerald-500" />
                          <AlertDescription className={`${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                            Your proof will be reviewed by our team within 5-10 minutes
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    </div>

                    <motion.div 
                      className={`flex gap-3 sm:gap-4 ${embedded ? 'mt-4 sm:mt-8' : 'mt-8'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={() => setCurrentStep(2)} variant="outline" className="w-full h-11 sm:h-14 rounded-xl border-2 text-sm sm:text-base">
                          Back
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={buyData.transactionId && !isSubmitting ? { scale: 1.02 } : {}} whileTap={buyData.transactionId && !isSubmitting ? { scale: 0.98 } : {}}>
                        <Button 
                          onClick={handleSubmit}
                          disabled={!buyData.transactionId || isSubmitting}
                          className="w-full h-11 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-500/30 rounded-xl"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Order'}
                          {!isSubmitting && <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Processing */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <Confetti active={currentStep === 4} />
                  <Card className={`${embedded ? 'p-4 sm:p-8 md:p-12' : 'p-8 md:p-12'} border text-center backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <motion.div 
                      className={`inline-flex items-center justify-center ${embedded ? 'w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6' : 'w-24 h-24 mb-6'} rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 mx-auto`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <Clock className={`${embedded ? 'w-8 h-8 sm:w-12 sm:h-12' : 'w-12 h-12'} text-emerald-500`} />
                    </motion.div>
                    
                    <motion.h2 
                      className={`${embedded ? 'text-xl sm:text-3xl' : 'text-3xl'} font-bold mb-2 sm:mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      Order Submitted!
                    </motion.h2>
                    
                    <motion.p 
                      className={`text-base sm:text-lg ${embedded ? 'mb-4 sm:mb-8' : 'mb-8'} ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Our team is reviewing your payment
                    </motion.p>

                    <motion.div 
                      className={`${embedded ? 'p-3 sm:p-6 mb-4 sm:mb-8' : 'p-6 mb-8'} rounded-2xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-200'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className={`${embedded ? 'space-y-2 sm:space-y-4' : 'space-y-4'} text-left`}>
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Amount paid:</span>
                          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            ₵{buyData.ghsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>You will receive:</span>
                          <span className={`font-bold text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {buyData.cryptoAmount} {selectedCrypto?.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Payment method:</span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {selectedPayment?.name}
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Alert className={`border text-left ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <AlertDescription className={`${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          <strong>What happens next?</strong>
                          <br />
                          1. We verify your payment
                          <br />
                          2. Once confirmed, we send crypto to your wallet
                          <br />
                          3. You'll receive a confirmation email
                        </AlertDescription>
                      </Alert>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        className={`w-full ${embedded ? 'mt-4 sm:mt-8 h-11 sm:h-14 text-sm sm:text-lg' : 'mt-8 h-14 text-lg'} bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl`}
                      >
                        Back to Dashboard
                      </Button>
                    </motion.div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
