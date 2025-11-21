# IFA EMS Deployment Guide

## 🌐 Deployed URLs

- **Frontend**: https://ifa-ems-1frontend.onrender.com
- **Backend**: https://ifa-ems-1backend.onrender.com

## 📋 Configuration Updates

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=https://ifa-ems-1backend.onrender.com/api
```

### Backend Configuration (`server/.env`)
```env
NODE_ENV=production
CLIENT_ORIGIN=https://ifa-ems-1frontend.onrender.com,http://localhost:5173
```

## 🚀 Deployment Steps

### Backend Deployment (Render)

1. **Environment Variables to Set on Render:**
   ```
   MONGODB_URI=mongodb+srv://palankushn_db_user:QZynwL95M9ws1RVx@cluster0.ibv6gsk.mongodb.net/ifa_ems
   PORT=3000
   NODE_ENV=production
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   CLIENT_ORIGIN=https://ifa-ems-1frontend.onrender.com,http://localhost:5173
   DEADLINE_CRON=0 9 * * *
   ```

2. **Build Command:**
   ```bash
   npm install
   ```

3. **Start Command:**
   ```bash
   npm start
   ```

4. **Root Directory:**
   ```
   server
   ```

### Frontend Deployment (Render)

1. **Environment Variables to Set on Render:**
   ```
   VITE_API_URL=https://ifa-ems-1backend.onrender.com/api
   ```

2. **Build Command:**
   ```bash
   npm install && npm run build
   ```

3. **Start Command:**
   ```bash
   npm run preview
   ```
   
   Or for production serve:
   ```bash
   npx serve -s dist -l 5173
   ```

4. **Root Directory:**
   ```
   client
   ```

## 🔧 Local Development

To switch back to local development:

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (`server/.env`)
```env
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
```

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `https://ifa-ems-1backend.onrender.com/health`
- [ ] Frontend loads correctly
- [ ] Login functionality works
- [ ] API calls are successful (check browser console)
- [ ] CORS is properly configured
- [ ] All pages are responsive on mobile/tablet/desktop

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Verify `CLIENT_ORIGIN` in backend includes your frontend URL
2. Restart the backend service on Render
3. Clear browser cache

### API Connection Issues
1. Check backend health endpoint: `https://ifa-ems-1backend.onrender.com/health`
2. Verify `VITE_API_URL` in frontend environment variables
3. Check browser console for error messages

### Authentication Issues
1. Ensure JWT secrets are set in backend environment
2. Check that cookies are enabled in browser
3. Verify `credentials: true` in CORS configuration

## 📱 Responsive Design

The application is now fully responsive with:
- Mobile-first design using Tailwind CSS
- Hamburger menu for mobile navigation
- Responsive tables with horizontal scroll
- Optimized typography for all screen sizes
- Touch-friendly buttons and controls

## 🔐 Security Notes

**Important**: Before going to production, update these values:
- `JWT_ACCESS_SECRET` - Use a strong, random secret
- `JWT_REFRESH_SECRET` - Use a different strong, random secret
- Consider using environment-specific secrets

Generate secure secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Monitoring

Monitor your deployment:
- Check Render dashboard for logs
- Monitor MongoDB Atlas for database performance
- Set up alerts for downtime or errors

## 🔄 Updating Deployment

To update the deployment:
1. Push changes to your Git repository
2. Render will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger deployment from Render dashboard

---

**Last Updated**: November 22, 2025
