const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const WALLETS_FILE = path.join(DATA_DIR, 'wallets.json');
const RATES_FILE = path.join(DATA_DIR, 'rates.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
const initFile = (filePath, defaultData = []) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

initFile(USERS_FILE, []);
initFile(ORDERS_FILE, []);
initFile(TRANSACTIONS_FILE, []);
initFile(WALLETS_FILE, []);
initFile(RATES_FILE, {
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
});

// Read data from file
const readData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Write data to file
const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Database operations
const db = {
  // Users
  users: {
    getAll: () => readData(USERS_FILE),
    getById: (id) => readData(USERS_FILE).find(u => u.id === id),
    getByEmail: (email) => readData(USERS_FILE).find(u => u.email === email),
    create: (user) => {
      const users = readData(USERS_FILE);
      const newUser = { 
        id: uuidv4(), 
        ...user, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVerified: false,
        kycStatus: 'pending',
        role: 'user'
      };
      users.push(newUser);
      writeData(USERS_FILE, users);
      
      // Create wallet for new user
      db.wallets.create(newUser.id);
      
      return newUser;
    },
    update: (id, updates) => {
      const users = readData(USERS_FILE);
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { 
          ...users[index], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        writeData(USERS_FILE, users);
        return users[index];
      }
      return null;
    },
    delete: (id) => {
      const users = readData(USERS_FILE);
      const filtered = users.filter(u => u.id !== id);
      writeData(USERS_FILE, filtered);
    }
  },

  // Orders
  orders: {
    getAll: () => readData(ORDERS_FILE),
    getById: (id) => readData(ORDERS_FILE).find(o => o.id === id),
    getByUserId: (userId) => readData(ORDERS_FILE).filter(o => o.userId === userId),
    getPending: () => readData(ORDERS_FILE).filter(o => o.status === 'pending'),
    create: (order) => {
      const orders = readData(ORDERS_FILE);
      const newOrder = { 
        id: uuidv4(), 
        ...order, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      orders.push(newOrder);
      writeData(ORDERS_FILE, orders);
      return newOrder;
    },
    update: (id, updates) => {
      const orders = readData(ORDERS_FILE);
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index] = { 
          ...orders[index], 
          ...updates, 
          updatedAt: new Date().toISOString() 
        };
        writeData(ORDERS_FILE, orders);
        return orders[index];
      }
      return null;
    }
  },

  // Transactions
  transactions: {
    getAll: () => readData(TRANSACTIONS_FILE),
    getByUserId: (userId) => readData(TRANSACTIONS_FILE).filter(t => t.userId === userId),
    create: (transaction) => {
      const transactions = readData(TRANSACTIONS_FILE);
      const newTransaction = { 
        id: uuidv4(), 
        ...transaction, 
        createdAt: new Date().toISOString()
      };
      transactions.push(newTransaction);
      writeData(TRANSACTIONS_FILE, transactions);
      return newTransaction;
    }
  },

  // Wallets
  wallets: {
    getAll: () => readData(WALLETS_FILE),
    getByUserId: (userId) => readData(WALLETS_FILE).find(w => w.userId === userId),
    create: (userId) => {
      const wallets = readData(WALLETS_FILE);
      const newWallet = {
        id: uuidv4(),
        userId,
        balances: {
          BTC: 0,
          ETH: 0,
          USDT: 0,
          BNB: 0,
          SOL: 0,
          XRP: 0,
          ADA: 0,
          GHS: 0,
          USD: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      wallets.push(newWallet);
      writeData(WALLETS_FILE, wallets);
      return newWallet;
    },
    updateBalance: (userId, currency, amount) => {
      const wallets = readData(WALLETS_FILE);
      const index = wallets.findIndex(w => w.userId === userId);
      if (index !== -1) {
        wallets[index].balances[currency] = (wallets[index].balances[currency] || 0) + amount;
        wallets[index].updatedAt = new Date().toISOString();
        writeData(WALLETS_FILE, wallets);
        return wallets[index];
      }
      return null;
    }
  },

  // Rates
  rates: {
    getAll: () => readData(RATES_FILE),
    get: (currency) => readData(RATES_FILE)[currency],
    update: (currency, rates) => {
      const allRates = readData(RATES_FILE);
      allRates[currency] = { ...allRates[currency], ...rates };
      writeData(RATES_FILE, allRates);
      return allRates[currency];
    }
  },

  // Stats
  stats: {
    get: () => {
      const orders = readData(ORDERS_FILE);
      const users = readData(USERS_FILE);
      const transactions = readData(TRANSACTIONS_FILE);
      
      const totalVolume = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.amount * o.rate), 0);
      
      const todayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      });

      return {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalVolume: Math.round(totalVolume),
        todayOrders: todayOrders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'completed').length
      };
    }
  }
};

module.exports = db;
