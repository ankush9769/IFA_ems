# Cloudflare + Railway Deployment Guide

This repo is a monorepo:
- Frontend: `client/` (Vite + React)
- Backend: `server/` (Express + MongoDB)

Deploy target:
- Frontend on Cloudflare Pages
- Backend on Railway

## 1) Backend Deploy on Railway

### Create Service
1. Push your latest code to GitHub.
2. In Railway, click New Project.
3. Choose Deploy from GitHub repo and select this repository.
4. In service settings, set Root Directory to `server`.

### Build/Start Configuration
Railway usually auto-detects Node and will use your `server/package.json` scripts.
- Build Command: `npm install`
- Start Command: `npm start`

### Railway Environment Variables
Add these in Railway service Variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://<your-cloudflare-domain>
MONGODB_URI=<your-mongodb-connection-string>
JWT_ACCESS_SECRET=<strong-random-secret>
JWT_REFRESH_SECRET=<strong-random-secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
DEADLINE_CRON=0 9 * * *
```

Notes:
- Railway injects its own `PORT`; your server already supports that.
- Keep `CLIENT_ORIGIN` exactly equal to your Cloudflare Pages URL (or comma-separated list if you add a custom domain too).

### Verify Backend
After deploy succeeds:
1. Open your Railway URL, then check `/health`.
2. Expected response includes `status: ok`.

Example:
`https://<railway-backend-domain>/health`

## 2) Frontend Deploy on Cloudflare Pages

### Create Project
1. In Cloudflare Dashboard, go to Workers & Pages > Pages.
2. Click Create project and connect your GitHub repo.
3. Configure build:

- Framework preset: Vite
- Root directory: `client`
- Build command: `npm run build`
- Build output directory: `dist`

### Cloudflare Environment Variables
Set this variable in Pages (Production and Preview if needed):

```env
VITE_API_URL=https://<railway-backend-domain>/api
```

Do not include trailing slash after `/api`.

### Redeploy
Trigger a deploy after setting env vars.

## 3) CORS and Domain Wiring

Your backend CORS reads `CLIENT_ORIGIN` from env.
Set it to your exact frontend origin, for example:

```env
CLIENT_ORIGIN=https://ifa-ems.pages.dev
```

If you also use a custom domain:

```env
CLIENT_ORIGIN=https://ifa-ems.pages.dev,https://app.yourdomain.com
```

## 4) Post-Deploy Smoke Test

1. Open frontend URL on Cloudflare.
2. Test signup.
3. Test sign in.
4. Confirm role-based redirect after login.
5. In browser devtools, ensure auth calls go to Railway domain.
6. Check Railway logs for API 4xx/5xx if anything fails.

## 5) Common Failure Fixes

### Signup or signin button appears to do nothing
- Check Cloudflare Pages env var `VITE_API_URL`.
- Re-deploy frontend after env changes.

### CORS error in browser
- Ensure Railway `CLIENT_ORIGIN` exactly matches frontend origin.
- No trailing slash in origin value.

### 401/Invalid credentials
- Verify user exists in production database.
- Confirm Railway is connected to correct `MONGODB_URI`.

### Cookies/session issues
- Keep backend `NODE_ENV=production` in Railway.
- Use HTTPS URLs only for both frontend and backend.

## 6) Optional Custom Domains

- Cloudflare Pages: attach your frontend custom domain.
- Railway: attach API custom domain (optional).
- Update `VITE_API_URL` and `CLIENT_ORIGIN` accordingly, then redeploy both.

## 7) Recommended Final Values

Frontend (Cloudflare):
```env
VITE_API_URL=https://<railway-backend-domain>/api
```

Backend (Railway):
```env
NODE_ENV=production
CLIENT_ORIGIN=https://<cloudflare-pages-domain>
MONGODB_URI=<mongodb-uri>
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
```
