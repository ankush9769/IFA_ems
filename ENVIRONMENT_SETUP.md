# Environment Setup Guide

## 🔧 Local Development (Current Setup)

### Frontend Configuration
**File**: `client/.env`
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend Configuration
**File**: `server/.env`
```env
CLIENT_ORIGIN=http://localhost:5173
```

### Running Locally
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

**Access**: http://localhost:5173

---

## 🚀 Production Deployment

### Frontend Configuration
**File**: `client/.env`
```env
VITE_API_URL=https://ifa-ems-rsqy.onrender.com/api
```

### Backend Configuration (on Render Dashboard)
**Environment Variable**: `CLIENT_ORIGIN`
```env
CLIENT_ORIGIN=https://ifa-ems-1frontend.onrender.com,http://localhost:5173
```

### Deployment URLs
- **Frontend**: https://ifa-ems-1frontend.onrender.com
- **Backend**: https://ifa-ems-rsqy.onrender.com

---

## 🔄 Switching Between Environments

### Switch to Local Development
1. Update `client/.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

2. Update `server/.env`:
   ```env
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. Restart both servers

### Switch to Production Testing
1. Update `client/.env`:
   ```env
   VITE_API_URL=https://ifa-ems-rsqy.onrender.com/api
   ```

2. Keep `server/.env` as is (local backend won't be used)

3. Restart frontend only

---

## 📝 Quick Commands

### Check Current Configuration
```bash
# Check frontend API URL
cat client/.env

# Check backend CORS
cat server/.env | grep CLIENT_ORIGIN
```

### Restart Servers
```bash
# Stop all processes (Ctrl+C in terminals)

# Start backend
cd server && npm run dev

# Start frontend (in new terminal)
cd client && npm run dev
```

---

## ⚠️ Important Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Always use `.env.example`** as a template
3. **Local development** uses localhost URLs
4. **Production** uses Render URLs
5. **CORS must match** - Backend `CLIENT_ORIGIN` must include frontend URL

---

## 🐛 Troubleshooting

### CORS Errors
- Check `CLIENT_ORIGIN` in `server/.env` includes your frontend URL
- Restart backend after changing CORS settings

### API Connection Failed
- Verify `VITE_API_URL` in `client/.env` is correct
- Check backend is running on the specified port
- Restart frontend after changing API URL

### Cache Issues
- Clear browser cache and localStorage
- Logout and login again
- Hard refresh (Ctrl+Shift+R)
