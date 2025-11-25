# 🔧 Server Crash Fix - Local Development

## Problem
Backend server was crashing when trying to run locally.

## Root Causes Identified

1. **NODE_ENV set to production** - Should be `development` for local work
2. **Missing error handling** - Cron job could crash server if it failed
3. **Configuration mismatch** - Production URLs in local environment

## Solutions Implemented

### 1. Updated Environment Configuration

**server/.env** - Set for local development:
```env
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

**client/.env** - Point to local backend:
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Added Error Handling to Cron Job

Updated `server/src/services/jobs/deadlineJob.js`:
- Added try-catch blocks
- Added console logging for debugging
- Prevents server crash if job fails
- Graceful error handling for individual projects

### 3. Created Health Check Script

New file: `server/check-server.js`

Run before starting server:
```bash
cd server
npm run check
```

This checks:
- ✅ Environment variables
- ✅ MongoDB connection
- ✅ Port availability
- ✅ CORS configuration
- ✅ Node environment

### 4. Created Comprehensive Documentation

- **LOCAL_DEVELOPMENT.md** - Complete local setup guide
- **SERVER_CRASH_FIX.md** - This document
- Troubleshooting steps for common issues

## How to Start Server Locally

### Step 1: Check Configuration
```bash
cd server
npm run check
```

### Step 2: Start Backend
```bash
npm run dev
```

Expected output:
```
Server listening on port 3000
Connected to MongoDB
📅 Deadline notification job scheduled: 0 9 * * *
```

### Step 3: Start Frontend (in new terminal)
```bash
cd client
npm run dev
```

### Step 4: Access Application
```
http://localhost:5173
```

## Troubleshooting

### Server Still Crashes?

1. **Run Health Check**
   ```bash
   cd server
   npm run check
   ```

2. **Check Terminal Output**
   - Look for specific error messages
   - Note which step fails (database, port, etc.)

3. **Common Issues:**

   **MongoDB Connection Error:**
   ```
   ❌ Check internet connection
   ❌ Verify MONGODB_URI in .env
   ❌ Check MongoDB Atlas IP whitelist
   ```

   **Port Already in Use:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

   **Missing Dependencies:**
   ```bash
   cd server
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check Logs**
   - Server logs in terminal
   - MongoDB Atlas logs
   - Browser console (F12)

### CORS Errors?

1. Verify `CLIENT_ORIGIN=http://localhost:5173` in `server/.env`
2. Restart backend server
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)

### Frontend Can't Connect?

1. **Check backend is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify frontend .env:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Restart frontend:**
   - Stop with Ctrl+C
   - Run `npm run dev` again

## Environment Switching

### For Local Development
```env
# server/.env
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# client/.env
VITE_API_URL=http://localhost:3000/api
```

### For Production Deployment
```env
# server/.env (on Render)
NODE_ENV=production
CLIENT_ORIGIN=https://ifa-ems-1-thefrontend-app.onrender.com

# client/.env (on Render)
VITE_API_URL=https://ifa-ems-1backend.onrender.com/api
```

## Files Modified

1. **server/.env** - Updated NODE_ENV and CLIENT_ORIGIN
2. **client/.env** - Updated VITE_API_URL
3. **server/src/services/jobs/deadlineJob.js** - Added error handling
4. **server/check-server.js** - New health check script
5. **server/package.json** - Added check script
6. **LOCAL_DEVELOPMENT.md** - New comprehensive guide
7. **SERVER_CRASH_FIX.md** - This document

## Quick Reference

### Start Development
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Check Server Health
```bash
cd server
npm run check
```

### View Logs
- Backend: Check terminal where `npm run dev` is running
- Frontend: Browser console (F12)
- Database: MongoDB Atlas dashboard

## Prevention Tips

✅ Always use `NODE_ENV=development` locally  
✅ Run `npm run check` before starting server  
✅ Keep separate .env files for local/production  
✅ Check terminal output for errors  
✅ Restart servers after .env changes  

---

**Last Updated**: November 23, 2025
