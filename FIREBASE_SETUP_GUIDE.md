# 🔥 Firebase Setup Guide - Complete Step-by-Step

## Overview
This guide walks you through creating a new Firebase project and configuring it for the PDF Merger application.

---

## Part 1: Create Firebase Project

### Step 1: Go to Firebase Console
1. Open your browser and go to: **https://console.firebase.google.com/**
2. Sign in with your Google account
3. Click **"Add project"** or **"Create a project"**

### Step 2: Configure Project Settings

#### Page 1: Project Name
- **Project name:** Enter a name (e.g., `pdf-merger-app`)
- Click **Continue**

#### Page 2: Google Analytics (Optional)
- **Enable Google Analytics:** Toggle ON (recommended) or OFF
  - If ON: You'll link to an existing GA account or create new one
  - If OFF: Skip directly to project creation
- Click **Continue** or **Create project**

#### Page 3: Google Analytics Account (if enabled)
- **Select or create account:** Choose existing or create new
- **Accept terms and conditions:** Check the boxes
- Click **Create project**

⏳ Wait 30-60 seconds for Firebase to create your project

### Step 3: Project Created ✅
- Click **Continue** when you see "Your new project is ready"

---

## Part 2: Enable Firebase Features

### A. Enable Authentication

1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab

#### Enable Google Sign-In
1. Click **"Google"**
2. Toggle **"Enable"** to ON
3. **Project support email:** Select your email from dropdown
4. Click **"Save"**

#### Enable GitHub Sign-In (Optional)
1. Click **"GitHub"**
2. Toggle **"Enable"** to ON
3. You'll need to create a GitHub OAuth App:
   - Go to https://github.com/settings/developers
   - Click **"New OAuth App"**
   - **Application name:** `PDF Merger`
   - **Homepage URL:** `https://your-project-id.firebaseapp.com`
   - **Authorization callback URL:** Copy from Firebase (shown in the GitHub settings panel)
   - Click **"Register application"**
   - Copy **Client ID** and **Client Secret**
4. Paste **Client ID** and **Client Secret** into Firebase
5. Click **"Save"**

#### Enable Facebook Sign-In (Optional)
1. Click **"Facebook"**
2. Toggle **"Enable"** to ON
3. You'll need Facebook App credentials (requires Facebook Developer account)
4. For now, you can **skip this** and enable it later

---

### B. Set Up Firestore Database

1. In the left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**

#### Choose Location
- **Location:** Choose closest to your users (e.g., `us-central`, `europe-west`, `asia-south1`)
  - ⚠️ **IMPORTANT:** This cannot be changed later!
- Click **"Next"**

