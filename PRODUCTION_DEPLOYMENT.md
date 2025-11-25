# 🚀 Production Deployment Checklist

## Current Configuration

### URLs
- **Frontend**: https://ifa-ems-1-thefrontend-app.onrender.com
- **Backend**: https://ifa-ems-1-thebackend-server.onrender.com

### Environment Variables

#### Backend (`server/.env`)
```env
NODE_ENV=production
CLIENT_ORIGIN=https://ifa-ems-1-thefrontend-app.onrender.com,http://localhost:5173
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=https://ifa-ems-1-thebackend-server.onrender.com/api
```

## Deployment Steps

### 1. Update Environment Variables on Render

#### Backend Service
1. Go to https://dashboard.render.com
2. Select your backend service: `ifa-ems-1-thebackend-server`
3. Go to **Environment** tab
4. Add/Update these variables:
   ```
   NODE_ENV=production
   CLIENT_ORIGIN=https://ifa-ems-1-thefrontend-app.onrender.com
   MONGODB_URI=mongodb+srv://palankushn_db_user:QZynwL95M9ws1RVx@cluster0.ibv6gsk.mongodb.net/ifa_ems
   JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   DEADLINE_CRON=0 9 * * *
   ```
5. Click **Save Changes**
6. Service will automatically redeploy

#### Frontend Service
1. Go to https://dashboard.render.com
2. Select your frontend service: `ifa-ems-1-thefrontend-app`
3. Go to **Environment** tab
4. Add/Update this variable:
   ```
   VITE_API_URL=https://ifa-ems-1-thebackend-server.onrender.com/api
   ```
5. Click **Save Changes**
6. Manually trigger redeploy or push to Git

### 2. Push Code to Git

```bash
# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add live chat feature and fix responsive design"

# Push to main branch
git push origin main
```

### 3. Verify Deployment

#### Backend Health Check
```bash
curl https://ifa-ems-1-thebackend-server.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"..."}`

#### Frontend Access
Visit: https://ifa-ems-1-thefrontend-app.onrender.com
- Should load without errors
- Check browser console (F12) for errors

### 4. Test Features

#### Test 1: Login
1. Go to frontend URL
2. Click Login
3. Enter credentials
4. Should redirect to dashboard

#### Test 2: Projects
1. Login as admin
2. Go to Admin Dashboard
3. Verify projects load
4. Test search functionality
5. Verify newest projects appear first

#### Test 3: Chat Feature
1. **As Client:**
   - Login as client
   - Click "Chat" in sidebar
   - Send a message to admin
   - Verify message appears

2. **As Admin:**
   - Login as admin
   - Click "Chat Contacts" in sidebar
   - See unread badge on client
   - Click client to open chat
   - Reply to message
   - Verify client receives reply

#### Test 4: Client Isolation
1. Login as Client A
2. Create a project
3. Logout
4. Login as Client B
5. Verify Client B doesn't see Client A's project

#### Test 5: Responsive Design
1. Open on mobile device or resize browser
2. Verify hamburger menu works
3. Test all pages on mobile
4. Verify tables scroll horizontally

## Features Deployed

### ✅ Core Features
- User authentication (login/signup)
- Role-based access control (admin, client, employee)
- Project management
- Daily updates
- Employee checklists

### ✅ New Features
- **Live Chat System**
  - Client-to-admin messaging
  - Real-time updates (polling)
  - Unread message badges
  - Message history

- **Search & Sort**
  - Auto-search as you type
  - Sort projects by newest first
  - Search by client, description, type

- **Client Data Isolation**
  - Each client sees only their own projects
  - No data leakage between clients
  - Secure access control

- **Responsive Design**
  - Mobile-first approach
  - Tailwind CSS responsive classes
  - Hamburger menu for mobile
  - Responsive tables

### ✅ Bug Fixes
- Fixed client data caching issue
- Fixed server crash on startup
- Fixed CORS configuration
- Fixed responsive layout issues

## Post-Deployment Checklist

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Login works for all roles
- [ ] Projects display correctly
- [ ] Search functionality works
- [ ] Chat feature works (client & admin)
- [ ] Client isolation verified
- [ ] Mobile responsive design works
- [ ] No console errors
- [ ] No CORS errors

## Monitoring

### Check Logs

#### Backend Logs (Render)
1. Go to backend service on Render
2. Click **Logs** tab
3. Look for:
   - Server startup messages
   - Database connection
   - Any errors

#### Frontend Logs (Render)
1. Go to frontend service on Render
2. Click **Logs** tab
3. Look for build errors

### Browser Console
1. Open frontend in browser
2. Press F12
3. Check Console tab for:
   - JavaScript errors
   - Network errors
   - CORS errors

## Rollback Plan

If deployment fails:

1. **Revert Git Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Restore Environment Variables**
   - Go to Render dashboard
   - Restore previous environment variables
   - Redeploy

3. **Check Database**
   - Verify MongoDB Atlas is accessible
   - Check for any data issues

## Performance Optimization

### Backend
- [ ] Enable compression
- [ ] Add rate limiting
- [ ] Optimize database queries
- [ ] Add caching (Redis)

### Frontend
- [ ] Enable code splitting
- [ ] Optimize images
- [ ] Add service worker
- [ ] Enable gzip compression

## Security Checklist

- [ ] Change JWT secrets to strong random values
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Add rate limiting
- [ ] Enable CORS only for trusted origins
- [ ] Sanitize user inputs
- [ ] Add CSP headers
- [ ] Regular security audits

## Backup Strategy

### Database Backup
1. MongoDB Atlas automatic backups enabled
2. Manual backup before major changes:
   ```bash
   mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y%m%d)
   ```

### Code Backup
1. Git repository (primary)
2. GitHub/GitLab (remote)
3. Local backups

## Support

### Common Issues

**Issue**: Chat not working
**Solution**: Logout and login again to get new JWT token

**Issue**: CORS errors
**Solution**: Verify CLIENT_ORIGIN in backend environment variables

**Issue**: 401 Unauthorized
**Solution**: Check JWT secrets are set correctly

**Issue**: Projects not loading
**Solution**: Check MongoDB connection and backend logs

### Contact

For issues or questions:
- Check logs on Render dashboard
- Review browser console errors
- Check MongoDB Atlas status
- Verify environment variables

---

**Deployment Date**: November 23, 2025
**Version**: 1.0.0
**Status**: ✅ Ready for Production
