# GhanaCryptoX - Full Stack Cryptocurrency Exchange

A complete cryptocurrency exchange platform built for Ghana and West Africa, featuring both light and dark modes, full authentication, trading system, order management, and admin dashboard.

## 🚀 Live Demo

**Frontend:** https://lubjituuk2q3u.ok.kimi.link

## ✨ Features

### User Features
- 🔐 **Authentication**: Register, Login, JWT-based sessions
- 🌓 **Light/Dark Mode**: Full theme support with system preference detection
- 💰 **Exchange**: Buy/Sell crypto with real-time rate calculations
- 📊 **Dashboard**: View wallet balances, order history, and stats
- 📜 **Order History**: Track all your transactions
- 👤 **Profile Management**: Update personal information
- 🔒 **KYC Verification**: Account verification system

### Admin Features
- 📈 **Admin Dashboard**: Platform statistics and overview
- 📋 **Order Management**: View and update order statuses
- 👥 **User Management**: View all registered users
- 💱 **Rate Management**: Update exchange rates

### Supported Currencies
- Cryptocurrencies: BTC, ETH, USDT, BNB, SOL, XRP, ADA, DOT, DOGE, LTC
- Fiat: GHS (Ghana Cedi), USD
- Payment Methods: MTN MoMo, Telecel Cash, AirtelTigo

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS + shadcn/ui
- React Router DOM
- Axios (HTTP Client)
- Recharts (Charts)
- date-fns (Date formatting)

### Backend
- Node.js + Express
- JSON File Database (No SQL required)
- JWT Authentication
- bcryptjs (Password hashing)
- Express Rate Limit
- Helmet (Security)

## 📁 Project Structure

```
fullstack-app/
├── backend/
│   ├── server.js          # Main Express server
│   ├── database.js        # JSON file-based database
│   ├── .env               # Environment variables
│   ├── package.json
│   └── data/              # Database files (auto-created)
│       ├── users.json
│       ├── orders.json
│       ├── transactions.json
│       ├── wallets.json
│       └── rates.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── index.css
    │   ├── context/
    │   │   ├── AuthContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── lib/
    │   │   └── api.ts
    │   ├── components/
    │   │   └── DashboardLayout.tsx
    │   └── pages/
    │       ├── LandingPage.tsx
    │       ├── LoginPage.tsx
    │       ├── RegisterPage.tsx
    │       ├── DashboardPage.tsx
    │       ├── ExchangePage.tsx
    │       ├── OrdersPage.tsx
    │       ├── ProfilePage.tsx
    │       ├── AdminDashboard.tsx
    │       ├── AdminOrders.tsx
    │       ├── AdminUsers.tsx
    │       └── NotFoundPage.tsx
    ├── package.json
    └── vite.config.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Start the server
npm start

# Or for development with auto-restart
npm run dev
```

The backend will start on `http://localhost:3001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will start on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@ghanacryptox.com
ADMIN_PASSWORD=admin123
```

## 🔑 Default Login Credentials

### Admin Account
- **Email:** `admin@ghanacryptox.com`
- **Password:** `admin123`

### Test User Account
You can register a new account at `/register`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Wallet
- `GET /api/wallet` - Get user wallet

### Exchange
- `GET /api/rates` - Get exchange rates
- `POST /api/exchange/calculate` - Calculate exchange

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/stats` - Get platform stats

### Public
- `GET /api/public/stats` - Get public stats
- `GET /api/public/recent-orders` - Get recent orders

## 🎨 Theme System

The app supports three theme modes:
- **Light**: Always use light theme
- **Dark**: Always use dark theme
- **System**: Follow system preference (default)

Theme preference is saved to localStorage and persists across sessions.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS protection
- Input validation

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Future Enhancements

- [ ] Real-time price updates via WebSocket
- [ ] Email notifications
- [ ] Two-factor authentication (2FA)
- [ ] Advanced trading charts
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Bank integration
- [ ] Advanced KYC with document upload

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Support

For support, email support@ghanacryptox.com or join our Telegram group.

---

Built with ❤️ for West Africa 🌍
