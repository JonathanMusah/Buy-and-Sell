import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Mail, CheckCircle, Bitcoin } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/apiClient'

export default function ForgotPasswordPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await authApi.forgotPassword(email)
      setIsSuccess(true)
      toast.success('Password reset link sent to your email!')
    } catch (err: any) {
      // Always show success to not leak email existence
      setIsSuccess(true)
      toast.success('If an account exists, a reset link has been sent.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden py-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}>
        {/* Gradient orbs */}
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
              <Bitcoin className="w-10 h-10 text-white" />
            </div>
            {!isSuccess ? (
              <>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Forgot Password?
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Enter your email and we'll send you a reset link
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Check Your Email
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  We've sent a password reset link to <span className="font-semibold text-emerald-600">{email}</span>
                </p>
              </>
            )}
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`pl-10 h-12 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setIsSuccess(false)}
                    className="text-emerald-600 font-semibold hover:text-emerald-500 transition-colors"
                  >
                    try again
                  </button>
                </p>
              </div>

              <Link to="/login">
                <Button 
                  variant="outline"
                  className="w-full h-12"
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Footer links */}
          <div className="mt-8 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Remember your password?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional help */}
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
