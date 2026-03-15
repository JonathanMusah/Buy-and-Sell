import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { adminApi } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  Settings,
  Mail,
  Shield,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Send,
  Server,
  Eye,
  EyeOff,
  Fingerprint,
  ShieldCheck,
  UserPlus,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SmtpConfig {
  host: string
  port: string
  user: string
  pass: string
  from: string
  configured: boolean
}

interface FeatureToggles {
  email_verification: boolean
  two_factor_auth: boolean
  kyc_required: boolean
  registration_enabled: boolean
  maintenance_mode: boolean
}

const featureDetails = [
  {
    key: 'email_verification' as const,
    label: 'Email Verification',
    description: 'Require users to verify their email address after registration before they can place orders',
    icon: Mail,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    key: 'two_factor_auth' as const,
    label: 'Two-Factor Authentication (2FA)',
    description: 'Allow users to enable TOTP-based two-factor authentication for login security',
    icon: Fingerprint,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    key: 'kyc_required' as const,
    label: 'KYC Verification Required',
    description: 'Require users to complete Know Your Customer verification before trading',
    icon: ShieldCheck,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    key: 'registration_enabled' as const,
    label: 'User Registration',
    description: 'Allow new users to create accounts on the platform',
    icon: UserPlus,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    key: 'maintenance_mode' as const,
    label: 'Maintenance Mode',
    description: 'Put the platform in maintenance mode — users will see a maintenance notice',
    icon: Wrench,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
]

export default function AdminSettings() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [loading, setLoading] = useState(true)
  const [savingSmtp, setSavingSmtp] = useState(false)
  const [savingFeatures, setSavingFeatures] = useState(false)
  const [testingSmtp, setTestingSmtp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const [smtp, setSmtp] = useState<SmtpConfig>({
    host: '',
    port: '587',
    user: '',
    pass: '',
    from: '',
    configured: false,
  })

  const [features, setFeatures] = useState<FeatureToggles>({
    email_verification: true,
    two_factor_auth: true,
    kyc_required: true,
    registration_enabled: true,
    maintenance_mode: false,
  })

  const [originalFeatures, setOriginalFeatures] = useState<FeatureToggles>({ ...features })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getSettings()
      const data = res.data?.data || res.data
      if (data.smtp) {
        setSmtp(data.smtp)
      }
      if (data.features) {
        setFeatures(data.features)
        setOriginalFeatures(data.features)
      }
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSmtp = async () => {
    setSavingSmtp(true)
    try {
      const res = await adminApi.updateSmtp(smtp)
      const data = res.data?.data || res.data
      toast.success(data.message || 'SMTP settings saved')
      loadSettings()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Failed to save SMTP settings')
    } finally {
      setSavingSmtp(false)
    }
  }

  const handleTestSmtp = async () => {
    if (!testEmail.trim()) {
      toast.error('Enter an email address to send a test to')
      return
    }
    setTestingSmtp(true)
    try {
      const res = await adminApi.testSmtp(testEmail.trim())
      const data = res.data?.data || res.data
      toast.success(data.message || 'Test email sent!')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'SMTP test failed')
    } finally {
      setTestingSmtp(false)
    }
  }

  const handleToggleFeature = (key: keyof FeatureToggles) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveFeatures = async () => {
    setSavingFeatures(true)
    try {
      const res = await adminApi.updateFeatures(features as unknown as Record<string, boolean>)
      const data = res.data?.data || res.data
      toast.success(data.message || 'Feature toggles updated')
      setOriginalFeatures({ ...features })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg || 'Failed to update features')
    } finally {
      setSavingFeatures(false)
    }
  }

  const featuresChanged = JSON.stringify(features) !== JSON.stringify(originalFeatures)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-500">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            isDark ? "bg-slate-700" : "bg-slate-100"
          )}>
            <Settings className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Platform Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure SMTP email and feature toggles</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadSettings}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* ==================== SMTP CONFIGURATION ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={cn(
          "border",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
        )}>
          <CardContent className="p-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-blue-900/30" : "bg-blue-50"
                )}>
                  <Server className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">SMTP Configuration</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Configure email delivery for notifications, verification & broadcasts</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  smtp.configured
                    ? "border-emerald-300 text-emerald-600 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:bg-emerald-900/20"
                    : "border-amber-300 text-amber-600 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-900/20"
                )}
              >
                {smtp.configured ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Configured</>
                ) : (
                  <><AlertTriangle className="w-3 h-3 mr-1" /> Not Configured</>
                )}
              </Badge>
            </div>

            {/* SMTP Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Host</Label>
                <Input
                  value={smtp.host}
                  onChange={e => setSmtp(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className={cn(
                    isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-300"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Port</Label>
                <Input
                  value={smtp.port}
                  onChange={e => setSmtp(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="587"
                  className={cn(
                    isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-300"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Username / Email</Label>
                <Input
                  value={smtp.user}
                  onChange={e => setSmtp(prev => ({ ...prev, user: e.target.value }))}
                  placeholder="your-email@gmail.com"
                  className={cn(
                    isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-300"
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">SMTP Password / App Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={smtp.pass}
                    onChange={e => setSmtp(prev => ({ ...prev, pass: e.target.value }))}
                    placeholder="••••••••"
                    className={cn(
                      "pr-10",
                      isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-300"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">From Address</Label>
                <Input
                  value={smtp.from}
                  onChange={e => setSmtp(prev => ({ ...prev, from: e.target.value }))}
                  placeholder='JDExchange <no-reply@jdexchange.com>'
                  className={cn(
                    isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-300"
                  )}
                />
                <p className="text-xs text-slate-500">Format: Display Name &lt;email@domain.com&gt;</p>
              </div>
            </div>

            {/* Save & Test */}
            <div className={cn(
              "flex flex-col sm:flex-row items-stretch sm:items-end gap-4 pt-4 border-t",
              isDark ? "border-slate-700" : "border-slate-200"
            )}>
              <Button
                onClick={handleSaveSmtp}
                disabled={savingSmtp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                {savingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save SMTP Settings
              </Button>

              <div className="flex-1 flex items-end gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-slate-500 mb-1 block">Send a test email</Label>
                  <Input
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    className={cn(
                      "text-sm",
                      isDark ? "bg-slate-900/50 border-slate-700" : "bg-white border-slate-300"
                    )}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp || !smtp.configured}
                  className="gap-2 shrink-0"
                >
                  {testingSmtp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Test
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ==================== FEATURE TOGGLES ==================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={cn(
          "border",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"
        )}>
          <CardContent className="p-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isDark ? "bg-purple-900/30" : "bg-purple-50"
                )}>
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Feature Toggles</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enable or disable platform features</p>
                </div>
              </div>
              {featuresChanged && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                  Unsaved changes
                </Badge>
              )}
            </div>

            {/* Feature List */}
            <div className="space-y-3 mb-6">
              {featureDetails.map((feature) => {
                const Icon = feature.icon
                const enabled = features[feature.key]
                return (
                  <div
                    key={feature.key}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all",
                      isDark
                        ? enabled
                          ? "bg-slate-700/50 border-slate-600"
                          : "bg-slate-800/30 border-slate-700/50"
                        : enabled
                          ? "bg-white border-slate-200"
                          : "bg-slate-50 border-slate-200/80"
                    )}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={cn("p-2 rounded-lg shrink-0", feature.bg)}>
                        <Icon className={cn("w-5 h-5", feature.color)} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={cn(
                            "font-medium",
                            enabled
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          )}>
                            {feature.label}
                          </h4>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            enabled
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          )}>
                            {enabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm mt-0.5",
                          enabled
                            ? "text-slate-500 dark:text-slate-400"
                            : "text-slate-400 dark:text-slate-500"
                        )}>
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => handleToggleFeature(feature.key)}
                      className={cn(
                        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ml-4",
                        enabled
                          ? "bg-emerald-500"
                          : isDark ? "bg-slate-600" : "bg-slate-300"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                          enabled ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Save Features */}
            <div className={cn(
              "flex items-center justify-between pt-4 border-t",
              isDark ? "border-slate-700" : "border-slate-200"
            )}>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Changes take effect immediately after saving
              </p>
              <Button
                onClick={handleSaveFeatures}
                disabled={savingFeatures || !featuresChanged}
                className={cn(
                  "gap-2 transition-all",
                  featuresChanged
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : ""
                )}
              >
                {savingFeatures ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Feature Toggles
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
