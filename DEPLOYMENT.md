# IFA EMS Deployment Guide

## Backend Deployment (Render)

Your backend is deployed at: **https://ifa-ems-rsqy.onrender.com**

### Environment Variables on Render

Make sure these environment variables are set in your Render dashboard:

```
MONGODB_URI=mongodb+srv://palankushn_db_user:QZynwL95M9ws1RVx@cluster0.ibv6gsk.mongodb.net/ifa_ems
PORT=3000
NODE_ENV=production

JWT_ACCESS_SECRET=your-super-secret-access-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

CLIENT_ORIGIN=https://your-frontend-domain.com,http://localhost:5173
DEADLINE_CRON=0 9 * * *
```

**Important:** Update `CLIENT_ORIGIN` with your actual frontend URL once deployed!

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Set the following:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://ifa-ems-rsqy.onrender.com/api
   ```

6. Deploy!

### Option 2: Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import your repository
4. Set the following:
   - **Base Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `client/dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://ifa-ems-rsqy.onrender.com/api
   ```

6. Deploy!

### Option 3: Render (Static Site)

1. Go to Render Dashboard
2. Create a new Static Site
3. Connect your repository
4. Set the following:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `client/dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://ifa-ems-rsqy.onrender.com/api
   ```

6. Deploy!

## Post-Deployment Steps

1. **Update CORS on Backend**
   - Go to your Render dashboard
   - Update `CLIENT_ORIGIN` environment variable with your deployed frontend URL
   - Example: `CLIENT_ORIGIN=https://your-app.vercel.app,http://localhost:5173`

2. **Test the Application**
   - Visit your deployed frontend URL
   - Try logging in with test credentials
   - Verify all features work correctly

3. **Update JWT Secrets** (Important for Production!)
   - Generate strong random secrets for production
   - Update `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` on Render

## Local Development

To run locally with the deployed backend:

1. The frontend is already configured to use the deployed backend
2. Simply run: `npm run dev` in the `client` folder
3. Access at: http://localhost:5173

To run with local backend:

1. Update `client/.env`:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
2. Run backend: `npm run dev` in `server` folder
3. Run frontend: `npm run dev` in `client` folder

## Troubleshooting

### CORS Errors
- Make sure `CLIENT_ORIGIN` on Render includes your frontend URL
- Check that `withCredentials: true` is set in the API client

### API Connection Issues
- Verify the backend URL is correct in `client/.env`
- Check that the backend is running on Render
- Look at Render logs for any errors

### Authentication Issues
- Clear browser cookies and localStorage
- Verify JWT secrets are set correctly on Render
- Check that MongoDB connection is working

## Monitoring

- **Backend Logs**: Check Render dashboard for server logs
- **Frontend Errors**: Use browser console for client-side errors
- **Database**: Monitor MongoDB Atlas for connection issues
