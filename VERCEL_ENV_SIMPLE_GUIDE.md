# 🎯 VERCEL ENVIRONMENT VARIABLES - SIMPLE STEPS

## 📍 YOUR MISSION

Add 8 environment variables to Vercel so your app can load with Firebase credentials.

---

## ✅ 5-MINUTE FIX

### STEP 1: Go to Vercel
```
https://vercel.com/dashboard
```

### STEP 2: Open Your Project
```
Click: pdf-merger-pro
```

### STEP 3: Go to Settings
```
Top menu → Click "Settings"
```

### STEP 4: Find Environment Variables
```
Left sidebar → Click "Environment Variables"
```

### STEP 5: Remove Old Ones (If Any)
```
If you see any with "@" symbols → Delete them
Click the X button to remove
```

### STEP 6: Add Variable #1
```
Click: "Add New"

Type in first box: VITE_FIREBASE_API_KEY
Type in second box: AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8

Make sure "Production" is checked ✓
Click: "Save"
```

### STEP 7: Add Variables #2-8
```
Repeat STEP 6 for each of these:

2. VITE_FIREBASE_AUTH_DOMAIN
   pdf-merger-app-79417.firebaseapp.com

3. VITE_FIREBASE_PROJECT_ID
   pdf-merger-app-79417

4. VITE_FIREBASE_STORAGE_BUCKET
   pdf-merger-app-79417.firebasestorage.app

5. VITE_FIREBASE_MESSAGING_SENDER_ID
   692219914539

6. VITE_FIREBASE_APP_ID
   1:692219914539:web:e5e0b06c74fc78dc0b3d6e

7. VITE_MAX_FILE_SIZE_MB
   100

8. VITE_CLIENT_SIDE_THRESHOLD_MB
   50
```

### STEP 8: Redeploy
```
Click: "Deployments" tab (top)
Find: Latest deployment (top of list)
Click: "..." (three dots)
Click: "Redeploy"
```

### STEP 9: Wait for Build
```
You'll see: "Building..."
Wait 2-3 minutes
Then see: "Ready" (green badge)
```

### STEP 10: Visit Your App!
```
Click: "Visit" button
OR
Copy the URL and open in browser
```

### STEP 11: See Login Screen
```
Should show: PDF Merger Pro logo
Should show: Login form
Should NOT show: Blank page ✅
```

---

## 📝 IMPORTANT NOTES

✅ **VALUE IS THE WHOLE THING:**
```
Use the ENTIRE value, example:
AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
```

✅ **MAKE SURE PRODUCTION IS CHECKED:**
```
Before saving each variable
Check the "Production" checkbox
```

✅ **COPY EXACTLY AS IS:**
```
No extra spaces
No quotes
Just the value itself
```

---

## 🚀 VISUAL WORKFLOW

```
Vercel Dashboard
     ↓
Click pdf-merger-pro
     ↓
Click Settings
     ↓
Click Environment Variables
     ↓
Click Add New (x8 times)
     ↓
Fill in Name and Value
     ↓
Check Production ✓
     ↓
Click Save
     ↓
Repeat x8
     ↓
Go to Deployments
     ↓
Click ... on latest
     ↓
Click Redeploy
     ↓
Wait 2-3 minutes
     ↓
Click Visit
     ↓
🎉 App is live!
```

---

## ❓ COMMON MISTAKES

### ❌ WRONG - Using @ References
```
VITE_FIREBASE_API_KEY = @firebase_api_key
```
**This causes the error you got!**

### ✅ CORRECT - Using Direct Values
```
VITE_FIREBASE_API_KEY = AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
```
**This is what you need!**

---

## 📊 ALL 8 VARIABLES AT ONCE

| # | Name | Value |
|----|------|-------|
| 1 | VITE_FIREBASE_API_KEY | AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8 |
| 2 | VITE_FIREBASE_AUTH_DOMAIN | pdf-merger-app-79417.firebaseapp.com |
| 3 | VITE_FIREBASE_PROJECT_ID | pdf-merger-app-79417 |
| 4 | VITE_FIREBASE_STORAGE_BUCKET | pdf-merger-app-79417.firebasestorage.app |
| 5 | VITE_FIREBASE_MESSAGING_SENDER_ID | 692219914539 |
| 6 | VITE_FIREBASE_APP_ID | 1:692219914539:web:e5e0b06c74fc78dc0b3d6e |
| 7 | VITE_MAX_FILE_SIZE_MB | 100 |
| 8 | VITE_CLIENT_SIDE_THRESHOLD_MB | 50 |

---

## 🎯 CHECKLIST

Before starting:
- [ ] Have this guide open
- [ ] Have Vercel dashboard open
- [ ] 10 minutes free time

While adding:
- [ ] Remove old variables with @ symbols
- [ ] Add each new variable one by one
- [ ] Check "Production" before save
- [ ] Copy values exactly as shown

After adding all 8:
- [ ] Go to Deployments
- [ ] Click Redeploy
- [ ] Wait for "Ready" status

After deployment:
- [ ] Click Visit
- [ ] See login screen (not blank!)
- [ ] Try to sign in
- [ ] Success! 🎉

---

## ✨ EXPECTED RESULT

### BEFORE (Now - With Error)
```
Vercel shows error:
"references Secret which does not exist"
```

### AFTER (After Fix - Working!)
```
Vercel shows "Ready"
Click Visit
See login screen
App is LIVE! 🚀
```

---

## 🚀 GO DO IT NOW!

**Right now:**
1. Open: https://vercel.com/dashboard
2. Click: pdf-merger-pro
3. Click: Settings
4. Click: Environment Variables
5. Follow the steps above
6. Redeploy
7. Visit your app!

**In 10 minutes: Your app will be live!** 🎉

---

*Good luck! You've got this! 💪*
