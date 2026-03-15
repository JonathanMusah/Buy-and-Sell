// Mock API for immediate deployment - simulates backend functionality

// Storage keys
const STORAGE_KEYS = {
  USERS: 'gcx_users_v3',
  CURRENT_USER: 'gcx_current_user_v3',
  ORDERS: 'gcx_orders_v3',
  WALLETS: 'gcx_wallets_v3',
  TRANSACTIONS: 'gcx_transactions_v3',
}

// Generate UUID
const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

// Initial rates
const INITIAL_RATES = {
  BTC: { buy: 892450, sell: 885000, rateUSD: 89349 },
  ETH: { buy: 45230, sell: 44800, rateUSD: 3030 },
  USDT: { buy: 15.85, sell: 15.75, rateUSD: 1 },
  BNB: { buy: 8450, sell: 8350, rateUSD: 596 },
  SOL: { buy: 2340, sell: 2310, rateUSD: 165 },
  XRP: { buy: 12.45, sell: 12.30, rateUSD: 0.88 },
  ADA: { buy: 8.90, sell: 8.80, rateUSD: 0.63 },
  DOT: { buy: 145, sell: 143, rateUSD: 10.25 },
  DOGE: { buy: 2.35, sell: 2.32, rateUSD: 0.166 },
  LTC: { buy: 1250, sell: 1235, rateUSD: 88.5 },
  GHS: { buy: 1, sell: 1, rateUSD: 0.063 },
  USD: { buy: 15.85, sell: 15.75, rateUSD: 1 },
}

// Helper to get from storage
const getStorage = (key: string, defaultValue: any = null) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : defaultValue
}

// Helper to set to storage
const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API Service
class MockApiService {
  // Auth
  async login(email: string, password: string) {
    await delay(800)
    
    // Admin login
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
      const token = 'admin_token_' + generateId()
      setStorage(STORAGE_KEYS.CURRENT_USER, { user: adminUser, token })
      return { data: { token, user: adminUser } }
    }
    
    // Regular user login
    const users = getStorage(STORAGE_KEYS.USERS, [])
    const user = users.find((u: any) => u.email === email)
    
    if (!user || user.password !== password) {
      throw { response: { data: { error: 'Invalid credentials' } } }
    }
    
    const token = 'token_' + generateId()
    const { password: _, ...userWithoutPassword } = user
    setStorage(STORAGE_KEYS.CURRENT_USER, { user: userWithoutPassword, token })
    
