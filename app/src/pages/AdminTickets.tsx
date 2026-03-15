import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Loader2,
  Send,
  ArrowLeft,
  Shield,
  User,
  AlertCircle,
  TicketIcon
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

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
// ADMIN TICKET DETAIL
// ============================================
function AdminTicketDetail({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadTicket = async () => {
    try {
      const res = await adminApi.getTicketById(ticketId)
      const { ticket: ticketData, messages: msgs } = res.data.data
      if (ticketData) {
        setTicket(ticketData)
        setStatus(ticketData.status)
        setPriority(ticketData.priority)
      }
      setMessages(msgs || [])
    } catch (err) {
      toast.error('Failed to load ticket details')
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
      await adminApi.replyTicket(ticketId, reply)
      setReply('')
      await loadTicket()
      toast.success('Reply sent')
    } catch (err) {
      toast.error('Failed to send reply')
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    try {
      await adminApi.updateTicket(ticketId, { status, priority })
      toast.success('Ticket updated')
      await loadTicket()
    } catch (err) {
      toast.error('Failed to update ticket')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{ticket.subject}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <TicketStatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
            <span className="text-xs text-slate-400">
              By {ticket.firstName} {ticket.lastName} ({ticket.email})
            </span>
          </div>
        </div>
      </div>

      {/* Status/Priority Controls */}
      <div className={cn(
        'flex items-end gap-3 p-3 rounded-xl border',
        isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'
      )}>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={cn(
              'w-full h-9 rounded-md border px-2 text-sm',
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
            )}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-500">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={cn(
              'w-full h-9 rounded-md border px-2 text-sm',
              isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
            )}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <Button
          size="sm"
          onClick={handleUpdateStatus}
          disabled={isUpdating}
          className="bg-emerald-500 hover:bg-emerald-600 h-9"
        >
          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Update'}
        </Button>
      </div>

      {/* Messages */}
      <div className={cn(
        'rounded-xl border p-4',
        isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {messages.map((msg: any, i: number) => {
            const isStaff = !!msg.isStaff
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%]`}>
                  <div className={cn(
                    'px-4 py-3 rounded-2xl text-sm',
                    isStaff
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-tr-md'
                      : isDark
                        ? 'bg-slate-700/80 text-slate-200 rounded-tl-md'
                        : 'bg-slate-100 text-slate-800 rounded-tl-md'
                  )}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 mt-1 text-[10px] text-slate-400 ${isStaff ? 'justify-end' : ''}`}>
                    {isStaff ? (
                      <><Shield className="w-3 h-3 text-emerald-500" /> Staff</>
                    ) : (
                      <><User className="w-3 h-3" /> {msg.firstName || 'User'}</>
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

        {/* Staff reply */}
        {ticket.status !== 'closed' && (
          <form onSubmit={handleReply} className="mt-4 flex gap-2">
            <Input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply as staff..."
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
        )}
      </div>
    </div>
  )
}

// ============================================
// ADMIN TICKETS LIST
// ============================================
export default function AdminTickets({ embedded: _embedded }: { embedded?: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  const loadTickets = async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getTickets()
      setTickets(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const openCount = tickets.filter(t => t.status === 'open').length
  const progressCount = tickets.filter(t => t.status === 'in_progress').length

  if (selectedTicketId) {
    return (
      <AdminTicketDetail
        ticketId={selectedTicketId}
        onBack={() => { setSelectedTicketId(null); loadTickets() }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Support Tickets</h3>
          <p className="text-sm text-slate-500">
            {tickets.length} total, {openCount} open, {progressCount} in progress
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'open', label: 'Open', count: openCount },
            { value: 'in_progress', label: 'In Progress', count: progressCount },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ].map(f => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? 'default' : 'outline'}
              onClick={() => setFilter(f.value)}
              className={filter === f.value ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{f.count}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <TicketIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedTicketId(String(ticket.id))}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md',
                isDark
                  ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300',
                ticket.status === 'open' && (isDark ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-blue-400'),
                ticket.priority === 'urgent' && (isDark ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-red-400')
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{ticket.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    By {ticket.firstName} {ticket.lastName} &middot; {ticket.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <TicketStatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <Badge variant="outline" className="text-xs capitalize">{ticket.category}</Badge>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {ticket.messageCount || 0}
                    </span>
                    <span className="text-xs text-slate-400">
                      {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : ''}
                    </span>
                  </div>
                </div>
                <div className="text-slate-400">
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
