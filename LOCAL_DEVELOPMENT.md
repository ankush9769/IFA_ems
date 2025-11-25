# 🛠️ Local Development Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Backend (`server/.env`)
```env
MONGODB_URI=mongodb+srv://palankushn_db_user:QZynwL95M9ws1RVx@cluster0.ibv6gsk.mongodb.net/ifa_ems
PORT=3000
NODE_ENV=development

# JWT Secrets
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Client Origin for CORS
CLIENT_ORIGIN=http://localhost:5173

# Deadline notification cron schedule
DEADLINE_CRON=0 9 * * *
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Start Development Servers

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

Expected output:
```
Server listening on port 3000
Connected to MongoDB
📅 Deadline notification job scheduled: 0 9 * * *
```

#### Terminal 2 - Frontend Server
```bash
cd client
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## Common Issues & Solutions

### ❌ Backend Server Crashes

**Issue**: Server crashes on startup

**Solutions**:

1. **Check MongoDB Connection**
   ```bash
   # Test MongoDB URI
   mongosh "mongodb+srv://palankushn_db_user:QZynwL95M9ws1RVx@cluster0.ibv6gsk.mongodb.net/ifa_ems"
   ```

2. **Verify NODE_ENV**
   - Make sure `NODE_ENV=development` in `server/.env`
   - NOT `production` for local development

3. **Check Port Availability**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Kill process if port is in use
   taskkill /PID <PID> /F
   ```

4. **Clear node_modules and Reinstall**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```

### ❌ CORS Errors

**Issue**: CORS policy blocking requests

**Solution**:
1. Verify `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)

### ❌ Frontend Can't Connect to Backend

**Issue**: API calls failing

**Solutions**:

1. **Check Backend is Running**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Verify Frontend .env**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Restart Frontend Dev Server**
   - Stop with Ctrl+C
   - Run `npm run dev` again

### ❌ Database Connection Timeout

**Issue**: `MongoServerSelectionError`

**Solutions**:

1. **Check Internet Connection**
   - MongoDB Atlas requires internet access

2. **Verify MongoDB URI**
   - Check credentials in `server/.env`
   - Ensure IP whitelist in MongoDB Atlas (0.0.0.0/0 for development)

3. **Increase Timeout**
   Edit `server/src/config/database.js`:
   ```javascript
   serverSelectionTimeoutMS: 10000, // Increase to 10 seconds
   ```

## Environment Switching

### Switch to Local Development

**Backend** (`server/.env`):
```env
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

### Switch to Production

**Backend** (`server/.env`):
```env
NODE_ENV=production
CLIENT_ORIGIN=https://ifa-ems-1-thefrontend-app.onrender.com,http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=https://ifa-ems-1backend.onrender.com/api
```

## Development Workflow

### Making Changes

1. **Backend Changes**
   - Edit files in `server/src/`
   - Server auto-restarts with nodemon
   - Check terminal for errors

2. **Frontend Changes**
   - Edit files in `client/src/`
   - Vite hot-reloads automatically
   - Check browser console for errors

### Testing

1. **Backend API Testing**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Login test
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

2. **Frontend Testing**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for API calls

### Debugging

1. **Backend Debugging**
   ```javascript
   // Add console.logs
   console.log('Debug:', variable);
   
   // Or use debugger
   debugger;
   ```

2. **Frontend Debugging**
   - Use React DevTools extension
   - Add `console.log()` statements
   - Use browser debugger

## Useful Commands

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm run lint         # Run ESLint
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Database Management

### View Data in MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Login with your credentials
3. Navigate to your cluster
4. Click "Browse Collections"
5. Select `ifa_ems` database

### Reset Database (Development Only)
```javascript
// In MongoDB Atlas or mongosh
use ifa_ems
db.dropDatabase()
```

## Tips for Smooth Development

✅ **Always run both servers** (backend and frontend)  
✅ **Check terminal output** for errors  
✅ **Use browser DevTools** to debug frontend issues  
✅ **Keep NODE_ENV=development** for local work  
✅ **Restart servers** after .env changes  
✅ **Clear browser cache** if seeing stale data  
✅ **Check CORS settings** if API calls fail  

## Need Help?

1. Check terminal output for error messages
2. Check browser console for frontend errors
3. Review this guide for common solutions
4. Check MongoDB Atlas for database issues

---

**Last Updated**: November 23, 2025
