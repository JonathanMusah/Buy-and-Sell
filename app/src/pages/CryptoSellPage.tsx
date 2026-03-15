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
  Copy, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Upload, 
  Wallet, 
  Shield, 
  Zap,
  Coins,
  Sparkles,
  TrendingUp,
  ChevronRight,
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
// GHANA PHONE NUMBER VALIDATION
// ============================================
const GHANA_NETWORK_PREFIXES: Record<string, string[]> = {
  'MTN': ['024', '025', '053', '054', '055', '059'],
  'Telecel': ['020', '050'],
  'AirtelTigo': ['026', '027', '056', '057'],
}

function detectNetwork(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 3) return null
  const prefix = digits.substring(0, 3)
  for (const [network, prefixes] of Object.entries(GHANA_NETWORK_PREFIXES)) {
    if (prefixes.includes(prefix)) return network
  }
  return null
}

function getExpectedNetwork(methodName: string): string | null {
  const name = methodName.toLowerCase()
  if (name.includes('mtn')) return 'MTN'
  if (name.includes('telecel')) return 'Telecel'
  if (name.includes('airteltigo') || name.includes('airtel')) return 'AirtelTigo'
  return null // bank or other — no prefix check
}

function validateGhanaPhone(phone: string, methodName: string): { valid: boolean; error: string | null } {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 0) return { valid: false, error: null }
  if (digits.length !== 10) return { valid: false, error: `Phone number must be exactly 10 digits (currently ${digits.length})` }
  if (!digits.startsWith('0')) return { valid: false, error: 'Phone number must start with 0' }

  const detectedNet = detectNetwork(digits)
  const expectedNet = getExpectedNetwork(methodName)

  if (!detectedNet) {
    return { valid: false, error: `Unrecognized prefix ${digits.substring(0, 3)}. Valid: MTN (024/025/053/054/055/059), Telecel (020/050), AirtelTigo (026/027/056/057)` }
  }

  if (expectedNet && detectedNet !== expectedNet) {
    return { valid: false, error: `${digits.substring(0, 3)} is a ${detectedNet} number, but you selected ${expectedNet}. Please use a ${expectedNet} number or change your payment method.` }
  }

  return { valid: true, error: null }
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
              Instant transfer
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

