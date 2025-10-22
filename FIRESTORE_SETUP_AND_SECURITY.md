# 🔧 FIRESTORE SETUP & SECURITY RULES

**Date**: October 22, 2025  
**Purpose**: Configure Firestore for action logging  
**Status**: ✅ READY TO IMPLEMENT  

---

## 📊 FIRESTORE COLLECTION SCHEMA

### Collection: `audit_logs`

**Purpose**: Store all user PDF processing actions (metadata only)

**Document Structure**:

```json
{
  "userId": "user_id_123",
  "action": "merge|split|convert|download|page_remove",
  "timestamp": "Firestore ServerTimestamp",
  "status": "success|error",
  
  // Merge specific
  "fileCount": 3,
  "pages": 45,
  "inputSize": 5242880,
  "outputSize": 4194304,
  "duration": 2341,
  
  // Split specific
  "pages": 20,
  "inputSize": 2097152,
  "outputSize": 1048576,
  "duration": 1200,
  
  // Convert specific
  "format": "Image to PDF",
  "inputSize": 3145728,
  "outputSize": 2097152,
  "duration": 1500,
  
  // Download specific
  "format": "PDF",
  "outputSize": 1048576,
  
  // Error info
  "errorMessage": "Failed to process PDF",
  
  // Metadata
  "metadata": {}
}
```

---

## 🔐 FIRESTORE SECURITY RULES

### Implementation Steps

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com
   - Select your project
   - Go to: Firestore Database → Rules

2. **Copy & Paste These Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Audit logs - Users can only read their own logs
    match /audit_logs/{document=**} {
      // Users can read their own logs only
      allow read: if request.auth.uid == resource.data.userId;
      
      // Users can create logs for themselves only
      allow create: if request.auth.uid == request.resource.data.userId 
                   && request.resource.data.timestamp != null
                   && request.resource.data.action in ['merge', 'split', 'convert', 'download', 'page_remove'];
      
      // Don't allow updates or deletes
      allow update, delete: if false;
    }
    
  }
}
```

3. **Click "Publish"**

---

## 📝 SECURITY RULE BREAKDOWN

### Rule 1: Read Access
```javascript
allow read: if request.auth.uid == resource.data.userId;
```
- Only logged-in users can read logs
- Users can only read logs WHERE userId matches their auth.uid
- This ensures users cannot see other users' actions

### Rule 2: Create Access
```javascript
allow create: if request.auth.uid == request.resource.data.userId 
             && request.resource.data.timestamp != null
             && request.resource.data.action in [...]
```
- Only logged-in users can create logs
- The userId in the log must match their auth.uid
- Timestamp must be present
- Action must be one of the allowed types

### Rule 3: Update/Delete Prevention
```javascript
allow update, delete: if false;
```
- Audit logs are immutable
- Once created, cannot be modified or deleted
- Ensures data integrity

---

## 🧪 TESTING SECURITY RULES

### Test 1: User Can Read Own Logs

```javascript
// User 1 reads their own log
db.collection('audit_logs').doc(logId).get()
// ✅ PASS - userId matches auth.uid
```

### Test 2: User Cannot Read Other Logs

```javascript
// User 1 tries to read User 2's log
db.collection('audit_logs').doc(user2LogId).get()
// ❌ FAIL - userId does not match auth.uid
```

### Test 3: User Can Create Log for Themselves

```javascript
// User 1 creates log with their uid
db.collection('audit_logs').add({
  userId: user1.uid,
  action: 'merge',
  timestamp: FieldValue.serverTimestamp(),
  ...
})
// ✅ PASS - userId matches auth.uid
```

### Test 4: User Cannot Create Log for Another User

```javascript
// User 1 tries to create log with User 2's uid
db.collection('audit_logs').add({
  userId: user2.uid,  // Different from logged-in user
  action: 'merge',
  ...
})
// ❌ FAIL - userId does not match auth.uid
```

### Test 5: Cannot Modify Logs

```javascript
// Try to update existing log
db.collection('audit_logs').doc(logId).update({
  status: 'error'
})
// ❌ FAIL - update not allowed
```

---

## 📱 FIRESTORE STRUCTURE IN CONSOLE

```
Firestore Database
└── Collections
    └── audit_logs/
        ├── doc1/
        │   ├── userId: "abc123"
        │   ├── action: "merge"
        │   ├── timestamp: "2025-10-22T14:30:45Z"
        │   ├── status: "success"
        │   ├── fileCount: 3
        │   ├── pages: 45
        │   ├── inputSize: 5242880
        │   ├── outputSize: 4194304
        │   ├── duration: 2341
        │   └── ...
        │
        ├── doc2/
        │   ├── userId: "def456"
        │   ├── action: "split"
        │   ├── timestamp: "2025-10-22T15:00:00Z"
        │   ├── status: "success"
        │   ├── pages: 20
        │   ├── inputSize: 2097152
        │   └── ...
        │
        └── doc3/
            ├── userId: "abc123"
            ├── action: "convert"
            ├── timestamp: "2025-10-22T15:30:15Z"
            ├── status: "error"
            ├── errorMessage: "Invalid image format"
            └── ...
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Step 1: Firebase Project Setup
- [ ] Project created in Firebase Console
- [ ] Firestore Database enabled (production mode)
- [ ] Firebase Authentication enabled

### Step 2: Security Rules
- [ ] Navigate to Firestore Rules tab
- [ ] Copy security rules from above
- [ ] Update rules in console
- [ ] Click "Publish"
- [ ] Rules active (no publish errors)

### Step 3: Test the Setup
- [ ] Perform a merge operation in app
- [ ] Check Firestore console
- [ ] Verify document appears in audit_logs
- [ ] Verify document has correct userId
- [ ] Verify user can see their logs in History page

