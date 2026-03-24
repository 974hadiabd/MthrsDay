# Vercel & GitHub Deployment Guide

## Prerequisites
- GitHub account (you have it ✓)
- Vercel account (you have it ✓)

---

## Step 1: Push to GitHub

### Create a new GitHub repository
1. Go to https://github.com/new
2. Name it `beats-of-you` (or any name)
3. Keep it **Private** (recommended for personal app)
4. Click "Create repository"

### Push your code
Since this is a frontend-only PWA, you only need the `/app/frontend` folder:

```bash
cd /app/frontend
git init
git add .
git commit -m "Initial commit: Beats of You PWA"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/beats-of-you.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Connect to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `beats-of-you` repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `.` (since you pushed just the frontend folder)
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
5. Click "Deploy"

### Your app will be live at:
`https://beats-of-you.vercel.app` (or similar)

---

## Step 3: Enable PWA Install on Mobile

### For Android (Chrome)
1. Open your Vercel URL in Chrome
2. A banner will appear: "Add Beats of You to Home screen"
3. Or tap the 3-dot menu → "Add to Home screen"
4. The app will now appear on your home screen without browser bars!

### For iOS (Safari)
1. Open your Vercel URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it and tap "Add"
5. The app will now appear on your home screen in standalone mode!

---

## PWA Checklist ✓
Your app already has:
- ✅ `manifest.json` with `display: "standalone"`
- ✅ Service Worker for offline caching
- ✅ App icons (72px to 512px)
- ✅ `theme-color` meta tag
- ✅ Apple-specific meta tags for iOS
- ✅ `viewport-fit=cover` for notch support

---

## Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS instructions

---

## Notes
- The app works fully offline after first visit
- All data is stored in localStorage on the user's device
- Passwords are: Editor = `Hxdi.132`, User = `1234`
- To change user password, edit `src/utils/storage.js` line 3
