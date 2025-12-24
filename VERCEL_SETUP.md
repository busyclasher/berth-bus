# Vercel Deployment Guide

## 🚀 Quick Deploy

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **⚠️ IMPORTANT: Add Environment Variable**
   - In the deployment settings, add:
     - **Key:** `GEMINI_API_KEY`
     - **Value:** Your Gemini API key
5. Click **"Deploy"**

### Step 3: Verify Deployment

After deployment:
- ✅ Check if the page loads (not blank)
- ✅ Test Bus Captain tab
- ✅ Test Manager dashboard
- ✅ Test Technician interface

---

## 🔧 Troubleshooting

### Blank White Screen?
1. **Check browser console** (F12) for errors
2. **Verify environment variable** is set in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `GEMINI_API_KEY` if missing
   - Redeploy after adding

### Voice Assistant Not Working?
- This is normal! The Gemini API key needs to be set in Vercel environment variables
- Voice features will work once the API key is configured

### 404 Errors on Refresh?
- Already fixed in `vercel.json` with rewrites configuration

---

## 📱 Features That Work Offline

These features work **without** the Gemini API key:
- ✅ Bus Captain NFC tap-in/tap-out
- ✅ Auto-assign parking berth
- ✅ Manager dashboard and analytics
- ✅ Technician asset locator
- ✅ Fleet inventory
- ✅ Shift handover notes

Only the **Voice Assistant** requires the API key.

---

## 🎯 Demo Mode

If you don't have a Gemini API key, the app still works perfectly for demos!
All core features are functional without it.

---

## Need Help?

Contact: [Your Contact Info]

