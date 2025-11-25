# 🔧 Chat 401 Unauthorized Error - Fix

## Problem
Getting `401 (Unauthorized)` error when accessing chat:
```
GET http://localhost:3000/api/chats/my-chat 401 (Unauthorized)
```

## Root Cause
The JWT token in your browser was created before the chat feature was added. The token might be missing required fields or the authentication is not working properly.

## Solution

### Step 1: Logout and Login Again
The easiest fix is to logout and login again to get a fresh JWT token:

1. Click the **Logout** button in the top right
2. Login again with your credentials
3. Try accessing the chat page again

### Step 2: Clear Browser Storage (if Step 1 doesn't work)
If logout/login doesn't work, manually clear storage:

1. Open browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear:
   - **Local Storage** → Delete `ifa-ems-auth`
   - **Session Storage** → Clear all
   - **Cookies** → Delete all cookies for localhost
4. Refresh the page
5. Login again

### Step 3: Verify Backend is Running
Make sure your backend server is running:

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

### Step 4: Check Console for Errors
Open browser console (F12) and check for:
- Network errors
- Authentication errors
- CORS errors

### Step 5: Test Authentication
Try accessing other pages first:
- Admin Dashboard
- Client Portal
- Projects

If these work, the issue is specific to chat routes.

## Debugging

### Check if Token Exists
In browser console, run:
```javascript
localStorage.getItem('ifa-ems-auth')
```

Should return something like:
```json
{
  "state": {
    "user": {...},
    "tokens": {...}
  }
}
```

### Check Network Request
In DevTools Network tab:
1. Go to chat page
2. Look for `/api/chats/my-chat` request
3. Check **Headers** tab
4. Verify `Authorization: Bearer <token>` header exists

### Backend Logs
Check your backend terminal for logs:
```
Chat request from user: { sub: '...', role: 'client', ... }
```

If you see this log, authentication is working.

## Common Issues

### Issue 1: No Authorization Header
**Symptom**: 401 error, no Bearer token in request
**Fix**: Logout and login again

### Issue 2: Invalid Token
**Symptom**: 401 error, "Invalid or expired token"
**Fix**: Clear storage and login again

### Issue 3: Wrong Role
**Symptom**: 403 Forbidden instead of 401
**Fix**: Make sure you're logged in as client (for client chat) or admin (for admin chat)

### Issue 4: Backend Not Running
**Symptom**: Network error, "Failed to fetch"
**Fix**: Start backend server

### Issue 5: CORS Error
**Symptom**: CORS policy error in console
**Fix**: Check `CLIENT_ORIGIN` in `server/.env`

## Quick Test

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"ok","timestamp":"..."}`

### Test 2: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'
```
Should return user data and tokens.

### Test 3: Chat Access (with token)
```bash
curl http://localhost:3000/api/chats/my-chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
Should return chat data or create new chat.

## Prevention

To avoid this issue in the future:
1. Always logout/login after backend changes
2. Clear cache when switching between environments
3. Use incognito mode for testing
4. Check backend logs for errors

## Still Not Working?

If none of the above works:

1. **Restart Backend Server**
   ```bash
   # Stop server (Ctrl+C)
   cd server
   npm run dev
   ```

2. **Restart Frontend Server**
   ```bash
   # Stop server (Ctrl+C)
   cd client
   npm run dev
   ```

3. **Check Database Connection**
   - Verify MongoDB Atlas is accessible
   - Check `MONGODB_URI` in `server/.env`

4. **Verify User Exists**
   - Check MongoDB Atlas
   - Look for your user in the `users` collection
   - Verify `role` field is set correctly

5. **Check JWT Secrets**
   - Verify `JWT_ACCESS_SECRET` in `server/.env`
   - Make sure it's not empty

---

**Last Updated**: November 23, 2025
