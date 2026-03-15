import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Eye, EyeOff, Image, Coins, Sparkles, Search } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'

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
  icon?: string
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
// PREMIUM CARD COMPONENT
// ============================================
function PremiumCard({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl border backdrop-blur-xl overflow-hidden ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200'
        } ${className}`}
    >
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

      {/* Animated background on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-0"
        animate={{ opacity: isHovered ? 0.05 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.7 }}
      />

      {/* Floating particles on hover */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full"
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [0, -30],
                x: [(i - 1) * 20, (i - 1) * 25]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.15,
                repeat: Infinity
              }}
              style={{ bottom: '20%', left: '50%' }}
            />
          ))}
        </>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// ============================================
// PREMIUM TABLE ROW
// ============================================
function PremiumTableRow({
  children,
  isDark,
  index = 0,
  onClick
}: {
  children: React.ReactNode
  isDark: boolean
  index?: number
  onClick?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`border-b transition-colors duration-200 ${isDark ? 'border-slate-700' : 'border-slate-200'
        } ${isHovered ? (isDark ? 'bg-slate-700/30' : 'bg-slate-50') : ''} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {children}
    </motion.tr>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminCryptoManagement() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load cryptos from backend on mount
  useEffect(() => {
    loadCryptos()
  }, [])

  const loadCryptos = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getCryptocurrencies()
      const cryptoData = response.data.data || response.data
      setCryptos(cryptoData)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load cryptocurrencies')
      console.error('Load cryptos error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCrypto, setNewCrypto] = useState({
    name: '',
    symbol: '',
    rate: 0,
    networkFee: 0,
    minAmount: 0,
    maxAmount: 0,
    address: '',
    network: 'Main',
    image: ''
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setNewCrypto(prev => ({ ...prev, image: base64 }))
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCrypto = async () => {
    if (!newCrypto.name || !newCrypto.symbol || !newCrypto.rate) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      setIsLoading(true)
      const cryptoData = {
        name: newCrypto.name,
        symbol: newCrypto.symbol,
        icon: newCrypto.symbol[0],
        image: newCrypto.image || '',
        rate: newCrypto.rate,
        buyRate: newCrypto.rate,
        sellRate: newCrypto.rate,
        networkFee: newCrypto.networkFee,
        minAmount: newCrypto.minAmount,
        maxAmount: newCrypto.maxAmount,
        walletAddress: newCrypto.address || '',
        enabled: true,
      }

      if (editingId) {
        await adminApi.updateCryptocurrency(editingId, cryptoData)
        toast.success('Cryptocurrency updated successfully')
      } else {
        await adminApi.addCryptocurrency(cryptoData)
        toast.success('Cryptocurrency added successfully')
      }

      await loadCryptos()

      setNewCrypto({
        name: '',
        symbol: '',
        rate: 0,
        networkFee: 0,
        minAmount: 0,
        maxAmount: 0,
        address: '',
        network: 'Main',
        image: ''
      })
      setImagePreview('')
      setEditingId(null)
      setShowAddForm(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save cryptocurrency')
      console.error('Save crypto error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCrypto = (crypto: Crypto) => {
    setNewCrypto({
      name: crypto.name,
      symbol: crypto.symbol,
      rate: crypto.rate,
      networkFee: crypto.networkFee,
      minAmount: crypto.minAmount,
      maxAmount: crypto.maxAmount,
      address: crypto.walletAddress || '',
      network: 'Main',
      image: crypto.image || ''
    })
    setImagePreview(crypto.image || '')
    setEditingId(crypto.id)
    setShowAddForm(true)
  }

  const handleDeleteCrypto = async (id: string) => {
    try {
      setIsLoading(true)
      await adminApi.deleteCryptocurrency(id)
      toast.success('Cryptocurrency deleted!')
      await loadCryptos()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete cryptocurrency')
      console.error('Delete crypto error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const crypto = cryptos.find(c => c.id === id)
      if (!crypto) return

      setIsLoading(true)
      await adminApi.updateCryptocurrency(id, {
        ...crypto,
        enabled: !crypto.enabled
      })
      toast.success(`Cryptocurrency ${!crypto.enabled ? 'enabled' : 'disabled'}`)
      await loadCryptos()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update cryptocurrency status')
      console.error('Toggle status error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
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
        <PremiumCard>
          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Coins className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <motion.h2
                    className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    Cryptocurrency Management
                  </motion.h2>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Add, edit, or manage cryptocurrencies and their rates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search cryptocurrencies..."
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
                        Add Cryptocurrency
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
                        {editingId ? 'Edit' : 'Add New'} Cryptocurrency
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {/* Image Upload */}
                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Cryptocurrency Image (Optional)</Label>
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
                            id="crypto-image"
                          />
                          <label htmlFor="crypto-image" className="cursor-pointer block">
                            {imagePreview ? (
                              <div className="space-y-2">
                                <motion.img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-16 h-16 rounded-lg mx-auto object-cover"
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Cryptocurrency Name</Label>
                          <Input
                            placeholder="Bitcoin"
                            value={newCrypto.name}
                            onChange={(e) => setNewCrypto({ ...newCrypto, name: e.target.value })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Symbol</Label>
                          <Input
                            placeholder="BTC"
                            value={newCrypto.symbol}
                            onChange={(e) => setNewCrypto({ ...newCrypto, symbol: e.target.value.toUpperCase() })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Rate (GHS)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newCrypto.rate}
                            onChange={(e) => setNewCrypto({ ...newCrypto, rate: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Network Fee</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newCrypto.networkFee}
                            onChange={(e) => setNewCrypto({ ...newCrypto, networkFee: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Min Amount</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newCrypto.minAmount}
                            onChange={(e) => setNewCrypto({ ...newCrypto, minAmount: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                        <div>
                          <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Max Amount</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={newCrypto.maxAmount}
                            onChange={(e) => setNewCrypto({ ...newCrypto, maxAmount: parseFloat(e.target.value) })}
                            className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Wallet Address</Label>
                        <Input
                          placeholder="Paste wallet address here"
                          value={newCrypto.address}
                          onChange={(e) => setNewCrypto({ ...newCrypto, address: e.target.value })}
                          className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={handleAddCrypto} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
                          {editingId ? 'Update' : 'Add'} Cryptocurrency
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
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <Table className="w-full table-fixed">
                  <TableHeader className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 z-10">
                    <TableRow className={`border-b-2 ${isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-100/80'}`}>
                      <TableHead className={`w-[200px] whitespace-nowrap text-left ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Cryptocurrency
                      </TableHead>
                      <TableHead className={`w-[140px] whitespace-nowrap text-left ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Rate (GHS)
                      </TableHead>
                      <TableHead className={`w-[100px] whitespace-nowrap text-left ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Fee
                      </TableHead>
                      <TableHead className={`w-[120px] whitespace-nowrap text-left ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Min/Max
                      </TableHead>
                      <TableHead className={`w-[100px] whitespace-nowrap text-left ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Status
                      </TableHead>
                      <TableHead className={`w-[140px] whitespace-nowrap text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredCryptos.map((crypto, index) => (
                        <PremiumTableRow key={crypto.id} isDark={isDark} index={index}>
                          <TableCell className="w-[200px] py-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {crypto.image ? (
                                <img
                                  src={crypto.image}
                                  alt={crypto.symbol}
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {crypto.symbol.substring(0, 1)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{crypto.name}</p>
                                <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{crypto.symbol}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[140px] py-4">
                            <span className={`font-bold whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                              ₵{crypto.rate.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className={`w-[100px] py-4 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {crypto.networkFee} GHS
                          </TableCell>
                          <TableCell className={`w-[120px] py-4 whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {crypto.minAmount} - {crypto.maxAmount}
                          </TableCell>
                          <TableCell className="w-[100px] py-4">
                            <Badge className={`whitespace-nowrap ${crypto.enabled
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`} variant="outline">
                              <span className="mr-1">
                                {crypto.enabled ? '●' : '○'}
                              </span>
                              {crypto.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[140px] py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleToggleStatus(crypto.id)}
                                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${crypto.enabled ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
                                title={crypto.enabled ? 'Disable' : 'Enable'}
                              >
                                {crypto.enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleEditCrypto(crypto)}
                                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'}`}
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCrypto(crypto.id)}
                                className="p-1.5 rounded-lg transition-colors bg-red-500/20 text-red-500 hover:bg-red-500/30 flex-shrink-0"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </TableCell>
                        </PremiumTableRow>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredCryptos.length === 0 && (
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
                    <Coins className="w-12 h-12 text-slate-400" />
                  </div>
                </motion.div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {searchQuery ? 'No cryptocurrencies found' : 'No cryptocurrencies yet'}
                </h3>
                <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {searchQuery ? 'Try adjusting your search terms' : 'Add your first cryptocurrency to get started'}
                </p>
                {!searchQuery && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowAddForm(true)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Cryptocurrency
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  )
}
