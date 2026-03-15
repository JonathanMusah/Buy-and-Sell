import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2, ShieldCheck, TrendingUp, Users, Shield, Sparkles } from 'lucide-react'
import { SliderCaptcha } from '@/components/ui/slider-captcha'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// ─── Animation Variants ────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
}

// ─── Floating crypto logos for branding panel ──────────────────
const FLOATING_CRYPTOS = [
  { symbol: 'btc', top: '12%', left: '8%', size: 48, delay: 0 },
  { symbol: 'eth', top: '22%', right: '12%', size: 40, delay: 0.8 },
  { symbol: 'usdt', bottom: '28%', left: '15%', size: 36, delay: 1.6 },
  { symbol: 'bnb', top: '55%', right: '8%', size: 42, delay: 2.2 },
  { symbol: 'sol', bottom: '12%', left: '35%', size: 38, delay: 3 },
  { symbol: 'doge', top: '40%', left: '5%', size: 34, delay: 1.2 },
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
        className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-blue-500/10 rounded-full blur-[80px]"
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
            Your Gateway to
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Digital Assets
            </span>
          </h2>
          <p className="text-slate-400 mt-4 text-base lg:text-lg leading-relaxed max-w-sm mx-auto">
            Buy, sell, and trade crypto with confidence on Ghana&apos;s most trusted exchange.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-5 xl:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { icon: Users, value: '2K+', label: 'Traders' },
            { icon: TrendingUp, value: '$5M+', label: 'Volume' },
            { icon: Shield, value: '256-bit', label: 'Encryption' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-lg xl:text-xl font-bold text-white">{stat.value}</span>
              </div>
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          className="max-w-sm mx-auto bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.08]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Sparkles key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-slate-300 text-sm italic leading-relaxed">
            &ldquo;JDExchange made it so easy to start trading crypto in Ghana. The rates are great and transactions are
            instant!&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              AK
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Kwame A.</p>
              <p className="text-slate-500 text-xs">Verified Trader</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Login Page ───────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('rememberEmail') !== null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requires2FA, setRequires2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaResetKey, setCaptchaResetKey] = useState(0)
  const { login, isAuthenticated } = useAuth()
  const { resolvedTheme } = useTheme()
  const navigate = useNavigate()

  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail')
    if (savedEmail) setEmail(savedEmail)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const onboardingDone = localStorage.getItem('onboarding_completed')
      navigate(onboardingDone ? '/dashboard' : '/onboarding')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!captchaVerified) {
      setError('Please complete the security verification')
      return
    }

    setIsLoading(true)

    try {
      await login(email, password, requires2FA ? twoFactorCode : undefined)
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email)
      } else {
        localStorage.removeItem('rememberEmail')
      }
      toast.success('Welcome back!')
      const onboardingDone = localStorage.getItem('onboarding_completed')
      navigate(onboardingDone ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      console.error('Login error:', err)
      if (err.requires2FA) {
        setRequires2FA(true)
        setTwoFactorCode('')
        setError('')
      } else {
        const errorMessage = err.response?.data?.error || err.message || 'Invalid email or password. Please try again.'
        setError(errorMessage)
        toast.error(errorMessage)
      }
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
        className={`w-full lg:w-[55%] xl:w-[52%] flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300 ${
          isDark ? 'bg-slate-950' : 'bg-slate-50/80'
        }`}
      >
        {/* Subtle background accents for form side */}
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
          className="relative z-10 w-full max-w-[420px] px-6 sm:px-8 py-8 pt-16 sm:pt-18 lg:pt-8 lg:mt-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Mobile brand header (hidden on desktop) */}
          <motion.div className="lg:hidden text-center mb-8" variants={slideInLeft}>
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
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back
            </h1>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sign in to continue your crypto journey
            </p>
          </motion.div>

          {/* Error alert */}
          {error && (
            <motion.div variants={itemVariants} className="mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {!requires2FA ? (
              <>
                {/* Email */}
                <motion.div className="space-y-2" variants={itemVariants}>
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
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-11 h-12 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
                        isDark
                          ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                          : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                      }`}
                      required
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div className="space-y-2" variants={itemVariants}>
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-11 pr-11 h-12 rounded-xl text-sm transition-all duration-200 focus:ring-2 ${
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
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              /* ── 2FA Flow ── */
              <motion.div
                className="space-y-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex flex-col items-center gap-4 py-2">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Two-Factor Authentication
                    </p>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twoFactorCode" className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Verification Code
                  </Label>
                  <div className="relative group">
                    <ShieldCheck
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] transition-colors ${
                        isDark
                          ? 'text-slate-500 group-focus-within:text-emerald-400'
                          : 'text-slate-400 group-focus-within:text-emerald-500'
                      }`}
                    />
                    <Input
                      id="twoFactorCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`pl-11 h-12 rounded-xl text-center text-2xl tracking-[0.5em] font-mono transition-all duration-200 focus:ring-2 ${
                        isDark
                          ? 'bg-slate-800/60 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-emerald-500/10'
                          : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/10 shadow-sm'
                      }`}
                      autoFocus
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Remember me / Forgot password / Back to login */}
            <motion.div
              className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              variants={itemVariants}
            >
              {!requires2FA ? (
                <>
                  <label
                    className={`flex items-center gap-2.5 cursor-pointer select-none transition-colors ${
                      isDark ? 'hover:text-slate-300' : 'hover:text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 w-4 h-4"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setRequires2FA(false)
                    setTwoFactorCode('')
                    setError('')
                  }}
                  className="text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </button>
              )}
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
                  disabled={isLoading || !captchaVerified || (requires2FA && twoFactorCode.length !== 6)}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {requires2FA ? 'Verifying...' : 'Signing in...'}
                    </>
                  ) : requires2FA ? (
                    'Verify & Sign In'
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div className="my-6 flex items-center gap-3" variants={itemVariants}>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              New here?
            </span>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </motion.div>

          {/* Register link */}
          <motion.div variants={itemVariants}>
            <Link to="/register">
              <Button
                type="button"
                variant="outline"
                className={`w-full h-11 rounded-xl font-medium transition-all ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-slate-600'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                Create an account
              </Button>
            </Link>
          </motion.div>

          {/* Trust badge */}
          <motion.div className="mt-8 text-center" variants={itemVariants}>
            <div className={`inline-flex items-center gap-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              <Shield className="w-3.5 h-3.5" />
              <span>Protected by 256-bit SSL encryption</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
