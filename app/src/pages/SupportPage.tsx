import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ticketsApi } from '@/lib/apiClient'
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  ExternalLink,
  Shield,
  Wallet,
  ArrowLeftRight,
  Clock,
  Loader2,
  FileText,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TicketIcon,
  User
} from 'lucide-react'
import { format } from 'date-fns'

// ============================================
// FAQ DATA
// ============================================
const FAQ_CATEGORIES = [
  {
    category: 'Getting Started',
    icon: HelpCircle,
    color: 'bg-blue-500',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Get Started" on the homepage, fill in your email, name, and password. You\'ll receive a verification email to activate your account.',
      },
      {
        q: 'What documents do I need for KYC verification?',
        a: 'You need a valid government-issued ID (Ghana Card, Passport, or Driver\'s License) and a clear selfie photo. Go to the Verification page to submit your documents.',
      },
      {
        q: 'How long does verification take?',
        a: 'KYC verification is typically reviewed within 24-48 hours. You\'ll receive a notification once your documents have been reviewed.',
      },
    ],
  },
  {
    category: 'Buying & Selling',
    icon: ArrowLeftRight,
    color: 'bg-emerald-500',
    items: [
      {
        q: 'How do I buy cryptocurrency?',
        a: 'Navigate to Exchange or click "Buy Crypto". Select the cryptocurrency you want, enter the amount in GHS, choose your payment method (Mobile Money or Bank Transfer), and submit your order.',
      },
      {
        q: 'What payment methods are accepted?',
        a: 'We accept MTN Mobile Money, Telecel Cash, AirtelTigo Money, and bank transfers from major Ghanaian banks.',
      },
      {
        q: 'What are the trading fees?',
        a: 'We charge competitive rates with the spread built into our buy/sell prices. There are no hidden fees. The exact rate is shown before you confirm each transaction.',
      },
      {
        q: 'How long does a transaction take?',
        a: 'Mobile Money payments are usually confirmed within 15-30 minutes. Bank transfers may take 1-2 business days depending on your bank.',
      },
    ],
  },
  {
    category: 'Wallet & Security',
    icon: Shield,
    color: 'bg-purple-500',
    items: [
      {
        q: 'Is my cryptocurrency safe?',
        a: 'Yes! We use industry-standard security practices including encrypted storage, secure API communications, and regular security audits to protect your assets.',
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Settings > Security > Change Password. You\'ll need to enter your current password and your new password (minimum 8 characters).',
      },
      {
        q: 'What if I forget my password?',
        a: 'Click "Forgot Password" on the login page. Enter your email address, and we\'ll send you a password reset link valid for 1 hour.',
      },
    ],
  },
  {
    category: 'Orders & Transactions',
    icon: Clock,
    color: 'bg-amber-500',
    items: [
      {
        q: 'How do I track my order?',
        a: 'Go to the Orders page to see all your transactions. Each order shows its current status: Pending, Processing, Completed, or Rejected.',
      },
      {
        q: 'Can I cancel an order?',
        a: 'Orders that are still in "Pending" status can typically be cancelled. Once processing begins, cancellation may not be possible. Contact support if you need assistance.',
      },
      {
        q: 'Why was my order rejected?',
        a: 'Orders can be rejected for payment issues, insufficient verification, or policy violations. Check the order details for the specific reason, or contact our support team.',
      },
    ],
  },
]

// ============================================
// FAQ ITEM
// ============================================
function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`border rounded-lg overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
          isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
        }`}
      >
        <span className="font-medium text-sm text-slate-900 dark:text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// CREATE TICKET FORM