    return { data: { token, user: userWithoutPassword } }
  }
  
  async register(data: any) {
    await delay(1000)
    
    const users = getStorage(STORAGE_KEYS.USERS, [])
    
    if (users.find((u: any) => u.email === data.email)) {
      throw { response: { data: { error: 'Email already registered' } } }
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
    
    // Dispatch event to notify admin dashboard
    window.dispatchEvent(new Event('usersUpdated'))
    
    // Create wallet for new user
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
    
    const token = 'token_' + generateId()
    const { password: _, ...userWithoutPassword } = newUser
    setStorage(STORAGE_KEYS.CURRENT_USER, { user: userWithoutPassword, token })
    
    return { data: { token, user: userWithoutPassword } }
  }
  
  async me() {
    await delay(300)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
    if (!current) {
      throw { response: { status: 401 } }
    }
    return { data: current.user }
  }
  
  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
  
  // User
  async getProfile() {
    await delay(300)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
    return { data: current?.user }
  }
  
  async updateProfile(data: any) {
    await delay(500)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
    const users = getStorage(STORAGE_KEYS.USERS, [])
    const index = users.findIndex((u: any) => u.id === current.user.id)
    
    if (index !== -1) {
      users[index] = { ...users[index], ...data }
      setStorage(STORAGE_KEYS.USERS, users)
      
      const { password: _, ...updatedUser } = users[index]
      setStorage(STORAGE_KEYS.CURRENT_USER, { ...current, user: updatedUser })
      return { data: { user: updatedUser } }
    }
  }
  
  // Wallet
  async getWallet() {
    await delay(400)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
    const wallets = getStorage(STORAGE_KEYS.WALLETS, [])
    const wallet = wallets.find((w: any) => w.userId === current.user.id)
    return { data: wallet || { balances: {} } }
  }
  
  // Exchange
  async getRates() {
    await delay(200)
    return { data: INITIAL_RATES }
  }
  
  async calculate(data: any) {
    await delay(300)
    const { fromCurrency, toCurrency, amount } = data
    const rates = INITIAL_RATES as any
    
    const fromRate = rates[fromCurrency]
    const toRate = rates[toCurrency]
    
    const rate = fromRate.sell / toRate.buy
    const result = amount * rate
    const fee = result * 0.005
    const finalAmount = result - fee
    
    return {
      data: {
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
        rate,
        fee,
        finalAmount,
        feePercentage: 0.5,
      },
    }
  }
  
  // Orders
  async getOrders() {
    await delay(500)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
    const orders = getStorage(STORAGE_KEYS.ORDERS, [])
    return { data: orders.filter((o: any) => o.userId === current.user.id) }
  }
  
  async createOrder(data: any) {
    await delay(800)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
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
    
    return { data: { order: newOrder } }
  }
  
  // Transactions
  async getTransactions() {
    await delay(400)
    const current = getStorage(STORAGE_KEYS.CURRENT_USER)
    const transactions = getStorage(STORAGE_KEYS.TRANSACTIONS, [])
    return { data: transactions.filter((t: any) => t.userId === current.user.id) }
  }
  
  // Admin
  async getAdminUsers() {
    await delay(500)
    const users = getStorage(STORAGE_KEYS.USERS, [])
    return { data: users.map((u: any) => {
      const { password: _, ...userWithoutPassword } = u
      return userWithoutPassword
    })}
  }
  
  async getAdminOrders() {
    await delay(500)
    const orders = getStorage(STORAGE_KEYS.ORDERS, [])
    return { data: orders }
  }
  
  async updateOrderStatus(id: string, data: any) {
    await delay(600)
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
      return { data: { order: orders[index] } }
    }
  }
  
  async getAdminStats() {
    await delay(300)
    const users = getStorage(STORAGE_KEYS.USERS, [])
    const orders = getStorage(STORAGE_KEYS.ORDERS, [])
    
    const totalVolume = orders
      .filter((o: any) => o.status === 'completed')
      .reduce((sum: number, o: any) => sum + (o.amount * o.rate), 0)
    
    return {
      data: {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalVolume: Math.round(totalVolume),
        todayOrders: orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt)
          const today = new Date()
          return orderDate.toDateString() === today.toDateString()
        }).length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        completedOrders: orders.filter((o: any) => o.status === 'completed').length,
      },
    }
  }
  
  // Public
  async getPublicStats() {
    await delay(200)
    const users = getStorage(STORAGE_KEYS.USERS, [])
    const orders = getStorage(STORAGE_KEYS.ORDERS, [])
    
    return {
      data: {
        totalUsers: users.length + 1247,
        totalOrders: orders.length + 3421,
        totalVolume: 28475000,
      },
    }
  }
  
  async getRecentOrders() {
    await delay(300)
    const orders = getStorage(STORAGE_KEYS.ORDERS, [])
    return { data: orders.slice(-10).reverse() }
  }
}

const mockService = new MockApiService()

// API interface matching axios
export const api = {
  post: async (url: string, data?: any) => {
    const path = url.replace('/api/', '')
    
    if (path === 'auth/login') return mockService.login(data.email, data.password)
    if (path === 'auth/register') return mockService.register(data)
    if (path === 'exchange/calculate') return mockService.calculate(data)
    if (path === 'orders') return mockService.createOrder(data)
    
    throw { response: { data: { error: 'Not found' } } }
  },
  
  get: async (url: string) => {
    const path = url.replace('/api/', '')
    
    if (path === 'auth/me') return mockService.me()
    if (path === 'users/profile') return mockService.getProfile()
    if (path === 'wallet') return mockService.getWallet()
    if (path === 'rates') return mockService.getRates()
    if (path === 'orders') return mockService.getOrders()
    if (path === 'transactions') return mockService.getTransactions()
    if (path === 'admin/users') return mockService.getAdminUsers()
    if (path === 'admin/orders') return mockService.getAdminOrders()
    if (path === 'admin/stats') return mockService.getAdminStats()
    if (path === 'public/stats') return mockService.getPublicStats()
    if (path === 'public/recent-orders') return mockService.getRecentOrders()
    
    throw { response: { data: { error: 'Not found' } } }
  },
  
  put: async (url: string, data?: any) => {
    const path = url.replace('/api/', '')
    
    if (path === 'users/profile') return mockService.updateProfile(data)
    if (path.startsWith('admin/orders/') && path.endsWith('/status')) {
      const id = path.split('/')[2]
      return mockService.updateOrderStatus(id, data)
    }
    
    throw { response: { data: { error: 'Not found' } } }
  },
}

// Export individual API modules for convenience
export const authApi = {
  login: (email: string, password: string) => mockService.login(email, password),
  register: (data: any) => mockService.register(data),
  me: () => mockService.me(),
}

export const userApi = {
  getProfile: () => mockService.getProfile(),
  updateProfile: (data: any) => mockService.updateProfile(data),
}

