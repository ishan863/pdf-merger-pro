/**
 * Cloud Function: Server-Side PDF Conversions
 * Converts Word, Excel, PowerPoint to PDF using LibreOffice
 * 
 * Deploy with: firebase deploy --only functions
 * 
 * Requires:
 * - LibreOffice headless installed on the Cloud Function environment
 * - OR use Cloudinary/Pandoc API as fallback
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomBytes } from 'crypto';

const execAsync = promisify(exec);
const storage = admin.storage();
const db = admin.firestore();

interface ConversionRequest {
  userId: string;
  sourceFileUrl: string;
  sourceFileName: string;
  sourceFileType: string;
  destinationType: 'word' | 'excel' | 'powerpoint';
}

/**
 * HTTP Cloud Function for converting files to PDF
 * Call from client: POST /convertToPDF with { sourceBucket, sourceFile, fileType }
 */
export const convertToPDF = functions.https.onCall(
  async (data: ConversionRequest, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userId = context.auth.uid;
    const { sourceFileUrl, sourceFileName, sourceFileType } = data;

    try {
      // Validate file type
      const validTypes = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
      if (!validTypes.includes(sourceFileType.toLowerCase())) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Unsupported file type: ${sourceFileType}`
        );
      }

      // Download source file
      const tmpFile = join(tmpdir(), `${randomBytes(8).toString('hex')}_${sourceFileName}`);
      const bucket = storage.bucket();
      await bucket.file(sourceFileUrl).download({ destination: tmpFile });

      // Convert to PDF
      const pdfPath = tmpFile.replace(/\.[^/.]+$/, '.pdf');
      await convertFileToPDF(tmpFile, pdfPath, sourceFileType);

      // Upload PDF to Cloud Storage
      const pdfFileName = sourceFileName.replace(/\.[^/.]+$/, '.pdf');
      const destinationPath = `conversions/${userId}/${Date.now()}_${pdfFileName}`;

      await bucket.upload(pdfPath, {
        destination: destinationPath,
        metadata: {
          contentType: 'application/pdf',
          metadata: {
            sourceFileName,
            sourceFileType,
            convertedAt: new Date().toISOString(),
            userId,
          },
        },
      });

      // Create signed URL (valid for 7 days)
      const [signedUrl] = await bucket.file(destinationPath).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });

      // Store conversion record in Firestore
      await db.collection('conversions').add({
        userId,
        sourceFileName,
        sourceFileType,
        pdfFileName,
        pdfPath: destinationPath,
        status: 'completed',
        createdAt: new Date(),
        fileSize: 0,
      });

      // Cleanup temporary files
      if (existsSync(tmpFile)) unlinkSync(tmpFile);
      if (existsSync(pdfPath)) unlinkSync(pdfPath);

      return {
        success: true,
        pdfUrl: signedUrl,
        fileName: pdfFileName,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Conversion error:', error);

      // Store error record
      await db.collection('conversions').add({
        userId,
        sourceFileName,
        sourceFileType,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date(),
      });

      throw new functions.https.HttpsError(
        'internal',
        error instanceof Error ? error.message : 'Conversion failed'
      );
    }
  }
);

/**
 * Convert file to PDF using LibreOffice headless
 */
async function convertFileToPDF(inputPath: string, outputPath: string, fileType: string) {
  const command = `libreoffice --headless --convert-to pdf --outdir "${tmpdir()}" "${inputPath}"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log('LibreOffice output:', stdout);

    if (stderr) {
      console.warn('LibreOffice stderr:', stderr);
    }

    // Verify output file exists
    const expectedOutput = inputPath.replace(/\.[^/.]+$/, '.pdf');
    if (!existsSync(expectedOutput)) {
      throw new Error('PDF conversion did not produce output file');
    }

    // Move to desired output path
    const { execSync } = require('child_process');
    execSync(`mv "${expectedOutput}" "${outputPath}"`);
  } catch (error) {
    throw new Error(`LibreOffice conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Batch conversion function
 * Converts multiple files in sequence
 */
export const batchConvertToPDF = functions.https.onCall(
  async (data: { conversions: ConversionRequest[] }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const results: any[] = [];

    for (const conversionRequest of data.conversions) {
      try {
        const result = await handleConversionRequest(conversionRequest, context);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({
          success: false,
          fileName: conversionRequest.sourceFileName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { results };
  }
);

/**
 * Handle individual conversion request
 */
async function handleConversionRequest(data: ConversionRequest, context: functions.https.CallableContext) {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
  }

  const userId = context.auth.uid;
  const { sourceFileUrl, sourceFileName, sourceFileType } = data;

  try {
    // Validate file type
    const validTypes = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
    if (!validTypes.includes(sourceFileType.toLowerCase())) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Unsupported file type: ${sourceFileType}`
      );
    }

    // Download source file
    const tmpFile = join(tmpdir(), `${randomBytes(8).toString('hex')}_${sourceFileName}`);
    const bucket = storage.bucket();
    await bucket.file(sourceFileUrl).download({ destination: tmpFile });

    // Convert to PDF
    const pdfPath = tmpFile.replace(/\.[^/.]+$/, '.pdf');
    await convertFileToPDF(tmpFile, pdfPath, sourceFileType);

    // Upload PDF to Cloud Storage
    const pdfFileName = sourceFileName.replace(/\.[^/.]+$/, '.pdf');
    const destinationPath = `conversions/${userId}/${Date.now()}_${pdfFileName}`;

    await bucket.upload(pdfPath, {
      destination: destinationPath,
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          sourceFileName,
          sourceFileType,
          convertedAt: new Date().toISOString(),
          userId,
        },
      },
    });

    // Create signed URL (valid for 7 days)
    const [signedUrl] = await bucket.file(destinationPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // Store conversion record in Firestore
    await db.collection('conversions').add({
      userId,
      sourceFileName,
      sourceFileType,
      pdfFileName,
      pdfPath: destinationPath,
      status: 'completed',
      createdAt: new Date(),
      fileSize: 0,
    });

    // Cleanup temporary files
    if (existsSync(tmpFile)) unlinkSync(tmpFile);
    if (existsSync(pdfPath)) unlinkSync(pdfPath);

    return {
      pdfUrl: signedUrl,
      fileName: pdfFileName,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Conversion error:', error);

    // Store error record
    await db.collection('conversions').add({
      userId,
      sourceFileName,
      sourceFileType,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      createdAt: new Date(),
    });

    throw error;
  }
}

/**
 * Scheduled function to clean up old conversions (older than 7 days)
 */
export const cleanupOldConversions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const snapshot = await db
      .collection('conversions')
      .where('createdAt', '<', sevenDaysAgo)
      .limit(100)
      .get();

    const batch = db.batch();
    const bucket = storage.bucket();

    for (const doc of snapshot.docs) {
      const { pdfPath } = doc.data();

      // Delete file from storage
      if (pdfPath) {
        await bucket.file(pdfPath).delete().catch(err => {
          console.warn(`Failed to delete file ${pdfPath}:`, err);
        });
      }

      // Delete document
      batch.delete(doc.ref);
    }

    await batch.commit();

    return `Deleted ${snapshot.docs.length} old conversion records`;
  });
