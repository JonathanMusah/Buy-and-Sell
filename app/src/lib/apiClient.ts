import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token refresh mutex to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Handle token expiry - auto refresh with mutex
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { token } = response.data.data;
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          processQueue(null, token);
          return axiosInstance(originalRequest);
        }
        throw new Error('No refresh token');
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Use a custom event so React Router can handle navigation
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ============= TYPE DEFINITIONS =============

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface OrderCreateData {
  type: 'buy' | 'sell';
  crypto: string;
  amount: number;
  rate: number;
  total: number;
  paymentMethod: string;
  transactionId?: string;
  walletAddress?: string;
  momoNumber?: string;
  momoName?: string;
}

export interface UserUpdateData {
  isBlocked?: boolean;
  role?: 'user' | 'admin';
  kycStatus?: 'pending' | 'verified' | 'rejected';
  kycRejectionReason?: string;
}

export interface OrderStatusUpdateData {
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected';
  adminNote?: string;
}

export interface CryptocurrencyData {
  symbol: string;
  name: string;
  icon?: string;
  image?: string;
  rate: number;
  buyRate?: number;
  sellRate?: number;
  networkFee: number;
  minAmount: number;
  maxAmount: number;
  walletAddress?: string;
  enabled: boolean;
}

export interface PaymentMethodData {
  name: string;
  type: 'momo' | 'bank' | 'paypal' | 'stripe' | 'custom';
  accountName: string;
  accountNumber: string;
  fee: number;
  minAmount: number;
  maxAmount: number;
  enabled: boolean;
  icon?: string;
}

// ============= API METHODS =============

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    axiosInstance.post('/auth/login', { email, password }),
  register: (data: RegisterData) => 
    axiosInstance.post('/auth/register', data),
  forgotPassword: (email: string) => 
    axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => 
    axiosInstance.post('/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) => 
    axiosInstance.post('/auth/change-password', { currentPassword, newPassword }),
  refreshToken: (refreshToken: string) => 
    axiosInstance.post('/auth/refresh', { refreshToken }),
  verifyEmail: (token: string) => 
    axiosInstance.post('/auth/verify-email', { token }),
  resendVerification: (email: string) => 
    axiosInstance.post('/auth/resend-verification', { email }),
  // 2FA
  setup2FA: () => axiosInstance.post('/auth/2fa/setup'),
  verify2FA: (code: string) => axiosInstance.post('/auth/2fa/verify', { code }),
  disable2FA: (password: string) => axiosInstance.post('/auth/2fa/disable', { password }),
  get2FAStatus: () => axiosInstance.get('/auth/2fa/status'),
};

