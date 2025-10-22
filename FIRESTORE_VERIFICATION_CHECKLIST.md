# Firestore Setup Verification Checklist ✅

Complete this checklist to verify your Firestore is properly configured.

---

## 🔐 Phase 1: Authentication & Credentials

- [ ] Firebase project created at console.firebase.google.com
- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Logged in to Firebase CLI (`firebase login`)
- [ ] `.firebaserc` created with project reference
- [ ] `firebase.json` created with configurations
- [ ] `firebase-admin-key.json` downloaded and saved
- [ ] `.env.local` populated with Firebase credentials:
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
- [ ] `.gitignore` includes `firebase-admin-key.json`

---

## 🔥 Phase 2: Firestore Database

- [ ] Firestore Database created in Firebase Console
- [ ] Database region: `us-central1` (or your chosen region)
- [ ] Started in **Production mode** with security rules
- [ ] Security rules deployed:
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] Collections visible in Firestore console:
  - [ ] users
  - [ ] files
  - [ ] conversions
  - [ ] collab_sessions
  - [ ] audit_logs
  - [ ] settings

---

## 💾 Phase 3: Cloud Storage

- [ ] Cloud Storage bucket created
- [ ] Bucket region matches Firestore region
- [ ] Storage rules deployed:
  ```bash
  firebase deploy --only storage
  ```
- [ ] Folder structure exists:
  - [ ] users/
  - [ ] uploads/temp/
  - [ ] conversions/
  - [ ] sessions/
  - [ ] shared/

---

## ⚙️ Phase 4: Cloud Functions

- [ ] Functions directory created
- [ ] Dependencies installed: `cd functions && npm install`
- [ ] Cloud Functions deployed:
  ```bash
  firebase deploy --only functions
  ```
- [ ] Functions visible in Firebase Console:
  - [ ] convertToPDF
  - [ ] batchConvertToPDF
  - [ ] cleanupOldConversions

---

## 🔑 Phase 5: Authentication

- [ ] Authentication enabled in Firebase Console
- [ ] Email/Password sign-in method enabled
- [ ] Optional: Social login configured (Google, GitHub)
- [ ] Test user created in Firebase Console
- [ ] Authentication rules applied

---

## 📝 Phase 6: Data & Indexes

- [ ] Collections initialized (auto-created on first write)
- [ ] Composite indexes created:
  - [ ] files (owner, updatedAt)
  - [ ] conversions (userId, status, createdAt)
  - [ ] audit_logs (userId, timestamp)
- [ ] App settings document created at `settings/app_config`
- [ ] Conversion statuses reference created at `settings/conversion_statuses`

---

## 🧪 Phase 7: Functionality Testing

### Authentication
- [ ] Can sign up with email
- [ ] Can sign in with email/password
- [ ] Can sign out
- [ ] Can reset password
- [ ] User ID appears in Firestore

### File Operations
- [ ] Can create file metadata
- [ ] Can read file metadata
- [ ] Can update file metadata
- [ ] Can list user files
- [ ] Can delete file metadata
- [ ] Can search files by tag

### Conversion Operations
- [ ] Can create conversion request
- [ ] Can update conversion status
- [ ] Can retrieve conversion history
- [ ] Pending conversions queue works

### Session Operations
- [ ] Can create work session
- [ ] Can save session state
- [ ] Can retrieve session
- [ ] Can list sessions
- [ ] Can delete session

### Batch Operations
- [ ] Batch update succeeds
- [ ] Batch delete succeeds
- [ ] Transactions are atomic

### Real-time Listeners
- [ ] File changes trigger listener
- [ ] User presence updates
- [ ] Change events broadcast

---

## 🔒 Phase 8: Security Verification

### Test Security Rules (in Firebase Console)

1. **User Profile Access**
   - [ ] Can read own profile
   - [ ] Cannot read other user profiles
   - [ ] Can update own profile
   - [ ] Cannot update other profiles

2. **File Access**
   - [ ] Can read own files
   - [ ] Cannot read other user files
   - [ ] Can create files (with size limit)
   - [ ] Cannot exceed file size limit

3. **Conversion Access**
   - [ ] Can read own conversions
   - [ ] Cannot read other user conversions
   - [ ] Can only create with consent flag
   - [ ] Cannot create with oversized files

4. **Session Access**
   - [ ] Can read own sessions
   - [ ] Cannot read other user sessions
   - [ ] Can update own sessions
   - [ ] Cannot modify others' sessions

---

## 📊 Phase 9: Monitoring & Performance

- [ ] Firebase Console > Usage tab displays data
- [ ] Read/Write operations are tracked
- [ ] Storage usage is visible
- [ ] Cloud Functions executions show
- [ ] No excessive quota usage
- [ ] Response times are acceptable (<500ms)

---

## 🔄 Phase 10: Backup & Recovery

- [ ] Automated backups enabled
- [ ] Backup schedule: Daily
- [ ] Backup retention: 7+ days
- [ ] Can access backup history in console
- [ ] Tested restoration process

---

## 📱 Phase 11: Production Readiness

- [ ] Rate limiting configured (if needed)
- [ ] Audit logging enabled
- [ ] Error logging set up
- [ ] Performance monitoring active
- [ ] Billing alerts configured
- [ ] Team members have appropriate access levels
- [ ] Documentation updated with setup info

---

## 🐛 Phase 12: Common Issues Fixed

- [ ] No "Permission denied" errors
- [ ] No "Quota exceeded" messages
- [ ] No timeout issues
- [ ] No duplicate data
- [ ] No missing indexes (slow queries fixed)
- [ ] All tests pass

---

## 📋 Test Script Verification

Run the setup verification:

```bash
# Windows
.\scripts\setup-firestore.bat

# macOS/Linux
bash scripts/setup-firestore.sh
```

- [ ] Script completes without errors
- [ ] All rules deployed successfully
- [ ] Functions deployed successfully
- [ ] Collections initialized

---

## 🎯 Final Checklist

- [ ] All phases completed
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Team trained on Firestore
- [ ] Monitoring in place
- [ ] Backups scheduled
- [ ] Ready for production

---

## 📞 Support

If any item fails, refer to:
- `FIRESTORE_SETUP_COMPLETE.md` - Full documentation
- `FIRESTORE_QUICKSTART.md` - Quick reference
- Firebase Console - Real-time status
- `functions/` - Cloud Functions source code

---

## ✅ Sign-Off

- [ ] Verified by: _______________
- [ ] Date: _______________
- [ ] Environment: [ ] Development [ ] Staging [ ] Production

---

**Firestore setup is complete and verified!** 🎉

