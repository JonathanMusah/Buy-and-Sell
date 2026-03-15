import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { userApi, authApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import {
  Mail,
  Phone,
  Shield,
  Edit2,
  Loader2,
  CheckCircle,
  User,
  Calendar,
  Award,
  Key,
  Bell,
  Globe,
  Lock,
  Clock,
  XCircle,
  Wallet,
  ChevronRight,
  Camera,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

function Avatar({ user, onUpload, onRemove, isUploading }: { user: any; onUpload?: () => void; onRemove?: () => void; isUploading?: boolean }) {
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`
  const hasImage = !!user?.profileImage

  return (
    <div className="relative group">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-3xl overflow-hidden ring-4 ring-emerald-500/20">
        {hasImage ? (
          <img
            src={`${API_BASE}${user.profileImage}`}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
              ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <span className={hasImage ? 'hidden' : ''}>{initials}</span>
      </div>

      {/* Camera overlay */}
      {onUpload && (
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <>
              <button
                onClick={onUpload}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Upload photo"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              {hasImage && onRemove && (
                <button
                  onClick={onRemove}
                  className="w-10 h-10 rounded-full bg-red-500/60 hover:bg-red-500/80 flex items-center justify-center transition-colors"
                  aria-label="Remove photo"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              )}
            </>
          )}
        </div>
      )}

      {(user?.kycStatus === 'verified' || user?.role === 'admin') && (
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-md" aria-label="Verified account">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19A1 1 0 0120 20A1 1 0 0119 21A1 1 0 0118 20A1 1 0 0119 19M5 19A1 1 0 016 20A1 1 0 015 21A1 1 0 014 20A1 1 0 015 19Z"/>
          </svg>
        </div>
      )}
    </div>
  )
}

function ProfileHeroCard({ user, isEditing, setIsEditing, onAvatarUpload, onAvatarRemove, isUploadingAvatar }: { user: any; isEditing: boolean; setIsEditing: (value: boolean) => void; onAvatarUpload: () => void; onAvatarRemove: () => void; isUploadingAvatar: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const getKycStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'amber', icon: Clock, label: 'Pending Verification' },
      verified: { color: 'emerald', icon: CheckCircle, label: 'Verified' },
      rejected: { color: 'red', icon: XCircle, label: 'Verification Failed' },
    }
    return configs[status] || configs.pending
  }

  const kycConfig = getKycStatusConfig(user?.kycStatus || 'pending')
  const KycIcon = kycConfig.icon

  return (
    <div className={`rounded-xl border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <Avatar user={user} onUpload={onAvatarUpload} onRemove={onAvatarRemove} isUploading={isUploadingAvatar} />

        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            {user?.kycStatus === 'verified' && (
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <p className="text-slate-500 mb-3">{user?.email}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant="outline" className={isDark ? 'border-slate-600 text-slate-300' : 'border-slate-300 text-slate-600'}>
              {user?.role === 'admin' ? 'Administrator' : 'Member'}
            </Badge>
            <Badge
              className={`${
                kycConfig.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                kycConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              <KycIcon className="w-3 h-3 mr-1" />
              {kycConfig.label}
            </Badge>
          </div>
        </div>

        <Button
          variant={isEditing ? 'outline' : 'default'}
          onClick={() => setIsEditing(!isEditing)}
          className={isEditing ? '' : 'bg-emerald-500 hover:bg-emerald-600'}
        >
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function KYCProgressCard({ user }: { user: any }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()

  const getKycStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; progress: number }> = {
      pending: { color: 'amber', bg: 'bg-amber-500', progress: 50 },
      verified: { color: 'emerald', bg: 'bg-emerald-500', progress: 100 },
      rejected: { color: 'red', bg: 'bg-red-500', progress: 30 },
    }
    return configs[status] || configs.pending
  }

  const kycConfig = getKycStatusConfig(user?.kycStatus || 'pending')

  return (
    <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-md bg-emerald-500">
            <Shield className="w-4 h-4 text-white" />
          </div>
          Verification Status
        </CardTitle>
        <CardDescription>Your account security level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              KYC Verification
            </span>
            <span className={`text-sm font-bold ${kycConfig.color === 'amber' ? 'text-amber-500' : kycConfig.color === 'emerald' ? 'text-emerald-500' : 'text-red-500'}`}>
              {kycConfig.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${kycConfig.bg}`} style={{ width: `${kycConfig.progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {user?.kycStatus === 'verified'
              ? 'Your account is fully verified. Enjoy premium benefits!'
              : 'Complete verification to unlock higher limits and premium features'}
          </p>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg ${
          user?.isVerified 
            ? (isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200')
            : (isDark ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200')
        } border`}>
          <div className="flex items-center gap-2">
            <Mail className={`w-4 h-4 ${user?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="text-sm font-medium">Email</span>
          </div>
          <span className={`text-sm capitalize ${user?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
            {user?.isVerified ? 'Verified' : 'Pending'}
          </span>
        </div>

        <div className={`flex items-center justify-between p-3 rounded-lg ${
          user?.phone 
            ? (isDark ? 'bg-emerald-900/30 border-emerald-800' : 'bg-emerald-50 border-emerald-200')
            : (isDark ? 'bg-amber-900/30 border-amber-800' : 'bg-amber-50 border-amber-200')
        } border`}>
          <div className="flex items-center gap-2">
            <Phone className={`w-4 h-4 ${user?.phone ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="text-sm font-medium">Phone</span>
          </div>
          <span className={`text-sm capitalize ${user?.phone ? 'text-emerald-500' : 'text-amber-500'}`}>
            {user?.phone ? 'Verified' : 'Pending'}
          </span>
        </div>

        {user?.kycStatus !== 'verified' && (
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={() => navigate('/kyc')}>
            <Shield className="w-4 h-4 mr-2" />
            Complete Verification
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function ProfileStatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
  }

  return (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colorClasses[color] || colorClasses.emerald}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

function SettingsRow({ icon: Icon, title, description, action }: { icon: any; title: string; description: string; action: React.ReactNode }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`flex items-center justify-between p-3 hover:${isDark ? 'bg-slate-700/50' : 'bg-slate-50'} transition-colors rounded-lg cursor-pointer`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Icon className="w-4 h-4 text-slate-500" />
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white text-sm">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [stats, setStats] = useState({ volume: 0, totalOrders: 0, successRate: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  })

  useEffect(() => {
    loadStats()
  }, [])

  const handleAvatarUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, or WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      await userApi.uploadAvatar(fd)
      await refreshUser()
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAvatarRemove = async () => {
    setIsUploadingAvatar(true)
    try {
      await userApi.removeAvatar()
      await refreshUser()
      toast.success('Profile picture removed')
    } catch (err) {
      toast.error('Failed to remove profile picture')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await userApi.getOrders()
      const orders = response.data?.data || []
      const completed = orders.filter((o: any) => o.status === 'completed')
      const failed = orders.filter((o: any) => o.status === 'rejected' || o.status === 'cancelled')
      const volume = completed.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      const rate = orders.length > 0 ? Math.round((completed.length / (completed.length + failed.length || 1)) * 100) : 0
      setStats({ volume, totalOrders: orders.length, successRate: rate })
    } catch (e) {
      // Non-critical, keep defaults
    }
  }

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await userApi.updateProfile(formData)
      await refreshUser()
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your account settings and preferences</p>
          </div>

          <ProfileHeroCard
            user={user}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
            isUploadingAvatar={isUploadingAvatar}
          />

          {/* Hidden file input for avatar upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-1.5 rounded-md bg-blue-500">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-sm">First Name</Label>
                          <Input
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-sm">Last Name</Label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-sm">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+233 20 123 4567"
                            className="h-10 pl-9"
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { icon: Mail, label: 'Email Address', value: user?.email },
                        { icon: Phone, label: 'Phone Number', value: user?.phone || 'Not set' },
                        { icon: Calendar, label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '-' },
                        { icon: Award, label: 'Account Type', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '-' }
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                              <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">{item.label}</p>
                              <p className="font-medium text-slate-900 dark:text-white text-sm">{item.value}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <KYCProgressCard user={user} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ProfileStatCard
              label="Trading Volume"
              value={`₵${stats.volume.toLocaleString()}`}
              icon={Shield}
              color="emerald"
            />
            <ProfileStatCard
              label="Total Orders"
              value={stats.totalOrders.toString()}
              icon={CheckCircle}
              color="blue"
            />
            <ProfileStatCard
              label="Success Rate"
              value={`${stats.successRate}%`}
              icon={CheckCircle}
              color="purple"
            />
            <ProfileStatCard
              label="Security"
              value={user?.kycStatus === 'verified' ? 'High' : 'Medium'}
              icon={Shield}
              color="amber"
            />
          </div>

          <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md bg-purple-500">
                  <Key className="w-4 h-4 text-white" />
                </div>
                Settings
              </CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-200 dark:divide-slate-700 p-4 pt-0 space-y-1">
                <SettingsRow
                  icon={Lock}
                  title="Change Password"
                  description="Update your account password"
                  action={<Button size="sm" variant="outline" onClick={() => setShowPasswordDialog(true)}>Change</Button>}
                />
                <SettingsRow
                  icon={Bell}
                  title="Notifications"
                  description="Manage your notification preferences"
                  action={<Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Configure</Button>}
                />
                <SettingsRow
                  icon={Globe}
                  title="Language & Region"
                  description="English (US) • GMT+0"
                  action={<Button size="sm" variant="outline" onClick={() => navigate('/settings')}>Change</Button>}
                />
                <SettingsRow
                  icon={Wallet}
                  title="Wallet & Balances"
                  description="View your crypto balances"
                  action={<Button size="sm" variant="outline" onClick={() => navigate('/wallet')}>View</Button>}
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Password Dialog */}
          <ChangePasswordDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
        </div>
      </div>
    </>
  )
}

// ============================================
// CHANGE PASSWORD DIALOG
// ============================================
function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      onOpenChange(false)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      toast.error(axiosErr?.response?.data?.error || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            Change Password
          </DialogTitle>
          <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              minLength={8}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="h-10"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}