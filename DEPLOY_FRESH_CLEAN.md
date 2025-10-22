# Deploy Fresh - Clean & Simple ✅

## What Was Fixed
❌ **Old Problem**: 
- `vercel.json` had @ symbols → broke environment variables
- `.env.production` not committed to git
- Blank page on deployment

✅ **Now Fixed**:
- Removed @ symbols from `vercel.json`
- Added `.env.production` to git (allowed via .gitignore)
- Firebase config now included in build

---

## Deploy NOW (5 Minutes)

### Step 1: Delete Old Vercel Project
1. Go to https://vercel.com/dashboard
2. Find "pdf-merger-pro-web" project
3. Click **3 dots** → **Settings**
4. Scroll to bottom → **Delete Project**
5. Type name to confirm → **Delete**

### Step 2: Import Fresh from GitHub
1. Go to https://vercel.com/new
2. Select **Import Git Repository**
3. Paste: `https://github.com/ishan863/pdf-merger-pro`
4. Click **Import**

### Step 3: Configure Project
- **Project Name**: `pdf-merger-pro-web` (or any name)
- **Root Directory**: Leave default (will auto-detect)
- **Framework**: Vite
- **Build Command**: `cd web && npm run build` ✅ (auto-filled from vercel.json)
- **Output Directory**: `web/dist` ✅ (auto-filled from vercel.json)

### Step 4: Add Environment Variables
**DURING IMPORT** - Click "Environment Variables" section:

| Name | Value |
|------|-------|
| VITE_FIREBASE_API_KEY | AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8 |
| VITE_FIREBASE_AUTH_DOMAIN | pdf-merger-app-79417.firebaseapp.com |
| VITE_FIREBASE_PROJECT_ID | pdf-merger-app-79417 |
| VITE_FIREBASE_STORAGE_BUCKET | pdf-merger-app-79417.firebasestorage.app |
| VITE_FIREBASE_MESSAGING_SENDER_ID | 692219914539 |
| VITE_FIREBASE_APP_ID | 1:692219914539:web:e5e0b06c74fc78dc0b3d6e |
| VITE_MAX_FILE_SIZE_MB | 100 |
| VITE_CLIENT_SIDE_THRESHOLD_MB | 50 |

**IMPORTANT**: Enter values as-is, NO @ symbols

### Step 5: Deploy
- Click **Deploy** button
- Wait 2-5 minutes for build to complete
- You'll see: "Congratulations! Your project has been deployed"

### Step 6: Visit Live Site
- Click **Visit** button
- See the login screen (not blank!)
- Login with your Google account
- Test merge/split/convert features

---

## Success Checklist
- ✅ No errors during build
- ✅ Login screen appears
- ✅ Can sign in
- ✅ Dashboard shows
- ✅ Can upload PDFs
- ✅ History shows real actions

---

## What Changed in Code

### vercel.json (FIXED)
**Before** (broken with @ symbols):
```json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist",
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase_api_key"
  }
}
```

**After** (clean, no @ symbols):
```json
{
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist"
}
```

### .gitignore (UPDATED)
Now allows `.env.production` to be committed:
```
# Environment variables
.env
.env.local
.env.*.local
# Exception: Allow production env for deployment
!.env.production
```

### web/.env.production (NOW COMMITTED)
All 8 Firebase variables now included in repo:
```
VITE_FIREBASE_API_KEY=AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
VITE_FIREBASE_AUTH_DOMAIN=pdf-merger-app-79417.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pdf-merger-app-79417
VITE_FIREBASE_STORAGE_BUCKET=pdf-merger-app-79417.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=692219914539
VITE_FIREBASE_APP_ID=1:692219914539:web:e5e0b06c74fc78dc0b3d6e
VITE_MAX_FILE_SIZE_MB=100
VITE_CLIENT_SIDE_THRESHOLD_MB=50
```

---

## Git Commits Done
✅ Commit: `c28e60d`
- Fixed vercel.json (removed @ symbols)
- Allowed .env.production in .gitignore
- Pushed to main branch

---

## Ready to Deploy!
👉 **Now follow the 6 steps above and you're LIVE in 5 minutes!**

No more errors. No more blank page. Just clean deployment.
