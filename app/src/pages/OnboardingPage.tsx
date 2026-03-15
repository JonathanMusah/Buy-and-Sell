import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Confetti } from '@/components/ui/confetti'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Bitcoin,
  Shield,
  Zap,
  Wallet,
  ArrowRightLeft,
  Bell,
  Moon,
  Sun,
  Monitor,
  CheckCircle,
  Rocket,
  PartyPopper,
  Lock,
  Globe,
  TrendingUp,
  Users,
  Clock,
  Fingerprint,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Constants ─────────────────────────────────────────────────
const TOTAL_STEPS = 5

// ─── Floating Particles ────────────────────────────────────────
const PARTICLE_SEEDS = Array.from({ length: 20 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 3,
}))

function OnboardingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLE_SEEDS.map((seed, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-500/30"
          style={{
            left: `${seed.left}%`,
            top: `${seed.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: seed.duration,
            repeat: Infinity,
            delay: seed.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Step Progress Bar ─────────────────────────────────────────
function StepProgress({ currentStep, totalSteps, isDark }: { currentStep: number; totalSteps: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-xs mx-auto">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex-1 relative">
          <div className={cn(
            'h-1.5 rounded-full transition-all duration-500',
            isDark ? 'bg-slate-700' : 'bg-slate-200'
          )}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              initial={{ width: '0%' }}
              animate={{ width: i < currentStep ? '100%' : i === currentStep ? '50%' : '0%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Step 0: Welcome ───────────────────────────────────────────
function WelcomeStep({ firstName, isDark }: { firstName: string; isDark: boolean }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated logo */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <Bitcoin className="w-12 h-12 text-white" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-amber-400" />
        </motion.div>
      </motion.div>

      <motion.h1
        className={cn('text-3xl sm:text-4xl font-bold mb-3', isDark ? 'text-white' : 'text-slate-900')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Welcome, <span className="text-emerald-500">{firstName}!</span>
      </motion.h1>

      <motion.p
        className={cn('text-base sm:text-lg max-w-md mb-8', isDark ? 'text-slate-400' : 'text-slate-600')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        You&apos;re about to join thousands of traders on Ghana&apos;s fastest crypto exchange. Let&apos;s get you set up in under a minute.
      </motion.p>

      {/* Stats preview */}
      <motion.div
        className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: Users, value: '5K+', label: 'Traders' },
          { icon: TrendingUp, value: '15K+', label: 'Trades' },
          { icon: Clock, value: '<1min', label: 'Speed' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={cn(
              'flex flex-col items-center p-3 rounded-2xl border',
              isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white/80 border-slate-200 shadow-sm'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <stat.icon className="w-5 h-5 text-emerald-500 mb-1" />
            <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>{stat.value}</span>
            <span className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Step 1: Feature Tour ──────────────────────────────────────
const FEATURES = [
  {
    icon: ArrowRightLeft,
    title: 'Instant Exchange',
    description: 'Buy & sell crypto with Mobile Money, Bank Transfer, or card. Trades settle in under a minute.',
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
  },
  {
    icon: Wallet,
    title: 'Secure Wallet',
    description: 'Your crypto is stored safely. View balances, track your portfolio, and manage your assets.',
    color: 'from-blue-500 to-indigo-500',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'Two-factor authentication, encrypted storage, and KYC verification to keep your funds safe.',
    color: 'from-purple-500 to-pink-500',
    shadowColor: 'shadow-purple-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Best Rates',
    description: 'Competitive exchange rates updated in real-time. No hidden fees — what you see is what you get.',
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/20',
  },
]

function FeatureTourStep({ isDark }: { isDark: boolean }) {
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const feature = FEATURES[activeFeature]
  const FeatureIcon = feature.icon

  return (
    <motion.div
      className="flex flex-col items-center text-center px-4 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6',
          isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Zap className="w-3.5 h-3.5" />
        WHAT YOU CAN DO
      </motion.div>

      {/* Feature card with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFeature}
          className="w-full max-w-sm mb-8"
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={cn(
            'p-6 rounded-3xl border relative overflow-hidden',
            isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200 shadow-lg'
          )}>
            {/* Background glow */}
            <div className={cn(
              'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20',
              `bg-gradient-to-br ${feature.color}`
            )} />

            <div className="relative">
              <motion.div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg mx-auto',
                  `bg-gradient-to-br ${feature.color} ${feature.shadowColor}`
                )}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              >
                <FeatureIcon className="w-8 h-8 text-white" />
              </motion.div>

              <h3 className={cn('text-xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
                {feature.title}
              </h3>
              <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>
                {feature.description}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feature dots */}
      <div className="flex items-center gap-3">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <button
              key={i}
              onClick={() => setActiveFeature(i)}
              className={cn(
                'relative p-2.5 rounded-xl transition-all duration-300',
                i === activeFeature
                  ? isDark ? 'bg-emerald-500/20 ring-2 ring-emerald-500/50' : 'bg-emerald-50 ring-2 ring-emerald-300'
                  : isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
              )}
              aria-label={f.title}
            >
              <Icon className={cn(
                'w-5 h-5 transition-colors',
                i === activeFeature ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'
              )} />
              {i === activeFeature && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-emerald-500"
                  layoutId="featureDot"
                  style={{ x: '-50%' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Step 2: Preferences ───────────────────────────────────────
function PreferencesStep({ isDark, currentTheme, onThemeChange }: { isDark: boolean; currentTheme: string; onThemeChange: (theme: string) => void }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const themes = [
    { value: 'light', icon: Sun, label: 'Light', description: 'Clean & bright' },
    { value: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
    { value: 'system', icon: Monitor, label: 'System', description: 'Match your device' },
  ]

  return (
    <motion.div
      className="flex flex-col items-center text-center px-4 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6',
          isDark ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-purple-50 text-purple-600 border border-purple-200'
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Sparkles className="w-3.5 h-3.5" />
        PERSONALIZE
      </motion.div>

      <motion.h2
        className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Make it yours
      </motion.h2>
      <motion.p
        className={cn('text-sm mb-8 max-w-sm', isDark ? 'text-slate-400' : 'text-slate-600')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Choose your preferred look and notification settings
      </motion.p>

      {/* Theme selector */}
      <motion.div
        className="w-full max-w-sm mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <p className={cn('text-xs font-semibold uppercase tracking-wider mb-3 text-left', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Appearance
        </p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon
            const isSelected = currentTheme === theme.value
            return (
              <motion.button
                key={theme.value}
                onClick={() => onThemeChange(theme.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300',
                  isSelected
                    ? isDark
                      ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                      : 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
                    : isDark
                      ? 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </motion.div>
                )}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                    : isDark ? 'bg-slate-700' : 'bg-slate-100'
                )}>
                  <Icon className={cn('w-5 h-5', isSelected ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500')} />
                </div>
                <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{theme.label}</span>
                <span className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>{theme.description}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Notifications toggle */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className={cn('text-xs font-semibold uppercase tracking-wider mb-3 text-left', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Notifications
        </p>
        <button
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300',
            notificationsEnabled
              ? isDark
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-emerald-50 border-emerald-200'
              : isDark
                ? 'bg-slate-800/60 border-slate-700/50'
                : 'bg-white border-slate-200'
          )}
        >
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
            notificationsEnabled
              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
              : isDark ? 'bg-slate-700' : 'bg-slate-100'
          )}>
            <Bell className={cn('w-5 h-5', notificationsEnabled ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500')} />
          </div>
          <div className="flex-1 text-left">
            <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
              Trade notifications
            </p>
            <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
              Get notified about order updates & promotions
            </p>
          </div>
          {/* Toggle switch */}
          <div className={cn(
            'w-12 h-7 rounded-full p-1 transition-colors duration-300 flex-shrink-0',
            notificationsEnabled ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
          )}>
            <motion.div
              className="w-5 h-5 rounded-full bg-white shadow-sm"
              animate={{ x: notificationsEnabled ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Step 3: Security Setup ────────────────────────────────────
function SecurityStep({ isDark, emailVerified, kycStatus }: { isDark: boolean; emailVerified: boolean; kycStatus: string }) {
  const steps = [
    {
      icon: Lock,
      title: 'Verify Email',
      description: 'Confirm your email to secure your account',
      status: emailVerified ? 'done' : 'pending',
      actionLabel: emailVerified ? 'Verified' : 'Check inbox',
    },
    {
      icon: Fingerprint,
      title: 'KYC Verification',
      description: 'Upload your ID for full trading access',
      status: kycStatus === 'verified' ? 'done' : kycStatus === 'pending' ? 'pending' : 'todo',
      actionLabel: kycStatus === 'verified' ? 'Verified' : kycStatus === 'pending' ? 'In review' : 'Complete later',
    },
    {
      icon: Shield,
      title: 'Two-Factor Auth',
      description: 'Add an extra layer of security (recommended)',
      status: 'todo' as const,
      actionLabel: 'Set up later',
    },
  ]

  return (
    <motion.div
      className="flex flex-col items-center text-center px-4 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={cn(
          'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6',
          isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-200'
        )}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Shield className="w-3.5 h-3.5" />
        ACCOUNT SECURITY
      </motion.div>

      <motion.h2
        className={cn('text-2xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Secure your account
      </motion.h2>
      <motion.p
        className={cn('text-sm mb-8 max-w-sm', isDark ? 'text-slate-400' : 'text-slate-600')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Complete these steps for full access. You can do them now or later.
      </motion.p>

      {/* Security steps checklist */}
      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isDone = step.status === 'done'
          const isPending = step.status === 'pending'
          return (
            <motion.div
              key={step.title}
              className={cn(
                'flex items-center gap-4 p-4 rounded-2xl border transition-all',
                isDone
                  ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  : isDark ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200'
              )}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                isDone
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                  : isPending
                    ? isDark ? 'bg-amber-500/20' : 'bg-amber-50'
                    : isDark ? 'bg-slate-700' : 'bg-slate-100'
              )}>
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={cn('w-5 h-5', isPending ? 'text-amber-500' : isDark ? 'text-slate-400' : 'text-slate-500')} />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>
                  {step.title}
                </p>
                <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  {step.description}
                </p>
              </div>
              <span className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0',
                isDone
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : isPending
                    ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                    : isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'
              )}>
                {step.actionLabel}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Step 4: All Done! ─────────────────────────────────────────
function CompletionStep({ isDark, firstName }: { isDark: boolean; firstName: string }) {
  return (
    <motion.div
      className="flex flex-col items-center text-center px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
      <Confetti active={true} />

      {/* Celebration icon */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <PartyPopper className="w-12 h-12 text-white" />
        </div>
        {/* Sparkle particles around icon */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <motion.div
            key={angle}
            className="absolute w-2 h-2 rounded-full bg-amber-400"
            style={{
              top: '50%',
              left: '50%',
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((angle * Math.PI) / 180) * 60,
              y: Math.sin((angle * Math.PI) / 180) * 60,
            }}
            transition={{ duration: 1.2, delay: 0.5 + angle * 0.001, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      <motion.h2
        className={cn('text-3xl sm:text-4xl font-bold mb-3', isDark ? 'text-white' : 'text-slate-900')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        You&apos;re all set!
      </motion.h2>

      <motion.p
        className={cn('text-base sm:text-lg max-w-md mb-10', isDark ? 'text-slate-400' : 'text-slate-600')}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Your account is ready, {firstName}. Start trading crypto with the best rates in Ghana.
      </motion.p>

      {/* Quick action cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: ArrowRightLeft, label: 'Start trading', desc: 'Buy or sell crypto', href: '/exchange' },
          { icon: Wallet, label: 'View wallet', desc: 'Check your balance', href: '/wallet' },
          { icon: Globe, label: 'Complete KYC', desc: 'Unlock full access', href: '/kyc' },
        ].map((action, i) => (
          <motion.div
            key={action.label}
            className={cn(
              'flex flex-col items-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]',
              isDark
                ? 'bg-slate-800/60 border-slate-700/50 hover:border-emerald-500/30'
                : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md'
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20">
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{action.label}</span>
            <span className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>{action.desc}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN ONBOARDING PAGE
// ═══════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const { user } = useAuth()
  const { resolvedTheme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const isDark = resolvedTheme === 'dark'

  const firstName = user?.firstName || 'there'
  const emailVerified = user?.emailVerified ?? false
  const kycStatus = user?.kycStatus ?? 'none'

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1)
    }
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [step])

  const handleFinish = useCallback(() => {
    localStorage.setItem('onboarding_completed', 'true')
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const handleSkip = useCallback(() => {
    localStorage.setItem('onboarding_completed', 'true')
    navigate('/dashboard', { replace: true })
  }, [navigate])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (step < TOTAL_STEPS - 1) handleNext()
        else handleFinish()
      }
      if (e.key === 'ArrowLeft') handleBack()
      if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [step, handleNext, handleBack, handleFinish, handleSkip])

  return (
    <div className={cn(
      'min-h-screen flex flex-col relative overflow-hidden',
      isDark
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950'
        : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'
    )}>
      <OnboardingParticles />

      {/* Background orbs */}
      <div className={cn('absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[120px]', isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/15')} />
      <div className={cn('absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full blur-[100px]', isDark ? 'bg-blue-500/10' : 'bg-blue-400/15')} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
            <Bitcoin className="w-4 h-4 text-white" />
          </div>
          <span className={cn('font-bold text-lg', isDark ? 'text-white' : 'text-slate-900')}>
            JD<span className="text-emerald-500">Exchange</span>
          </span>
        </div>
        <button
          onClick={handleSkip}
          className={cn(
            'text-sm font-medium px-4 py-2 rounded-xl transition-colors',
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          Skip
        </button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-32">
        <AnimatePresence mode="wait">
          {step === 0 && <WelcomeStep key="welcome" firstName={firstName} isDark={isDark} />}
          {step === 1 && <FeatureTourStep key="features" isDark={isDark} />}
          {step === 2 && (
            <PreferencesStep
              key="preferences"
              isDark={isDark}
              currentTheme={resolvedTheme}
              onThemeChange={(t) => setTheme(t as 'light' | 'dark' | 'system')}
            />
          )}
          {step === 3 && (
            <SecurityStep
              key="security"
              isDark={isDark}
              emailVerified={emailVerified}
              kycStatus={kycStatus}
            />
          )}
          {step === 4 && <CompletionStep key="completion" isDark={isDark} firstName={firstName} />}
        </AnimatePresence>
      </main>

      {/* Footer with progress + navigation */}
      <footer className={cn(
        'fixed bottom-0 inset-x-0 z-20 border-t backdrop-blur-xl',
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      )}>
        <div className="max-w-lg mx-auto px-4 sm:px-8 py-4 space-y-4">
          {/* Progress bar */}
          <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} isDark={isDark} />

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className={cn(
                'h-12 px-5 rounded-xl font-medium transition-all',
                step === 0 ? 'opacity-0 pointer-events-none' : '',
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Step counter */}
            <span className={cn('text-xs font-medium tabular-nums', isDark ? 'text-slate-500' : 'text-slate-400')}>
              {step + 1} / {TOTAL_STEPS}
            </span>

            {step < TOTAL_STEPS - 1 ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleNext}
                  className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleFinish}
                  className="h-12 px-6 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                >
                  Go to Dashboard
                  <Rocket className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
