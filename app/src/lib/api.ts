// API Service with localStorage-based mock backend
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

const STORAGE_KEYS = {
  USERS: 'gcx_users_v3',
  CURRENT_USER: 'gcx_current_user_v3',
  ORDERS: 'gcx_orders_v3',
  WALLETS: 'gcx_wallets_v3',
  NOTIFICATIONS: 'gcx_notifications_v3',
}

const getStorage = (key: string, defaultValue: any = null) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Exchange rates
const RATES = {
  BTC: { buy: 892450, sell: 885000, name: 'Bitcoin', icon: '₿' },
  ETH: { buy: 45230, sell: 44800, name: 'Ethereum', icon: 'Ξ' },
  USDT: { buy: 15.85, sell: 15.75, name: 'Tether', icon: '₮' },
  BNB: { buy: 8450, sell: 8350, name: 'BNB', icon: 'B' },
  SOL: { buy: 2340, sell: 2310, name: 'Solana', icon: 'S' },
  XRP: { buy: 12.45, sell: 12.30, name: 'Ripple', icon: 'X' },
  ADA: { buy: 8.90, sell: 8.80, name: 'Cardano', icon: 'A' },
  GHS: { buy: 1, sell: 1, name: 'Ghana Cedi', icon: '₵' },
  USD: { buy: 15.85, sell: 15.75, name: 'US Dollar', icon: '$' },
}

// Initialize sample notifications
const initNotifications = () => {
  const existing = getStorage(STORAGE_KEYS.NOTIFICATIONS, [])
  if (existing.length === 0) {
    setStorage(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: generateId(),
        title: 'Welcome to GhanaCryptoX!',
        message: 'Your account has been created successfully.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        title: 'Demo Funds Added',
        message: 'We\'ve added demo funds to your wallet to get you started!',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ])
  }
}
initNotifications()

