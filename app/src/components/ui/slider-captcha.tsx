import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Check, ChevronRight, Shield, RotateCcw } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

interface SliderCaptchaProps {
  onVerify: (verified: boolean) => void
  /** Reset trigger — change this value to reset the captcha */
  resetKey?: number
}

export function SliderCaptcha({ onVerify, resetKey = 0 }: SliderCaptchaProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [verified, setVerified] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [failed, setFailed] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  // Track width minus thumb width
  const getMaxX = useCallback(() => {
    if (!trackRef.current) return 200
    return trackRef.current.clientWidth - 48 // thumb is 48px wide
  }, [])

  // Progress (0-1)
  const progress = useTransform(x, [0, getMaxX()], [0, 1])
  const progressPercent = useTransform(progress, [0, 1], ['0%', '100%'])

  // Reset when resetKey changes
  useEffect(() => {
    setVerified(false)
    setFailed(false)
    x.set(0)
    onVerify(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  const handleDragStart = () => {
    if (verified) return
    setDragging(true)
    setFailed(false)
  }

  const handleDrag = () => {
    // clamp to track bounds
    const maxX = getMaxX()
    if (x.get() < 0) x.set(0)
    if (x.get() > maxX) x.set(maxX)
  }

  const handleDragEnd = () => {
    setDragging(false)
    const maxX = getMaxX()
    const current = x.get()

    // Need to drag at least 92% to verify
    if (current >= maxX * 0.92) {
      animate(x, maxX, { type: 'spring', stiffness: 300, damping: 25 })
      setVerified(true)
      onVerify(true)
    } else {
      // Snap back with wobble
      setFailed(true)
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 20 })
      setTimeout(() => setFailed(false), 600)
    }
  }

  const handleReset = () => {
    setVerified(false)
    setFailed(false)
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
    onVerify(false)
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield className={`w-3.5 h-3.5 ${verified ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Security Verification
          </span>
        </div>
        {verified && (
          <button
            type="button"
            onClick={handleReset}
            className={`text-xs flex items-center gap-1 transition-colors ${
              isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        style={{ touchAction: 'none' }}
        className={`relative h-12 rounded-xl overflow-hidden select-none transition-all duration-300 ${
          verified
            ? isDark
              ? 'bg-emerald-500/15 border border-emerald-500/30'
              : 'bg-emerald-50 border border-emerald-200'
            : failed
              ? isDark
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-red-50 border border-red-200'
              : dragging
                ? isDark
                  ? 'bg-slate-800/80 border border-emerald-500/30'
                  : 'bg-white border border-emerald-300 shadow-sm'
                : isDark
                  ? 'bg-slate-800/60 border border-slate-700/80'
                  : 'bg-white border border-slate-200 shadow-sm'
        }`}
      >
        {/* Progress fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-xl transition-colors duration-200 ${
            verified
              ? 'bg-emerald-500/20'
              : failed
                ? 'bg-red-500/10'
                : 'bg-emerald-500/10'
          }`}
          style={{ width: progressPercent }}
        />

        {/* Shimmer animation on track (when not verified) */}
        {!verified && !dragging && (
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-emerald-500/[0.07] to-transparent"
              animate={{ x: ['-80px', '350px'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            />
          </div>
        )}

        {/* Guide text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {verified ? (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Verified
              </span>
            </motion.div>
          ) : (
            <motion.span
              className={`text-sm font-medium select-none ${
                failed
                  ? 'text-red-400'
                  : isDark
                    ? 'text-slate-500'
                    : 'text-slate-400'
              }`}
              animate={failed ? { x: [-3, 3, -3, 3, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              {failed ? 'Try again — slide further' : 'Slide to verify'}
            </motion.span>
          )}
        </div>

        {/* Chevron hints (when idle) */}
        {!verified && !dragging && (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <motion.div
              className="flex items-center gap-0"
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              <ChevronRight className={`w-4 h-4 -ml-2 ${isDark ? 'text-slate-700' : 'text-slate-200'}`} />
            </motion.div>
          </div>
        )}

        {/* Draggable thumb */}
        <motion.div
          className={`absolute top-1 left-1 w-10 h-10 rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow duration-200 ${
            verified
              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
              : dragging
                ? isDark
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                  : 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                : isDark
                  ? 'bg-slate-700 hover:bg-slate-600 shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 shadow-md border border-slate-200'
          }`}
          style={{ x, touchAction: 'none' }}
          drag={verified ? false : 'x'}
          dragConstraints={{ left: 0, right: getMaxX() }}
          dragElastic={0}
          dragMomentum={false}
          dragListener={true}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          whileTap={verified ? {} : { scale: 1.05 }}
        >
          {verified ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <ChevronRight
              className={`w-5 h-5 transition-colors ${
                dragging ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
