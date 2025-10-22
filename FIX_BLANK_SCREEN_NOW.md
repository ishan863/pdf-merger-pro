# ✅ FIX BLANK SCREEN - ADD FIREBASE VARIABLES

## 🎯 THE PROBLEM
- Your site is live at: `https://pdf-merger-pro-web-7r5k.vercel.app`
- But it's showing blank (Firebase variables not set in Vercel)

## ✅ THE SOLUTION
Add your Firebase variables to Vercel in 5 minutes

---

## 📋 YOUR FIREBASE CREDENTIALS

Copy these values (they're already in your `web/.env.local`):

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8

Name: VITE_FIREBASE_AUTH_DOMAIN
Value: pdf-merger-app-79417.firebaseapp.com

Name: VITE_FIREBASE_PROJECT_ID
Value: pdf-merger-app-79417

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: pdf-merger-app-79417.firebasestorage.app

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 692219914539

Name: VITE_FIREBASE_APP_ID
Value: 1:692219914539:web:e5e0b06c74fc78dc0b3d6e

Name: VITE_MAX_FILE_SIZE_MB
Value: 100

Name: VITE_CLIENT_SIDE_THRESHOLD_MB
Value: 50
```

---

## 🔧 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Open Vercel Dashboard
```
1. Go to: https://vercel.com/dashboard
2. Click: pdf-merger-pro project
3. You should see your deployment
```

### STEP 2: Go to Settings
```
1. Click: "Settings" tab at top
2. In left sidebar, click: "Environment Variables"
```

### STEP 3: Add Each Variable
```
For EACH line above:

1. Click: "Add New" button
2. Enter Name: (copy from above)
3. Enter Value: (copy from above)
4. Click: "Save" button

Repeat 8 times (once for each variable)
```

### STEP 4: Verify All Variables Are Added
```
After adding all 8:
- You should see all 8 in the list
- Each shows a green checkmark
```

### STEP 5: Redeploy
```
1. Click: "Deployments" tab
2. Find the latest deployment
3. Click the "..." menu
4. Select: "Redeploy"
5. Wait 1-2 minutes for build to complete
```

### STEP 6: Refresh Your App
```
1. Go to: https://pdf-merger-pro-web-7r5k.vercel.app
2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
3. You should see the login page!
```

---

## ✨ WHAT SHOULD HAPPEN

**Before (current):**
- Blank white page
- Nothing loads

**After (with variables):**
- PDF Merger Pro logo appears
- Login screen loads
- You can sign in
- All features work!

---

## 🚨 IF STILL BLANK

After redeploy, if still blank:

1. **Open DevTools**: Press F12
2. **Go to Console tab**: Click "Console"
3. **Look for red errors**: You should see them
4. **Screenshot the error**: Take a picture
5. **Tell me the error**: I'll fix it!

---

## 📝 QUICK REFERENCE

| Variable Name | Where to Get It |
|--------------|-----------------|
| VITE_FIREBASE_API_KEY | web/.env.local (line 2) |
| VITE_FIREBASE_AUTH_DOMAIN | web/.env.local (line 3) |
| VITE_FIREBASE_PROJECT_ID | web/.env.local (line 4) |
| VITE_FIREBASE_STORAGE_BUCKET | web/.env.local (line 5) |
| VITE_FIREBASE_MESSAGING_SENDER_ID | web/.env.local (line 6) |
| VITE_FIREBASE_APP_ID | web/.env.local (line 7) |

---

## ✅ VERIFICATION

After adding variables:
- [ ] All 8 variables appear in Vercel settings
- [ ] Redeploy completed (green checkmark)
- [ ] Refreshed the live URL
- [ ] Login screen appears

**Then it's working!** 🎉

---

## 🆘 STILL NOT WORKING?

If blank screen persists:

1. **Check DevTools Console (F12)**
   - What red errors appear?

2. **Check Network tab (F12)**
   - Are requests failing?
   - What status codes?

3. **Screenshot everything** and tell me

**I'll fix it immediately!** 🚀
