import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { authApi, userApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Monitor,
  Moon,
  Sun,
  Globe,
  Loader2,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Trash2,
  Smartphone,
  Key,
  Mail,
  X,
  Clock,
  Laptop,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react'

// ============================================
// SETTING SECTION CARD
// ============================================
function SettingSection({
  icon: Icon,
  iconColor,
  title,
  description,
  children,
  index = 0,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  description: string
  children: React.ReactNode
  index?: number
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className={`p-1.5 rounded-md ${iconColor}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// SETTING ROW
// ============================================
function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500 truncate">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-3">
        {children}
      </div>
    </div>
  )
}

// ============================================
// LANGUAGES + TIMEZONES
// ============================================
const LANGUAGES = [
  { value: 'en', label: 'English (US)' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ar', label: 'العربية' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'GMT+0 (UTC)' },
  { value: 'America/New_York', label: 'GMT-5 (Eastern)' },
  { value: 'America/Chicago', label: 'GMT-6 (Central)' },
  { value: 'America/Denver', label: 'GMT-7 (Mountain)' },
  { value: 'America/Los_Angeles', label: 'GMT-8 (Pacific)' },
  { value: 'Europe/London', label: 'GMT+0 (London)' },
  { value: 'Europe/Paris', label: 'GMT+1 (Paris)' },
  { value: 'Europe/Berlin', label: 'GMT+1 (Berlin)' },
  { value: 'Africa/Accra', label: 'GMT+0 (Accra)' },
  { value: 'Africa/Lagos', label: 'GMT+1 (Lagos)' },
  { value: 'Africa/Nairobi', label: 'GMT+3 (Nairobi)' },
  { value: 'Asia/Dubai', label: 'GMT+4 (Dubai)' },
  { value: 'Asia/Kolkata', label: 'GMT+5:30 (India)' },
  { value: 'Asia/Shanghai', label: 'GMT+8 (China)' },
  { value: 'Asia/Tokyo', label: 'GMT+9 (Tokyo)' },
  { value: 'Australia/Sydney', label: 'GMT+11 (Sydney)' },
]

// ============================================
// SETTINGS PAGE
// ============================================
export default function SettingsPage() {
  const { logout } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const navigate = useNavigate()

  // Password dialog
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(null)

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FASetupDialog, setShow2FASetupDialog] = useState(false)
  const [show2FADisableDialog, setShow2FADisableDialog] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [twoFactorSecret, setTwoFactorSecret] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [is2FALoading, setIs2FALoading] = useState(false)
  const [secretCopied, setSecretCopied] = useState(false)
  const [disablePassword, setDisablePassword] = useState('')

  // Sessions state
  const [showSessionsDialog, setShowSessionsDialog] = useState(false)
  const [sessions, setSessions] = useState<Array<{
    id: string; browser: string; os: string; device: string;
    ipAddress: string; lastActive: string; createdAt: string; isCurrent: boolean;
  }>>([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true,
    security: true,
    newsletter: false,
    promotions: false,
  })
  const [notifLoaded, setNotifLoaded] = useState(false)

  // Language & timezone
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [showLanguageDialog, setShowLanguageDialog] = useState(false)
  const [showTimezoneDialog, setShowTimezoneDialog] = useState(false)

  // Account dialogs
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  // Load preferences and 2FA status on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prefsRes, twoFARes] = await Promise.all([
          userApi.getPreferences(),
          authApi.get2FAStatus(),
        ])

        const prefs = prefsRes.data.data
        setNotifPrefs(prefs.notificationPrefs)
        setLanguage(prefs.language)
        setTimezone(prefs.timezone)
        setPasswordChangedAt(prefs.passwordChangedAt)
        setNotifLoaded(true)

        setTwoFactorEnabled(twoFARes.data.data.enabled)
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    loadData()
  }, [])

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsChangingPassword(true)
    try {
      await authApi.changePassword(currentPassword, newPassword)
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordDialog(false)
      setPasswordChangedAt(new Date().toISOString())
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      toast.error(axiosErr?.response?.data?.error || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 2FA setup handler
  const handle2FASetup = async () => {
    setIs2FALoading(true)
    try {
      const res = await authApi.setup2FA()
      setQrCode(res.data.data.qrCode)
      setTwoFactorSecret(res.data.data.secret)
      setShow2FASetupDialog(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      toast.error(axiosErr?.response?.data?.error || 'Failed to setup 2FA')
    } finally {
      setIs2FALoading(false)
    }
  }

  // 2FA verify handler
  const handle2FAVerify = async () => {
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }
    setIs2FALoading(true)
    try {
      await authApi.verify2FA(verifyCode)
      toast.success('Two-factor authentication enabled!')
      setTwoFactorEnabled(true)
      setShow2FASetupDialog(false)
      setVerifyCode('')
      setQrCode('')
      setTwoFactorSecret('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      toast.error(axiosErr?.response?.data?.error || 'Invalid code')
    } finally {
      setIs2FALoading(false)
    }
  }

  // 2FA disable handler
  const handle2FADisable = async () => {
    if (!disablePassword) {
      toast.error('Password is required')
      return
    }
    setIs2FALoading(true)
    try {
      await authApi.disable2FA(disablePassword)
      toast.success('Two-factor authentication disabled')
      setTwoFactorEnabled(false)
      setShow2FADisableDialog(false)
      setDisablePassword('')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      toast.error(axiosErr?.response?.data?.error || 'Failed to disable 2FA')
    } finally {
      setIs2FALoading(false)
    }
  }

  // Load sessions
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const res = await userApi.getSessions()
      setSessions(res.data.data)
    } catch {
      toast.error('Failed to load sessions')
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  const handleViewSessions = () => {
    setShowSessionsDialog(true)
    loadSessions()
  }

  // Revoke session
  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId)
    try {
      await userApi.revokeSession(sessionId)
      toast.success('Session revoked')
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch {
      toast.error('Failed to revoke session')
    } finally {
      setRevokingId(null)
    }
  }

  // Revoke all sessions
  const handleRevokeAll = async () => {
    setIsLoadingSessions(true)
    try {
      await userApi.revokeAllSessions()
      toast.success('All other sessions revoked')
      setSessions(prev => prev.filter(s => s.isCurrent))
    } catch {
      toast.error('Failed to revoke sessions')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  // Notification toggle handler
  const handleNotifToggle = async (key: keyof typeof notifPrefs, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value }
    setNotifPrefs(updated)
    try {
      await userApi.updateNotificationPrefs(updated)
      const labels: Record<string, string> = {
        orderUpdates: 'Order updates',
        security: 'Security alerts',
        newsletter: 'Newsletter',
        promotions: 'Promotions',
      }
      toast.success(`${labels[key]} ${value ? 'enabled' : 'disabled'}`)
    } catch {
      // Revert on error
      setNotifPrefs(prev => ({ ...prev, [key]: !value }))
      toast.error('Failed to update preference')
    }
  }

  // Language change
  const handleLanguageChange = async (lang: string) => {
    try {
      await userApi.updateLanguage(lang)
      setLanguage(lang)
      setShowLanguageDialog(false)
      toast.success('Language updated')
    } catch {
      toast.error('Failed to update language')
    }
  }

  // Timezone change
  const handleTimezoneChange = async (tz: string) => {
    try {
      await userApi.updateTimezone(tz)
      setTimezone(tz)
      setShowTimezoneDialog(false)
      toast.success('Timezone updated')
    } catch {
      toast.error('Failed to update timezone')
    }
  }

  // Logout
  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  // Delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm')
      return
    }
    if (!deletePassword) {
      toast.error('Password is required')
      return
    }
    setIsDeletingAccount(true)
    try {
      await userApi.deleteAccount(deletePassword)
      toast.success('Account deleted successfully')
      logout()
      navigate('/login')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      toast.error(axiosErr?.response?.data?.error || 'Failed to delete account')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  // Helpers
  const formatPasswordDate = () => {
    if (!passwordChangedAt) return 'Never changed'
    try {
      const date = new Date(passwordChangedAt)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 0) return 'Changed today'
      if (diffDays === 1) return 'Changed yesterday'
      if (diffDays < 30) return `Changed ${diffDays} days ago`
      if (diffDays < 365) return `Changed ${Math.floor(diffDays / 30)} months ago`
      return `Changed ${Math.floor(diffDays / 365)} years ago`
    } catch {
      return 'Unknown'
    }
  }

  const getLanguageLabel = (code: string) =>
    LANGUAGES.find(l => l.value === code)?.label || 'English (US)'

  const getTimezoneLabel = (tz: string) =>
    TIMEZONES.find(t => t.value === tz)?.label || 'GMT+0 (UTC)'

  const copySecret = () => {
    navigator.clipboard.writeText(twoFactorSecret)
    setSecretCopied(true)
    setTimeout(() => setSecretCopied(false), 2000)
  }

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your account preferences and security</p>
          </motion.div>

          {/* ================================================ */}
          {/* SECURITY SECTION */}
          {/* ================================================ */}
          <SettingSection
            icon={Shield}
            iconColor="bg-emerald-500"
            title="Security"
            description="Protect your account"
            index={0}
          >
            {/* Password */}
            <SettingRow icon={Lock} title="Password" description={formatPasswordDate()}>
              <Button size="sm" variant="outline" onClick={() => setShowPasswordDialog(true)}>
                Change
              </Button>
            </SettingRow>
            <Separator className="dark:bg-slate-700" />

            {/* Two-Factor Authentication */}
            <SettingRow
              icon={Smartphone}
              title="Two-Factor Authentication"
              description={twoFactorEnabled ? 'Enabled — your account is secured' : 'Add extra security to your account'}
            >
              {twoFactorEnabled ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={() => setShow2FADisableDialog(true)}
                  >
                    Disable
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handle2FASetup}
                  disabled={is2FALoading}
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                >
                  {is2FALoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable'}
                </Button>
              )}
            </SettingRow>
            <Separator className="dark:bg-slate-700" />

            {/* Login Sessions */}
            <SettingRow icon={Key} title="Login Sessions" description="Manage your active sessions">
              <Button size="sm" variant="outline" onClick={handleViewSessions}>
                View
              </Button>
            </SettingRow>
          </SettingSection>

          {/* ================================================ */}
          {/* NOTIFICATIONS SECTION */}
          {/* ================================================ */}
          <SettingSection
            icon={Bell}
            iconColor="bg-blue-500"
            title="Notifications"
            description="Choose what you want to be notified about"
            index={1}
          >
            <SettingRow icon={ArrowUpIcon} title="Order Updates" description="Get notified when your orders are processed">
              <Switch
                checked={notifPrefs.orderUpdates}
                disabled={!notifLoaded}
                onCheckedChange={(v) => handleNotifToggle('orderUpdates', v)}
              />
            </SettingRow>
            <Separator className="dark:bg-slate-700" />
            <SettingRow icon={Shield} title="Security Alerts" description="Login attempts and suspicious activity">
              <Switch
                checked={notifPrefs.security}
                disabled={!notifLoaded}
                onCheckedChange={(v) => handleNotifToggle('security', v)}
              />
            </SettingRow>
            <Separator className="dark:bg-slate-700" />
            <SettingRow icon={Mail} title="Newsletter" description="Product updates and crypto news">
              <Switch
                checked={notifPrefs.newsletter}
                disabled={!notifLoaded}
                onCheckedChange={(v) => handleNotifToggle('newsletter', v)}
              />
            </SettingRow>
            <Separator className="dark:bg-slate-700" />
            <SettingRow icon={Bell} title="Promotions" description="Special offers and discounts">
              <Switch
                checked={notifPrefs.promotions}
                disabled={!notifLoaded}
                onCheckedChange={(v) => handleNotifToggle('promotions', v)}
              />
            </SettingRow>
          </SettingSection>

          {/* ================================================ */}
          {/* APPEARANCE SECTION */}
          {/* ================================================ */}
          <SettingSection
            icon={Monitor}
            iconColor="bg-purple-500"
            title="Appearance"
            description="Customize how the app looks"
            index={2}
          >
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' },
              ].map((theme) => {
                const ThemeIcon = theme.icon
                const isActive = (resolvedTheme === theme.value) ||
                  (theme.value === 'system' && resolvedTheme !== 'light' && resolvedTheme !== 'dark')
                return (
                  <button
                    key={theme.value}
                    onClick={() => setTheme(theme.value as 'light' | 'dark' | 'system')}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : isDark
                        ? 'border-slate-700 hover:border-slate-600 bg-slate-800'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <ThemeIcon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <p className={`text-sm font-medium ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {theme.label}
                    </p>
                    {isActive && (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto mt-1.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </SettingSection>

          {/* ================================================ */}
          {/* LANGUAGE & REGION SECTION */}
          {/* ================================================ */}
          <SettingSection
            icon={Globe}
            iconColor="bg-amber-500"
            title="Language & Region"
            description="Set your preferred language and timezone"
            index={3}
          >
            <SettingRow icon={Globe} title="Language" description={getLanguageLabel(language)}>
              <Button size="sm" variant="outline" onClick={() => setShowLanguageDialog(true)}>
                Change
              </Button>
            </SettingRow>
            <Separator className="dark:bg-slate-700" />
            <SettingRow icon={Clock} title="Timezone" description={getTimezoneLabel(timezone)}>
              <Button size="sm" variant="outline" onClick={() => setShowTimezoneDialog(true)}>
                Change
              </Button>
            </SettingRow>
          </SettingSection>

          {/* ================================================ */}
          {/* ACCOUNT / DANGER ZONE */}
          {/* ================================================ */}
          <SettingSection
            icon={AlertTriangle}
            iconColor="bg-red-500"
            title="Account"
            description="Session and account management"
            index={4}
          >
            <SettingRow icon={LogOut} title="Log Out" description="Sign out of your account on this device">
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={() => setShowLogoutDialog(true)}
              >
                Log Out
              </Button>
            </SettingRow>
            <Separator className="dark:bg-slate-700" />
            <SettingRow icon={Trash2} title="Delete Account" description="Permanently delete your account and data">
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete
              </Button>
            </SettingRow>
          </SettingSection>
        </div>
      </div>

      {/* ================================================ */}
      {/* CHANGE PASSWORD DIALOG */}
      {/* ================================================ */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              Change Password
            </DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Current Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">New Password</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
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
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="h-10"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword} className="bg-emerald-500 hover:bg-emerald-600">
                {isChangingPassword ? (
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

      {/* ================================================ */}
      {/* 2FA SETUP DIALOG */}
      {/* ================================================ */}
      <Dialog open={show2FASetupDialog} onOpenChange={(v) => { if (!is2FALoading) setShow2FASetupDialog(v) }}>
        <DialogContent className={`sm:max-w-md ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" />
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCode && (
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            {/* Manual entry key */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Or enter this key manually:</Label>
              <div className="flex items-center gap-2">
                <code className={`flex-1 px-3 py-2 rounded-lg text-xs font-mono break-all ${
                  isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700'
                }`}>
                  {twoFactorSecret}
                </code>
                <Button size="sm" variant="outline" onClick={copySecret} className="flex-shrink-0">
                  {secretCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Verification code */}
            <div className="space-y-1.5">
              <Label className="text-sm">Enter the 6-digit code from your app</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="h-12 text-center text-lg tracking-[0.3em] font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShow2FASetupDialog(false)} disabled={is2FALoading}>
              Cancel
            </Button>
            <Button
              onClick={handle2FAVerify}
              disabled={is2FALoading || verifyCode.length !== 6}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {is2FALoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================ */}
      {/* 2FA DISABLE DIALOG */}
      {/* ================================================ */}
      <Dialog open={show2FADisableDialog} onOpenChange={setShow2FADisableDialog}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-red-500" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Enter your password to confirm disabling 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`p-3 rounded-lg flex items-start gap-2 ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-100'}`}>
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">
                Disabling 2FA removes an important layer of security. Anyone with your password will be able to access your account.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Your Password</Label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShow2FADisableDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handle2FADisable}
              disabled={is2FALoading || !disablePassword}
              className="bg-red-500 hover:bg-red-600"
            >
              {is2FALoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                'Disable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================ */}
      {/* LOGIN SESSIONS DIALOG */}
      {/* ================================================ */}
      <Dialog open={showSessionsDialog} onOpenChange={setShowSessionsDialog}>
        <DialogContent className={`sm:max-w-lg ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-emerald-500" />
              Active Sessions
            </DialogTitle>
            <DialogDescription>
              Manage devices where you&apos;re currently signed in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {isLoadingSessions ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-center py-8 text-sm text-slate-500">No active sessions found</p>
            ) : (
              <AnimatePresence>
                {sessions.map((session, i) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-3 rounded-lg border ${
                      session.isCurrent
                        ? isDark ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-200'
                        : isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          session.isCurrent
                            ? 'bg-emerald-500/20'
                            : isDark ? 'bg-slate-600' : 'bg-slate-200'
                        }`}>
                          <Laptop className={`w-4 h-4 ${session.isCurrent ? 'text-emerald-500' : 'text-slate-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {session.browser || 'Unknown Browser'}
                            </p>
                            {session.isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500 text-white rounded-full font-medium flex-shrink-0">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {session.os || 'Unknown OS'} &bull; {session.device || 'Desktop'} &bull; {session.ipAddress || 'Unknown IP'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Signed in {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0"
                          onClick={() => handleRevokeSession(session.id)}
                          disabled={revokingId === session.id}
                        >
                          {revokingId === session.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 dark:border-red-800"
                onClick={handleRevokeAll}
                disabled={isLoadingSessions}
              >
                Revoke All Others
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowSessionsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================ */}
      {/* LANGUAGE DIALOG */}
      {/* ================================================ */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" />
              Choose Language
            </DialogTitle>
            <DialogDescription>Select your preferred language for the interface.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  language === lang.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600 bg-slate-700/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className={`text-sm font-medium ${
                  language === lang.value ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {lang.label}
                </p>
                {language === lang.value && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-1" />
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ================================================ */}
      {/* TIMEZONE DIALOG */}
      {/* ================================================ */}
      <Dialog open={showTimezoneDialog} onOpenChange={setShowTimezoneDialog}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Choose Timezone
            </DialogTitle>
            <DialogDescription>Select your timezone for accurate timestamps.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
            {TIMEZONES.map((tz) => (
              <button
                key={tz.value}
                onClick={() => handleTimezoneChange(tz.value)}
                className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                  timezone === tz.value
                    ? isDark ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'
                    : isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                }`}
              >
                <p className={`text-sm ${
                  timezone === tz.value ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {tz.label}
                </p>
                {timezone === tz.value && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ================================================ */}
      {/* LOGOUT CONFIRMATION */}
      {/* ================================================ */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-red-500" />
              Log Out
            </DialogTitle>
            <DialogDescription>Are you sure you want to log out? You&apos;ll need to sign in again.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================ */}
      {/* DELETE ACCOUNT CONFIRMATION */}
      {/* ================================================ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`p-3 rounded-lg flex items-start gap-2 ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-100'}`}>
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
                <p className="font-medium">This will permanently:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Delete your profile and personal data</li>
                  <li>Remove your wallet and balances</li>
                  <li>Delete all support tickets and reviews</li>
                  <li>Revoke all active sessions</li>
                </ul>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Type <span className="font-mono font-bold text-red-500">DELETE</span> to confirm</Label>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Enter your password</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your account password"
                className="h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || deleteConfirmText !== 'DELETE' || !deletePassword}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete My Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Small helper icon component for order updates row
function ArrowUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
    </svg>
  )
}
