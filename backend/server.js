require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const axios = require('axios');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const UAParser = require('ua-parser-js');

// ============= CONFIG =============
const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    expiry: process.env.JWT_EXPIRY || '1h',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@jdexchange.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@JD2026!',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // Additional allowed origins for LAN/mobile access
  additionalOrigins: (process.env.ADDITIONAL_ORIGINS || '').split(',').filter(Boolean),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'JDExchange <no-reply@jdexchange.com>',
  },
  coingeckoUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 100,
  },
};

// ============= APP SETUP =============
const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allow localhost + LAN IPs so phones on the same network can connect
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = [
      config.frontendUrl,
      ...config.additionalOrigins,
    ];
    // Also auto-allow any 192.168.x.x or 10.x.x.x origin on common dev ports
    const isLan = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(origin);
    if (allowed.includes(origin) || isLan) {
      return callback(null, true);
    }
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files
const uploadsPath = path.resolve(config.uploadDir);
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Public uploads (crypto images, payment method images)
app.use('/uploads/crypto', express.static(path.join(uploadsPath, 'crypto')));
app.use('/uploads/payments', express.static(path.join(uploadsPath, 'payments')));

// Protected uploads (proofs) - require valid JWT
app.use('/uploads/proofs', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    jwt.verify(token, config.jwt.secret);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}, express.static(path.join(uploadsPath, 'proofs')));

// Fallback for other upload subdirectories
app.use('/uploads', express.static(uploadsPath));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.authMax,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP + email so different accounts aren't penalized together
    const email = req.body?.email || '';
    return `${req.ip}-${email.toLowerCase()}`;
  },
});

// ============= FILE UPLOAD CONFIG =============
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = req.uploadType || 'misc';
    const dir = path.join(uploadsPath, subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${uuidv4()}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize },
});

// ============= DATABASE =============
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA foreign_keys=ON');
  initializeDatabase();
});

