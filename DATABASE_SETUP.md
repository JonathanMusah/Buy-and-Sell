# GhanaCryptoX - Database Setup Complete! 🎉

## ✅ What Changed

Your application now uses a **real SQLite database** instead of localStorage. This means:

- ✅ **Data persists reliably** - No more data loss when clearing browser cache
- ✅ **Proper authentication** - Secure password hashing with bcrypt
- ✅ **Real backend API** - Express.js server with proper REST endpoints
- ✅ **Database storage** - All users, orders, wallets stored in SQLite

## 🚀 How to Run

### 1. Start the Backend Server

```bash
cd backend
npm start
```

**Backend will run on:** `http://localhost:5000`

You should see:
```
✅ Server running on http://localhost:5000
✅ Admin credentials: admin@ghanacryptox.com / admin123
✅ Connected to SQLite database
✅ Database tables initialized
```

### 2. Start the Frontend

Open a NEW terminal:

```bash
cd app
npm run dev
```

**Frontend will run on:** `http://localhost:5173` (or 5176 if 5173 is in use)

## 🔐 Login Credentials

### Admin Account
- **Email:** admin@ghanacryptox.com
- **Password:** admin123

### Create New User
1. Go to `/register`
2. Fill in your details
3. User will be saved to database permanently!

## 📁 Database Location

The SQLite database file is created at:
```
backend/database.sqlite
```

This file contains ALL your data. You can:
- Back it up by copying the file
- Delete it to start fresh (it will be recreated on next server start)
- View it with SQLite database viewers

## 🎯 What Works Now

1. **Registration** - Create accounts that persist
2. **Login** - Login with email/password (passwords are hashed)
3. **Admin Panel** - View real users and orders from database
4. **Exchange** - Buy/Sell crypto with data from database
5. **User Profile** - All user data stored properly
6. **Orders** - All orders saved to database

## 🔧 Troubleshooting

### Backend not starting?
```bash
cd backend
npm install
npm start
```

### Frontend API errors?
1. Make sure backend is running on port 5000
2. Check `.env` file in `app/` folder has: `VITE_API_URL=http://localhost:5000/api`
3. Restart frontend: `npm run dev`

### Clear all data?
1. Stop backend server (Ctrl+C)
2. Delete `backend/database.sqlite`
3. Restart backend - fresh database will be created!

## 🎉 Test It Out!

1. **Register** a new user (e.g., emma@gmail.com with any password)
2. **Restart** both servers
3. **Login** again - your account still exists! 🎊
4. Check **admin panel** - see real user data!

No more localStorage issues - everything is stored in a real database!
