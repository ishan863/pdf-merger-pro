# Firebase Credentials Setup - Step by Step 🔑

This guide will help you get your Firebase project configured locally.

---

## Step 1: Create Firebase Project (5 minutes)

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Click **"Add Project"** (top left)
3. Enter name: `pdf-merger`
4. Uncheck "Enable Google Analytics" (optional)
5. Click **"Create Project"**
6. Wait for project creation (~30 seconds)

---

## Step 2: Enable Required Services

### Enable Firestore
1. Left sidebar → **"Build"** → **"Firestore Database"**
2. Click **"Create Database"**
3. Select region: **`us-central1`** (or nearest region)
4. Select **"Production mode"**
5. Click **"Create"**
6. Wait for creation (~2 minutes)

### Enable Cloud Storage
1. Left sidebar → **"Build"** → **"Storage"**
2. Click **"Get Started"**
3. Select **"Production rules"**
4. Bucket location: **`us-central1`** (match Firestore)
5. Click **"Done"**

### Enable Authentication
1. Left sidebar → **"Build"** → **"Authentication"**
2. Click **"Get Started"**
3. Click **"Email/Password"** (under "Native providers")
4. Toggle **"Enable"**
5. Click **"Save"**

### Enable Cloud Functions
1. Left sidebar → **"Build"** → **"Functions"**
2. Click **"Get Started"**
3. Read the info and click **"Continue to console"**

---

## Step 3: Get Firebase Credentials

### Get Web API Key & Config
1. Go to **Project Settings** (⚙️ icon, top right)
2. Click **"General"** tab (if not already selected)
3. Scroll down to **"Your apps"** section
4. If no app exists, click **"Add app"** → Select **"Web"** (</> icon)
5. Enter app name: `pdf-merger-web`
6. Check **"Also set up Firebase Hosting"** (optional)
7. Click **"Register app"**
8. Copy the config (you'll see a large JSON block):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "pdf-merger-xxxx",
  storageBucket: "pdf-merger-xxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

**Save this config!** You'll need it next.

---

## Step 4: Create `.firebaserc` File

In your project root (`c:\Users\R A J A\Pyton_proj\pdf_merger\`), create a file named `.firebaserc`:

```json
{
  "projects": {
    "default": "YOUR_PROJECT_ID"
  }
}
```

**Replace `YOUR_PROJECT_ID`** with your actual project ID (from the config above, it's the `projectId` field).

Example:
```json
{
  "projects": {
    "default": "pdf-merger-12345"
  }
}
```

---

## Step 5: Create `.env.local` File

In your project root, create a file named `.env.local` and paste your Firebase config:

```env
# Firebase Config
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx
```

**Replace all values** from the config you copied in Step 3.

Example:
```env
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=pdf-merger-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pdf-merger-12345
VITE_FIREBASE_STORAGE_BUCKET=pdf-merger-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## Step 6: Verify Setup

Run this command to verify Firebase CLI can access your project:

```bash
firebase projects:list
```

Expected output:
```
✓ pdf-merger-12345
```

If you see your project, you're ready! ✅

---

## Step 7: Deploy Security Rules & Functions

Once credentials are set up, run:

```bash
# Windows
.\scripts\setup-firestore.bat

# macOS/Linux
bash scripts/setup-firestore.sh
```

This will:
- Deploy Firestore security rules
- Deploy Cloud Storage rules
- Deploy Cloud Functions
- Initialize Firestore collections

---

## Troubleshooting

### Firebase CLI says "No project"
- Check `.firebaserc` has correct `projectId`
- Run: `firebase use --add` and select your project
- Run: `firebase projects:list` to verify

### Credentials not working in app
- Verify all values in `.env.local` match Firebase config exactly
- Check spelling (especially `FIREBASE` prefix)
- Restart dev server: `npm run dev`
- Clear browser cache/cookies
- Check browser console for 403/401 errors

### "Permission denied" errors
- Security rules may be too strict
- Run: `firebase deploy --only firestore:rules`
- Or wait a minute for rules to propagate

### Can't find Firebase Console
- Direct URL: https://console.firebase.google.com/
- May need to log in with same Google account

---

## Quick Checklist

- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Cloud Storage enabled
- [ ] Authentication enabled
- [ ] Cloud Functions enabled
- [ ] `.firebaserc` created with project ID
- [ ] `.env.local` created with credentials
- [ ] `firebase projects:list` shows your project
- [ ] Ready to deploy! ✅

---

## Next Steps

Once this is done:
1. Run setup script: `.\scripts\setup-firestore.bat`
2. Check Firebase Console > Firestore for 6 collections
3. Test file upload and conversion
4. Verify features working

**Need help?** Check `FIRESTORE_SETUP_COMPLETE.md` for detailed guides.

