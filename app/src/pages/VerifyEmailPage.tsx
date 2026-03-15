import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/apiClient'

type VerifyState = 'loading' | 'success' | 'already-verified' | 'expired' | 'error'

export default function VerifyEmailPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'error')
  const [errorMessage, setErrorMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setState('error')
      setErrorMessage('No verification token provided.')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await authApi.verifyEmail(token)
        if (response.data.data.alreadyVerified) {
          setState('already-verified')
        } else {
          setState('success')
          toast.success('Email verified successfully!')
        }
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Verification failed'
        if (msg.toLowerCase().includes('expired')) {
          setState('expired')
          setErrorMessage(msg)
        } else {
          setState('error')
          setErrorMessage(msg)
        }
      }
    }

    verifyEmail()
  }, [token])

  const handleResendVerification = async () => {
    if (!resendEmail) {
      toast.error('Please enter your email address')
      return
    }
    setIsResending(true)
    try {
      await authApi.resendVerification(resendEmail)
      setResendSuccess(true)
      toast.success('Verification email sent!')
    } catch {
      toast.error('Failed to send verification email')
    } finally {
      setIsResending(false)
    }
  }

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mb-6 shadow-lg shadow-emerald-500/30">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Verifying Your Email...
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Please wait while we verify your email address.
            </p>
          </>
        )

      case 'success':
        return (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Email Verified!
            </h1>
            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your email has been verified successfully. You can now access all features of JDExchange.
            </p>
            <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <strong>Next step:</strong> Complete your KYC verification to start buying and selling crypto.
              </p>
            </div>
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full h-12 mt-2">
                  Sign In
                </Button>
              </Link>
            </div>
          </>
        )

      case 'already-verified':
        return (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/20 mb-6">
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Already Verified
            </h1>
            <p className={`text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your email address has already been verified. You're all set!
            </p>
            <div className="space-y-3">
              <Link to="/dashboard">
                <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/25">
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full h-12 mt-2">
                  Sign In
                </Button>
              </Link>
            </div>
          </>
        )

      case 'expired':
        return (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
              <XCircle className="w-10 h-10 text-amber-500" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Link Expired
            </h1>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              This verification link has expired. Enter your email below to receive a new one.
            </p>
            {!resendSuccess ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 h-12 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-emerald-500'}`}
                  />
                </div>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold"
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </div>
                  ) : 'Resend Verification Email'}
                </Button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  A new verification link has been sent to <strong className="text-emerald-600">{resendEmail}</strong>. Check your inbox and spam folder.
                </p>
              </div>
            )}
            <Link to="/login" className="block mt-4">
              <Button variant="outline" className="w-full h-12">
                Back to Login
              </Button>
            </Link>
          </>
        )

      case 'error':
      default:
        return (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 mb-6">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Verification Failed
            </h1>
            <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {errorMessage || 'Unable to verify your email. The link may be invalid or expired.'}
            </p>
            {!resendSuccess ? (
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 h-12 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white/80 border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-emerald-500'}`}
                  />
                </div>
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold"
                >
                  {isResending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                    </div>
                  ) : 'Request New Verification Email'}
                </Button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  A verification email has been sent if the account exists. Check your inbox and spam folder.
                </p>
              </div>
            )}
            <Link to="/login" className="block mt-4">
              <Button variant="outline" className="w-full h-12">
                Back to Login
              </Button>
            </Link>
          </>
        )
    }
  }

  return (
    <div className={`min-h-screen relative flex items-center justify-center overflow-hidden py-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}>
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-400/15'} rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute bottom-0 right-1/4 w-[400px] h-[400px] ${isDark ? 'bg-blue-500/15' : 'bg-blue-400/10'} rounded-full blur-[100px] animate-pulse`} style={{ animationDelay: '1s' }} />
        
        <div 
          className={`absolute inset-0 ${isDark ? 'opacity-[0.02]' : 'opacity-[0.03]'}`}
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)'} 1px, transparent 1px),
                              linear-gradient(90deg, ${isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.2)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border text-center ${isDark ? 'bg-slate-900/60 border-white/10' : 'bg-white/70 border-slate-200 shadow-lg'}`}>
          {renderContent()}
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
