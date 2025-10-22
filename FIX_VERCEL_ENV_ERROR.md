# ✅ FIX: ADD ENVIRONMENT VARIABLES TO VERCEL (NOT SECRETS)

## ❌ THE ERROR
```
Environment Variable "VITE_FIREBASE_API_KEY" references Secret "firebase_api_key", 
which does not exist.
```

## ✅ THE CAUSE
You used the wrong format. Vercel expected:
- You: `firebase_api_key` (as a Secret reference)
- Should be: Direct value

## 🔧 THE FIX

### STEP 1: Remove Wrong Settings

1. Go to: https://vercel.com/dashboard
2. Click: pdf-merger-pro project
3. Click: Settings
4. Click: Environment Variables
5. **Delete ALL the ones you added** (ones with @firebase_...)
   - Click the "X" on each one
   - Confirm delete

### STEP 2: Add Them Correctly (Direct Values)

1. Click: "Add New"
2. Fill in EXACTLY like this:

```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
Production: Checked ✓
Click: "Save"

Then repeat for each:

Name:  VITE_FIREBASE_AUTH_DOMAIN
Value: pdf-merger-app-79417.firebaseapp.com
Production: Checked ✓
Click: "Save"

Name:  VITE_FIREBASE_PROJECT_ID
Value: pdf-merger-app-79417
Production: Checked ✓
Click: "Save"

Name:  VITE_FIREBASE_STORAGE_BUCKET
Value: pdf-merger-app-79417.firebasestorage.app
Production: Checked ✓
Click: "Save"

Name:  VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 692219914539
Production: Checked ✓
Click: "Save"

Name:  VITE_FIREBASE_APP_ID
Value: 1:692219914539:web:e5e0b06c74fc78dc0b3d6e
Production: Checked ✓
Click: "Save"

Name:  VITE_MAX_FILE_SIZE_MB
Value: 100
Production: Checked ✓
Click: "Save"

Name:  VITE_CLIENT_SIDE_THRESHOLD_MB
Value: 50
Production: Checked ✓
Click: "Save"
```

### STEP 3: Redeploy

1. Click: "Deployments" tab
2. Click "..." on latest deployment
3. Select: "Redeploy"
4. Wait 2-3 minutes
5. Should show "Ready" ✅

### STEP 4: Visit Your App

1. Click: "Visit" button
2. Should see login screen!

---

## 📝 KEY POINTS

✅ **DO THIS:**
```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
```

❌ **DON'T DO THIS:**
```
Name:  VITE_FIREBASE_API_KEY
Value: @firebase_api_key
```

The value must be the **actual API key**, not a reference!

---

## 🎯 COPY-PASTE FRIENDLY

Here are all 8 in copy-paste format:

```
VITE_FIREBASE_API_KEY
AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8

VITE_FIREBASE_AUTH_DOMAIN
pdf-merger-app-79417.firebaseapp.com

VITE_FIREBASE_PROJECT_ID
pdf-merger-app-79417

VITE_FIREBASE_STORAGE_BUCKET
pdf-merger-app-79417.firebasestorage.app

VITE_FIREBASE_MESSAGING_SENDER_ID
692219914539

VITE_FIREBASE_APP_ID
1:692219914539:web:e5e0b06c74fc78dc0b3d6e

VITE_MAX_FILE_SIZE_MB
100

VITE_CLIENT_SIDE_THRESHOLD_MB
50
```

---

## ⏱️ QUICK STEPS

1. Delete all current env vars in Vercel ❌
2. Add 8 new ones with direct values (not @references) ✅
3. Make sure "Production" is checked ✅
4. Redeploy ✅
5. Visit your app ✅

---

## 🚀 START NOW!

Go to: https://vercel.com/dashboard

Follow the steps above!

After redeploy, your app will be live! 🎉