#### Security Rules
- **Start in test mode** (we'll update rules later)
  - This allows read/write for 30 days
- Click **"Enable"**

⏳ Wait 1-2 minutes for Firestore to be provisioned

---

### C. Set Up Cloud Storage

1. In the left sidebar, click **"Build"** → **"Storage"**
2. Click **"Get started"**

#### Security Rules
- **Start in test mode** (we'll update rules later)
- Click **"Next"**

#### Choose Location
- **Location:** Use the **same location** as Firestore (should auto-select)
- Click **"Done"**

⏳ Wait 30-60 seconds for Storage to be ready

---

### D. Enable Firebase Hosting

1. In the left sidebar, click **"Build"** → **"Hosting"**
2. Click **"Get started"**
3. Follow the setup wizard (or skip for now)
   - You'll deploy later using the Firebase CLI

---

## Part 3: Get Your Firebase Configuration

### Step 1: Register Web App

1. Go to **Project Overview** (click the home icon at top of sidebar)
2. Click **"Add app"** or the **"Web icon" (</>)**
3. **App nickname:** Enter a name (e.g., `PDF Merger Web`)
4. **Firebase Hosting:** Check the box if you want to set it up now
5. Click **"Register app"**

### Step 2: Copy Configuration Values

You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

📋 **COPY THESE VALUES** - You'll need them in the next step!

---

## Part 4: Configure Your Application

### Step 1: Create Environment File

1. Open your project folder in VS Code
2. Navigate to the `web` folder
3. Create a new file called **`.env.local`**

### Step 2: Add Configuration

Copy this template and replace the values with your Firebase config:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Step 3: Save the File

- Save the file as `web/.env.local`
- ⚠️ **DO NOT commit this file to Git** (it's already in `.gitignore`)

---

## Part 5: Update Security Rules

### A. Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // File metadata - users can only access their own files
    match /files/{fileId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Operation logs
    match /operations/{operationId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### B. Cloud Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace the rules with this:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User files - organized by userId
    match /users/{userId}/{allPaths=**} {
      // Allow read/write only to file owner
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Validate file size (max 100MB)
      allow write: if request.resource.size < 100 * 1024 * 1024;
      
      // Validate PDF mime type
      allow write: if request.resource.contentType == 'application/pdf';
    }
  }
}
```

3. Click **"Publish"**

---

## Part 6: Test Your Configuration

### Step 1: Start Development Server

```bash
cd web
npm run dev
```

### Step 2: Test Authentication

1. Open http://localhost:5173
2. Click **"Login"**
3. Click **"Sign in with Google"**
4. You should be redirected to Google sign-in
5. After signing in, you should be redirected back to the Dashboard

### Step 3: Test File Upload

1. In the Dashboard, drag and drop a PDF file
2. Check Firebase Console:
   - **Storage:** Should see the file under `users/{your-uid}/`
   - **Firestore:** Should see a document in the `files` collection

---

## Part 7: Deploy to Firebase Hosting

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase (if not done)

```bash
firebase init
```

Select:
- **Hosting** (use spacebar to select)
- **Use an existing project** → Select your project
- **Public directory:** `web/dist`
- **Single-page app:** Yes
- **GitHub deploys:** No (for now)

### Step 4: Build and Deploy

```bash
# Build the app
cd web
npm run build

# Deploy to Firebase
cd ..
firebase deploy --only hosting
```

### Step 5: Access Your Live App

Your app will be deployed to:
```
https://your-project-id.web.app
https://your-project-id.firebaseapp.com
```

---

## Quick Reference: What You Need to Provide Me

After creating your Firebase project, provide me with these 6 values:

```
1. API Key: AIzaSy...
2. Auth Domain: your-project.firebaseapp.com
3. Project ID: your-project-id
4. Storage Bucket: your-project.appspot.com
5. Messaging Sender ID: 123456789012
6. App ID: 1:123456789012:web:abc...
```

I'll create the `.env.local` file for you with these values!

---

## Troubleshooting

### Issue: "Firebase not configured"
- **Solution:** Make sure `.env.local` exists in the `web` folder
- Restart the dev server after creating `.env.local`

### Issue: "Permission denied" on file upload
- **Solution:** Check Storage security rules
- Make sure you're signed in

### Issue: "Auth domain not authorized"
- **Solution:** Go to Authentication → Settings → Authorized domains
- Add your localhost and production domains

### Issue: Build errors
- **Solution:** Run `npm run type-check` to see errors
- Make sure all dependencies are installed: `npm install`

---

## Security Checklist

Before going to production:

- [ ] Update Firestore rules (change from test mode)
- [ ] Update Storage rules (change from test mode)
- [ ] Enable App Check for additional security
- [ ] Set up Firebase Emulator for local development
- [ ] Add your production domain to authorized domains
- [ ] Enable reCAPTCHA for authentication
- [ ] Set up billing alerts in Google Cloud Console

---

## Optional: Set Up Cloud Functions

If you want to add server-side processing:

1. Go to **Functions** in Firebase Console
2. Upgrade to Blaze plan (pay-as-you-go)
3. Initialize functions:
   ```bash
   firebase init functions
   ```
4. Choose TypeScript
5. Install dependencies
6. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

---

## Summary

**Firebase Project Setup Checklist:**

- [ ] Create Firebase project
- [ ] Enable Authentication (Google, GitHub, Facebook)
- [ ] Create Firestore database
- [ ] Set up Cloud Storage
- [ ] Enable Firebase Hosting
- [ ] Register web app and get config values
- [ ] Create `web/.env.local` with config
- [ ] Update Firestore security rules
- [ ] Update Storage security rules
- [ ] Test authentication flow
- [ ] Test file upload
- [ ] Deploy to Firebase Hosting

**Status:** Ready for you to create the Firebase project! 🚀

---

## Need Help?

If you encounter any issues:
1. Check the Firebase Console for error messages
2. Look at browser console (F12) for client-side errors
3. Check Firebase documentation: https://firebase.google.com/docs
4. Ask me for help with specific error messages!
