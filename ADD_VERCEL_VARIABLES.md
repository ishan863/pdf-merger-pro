# 🔧 ADD THESE ENVIRONMENT VARIABLES TO VERCEL

**These are your Firebase credentials that need to be added to Vercel:**

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

## ✅ STEP-BY-STEP FIX

### 1. Go to Vercel Dashboard
```
https://vercel.com/ishan863/pdf-merger-pro
```

### 2. Click: Settings
![Click Settings button]

### 3. Click: Environment Variables
![Left sidebar → Environment Variables]

### 4. Add Each Variable

For each line above:
1. Click: "Add New"
2. Name: (the part before =)
3. Value: (the part after =)
4. Click: "Save"

**Example:**
```
Name:  VITE_FIREBASE_API_KEY
Value: AIzaSyBKqfsE-gphZaxG_o_AxN-uM7QNyZTnMO8
```

### 5. Click "Save" on each one

### 6. Go Back: Deployments

### 7. Click: Latest Deployment's "..."

### 8. Click: "Redeploy"

### 9. Wait 1-2 minutes for rebuild

### 10. Refresh your live URL

---

## 🚀 SHOULD BE FIXED!

After adding variables and redeploying:
- ✅ Site should load
- ✅ Login screen should appear
- ✅ All features should work

**If still blank:**
- Open DevTools (F12)
- Go to Console tab
- Look for red errors
- Tell me the error!
