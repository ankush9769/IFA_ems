# 🌐 IFA EMS Deployment URLs - Quick Reference

## Production URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://ifa-ems-1-thefrontend-app.onrender.com |
| **Backend** | https://ifa-ems-1backend.onrender.com |
| **Backend Health** | https://ifa-ems-1backend.onrender.com/health |
| **API Base** | https://ifa-ems-1backend.onrender.com/api |

## Environment Variables

### Frontend (client/.env)
```env
VITE_API_URL=https://ifa-ems-1backend.onrender.com/api
```

### Backend (server/.env)
```env
NODE_ENV=production
CLIENT_ORIGIN=https://ifa-ems-1-thefrontend-app.onrender.com,http://localhost:5173
```

## 🚨 IMPORTANT: Update on Render Dashboard

After pushing these changes, you MUST update the environment variables on Render:

### Backend Service on Render
1. Go to: https://dashboard.render.com
2. Select your backend service: `ifa-ems-1backend`
3. Go to "Environment" tab
4. Update/Add these variables:
   ```
   CLIENT_ORIGIN=https://ifa-ems-1-thefrontend-app.onrender.com,http://localhost:5173
   NODE_ENV=production
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

### Frontend Service on Render
1. Go to: https://dashboard.render.com
2. Select your frontend service: `ifa-ems-1-thefrontend-app`
3. Go to "Environment" tab
4. Update/Add this variable:
   ```
   VITE_API_URL=https://ifa-ems-1backend.onrender.com/api
   ```
5. Click "Save Changes"
6. Manually trigger a redeploy or push changes to Git

## ✅ Testing Checklist

After deployment:

1. **Backend Health Check**
   ```bash
   curl https://ifa-ems-1backend.onrender.com/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend Access**
   - Visit: https://ifa-ems-1-thefrontend-app.onrender.com
   - Should load without errors

3. **CORS Test**
   - Open browser console on frontend
   - Try to register/login
   - Should NOT see CORS errors

4. **API Connection**
   - Check Network tab in browser DevTools
   - API calls should go to: `https://ifa-ems-1backend.onrender.com/api/*`
   - Should return 200/201 status codes (not CORS errors)

## 🐛 If CORS Errors Persist

1. **Verify Backend Environment Variables on Render:**
   - CLIENT_ORIGIN must include your frontend URL
   - No trailing slashes
   - Comma-separated for multiple origins

2. **Clear Browser Cache:**
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

3. **Hard Refresh:**
   ```
   Ctrl+F5 (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

4. **Check Render Logs:**
   - Go to backend service on Render
   - Click "Logs" tab
   - Look for CORS-related errors

5. **Restart Services:**
   - Manually restart both frontend and backend services on Render

## 📝 Notes

- The backend accepts requests from both production frontend and localhost (for development)
- All API calls use `withCredentials: true` for cookie-based authentication
- CORS is configured in `server/src/app.js`
- API base URL is configured in `client/src/utils/api.js`

---

**Last Updated**: November 23, 2025
