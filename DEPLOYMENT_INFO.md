# IFA EMS - Deployment Information

## 🌐 Live URLs

### Production
- **Frontend**: https://ifa-ems-1frontend.onrender.com
- **Backend API**: https://ifa-ems-rsqy.onrender.com
- **Health Check**: https://ifa-ems-rsqy.onrender.com/health

### Local Development
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🔧 Backend Configuration (Render)

### Required Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://palankushn_db_user:QZynwL95M9ws1RVx@cluster0.ibv6gsk.mongodb.net/ifa_ems

# Server
PORT=3000
NODE_ENV=production

# JWT Authentication
JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - IMPORTANT!
CLIENT_ORIGIN=https://ifa-ems-1frontend.onrender.com,http://localhost:5173

# Cron Jobs
DEADLINE_CRON=0 9 * * *
```

### ⚠️ CRITICAL: Update on Render Dashboard

**You MUST add this environment variable on Render:**

```
CLIENT_ORIGIN=https://ifa-ems-1frontend.onrender.com,http://localhost:5173
```

**Steps:**
1. Go to https://dashboard.render.com
2. Select your backend service (ifa-ems-rsqy)
3. Go to "Environment" tab
4. Add/Update `CLIENT_ORIGIN` variable
5. Save changes (service will auto-redeploy)

## 🎨 Frontend Configuration (Render)

### Environment Variables

```env
VITE_API_URL=https://ifa-ems-rsqy.onrender.com/api
```

### Build Settings
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Root Directory**: `client` (if deploying from monorepo)

## 🧪 Testing Deployment

### 1. Test Backend Health
```bash
curl https://ifa-ems-rsqy.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Test Frontend
1. Visit: https://ifa-ems-1frontend.onrender.com
2. You should see the landing page with role selection
3. Try logging in with test credentials

### 3. Test CORS
1. Open browser console on frontend
2. Try to login
3. Check for CORS errors
4. If you see CORS errors, verify `CLIENT_ORIGIN` is set correctly on Render

## 🔐 Default Test Accounts

### Admin Account
- Email: admin@example.com
- Password: admin123
- Role: Admin

### Employee Account
- Email: employee@example.com
- Password: employee123
- Role: Employee

### Client Account
- Email: client@example.com
- Password: client123
- Role: Client

## 📊 Features Available

### Admin Features
- ✅ Admin Dashboard - Project management
- ✅ Project Analysis - Charts and metrics
- ✅ Employee Checklist Viewer - Monitor employee checklists

### Employee Features
- ✅ Employee Portal - View assigned projects
- ✅ Daily Update Chart - Track daily updates per project
- ✅ Checklist - Daily task completion tracking

### Client Features
- ✅ Client Portal - Submit and track projects

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution**: Make sure `CLIENT_ORIGIN` on Render includes your frontend URL

### Issue: Cannot Login
**Solution**: 
1. Check backend is running: https://ifa-ems-rsqy.onrender.com/health
2. Clear browser cookies and localStorage
3. Check browser console for errors

### Issue: API Not Responding
**Solution**:
1. Check Render logs for backend errors
2. Verify MongoDB connection is working
3. Ensure environment variables are set correctly

### Issue: Render Service Sleeping
**Solution**: Render free tier services sleep after 15 minutes of inactivity
- First request may take 30-60 seconds to wake up
- Consider upgrading to paid tier for always-on service

## 🔄 Redeploying

### Backend (Render)
- Automatic: Push to main branch (if connected to GitHub)
- Manual: Click "Manual Deploy" in Render dashboard

### Frontend (Render)
- Automatic: Push to main branch (if connected to GitHub)
- Manual: Click "Manual Deploy" in Render dashboard

## 📝 Notes

- **Free Tier Limitations**: Services may sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep may take 30-60 seconds
- **Database**: MongoDB Atlas (shared cluster)
- **Security**: Update JWT secrets in production!

## 🆘 Support

If you encounter issues:
1. Check Render logs for errors
2. Verify all environment variables are set
3. Test backend health endpoint
4. Check browser console for frontend errors
