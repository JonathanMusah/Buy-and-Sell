import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { lazy, Suspense, Component, useEffect } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Toaster } from '@/components/ui/sonner'

const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://portfolio-ebon-three-7s08ky8fvu.vercel.app'

// Eager load landing and auth pages for instant first paint
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

// Lazy load all other pages for code splitting
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ExchangePage = lazy(() => import('@/pages/ExchangePage'))
const OrdersPage = lazy(() => import('@/pages/OrdersPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const AdminOrders = lazy(() => import('@/pages/AdminOrders'))
const AdminUsers = lazy(() => import('@/pages/AdminUsers'))
const AdminEnhancedDashboard = lazy(() => import('@/pages/AdminEnhancedDashboard'))
const AdminCryptoManagement = lazy(() => import('@/pages/AdminCryptoManagement'))
const AdminPaymentMethods = lazy(() => import('@/pages/AdminPaymentMethods'))
const AdminRatesManagement = lazy(() => import('@/pages/AdminRatesManagement'))
const AdminSiteContent = lazy(() => import('@/pages/AdminSiteContent'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const CryptoBuyPage = lazy(() => import('@/pages/CryptoBuyPage'))
const CryptoSellPage = lazy(() => import('@/pages/CryptoSellPage'))
const KYCPage = lazy(() => import('@/pages/KYCPage'))
const WalletPage = lazy(() => import('@/pages/WalletPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const SupportPage = lazy(() => import('@/pages/SupportPage'))
const ReviewsPage = lazy(() => import('@/pages/ReviewsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Preload dashboard page chunks after initial render so navigation is instant
function preloadDashboardPages() {
  const pages = [
    () => import('@/pages/DashboardPage'),
    () => import('@/pages/ExchangePage'),
    () => import('@/pages/OrdersPage'),
    () => import('@/pages/ProfilePage'),
    () => import('@/pages/WalletPage'),
    () => import('@/pages/SettingsPage'),
    () => import('@/pages/SupportPage'),
    () => import('@/pages/ReviewsPage'),
    () => import('@/pages/CryptoBuyPage'),
    () => import('@/pages/CryptoSellPage'),
    () => import('@/pages/KYCPage'),
    () => import('@/pages/AdminPage'),
  ]
  // Stagger preloads to avoid saturating the network
  pages.forEach((load, i) => {
    setTimeout(() => load(), 1000 + i * 200)
  })
}

// ============================================
// GLOBAL ERROR BOUNDARY
// ============================================
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.href = '/'
              }}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================
// AUTH LOGOUT LISTENER (handles token refresh failures)
// ============================================
function AuthLogoutListener() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    const handleLogout = () => {
      logout()
      navigate('/login', { replace: true })
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [logout, navigate])

  return null
}

// Simple loading spinner
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <motion.div 
        className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// Lightweight inline fallback — keeps the layout feel instead of a blank screen
function PageFallback() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
        <motion.p
          className="text-sm text-slate-400 dark:text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  )
}

// Protected route component
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// Layout route wrappers — DashboardLayout stays mounted, only content swaps
function ProtectedDashboardLayout() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <DashboardLayout />
}

function ProtectedAdminLayout() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <DashboardLayout />
}

// Scroll to top on every route change (for full-page navigations)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppRoutes() {
  // Preload all dashboard page chunks after initial render
  useEffect(() => {
    preloadDashboardPages()
  }, [])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<Suspense fallback={<PageFallback />}><ForgotPasswordPage /></Suspense>} />
      <Route path="/reset-password" element={<Suspense fallback={<PageFallback />}><ResetPasswordPage /></Suspense>} />
      <Route path="/verify-email" element={<Suspense fallback={<PageFallback />}><VerifyEmailPage /></Suspense>} />
      <Route path="/onboarding" element={<ProtectedRoute><Suspense fallback={<PageFallback />}><OnboardingPage /></Suspense></ProtectedRoute>} />

      {/* Protected User Routes — sidebar persists across these */}
      <Route element={<ProtectedDashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/exchange" element={<ExchangePage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/kyc" element={<KYCPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/buy" element={<Suspense fallback={<PageFallback />}><CryptoBuyPage /></Suspense>} />
        <Route path="/sell" element={<Suspense fallback={<PageFallback />}><CryptoSellPage /></Suspense>} />
      </Route>

      {/* Admin Routes with sidebar — sidebar persists across these */}
      <Route element={<ProtectedAdminLayout />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/rates" element={<AdminRatesManagement />} />
        <Route path="/admin/site-content" element={<Suspense fallback={<PageFallback />}><AdminSiteContent /></Suspense>} />
      </Route>

      {/* Standalone protected pages (own full-page layout) */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageFallback />}><AdminEnhancedDashboard /></Suspense></ProtectedRoute>} />
      <Route path="/admin/cryptos" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageFallback />}><AdminCryptoManagement /></Suspense></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><Suspense fallback={<PageFallback />}><AdminPaymentMethods /></Suspense></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Suspense fallback={<PageFallback />}><NotFoundPage /></Suspense>} />
    </Routes>
  )
}

function PortfolioBridge() {
  return (
    <a
      href={PORTFOLIO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[60] px-4 py-2.5 rounded-full bg-slate-900/90 text-white text-sm font-medium border border-white/10 shadow-lg shadow-black/25 hover:bg-emerald-600 transition-colors"
      aria-label="Open portfolio in a new tab"
    >
      Back to Portfolio
    </a>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AuthLogoutListener />
            <AppRoutes />
            <PortfolioBridge />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
