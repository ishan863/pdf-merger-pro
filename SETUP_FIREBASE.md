# Firebase Setup Guide 🔥

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** or **"Add project"**
3. Enter project name: `pdf-merger` (or your preferred name)
4. Accept the terms and click **"Continue"**
5. Disable **Google Analytics** (optional, can enable later) → **"Create project"**
6. Wait for project creation (1-2 minutes)

---

## Step 2: Enable Authentication Providers

### Google OAuth
1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get Started"**
3. Go to **"Sign-in method"** tab
4. Click **"Google"**
5. Toggle **"Enable"** → **"Save"**
6. Your Google OAuth is now active ✅

### GitHub OAuth
1. In Authentication → **"Sign-in method"**
2. Click **"GitHub"**
3. Toggle **"Enable"**
4. You need GitHub OAuth credentials:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **"OAuth Apps"** → **"New OAuth App"**
   - **Application name:** `pdf-merger`
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5173/__/auth/handler`
   - Create app and copy **Client ID** and **Client Secret**
5. Paste into Firebase Console
6. Click **"Save"** ✅

### Facebook OAuth
1. In Authentication → **"Sign-in method"**
2. Click **"Facebook"**
3. Toggle **"Enable"**
4. You need Facebook App ID:
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Click **"Create App"** → **"Consumer"**
   - App name: `pdf-merger`
   - App contact email: your email
   - Create app
   - Copy **App ID** and **App Secret**
5. Set up OAuth Redirect URI:
   - In Facebook App → **Settings** → **Basic**
   - Copy OAuth Redirect URI from Firebase Console
   - Go to Facebook App → **Settings** → **Basic** → **App Domains**
   - Add domain (e.g., `localhost:5173`)
6. Paste App ID and Secret into Firebase Console
7. Click **"Save"** ✅

---

## Step 3: Create Firestore Database

1. Go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. **Location:** Select closest to you
4. **Security Rules:** Select **"Start in test mode"** (change later for production)
5. Click **"Create"**
6. Wait for database creation ✅

---

## Step 4: Create Cloud Storage Bucket

1. Go to **Storage** (left sidebar)
2. Click **"Get Started"**
3. **Location:** Same as Firestore
4. **Security Rules:** Start with test rules (change for production)
5. Click **"Create"** ✅

---

## Step 5: Get Firebase Credentials

1. Go to **Project Settings** (gear icon, top right)
2. Go to **"General"** tab
3. Scroll to **"Your apps"**
4. Click **"< / >"** (Web)
5. Enter app name: `pdf-merger-web` → **"Register app"**
6. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## Step 6: Configure `.env.local`

1. In workspace root, go to `/web` folder
2. Create new file: `.env.local` (copy from `.env.example`)
3. Fill in credentials from Step 5:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Application Configuration
VITE_MAX_FILE_SIZE_MB=100
VITE_CLIENT_SIDE_THRESHOLD_MB=50
VITE_API_BASE_URL=http://localhost:5001
```

---

## Step 7: Update Security Rules

### Firestore Rules

1. Go to **Firestore Database** → **Rules**
2. Replace with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - read own profile, write own profile
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Files collection - read/write own files
    match /files/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }

    // Operations collection - read/write own operations
    match /operations/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

3. Click **"Publish"** ✅

### Storage Rules

1. Go to **Storage** → **Rules**
2. Replace with:

```storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Files folder - read/write own files only
    match /files/{uid}/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

3. Click **"Publish"** ✅

---

## Step 8: Test Authentication

1. Open terminal in `/web` folder:
   ```bash
   npm run dev
   ```

2. Open browser: `http://localhost:5173`

3. Test authentication:
   - Click **"Get Started"**
   - Try **"Sign in with Google"** ✅
   - Try **"Sign in with GitHub"** ✅
   - Try **"Sign in with Facebook"** ✅

---

## Troubleshooting

### Error: "API key has client restrictions"
**Solution:** Go to Firebase Console → API keys → Click the default key → Restrict to "None" temporarily (add restrictions later for security)

### Error: "OAuth redirect URI mismatch"
**Solution:** Make sure callback URL matches exactly in both Firebase Console and GitHub/Facebook settings

### Error: "CORS issue when uploading"
**Solution:** This is expected during development. Update Storage rules to allow test access.

### Error: "User cancelled login"
**Solution:** This is normal. User closed the OAuth popup. Try again.

---

## Local Development Setup Complete! 🎉

You can now:
- ✅ Run dev server: `npm run dev`
- ✅ Test authentication with 3 providers
- ✅ Upload files to Cloud Storage
- ✅ Save/read data from Firestore
- ✅ Test PDF operations locally

---

## Production Deployment (Later)

When ready to deploy:

1. **Update Firebase Console URL:**
   - Go to Authentication → Sign-in method → Authorized domains
   - Add your production domain

2. **Tighten Security Rules:**
   - Replace test rules with production-grade rules
   - Validate data types and sizes
   - Implement rate limiting

3. **Deploy to Firebase Hosting:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy
   ```

4. **Update environment variables** for production domain

---

## Need Help?

- [Firebase Docs](https://firebase.google.com/docs)
- [Google OAuth Setup](https://firebase.google.com/docs/auth/web/google-signin)
- [GitHub OAuth Setup](https://firebase.google.com/docs/auth/web/github-auth)
- [Facebook OAuth Setup](https://firebase.google.com/docs/auth/web/facebook-login)
