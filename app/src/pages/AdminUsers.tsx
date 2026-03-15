import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { DashboardCard, EmptyState, CardSkeleton, ErrorBoundary } from '@/components/ui/dashboard-shared'
import { StaticGradient } from '@/components/ui/optimized-backgrounds'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { adminApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Search,
  Users,
  UserCheck,
  Clock,
  Shield,
  Mail,
  Phone,
  Calendar,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'user' | 'admin'
  isVerified: boolean
  isBlocked: boolean
  kycStatus: 'pending' | 'verified' | 'rejected'
  createdAt: string
}

const kycConfig = {
  pending: {
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    label: 'Pending',
  },
  verified: {
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    label: 'Verified',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    label: 'Rejected',
  },
}

// ============================================
// STAT CARD
// ============================================

const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendUp,
  delay,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: 'emerald' | 'blue' | 'amber' | 'slate'
  trend?: string
  trendUp?: boolean
  delay?: number
}) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: 'bg-emerald-100 dark:bg-emerald-800',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-100 dark:bg-blue-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-600 dark:text-amber-400',
      icon: 'bg-amber-100 dark:bg-amber-800',
    },
    slate: {
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      text: 'text-slate-600 dark:text-slate-400',
      icon: 'bg-slate-100 dark:bg-slate-800',
    },
  }

  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ? delay * 0.1 : 0, duration: 0.4 }}
      className="group"
    >
      <div
        className={cn(
          'relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300',
          'bg-white dark:bg-slate-800/60',
          'border-slate-200 dark:border-slate-700',
          'hover:border-emerald-500/30 hover:shadow-lg'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <motion.p
              className={cn('text-2xl font-bold', colors.text)}
              key={value}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {value.toLocaleString()}
            </motion.p>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 mt-2 text-sm',
                  trendUp ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                <span>{trendUp ? '↑' : '↓'}</span>
                <span>{trend}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
              colors.icon
            )}
          >
            <Icon className={cn('w-5 h-5', colors.text)} />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ============================================
// FILTER BUTTON
// ============================================

const FilterButton = memo(function FilterButton({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap',
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
      )}
    >
      <span className="flex items-center gap-2">
        {label}
        {count !== undefined && count > 0 && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs',
              isActive ? 'bg-white/30' : 'bg-slate-100 dark:bg-slate-700'
            )}
          >
            {count}
          </span>
        )}
      </span>
    </button>
  )
})

// ============================================
// USER CARD
// ============================================

