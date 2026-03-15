import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Image, CreditCard, Sparkles, Search } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'

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
// MAGICAL BACKGROUND - Particle Network
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

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      color: string
    }> = []

    for (let i = 0; i < 25; i++) {
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
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  )
}

// ============================================
// FLOATING ORBS - Animated Gradient Orbs
// ============================================
function FloatingOrbs() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className={`absolute -top-20 -right-20 w-[400px] h-[400px] ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'} rounded-full blur-[100px]`}
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
        className={`absolute -bottom-20 -left-20 w-[300px] h-[300px] ${isDark ? 'bg-blue-500/10' : 'bg-blue-400/20'} rounded-full blur-[80px]`}
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
    </div>
  )
}

// ============================================
// LOADING STATE
// ============================================
function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 border-t-emerald-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-emerald-500" />
        </motion.div>
      </div>
    </div>
  )
}

// ============================================
// PREMIUM PAYMENT CARD with 3D hover effects
// ============================================
function PremiumPaymentCard({
  method,
  index,
  onToggle,
  onEdit,
  onDelete
}: {
  method: PaymentMethod
  index: number
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const typeLabels: Record<string, string> = {
    momo: 'Mobile Money',
    bank: 'Bank Transfer',
    paypal: 'PayPal',
    stripe: 'Stripe',
    custom: 'Custom',
  }

  const typeColors: Record<string, string> = {
    momo: 'from-yellow-500 via-amber-500 to-orange-500',
    bank: 'from-blue-500 via-indigo-500 to-purple-500',
    paypal: 'from-blue-600 via-blue-500 to-cyan-500',
    stripe: 'from-purple-500 via-pink-500 to-rose-500',
    custom: 'from-emerald-500 via-teal-500 to-cyan-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'
        }`}
    >
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${typeColors[method.type]} opacity-0`}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6 }}
      />

      {/* Top gradient bar */}
      <div className={`h-1 bg-gradient-to-r ${typeColors[method.type]}`} />

      {/* Floating particles on hover */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -20],
                x: [0, (i - 1) * 15]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.2,
                repeat: Infinity
              }}
              style={{ top: '30%', left: '50%' }}
            />
          ))}
        </>
      )}

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${typeColors[method.type]} flex items-center justify-center shadow-lg`}
              animate={{
                rotate: isHovered ? [0, -10, 10, 0] : 0,
                scale: isHovered ? 1.1 : 1
              }}
              transition={{ duration: 0.5 }}
            >
              {method.image ? (
                <img src={method.image} alt={method.name} className="w-10 h-10 rounded-lg object-contain" />
              ) : (
                <CreditCard className="w-7 h-7 text-white" />
              )}
            </motion.div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{method.name}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{typeLabels[method.type]}</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {method.enabled ? (
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
          </motion.div>
        </div>

        <div className="space-y-3 mb-4">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Account Name</p>
            <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{method.accountName}</p>
          </div>
          <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Account Number</p>
            <p className={`font-mono text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{method.accountNumber}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <motion.div
              className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}
              whileHover={{ scale: 1.05 }}
            >
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fee</p>
              <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{method.fee}%</p>
            </motion.div>
            <motion.div
              className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}
              whileHover={{ scale: 1.05 }}
            >
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Min</p>
              <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₵{method.minAmount}</p>
            </motion.div>
            <motion.div
              className={`p-2 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}
              whileHover={{ scale: 1.05 }}
            >
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Max</p>
              <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>₵{method.maxAmount}</p>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={onToggle}
            className={`flex-1 p-2.5 rounded-xl transition-colors text-sm font-medium ${method.enabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {method.enabled ? 'Disable' : 'Enable'}
          </motion.button>
          <motion.button
            onClick={onEdit}
            className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onDelete}
            className="p-2.5 rounded-xl transition-colors bg-red-500/20 text-red-500 hover:bg-red-500/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminPaymentMethods() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [imagePreview, setImagePreview] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load payment methods from backend on mount
  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getPaymentMethods()
      const methodsData = response.data.data || response.data
      setPaymentMethods(methodsData)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load payment methods')
      console.error('Load payment methods error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [showAddForm, setShowAddForm] = useState(false)
  const [newMethod, setNewMethod] = useState<{
    name: string
    type: 'momo' | 'bank' | 'paypal' | 'stripe' | 'custom'
    accountName: string
    accountNumber: string
    fee: number
    minAmount: number
    maxAmount: number
    image: string
  }>({
    name: '',
    type: 'momo',
    accountName: '',
    accountNumber: '',
    fee: 0,
    minAmount: 0,
    maxAmount: 0,
    image: ''
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setNewMethod(prev => ({ ...prev, image: base64 }))
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddMethod = async () => {
    if (!newMethod.name || !newMethod.accountName || !newMethod.accountNumber) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      setIsLoading(true)
      const methodData = {
        name: newMethod.name,
        type: newMethod.type,
        accountName: newMethod.accountName,
        accountNumber: newMethod.accountNumber,
        fee: newMethod.fee,
        minAmount: newMethod.minAmount,
        maxAmount: newMethod.maxAmount,
        icon: '💳',
        enabled: true,
        image: newMethod.image || undefined
      }

      if (editingId) {
        await adminApi.updatePaymentMethod(editingId, methodData)
        toast.success('Payment method updated successfully')
      } else {
        await adminApi.addPaymentMethod(methodData)
        toast.success('Payment method added successfully')
      }

      await loadPaymentMethods()

      setNewMethod({
        name: '',
        type: 'momo',
        accountName: '',
        accountNumber: '',
        fee: 0,
        minAmount: 0,
        maxAmount: 0,
        image: ''
      })
      setImagePreview('')
      setEditingId(null)
      setShowAddForm(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save payment method')
      console.error('Save payment method error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMethod = (method: PaymentMethod) => {
    setNewMethod({
      name: method.name,
      type: method.type,
      accountName: method.accountName,
      accountNumber: method.accountNumber,
      fee: method.fee,
      minAmount: method.minAmount,
      maxAmount: method.maxAmount,
      image: method.image || ''
    })
    setImagePreview(method.image || '')
    setEditingId(method.id)
    setShowAddForm(true)
  }

  const handleDeleteMethod = async (id: string) => {
    try {
      setIsLoading(true)
      await adminApi.deletePaymentMethod(id)
      toast.success('Payment method deleted')
      await loadPaymentMethods()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete payment method')
      console.error('Delete payment method error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const method = paymentMethods.find(m => m.id === id)
      if (!method) return

      setIsLoading(true)
      await adminApi.updatePaymentMethod(id, { ...method, enabled: !method.enabled })
      toast.success('Status updated')
      await loadPaymentMethods()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status')
      console.error('Update status error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background Effects */}
      <FloatingOrbs />
      <div className="absolute inset-0 pointer-events-none">
        <MagicalBackground />
      </div>

      <motion.div
        className="relative z-10 p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Premium Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'}`}
        >
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    Payment Methods
                  </motion.h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Configure payment methods available for users
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search payment methods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 w-64 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-slate-200'}`}
                  />
                </div>

                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/30">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} max-w-2xl`}>
                    <DialogHeader>
                      <DialogTitle className={`text-2xl flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-6 h-6 text-emerald-500" />
                        </motion.div>
                        {editingId ? 'Edit' : 'Add'} Payment Method
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {/* Image Upload */}
                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Payment Method Image (Optional)</Label>
                        <div className={`border-2 border-dashed rounded-lg p-4 mt-2 text-center cursor-pointer transition-all ${
                          isDark
                            ? 'border-slate-700 hover:border-emerald-500 hover:bg-slate-800/50'
                            : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'
                        }`}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="payment-image"
                          />
                          <label htmlFor="payment-image" className="cursor-pointer block">
                            {imagePreview ? (
                              <div className="space-y-2">
                                <motion.img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-16 h-16 rounded-lg mx-auto object-contain"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                />
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  Click to change image
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring', stiffness: 200 }}
                                >
                                  <Image className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                </motion.div>
                                <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                  Click to upload image
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>

                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Method Name</Label>
                        <Input
                          placeholder="MTN Mobile Money"
                          value={newMethod.name}
                          onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                          className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                      </div>

                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Type</Label>
                        <select
                          value={newMethod.type}
                          onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                          className={`w-full mt-1 px-3 py-2 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        >
                          <option value="momo">Mobile Money</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="paypal">PayPal</option>
                          <option value="stripe">Stripe</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Account Name</Label>
                        <Input
                          placeholder="JDExchange"
                          value={newMethod.accountName}
                          onChange={(e) => setNewMethod({ ...newMethod, accountName: e.target.value })}
                          className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                      </div>

                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Account Number/ID</Label>
                        <Input
                          placeholder="Enter account number or ID"
                          value={newMethod.accountNumber}
                          onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
                          className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Fee (%)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newMethod.fee}
                            onChange={(e) => setNewMethod({ ...newMethod, fee: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Min (GHS)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newMethod.minAmount}
                            onChange={(e) => setNewMethod({ ...newMethod, minAmount: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Max (GHS)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newMethod.maxAmount}
                            onChange={(e) => setNewMethod({ ...newMethod, maxAmount: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={handleAddMethod} disabled={isLoading} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                          {editingId ? 'Update' : 'Add'} Payment Method
                        </Button>
                      </motion.div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <LoadingState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredMethods.map((method, index) => (
                    <PremiumPaymentCard
                      key={method.id}
                      method={method}
                      index={index}
                      onToggle={() => handleToggleStatus(method.id)}
                      onEdit={() => handleEditMethod(method)}
                      onDelete={() => handleDeleteMethod(method.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredMethods.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <motion.div
                  className="relative w-24 h-24 mx-auto mb-6"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-xl"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className={`relative w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <CreditCard className="w-12 h-12 text-slate-400" />
                  </div>
                </motion.div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {searchQuery ? 'No payment methods found' : 'No payment methods yet'}
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Add your first payment method to get started'}
                </p>
                {!searchQuery && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