// User API
export const userApi = {
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (data: ProfileUpdateData) => axiosInstance.put('/user/profile', data),
  uploadAvatar: (formData: FormData) => axiosInstance.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  removeAvatar: () => axiosInstance.delete('/user/avatar'),
  getWallet: () => axiosInstance.get('/user/wallet'),
  getOrders: (params?: { page?: number; limit?: number }) => 
    axiosInstance.get('/user/orders', { params }),
  getNotifications: () => axiosInstance.get('/user/notifications'),
  markNotificationsRead: () => axiosInstance.put('/user/notifications/read'),
  markNotificationRead: (id: string) => axiosInstance.put(`/user/notifications/${id}/read`),
  submitKyc: (formData: FormData) => axiosInstance.post('/user/kyc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getKycStatus: () => axiosInstance.get('/user/kyc'),
  getMyReview: () => axiosInstance.get('/user/review'),
  // Sessions
  getSessions: () => axiosInstance.get('/user/sessions'),
  revokeSession: (id: string) => axiosInstance.delete(`/user/sessions/${id}`),
  revokeAllSessions: () => axiosInstance.delete('/user/sessions'),
  // Preferences
  getPreferences: () => axiosInstance.get('/user/preferences'),
  updateNotificationPrefs: (prefs: { orderUpdates: boolean; security: boolean; newsletter: boolean; promotions: boolean }) =>
    axiosInstance.put('/user/preferences/notifications', prefs),
  updateLanguage: (language: string) => axiosInstance.put('/user/preferences/language', { language }),
  updateTimezone: (timezone: string) => axiosInstance.put('/user/preferences/timezone', { timezone }),
  // Account deletion
  deleteAccount: (password: string) => axiosInstance.delete('/user/account', { data: { password } }),
};

// Orders API
export const ordersApi = {
  create: (data: OrderCreateData) => axiosInstance.post('/orders', data),
  getById: (id: string) => axiosInstance.get(`/orders/${id}`),
  uploadProof: (orderId: string, formData: FormData) => axiosInstance.post(`/orders/${orderId}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Reviews API
export const reviewsApi = {
  getApproved: () => axiosInstance.get('/reviews'),
  submit: (data: { rating: number; title?: string; text: string }) => axiosInstance.post('/reviews', data),
};

// Support Tickets API
export const ticketsApi = {
  create: (data: { subject: string; message: string; category?: string; priority?: string }) => 
    axiosInstance.post('/support/tickets', data),
  getAll: () => axiosInstance.get('/support/tickets'),
  getById: (id: string) => axiosInstance.get(`/support/tickets/${id}`),
  reply: (id: string, message: string) => axiosInstance.post(`/support/tickets/${id}/messages`, { message }),
};

// Admin API
export const adminApi = {
  getStats: () => axiosInstance.get('/admin/stats'),
  getUsers: (params?: { page?: number; limit?: number }) => 
    axiosInstance.get('/admin/users', { params }),
  updateUser: (id: string, data: UserUpdateData) => axiosInstance.put(`/admin/users/${id}`, data),
  getOrders: (params?: { page?: number; limit?: number }) => 
    axiosInstance.get('/admin/orders', { params }),
  updateOrderStatus: (id: string, data: OrderStatusUpdateData) => axiosInstance.put(`/admin/orders/${id}`, data),
  getKycSubmissions: () => axiosInstance.get('/admin/kyc'),
  getCryptocurrencies: () => axiosInstance.get('/admin/cryptocurrencies'),
  addCryptocurrency: (crypto: CryptocurrencyData) => axiosInstance.post('/admin/cryptocurrencies', crypto),
  updateCryptocurrency: (id: string, crypto: Partial<CryptocurrencyData>) => axiosInstance.put(`/admin/cryptocurrencies/${id}`, crypto),
  deleteCryptocurrency: (id: string) => axiosInstance.delete(`/admin/cryptocurrencies/${id}`),
  getPaymentMethods: () => axiosInstance.get('/admin/payment-methods'),
  addPaymentMethod: (method: PaymentMethodData) => axiosInstance.post('/admin/payment-methods', method),
  updatePaymentMethod: (id: string, method: Partial<PaymentMethodData>) => axiosInstance.put(`/admin/payment-methods/${id}`, method),
  deletePaymentMethod: (id: string) => axiosInstance.delete(`/admin/payment-methods/${id}`),
  getActivityLog: (limit?: number) => axiosInstance.get(`/admin/activity${limit ? `?limit=${limit}` : ''}`),
  getReviews: () => axiosInstance.get('/admin/reviews'),
  updateReview: (id: string, data: { isApproved: boolean }) => axiosInstance.put(`/admin/reviews/${id}`, data),
  deleteReview: (id: string) => axiosInstance.delete(`/admin/reviews/${id}`),
  getTickets: () => axiosInstance.get('/admin/tickets'),
  getTicketById: (id: string) => axiosInstance.get(`/admin/tickets/${id}`),
  updateTicket: (id: string, data: { status?: string; priority?: string }) => axiosInstance.put(`/admin/tickets/${id}`, data),
  replyTicket: (id: string, message: string) => axiosInstance.post(`/admin/tickets/${id}/messages`, { message }),
  // Broadcast (Newsletter / Promotions)
  getBroadcastStats: () => axiosInstance.get('/admin/broadcast/stats'),
  getBroadcastHistory: () => axiosInstance.get('/admin/broadcast/history'),
  sendBroadcast: (data: { type: string; subject: string; message: string }) => axiosInstance.post('/admin/broadcast/send', data),
  // Settings (SMTP & Feature Toggles)
  getSettings: () => axiosInstance.get('/admin/settings'),
  updateSmtp: (smtp: { host: string; port: string; user: string; pass: string; from: string }) => axiosInstance.put('/admin/settings/smtp', smtp),
  testSmtp: (email: string) => axiosInstance.post('/admin/settings/test-smtp', { email }),
  updateFeatures: (features: Record<string, boolean>) => axiosInstance.put('/admin/settings/features', { features }),
  // Site content CMS
  getSiteContent: () => axiosInstance.get('/admin/site-content'),
  updateSiteContent: (items: Array<{ section: string; key: string; value: any; type?: string }>) =>
    axiosInstance.put('/admin/site-content', { items }),
  deleteSiteContent: (section: string, key: string) =>
    axiosInstance.delete(`/admin/site-content/${section}/${key}`),
};

// Public API
export const publicApi = {
  getCryptocurrencies: () => axiosInstance.get('/cryptocurrencies'),
  getPaymentMethods: () => axiosInstance.get('/payment-methods'),
  getPrices: () => axiosInstance.get('/prices'),
  getStats: () => axiosInstance.get('/stats'),
  getSiteContent: () => axiosInstance.get('/site-content'),
  getPlatformConfig: () => axiosInstance.get('/platform-config'),
};

export default axiosInstance;