// ============================================
function CreateTicketForm({ onCreated }: { onCreated: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState('general')
  const [priority, setPriority] = useState('normal')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setIsSending(true)
    try {
      await ticketsApi.create({ subject, message, category, priority })
      toast.success('Ticket created! We\'ll respond within 24 hours.')
      setSubject('')
      setMessage('')
      setCategory('general')
      setPriority('normal')
      onCreated()
    } catch (err) {
      toast.error('Failed to create ticket')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-md bg-emerald-500">
            <Plus className="w-4 h-4 text-white" />
          </div>
          Create Support Ticket
        </CardTitle>
        <CardDescription>Describe your issue and we'll get back to you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="general">General</option>
                <option value="account">Account</option>
                <option value="payment">Payment</option>
                <option value="order">Order Issue</option>
                <option value="technical">Technical</option>
                <option value="kyc">Verification</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={`w-full h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              className="h-10"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Message</Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={4}
              required
              className={`w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
          <Button
            type="submit"
            disabled={isSending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
            ) : (
              <><Send className="w-4 h-4" /> Submit Ticket</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ============================================
// TICKET STATUS BADGE
// ============================================
function TicketStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Open' },
    in_progress: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'In Progress' },
    resolved: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'Resolved' },
    closed: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Closed' },
  }
  const c = config[status] || config.open
  return <Badge className={`${c.bg} ${c.text} text-xs`}>{c.label}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    low: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
    normal: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    high: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  }
  const c = config[priority] || config.normal
  return <Badge className={`${c.bg} ${c.text} text-xs capitalize`}>{priority}</Badge>
}