export const walletApi = {
  getWallet: () => mockService.getWallet(),
}

export const exchangeApi = {
  getRates: () => mockService.getRates(),
  calculate: (data: any) => mockService.calculate(data),
}

export const ordersApi = {
  getOrders: () => mockService.getOrders(),
  createOrder: (data: any) => mockService.createOrder(data),
}

export const transactionsApi = {
  getTransactions: () => mockService.getTransactions(),
}

export const adminApi = {
  getUsers: () => mockService.getAdminUsers(),
  getOrders: () => mockService.getAdminOrders(),
  updateOrderStatus: (id: string, data: any) => mockService.updateOrderStatus(id, data),
  getStats: () => mockService.getAdminStats(),
}

export const publicApi = {
  getStats: () => mockService.getPublicStats(),
  getRecentOrders: () => mockService.getRecentOrders(),
}

// Helper function to populate database with sample data
export const populateSampleData = () => {
  const existingUsers = getStorage(STORAGE_KEYS.USERS, [])
  const existingOrders = getStorage(STORAGE_KEYS.ORDERS, [])
  
  // Only populate if database is relatively empty
  if (existingUsers.length > 5) {
    console.log('Database already has data. Skipping population.')
    return
  }
  
  console.log('Populating database with sample data...')
  
  // Sample users
  const sampleUsers = [
    {
      id: generateId(),
      email: 'kwame.mensah@gmail.com',
      password: 'password123',
      firstName: 'Kwame',
      lastName: 'Mensah',
      phone: '+233244123456',
      role: 'user',
      isVerified: true,
      kycStatus: 'verified',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      email: 'akosua.boateng@yahoo.com',
      password: 'password123',
      firstName: 'Akosua',
      lastName: 'Boateng',
      phone: '+233205987654',
      role: 'user',
      isVerified: true,
      kycStatus: 'verified',
      createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      email: 'kofi.asante@gmail.com',
      password: 'password123',
      firstName: 'Kofi',
      lastName: 'Asante',
      phone: '+233551234567',
      role: 'user',
      isVerified: false,
      kycStatus: 'pending',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      email: 'ama.osei@hotmail.com',
      password: 'password123',
      firstName: 'Ama',
      lastName: 'Osei',
      phone: '+233276543210',
      role: 'user',
      isVerified: true,
      kycStatus: 'verified',
      createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      email: 'yaw.opoku@outlook.com',
      password: 'password123',
      firstName: 'Yaw',
      lastName: 'Opoku',
      phone: '+233509876543',
      role: 'user',
      isVerified: true,
      kycStatus: 'rejected',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateId(),
      email: 'abena.darko@gmail.com',
      password: 'password123',
      firstName: 'Abena',
      lastName: 'Darko',
      phone: '+233201122334',
      role: 'user',
      isVerified: true,
      kycStatus: 'verified',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
  
  // Merge with existing users
  const allUsers = [...existingUsers, ...sampleUsers]
  setStorage(STORAGE_KEYS.USERS, allUsers)
  
  // Create wallets for new users
  const existingWallets = getStorage(STORAGE_KEYS.WALLETS, [])
  sampleUsers.forEach(user => {
    if (!existingWallets.find((w: any) => w.userId === user.id)) {
      existingWallets.push({
        id: generateId(),
        userId: user.id,
        balances: {
          BTC: Math.random() * 0.1,
          ETH: Math.random() * 2,
          USDT: Math.random() * 500,
          BNB: Math.random() * 5,
          SOL: Math.random() * 20,
          XRP: Math.random() * 200,
          ADA: Math.random() * 400,
          GHS: Math.random() * 10000 + 1000,
          USD: 0,
        },
        createdAt: user.createdAt,
      })
    }
  })
  setStorage(STORAGE_KEYS.WALLETS, existingWallets)
  
  // Sample orders
  const cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP']
  // const statuses: Array<'pending' | 'processing' | 'completed' | 'cancelled'> = ['pending', 'processing', 'completed', 'cancelled']
  const paymentMethods = ['Mobile Money (MTN)', 'Mobile Money (Telecel)', 'Bank Transfer', 'Cash Pickup']
  
  const sampleOrders = []
  for (let i = 0; i < 25; i++) {
    const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)]
    const isBuy = Math.random() > 0.5
    const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
    const amount = Math.random() * 5000 + 100
    const rate = INITIAL_RATES[crypto as keyof typeof INITIAL_RATES].buy
    
    // Most orders should be completed, some pending/processing, few cancelled
    let status: 'pending' | 'processing' | 'completed' | 'cancelled'
    const rand = Math.random()
    if (rand < 0.7) status = 'completed'
    else if (rand < 0.85) status = 'processing'
    else if (rand < 0.95) status = 'pending'
    else status = 'cancelled'
    
    const daysAgo = Math.floor(Math.random() * 30)
    
    sampleOrders.push({
      id: generateId(),
      userId: user.id,
      type: isBuy ? 'buy' : 'sell',
      fromCurrency: isBuy ? 'GHS' : crypto,
      toCurrency: isBuy ? crypto : 'GHS',
      amount: parseFloat(amount.toFixed(2)),
      rate: rate,
      finalAmount: parseFloat((amount / rate).toFixed(8)),
      fee: parseFloat((amount * 0.005).toFixed(2)),
      status: status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      walletAddress: crypto + '_' + generateId().substring(0, 16),
      createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
  
  const allOrders = [...existingOrders, ...sampleOrders]
  setStorage(STORAGE_KEYS.ORDERS, allOrders)
  
  // Dispatch events to update UI
  window.dispatchEvent(new Event('usersUpdated'))
  window.dispatchEvent(new Event('ordersUpdated'))
  window.dispatchEvent(new Event('storage'))
  
  console.log(`✅ Database populated: ${sampleUsers.length} users, ${sampleOrders.length} orders`)
  return {
    usersAdded: sampleUsers.length,
    ordersAdded: sampleOrders.length,
  }
}

// Initialize default cryptocurrencies and payment methods if none exist
export const initializeAppData = () => {
  // Initialize default cryptocurrencies
  const existingCryptos = getStorage('cryptos', [])
  if (existingCryptos.length === 0) {
    const defaultCryptos = [
      {
        id: generateId(),
        symbol: 'BTC',
        name: 'Bitcoin',
        icon: '₿',
        enabled: true,
        rate: 892450,
        buyRate: 892450,
        sellRate: 885000,
        networkFee: 0.0005,
        minAmount: 0.001,
        maxAmount: 10,
        addresses: [
          { network: 'Bitcoin', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        id: generateId(),
        symbol: 'ETH',
        name: 'Ethereum',
        icon: 'Ξ',
        enabled: true,
        rate: 45230,
        buyRate: 45230,
        sellRate: 44800,
        networkFee: 0.002,
        minAmount: 0.01,
        maxAmount: 50,
        addresses: [
          { network: 'Ethereum', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        id: generateId(),
        symbol: 'USDT',
        name: 'Tether USD',
        icon: '₮',
        enabled: true,
        rate: 15.85,
        buyRate: 15.85,
        sellRate: 15.75,
        networkFee: 1,
        minAmount: 10,
        maxAmount: 50000,
        addresses: [
          { network: 'ERC20', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
          { network: 'TRC20', address: 'TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf' }
        ],
        lastUpdated: new Date().toISOString()
      },
      {
        id: generateId(),
        symbol: 'BNB',
        name: 'Binance Coin',
        icon: 'BNB',
        enabled: true,
        rate: 8450,
        buyRate: 8450,
        sellRate: 8350,
        networkFee: 0.0005,
        minAmount: 0.1,
        maxAmount: 100,
        addresses: [
          { network: 'BEP20', address: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2' }
        ],
        lastUpdated: new Date().toISOString()
      }
    ]
    
    setStorage('cryptos', defaultCryptos)
    console.log('✅ Default cryptocurrencies initialized')
  }

  // Initialize default payment methods
  const existingPaymentMethods = getStorage('paymentMethods', [])
  if (existingPaymentMethods.length === 0) {
    const defaultPaymentMethods = [
      {
        id: generateId(),
        name: 'Mobile Money',
        type: 'momo',
        enabled: true,
        description: 'MTN, Telecel, AirtelTigo Mobile Money',
        icon: '📱',
        processingTime: '5-10 minutes'
      },
      {
        id: generateId(),
        name: 'Bank Transfer',
        type: 'bank',
        enabled: true,
        description: 'Direct bank transfer to our account',
        icon: '🏦',
        processingTime: '15-30 minutes'
      },
      {
        id: generateId(),
        name: 'Cash Pickup',
        type: 'cash',
        enabled: true,
        description: 'Pick up cash at our office locations',
        icon: '💵',
        processingTime: 'Instant upon pickup'
      }
    ]
    
    setStorage('paymentMethods', defaultPaymentMethods)
    console.log('✅ Default payment methods initialized')
    
    // Dispatch events to update UI
    window.dispatchEvent(new Event('paymentMethodsUpdated'))
  }

  // Dispatch events to update UI after crypto initialization
  if (existingCryptos.length === 0) {
    window.dispatchEvent(new Event('cryptosUpdated'))
  }
}
