/**
 * Firestore Initialization Script
 * Sets up all collections, indexes, and default documents
 * Run this once after deploying rules
 */

import {
  initializeApp,
  cert,
  ServiceAccount,
} from 'firebase-admin/app';
import {
  getFirestore,
  Timestamp,
  FieldValue,
} from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load service account key
const serviceAccountPath = path.join(
  __dirname,
  '../firebase-admin-key.json'
);

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ firebase-admin-key.json not found!');
  console.error('Download from: Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, 'utf-8')
) as ServiceAccount;

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

/**
 * Initialize Firestore collections and documents
 */
async function initializeFirestore() {
  console.log('🚀 Initializing Firestore...\n');

  try {
    // 1. Create system collections
    console.log('📦 Creating collections...');
    await createCollections();

    // 2. Create composite indexes
    console.log('📑 Setting up indexes...');
    await setupIndexes();

    // 3. Initialize default settings
    console.log('⚙️  Initializing settings...');
    await initializeSettings();

    console.log('\n✅ Firestore initialization complete!');
    console.log('📋 Collections created:');
    console.log('   - users');
    console.log('   - files');
    console.log('   - conversions');
    console.log('   - collab_sessions');
    console.log('   - audit_logs');
    console.log('   - settings');

    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Create base collections
 */
async function createCollections() {
  const collections = [
    'users',
    'files',
    'conversions',
    'collab_sessions',
    'audit_logs',
    'settings',
  ];

  for (const collectionName of collections) {
    try {
      // Check if collection exists by trying to read first doc
      const snapshot = await db
        .collection(collectionName)
        .limit(1)
        .get();

      if (snapshot.empty) {
        // Create with a temporary document, then delete it
        const tempDocRef = db
          .collection(collectionName)
          .doc('__temp__');

        await tempDocRef.set(
          {
            createdAt: Timestamp.now(),
          },
          { merge: true }
        );

        console.log(`✓ Created collection: ${collectionName}`);
      } else {
        console.log(`✓ Collection exists: ${collectionName}`);
      }
    } catch (error) {
      console.warn(`⚠️  Could not verify collection ${collectionName}:`, error);
    }
  }
}

/**
 * Setup composite indexes
 * Note: Firestore will auto-create these on first use,
 * but you can pre-create them here for better UX
 */
async function setupIndexes() {
  const indexes = [
    {
      collection: 'files',
      fields: [
        { fieldPath: 'owner', order: 'ASCENDING' },
        { fieldPath: 'updatedAt', order: 'DESCENDING' },
      ],
    },
    {
      collection: 'conversions',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'status', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' },
      ],
    },
    {
      collection: 'audit_logs',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'timestamp', order: 'DESCENDING' },
      ],
    },
  ];

  console.log(`📑 Note: Firestore will auto-create ${indexes.length} indexes on first complex query`);
  console.log('   Pre-create these in Firebase Console if needed:');
  for (const index of indexes) {
    console.log(`   ✓ ${index.collection} (${index.fields.map(f => f.fieldPath).join(', ')})`);
  }
}

/**
 * Initialize default settings and system documents
 */
async function initializeSettings() {
  // Create global settings
  const settingsRef = db.collection('settings').doc('app_config');

  await settingsRef.set(
    {
      version: '1.0.0',
      features: {
        ocr: true,
        collaboration: true,
        sharing: true,
        conversion: {
          clientSide: true,
          serverSide: true,
          maxSize: 52428800, // 50MB
        },
      },
      limits: {
        maxFileSize: 104857600, // 100MB
        maxConversionSize: 52428800, // 50MB
        maxCollaborators: 10,
        maxStoredSessions: 100,
      },
      defaultSettings: {
        theme: 'light',
        language: 'en',
        notifications: true,
      },
      maintenance: {
        enabled: false,
        message: '',
      },
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );

  console.log('✓ App settings initialized');

  // Create conversion status enum reference
  const statusRef = db.collection('settings').doc('conversion_statuses');

  await statusRef.set(
    {
      statuses: [
        'pending',
        'processing',
        'completed',
        'failed',
      ],
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );

  console.log('✓ Conversion statuses initialized');
}

/**
 * Create indexes manifest for documentation
 */
async function createIndexesManifest() {
  const manifest = {
    description: 'Firestore Indexes for PDF Merger',
    indexes: [
      {
        name: 'files_by_owner_updated',
        collection: 'files',
        fields: [
          { name: 'owner', order: 'ASCENDING' },
          { name: 'updatedAt', order: 'DESCENDING' },
        ],
        status: 'auto-created-on-query',
      },
      {
        name: 'conversions_by_user_status',
        collection: 'conversions',
        fields: [
          { name: 'userId', order: 'ASCENDING' },
          { name: 'status', order: 'ASCENDING' },
          { name: 'createdAt', order: 'DESCENDING' },
        ],
        status: 'auto-created-on-query',
      },
      {
        name: 'audit_logs_by_user',
        collection: 'audit_logs',
        fields: [
          { name: 'userId', order: 'ASCENDING' },
          { name: 'timestamp', order: 'DESCENDING' },
        ],
        status: 'auto-created-on-query',
      },
    ],
  };

  const manifestPath = path.join(__dirname, '../.firestore-indexes.json');
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(manifest, null, 2)
  );

  console.log('✓ Indexes manifest created');
}

/**
 * Main execution
 */
if (require.main === module) {
  initializeFirestore().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { initializeFirestore };
