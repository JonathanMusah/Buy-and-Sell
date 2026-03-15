import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { authApi, userApi } from '@/lib/apiClient'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'user' | 'admin'
  isVerified: boolean
  emailVerified: boolean
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
  profileImage?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    const { default: axiosInstance } = await import('@/lib/apiClient')
    const response = await axiosInstance.post('/auth/login', { email, password, twoFactorCode })
    const data = response.data.data

    // If 2FA is required, throw a specific error so the login page can show the 2FA input
    if (data.requires2FA) {
      const err = new Error('2FA_REQUIRED') as Error & { requires2FA: boolean }
      err.requires2FA = true
      throw err
    }

    const { token, refreshToken, user } = data
    localStorage.setItem('token', token)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
  }

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data)
    const { token, refreshToken, user } = response.data.data
    localStorage.setItem('token', token)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const response = await userApi.getProfile()
      setUser(response.data.data.user)
    } catch (error) {
      console.error('Failed to refresh user:', error)
      logout()
    } finally {
      setIsLoading(false)
    }
  }

  // ── Idle Timeout (15 min inactivity → auto-logout) ──
  const IDLE_TIMEOUT = 15 * 60 * 1000   // 15 minutes
  const WARNING_BEFORE = 60 * 1000       // warn 1 min before logout

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningToastId = useRef<string | number | null>(null)

  const clearIdleTimers = useCallback(() => {
    if (idleTimer.current) { clearTimeout(idleTimer.current); idleTimer.current = null }
    if (warningTimer.current) { clearTimeout(warningTimer.current); warningTimer.current = null }
    if (warningToastId.current) { toast.dismiss(warningToastId.current); warningToastId.current = null }
  }, [])

  const startIdleTimers = useCallback(() => {
    clearIdleTimers()

    // Show warning 1 min before timeout
    warningTimer.current = setTimeout(() => {
      warningToastId.current = toast.warning(
        'You will be logged out in 1 minute due to inactivity.',
        { duration: 55_000, id: 'idle-warning' }
      )
    }, IDLE_TIMEOUT - WARNING_BEFORE)

    // Actual logout
    idleTimer.current = setTimeout(() => {
      clearIdleTimers()
      logout()
      toast.info('You have been logged out due to inactivity.', { duration: 6000 })
    }, IDLE_TIMEOUT)
  }, [clearIdleTimers])

  useEffect(() => {
    if (!user) { clearIdleTimers(); return }

    const resetIdle = () => startIdleTimers()

    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }))

    startIdleTimers()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle))
      clearIdleTimers()
    }
  }, [user, startIdleTimers, clearIdleTimers])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
