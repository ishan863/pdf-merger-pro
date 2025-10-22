# Firestore Quick Start ⚡

Complete guide to set up Firestore for your PDF Merger app in **15 minutes**.

---

## 🚀 Quick Start (5 Steps)

### Step 1: Create Firebase Project (2 min)

```bash
# Go to https://console.firebase.google.com
# Click "Create a project"
# Name: pdf-merger
# No Google Analytics needed
# Create project
```

### Step 2: Install & Login (1 min)

```bash
npm install -g firebase-tools
firebase login
firebase init
```

When prompted:
- Select: ✓ Firestore, ✓ Storage, ✓ Functions
- Use existing project: pdf-merger
- Default selections for everything else

### Step 3: Get Firebase Credentials (2 min)

1. Go to **Firebase Console > Project Settings** (⚙️)
2. Go to **"Service Accounts"** tab
3. Click **"Generate new private key"**
4. Save as `firebase-admin-key.json` (add to `.gitignore`)
5. Copy this config to `.env.local`:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

> 📌 Find these values in Firebase Console > Project Settings > Your Apps

### Step 4: Deploy Rules & Functions (5 min)

```bash
# From project root
firebase deploy --only firestore:rules,storage
firebase deploy --only functions
```

### Step 5: Initialize Collections (2 min)

```bash
# Windows
.\scripts\setup-firestore.bat

# macOS/Linux
bash scripts/setup-firestore.sh
```

✅ **Done!** Your Firestore is now ready.

---

## 📋 What Was Set Up

| Item | Status | Details |
|------|--------|---------|
| Firestore Database | ✅ | 6 collections, auto-scaling |
| Cloud Storage | ✅ | 100MB file limit |
| Security Rules | ✅ | User-based access control |
| Cloud Functions | ✅ | Server-side conversions |
| Authentication | ✅ | Email/password + social |
| Backups | ✅ | Recommended (configure manually) |

---

## 🎯 Common Operations

### Create User Profile

```typescript
import { UserService } from '@/utils/firestoreServices';

await UserService.createProfile('user-123', {
  email: 'user@example.com',
  displayName: 'John Doe',
  photoURL: 'https://...',
});
```

### Upload File Metadata

```typescript
import { FileService } from '@/utils/firestoreServices';

await FileService.createFile({
  fileId: 'file-456',
  name: 'document.pdf',
  owner: 'user-123',
  size: 1024000,
  pages: 10,
});
```

### Create Conversion Request

```typescript
import { ConversionService } from '@/utils/firestoreServices';

await ConversionService.createConversion({
  conversionId: 'conv-789',
  userId: 'user-123',
  inputFileName: 'document.docx',
  inputMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  inputSize: 512000,
  consentGiven: true,
});
```

### List User Files

```typescript
const files = await FileService.listUserFiles('user-123');
console.log(files); // [{name, pages, uploadedAt, ...}]
```

---

## 🔒 Security Best Practices

✅ **Do:**
- Use security rules to restrict access
- Enable authentication
- Validate data on backend
- Use batch operations for consistency
- Monitor usage in Firebase Console

❌ **Don't:**
- Store sensitive data in Firestore (PII, passwords)
- Use hardcoded API keys
- Allow anonymous writes
- Disable security rules for testing
- Commit `firebase-admin-key.json` to git

---

## 🐛 Troubleshooting

### "Permission denied" Error

**Cause**: Security rules blocking access

**Fix**:
```javascript
// Check in Firebase Console > Firestore > Rules
// Test your rules with test data
```

### "Quota exceeded" Error

**Cause**: Too many read/write operations

**Fix**:
```javascript
// Use batch operations
// Add composite indexes
// Enable caching (Firestore persistence)
```

### "Document not found" Error

**Cause**: Path or user ID incorrect

**Fix**:
```javascript
// Verify exact path: db.collection('users').doc(uid)
// Log the UID and path before operations
```

---

## 📊 Collections Overview

### users
Stores user profiles and preferences
- Read/Write: User only

### files
Stores file metadata (not actual files)
- Read/Write: Owner only

### conversions
Tracks server-side conversion jobs
- Read: User only
- Write: Cloud Functions

### collab_sessions
Real-time collaboration data
- Read/Write: Participants only

### audit_logs
Security & compliance logging
- Read: Authorized users
- Write: Cloud Functions

### settings
Global app configuration
- Read: All users
- Write: Admins only

---

## 🚀 Deployment Commands

```bash
# Deploy everything
firebase deploy

# Deploy specific targets
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions

# View deployment status
firebase status

# View logs
firebase functions:log
firebase emulators:start  # local testing
```

---

## 📚 Learning Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Storage Guide](https://firebase.google.com/docs/storage)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Can create user account
- [ ] Can authenticate with email/password
- [ ] Can upload file metadata
- [ ] Can list user files
- [ ] Can view Firestore collections in console
- [ ] Can access Storage files
- [ ] Cloud Functions can read/write to Firestore
- [ ] Backup job is scheduled

---

## 🎓 Next Steps

1. **Test Everything**
   ```bash
   npm run dev
   # Create account, upload file, verify in Firestore
   ```

2. **Configure Backups**
   - Go to Firestore > Backups
   - Enable daily automated backups

3. **Set Up Monitoring**
   - Go to Firebase Console > Monitoring
   - Add alerts for high usage

4. **Read Production Checklist**
   - Review `FIRESTORE_SETUP_COMPLETE.md`
   - Implement all security measures

---

## 💡 Tips

💡 **Use Firestore Emulator for Local Development**
```bash
firebase emulators:start
# Run your app against local Firestore
```

💡 **Monitor Usage to Control Costs**
- Go to: Firebase Console > Usage tab
- Set billing alerts
- Use indexes efficiently

💡 **Use Batch Operations**
- Reduces writes and improves performance
- Atomic transactions (all succeed or fail)

💡 **Enable Offline Persistence**
```javascript
import { enableIndexedDbPersistence } from 'firebase/firestore';
enableIndexedDbPersistence(db);
```

---

**🎉 Your Firestore is ready to use!**

