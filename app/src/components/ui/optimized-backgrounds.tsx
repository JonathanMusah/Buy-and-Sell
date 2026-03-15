import { useEffect, useRef, memo, useCallback } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface OptimizedParticlesProps {
  density?: 'low' | 'medium' | 'high'
  className?: string
  interactive?: boolean
}

export const OptimizedParticles = memo(function OptimizedParticles({
  density = 'medium',
  className = '',
  interactive = true,
}: OptimizedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const { resolvedTheme } = useTheme()
  const mouseRef = useRef({ x: 0, y: 0 })
  const isVisibleRef = useRef(true)

  // Get particle count based on density and screen size
  const getParticleCount = useCallback(() => {
    const isMobile = window.innerWidth < 768
    const baseCount = isMobile ? 15 : 30
    
    switch (density) {
      case 'low':
        return Math.floor(baseCount * 0.5)
      case 'high':
        return Math.floor(baseCount * 1.5)
      default:
        return baseCount
    }
  }, [density])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      return
    }

    // Setup canvas
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Limit DPR for performance
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    // Check visibility
    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    // Initialize particles
    const isDark = resolvedTheme === 'dark'
    const particleCount = getParticleCount()
    const colors = isDark 
      ? ['#10b981', '#3b82f6', '#8b5cf6'] 
      : ['#059669', '#2563eb', '#7c3aed']

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.3 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove, { passive: true })
    }

    // Animation loop with frame skipping
    let frameCount = 0
    const targetFPS = 30
    const frameInterval = 60 / targetFPS

    const animate = () => {
      frameCount++
      
      // Skip frames for performance
      if (frameCount % Math.round(frameInterval) !== 0 || !isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      // Update and draw particles
      particles.forEach((p, i) => {
        // Move particles
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1

        // Mouse attraction (limited to nearby particles)
        if (interactive) {
          const dx = mouseRef.current.x - p.x
          const dy = mouseRef.current.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 80 && dist > 0) {
            p.x += dx * 0.01
            p.y += dy * 0.01
          }
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Draw connections (limited)
        if (i % 3 === 0) { // Only connect every 3rd particle
          ctx.globalAlpha = 0.08
          ctx.strokeStyle = p.color
          ctx.lineWidth = 0.5
          
          for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
            const dx = p.x - particles[j].x
            const dy = p.y - particles[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 60) {
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      resize()
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      cancelAnimationFrame(animationRef.current)
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [resolvedTheme, density, interactive, getParticleCount])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.5 }}
    />
  )
})

// ============================================
// STATIC GRADIENT BACKGROUND (Performance optimized)
// ============================================

interface StaticGradientProps {
  variant?: 'emerald' | 'blue' | 'purple' | 'mixed'
  className?: string
}

export const StaticGradient = memo(function StaticGradient({
  variant = 'emerald',
  className = '',
}: StaticGradientProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const gradientStyles = {
    emerald: isDark
      ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/5'
      : 'bg-gradient-to-br from-emerald-400/20 via-transparent to-teal-400/10',
    blue: isDark
      ? 'bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/5'
      : 'bg-gradient-to-br from-blue-400/20 via-transparent to-cyan-400/10',
    purple: isDark
      ? 'bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/5'
      : 'bg-gradient-to-br from-purple-400/20 via-transparent to-pink-400/10',
    mixed: isDark
      ? 'bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5'
      : 'bg-gradient-to-br from-emerald-400/10 via-blue-400/10 to-purple-400/10',
  }

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${gradientStyles[variant]} ${className}`}
    />
  )
})

// ============================================
// SIMPLE FLOATING ORBS (CSS-based, no JS animation)
// ============================================

export const SimpleOrbs = memo(function SimpleOrbs({
  className = '',
}: {
  className?: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className={`absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full blur-[100px] ${
          isDark ? 'bg-emerald-500/5' : 'bg-emerald-400/10'
        }`}
      />
      <div
        className={`absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full blur-[80px] ${
          isDark ? 'bg-blue-500/5' : 'bg-blue-400/10'
        }`}
      />
    </div>
  )
})
