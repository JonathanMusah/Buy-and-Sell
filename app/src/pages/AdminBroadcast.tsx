import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { adminApi } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Mail,
  Megaphone,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Newspaper,
  Gift,
  Globe,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface BroadcastStats {
  totalUsers: number
  newsletterSubscribers: number
  promotionsSubscribers: number
}

interface BroadcastHistory {
  id: string
  type: string
  subject: string
  message: string
  recipientCount: number
  sentCount: number
  failedCount: number
  status: string
  createdAt: string
}

const broadcastTypes = [
  { 
    value: 'newsletter', 
    label: 'Newsletter', 
    description: 'Product updates & crypto news',
    icon: Newspaper,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    activeBg: 'bg-blue-600',
  },
  { 
    value: 'promotions', 
    label: 'Promotions', 
    description: 'Special offers & discounts',
    icon: Gift,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    activeBg: 'bg-purple-600',
  },
  { 
    value: 'all', 
    label: 'All Users', 
    description: 'Send to everyone regardless of preferences',
    icon: Globe,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    activeBg: 'bg-emerald-600',
  },
]

export default function AdminBroadcast() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [stats, setStats] = useState<BroadcastStats | null>(null)
  const [history, setHistory] = useState<BroadcastHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [broadcastType, setBroadcastType] = useState('newsletter')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, historyRes] = await Promise.all([
        adminApi.getBroadcastStats(),
        adminApi.getBroadcastHistory(),
      ])
      setStats(statsRes.data?.data || null)
      setHistory(historyRes.data?.data || [])
    } catch (err) {
      console.error('Failed to load broadcast data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRecipientCount = () => {
    if (!stats) return 0
    if (broadcastType === 'newsletter') return stats.newsletterSubscribers
    if (broadcastType === 'promotions') return stats.promotionsSubscribers
    return stats.totalUsers
  }

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }
    if (getRecipientCount() === 0) {
      toast.error('No subscribers found for this broadcast type')
      return
    }

    setSending(true)
    try {
      const res = await adminApi.sendBroadcast({ type: broadcastType, subject, message })
      const data = res.data?.data
      toast.success(`Broadcast started! Sending to ${data?.recipientCount || getRecipientCount()} recipient(s)`)
      setSubject('')
      setMessage('')
      setShowPreview(false)
      // Refresh history after a delay
      setTimeout(loadData, 3000)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send broadcast')
    } finally {
      setSending(false)
    }
  }

  const selectedType = broadcastTypes.find(t => t.value === broadcastType)!

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: 'Newsletter Subscribers', 
            value: stats?.newsletterSubscribers ?? '—', 
            icon: Newspaper, 
            color: 'text-blue-600 dark:text-blue-400', 
            bg: 'bg-blue-50 dark:bg-blue-900/20' 
          },
          { 
            label: 'Promotions Subscribers', 
            value: stats?.promotionsSubscribers ?? '—', 
            icon: Gift, 
            color: 'text-purple-600 dark:text-purple-400', 
            bg: 'bg-purple-50 dark:bg-purple-900/20' 
          },
          { 
            label: 'Total Users', 
            value: stats?.totalUsers ?? '—', 
            icon: Users, 
            color: 'text-emerald-600 dark:text-emerald-400', 
            bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Compose Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className={`border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                <Megaphone className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Compose Broadcast</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Send newsletters and promotions to your subscribers</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Broadcast Type Selection */}
              <div>
                <Label className={`block mb-3 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Broadcast Type
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {broadcastTypes.map((type) => {
                    const isSelected = broadcastType === type.value
                    const TypeIcon = type.icon
                    const count = type.value === 'newsletter' 
                      ? stats?.newsletterSubscribers 
                      : type.value === 'promotions' 
                        ? stats?.promotionsSubscribers 
                        : stats?.totalUsers

                    return (
                      <motion.button
                        key={type.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBroadcastType(type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `border-emerald-500 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} shadow-lg shadow-emerald-500/10`
                            : `${isDark ? 'border-slate-700 bg-slate-700/30 hover:border-slate-600' : 'border-slate-200 bg-white hover:border-slate-300'}`
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isSelected ? 'bg-emerald-500 text-white' : type.bg}`}>
                            <TypeIcon className={`w-5 h-5 ${isSelected ? 'text-white' : type.color}`} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{type.label}</p>
                          </div>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{type.description}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {count ?? 0} recipient{(count ?? 0) !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label className={`block mb-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Subject
                </Label>
                <Input
                  placeholder="e.g. Weekly Crypto Update - Bitcoin Hits New High!"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`h-12 rounded-xl ${isDark ? 'bg-slate-700/50 border-slate-600 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>

              {/* Message */}
              <div>
                <Label className={`block mb-2 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Message
                </Label>
                <textarea
                  placeholder="Write your newsletter or promotion message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className={`w-full rounded-xl p-4 text-sm border resize-y ${
                    isDark 
                      ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Line breaks will be preserved in the email. You can use plain text.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!subject && !message}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide Preview' : 'Preview'}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !message.trim() || getRecipientCount() === 0}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to {getRecipientCount()} Recipient{getRecipientCount() !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview */}
      <AnimatePresence>
        {showPreview && (subject || message) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Email Preview</h3>
                </div>
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="bg-white p-6 max-w-[600px] mx-auto">
                    <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #10b981' }}>
                      <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>JDExchange</h1>
                      <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '14px' }}>
                        {broadcastType === 'newsletter' ? 'Newsletter' : broadcastType === 'promotions' ? 'Special Offer' : 'Announcement'}
                      </p>
                    </div>
                    <div style={{ padding: '30px 0' }}>
                      <p style={{ color: '#334155', fontSize: '16px' }}>Hi {'{{firstName}}'},</p>
                      <h2 style={{ color: '#1e293b', fontSize: '20px', margin: '20px 0 10px' }}>{subject || '(No subject)'}</h2>
                      <div style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {message || '(No message)'}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid #e2e8f0', padding: '20px 0', textAlign: 'center' }}>
                      <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                        You received this email because you opted in to {broadcastType === 'all' ? 'communications' : broadcastType} from JDExchange.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className={`border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <Clock className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Broadcast History</h2>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Past emails sent to subscribers</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} className="gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {history.length === 0 ? (
              <div className={`text-center py-12 rounded-xl border border-dashed ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                <Mail className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No broadcasts sent yet</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Compose your first newsletter or promotion above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, i) => {
                  const typeConfig = broadcastTypes.find(t => t.value === item.type) || broadcastTypes[0]
                  const TypeIcon = typeConfig.icon
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-xl border ${isDark ? 'bg-slate-700/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeConfig.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {item.subject}
                            </p>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a') : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                          <div className="flex items-center gap-1 text-xs">
                            {item.status === 'completed' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            ) : item.status === 'sending' ? (
                              <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                              {item.sentCount}/{item.recipientCount} sent
                              {item.failedCount > 0 && ` (${item.failedCount} failed)`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