const UserCard = memo(function UserCard({
  user,
  index,
  onEdit,
  onSuspend,
}: {
  user: User
  index: number
  onEdit: (user: User) => void
  onSuspend: (user: User) => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const kycConf = kycConfig[user.kycStatus] || kycConfig.pending
  const KycIcon = kycConf.icon
  const isAdmin = user.role === 'admin'
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group"
    >
      <div
        className={cn(
          'relative border rounded-xl overflow-hidden transition-all duration-300',
          'bg-white dark:bg-slate-800/80',
          'border-slate-200 dark:border-slate-700',
          'hover:border-emerald-500/30 hover:shadow-lg'
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl transition-transform duration-300 group-hover:scale-110',
                isAdmin
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              )}
            >
              {initials}
            </div>

            <div className="text-center w-full">
              <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h3>
                {isAdmin && (
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="break-all">{user.email}</span>
                </span>
                {user.isVerified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </div>

              <div className={cn('mt-2 px-3 py-2 rounded-lg border', kycConf.bg)}>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full',
                      kycConf.color.replace('text-', 'bg-'),
                      user.kycStatus === 'pending' && 'animate-pulse'
                    )}
                  />
                  <KycIcon className={cn('w-4 h-4', kycConf.color)} />
                  <span className={cn('font-semibold text-sm', kycConf.color)}>{kycConf.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: Phone, label: 'Phone', value: user.phone || '-' },
              { icon: Calendar, label: 'Joined', value: format(new Date(user.createdAt), 'MMM d, yyyy') },
              { icon: Shield, label: 'Role', value: user.role },
              { icon: CheckCircle, label: 'Status', value: user.isVerified ? 'Verified' : 'Unverified' },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 rounded-xl flex items-center gap-3',
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    isDark ? 'bg-slate-600' : 'bg-white'
                  )}
                >
                  <item.icon className="w-5 h-5 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEdit(user)}
              className={cn(
                'w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors',
                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
              )}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onSuspend(user)}
              className={cn(
                'w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors',
                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
                user.isBlocked
                  ? 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
                  : 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
              )}
            >
              {user.isBlocked ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Unsuspend
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Suspend
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ============================================
// MAIN PAGE
// ============================================

export default function AdminUsersPage({ embedded = false }: { embedded?: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Edit dialog state
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user')
  const [editKycStatus, setEditKycStatus] = useState<'pending' | 'verified' | 'rejected'>('pending')
  const [editKycReason, setEditKycReason] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Suspend dialog state
  const [suspendUser, setSuspendUser] = useState<User | null>(null)
  const [suspendSaving, setSuspendSaving] = useState(false)

  const filteredUsers = useMemo(() => {
    let filtered = users

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query)
      )
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter((user) => {
        switch (activeFilter) {
          case 'verified':
            return user.isVerified
          case 'pending':
            return user.kycStatus === 'pending'
          case 'admin':
            return user.role === 'admin'
          default:
            return true
        }
      })
    }

    return filtered
  }, [users, searchQuery, activeFilter])

  const stats = useMemo(
    () => ({
      total: users.length,
      verified: users.filter((u) => u.isVerified).length,
      pendingKyc: users.filter((u) => u.kycStatus === 'pending').length,
      admins: users.filter((u) => u.role === 'admin').length,
    }),
    [users]
  )

  const filters = useMemo(
    () => [
      { id: 'all', label: 'All Users', count: users.length },
      { id: 'verified', label: 'Verified', count: stats.verified },
      { id: 'pending', label: 'Pending KYC', count: stats.pendingKyc },
      { id: 'admin', label: 'Admins', count: stats.admins },
    ],
    [users.length, stats.verified, stats.pendingKyc, stats.admins]
  )

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminApi.getUsers()
      const usersData = response.data?.data || response.data || []
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  // Open edit dialog
  const handleEdit = useCallback((user: User) => {
    setEditUser(user)
    setEditRole(user.role)
    setEditKycStatus(user.kycStatus)
    setEditKycReason('')
  }, [])

  // Save edit changes
  const handleEditSave = useCallback(async () => {
    if (!editUser) return
    try {
      setEditSaving(true)
      const updateData: Record<string, string> = {}
      if (editRole !== editUser.role) updateData.role = editRole
      if (editKycStatus !== editUser.kycStatus) {
        updateData.kycStatus = editKycStatus
        if (editKycStatus === 'rejected' && editKycReason.trim()) {
          updateData.kycRejectionReason = editKycReason.trim()
        }
      }
      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save')
        setEditUser(null)
        return
      }
      await adminApi.updateUser(editUser.id, updateData)
      toast.success(`User ${editUser.firstName} ${editUser.lastName} updated successfully`)
      setEditUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setEditSaving(false)
    }
  }, [editUser, editRole, editKycStatus, editKycReason, fetchUsers])

  // Open suspend confirmation
  const handleSuspendClick = useCallback((user: User) => {
    setSuspendUser(user)
  }, [])

  // Confirm suspend/unsuspend
  const handleSuspendConfirm = useCallback(async () => {
    if (!suspendUser) return
    try {
      setSuspendSaving(true)
      const newBlocked = !suspendUser.isBlocked
      await adminApi.updateUser(suspendUser.id, { isBlocked: newBlocked })
      toast.success(
        newBlocked
          ? `${suspendUser.firstName} ${suspendUser.lastName} has been suspended`
          : `${suspendUser.firstName} ${suspendUser.lastName} has been unsuspended`
      )
      setSuspendUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user status')
    } finally {
      setSuspendSaving(false)
    }
  }, [suspendUser, fetchUsers])

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard')
      return
    }
    fetchUsers()
  }, [currentUser, navigate, fetchUsers])

  const content = (
    <div className="relative min-h-screen pb-12">
      {!embedded && <StaticGradient variant="emerald" className="opacity-30" />}

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/50">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">All Users</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {stats.total} registered user{stats.total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} header={false} lines={2} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <StatCard title="Total Users" value={stats.total} icon={Users} color="emerald" delay={0} />
            <StatCard
              title="Verified"
              value={stats.verified}
              icon={UserCheck}
              color="blue"
              trend={`${Math.round((stats.verified / (stats.total || 1)) * 100)}%`}
              trendUp={true}
              delay={1}
            />
            <StatCard title="Pending KYC" value={stats.pendingKyc} icon={Clock} color="amber" delay={2} />
            <StatCard title="Admins" value={stats.admins} icon={Shield} color="slate" delay={3} />
          </div>
        )}

        {/* Filters & Search */}
        <DashboardCard className="mb-6">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'pl-12 h-12 rounded-xl',
                  isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-100 border-slate-200'
                )}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((filter) => (
                <FilterButton
                  key={filter.id}
                  label={filter.label}
                  isActive={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  count={filter.count}
                />
              ))}
              <button
                onClick={fetchUsers}
                className={cn(
                  'p-3 rounded-xl transition-all duration-300',
                  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
                  'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600'
                )}
              >
                <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
              </button>
            </div>
          </div>
        </DashboardCard>

        {/* Users List */}
        <DashboardCard
          header={{
            title: 'User List',
            icon: <Users className="w-5 h-5 text-emerald-500" />,
            action: (
              <span className="text-sm text-slate-500">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </span>
            ),
          }}
        >
          {loading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} lines={4} className="h-64" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title={searchQuery ? 'No users found' : 'No users yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Users will appear here when they register'
              }
            />
          ) : (
            <div className="grid gap-4">
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  index={index}
                  onEdit={handleEdit}
                  onSuspend={handleSuspendClick}
                />
              ))}
            </div>
          )}
        </DashboardCard>
      </motion.div>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-emerald-500" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update details for {editUser?.firstName} {editUser?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as 'user' | 'admin')}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* KYC Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-kyc">KYC Status</Label>
              <Select
                value={editKycStatus}
                onValueChange={(v) => setEditKycStatus(v as 'pending' | 'verified' | 'rejected')}
              >
                <SelectTrigger id="edit-kyc">
                  <SelectValue placeholder="Select KYC status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rejection Reason (shown only when rejecting) */}
            {editKycStatus === 'rejected' && editUser?.kycStatus !== 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="edit-reason">Rejection Reason</Label>
                <Input
                  id="edit-reason"
                  placeholder="Enter reason for rejection..."
                  value={editKycReason}
                  onChange={(e) => setEditKycReason(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)} disabled={editSaving}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend/Unsuspend Confirmation */}
      <AlertDialog open={!!suspendUser} onOpenChange={(open) => !open && setSuspendUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendUser?.isBlocked ? 'Unsuspend User' : 'Suspend User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendUser?.isBlocked
                ? `Are you sure you want to unsuspend ${suspendUser?.firstName} ${suspendUser?.lastName}? They will regain access to their account.`
                : `Are you sure you want to suspend ${suspendUser?.firstName} ${suspendUser?.lastName}? They will be unable to access their account until unsuspended.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={suspendSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendConfirm}
              disabled={suspendSaving}
              className={cn(
                suspendUser?.isBlocked
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {suspendSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {suspendUser?.isBlocked ? 'Unsuspend' : 'Suspend'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <>
      <ErrorBoundary>{content}</ErrorBoundary>
    </>
  )
}
