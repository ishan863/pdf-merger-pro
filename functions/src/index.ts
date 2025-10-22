import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// Express app for HTTP functions
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Prepare signed upload URL
 */
app.post('/prepare-upload', async (req, res) => {
  try {
    const { uid, fileName } = req.body;

    if (!uid || !fileName) {
      return res.status(400).json({ error: 'Missing uid or fileName' });
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const bucket = storage.bucket();
    const file = bucket.file(`users/${uid}/files/${fileId}`);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Create file document in Firestore
    await db.collection('files').doc(fileId).set({
      id: fileId,
      owner: uid,
      originalName: fileName,
      size: 0,
      mime: 'application/pdf',
      pageCount: 0,
      uploadedAt: admin.firestore.Timestamp.now(),
      status: 'uploading',
      operations: [],
      metadata: {},
    });

    return res.json({ fileId, uploadUrl: url });
  } catch (error) {
    console.error('Error in prepare-upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get job status
 */
app.get('/job-status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const doc = await db.collection('operations').doc(jobId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json(doc.data());
  } catch (error) {
    console.error('Error in job-status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Trigger on file upload
 */
export const onFileUpload = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    if (!filePath || !filePath.startsWith('users/')) {
      return;
    }

    const parts = filePath.split('/');
    const uid = parts[1];
    const fileId = parts[3];

    try {
      // Update file metadata
      const bucket = storage.bucket();
      const file = bucket.file(filePath);
      const [metadata] = await file.getMetadata();

      await db.collection('files').doc(fileId).update({
        size: metadata.size,
        status: 'ready',
        uploadedAt: admin.firestore.Timestamp.now(),
      });

      console.log(`File ${fileId} uploaded successfully for user ${uid}`);
    } catch (error) {
      console.error(`Error processing upload for file ${fileId}:`, error);

      // Update file status to error
      await db.collection('files').doc(fileId).update({
        status: 'error',
        error: 'Failed to process upload',
      });
    }
  });

// Export HTTP functions
export const api = functions.https.onRequest(app);

console.log('Cloud Functions initialized');