// ============================================
// TICKET LIST
// ============================================
function TicketList({ tickets, onSelect, isLoading }: { tickets: any[]; onSelect: (id: string) => void; isLoading: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <TicketIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No tickets yet</p>
        <p className="text-slate-400 text-sm mt-1">Create a ticket to get support</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket: any, i: number) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onSelect(ticket.id)}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
            isDark
              ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                  {ticket.subject}
                </p>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                {ticket.lastMessage || 'No messages yet'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <TicketStatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {ticket.messageCount || 0}
                </span>
                <span className="text-xs text-slate-400">
                  {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : ''}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 rotate-[-90deg] flex-shrink-0 mt-1" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// TICKET DETAIL (CONVERSATION VIEW)
// ============================================
function TicketDetail({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const { user } = useAuth()
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadTicket = async () => {
    try {
      const res = await ticketsApi.getById(ticketId)
      setTicket(res.data.data.ticket)
      setMessages(res.data.data.messages || [])
    } catch (err) {
      toast.error('Failed to load ticket')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [ticketId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) return
    setIsSending(true)
    try {
      await ticketsApi.reply(ticketId, reply)
      setReply('')
      await loadTicket()
    } catch (err) {
      toast.error('Failed to send reply')
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
        <p className="text-slate-500">Ticket not found</p>
        <Button variant="outline" onClick={onBack} className="mt-3">Go Back</Button>
      </div>
    )
  }

  const isClosed = ticket.status === 'closed'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-0.5">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{ticket.subject}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
            <span className="text-xs text-slate-400">
              Created {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy h:mm a') : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <Card className={`border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
        <CardContent className="p-4">
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {messages.map((msg: any, i: number) => {
              const isStaff = !!msg.isStaff
              const isMe = !isStaff && msg.userId === user?.id
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex ${isStaff ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${isStaff ? 'order-2' : ''}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm ${
                      isStaff
                        ? isDark
                          ? 'bg-slate-700/80 text-slate-200 rounded-tl-md'
                          : 'bg-slate-100 text-slate-800 rounded-tl-md'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 ${isStaff ? '' : 'justify-end'}`}>
                      {isStaff ? (
                        <><Shield className="w-3 h-3 text-emerald-500" /> Support Team</>
                      ) : (
                        <span>{msg.firstName || 'You'}</span>
                      )}
                      <span>&middot;</span>
                      <span>{msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, h:mm a') : ''}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply box */}
          {!isClosed ? (
            <form onSubmit={handleReply} className="mt-4 flex gap-2">
              <Input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 h-10"
                disabled={isSending}
              />
              <Button
                type="submit"
                disabled={isSending || !reply.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 h-10 px-4"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          ) : (
            <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-center text-sm text-slate-500">
              <CheckCircle className="w-4 h-4 inline mr-1.5" />
              This ticket has been closed
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// SUPPORT PAGE
// ============================================
export default function SupportPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'faq' | 'tickets' | 'new'>('faq')
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const loadTickets = async () => {
    setIsLoadingTickets(true)
    try {
      const res = await ticketsApi.getAll()
      setTickets(res.data.data || [])
    } catch (err) {
      // silent
    } finally {
      setIsLoadingTickets(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadTickets()
    }
  }, [activeTab])

  // Filter FAQs by search
  const filteredCategories = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0)

  const displayCategories = activeCategory
    ? filteredCategories.filter(c => c.category === activeCategory)
    : filteredCategories

  const tabs = [
    { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
    { id: 'tickets' as const, label: 'My Tickets', icon: TicketIcon, badge: tickets.filter(t => t.status !== 'closed').length },
    { id: 'new' as const, label: 'New Ticket', icon: Plus },
  ]

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
            <p className="text-slate-500 dark:text-slate-400">Find answers, manage tickets, or reach out to our team</p>
          </motion.div>

          {/* Quick Contact Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              { icon: Mail, label: 'Email', value: 'support@kimcrypto.com', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
              { icon: Phone, label: 'Phone', value: '+233 20 000 0000', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
              { icon: Clock, label: 'Hours', value: 'Mon-Fri 9am-6pm', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
            ].map(item => (
              <Card key={item.label} className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {tabs.map(tab => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedTicketId(null) }}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search frequently asked questions..."
                    className="h-11 pl-10"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={!activeCategory ? 'default' : 'outline'}
                    onClick={() => setActiveCategory(null)}
                    className={!activeCategory ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                  >
                    All
                  </Button>
                  {FAQ_CATEGORIES.map(cat => {
                    const CatIcon = cat.icon
                    return (
                      <Button
                        key={cat.category}
                        size="sm"
                        variant={activeCategory === cat.category ? 'default' : 'outline'}
                        onClick={() => setActiveCategory(activeCategory === cat.category ? null : cat.category)}
                        className={activeCategory === cat.category ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                      >
                        <CatIcon className="w-3.5 h-3.5 mr-1.5" />
                        {cat.category}
                      </Button>
                    )
                  })}
                </div>

                {/* FAQ Items */}
                {displayCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No results found</p>
                    <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  displayCategories.map((cat, catIndex) => {
                    const CatIcon = cat.icon
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-1.5 rounded-md ${cat.color}`}>
                            <CatIcon className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{cat.category}</h3>
                          <span className="text-xs text-slate-400">({cat.items.length})</span>
                        </div>
                        <div className="space-y-2">
                          {cat.items.map((item) => {
                            const key = `${cat.category}-${item.q}`
                            return (
                              <FAQItem
                                key={key}
                                question={item.q}
                                answer={item.a}
                                isOpen={openFAQ === key}
                                onToggle={() => setOpenFAQ(openFAQ === key ? null : key)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                )}

                {/* CTA to create ticket */}
                <Card className={`border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-medium text-slate-900 dark:text-white mb-1">Can't find what you're looking for?</p>
                    <p className="text-sm text-slate-500 mb-3">Create a support ticket and our team will help you</p>
                    <Button
                      onClick={() => setActiveTab('new')}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'tickets' && (
              <motion.div
                key="tickets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {selectedTicketId ? (
                  <TicketDetail
                    ticketId={selectedTicketId}
                    onBack={() => { setSelectedTicketId(null); loadTickets() }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-white">My Support Tickets</h3>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab('new')}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        <Plus className="w-4 h-4 mr-1" /> New Ticket
                      </Button>
                    </div>
                    <TicketList
                      tickets={tickets}
                      onSelect={setSelectedTicketId}
                      isLoading={isLoadingTickets}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'new' && (
              <motion.div
                key="new"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CreateTicketForm
                  onCreated={() => {
                    setActiveTab('tickets')
                    loadTickets()
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
