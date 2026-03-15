import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft, Loader2, CheckCircle, TrendingUp, Users, Shield, Zap, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Confetti } from '@/components/ui/confetti'
import { SliderCaptcha } from '@/components/ui/slider-captcha'

// ─── Password Strength Meter ───────────────────────────────────
function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  const config = [
    { label: '', color: 'bg-slate-300 dark:bg-slate-700', width: '0%' },
    { label: 'Weak', color: 'bg-red-500', width: '20%' },
    { label: 'Fair', color: 'bg-orange-500', width: '40%' },
    { label: 'Good', color: 'bg-yellow-500', width: '60%' },
    { label: 'Strong', color: 'bg-emerald-500', width: '80%' },
    { label: 'Very Strong', color: 'bg-emerald-400', width: '100%' },
  ][strength]

  if (!password) return null

  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${config.color}`}
          initial={{ width: '0%' }}
          animate={{ width: config.width }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <p className={`text-xs font-medium ${
        strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-orange-500' : strength <= 3 ? 'text-yellow-600 dark:text-yellow-500' : 'text-emerald-500'
      }`}>
        {config.label}
      </p>
    </div>
  )
}

// ─── Animation Variants ────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
}

// ─── Floating crypto logos for branding panel ──────────────────
const FLOATING_CRYPTOS = [
  { symbol: 'btc', top: '10%', left: '10%', size: 48, delay: 0 },
  { symbol: 'eth', top: '20%', right: '10%', size: 42, delay: 0.6 },
  { symbol: 'usdt', bottom: '25%', left: '12%', size: 36, delay: 1.4 },
  { symbol: 'sol', top: '50%', right: '8%', size: 40, delay: 2 },
  { symbol: 'bnb', bottom: '10%', left: '30%', size: 38, delay: 2.8 },
  { symbol: 'trx', top: '38%', left: '5%', size: 32, delay: 1 },
]

// ─── Branding Panel (Desktop Left Side) ────────────────────────
function BrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/80 to-slate-900 flex-col items-center justify-center p-8 xl:p-12">
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient gradient orbs */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[80px]"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      {/* Floating crypto logos */}
      {FLOATING_CRYPTOS.map((crypto) => (
        <motion.div
          key={crypto.symbol}
          className="absolute"
          style={{
            top: (crypto as any).top,
            left: (crypto as any).left,
            right: (crypto as any).right,
            bottom: (crypto as any).bottom,
          }}
          animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
          transition={{
            duration: 5 + crypto.delay * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: crypto.delay,
          }}
        >
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl p-2.5 border border-white/[0.08] shadow-lg">
            <img
              src={`/crypto-logos/${crypto.symbol}.png`}
              alt={crypto.symbol.toUpperCase()}
              className="object-contain"
              style={{ width: crypto.size, height: crypto.size }}
            />
          </div>
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-md">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <img src="/crypto-logos/btc.png" alt="JDExchange" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">JDExchange</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Start Your Crypto
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Journey Today
            </span>
          </h2>
          <p className="text-slate-400 mt-4 text-base lg:text-lg leading-relaxed max-w-sm mx-auto">
            Join thousands of Ghanaian traders buying and selling crypto with ease.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="space-y-3 text-left max-w-xs mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: Zap, text: 'Instant transactions with low fees' },
            { icon: Shield, text: 'Bank-grade security & 2FA protection' },
            { icon: TrendingUp, text: 'Real-time rates & market data' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm text-slate-300">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Overlapping avatars */}
          <div className="flex -space-x-2">
            {['AK', 'NM', 'JO', 'FK'].map((initials, i) => (
              <div
                key={initials}
                className={`w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold ${
                  ['bg-gradient-to-br from-emerald-400 to-emerald-600', 'bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-purple-400 to-purple-600', 'bg-gradient-to-br from-amber-400 to-amber-600'][i]
                }`}
              >
                {initials}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Sparkles key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-400">
              <span className="text-white font-semibold">2,000+</span> traders trust us
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Register Page ────────────────────────────────────────
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const { register, isAuthenticated } = useAuth()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (isAuthenticated && !registrationSuccess) {
      // If already authenticated but didn't just register, go to dashboard
      const onboardingDone = localStorage.getItem('onboarding_completed')
      navigate(onboardingDone ? '/dashboard' : '/onboarding')
    }
  }, [isAuthenticated, navigate, registrationSuccess])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions')
      return
    }

    if (!captchaVerified) {
      setError('Please complete the security verification')
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      })
      toast.success('Account created! Check your email to verify.')
      setRegistrationSuccess(true)
    } catch (err: any) {
      console.error('Register error:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Branding Panel (Desktop) ── */}
      <BrandingPanel />

      {/* ── Right Form Panel ── */}
      <div
        className={`w-full lg:w-[55%] xl:w-[52%] flex flex-col items-center relative overflow-y-auto transition-colors duration-300 ${
          isDark ? 'bg-slate-950' : 'bg-slate-50/80'
        }`}
      >
        {/* Subtle background accents */}
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900/50 to-slate-950' : 'bg-gradient-to-br from-white via-slate-50 to-emerald-50/40'}`} />
        <motion.div
          className={`absolute -top-32 -right-32 w-[400px] h-[400px] ${isDark ? 'bg-emerald-500/[0.06]' : 'bg-emerald-400/[0.08]'} rounded-full blur-[100px]`}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className={`absolute -bottom-32 -left-32 w-[350px] h-[350px] ${isDark ? 'bg-blue-500/[0.04]' : 'bg-blue-400/[0.06]'} rounded-full blur-[80px]`}
          animate={{ scale: [1.1, 0.95, 1.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Back to home */}
        <Link
          to="/"
          className={`absolute top-4 left-4 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-white/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to home</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* Form Container */}
        <motion.div
          className="relative z-10 w-full max-w-[460px] px-6 sm:px-8 py-8 pt-16 sm:pt-18 lg:pt-8 lg:mt-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile brand header (hidden on desktop) */}
          <motion.div className="lg:hidden text-center mb-6" variants={slideInLeft}>
            <div className="inline-flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <img src="/crypto-logos/btc.png" alt="JDExchange" className="w-5 h-5" />
              </div>
              <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                JDExchange
              </span>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div className="mb-6" variants={itemVariants}>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {registrationSuccess ? 'Check your email' : 'Create account'}
            </h1>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {registrationSuccess ? 'We sent you a verification link' : 'Start your crypto journey today'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {registrationSuccess ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                className="space-y-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <Confetti active={registrationSuccess} />

                <div className="flex justify-center">
                  <motion.div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                      isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                </div>

                <div
                  className={`p-4 rounded-xl ${
                    isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    We&apos;ve sent a verification email to{' '}
                    <strong className="text-emerald-600">{formData.email}</strong>. Click the link in the email to
                    verify your account.
                  </p>
                </div>

                <div
                  className={`p-4 rounded-xl ${
                    isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    What&apos;s next?
                  </p>
                  <ol
                    className={`text-sm space-y-2 list-decimal list-inside ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    <li>Verify your email address</li>
                    <li>Complete KYC verification</li>
                    <li>Start buying and selling crypto!</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => navigate('/onboarding')}
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                    >
                      Get Started
                    </Button>
                  </motion.div>
                  <Button
                    variant="outline"
                    disabled={isResending}
                    onClick={async () => {
                      setIsResending(true)
                      try {
                        await authApi.resendVerification(formData.email)
                        toast.success('Verification email resent!')
                      } catch {
                        toast.error('Failed to resend')
                      } finally {
                        setIsResending(false)
                      }
                    }}
                    className={`w-full h-11 rounded-xl font-medium ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800/60'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isResending ? 'Sending...' : "Didn't get the email? Resend"}
                  </Button>
                </div>
              </motion.div>
            ) : (
              /* ── Registration Form ── */
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -16 }}>
                {/* Error Alert */}
                {error && (
                  <motion.div variants={itemVariants} className="mb-5">
                    <Alert
                      className={`${
                        isDark
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}
                    >
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name fields */}
                  <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        First Name
                      </Label>
                      <div className="relative group">
                        <User
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                            isDark
                              ? 'text-slate-500 group-focus-within:text-emerald-400'
                              : 'text-slate-400 group-focus-within:text-emerald-500'
                          }`}
                        />
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleChange}
                          className={`pl-9 h-11 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                            isDark
                              ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Last Name
                      </Label>
                      <div className="relative group">
                        <User
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                            isDark
                              ? 'text-slate-500 group-focus-within:text-emerald-400'
                              : 'text-slate-400 group-focus-within:text-emerald-500'
                          }`}
                        />
                        <Input
                          id="lastName"
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`pl-9 h-11 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                            isDark
                              ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                          }`}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div className="space-y-1.5" variants={itemVariants}>
                    <Label htmlFor="email" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Mail
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                          isDark
                            ? 'text-slate-500 group-focus-within:text-emerald-400'
                            : 'text-slate-400 group-focus-within:text-emerald-500'
                        }`}
                      />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`pl-11 h-11 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                          isDark
                            ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                        }`}
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div className="space-y-1.5" variants={itemVariants}>
                    <Label htmlFor="phone" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Phone{' '}
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>(optional)</span>
                    </Label>
                    <div className="relative group">
                      <Phone
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                          isDark
                            ? 'text-slate-500 group-focus-within:text-emerald-400'
                            : 'text-slate-400 group-focus-within:text-emerald-500'
                        }`}
                      />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+233 20 123 4567"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`pl-11 h-11 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                          isDark
                            ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                        }`}
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div className="space-y-1.5" variants={itemVariants}>
                    <Label htmlFor="password" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Password
                    </Label>
                    <div className="relative group">
                      <Lock
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                          isDark
                            ? 'text-slate-500 group-focus-within:text-emerald-400'
                            : 'text-slate-400 group-focus-within:text-emerald-500'
                        }`}
                      />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`pl-11 pr-11 h-11 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                          isDark
                            ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                          isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <PasswordStrengthMeter password={formData.password} />
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div className="space-y-1.5" variants={itemVariants}>
                    <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Confirm Password
                    </Label>
                    <div className="relative group">
                      <Lock
                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors duration-200 ${
                          isDark
                            ? 'text-slate-500 group-focus-within:text-emerald-400'
                            : 'text-slate-400 group-focus-within:text-emerald-500'
                        }`}
                      />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`pl-11 h-11 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                          isDark
                            ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                        }`}
                        required
                      />
                      {/* Match indicator */}
                      {formData.confirmPassword && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          {formData.password === formData.confirmPassword ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-red-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Terms */}
                  <motion.div variants={itemVariants}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 w-4 h-4"
                      />
                      <span className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        I agree to the{' '}
                        <Link to="/terms" className="text-emerald-500 hover:text-emerald-400 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-emerald-500 hover:text-emerald-400 font-medium">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                  </motion.div>

                  {/* Slider CAPTCHA */}
                  <motion.div variants={itemVariants}>
                    <SliderCaptcha onVerify={setCaptchaVerified} resetKey={captchaResetKey} />
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={itemVariants}>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        disabled={isLoading || !captchaVerified}
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div className="my-5 flex items-center gap-3" variants={itemVariants}>
                  <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <span
                    className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                  >
                    Already a member?
                  </span>
                  <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </motion.div>

                {/* Login link */}
                <motion.div variants={itemVariants}>
                  <Link to="/login">
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full h-11 rounded-xl font-medium transition-all ${
                        isDark
                          ? 'border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-slate-600'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      Sign in instead
                    </Button>
                  </Link>
                </motion.div>

                {/* Trust badge */}
                <motion.div className="mt-6 text-center" variants={itemVariants}>
                  <div className={`inline-flex items-center gap-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    <Shield className="w-3.5 h-3.5" />
                    <span>Your data is encrypted and secure</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