export default function CryptoSellPage({ embedded = false }: { embedded?: boolean }) {
  const { resolvedTheme } = useTheme()
  const { user } = useAuth()
  const isDark = resolvedTheme === 'dark'

  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [platformConfig, setPlatformConfig] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [copied, setCopied] = useState(false)

  const [sellData, setSellData] = useState({
    cryptoId: '',
    cryptoAmount: '',
    ghsAmount: 0,
    paymentMethodId: '',
    momoNumber: '',
    momoName: '',
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
          publicApi.getPlatformConfig(),
        ])

        const fetchedCryptos = cryptosResponse.data?.data || cryptosResponse.data || []
        const safeCryptos = Array.isArray(fetchedCryptos) ? fetchedCryptos : []
        setCryptos(safeCryptos)

        const fetchedMethods = methodsResponse.data?.data || methodsResponse.data || []
        const safeMethods = Array.isArray(fetchedMethods) ? fetchedMethods : []
        setPaymentMethods(safeMethods)

        if (configResponse.data?.data) {
          setPlatformConfig(configResponse.data.data)
        }
      } catch (error) {
        console.error('Error loading data from backend:', error)
        toast.error('Failed to load cryptocurrencies')
      }
    }

    loadData()
  }, [])

  const enabledCryptos = cryptos.filter(c => c.enabled)
  const enabledPaymentMethods = paymentMethods.filter(m => m.enabled)
  const selectedCrypto = cryptos.find(c => c.id === sellData.cryptoId)
  const selectedPaymentMethod = paymentMethods.find(p => p.id === sellData.paymentMethodId)

  // Real-time conversion calculation - derived state pattern
  useEffect(() => {
    if (sellData.cryptoAmount && selectedCrypto) {
      const amount = parseFloat(sellData.cryptoAmount)
      if (!isNaN(amount)) {
        const ghsTotal = amount * selectedCrypto.rate
        // Defer state update to avoid synchronous setState warning
        Promise.resolve().then(() => {
          setSellData(prev => ({ ...prev, ghsAmount: ghsTotal }))
        })
      }
    } else {
      // Defer state update to avoid synchronous setState warning
      Promise.resolve().then(() => {
        setSellData(prev => ({ ...prev, ghsAmount: 0 }))
      })
    }
  }, [sellData.cryptoAmount, selectedCrypto])

  const handleCopyAddress = () => {
    if (selectedCrypto?.walletAddress) {
      navigator.clipboard.writeText(selectedCrypto.walletAddress)
      setCopied(true)
      toast.success('Address copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
    if (!proofFile || !sellData.transactionId) {
      toast.error('Please upload proof and enter transaction ID')
      return
    }
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Step 1: Create the order without proof
      const orderData = {
        type: 'sell' as const,
        crypto: selectedCrypto?.symbol || '',
        amount: parseFloat(sellData.cryptoAmount),
        rate: selectedCrypto?.rate || 0,
        total: parseFloat(sellData.ghsAmount.toString()),
        paymentMethod: selectedPaymentMethod?.name || '',
        transactionId: sellData.transactionId,
      }

      const response = await ordersApi.create(orderData)
      const orderId = response.data?.data?.order?.id

      // Step 2: Upload proof as FormData
      if (orderId && proofFile) {
        const formData = new FormData()
        formData.append('proof', proofFile)
        await ordersApi.uploadProof(orderId, formData)
      }

      setCurrentStep(5)
      toast.success('Order submitted successfully!')
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(error.response?.data?.error || 'Failed to submit order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 = sellData.cryptoId && parseFloat(sellData.cryptoAmount) > 0 && selectedCrypto && parseFloat(sellData.cryptoAmount) >= selectedCrypto.minAmount && parseFloat(sellData.cryptoAmount) <= selectedCrypto.maxAmount

  // Phone validation for momo payment methods
  const phoneValidation = selectedPaymentMethod && selectedPaymentMethod.type === 'momo'
    ? validateGhanaPhone(sellData.momoNumber, selectedPaymentMethod.name)
    : { valid: sellData.momoNumber.length > 0, error: null }
  const canProceedStep3 = sellData.paymentMethodId && sellData.momoNumber && sellData.momoName && phoneValidation.valid

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
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-pink-500/10" />
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
                <Wallet className="w-6 h-6 text-white" />
              </motion.div>
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Instant Payout
              </Badge>
            </div>
            <motion.h1 
              className={`text-4xl md:text-5xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Sell Cryptocurrency
            </motion.h1>
            <motion.p 
              className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Convert your crypto to Ghana Cedis in minutes
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
          {/* Progress Sidebar */}
          <div className={`lg:col-span-4 ${embedded ? 'hidden lg:block' : ''}`}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className={`p-6 border sticky top-8 backdrop-blur-xl ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                <h3 className={`font-bold mb-6 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Progress
                </h3>
                <div className="space-y-5">
                  {[
                    { step: 1, title: 'Select Crypto & Amount', icon: Zap },
                    { step: 2, title: 'Get Wallet Address', icon: Wallet },
                    { step: 3, title: 'Choose Payment Method', icon: Shield },
                    { step: 4, title: 'Upload Proof', icon: Upload },
                    { step: 5, title: 'Processing', icon: Clock },
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
            </motion.div>
          </div>

          {/* Compact Mobile Progress - only when embedded */}
          {embedded && (
            <div className={`lg:hidden flex items-center gap-1 p-2 rounded-xl border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                    currentStep > step
                      ? 'bg-emerald-500 text-white shadow-md'
                      : currentStep === step
                        ? `bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-500/50`
                        : isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {currentStep > step ? '\u2713' : step}
                  </div>
                  <span className={`text-[8px] sm:text-[9px] font-medium truncate w-full text-center ${currentStep >= step ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                    {step === 1 ? 'Crypto' : step === 2 ? 'Wallet' : step === 3 ? 'Pay' : step === 4 ? 'Proof' : 'Done'}
                  </span>
                </div>
              ))}
            </div>
          )}

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
                    <div className={embedded ? 'mb-3 sm:mb-6' : 'mb-6'}>
                      <motion.div 
                        className="flex items-center gap-2 mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Select Cryptocurrency
                        </h2>
                      </motion.div>
                      <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Choose the crypto you want to sell
                      </p>
                    </div>

                    <div className={embedded ? 'space-y-3 sm:space-y-6' : 'space-y-6'}>
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
                                isSelected={sellData.cryptoId === crypto.id}
                                onClick={() => setSellData({ ...sellData, cryptoId: crypto.id, cryptoAmount: '', ghsAmount: 0 })}
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
                                Amount to Sell
                              </Label>
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
                                  placeholder={`Enter amount in ${selectedCrypto.symbol}`}
                                  value={sellData.cryptoAmount}
                                  onChange={(e) => setSellData({ ...sellData, cryptoAmount: e.target.value })}
                                  className={`h-16 text-xl font-semibold pl-16 pr-24 border-0 bg-transparent focus:ring-0 focus:outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'}`}
                                />
                                <span className={`absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-bold ${isDark ? 'bg-slate-600 text-emerald-400' : 'bg-slate-100 text-emerald-600'}`}>
                                  {selectedCrypto.symbol}
                                </span>
                              </div>
                            </motion.div>

                            <AnimatePresence>
                              {sellData.cryptoAmount && sellData.ghsAmount > 0 && (
                                <motion.div 
                                  className={`p-6 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'}`}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                      You will receive
                                    </p>
                                  </div>
                                  <motion.p 
                                    className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                                    key={sellData.ghsAmount}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200 }}
                                  >
                                    ₵{sellData.ghsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </motion.p>
                                  <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Ghana Cedis
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.div 
                      className={`flex gap-3 sm:gap-4 ${embedded ? 'mt-4 sm:mt-8' : 'mt-8'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div className="flex-1" whileHover={canProceedStep1 ? { scale: 1.02 } : {}} whileTap={canProceedStep1 ? { scale: 0.98 } : {}}>
                        <Button 
                          onClick={() => setCurrentStep(2)} 
                          disabled={!canProceedStep1}
                          className="w-full h-11 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 rounded-xl"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Get Wallet Address */}
              {currentStep === 2 && selectedCrypto && (
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
                        <Wallet className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Send {selectedCrypto.symbol} to Our Address
                        </h2>
                      </motion.div>
                      <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Transfer the exact amount to the wallet address below
                      </p>
                    </div>

                    <div className={embedded ? 'space-y-3 sm:space-y-6' : 'space-y-6'}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Alert className={`border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          <AlertDescription className={`${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                            <strong>Important:</strong> Send exactly {sellData.cryptoAmount} {selectedCrypto.symbol} to avoid delays
                          </AlertDescription>
                        </Alert>
                      </motion.div>

                      <motion.div 
                        className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-200'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Wallet className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                          <Label className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {selectedCrypto.symbol} Network Address
                          </Label>
                        </div>
                        <motion.div 
                          className={`p-4 rounded-xl font-mono text-sm break-all border-2 border-dashed ${isDark ? 'bg-slate-800 text-emerald-400 border-slate-600' : 'bg-white text-emerald-600 border-slate-300'}`}
                          whileHover={{ scale: 1.01, borderColor: '#10b981' }}
                        >
                          {selectedCrypto.walletAddress || 'No wallet address configured'}
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleCopyAddress}
                            variant="outline"
                            className="w-full mt-4 h-12 rounded-xl border-2"
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Address
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </motion.div>

                      <motion.div 
                        className={`p-6 rounded-xl space-y-3 border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          Transaction Summary
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Amount to send:</span>
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {sellData.cryptoAmount} {selectedCrypto.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>You will receive:</span>
                            <span className={`font-bold text-xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              ₵{sellData.ghsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    <motion.div 
                      className={`flex gap-3 sm:gap-4 ${embedded ? 'mt-4 sm:mt-8' : 'mt-8'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={() => setCurrentStep(1)} variant="outline" className="w-full h-11 sm:h-14 rounded-xl border-2 text-sm sm:text-base">
                          Back
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          onClick={() => setCurrentStep(3)} 
                          className="w-full h-11 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30 rounded-xl"
                        >
                          I've Sent the Crypto
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Choose Payment Method */}
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
                        <Shield className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <h2 className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Where Should We Send Your Money?
                        </h2>
                      </motion.div>
                      <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Select your preferred payment method
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
                              isSelected={sellData.paymentMethodId === method.id}
                              onClick={() => setSellData({ ...sellData, paymentMethodId: method.id })}
                              index={index}
                              isDark={isDark}
                            />
                          ))}
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedPaymentMethod && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Mobile Money Number
                              </Label>
                              <Input
                                type="tel"
                                placeholder="0241234567"
                                maxLength={10}
                                value={sellData.momoNumber}
                                onChange={(e) => {
                                  // Only allow digits, max 10
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                                  setSellData({ ...sellData, momoNumber: val })
                                }}
                                className={`${embedded ? 'h-11 sm:h-14' : 'h-14'} rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'} ${phoneValidation.error ? 'border-red-500 focus:border-red-500' : ''}`}
                              />
                              {sellData.momoNumber && phoneValidation.error && (
                                <motion.p
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-sm text-red-500 mt-2 flex items-center gap-1"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {phoneValidation.error}
                                </motion.p>
                              )}
                              {sellData.momoNumber && phoneValidation.valid && (() => {
                                const net = detectNetwork(sellData.momoNumber)
                                return net ? (
                                  <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-emerald-500 mt-2 flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    {net} number detected
                                  </motion.p>
                                ) : null
                              })()}
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                Account Name
                              </Label>
                              <Input
                                type="text"
                                placeholder="Your full name on the account"
                                value={sellData.momoName}
                                onChange={(e) => setSellData({ ...sellData, momoName: e.target.value })}
                                className={`${embedded ? 'h-11 sm:h-14' : 'h-14'} rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-emerald-500'}`}
                              />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.div 
                      className={`flex gap-3 sm:gap-4 ${embedded ? 'mt-4 sm:mt-8' : 'mt-8'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={() => setCurrentStep(2)} variant="outline" className="w-full h-11 sm:h-14 rounded-xl border-2 text-sm sm:text-base">
                          Back
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={canProceedStep3 ? { scale: 1.02 } : {}} whileTap={canProceedStep3 ? { scale: 0.98 } : {}}>
                        <Button 
                          onClick={() => setCurrentStep(4)} 
                          disabled={!canProceedStep3}
                          className="w-full h-11 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 shadow-lg shadow-emerald-500/30 rounded-xl"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                        </Button>
                      </motion.div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Upload Proof */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
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
                          Upload Transaction Proof
                        </h2>
                      </motion.div>
                      <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Provide proof of your crypto transfer
                      </p>
                    </div>

                    <div className={embedded ? 'space-y-3 sm:space-y-6' : 'space-y-6'}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Transaction ID / Hash
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter your blockchain transaction ID"
                          value={sellData.transactionId}
                          onChange={(e) => setSellData({ ...sellData, transactionId: e.target.value })}
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
                        <motion.div 
                          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                            proofFile
                              ? isDark ? 'border-emerald-500 bg-emerald-500/10' : 'border-emerald-500 bg-emerald-50'
                              : isDark ? 'border-slate-600 hover:border-emerald-500 hover:bg-slate-800/50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
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
                          <AnimatePresence mode="wait">
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
                                    <span className="text-sm font-medium truncate max-w-[200px] text-white">
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
                            )}
                          </AnimatePresence>
                        </motion.div>
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
                        <Button onClick={() => setCurrentStep(3)} variant="outline" className="w-full h-11 sm:h-14 rounded-xl border-2 text-sm sm:text-base">
                          Back
                        </Button>
                      </motion.div>
                      <motion.div className="flex-1" whileHover={sellData.transactionId && !isSubmitting ? { scale: 1.02 } : {}} whileTap={sellData.transactionId && !isSubmitting ? { scale: 0.98 } : {}}>
                        <Button 
                          onClick={handleSubmit}
                          disabled={!sellData.transactionId || isSubmitting}
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

              {/* Step 5: Processing */}
              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <Confetti active={currentStep === 5} />
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
                      Our team is reviewing your transaction
                    </motion.p>

                    <motion.div 
                      className={`${embedded ? 'p-3 sm:p-6 mb-4 sm:mb-8' : 'p-6 mb-8'} rounded-2xl border ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-200'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className={`${embedded ? 'space-y-2 sm:space-y-4' : 'space-y-4'} text-left`}>
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Cryptocurrency:</span>
                          <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {sellData.cryptoAmount} {selectedCrypto?.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Amount to receive:</span>
                          <span className={`font-bold text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            ₵{sellData.ghsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Payment to:</span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {sellData.momoNumber}
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
                          1. We verify your crypto transaction on the blockchain
                          <br />
                          2. Once confirmed, we send GHS to your mobile money
                          <br />
                          3. You'll receive a confirmation SMS
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