### Step 4: Multi-User Test
- [ ] Create 2 test accounts
- [ ] User 1 performs merge
- [ ] User 2 performs split
- [ ] Each user logs in and checks History
- [ ] Verify data isolation (each sees only their ops)

### Step 5: Security Verification
- [ ] Firestore rules saved
- [ ] Test queries in Firestore console
- [ ] Verify isolation working

---

## 🧑‍💻 FIRESTORE CONSOLE QUERIES

### Query 1: View All Your Logs
```javascript
db.collection('audit_logs')
  .where('userId', '==', 'your-user-id')
  .orderBy('timestamp', 'desc')
  .limit(50)
  .get()
```

### Query 2: View Your Merge Operations
```javascript
db.collection('audit_logs')
  .where('userId', '==', 'your-user-id')
  .where('action', '==', 'merge')
  .orderBy('timestamp', 'desc')
  .get()
```

### Query 3: View Failed Operations
```javascript
db.collection('audit_logs')
  .where('userId', '==', 'your-user-id')
  .where('status', '==', 'error')
  .orderBy('timestamp', 'desc')
  .get()
```

### Query 4: View Operations by Date Range
```javascript
const startDate = new Date('2025-10-22');
const endDate = new Date('2025-10-23');

db.collection('audit_logs')
  .where('userId', '==', 'your-user-id')
  .where('timestamp', '>=', startDate)
  .where('timestamp', '<=', endDate)
  .orderBy('timestamp', 'desc')
  .get()
```

---

## 📊 ANALYTICS FROM AUDIT LOGS

Once logging is working, you can derive insights:

### User Activity
```javascript
// Most active users
db.collection('audit_logs')
  .groupBy('userId')
  .count()
```

### Feature Usage
```javascript
// Most used features
db.collection('audit_logs')
  .groupBy('action')
  .count()
  
// Result:
// merge: 234 times
// split: 156 times
// convert: 89 times
```

### Performance Metrics
```javascript
// Average merge duration
db.collection('audit_logs')
  .where('action', '==', 'merge')
  .avg('duration')
  // Result: 2341ms average

// Largest file merged
db.collection('audit_logs')
  .where('action', '==', 'merge')
  .max('outputSize')
```

### Error Tracking
```javascript
// Error rate by feature
db.collection('audit_logs')
  .where('status', '==', 'error')
  .groupBy('action')
  .count()

// Most common errors
db.collection('audit_logs')
  .where('status', '==', 'error')
  .groupBy('errorMessage')
  .count()
```

---

## 🚀 DEPLOYMENT

### Before Going Live

1. **Verify Firestore Setup**
   - [ ] Collection exists: `audit_logs`
   - [ ] Security rules deployed
   - [ ] Test document created
   - [ ] App can write logs
   - [ ] App can read own logs

2. **Verify App Integration**
   - [ ] Logger imported in components
   - [ ] Logging calls executed
   - [ ] Firestore receives data
   - [ ] History page shows real data

3. **Performance Check**
   - [ ] Logging doesn't slow down operations
   - [ ] No errors in browser console
   - [ ] Firestore quotas sufficient

4. **Security Verification**
   - [ ] Users can only read own logs
   - [ ] Users cannot modify logs
   - [ ] Logs are immutable
   - [ ] Rules tested and working

---

## 📈 MONITORING & MAINTENANCE

### Weekly Checks
- [ ] Check Firestore storage usage
- [ ] Monitor error rate (target < 1%)
- [ ] Review most common features
- [ ] Check for quota warnings

### Monthly Reviews
- [ ] Analyze user trends
- [ ] Performance baseline (avg merge time)
- [ ] Error analysis
- [ ] Archive old logs (optional)

### Quarterly Planning
- [ ] Capacity planning
- [ ] Cost optimization
- [ ] Feature enhancement
- [ ] Security audit

---

## 🆘 TROUBLESHOOTING

### Problem: "Permission denied" error when logging

**Solution**: Check security rules
```
1. Go to Firestore Rules
2. Verify userId field is included in create payload
3. Verify auth.uid is being used correctly
4. Publish rules again
```

### Problem: Logs not appearing in History page

**Solution**: Verify query and data
```
1. Check browser console for errors
2. Check Firestore console for documents
3. Verify user is logged in
4. Check userId matches in audit_logs
5. Verify query where clause
```

### Problem: Users seeing other users' logs

**Solution**: Security rules not working
```
1. Go to Firestore Rules tab
2. Check "read" rule has userId filter
3. Ensure request.auth.uid check is present
4. Publish rules
5. Clear browser cache
6. Test again
```

### Problem: Firestore quota exceeded

**Solution**: Reduce write volume or upgrade plan
```
1. Check write operations in logs
2. Consider batching updates
3. Review quota in Firebase Console
4. Upgrade to paid plan if needed
```

---

## ✨ SUCCESS CHECKLIST

- [ ] Firestore collection created: `audit_logs`
- [ ] Security rules deployed
- [ ] Logger utility created: `actionLogger.ts`
- [ ] Logger integrated into 3 features (Merge, Split, Convert)
- [ ] Test account created
- [ ] First log created successfully
- [ ] Log appears in Firestore console
- [ ] History page shows real user data
- [ ] Multi-user test passed (data isolated)
- [ ] No permission errors
- [ ] Performance acceptable
- [ ] Ready for production

---

**Status**: 🟢 **READY TO IMPLEMENT**

**Next Steps**:
1. Deploy security rules to Firestore
2. Test logging in app
3. Verify data isolation
4. Deploy to production

---

**Created**: October 22, 2025  
**Version**: 2.0 Pro  
**Status**: ✅ SETUP GUIDE COMPLETE