// Promise wrappers for SQLite
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function (err) {
    if (err) reject(err);
    else resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows || []);
  });
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT DEFAULT '',
        role TEXT DEFAULT 'user',
        isVerified INTEGER DEFAULT 0,
        emailVerified INTEGER DEFAULT 0,
        kycStatus TEXT DEFAULT 'none',
        kycDocumentUrl TEXT,
        kycSelfieUrl TEXT,
        kycSubmittedAt TEXT,
        kycReviewedAt TEXT,
        kycRejectionReason TEXT,
        isBlocked INTEGER DEFAULT 0,
        profileImage TEXT DEFAULT '',
        lastLoginAt TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add profileImage column if upgrading existing database
    db.run(`ALTER TABLE users ADD COLUMN profileImage TEXT DEFAULT ''`, () => {});

    // New columns for settings features
    db.run(`ALTER TABLE users ADD COLUMN twoFactorSecret TEXT DEFAULT ''`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN twoFactorEnabled INTEGER DEFAULT 0`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN passwordChangedAt TEXT DEFAULT ''`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN notificationPrefs TEXT DEFAULT '{}'`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC'`, () => {});

    // Add image column to cryptocurrencies for existing databases
    db.run(`ALTER TABLE cryptocurrencies ADD COLUMN image TEXT DEFAULT ''`, () => {});

    // Login sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS login_sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        ipAddress TEXT DEFAULT '',
        userAgent TEXT DEFAULT '',
        browser TEXT DEFAULT '',
        os TEXT DEFAULT '',
        device TEXT DEFAULT '',
        isActive INTEGER DEFAULT 1,
        lastActive TEXT DEFAULT CURRENT_TIMESTAMP,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Orders table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
        crypto TEXT NOT NULL,
        amount REAL NOT NULL,
        rate REAL NOT NULL,
        total REAL NOT NULL,
        paymentMethod TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'cancelled', 'rejected')),
        transactionId TEXT,
        proofUrl TEXT,
        adminNote TEXT,
        reviewedBy TEXT,
        reviewedAt TEXT,
        walletAddress TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Wallets table
    db.run(`
      CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        BTC REAL DEFAULT 0,
        ETH REAL DEFAULT 0,
        USDT REAL DEFAULT 0,
        BNB REAL DEFAULT 0,
        SOL REAL DEFAULT 0,
        XRP REAL DEFAULT 0,
        ADA REAL DEFAULT 0,
        GHS REAL DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Cryptocurrencies table
    db.run(`
      CREATE TABLE IF NOT EXISTS cryptocurrencies (
        id TEXT PRIMARY KEY,
        symbol TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        image TEXT DEFAULT '',
        enabled INTEGER DEFAULT 1,
        rate REAL NOT NULL,
        buyRate REAL NOT NULL,
        sellRate REAL NOT NULL,
        networkFee REAL DEFAULT 0,
        minAmount REAL DEFAULT 0.001,
        maxAmount REAL DEFAULT 100,
        walletAddress TEXT DEFAULT '',
        lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment methods table
    db.run(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        description TEXT,
        icon TEXT,
        processingTime TEXT,
        accountName TEXT,
        accountNumber TEXT,
        fee REAL DEFAULT 0,
        minAmount REAL DEFAULT 0,
        maxAmount REAL DEFAULT 0,
        image TEXT
      )
    `);

    // Activity log table (audit trail)
    db.run(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        userId TEXT,
        action TEXT NOT NULL,
        details TEXT,
        ipAddress TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        isRead INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Reviews table
    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
        title TEXT DEFAULT '',
        text TEXT NOT NULL,
        isApproved INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Support tickets table
    db.run(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
        priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
        category TEXT DEFAULT 'general',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Ticket messages table
    db.run(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id TEXT PRIMARY KEY,
        ticketId TEXT NOT NULL,
        userId TEXT NOT NULL,
        message TEXT NOT NULL,
        isStaff INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticketId) REFERENCES support_tickets(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    // Site content table — CMS for homepage sections
    db.run(`
      CREATE TABLE IF NOT EXISTS site_content (
        id TEXT PRIMARY KEY,
        section TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL DEFAULT '',
        type TEXT NOT NULL DEFAULT 'text',
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedBy TEXT,
        UNIQUE(section, key)
      )
    `);

    // App settings table (SMTP, feature toggles, etc.)
    db.run(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default data
    seedDefaultData();
  });
}

async function seedDefaultData() {
  try {
    // Create admin user if not exists
    const adminExists = await dbGet('SELECT id FROM users WHERE email = ?', [config.admin.email]);
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(config.admin.password, 12);
      const adminId = 'admin';
      await dbRun(`
        INSERT OR IGNORE INTO users (id, email, password, firstName, lastName, role, isVerified, emailVerified, kycStatus)
        VALUES (?, ?, ?, 'Admin', 'User', 'admin', 1, 1, 'verified')
      `, [adminId, config.admin.email, hashedPassword]);
      await dbRun(`
        INSERT OR IGNORE INTO wallets (id, userId, BTC, ETH, USDT, BNB, SOL, XRP, ADA, GHS)
        VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
      `, [uuidv4(), adminId]);
    }

    // Seed cryptocurrencies
    const cryptoCount = await dbGet('SELECT COUNT(*) as count FROM cryptocurrencies');
    if (cryptoCount.count === 0) {
      const cryptos = [
        { symbol: 'BTC', name: 'Bitcoin', icon: '₿', rate: 892450, buyRate: 892450, sellRate: 885000, networkFee: 0.0005, minAmount: 0.001, maxAmount: 10 },
        { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', rate: 45230, buyRate: 45230, sellRate: 44800, networkFee: 0.002, minAmount: 0.01, maxAmount: 50 },
        { symbol: 'USDT', name: 'Tether USD', icon: '₮', rate: 15.85, buyRate: 15.85, sellRate: 15.75, networkFee: 1, minAmount: 10, maxAmount: 50000 },
        { symbol: 'BNB', name: 'Binance Coin', icon: 'BNB', rate: 8450, buyRate: 8450, sellRate: 8350, networkFee: 0.0005, minAmount: 0.1, maxAmount: 100 },
      ];
      for (const c of cryptos) {
        await dbRun(`
          INSERT OR IGNORE INTO cryptocurrencies (id, symbol, name, icon, rate, buyRate, sellRate, networkFee, minAmount, maxAmount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [uuidv4(), c.symbol, c.name, c.icon, c.rate, c.buyRate, c.sellRate, c.networkFee, c.minAmount, c.maxAmount]);
      }
    }

    // Seed payment methods
    const methodCount = await dbGet('SELECT COUNT(*) as count FROM payment_methods');
    if (methodCount.count === 0) {
      const methods = [
        { name: 'MTN Mobile Money', type: 'momo', description: 'Pay with MTN Mobile Money', icon: '📱', processingTime: '5-10 minutes', accountName: 'JDExchange', accountNumber: '0241234567', fee: 0, minAmount: 1, maxAmount: 100000 },
        { name: 'Telecel Cash', type: 'momo', description: 'Pay with Telecel Cash', icon: '📱', processingTime: '5-10 minutes', accountName: 'JDExchange', accountNumber: '0201234567', fee: 0, minAmount: 1, maxAmount: 100000 },
        { name: 'AirtelTigo Money', type: 'momo', description: 'Pay with AirtelTigo Money', icon: '📱', processingTime: '5-10 minutes', accountName: 'JDExchange', accountNumber: '0271234567', fee: 0, minAmount: 1, maxAmount: 100000 },
        { name: 'Bank Transfer', type: 'bank', description: 'Direct bank transfer', icon: '🏦', processingTime: '15-30 minutes', accountName: 'JDExchange Ltd', accountNumber: '0011234567890', fee: 2, minAmount: 50, maxAmount: 500000 },
      ];
      for (const m of methods) {
        await dbRun(`
          INSERT INTO payment_methods (id, name, type, enabled, description, icon, processingTime, accountName, accountNumber, fee, minAmount, maxAmount)
          VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [uuidv4(), m.name, m.type, m.description, m.icon, m.processingTime, m.accountName, m.accountNumber, m.fee, m.minAmount, m.maxAmount]);
      }
    }

    console.log('Database initialized with seed data');
  } catch (err) {
    console.error('Seed data error:', err);
  }
}

// ============= MIDDLEWARE =============

// Auth middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Load user data from DB
async function loadUser(req, res, next) {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
    }
    delete user.password;
    user.isVerified = Boolean(user.isVerified);
    user.emailVerified = Boolean(user.emailVerified);
    user.isBlocked = Boolean(user.isBlocked);
    req.userData = user;
    req.user.role = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
}

// Activity logger
async function logActivity(userId, action, details, ipAddress) {
  try {
    await dbRun(
      'INSERT INTO activity_log (id, userId, action, details, ipAddress) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, action, details, ipAddress]
    );
  } catch (err) {
    console.error('Activity log error:', err);
  }
}

// Create notification
async function createNotification(userId, title, message, type = 'info') {
  try {
    await dbRun(
      'INSERT INTO notifications (id, userId, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), userId, title, message, type]
    );
  } catch (err) {
    console.error('Notification error:', err);
  }
}

// ============= APP SETTINGS HELPERS =============

async function getSetting(key, defaultValue = '') {
  try {
    const row = await dbGet('SELECT value FROM app_settings WHERE key = ?', [key]);
    return row ? row.value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

async function setSetting(key, value) {
  await dbRun(
    'INSERT INTO app_settings (key, value, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP',
    [key, String(value)]
  );
}

async function getFeatureToggle(key, defaultValue = true) {
  const val = await getSetting(`feature_${key}`, String(defaultValue));
  return val === 'true' || val === '1';
}

// ============= EMAIL SERVICE =============
let emailTransporter = null;

// Initialize from env config first
if (config.smtp.host && config.smtp.user && config.smtp.pass) {
  emailTransporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  console.log('Email service configured (from env)');
} else {
  console.log('Email service not configured (set SMTP via admin panel or env vars)');
}

// Rebuild transporter from DB settings (called on startup and when admin updates SMTP)
async function refreshSmtpTransporter() {
  try {
    const host = await getSetting('smtp_host', config.smtp.host || '');
    const port = parseInt(await getSetting('smtp_port', String(config.smtp.port || 587)));
    const user = await getSetting('smtp_user', config.smtp.user || '');
    const pass = await getSetting('smtp_pass', config.smtp.pass || '');
    const from = await getSetting('smtp_from', config.smtp.from || 'JDExchange <no-reply@jdexchange.com>');

    if (host && user && pass) {
      emailTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      // Store from address for use in sendEmail
      config.smtp.from = from;
      console.log('Email service configured (from DB settings)');
      return true;
    }
    return false;
  } catch (e) {
    console.error('Failed to refresh SMTP:', e.message);
    return false;
  }
}

// Refresh SMTP from DB on startup (after DB is ready)
setTimeout(() => refreshSmtpTransporter(), 2000);

async function sendEmail(to, subject, html) {
  if (!emailTransporter) {
    console.log(`[Email skipped] To: ${to}, Subject: ${subject}`);
    return false;
  }
  try {
    await emailTransporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

// ============= VALIDATION HELPERS =============
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
}

// ============= MAINTENANCE MODE =============

// Public endpoint: check if maintenance mode is on
app.get('/api/maintenance-status', async (req, res) => {
  const enabled = await getFeatureToggle('maintenance_mode', false);
  res.json({ data: { maintenance: enabled } });
});

// Public endpoint: get active feature flags (so frontend can show verification requirements)
app.get('/api/platform-config', async (req, res) => {
  try {
    const [emailVerification, kycRequired, twoFactorAuth, registrationEnabled, maintenanceMode] = await Promise.all([
      getFeatureToggle('email_verification', true),
      getFeatureToggle('kyc_required', true),
      getFeatureToggle('two_factor_auth', true),
      getFeatureToggle('registration_enabled', true),
      getFeatureToggle('maintenance_mode', false),
    ]);
    res.json({
      data: {
        emailVerification,
        kycRequired,
        twoFactorAuth,
        registrationEnabled,
        maintenance: maintenanceMode,
      },
    });
  } catch {
    res.json({ data: { emailVerification: true, kycRequired: true, twoFactorAuth: true, registrationEnabled: true, maintenance: false } });
  }
});

// Maintenance mode middleware — blocks non-admin users when enabled
app.use(async (req, res, next) => {
  // Always allow these paths through regardless of maintenance mode
  const bypassPaths = [
    '/api/maintenance-status',
    '/api/auth/login',
    '/api/auth/refresh',
    '/uploads/',
  ];
  if (bypassPaths.some(p => req.path.startsWith(p))) return next();

  // Always allow admin API routes through (they require admin auth anyway)
  if (req.path.startsWith('/api/admin/')) return next();

  // Check maintenance mode
  const maintenance = await getFeatureToggle('maintenance_mode', false);
  if (!maintenance) return next();

  // Maintenance is ON — check if this is an authenticated admin
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.secret);
      if (decoded.role === 'admin') return next();
    } catch {
      // Token invalid — fall through to maintenance response
    }
  }

  return res.status(503).json({
    error: 'Platform is currently under maintenance. Please try again later.',
    code: 'MAINTENANCE_MODE',
  });
});

// ============= AUTH ROUTES =============

// Register
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    // Check if registration is enabled
    const registrationEnabled = await getFeatureToggle('registration_enabled', true);
    if (!registrationEnabled) {
      return res.status(403).json({ error: 'Registration is currently disabled. Please try again later.' });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const existing = await dbGet('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await dbRun(`
      INSERT INTO users (id, email, password, firstName, lastName, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, email.toLowerCase().trim(), hashedPassword, sanitizeString(firstName), sanitizeString(lastName), sanitizeString(phone || '')]);

    // Create empty wallet (no demo funds for production)
    await dbRun(`
      INSERT INTO wallets (id, userId, BTC, ETH, USDT, BNB, SOL, XRP, ADA, GHS)
      VALUES (?, ?, 0, 0, 0, 0, 0, 0, 0, 0)
    `, [uuidv4(), userId]);

    const token = jwt.sign(
      { userId, email: email.toLowerCase().trim(), role: 'user' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );
    const refreshToken = jwt.sign(
      { userId, email: email.toLowerCase().trim(), type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    await logActivity(userId, 'REGISTER', 'New account created', req.ip);

    // Check if email verification is enabled
    const emailVerificationEnabled = await getFeatureToggle('email_verification', true);

    if (emailVerificationEnabled) {
      await createNotification(userId, 'Welcome to JDExchange!', 'Your account has been created. Please verify your email, then complete KYC to start trading.', 'success');

      // Generate email verification token (24h expiry)
      const emailVerifyToken = jwt.sign(
        { userId, email: email.toLowerCase().trim(), type: 'email-verify' },
        config.jwt.secret,
        { expiresIn: '24h' }
      );
      const verifyUrl = `${config.frontendUrl}/verify-email?token=${emailVerifyToken}`;

      sendEmail(email, 'Verify Your JDExchange Email', `
        <h2>Welcome to JDExchange!</h2>
        <p>Hi ${sanitizeString(firstName)},</p>
        <p>Thanks for creating an account. Please verify your email address by clicking the button below:</p>
        <p style="margin: 24px 0;"><a href="${verifyUrl}" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify My Email</a></p>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
        <p>— The JDExchange Team</p>
      `).catch(err => console.error('Verification email failed:', err.message));
    } else {
      // Auto-verify if email verification is disabled
      await dbRun('UPDATE users SET emailVerified = 1 WHERE id = ?', [userId]);
      await createNotification(userId, 'Welcome to JDExchange!', 'Your account has been created. Complete KYC to start trading.', 'success');
    }

    res.status(201).json({
      data: {
        token,
        refreshToken,
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          firstName: sanitizeString(firstName),
          lastName: sanitizeString(lastName),
          phone: sanitizeString(phone || ''),
          role: 'user',
          isVerified: false,
          emailVerified: !emailVerificationEnabled,
          kycStatus: 'none',
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If maintenance mode is on, only allow admins to log in
    const maintenanceOn = await getFeatureToggle('maintenance_mode', false);
    if (maintenanceOn && user.role !== 'admin') {
      return res.status(503).json({
        error: 'Platform is currently under maintenance. Please try again later.',
        code: 'MAINTENANCE_MODE',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended. Contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if 2FA is enabled (and feature is enabled globally)
    const twoFactorFeatureEnabled = await getFeatureToggle('two_factor_auth', true);
    if (twoFactorFeatureEnabled && user.twoFactorEnabled) {
      if (!twoFactorCode) {
        // First step: password correct but 2FA required
        return res.json({
          data: {
            requires2FA: true,
            message: 'Two-factor authentication code required',
          },
        });
      }

      // Verify TOTP code
      const isValid2FA = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 2,
      });

      if (!isValid2FA) {
        return res.status(401).json({ error: 'Invalid two-factor authentication code' });
      }
    }

    // Create session record
    const sessionId = uuidv4();
    const parser = new UAParser(req.headers['user-agent'] || '');
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();
    const deviceInfo = parser.getDevice();
    const browserStr = `${browserInfo.name || 'Unknown'} ${browserInfo.version || ''}`.trim();
    const osStr = `${osInfo.name || 'Unknown'} ${osInfo.version || ''}`.trim();
    const deviceStr = deviceInfo.type ? `${deviceInfo.vendor || ''} ${deviceInfo.model || ''}`.trim() : 'Desktop';

    await dbRun(
      'INSERT INTO login_sessions (id, userId, ipAddress, userAgent, browser, os, device) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [sessionId, user.id, req.ip || '', req.headers['user-agent'] || '', browserStr, osStr, deviceStr]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, sessionId },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh', sessionId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    await dbRun('UPDATE users SET lastLoginAt = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
    await logActivity(user.id, 'LOGIN', `User logged in from ${browserStr} on ${osStr}`, req.ip);

    delete user.password;
    delete user.twoFactorSecret;
    user.isVerified = Boolean(user.isVerified);
    user.emailVerified = Boolean(user.emailVerified);
    user.isBlocked = Boolean(user.isBlocked);
    user.twoFactorEnabled = Boolean(user.twoFactorEnabled);

    res.json({
      data: {
        token,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Refresh Token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await dbGet('SELECT id, email, role, isBlocked FROM users WHERE id = ?', [decoded.userId]);
    if (!user || user.isBlocked) {
      return res.status(401).json({ error: 'Account not found or suspended' });
    }

    const newToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiry }
    );

    res.json({ data: { token: newToken } });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// Verify Email
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'email-verify') {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    const user = await dbGet('SELECT id, emailVerified FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (user.emailVerified) {
      return res.json({ data: { message: 'Email is already verified.', alreadyVerified: true } });
    }

    await dbRun('UPDATE users SET emailVerified = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [decoded.userId]);
    await logActivity(decoded.userId, 'EMAIL_VERIFIED', 'Email address verified', req.ip);
    await createNotification(decoded.userId, 'Email Verified', 'Your email address has been verified successfully.', 'success');

    res.json({ data: { message: 'Email verified successfully!' } });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }
    res.status(400).json({ error: 'Invalid or expired verification token' });
  }
});

// Resend Verification Email
app.post('/api/auth/resend-verification', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await dbGet('SELECT id, firstName, emailVerified FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (user && !user.emailVerified) {
      const emailVerifyToken = jwt.sign(
        { userId: user.id, email: email.toLowerCase().trim(), type: 'email-verify' },
        config.jwt.secret,
        { expiresIn: '24h' }
      );
      const verifyUrl = `${config.frontendUrl}/verify-email?token=${emailVerifyToken}`;

      await sendEmail(email, 'Verify Your JDExchange Email', `
        <h2>Email Verification</h2>
        <p>Hi ${user.firstName},</p>
        <p>Click the button below to verify your email address:</p>
        <p style="margin: 24px 0;"><a href="${verifyUrl}" style="background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Verify My Email</a></p>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
        <p>— The JDExchange Team</p>
      `);
    }

    // Always respond success (don't leak email existence)
    res.json({ data: { message: 'If an account with that email exists and is not yet verified, a verification link has been sent.' } });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await dbGet('SELECT id, firstName FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (user) {
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password-reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

      await sendEmail(email, 'Reset Your JDExchange Password', `
        <h2>Password Reset</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Reset Password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <p>— The JDExchange Team</p>
      `);

      await logActivity(user.id, 'PASSWORD_RESET_REQUEST', 'Password reset requested', req.ip);
    }

    // Always respond success (don't leak whether email exists)
    res.json({ data: { message: 'If an account with that email exists, a reset link has been sent.' } });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await dbRun('UPDATE users SET password = ?, passwordChangedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, decoded.userId]);

    await logActivity(decoded.userId, 'PASSWORD_RESET', 'Password was reset', req.ip);
    await createNotification(decoded.userId, 'Password Changed', 'Your password was successfully reset.', 'info');

    res.json({ data: { message: 'Password reset successfully. You can now log in.' } });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    }
    res.status(400).json({ error: 'Invalid or expired reset token' });
  }
});

// Change Password (authenticated)
app.post('/api/auth/change-password', authenticate, loadUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await dbGet('SELECT password FROM users WHERE id = ?', [req.user.userId]);
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await dbRun('UPDATE users SET password = ?, passwordChangedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, req.user.userId]);

    await logActivity(req.user.userId, 'PASSWORD_CHANGE', 'Password changed', req.ip);
    await createNotification(req.user.userId, 'Password Changed', 'Your password was changed successfully. If you did not do this, contact support immediately.', 'warning');

    res.json({ data: { message: 'Password changed successfully' } });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ============= USER ROUTES =============

// Get profile
app.get('/api/user/profile', authenticate, loadUser, async (req, res) => {
  const userData = { ...req.userData };
  delete userData.twoFactorSecret;
  userData.twoFactorEnabled = Boolean(userData.twoFactorEnabled);
  res.json({ data: { user: userData } });
});

// Update profile
app.put('/api/user/profile', authenticate, loadUser, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updates = {};
    if (firstName) updates.firstName = sanitizeString(firstName);
    if (lastName) updates.lastName = sanitizeString(lastName);
    if (phone !== undefined) updates.phone = sanitizeString(phone);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), req.user.userId];

    await dbRun(`UPDATE users SET ${setClauses}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`, values);

    const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    delete updatedUser.password;
    updatedUser.isVerified = Boolean(updatedUser.isVerified);
    updatedUser.emailVerified = Boolean(updatedUser.emailVerified);
    updatedUser.isBlocked = Boolean(updatedUser.isBlocked);

    await logActivity(req.user.userId, 'PROFILE_UPDATE', 'Profile updated', req.ip);

    res.json({ data: { user: updatedUser } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload/change profile picture
app.post('/api/user/avatar', authenticate, (req, res, next) => {
  req.uploadType = 'avatars';
  next();
}, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    const imageUrl = `/uploads/avatars/${req.file.filename}`;
    await dbRun('UPDATE users SET profileImage = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [imageUrl, req.user.userId]);
    await logActivity(req.user.userId, 'AVATAR_UPDATE', 'Profile picture updated', req.ip);
    res.json({ data: { profileImage: imageUrl } });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Remove profile picture
app.delete('/api/user/avatar', authenticate, async (req, res) => {
  try {
    await dbRun('UPDATE users SET profileImage = \'\', updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.user.userId]);
    res.json({ data: { message: 'Profile picture removed' } });
  } catch (error) {
    console.error('Avatar remove error:', error);
    res.status(500).json({ error: 'Failed to remove profile picture' });
  }
});

// ============= TWO-FACTOR AUTH ROUTES =============

// Setup 2FA — generate secret and QR code
app.post('/api/auth/2fa/setup', authenticate, loadUser, async (req, res) => {
  try {
    if (req.userData.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is already enabled on your account' });
    }

    const secret = speakeasy.generateSecret({
      name: `JDExchange (${req.userData.email})`,
      issuer: 'JDExchange',
      length: 20,
    });

    // Store the secret temporarily (not enabled yet until verified)
    await dbRun('UPDATE users SET twoFactorSecret = ? WHERE id = ?', [secret.base32, req.user.userId]);

    // Generate QR code as data URL
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
      },
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
});

// Verify and enable 2FA
app.post('/api/auth/2fa/verify', authenticate, loadUser, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Verification code is required' });
    }

    const user = await dbGet('SELECT twoFactorSecret FROM users WHERE id = ?', [req.user.userId]);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: 'Please setup 2FA first' });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
    }

    await dbRun('UPDATE users SET twoFactorEnabled = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.user.userId]);
    await logActivity(req.user.userId, '2FA_ENABLED', 'Two-factor authentication enabled', req.ip);
    await createNotification(req.user.userId, '2FA Enabled', 'Two-factor authentication has been enabled on your account.', 'success');

    res.json({ data: { message: '2FA enabled successfully' } });
  } catch (error) {
    console.error('2FA verify error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA code' });
  }
});

// Disable 2FA
app.post('/api/auth/2fa/disable', authenticate, loadUser, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to disable 2FA' });
    }

    const user = await dbGet('SELECT password, twoFactorEnabled FROM users WHERE id = ?', [req.user.userId]);
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    await dbRun('UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = \'\', updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.user.userId]);
    await logActivity(req.user.userId, '2FA_DISABLED', 'Two-factor authentication disabled', req.ip);
    await createNotification(req.user.userId, '2FA Disabled', 'Two-factor authentication has been removed from your account.', 'warning');

    res.json({ data: { message: '2FA disabled successfully' } });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

// Get 2FA status
app.get('/api/auth/2fa/status', authenticate, async (req, res) => {
  try {
    const user = await dbGet('SELECT twoFactorEnabled FROM users WHERE id = ?', [req.user.userId]);
    res.json({ data: { enabled: Boolean(user?.twoFactorEnabled) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get 2FA status' });
  }
});

// ============= LOGIN SESSIONS ROUTES =============

// Get active sessions
app.get('/api/user/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await dbAll(
      'SELECT id, ipAddress, browser, os, device, isActive, lastActive, createdAt FROM login_sessions WHERE userId = ? AND isActive = 1 ORDER BY lastActive DESC',
      [req.user.userId]
    );

    // Mark current session
    const currentSessionId = req.user.sessionId;
    const data = sessions.map(s => ({
      ...s,
      isActive: Boolean(s.isActive),
      isCurrent: s.id === currentSessionId,
    }));

    res.json({ data });
  } catch (error) {
    console.error('Sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Revoke a specific session
app.delete('/api/user/sessions/:id', authenticate, async (req, res) => {
  try {
    // Don't allow revoking current session through this endpoint
    if (req.params.id === req.user.sessionId) {
      return res.status(400).json({ error: 'Cannot revoke your current session. Use logout instead.' });
    }

    await dbRun('UPDATE login_sessions SET isActive = 0 WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    await logActivity(req.user.userId, 'SESSION_REVOKED', `Session ${req.params.id} revoked`, req.ip);

    res.json({ data: { message: 'Session revoked successfully' } });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

// Revoke all other sessions
app.delete('/api/user/sessions', authenticate, async (req, res) => {
  try {
    const currentSessionId = req.user.sessionId;
    await dbRun(
      'UPDATE login_sessions SET isActive = 0 WHERE userId = ? AND id != ? AND isActive = 1',
      [req.user.userId, currentSessionId || '']
    );
    await logActivity(req.user.userId, 'ALL_SESSIONS_REVOKED', 'All other sessions revoked', req.ip);

    res.json({ data: { message: 'All other sessions revoked' } });
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({ error: 'Failed to revoke sessions' });
  }
});

// ============= USER PREFERENCES ROUTES =============

// Get preferences
app.get('/api/user/preferences', authenticate, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT notificationPrefs, language, timezone, passwordChangedAt FROM users WHERE id = ?',
      [req.user.userId]
    );

    let notificationPrefs = { orderUpdates: true, security: true, newsletter: false, promotions: false };
    try {
      if (user.notificationPrefs && user.notificationPrefs !== '{}') {
        notificationPrefs = JSON.parse(user.notificationPrefs);
      }
    } catch (e) { /* use defaults */ }

    res.json({
      data: {
        notificationPrefs,
        language: user.language || 'en',
        timezone: user.timezone || 'UTC',
        passwordChangedAt: user.passwordChangedAt || null,
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences
app.put('/api/user/preferences/notifications', authenticate, async (req, res) => {
  try {
    const { orderUpdates, security, newsletter, promotions } = req.body;
    const prefs = JSON.stringify({
      orderUpdates: Boolean(orderUpdates),
      security: Boolean(security),
      newsletter: Boolean(newsletter),
      promotions: Boolean(promotions),
    });

    await dbRun('UPDATE users SET notificationPrefs = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [prefs, req.user.userId]);
    res.json({ data: { message: 'Notification preferences updated' } });
  } catch (error) {
    console.error('Update notifications error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Update language
app.put('/api/user/preferences/language', authenticate, async (req, res) => {
  try {
    const { language } = req.body;
    const allowedLanguages = ['en', 'fr', 'es', 'de', 'pt', 'zh', 'ar', 'hi', 'ja', 'ko'];
    if (!language || !allowedLanguages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language selection' });
    }

    await dbRun('UPDATE users SET language = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [language, req.user.userId]);
    res.json({ data: { message: 'Language updated', language } });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// Update timezone
app.put('/api/user/preferences/timezone', authenticate, async (req, res) => {
  try {
    const { timezone } = req.body;
    if (!timezone || typeof timezone !== 'string' || timezone.length > 50) {
      return res.status(400).json({ error: 'Invalid timezone' });
    }

    await dbRun('UPDATE users SET timezone = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [timezone, req.user.userId]);
    res.json({ data: { message: 'Timezone updated', timezone } });
  } catch (error) {
    console.error('Update timezone error:', error);
    res.status(500).json({ error: 'Failed to update timezone' });
  }
});

// ============= DELETE ACCOUNT ROUTE =============

app.delete('/api/user/account', authenticate, loadUser, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete your account' });
    }

    // Admin accounts cannot be deleted
    if (req.userData.role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be deleted' });
    }

    const user = await dbGet('SELECT password FROM users WHERE id = ?', [req.user.userId]);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    const userId = req.user.userId;

    // Delete all associated data
    await dbRun('DELETE FROM notifications WHERE userId = ?', [userId]);
    await dbRun('DELETE FROM ticket_messages WHERE userId = ?', [userId]);
    await dbRun('DELETE FROM support_tickets WHERE userId = ?', [userId]);
    await dbRun('DELETE FROM reviews WHERE userId = ?', [userId]);
    await dbRun('DELETE FROM login_sessions WHERE userId = ?', [userId]);
    await dbRun('DELETE FROM wallets WHERE userId = ?', [userId]);
    await dbRun('DELETE FROM activity_log WHERE userId = ?', [userId]);
    // Keep orders for audit trail but anonymize
    await dbRun('UPDATE orders SET userId = \'deleted\' WHERE userId = ?', [userId]);
    // Finally delete user
    await dbRun('DELETE FROM users WHERE id = ?', [userId]);

    console.log(`Account deleted: ${req.userData.email}`);

    res.json({ data: { message: 'Account deleted successfully' } });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get wallet
app.get('/api/user/wallet', authenticate, async (req, res) => {
  try {
    const wallet = await dbGet('SELECT * FROM wallets WHERE userId = ?', [req.user.userId]);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const balances = {
      BTC: wallet.BTC,
      ETH: wallet.ETH,
      USDT: wallet.USDT,
      BNB: wallet.BNB,
      SOL: wallet.SOL,
      XRP: wallet.XRP,
      ADA: wallet.ADA,
      GHS: wallet.GHS,
    };

    res.json({ data: { balances } });
  } catch (error) {
    console.error('Wallet error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Get user orders
app.get('/api/user/orders', authenticate, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const [orders, countResult] = await Promise.all([
      dbAll('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [req.user.userId, limit, offset]),
      dbGet('SELECT COUNT(*) as total FROM orders WHERE userId = ?', [req.user.userId])
    ]);

    res.json({
      data: orders,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
app.get('/api/orders/:id', authenticate, async (req, res) => {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ data: order });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
app.post('/api/orders', authenticate, loadUser, async (req, res) => {
  try {
    const { type, crypto, amount, rate, total, paymentMethod, transactionId, proofUrl, walletAddress } = req.body;

    // Enforce email verification before trading (if enabled)
    const requireEmailVerification = await getFeatureToggle('email_verification', true);
    if (requireEmailVerification && !req.userData.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before trading' });
    }

    // Enforce KYC verification before trading (if enabled)
    const requireKyc = await getFeatureToggle('kyc_required', true);
    if (requireKyc && req.userData.kycStatus !== 'verified') {
      return res.status(403).json({ error: 'Please complete KYC verification before trading' });
    }

    if (!type || !crypto || !amount || !rate || !total) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }
    if (!['buy', 'sell'].includes(type)) {
      return res.status(400).json({ error: 'Order type must be buy or sell' });
    }
    if (amount <= 0 || total <= 0) {
      return res.status(400).json({ error: 'Amount and total must be positive numbers' });
    }

    // Verify crypto exists and is enabled
    const cryptoData = await dbGet('SELECT * FROM cryptocurrencies WHERE symbol = ? AND enabled = 1', [crypto]);
    if (!cryptoData) {
      return res.status(400).json({ error: 'Cryptocurrency not available for trading' });
    }

    if (amount < cryptoData.minAmount || amount > cryptoData.maxAmount) {
      return res.status(400).json({ 
        error: `Amount must be between ${cryptoData.minAmount} and ${cryptoData.maxAmount} ${crypto}` 
      });
    }

    // For sell orders, user sends crypto externally and uploads proof — no wallet balance check needed

    const orderId = uuidv4();

    await dbRun(`
      INSERT INTO orders (id, userId, type, crypto, amount, rate, total, paymentMethod, transactionId, proofUrl, walletAddress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [orderId, req.user.userId, type, crypto, amount, rate, total, paymentMethod || '', transactionId || '', proofUrl || '', walletAddress || '']);

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);

    await createNotification(
      req.user.userId,
      `${type === 'buy' ? 'Buy' : 'Sell'} Order Created`,
      `Your order to ${type} ${amount} ${crypto} for GHS ${total.toLocaleString()} has been submitted.`,
      'info'
    );

    await createNotification(
      'admin',
      'New Order Received',
      `${req.userData.firstName} ${req.userData.lastName} wants to ${type} ${amount} ${crypto} for GHS ${total.toLocaleString()}`,
      'warning'
    );

    await logActivity(req.user.userId, 'ORDER_CREATE', `${type} ${amount} ${crypto} for GHS ${total}`, req.ip);

    // Respond immediately, send email in background (don't block the response)
    res.status(201).json({ data: { order } });

    // Fire-and-forget email
    sendEmail(req.userData.email, `JDExchange: ${type === 'buy' ? 'Buy' : 'Sell'} Order Submitted`, `
      <h2>Order Confirmation</h2>
      <p>Hi ${req.userData.firstName},</p>
      <p>Your ${type} order has been submitted:</p>
      <ul>
        <li><strong>Type:</strong> ${type === 'buy' ? 'Buy' : 'Sell'}</li>
        <li><strong>Crypto:</strong> ${amount} ${crypto}</li>
        <li><strong>Total:</strong> GHS ${total.toLocaleString()}</li>
        <li><strong>Payment:</strong> ${paymentMethod || 'N/A'}</li>
        <li><strong>Status:</strong> Pending review</li>
      </ul>
      <p>We'll notify you once your order is processed.</p>
      <p>— The JDExchange Team</p>
    `).catch(err => console.error('Order confirmation email failed:', err.message));
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Upload payment proof
app.post('/api/orders/:id/proof', authenticate, (req, res, next) => {
  req.uploadType = 'proofs';
  next();
}, upload.single('proof'), async (req, res) => {
  try {
    const order = await dbGet('SELECT * FROM orders WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ error: 'Can only upload proof for pending or processing orders' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const proofUrl = `/uploads/proofs/${req.file.filename}`;
    await dbRun('UPDATE orders SET proofUrl = ?, status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [proofUrl, 'processing', req.params.id]);

    const updatedOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    await logActivity(req.user.userId, 'PROOF_UPLOAD', `Proof uploaded for order ${req.params.id}`, req.ip);

    res.json({ data: { order: updatedOrder } });
  } catch (error) {
    console.error('Proof upload error:', error);
    res.status(500).json({ error: 'Failed to upload proof' });
  }
});

// ============= KYC ROUTES =============

// Submit KYC
app.post('/api/user/kyc', authenticate, loadUser, (req, res, next) => {
  req.uploadType = 'kyc';
  next();
}, upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]), async (req, res) => {
  try {
    if (req.userData.kycStatus === 'verified') {
      return res.status(400).json({ error: 'Your KYC is already verified' });
    }
    if (req.userData.kycStatus === 'pending') {
      return res.status(400).json({ error: 'Your KYC is already under review' });
    }

    if (!req.files || !req.files.document || !req.files.selfie) {
      return res.status(400).json({ error: 'Both ID document and selfie are required' });
    }

    const documentUrl = `/uploads/kyc/${req.files.document[0].filename}`;
    const selfieUrl = `/uploads/kyc/${req.files.selfie[0].filename}`;

    await dbRun(`
      UPDATE users SET 
        kycStatus = 'pending', 
        kycDocumentUrl = ?, 
        kycSelfieUrl = ?, 
        kycSubmittedAt = CURRENT_TIMESTAMP,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [documentUrl, selfieUrl, req.user.userId]);

    await createNotification(req.user.userId, 'KYC Submitted', 'Your KYC documents have been submitted for review. This usually takes 1-24 hours.', 'info');
    await createNotification('admin', 'New KYC Submission', `${req.userData.firstName} ${req.userData.lastName} submitted KYC documents for review.`, 'warning');
    await logActivity(req.user.userId, 'KYC_SUBMIT', 'KYC documents submitted', req.ip);

    res.json({ data: { message: 'KYC documents submitted successfully.' } });
  } catch (error) {
    console.error('KYC submit error:', error);
    res.status(500).json({ error: 'Failed to submit KYC documents' });
  }
});

// Get KYC status
app.get('/api/user/kyc', authenticate, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT kycStatus, kycSubmittedAt, kycReviewedAt, kycRejectionReason FROM users WHERE id = ?',
      [req.user.userId]
    );
    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC status' });
  }
});

// ============= NOTIFICATIONS ROUTES =============

app.get('/api/user/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await dbAll(
      'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
      [req.user.userId]
    );
    const unreadCount = await dbGet(
      'SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0',
      [req.user.userId]
    );
    res.json({ data: { notifications, unreadCount: unreadCount.count } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.put('/api/user/notifications/read', authenticate, async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET isRead = 1 WHERE userId = ?', [req.user.userId]);
    res.json({ data: { message: 'All notifications marked as read' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

app.put('/api/user/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await dbRun('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    res.json({ data: { message: 'Notification marked as read' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ============= PUBLIC ROUTES =============

// Get cryptocurrencies
app.get('/api/cryptocurrencies', async (req, res) => {
  try {
    const cryptos = await dbAll('SELECT * FROM cryptocurrencies WHERE enabled = 1');
    res.json({ data: cryptos.map(c => ({
      ...c,
      enabled: Boolean(c.enabled),
      // If image is empty but icon contains a data URL (admin uploaded), use it as image
      image: c.image || (c.icon && c.icon.startsWith('data:') ? c.icon : '')
    })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cryptocurrencies' });
  }
});

// Get payment methods
app.get('/api/payment-methods', async (req, res) => {
  try {
    const methods = await dbAll('SELECT * FROM payment_methods WHERE enabled = 1');
    res.json({ data: methods.map(m => ({ ...m, enabled: Boolean(m.enabled) })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Live crypto prices from CoinGecko (cached)
let priceCache = { data: null, lastFetched: 0 };
const PRICE_CACHE_TTL = 60000; // 1 minute

app.get('/api/prices', async (req, res) => {
  try {
    const now = Date.now();
    if (priceCache.data && (now - priceCache.lastFetched) < PRICE_CACHE_TTL) {
      return res.json({ data: priceCache.data });
    }

    const response = await axios.get(`${config.coingeckoUrl}/simple/price`, {
      params: {
        ids: 'bitcoin,ethereum,tether,binancecoin,solana,ripple,cardano',
        vs_currencies: 'usd,ghs',
        include_24hr_change: true,
      },
      timeout: 10000,
    });

    priceCache = { data: response.data, lastFetched: now };
    res.json({ data: response.data });
  } catch (error) {
    if (priceCache.data) {
      return res.json({ data: priceCache.data, cached: true });
    }
    console.error('CoinGecko API error:', error.message);
    res.status(503).json({ error: 'Price service temporarily unavailable' });
  }
});

// Platform stats (public)
app.get('/api/stats', async (req, res) => {
  try {
    const users = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const orders = await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = "completed"');
    const volume = await dbGet('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = "completed"');

    res.json({
      data: {
        totalUsers: users.count,
        totalOrders: orders.count,
        totalVolume: Math.round(volume.total),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============= REVIEWS ROUTES =============

// Get approved reviews (public)
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await dbAll(`
      SELECT r.id, r.rating, r.title, r.text, r.createdAt, u.firstName, u.lastName, u.profileImage
      FROM reviews r JOIN users u ON r.userId = u.id
      WHERE r.isApproved = 1
      ORDER BY r.createdAt DESC LIMIT 50
    `);
    res.json({ data: reviews });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit a review (authenticated)
app.post('/api/reviews', authenticate, async (req, res) => {
  try {
    const { rating, title, text } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    if (!text || text.trim().length < 10) return res.status(400).json({ error: 'Review must be at least 10 characters' });

    // Check if user already has a review
    const existing = await dbGet('SELECT id FROM reviews WHERE userId = ?', [req.user.userId]);
    if (existing) {
      // Update existing review
      await dbRun('UPDATE reviews SET rating = ?, title = ?, text = ?, isApproved = 0, createdAt = CURRENT_TIMESTAMP WHERE userId = ?',
        [rating, sanitizeString(title || ''), sanitizeString(text), req.user.userId]);
      return res.json({ data: { message: 'Review updated and pending approval' } });
    }

    const id = uuidv4();
    await dbRun('INSERT INTO reviews (id, userId, rating, title, text) VALUES (?, ?, ?, ?, ?)',
      [id, req.user.userId, rating, sanitizeString(title || ''), sanitizeString(text)]);

    await createNotification(req.user.userId, 'Review Submitted', 'Your review has been submitted and is pending approval.', 'info');
    res.status(201).json({ data: { message: 'Review submitted for approval', id } });
  } catch (error) {
    console.error('Review submit error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get user's own review
app.get('/api/user/review', authenticate, async (req, res) => {
  try {
    const review = await dbGet('SELECT * FROM reviews WHERE userId = ?', [req.user.userId]);
    res.json({ data: review || null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// ============= SUPPORT TICKET ROUTES =============

// Create ticket
app.post('/api/support/tickets', authenticate, async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required' });

    const ticketId = uuidv4();
    const messageId = uuidv4();
    await dbRun('INSERT INTO support_tickets (id, userId, subject, category, priority) VALUES (?, ?, ?, ?, ?)',
      [ticketId, req.user.userId, sanitizeString(subject), category || 'general', priority || 'normal']);
    await dbRun('INSERT INTO ticket_messages (id, ticketId, userId, message) VALUES (?, ?, ?, ?)',
      [messageId, ticketId, req.user.userId, sanitizeString(message)]);

    await createNotification(req.user.userId, 'Ticket Created', `Your support ticket #${ticketId.slice(0, 8)} has been created.`, 'info');
    res.status(201).json({ data: { ticketId, message: 'Ticket created successfully' } });
  } catch (error) {
    console.error('Ticket create error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get user's tickets
app.get('/api/support/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await dbAll(`
      SELECT st.*, 
        (SELECT COUNT(*) FROM ticket_messages WHERE ticketId = st.id) as messageCount,
        (SELECT message FROM ticket_messages WHERE ticketId = st.id ORDER BY createdAt DESC LIMIT 1) as lastMessage
      FROM support_tickets st WHERE st.userId = ? ORDER BY st.updatedAt DESC
    `, [req.user.userId]);
    res.json({ data: tickets });
  } catch (error) {
    console.error('Tickets fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket with messages
app.get('/api/support/tickets/:id', authenticate, async (req, res) => {
  try {
    const ticket = await dbGet('SELECT * FROM support_tickets WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const messages = await dbAll(`
      SELECT tm.*, u.firstName, u.lastName, u.role
      FROM ticket_messages tm JOIN users u ON tm.userId = u.id
      WHERE tm.ticketId = ? ORDER BY tm.createdAt ASC
    `, [req.params.id]);

    res.json({ data: { ticket, messages } });
  } catch (error) {
    console.error('Ticket fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Reply to ticket
app.post('/api/support/tickets/:id/messages', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const ticket = await dbGet('SELECT * FROM support_tickets WHERE id = ? AND userId = ?', [req.params.id, req.user.userId]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.status === 'closed') return res.status(400).json({ error: 'Ticket is closed' });

    const msgId = uuidv4();
    await dbRun('INSERT INTO ticket_messages (id, ticketId, userId, message) VALUES (?, ?, ?, ?)',
      [msgId, req.params.id, req.user.userId, sanitizeString(message)]);
    await dbRun('UPDATE support_tickets SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id]);

    res.status(201).json({ data: { messageId: msgId } });
  } catch (error) {
    console.error('Ticket reply error:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// ============= ADMIN ROUTES =============

// Admin stats
app.get('/api/admin/stats', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const totalOrders = await dbGet('SELECT COUNT(*) as count FROM orders');
    const pendingOrders = await dbGet('SELECT COUNT(*) as count FROM orders WHERE status IN ("pending", "processing")');
    const completedOrders = await dbGet('SELECT COUNT(*) as count FROM orders WHERE status = "completed"');
    const totalVolume = await dbGet('SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status = "completed"');
    const todayOrders = await dbGet("SELECT COUNT(*) as count FROM orders WHERE DATE(createdAt) = DATE('now')");
    const pendingKyc = await dbGet('SELECT COUNT(*) as count FROM users WHERE kycStatus = "pending"');

    res.json({
      data: {
        totalUsers: totalUsers.count,
        totalOrders: totalOrders.count,
        pendingOrders: pendingOrders.count,
        completedOrders: completedOrders.count,
        totalVolume: Math.round(totalVolume.total),
        todayOrders: todayOrders.count,
        pendingKyc: pendingKyc.count,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const [users, countResult] = await Promise.all([
      dbAll(
        'SELECT id, email, firstName, lastName, phone, role, isVerified, emailVerified, kycStatus, isBlocked, lastLoginAt, createdAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [limit, offset]
      ),
      dbGet('SELECT COUNT(*) as total FROM users')
    ]);

    const result = users.map(u => ({
      ...u,
      isVerified: Boolean(u.isVerified),
      emailVerified: Boolean(u.emailVerified),
      isBlocked: Boolean(u.isBlocked),
    }));
    res.json({
      data: result,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Update user
app.put('/api/admin/users/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, role, kycStatus, kycRejectionReason } = req.body;

    const targetUser = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (isBlocked !== undefined) {
      updates.push('isBlocked = ?');
      values.push(isBlocked ? 1 : 0);
      await createNotification(id,
        isBlocked ? 'Account Suspended' : 'Account Reactivated',
        isBlocked ? 'Your account has been suspended. Contact support.' : 'Your account has been reactivated.',
        isBlocked ? 'error' : 'success'
      );
    }

    if (role && ['user', 'admin'].includes(role)) {
      updates.push('role = ?');
      values.push(role);
    }

    if (kycStatus && ['none', 'pending', 'verified', 'rejected'].includes(kycStatus)) {
      updates.push('kycStatus = ?');
      values.push(kycStatus);
      updates.push('kycReviewedAt = CURRENT_TIMESTAMP');

      if (kycStatus === 'verified') {
        updates.push('isVerified = 1');
        await createNotification(id, 'KYC Approved!', 'Your identity has been verified. You can now trade on JDExchange.', 'success');
        await sendEmail(targetUser.email, 'JDExchange: KYC Approved', `
          <h2>KYC Verified!</h2>
          <p>Hi ${targetUser.firstName},</p>
          <p>Your identity verification has been approved. You can now trade on JDExchange.</p>
          <p>— The JDExchange Team</p>
        `);
      } else if (kycStatus === 'rejected') {
        if (kycRejectionReason) {
          updates.push('kycRejectionReason = ?');
          values.push(kycRejectionReason);
        }
        await createNotification(id, 'KYC Rejected', `Your KYC was rejected: ${kycRejectionReason || 'Please resubmit with clear documents.'}`, 'error');
        await sendEmail(targetUser.email, 'JDExchange: KYC Review Update', `
          <h2>KYC Review Update</h2>
          <p>Hi ${targetUser.firstName},</p>
          <p>We couldn't verify your identity. Reason: ${kycRejectionReason || 'Documents were unclear.'}</p>
          <p>Please log in and resubmit your KYC documents.</p>
          <p>— The JDExchange Team</p>
        `);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    await dbRun(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const updatedUser = await dbGet('SELECT id, email, firstName, lastName, phone, role, isVerified, emailVerified, kycStatus, isBlocked, lastLoginAt, createdAt FROM users WHERE id = ?', [id]);
    updatedUser.isVerified = Boolean(updatedUser.isVerified);
    updatedUser.emailVerified = Boolean(updatedUser.emailVerified);
    updatedUser.isBlocked = Boolean(updatedUser.isBlocked);

    await logActivity(req.user.userId, 'ADMIN_USER_UPDATE', `Updated user ${id}: ${JSON.stringify(req.body)}`, req.ip);

    res.json({ data: updatedUser });
  } catch (error) {
    console.error('Admin user update error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Admin: Get KYC submissions
app.get('/api/admin/kyc', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const submissions = await dbAll(
      `SELECT id, email, firstName, lastName, kycStatus, kycDocumentUrl, kycSelfieUrl, kycSubmittedAt, kycReviewedAt, kycRejectionReason 
       FROM users WHERE kycStatus IN ('pending', 'verified', 'rejected') ORDER BY kycSubmittedAt DESC`
    );
    res.json({ data: submissions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch KYC submissions' });
  }
});

// Admin: Get all orders
app.get('/api/admin/orders', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const [orders, countResult] = await Promise.all([
      dbAll(`
        SELECT o.*, u.email as userEmail, u.firstName as userFirstName, u.lastName as userLastName
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]),
      dbGet('SELECT COUNT(*) as total FROM orders')
    ]);

    res.json({
      data: orders,
      pagination: { page, limit, total: countResult.total, totalPages: Math.ceil(countResult.total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Admin: Update order status
app.put('/api/admin/orders/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !['processing', 'completed', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await dbGet('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await dbRun(`
      UPDATE orders SET status = ?, adminNote = ?, reviewedBy = ?, reviewedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `, [status, adminNote || '', req.user.userId, id]);

    // If completed, update wallet balances
    if (status === 'completed') {
      const wallet = await dbGet('SELECT * FROM wallets WHERE userId = ?', [order.userId]);
      if (wallet) {
        // Whitelist valid crypto column names to prevent SQL injection
        const VALID_CRYPTO_COLUMNS = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'GHS'];
        const cryptoCol = order.crypto.toUpperCase();
        if (!VALID_CRYPTO_COLUMNS.includes(cryptoCol)) {
          return res.status(400).json({ error: `Invalid cryptocurrency: ${order.crypto}` });
        }
        if (order.type === 'buy') {
          await dbRun(`UPDATE wallets SET ${cryptoCol} = ${cryptoCol} + ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`, [order.amount, order.userId]);
        } else if (order.type === 'sell') {
          // Check balance before deducting to prevent negative balances
          if (wallet[cryptoCol] < order.amount) {
            return res.status(400).json({ error: `Insufficient ${cryptoCol} balance for this order` });
          }
          await dbRun(`UPDATE wallets SET ${cryptoCol} = ${cryptoCol} - ?, GHS = GHS + ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?`, [order.amount, order.total, order.userId]);
        }
      }
    }

    const statusMessages = {
      processing: 'Your order is being processed.',
      completed: `Your ${order.type} order for ${order.amount} ${order.crypto} has been completed!`,
      cancelled: `Your order has been cancelled.${adminNote ? ' Reason: ' + adminNote : ''}`,
      rejected: `Your order has been rejected.${adminNote ? ' Reason: ' + adminNote : ''}`,
    };

    await createNotification(
      order.userId,
      `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      statusMessages[status],
      status === 'completed' ? 'success' : status === 'rejected' || status === 'cancelled' ? 'error' : 'info'
    );

    const user = await dbGet('SELECT email, firstName FROM users WHERE id = ?', [order.userId]);
    if (user) {
      await sendEmail(user.email, `JDExchange: Order ${status.charAt(0).toUpperCase() + status.slice(1)}`, `
        <h2>Order Update</h2>
        <p>Hi ${user.firstName},</p>
        <p>${statusMessages[status]}</p>
        <ul>
          <li><strong>Order ID:</strong> ${id.slice(0, 8)}...</li>
          <li><strong>Type:</strong> ${order.type === 'buy' ? 'Buy' : 'Sell'}</li>
          <li><strong>Amount:</strong> ${order.amount} ${order.crypto}</li>
          <li><strong>Total:</strong> GHS ${order.total.toLocaleString()}</li>
        </ul>
        ${adminNote ? `<p><strong>Note:</strong> ${adminNote}</p>` : ''}
        <p>— The JDExchange Team</p>
      `);
    }

    await logActivity(req.user.userId, 'ADMIN_ORDER_UPDATE', `Order ${id} marked as ${status}`, req.ip);

    const updatedOrder = await dbGet(`
      SELECT o.*, u.email as userEmail, u.firstName as userFirstName, u.lastName as userLastName
      FROM orders o LEFT JOIN users u ON o.userId = u.id WHERE o.id = ?
    `, [id]);

    res.json({ data: updatedOrder });
  } catch (error) {
    console.error('Admin order update error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Admin: Crypto CRUD
app.get('/api/admin/cryptocurrencies', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const cryptos = await dbAll('SELECT * FROM cryptocurrencies ORDER BY symbol');
    res.json({ data: cryptos.map(c => ({
      ...c,
      enabled: Boolean(c.enabled),
      image: c.image || (c.icon && c.icon.startsWith('data:') ? c.icon : '')
    })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cryptocurrencies' });
  }
});

app.post('/api/admin/cryptocurrencies', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { symbol, name, icon, image, rate, buyRate, sellRate, networkFee, minAmount, maxAmount, enabled, walletAddress } = req.body;
    if (!symbol || !name || !rate || !buyRate || !sellRate) {
      return res.status(400).json({ error: 'Symbol, name, rate, buyRate, and sellRate are required' });
    }

    const id = uuidv4();
    await dbRun(`
      INSERT INTO cryptocurrencies (id, symbol, name, icon, image, enabled, rate, buyRate, sellRate, networkFee, minAmount, maxAmount, walletAddress)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, symbol.toUpperCase(), sanitizeString(name), icon || symbol[0], image || '', enabled !== false ? 1 : 0, rate, buyRate, sellRate, networkFee || 0, minAmount || 0.001, maxAmount || 100, walletAddress || '']);

    const crypto = await dbGet('SELECT * FROM cryptocurrencies WHERE id = ?', [id]);
    crypto.enabled = Boolean(crypto.enabled);

    await logActivity(req.user.userId, 'ADMIN_CRYPTO_ADD', `Added ${symbol}`, req.ip);
    res.status(201).json({ data: crypto });
  } catch (error) {
    console.error('Add crypto error:', error);
    res.status(500).json({ error: 'Failed to add cryptocurrency' });
  }
});

app.put('/api/admin/cryptocurrencies/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { symbol, name, icon, image, rate, buyRate, sellRate, networkFee, minAmount, maxAmount, enabled, walletAddress } = req.body;
    const { id } = req.params;

    await dbRun(`
      UPDATE cryptocurrencies 
      SET symbol = ?, name = ?, icon = ?, image = ?, enabled = ?, rate = ?, buyRate = ?, sellRate = ?, 
          networkFee = ?, minAmount = ?, maxAmount = ?, walletAddress = ?, lastUpdated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [symbol, name, icon, image || '', enabled ? 1 : 0, rate, buyRate, sellRate, networkFee, minAmount, maxAmount, walletAddress || '', id]);

    const crypto = await dbGet('SELECT * FROM cryptocurrencies WHERE id = ?', [id]);
    if (!crypto) return res.status(404).json({ error: 'Cryptocurrency not found' });
    crypto.enabled = Boolean(crypto.enabled);

    await logActivity(req.user.userId, 'ADMIN_CRYPTO_UPDATE', `Updated ${symbol}`, req.ip);
    res.json({ data: crypto });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cryptocurrency' });
  }
});

app.delete('/api/admin/cryptocurrencies/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM cryptocurrencies WHERE id = ?', [req.params.id]);
    await logActivity(req.user.userId, 'ADMIN_CRYPTO_DELETE', `Deleted crypto ${req.params.id}`, req.ip);
    res.json({ data: { success: true } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cryptocurrency' });
  }
});

// Admin: Payment Methods CRUD
app.get('/api/admin/payment-methods', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const methods = await dbAll('SELECT * FROM payment_methods ORDER BY name');
    res.json({ data: methods.map(m => ({ ...m, enabled: Boolean(m.enabled) })) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

app.post('/api/admin/payment-methods', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { name, type, description, icon, processingTime, accountName, accountNumber, fee, minAmount, maxAmount, enabled, image } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const id = uuidv4();
    await dbRun(`
      INSERT INTO payment_methods (id, name, type, enabled, description, icon, processingTime, accountName, accountNumber, fee, minAmount, maxAmount, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, type, enabled !== false ? 1 : 0, description || '', icon || '💳', processingTime || '', accountName || '', accountNumber || '', fee || 0, minAmount || 0, maxAmount || 0, image || null]);

    const method = await dbGet('SELECT * FROM payment_methods WHERE id = ?', [id]);
    method.enabled = Boolean(method.enabled);

    await logActivity(req.user.userId, 'ADMIN_PAYMENT_ADD', `Added ${name}`, req.ip);
    res.status(201).json({ data: method });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add payment method' });
  }
});

app.put('/api/admin/payment-methods/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { name, type, description, icon, processingTime, accountName, accountNumber, fee, minAmount, maxAmount, enabled, image } = req.body;
    const { id } = req.params;

    await dbRun(`
      UPDATE payment_methods
      SET name = ?, type = ?, enabled = ?, description = ?, icon = ?, processingTime = ?,
          accountName = ?, accountNumber = ?, fee = ?, minAmount = ?, maxAmount = ?, image = ?
      WHERE id = ?
    `, [name, type, enabled ? 1 : 0, description || '', icon || '💳', processingTime || '', accountName || '', accountNumber || '', fee || 0, minAmount || 0, maxAmount || 0, image || null, id]);

    const method = await dbGet('SELECT * FROM payment_methods WHERE id = ?', [id]);
    if (!method) return res.status(404).json({ error: 'Payment method not found' });
    method.enabled = Boolean(method.enabled);

    await logActivity(req.user.userId, 'ADMIN_PAYMENT_UPDATE', `Updated ${name}`, req.ip);
    res.json({ data: method });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment method' });
  }
});

app.delete('/api/admin/payment-methods/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM payment_methods WHERE id = ?', [req.params.id]);
    await logActivity(req.user.userId, 'ADMIN_PAYMENT_DELETE', `Deleted payment ${req.params.id}`, req.ip);
    res.json({ data: { success: true } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

// Admin: Activity log
app.get('/api/admin/activity', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const logs = await dbAll(`
      SELECT al.*, u.email as userEmail, u.firstName as userFirstName
      FROM activity_log al
      LEFT JOIN users u ON al.userId = u.id
      ORDER BY al.createdAt DESC LIMIT ?
    `, [limit]);
    res.json({ data: logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Admin: Get all reviews
app.get('/api/admin/reviews', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const reviews = await dbAll(`
      SELECT r.*, u.firstName, u.lastName, u.email
      FROM reviews r JOIN users u ON r.userId = u.id
      ORDER BY r.createdAt DESC
    `);
    res.json({ data: reviews });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Admin: Approve/reject review
app.put('/api/admin/reviews/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { isApproved } = req.body;
    await dbRun('UPDATE reviews SET isApproved = ? WHERE id = ?', [isApproved ? 1 : 0, req.params.id]);
    res.json({ data: { message: isApproved ? 'Review approved' : 'Review rejected' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Admin: Delete review
app.delete('/api/admin/reviews/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ data: { message: 'Review deleted' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Admin: Get all support tickets
app.get('/api/admin/tickets', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const tickets = await dbAll(`
      SELECT st.*, u.firstName, u.lastName, u.email,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticketId = st.id) as messageCount
      FROM support_tickets st JOIN users u ON st.userId = u.id
      ORDER BY st.updatedAt DESC
    `);
    res.json({ data: tickets });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Admin: Get single ticket with messages
app.get('/api/admin/tickets/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const ticket = await dbGet(
      `SELECT st.*, u.firstName, u.lastName, u.email
       FROM support_tickets st JOIN users u ON st.userId = u.id
       WHERE st.id = ?`, [req.params.id]
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const messages = await dbAll(
      `SELECT tm.*, u.firstName, u.lastName, u.role
       FROM ticket_messages tm JOIN users u ON tm.userId = u.id
       WHERE tm.ticketId = ? ORDER BY tm.createdAt ASC`,
      [req.params.id]
    );

    res.json({ data: { ticket, messages } });
  } catch (error) {
    console.error('Admin ticket detail error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});

// Admin: Update ticket status
app.put('/api/admin/tickets/:id', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { status, priority } = req.body;
    const updates = [];
    const values = [];
    if (status) { updates.push('status = ?'); values.push(status); }
    if (priority) { updates.push('priority = ?'); values.push(priority); }
    if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' });
    updates.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(req.params.id);
    await dbRun(`UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`, values);

    // Notify user
    const ticket = await dbGet('SELECT userId, subject FROM support_tickets WHERE id = ?', [req.params.id]);
    if (ticket && status) {
      await createNotification(ticket.userId, 'Ticket Updated', `Your ticket "${ticket.subject}" has been marked as ${status}.`, 'info');
    }
    res.json({ data: { message: 'Ticket updated' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// Admin: Reply to ticket
app.post('/api/admin/tickets/:id/messages', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const ticket = await dbGet('SELECT * FROM support_tickets WHERE id = ?', [req.params.id]);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const msgId = uuidv4();
    await dbRun('INSERT INTO ticket_messages (id, ticketId, userId, message, isStaff) VALUES (?, ?, ?, ?, 1)',
      [msgId, req.params.id, req.user.userId, sanitizeString(message)]);
    await dbRun('UPDATE support_tickets SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', ['in_progress', req.params.id]);

    await createNotification(ticket.userId, 'New Reply', `Staff replied to your ticket "${ticket.subject}".`, 'info');
    res.status(201).json({ data: { messageId: msgId } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// ============= ADMIN BROADCAST (Newsletter / Promotions) =============

// Get subscriber counts
app.get('/api/admin/broadcast/stats', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbAll('SELECT id, email, firstName, lastName, notificationPrefs FROM users WHERE isBlocked = 0');
    let newsletterCount = 0;
    let promotionsCount = 0;
    const totalUsers = allUsers.length;

    for (const user of allUsers) {
      try {
        const prefs = user.notificationPrefs ? JSON.parse(user.notificationPrefs) : {};
        if (prefs.newsletter) newsletterCount++;
        if (prefs.promotions) promotionsCount++;
      } catch (e) { /* skip */ }
    }

    res.json({ data: { totalUsers, newsletterSubscribers: newsletterCount, promotionsSubscribers: promotionsCount } });
  } catch (error) {
    console.error('Broadcast stats error:', error);
    res.status(500).json({ error: 'Failed to get broadcast stats' });
  }
});

// Get broadcast history
app.get('/api/admin/broadcast/history', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const history = await dbAll(
      'SELECT * FROM broadcast_history ORDER BY createdAt DESC LIMIT 50'
    );
    res.json({ data: history });
  } catch (error) {
    // Table might not exist yet
    res.json({ data: [] });
  }
});

// Send broadcast email
app.post('/api/admin/broadcast/send', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { type, subject, message } = req.body;

    if (!type || !subject || !message) {
      return res.status(400).json({ error: 'Type, subject, and message are required' });
    }
    if (!['newsletter', 'promotions', 'all'].includes(type)) {
      return res.status(400).json({ error: 'Type must be newsletter, promotions, or all' });
    }

    // Get opted-in users
    const allUsers = await dbAll('SELECT id, email, firstName, lastName, notificationPrefs FROM users WHERE isBlocked = 0');
    const recipients = [];

    for (const user of allUsers) {
      try {
        const prefs = user.notificationPrefs ? JSON.parse(user.notificationPrefs) : {};
        if (type === 'all' || prefs[type]) {
          recipients.push(user);
        }
      } catch (e) { /* skip */ }
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No subscribers found for this broadcast type' });
    }

    // Create broadcast history table if not exists
    await dbRun(`
      CREATE TABLE IF NOT EXISTS broadcast_history (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        recipientCount INTEGER DEFAULT 0,
        sentCount INTEGER DEFAULT 0,
        failedCount INTEGER DEFAULT 0,
        sentBy TEXT NOT NULL,
        status TEXT DEFAULT 'sending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const broadcastId = uuidv4();
    await dbRun(
      'INSERT INTO broadcast_history (id, type, subject, message, recipientCount, sentBy, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [broadcastId, type, subject, message, recipients.length, req.user.userId, 'sending']
    );

    // Respond immediately
    res.json({ data: { broadcastId, recipientCount: recipients.length, message: 'Broadcast started' } });

    // Send emails in background
    let sentCount = 0;
    let failedCount = 0;

    const htmlTemplate = (firstName) => `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #10b981;">
          <h1 style="margin: 0; color: #1e293b; font-size: 24px;">JDExchange</h1>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">${type === 'newsletter' ? 'Newsletter' : type === 'promotions' ? 'Special Offer' : 'Announcement'}</p>
        </div>
        <div style="padding: 30px 0;">
          <p style="color: #334155; font-size: 16px;">Hi ${firstName || 'there'},</p>
          <h2 style="color: #1e293b; font-size: 20px; margin: 20px 0 10px;">${subject}</h2>
          <div style="color: #475569; font-size: 15px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding: 20px 0; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            You received this email because you opted in to ${type === 'all' ? 'communications' : type} from JDExchange.
            <br>You can manage your preferences in your account settings.
          </p>
        </div>
      </div>
    `;

    for (const user of recipients) {
      try {
        const sent = await sendEmail(user.email, subject, htmlTemplate(user.firstName));
        if (sent) sentCount++;
        else failedCount++;
      } catch (err) {
        failedCount++;
      }
    }

    await dbRun(
      'UPDATE broadcast_history SET sentCount = ?, failedCount = ?, status = ? WHERE id = ?',
      [sentCount, failedCount, 'completed', broadcastId]
    );

    await logActivity(req.user.userId, 'BROADCAST_SENT', `${type} broadcast "${subject}" to ${sentCount}/${recipients.length} recipients`, req.ip);

  } catch (error) {
    console.error('Broadcast send error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to send broadcast' });
    }
  }
});

// ============= ADMIN SETTINGS =============

// Get all admin settings
app.get('/api/admin/settings', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const rows = await dbAll('SELECT key, value, updatedAt FROM app_settings');
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    // Return with defaults so frontend always has values
    res.json({
      data: {
        smtp: {
          host: settings.smtp_host || config.smtp.host || '',
          port: settings.smtp_port || String(config.smtp.port || 587),
          user: settings.smtp_user || config.smtp.user || '',
          pass: settings.smtp_pass ? '••••••••' : (config.smtp.pass ? '••••••••' : ''),
          from: settings.smtp_from || config.smtp.from || 'JDExchange <no-reply@jdexchange.com>',
          configured: !!(settings.smtp_host || config.smtp.host),
        },
        features: {
          email_verification: (settings.feature_email_verification || 'true') === 'true',
          two_factor_auth: (settings.feature_two_factor_auth || 'true') === 'true',
          kyc_required: (settings.feature_kyc_required || 'true') === 'true',
          registration_enabled: (settings.feature_registration_enabled || 'true') === 'true',
          maintenance_mode: (settings.feature_maintenance_mode || 'false') === 'true',
        },
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Update SMTP settings
app.put('/api/admin/settings/smtp', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { host, port, user, pass, from } = req.body;

    if (host !== undefined) await setSetting('smtp_host', host);
    if (port !== undefined) await setSetting('smtp_port', String(port));
    if (user !== undefined) await setSetting('smtp_user', user);
    // Only update password if it's not the masked value
    if (pass !== undefined && pass !== '••••••••') await setSetting('smtp_pass', pass);
    if (from !== undefined) await setSetting('smtp_from', from);

    // Refresh the SMTP transporter with new settings
    const success = await refreshSmtpTransporter();

    await logActivity(req.user.userId, 'SETTINGS_UPDATE', 'Updated SMTP configuration', req.ip);

    res.json({
      data: {
        success: true,
        smtpConfigured: success,
        message: success ? 'SMTP settings saved and configured successfully' : 'SMTP settings saved but could not configure transporter (check credentials)',
      },
    });
  } catch (error) {
    console.error('Update SMTP error:', error);
    res.status(500).json({ error: 'Failed to update SMTP settings' });
  }
});

// Test SMTP connection
app.post('/api/admin/settings/test-smtp', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Test email address required' });

    if (!emailTransporter) {
      return res.status(400).json({ error: 'SMTP is not configured. Please save SMTP settings first.' });
    }

    // Verify connection
    await emailTransporter.verify();

    // Send test email
    await emailTransporter.sendMail({
      from: config.smtp.from || 'JDExchange <no-reply@jdexchange.com>',
      to: email,
      subject: 'JDExchange SMTP Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">✅ SMTP Configuration Working!</h2>
          <p>This is a test email from your JDExchange admin panel.</p>
          <p>Your SMTP settings are correctly configured and emails can be sent.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    await logActivity(req.user.userId, 'SMTP_TEST', `Test email sent to ${email}`, req.ip);

    res.json({ data: { success: true, message: `Test email sent to ${email}` } });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(400).json({ error: `SMTP test failed: ${error.message}` });
  }
});

// Update feature toggles
app.put('/api/admin/settings/features', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { features } = req.body;
    if (!features || typeof features !== 'object') {
      return res.status(400).json({ error: 'Features object required' });
    }

    const allowedFeatures = ['email_verification', 'two_factor_auth', 'kyc_required', 'registration_enabled', 'maintenance_mode'];
    const updated = [];

    for (const [key, value] of Object.entries(features)) {
      if (allowedFeatures.includes(key)) {
        await setSetting(`feature_${key}`, String(value));
        updated.push(key);
      }
    }

    await logActivity(req.user.userId, 'SETTINGS_UPDATE', `Updated feature toggles: ${updated.join(', ')}`, req.ip);

    res.json({
      data: {
        success: true,
        updated,
        message: `${updated.length} feature toggle(s) updated`,
      },
    });
  } catch (error) {
    console.error('Update features error:', error);
    res.status(500).json({ error: 'Failed to update feature toggles' });
  }
});

// ============= SITE CONTENT (CMS) =============

// Public — get all published site content
app.get('/api/site-content', async (req, res) => {
  try {
    const rows = await dbAll('SELECT section, key, value, type FROM site_content');
    // Group by section
    const content = {};
    for (const row of rows) {
      if (!content[row.section]) content[row.section] = {};
      // Parse JSON values
      if (row.type === 'json') {
        try { content[row.section][row.key] = JSON.parse(row.value); }
        catch { content[row.section][row.key] = row.value; }
      } else {
        content[row.section][row.key] = row.value;
      }
    }
    res.json({ data: content });
  } catch (error) {
    console.error('Get site content error:', error);
    res.status(500).json({ error: 'Failed to fetch site content' });
  }
});

// Admin — get all site content (with metadata)
app.get('/api/admin/site-content', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM site_content ORDER BY section, key');
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch site content' });
  }
});

// Admin — upsert site content (batch)
app.put('/api/admin/site-content', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    for (const item of items) {
      const { section, key, value, type = 'text' } = item;
      if (!section || !key) continue;

      const id = `${section}__${key}`;
      const stringValue = type === 'json' ? JSON.stringify(value) : String(value || '');

      await dbRun(`
        INSERT INTO site_content (id, section, key, value, type, updatedAt, updatedBy)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(section, key) DO UPDATE SET
          value = excluded.value,
          type = excluded.type,
          updatedAt = CURRENT_TIMESTAMP,
          updatedBy = excluded.updatedBy
      `, [id, section, key, stringValue, type, req.user.userId]);
    }

    res.json({ data: { message: 'Site content updated successfully' } });
  } catch (error) {
    console.error('Update site content error:', error);
    res.status(500).json({ error: 'Failed to update site content' });
  }
});

// Admin — delete a site content entry
app.delete('/api/admin/site-content/:section/:key', authenticate, loadUser, requireAdmin, async (req, res) => {
  try {
    const { section, key } = req.params;
    await dbRun('DELETE FROM site_content WHERE section = ? AND key = ?', [section, key]);
    res.json({ data: { message: 'Content entry deleted' } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// ============= ERROR HANDLING =============

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: config.env === 'development' ? err.message : 'Internal server error',
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============= START SERVER =============
app.listen(config.port, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`  JDExchange API Server`);
  console.log(`  Environment: ${config.env}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Admin: ${config.admin.email}`);
  console.log(`========================================\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
