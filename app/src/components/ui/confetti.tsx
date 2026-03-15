import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  opacity: number
  shape: 'square' | 'circle' | 'strip'
}

const COLORS = [
  '#10b981', '#34d399', '#6ee7b7', // Emerald
  '#3b82f6', '#60a5fa',            // Blue
  '#f59e0b', '#fbbf24',            // Amber
  '#8b5cf6', '#a78bfa',            // Purple
  '#ec4899', '#f472b6',            // Pink
]

interface ConfettiProps {
  active: boolean
  duration?: number
  particleCount?: number
}

export function Confetti({ active, duration = 3000, particleCount = 80 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const animRef = useRef<number | null>(null)
  const startTime = useRef(0)
  const durationRef = useRef(duration)

  useEffect(() => {
    durationRef.current = duration
  }, [duration])

  const createParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const w = canvas.width
    const h = canvas.height
    const newParticles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * Math.PI * 2)
      const speed = 4 + Math.random() * 8
      newParticles.push({
        x: w / 2 + (Math.random() - 0.5) * w * 0.3,
        y: h * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: (['square', 'circle', 'strip'] as const)[Math.floor(Math.random() * 3)],
      })
    }

    particles.current = newParticles
  }, [particleCount])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    startTime.current = Date.now()
    createParticles()

    function tick() {
      const cvs = canvasRef.current
      if (!cvs) return

      const ctx = cvs.getContext('2d')
      if (!ctx) return

      const elapsed = Date.now() - startTime.current
      const progress = Math.min(elapsed / durationRef.current, 1)

      ctx.clearRect(0, 0, cvs.width, cvs.height)

      particles.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // gravity
        p.vx *= 0.99 // air resistance
        p.rotation += p.rotationSpeed
        p.opacity = 1 - progress * 0.8

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color

        if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
        } else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 4, -p.size, p.size / 2, p.size * 2)
        }

        ctx.restore()
      })

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick)
      }
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current)
      }
    }
  }, [active, createParticles])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
