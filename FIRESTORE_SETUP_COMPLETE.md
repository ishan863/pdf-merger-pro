# Firestore Setup Guide - Complete ✅

This guide covers setting up Firestore for the PDF Merger application with all collections, security rules, and data models.

---

## 📋 Table of Contents

1. [Firebase Project Setup](#firebase-project-setup)
2. [Firestore Collections](#firestore-collections)
3. [Security Rules](#security-rules)
4. [Storage Configuration](#storage-configuration)
5. [Data Models](#data-models)
6. [Deployment Steps](#deployment-steps)
7. [Troubleshooting](#troubleshooting)

---

## 🔥 Firebase Project Setup

### Step 1: Create Firebase Project

```bash
# Go to https://console.firebase.google.com
# Click "Create a project"
# Name it "pdf-merger" (or your preferred name)
# Enable Google Analytics (optional)
# Create the project
```

### Step 2: Enable Services

In Firebase Console:

1. **Firestore Database**
   - Go to: Build > Firestore Database
   - Click "Create database"
   - Start in **Production mode** (we'll lock it with rules)
   - Select region (default: us-central1)
   - Click "Create"

2. **Cloud Storage**
   - Go to: Build > Storage
   - Click "Get started"
   - Accept default bucket name
   - Choose same region as Firestore
   - Click "Done"

3. **Cloud Functions**
   - Go to: Build > Functions
   - Click "Get started" (no code needed yet)
   - Create region: us-central1 (or same as Firestore)

4. **Authentication**
   - Go to: Build > Authentication
   - Click "Get started"
   - Enable "Email/Password" sign-in method
   - Click "Save"

### Step 3: Get Configuration

In Firebase Console:

1. Go to: Project Settings (⚙️ icon, top-left)
2. Go to: "Service Accounts" tab
3. Click "Generate new private key"
4. Save as `firebase-admin-key.json` (add to `.gitignore`)
5. Copy config to `.env.local`:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## 📦 Firestore Collections

### 1. **users** - User Profiles
```
/users/{uid}/
├── email: string
├── displayName: string
├── photoURL: string (optional)
├── createdAt: timestamp
├── updatedAt: timestamp
├── subscription: string (free|pro|team)
└── settings: object
    ├── theme: string (light|dark)
    ├── language: string
    └── notifications: boolean
```

### 2. **files** - PDF Files Metadata
```
/files/{fileId}/
├── name: string
├── owner: string (uid)
├── size: number (bytes)
├── pages: number
├── mimeType: string (application/pdf)
├── uploadedAt: timestamp
├── updatedAt: timestamp
├── lastModified: timestamp
├── tags: array
├── isPublic: boolean
└── metadata: object
    ├── width: number
    ├── height: number
    └── duration: number (if video-like)
```

### 3. **sessions** - User Work Sessions
```
/users/{uid}/sessions/{sessionId}/
├── fileId: string
├── fileName: string
├── createdAt: timestamp
├── lastSaved: timestamp
├── expiresAt: timestamp (auto-delete after 30 days)
├── operations: array
│   ├── type: string (rotate|delete|reorder|merge)
│   ├── pageNumbers: array
│   ├── timestamp: timestamp
│   └── undoable: boolean
└── autoSave: boolean
```

### 4. **conversions** - Server-Side Conversions
```
/conversions/{conversionId}/
├── userId: string
├── inputFileName: string
├── inputMime: string
├── inputSize: number
├── outputFileName: string
├── outputMime: string
├── status: string (pending|processing|completed|failed)
├── consentGiven: boolean
├── createdAt: timestamp
├── completedAt: timestamp (optional)
├── error: string (optional)
└── storageRef: string
```

### 5. **collab_sessions** - Collaboration Sessions
```
/collab_sessions/{sessionId}/
├── docId: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── /participants/{userId}/
    ├── userId: string
    ├── userName: string
    ├── color: string (hex)
    ├── cursor: object
    │   ├── x: number
    │   ├── y: number
    │   └── page: number
    ├── currentPage: number
    ├── isOnline: boolean
    ├── lastSeen: timestamp
    └── role: string (viewer|editor|owner)

└── /changes/{changeId}/
    ├── userId: string
    ├── type: string (rotate|delete|annotate)
    ├── data: object
    ├── timestamp: timestamp
    └── version: number
```

### 6. **annotations** - Saved Annotations
```
/users/{uid}/annotations/{annotationId}/
├── fileId: string
├── pageNumber: number
├── content: array
│   ├── type: string (freehand|line|rectangle|text|highlight)
│   ├── points: array
│   ├── color: string (hex)
│   ├── strokeWidth: number
│   └── text: string (if type=text)
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 7. **shared_sessions** - Public Sharing Links
```
/shared/sessions/{shareToken}/
├── owner: string (uid)
├── fileId: string
├── fileName: string
├── accessLevel: string (view|comment|edit)
├── collaborators: array (uid)
├── public: boolean
├── password: string (hashed, optional)
├── expiresAt: timestamp
├── createdAt: timestamp
└── analytics: object
    ├── views: number
    └── lastAccessed: timestamp
```

### 8. **audit_logs** - Security & Compliance
```
/audit_logs/{logId}/
├── userId: string
├── action: string
├── resource: string
├── resourceId: string
├── changes: object
├── ipAddress: string
├── timestamp: timestamp
└── status: string (success|failed)
```

---

## 🔒 Security Rules

### Firestore Rules (`firestore.rules`)

Your current rules already cover:
- ✅ User profile isolation
- ✅ File ownership verification
- ✅ Session privacy
- ✅ Conversion consent validation
- ✅ Collaborative access
- ✅ Public sharing with expiry
- ✅ Size limits (100MB files, 50MB conversions)
- ✅ Default deny-all rule

### Deploy Firestore Rules

```bash
# From project root
firebase deploy --only firestore:rules
```

### Storage Rules (`storage.rules`)

Your current rules already cover:
- ✅ User file isolation
- ✅ Temporary upload staging
- ✅ Conversion output access
- ✅ Session backup privacy
- ✅ Public share token validation
- ✅ 100MB file size limit
- ✅ 50MB conversion size limit

### Deploy Storage Rules

```bash
# From project root
firebase deploy --only storage
```

---

## 💾 Storage Configuration

### Bucket Structure

```
your-bucket.appspot.com/
├── users/{uid}/
│   ├── files/{fileId}.pdf
│   ├── thumbnails/{fileId}_p{page}.jpg
│   └── backups/{sessionId}.json
├── uploads/
│   └── temp/{uid}/{fileName}
├── conversions/{uid}/{conversionId}/
│   └── {fileName}.pdf
├── sessions/{uid}/{sessionId}/
│   └── {fileName}.backup
└── shared/{shareToken}/
    └── {fileName}
```

### Setup Storage Cleanup

Create a Cloud Function to delete old temporary files:

```bash
firebase deploy --only functions:cleanupOldConversions
```

---

## 📊 Data Models (TypeScript)

### User Profile
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subscription: 'free' | 'pro' | 'team';
  settings: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
}
```

### File Metadata
```typescript
interface FileMetadata {
  id: string;
  name: string;
  owner: string;
  size: number;
  pages: number;
  mimeType: string;
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
  tags: string[];
  isPublic: boolean;
}
```

### Conversion Request
```typescript
interface ConversionRequest {
  id: string;
  userId: string;
  inputFileName: string;
  inputMime: string;
  inputSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  consentGiven: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  error?: string;
}
```

### Collaboration Session
```typescript
interface CollabSession {
  id: string;
  docId: string;
  participants: Map<string, UserPresence>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UserPresence {
  userId: string;
  userName: string;
  color: string;
  cursor?: { x: number; y: number; page: number };
  currentPage: number;
  isOnline: boolean;
  lastSeen: Timestamp;
  role: 'viewer' | 'editor' | 'owner';
}
```

---

## 🚀 Deployment Steps

### Step 1: Initialize Firebase CLI

```bash
npm install -g firebase-tools

firebase login

firebase init
# Choose:
# - Firestore ✓
# - Storage ✓
# - Functions ✓
# - Use existing project ✓
# - Select your "pdf-merger" project
```

### Step 2: Deploy Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### Step 3: Deploy Functions

```bash
# From functions directory
cd functions
npm install
firebase deploy --only functions
```

### Step 4: Create Indexes

Firestore will automatically create indexes for queries. You can also pre-create them:

```bash
# In Firebase Console > Firestore > Indexes > Composite Indexes
# Create index for: conversions (userId, status, createdAt)
# Create index for: files (owner, updatedAt)
# Create index for: users/sessions (fileId, lastSaved)
```

### Step 5: Enable Backup & Recovery

```bash
# In Firebase Console > Backups
# Enable automated daily backups for critical collections
```

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Cloud Storage bucket created
- [ ] Authentication enabled
- [ ] `.env.local` configured with Firebase credentials
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] Cloud Functions deployed
- [ ] Collections created (via app initialization)
- [ ] Backup policies configured
- [ ] Test user created

---

## 🐛 Troubleshooting

### Issue: "Permission denied" errors
**Solution**: 
- Verify user is authenticated
- Check Firestore rules match request
- Test rules in Firebase Console > Firestore > Rules

### Issue: File uploads failing
**Solution**:
- Check Storage bucket permissions
- Verify file size < 100MB (files) or 50MB (conversions)
- Check user UID matches storage path

### Issue: Realtime listeners not firing
**Solution**:
- Ensure document path is correct
- Verify read permissions
- Check network connectivity
- Use `enableIndexedDbPersistence()` for offline support

### Issue: Cloud Functions timeout
**Solution**:
- Increase timeout: set to 540s in console
- Optimize function code
- Use `firebase deploy --only functions --debug`

---

## 📚 Next Steps

1. **Initialize Collections**
   - Run initialization script to create default documents
   
2. **Set Up Indexes**
   - Create composite indexes as app grows
   
3. **Configure Backups**
   - Enable daily automated backups in Firebase Console
   
4. **Monitor Usage**
   - Set up billing alerts for unexpected spikes
   
5. **Test Thoroughly**
   - Test all CRUD operations
   - Verify security rules
   - Load test with multiple concurrent users

---

## 🔗 References

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Cloud Storage Rules](https://firebase.google.com/docs/storage/security)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)

