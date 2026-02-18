# Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and sign up/login with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `fintech-assignment` repository
4. Railway will auto-detect it's a Node.js project
5. Click on the service → **"Variables"** tab → Add these:
   ```
   PORT=3001
   JWT_ACCESS_SECRET=your-production-access-secret-change-this
   JWT_REFRESH_SECRET=your-production-refresh-secret-change-this
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```
6. Railway will auto-deploy. **Copy the public URL** (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/login with GitHub
2. Click **"Add New Project"** → Import your `fintech-assignment` repository
3. Set **Root Directory** to `frontend`
4. In **Environment Variables**, add:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
   ```
5. Click **"Deploy"**
6. Vercel will give you a URL like `https://your-app.vercel.app`

### Step 3: Update Backend CORS

1. Go back to Railway → Your backend service → **Variables**
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will auto-redeploy

### Step 4: Test

Visit your Vercel URL and test the app!

---

## Alternative: Render.com (Both Services)

### Backend on Render:

1. Go to [render.com](https://render.com) → Sign up
2. **New** → **Web Service** → Connect GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run db:generate && npm run db:push`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   ```
   PORT=3001
   JWT_ACCESS_SECRET=your-secret
   JWT_REFRESH_SECRET=your-secret
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

### Frontend on Render:

1. **New** → **Web Service** → Connect GitHub repo
2. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

---

## Notes

- **Database**: SQLite file is stored on the server. For production, consider PostgreSQL (Railway/Render offer free PostgreSQL).
- **Secrets**: Use strong random strings for JWT secrets in production.
- **HTTPS**: Both platforms provide HTTPS automatically.