// API Functions
export const api = {
  post: async (endpoint: string, data?: any) => {
    console.log('API POST:', endpoint, data)
    await delay(400)
    
    // Auth Login
    if (endpoint === '/auth/login' || endpoint === 'auth/login') {
      const { email, password } = data
      
      if (email === 'admin@ghanacryptox.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin',
          email: 'admin@ghanacryptox.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isVerified: true,
          kycStatus: 'verified',
          createdAt: new Date().toISOString(),
        }
        const token = 'admin_' + generateId()
        setStorage(STORAGE_KEYS.CURRENT_USER, { user: adminUser, token })
        return { data: { token, user: adminUser } }
      }
      
      const users = getStorage(STORAGE_KEYS.USERS, [])
      const user = users.find((u: any) => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }
      
      const token = 'token_' + generateId()
      const { password: _, ...userWithoutPassword } = user
      setStorage(STORAGE_KEYS.CURRENT_USER, { user: userWithoutPassword, token })
      
      return { data: { token, user: userWithoutPassword } }
    }
    
    // Auth Register
    if (endpoint === '/auth/register' || endpoint === 'auth/register') {
      const users = getStorage(STORAGE_KEYS.USERS, [])
      
      if (users.find((u: any) => u.email === data.email)) {
        throw new Error('Email already registered')
      }
      
      const newUser = {
        id: generateId(),
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        role: 'user',
        isVerified: false,
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      }
      
      users.push(newUser)
      setStorage(STORAGE_KEYS.USERS, users)
      
      // Create wallet with demo funds
      const wallets = getStorage(STORAGE_KEYS.WALLETS, [])
      wallets.push({
        id: generateId(),
        userId: newUser.id,
        balances: {
          BTC: 0.05,
          ETH: 0.5,
          USDT: 100,
          BNB: 1,
          SOL: 5,
          XRP: 100,
          ADA: 200,
          GHS: 5000,
          USD: 0,
        },
        createdAt: new Date().toISOString(),
      })
      setStorage(STORAGE_KEYS.WALLETS, wallets)
      
      // Add welcome notification
      const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, [])
      notifications.push({
        id: generateId(),
        userId: newUser.id,
        title: 'Welcome to GhanaCryptoX!',
        message: `Hello ${data.firstName}, your account has been created successfully.`,
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      })
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
      
      const token = 'token_' + generateId()
      const { password: _, ...userWithoutPassword } = newUser
      setStorage(STORAGE_KEYS.CURRENT_USER, { user: userWithoutPassword, token })
      
      return { data: { token, user: userWithoutPassword } }
    }
    
    // Exchange Calculate
    if (endpoint === '/exchange/calculate' || endpoint === 'exchange/calculate') {
      const { fromCurrency, toCurrency, amount } = data
      const fromRate = (RATES as any)[fromCurrency]
      const toRate = (RATES as any)[toCurrency]
      
      const rate = fromRate.sell / toRate.buy
      const result = amount * rate
      const fee = result * 0.005
      
      return {
        data: {
          fromCurrency,
          toCurrency,
          amount: parseFloat(amount),
          rate,
          fee,
          finalAmount: result - fee,
          feePercentage: 0.5,
        },
      }
    }
    
    // Create Order
    if (endpoint === '/orders' || endpoint === 'orders') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      const newOrder = {
        id: generateId(),
        userId: current.user.id,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      orders.push(newOrder)
      setStorage(STORAGE_KEYS.ORDERS, orders)
      
      // Add notification
      const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, [])
      notifications.push({
        id: generateId(),
        userId: current.user.id,
        title: 'New Order Created',
        message: `Your order to exchange ${data.amount} ${data.fromCurrency} has been created.`,
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      })
      setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
      
      return { data: { order: newOrder } }
    }
    
    throw new Error('Endpoint not found: ' + endpoint)
  },
  
  get: async (endpoint: string) => {
    console.log('API GET:', endpoint)
    await delay(300)
    
    // Auth Me
    if (endpoint === '/auth/me' || endpoint === 'auth/me') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      return { data: current.user }
    }
    
    // Profile
    if (endpoint === '/users/profile' || endpoint === 'users/profile') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      return { data: current.user }
    }
    
    // Wallet
    if (endpoint === '/wallet' || endpoint === 'wallet') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      
      const wallets = getStorage(STORAGE_KEYS.WALLETS, [])
      const wallet = wallets.find((w: any) => w.userId === current.user.id)
      return { data: wallet || { balances: { GHS: 0 } } }
    }
    
    // Rates
    if (endpoint === '/rates' || endpoint === 'rates') {
      return { data: RATES }
    }
    
    // Orders
    if (endpoint === '/orders' || endpoint === 'orders') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      return { data: orders.filter((o: any) => o.userId === current.user.id).reverse() }
    }
    
    // Notifications
    if (endpoint === '/notifications' || endpoint === 'notifications') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      
      const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, [])
      return { data: notifications.filter((n: any) => !n.userId || n.userId === current.user.id).reverse() }
    }
    
    // Admin Users
    if (endpoint === '/admin/users' || endpoint === 'admin/users') {
      const users = getStorage(STORAGE_KEYS.USERS, [])
      return { 
        data: users.map((u: any) => {
          const { password: _, ...withoutPassword } = u
          return withoutPassword
        })
      }
    }
    
    // Admin Orders
    if (endpoint === '/admin/orders' || endpoint === 'admin/orders') {
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      return { data: orders.reverse() }
    }
    
    // Admin Stats
    if (endpoint === '/admin/stats' || endpoint === 'admin/stats') {
      const users = getStorage(STORAGE_KEYS.USERS, [])
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      
      return {
        data: {
          totalUsers: users.length,
          totalOrders: orders.length,
          totalVolume: Math.round(orders.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + o.amount * o.rate, 0)),
          pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
          completedOrders: orders.filter((o: any) => o.status === 'completed').length,
          todayOrders: orders.filter((o: any) => {
            const orderDate = new Date(o.createdAt)
            const today = new Date()
            return orderDate.toDateString() === today.toDateString()
          }).length,
        },
      }
    }
    
    // Public Stats
    if (endpoint === '/public/stats' || endpoint === 'public/stats') {
      return {
        data: {
          totalUsers: 1247 + getStorage(STORAGE_KEYS.USERS, []).length,
          totalOrders: 3421 + getStorage(STORAGE_KEYS.ORDERS, []).length,
          totalVolume: 28475000,
        },
      }
    }
    
    // Public Recent Orders
    if (endpoint === '/public/recent-orders' || endpoint === 'public/recent-orders') {
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      return { data: orders.slice(-5).reverse() }
    }
    
    throw new Error('Endpoint not found: ' + endpoint)
  },
  
  put: async (endpoint: string, data?: any) => {
    console.log('API PUT:', endpoint, data)
    await delay(400)
    
    // Update Profile - FIXED
    if (endpoint === '/users/profile' || endpoint === 'users/profile') {
      const current = getStorage(STORAGE_KEYS.CURRENT_USER)
      if (!current) throw new Error('Not authenticated')
      
      const users = getStorage(STORAGE_KEYS.USERS, [])
      const index = users.findIndex((u: any) => u.id === current.user.id)
      
      if (index !== -1) {
        // Update user data
        users[index] = { 
          ...users[index], 
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
        setStorage(STORAGE_KEYS.USERS, users)
        
        // Update current user
        const { password: _, ...updated } = users[index]
        setStorage(STORAGE_KEYS.CURRENT_USER, { ...current, user: updated })
        
        return { data: { user: updated } }
      }
      throw new Error('User not found')
    }
    
    // Mark notification as read
    if (endpoint.includes('/notifications/') && endpoint.includes('/read')) {
      const id = endpoint.split('/')[2]
      const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, [])
      const index = notifications.findIndex((n: any) => n.id === id)
      
      if (index !== -1) {
        notifications[index].read = true
        setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
        return { data: { success: true } }
      }
    }
    
    // Update Order Status (Admin)
    if (endpoint.includes('/admin/orders/') && endpoint.includes('/status')) {
      const id = endpoint.split('/')[3]
      const orders = getStorage(STORAGE_KEYS.ORDERS, [])
      const index = orders.findIndex((o: any) => o.id === id)
      
      if (index !== -1) {
        orders[index] = {
          ...orders[index],
          status: data.status,
          adminNotes: data.notes,
          updatedAt: new Date().toISOString(),
        }
        setStorage(STORAGE_KEYS.ORDERS, orders)
        
        // Notify user
        const notifications = getStorage(STORAGE_KEYS.NOTIFICATIONS, [])
        notifications.push({
          id: generateId(),
          userId: orders[index].userId,
          title: 'Order Status Updated',
          message: `Your order #${id.slice(0, 8)} is now ${data.status}.`,
          type: data.status === 'completed' ? 'success' : 'info',
          read: false,
          createdAt: new Date().toISOString(),
        })
        setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications)
        
        return { data: { order: orders[index] } }
      }
    }
    
    throw new Error('Endpoint not found: ' + endpoint)
  },
}

// Convenience exports
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
}

export const walletApi = {
  getWallet: () => api.get('/wallet'),
}

export const exchangeApi = {
  getRates: () => api.get('/rates'),
  calculate: (data: any) => api.post('/exchange/calculate', data),
}

export const ordersApi = {
  getOrders: () => api.get('/orders'),
  createOrder: (data: any) => api.post('/orders', data),
}

export const notificationsApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`, {}),
}

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id: string, data: any) => api.put(`/admin/orders/${id}/status`, data),
  getStats: () => api.get('/admin/stats'),
}

export const publicApi = {
  getStats: () => api.get('/public/stats'),
  getRecentOrders: () => api.get('/public/recent-orders'),
}
