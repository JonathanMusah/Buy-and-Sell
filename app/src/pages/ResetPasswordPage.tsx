import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, ShieldCheck, Bitcoin, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/apiClient'

export default function ResetPasswordPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  // Password strength checks
  const hasMinLength = newPassword.length >= 8
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasLowercase = /[a-z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const isPasswordStrong = hasMinLength && hasUppercase && hasLowercase && hasNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!isPasswordStrong) {
      setError('Password does not meet the requirements')
      return
    }

    setIsLoading(true)

    try {
      await authApi.resetPassword(token, newPassword)
      setIsSuccess(true)
      toast.success('Password reset successfully!')
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to reset password. The link may have expired.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // No token in URL
  if (!token) {
    return (
      <div className={`min-h-screen relative flex items-center justify-center overflow-hidden py-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}>
          <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/15'} rounded-full blur-[120px] animate-pulse`} />
        </div>
        <div className="relative z-10 w-full max-w-md px-4">
          <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border text-center ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/70 border-slate-200 shadow-lg'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Invalid Reset Link
            </h1>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              This password reset link is invalid or has already been used. Please request a new one.
            </p>
            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full h-12 mt-2">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden py-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}>
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/15'} rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] ${isDark ? 'bg-blue-500/15' : 'bg-blue-400/10'} rounded-full blur-[100px] animate-pulse`} style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)'} 1px, transparent 1px),
                              linear-gradient(90deg, ${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
      
      {/* Back to login */}
      <Link
        to="/login"
        className={`absolute top-4 left-4 sm:top-5 sm:left-5 md:top-6 md:left-6 z-20 inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-lg ${isDark ? 'bg-gradient-to-r from-white/20 to-white/10 border border-white/30 text-white hover:from-white/30 hover:to-white/20 hover:border-white/40' : 'bg-gradient-to-r from-emerald-500/30 to-emerald-400/20 border border-emerald-500/50 text-emerald-700 hover:from-emerald-500/40 hover:to-emerald-400/30 hover:border-emerald-500/60'}`}
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span className="hidden sm:inline">Back to login</span>
        <span className="sm:hidden">Back</span>
      </Link>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Glass card */}
        <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/70 border-slate-200 shadow-lg'}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mb-4 shadow-lg shadow-emerald-500/30">
              {isSuccess ? <ShieldCheck className="w-10 h-10 text-white" /> : <Bitcoin className="w-10 h-10 text-white" />}
            </div>
            {!isSuccess ? (
              <>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Set New Password
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Choose a strong password for your JDExchange account
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Password Updated!
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
              </>
            )}
          </div>

          {!isSuccess ? (
            <>
              {error && (
                <Alert className={`mb-6 ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-100 border-red-300 text-red-700'}`}>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    New Password
                  </Label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`pl-12 pr-12 h-12 rounded-xl ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-emerald-500'}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Confirm New Password
                  </Label>
                  <div className="relative group">
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-12 h-12 rounded-xl ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-emerald-500'}`}
                      required
                    />
                  </div>
                </div>

                {/* Password strength indicators */}
                {newPassword.length > 0 && (
                  <div className={`p-4 rounded-xl space-y-2 ${isDark ? 'bg-slate-800/50 border border-slate-700' : 'bg-slate-50 border border-slate-200'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Password Requirements
                    </p>
                    {[
                      { label: 'At least 8 characters', met: hasMinLength },
                      { label: 'One uppercase letter', met: hasUppercase },
                      { label: 'One lowercase letter', met: hasLowercase },
                      { label: 'One number', met: hasNumber },
                      { label: 'Passwords match', met: passwordsMatch },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                          {req.met && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-emerald-500' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading || !isPasswordStrong || !passwordsMatch}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your password has been updated. For security, you'll need to log in again with your new password.
                </p>
              </div>

              <Button 
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Remember your password?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Need help?{' '}
            <a href="mailto:support@jdexchange.com" className="text-emerald-600 hover:text-emerald-500 transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
