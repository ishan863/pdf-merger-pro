# Vercel Cache Error - Complete Fix

## Issue
Error persists: "Environment Variable 'VITE_FIREBASE_API_KEY' references Secret 'firebase_api_key', which does not exist"
Even though environment variables section is empty.

**Root Cause**: Vercel has cached the broken configuration from the previous import attempt.

---

## Solution: Delete Project & Deploy Fresh

### Step 1: Delete Current Project
1. Go to https://vercel.com/dashboard
2. Find project named "pdf-merger-pro-web"
3. Click the **3 dots menu** (top right of project card)
4. Select **Settings**
5. Scroll to very bottom
6. Click **Delete Project**
7. Type project name to confirm
8. Click **Delete**

### Step 2: Create Brand New Deployment
1. Go to https://github.com/ishan863/pdf-merger-pro
2. Look for "Add" or "Deploy" button
3. Select "Vercel" from the list
4. Authorize if needed
5. Click "Deploy"

### Step 3: During Import - CRITICAL
**DO NOT ADD ANY ENVIRONMENT VARIABLES DURING IMPORT**
- Leave the Environment Variables section completely **EMPTY**
- Click **Deploy** button
- Wait ~2-5 minutes for build to complete

### Step 4: Add Variables After Deployment
Once deployment is complete:
1. You'll see the deployment page
2. Click **Settings** tab at top
3. Look for **Environment Variables** in left sidebar
4. Click to expand
5. Add these 8 variables one by one:

```
VITE_FIREBASE_API_KEY = AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
VITE_FIREBASE_AUTH_DOMAIN = pdf-merger-app-79417.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = pdf-merger-app-79417
VITE_FIREBASE_STORAGE_BUCKET = pdf-merger-app-79417.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 692219914539
VITE_FIREBASE_APP_ID = 1:692219914539:web:e5e0b06c74fc78dc0b3d6e
VITE_MAX_FILE_SIZE_MB = 100
VITE_CLIENT_SIDE_THRESHOLD_MB = 50
```

### Step 5: Redeploy with Variables
1. After adding all 8 variables
2. Scroll down and click **Redeploy**
3. Wait for deployment to complete
4. Click **Visit** → See your login screen

---

## Important Notes
- ✅ DO NOT use @ symbols
- ✅ Paste values exactly as shown
- ✅ Empty the environment section during initial import
- ✅ Add variables AFTER first deployment completes

---

## Success Signs
- ✅ Build completes without errors
- ✅ No red error notification
- ✅ Visit button appears
- ✅ Login screen appears (not blank)
- ✅ Can sign in and use the app

---

## Timeline
- Delete project: 1 minute
- Fresh import: 2 minutes  
- First build: 2-5 minutes
- Add 8 variables: 3 minutes
- Redeploy: 2-5 minutes
- **Total: ~15 minutes**

---

## Still Having Issues?

If you still see the error after following these steps:
1. Check that NO variables have @ symbols
2. Verify exact spelling of variable names
3. Make sure you're adding in Settings AFTER deployment, not during import
4. Try incognito/private browser window
5. Clear browser cache (Ctrl+Shift+Del)
