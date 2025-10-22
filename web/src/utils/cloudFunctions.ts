/**
 * Cloud Function Utilities
 * Client-side helpers for calling server-side conversion functions
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

interface ConversionResponse {
  success: boolean;
  pdfUrl?: string;
  fileName?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Convert a single file to PDF
 * Calls the convertToPDF cloud function
 */
export async function convertFileToPDF(
  sourceFileUrl: string,
  sourceFileName: string,
  sourceFileType: string
): Promise<ConversionResponse> {
  try {
    const convertToPDF = httpsCallable(functions, 'convertToPDF');

    const result = await convertToPDF({
      sourceFileUrl,
      sourceFileName,
      sourceFileType,
    });

    return result.data as ConversionResponse;
  } catch (error) {
    console.error('Conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
}

/**
 * Convert multiple files to PDF in batch
 * Calls the batchConvertToPDF cloud function
 */
export async function batchConvertToPDF(
  conversions: Array<{
    sourceFileUrl: string;
    sourceFileName: string;
    sourceFileType: string;
  }>
): Promise<ConversionResponse[]> {
  try {
    const batchConvertToPDF = httpsCallable(functions, 'batchConvertToPDF');

    const result = await batchConvertToPDF({
      conversions: conversions.map(c => ({
        ...c,
        userId: '', // Will be set by cloud function via context.auth
      })),
    });

    const response = result.data as { results: ConversionResponse[] };
    return response.results;
  } catch (error) {
    console.error('Batch conversion error:', error);
    return [
      {
        success: false,
        error: error instanceof Error ? error.message : 'Batch conversion failed',
      },
    ];
  }
}

/**
 * Determine if a file requires server-side conversion
 */
export function requiresServerConversion(mimeType: string): boolean {
  const serverConversionTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
  ];

  return serverConversionTypes.includes(mimeType);
}

/**
 * Get human-readable status message
 */
export function getConversionStatusMessage(status: string, fileName?: string): string {
  const messages: Record<string, string> = {
    'pending': 'Waiting to convert...',
    'processing': 'Converting file...',
    'uploading': 'Uploading converted file...',
    'completed': `Successfully converted ${fileName}`,
    'failed': 'Conversion failed',
  };

  return messages[status] || 'Converting...';
}

/**
 * Cancel ongoing conversion (if supported)
 */
export async function cancelConversion(conversionId: string): Promise<boolean> {
  try {
    // Future enhancement: implement cancellation
    console.log(`Cancelling conversion: ${conversionId}`);
    return true;
  } catch (error) {
    console.error('Cancel error:', error);
    return false;
  }
}

/**
 * Monitor conversion progress (poll-based)
 */
export async function monitorConversionProgress(
  _conversionId: string,
  onProgress?: (progress: number) => void
): Promise<ConversionResponse> {
  return new Promise((_resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes with 1s polling

    const pollInterval = setInterval(async () => {
      attempts++;

      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        reject(new Error('Conversion timeout'));
        return;
      }

      // Simulate progress
      const progress = Math.min(50 + (attempts / maxAttempts) * 50, 99);
      onProgress?.(progress);

      // In production, check actual status via Firestore
      // For now, just wait for completion
    }, 1000);

    // This is a simplified version - full implementation would:
    // 1. Query Firestore for conversion status
    // 2. Update progress callbacks
    // 3. Resolve when complete
  });
}

export default {
  convertFileToPDF,
  batchConvertToPDF,
  requiresServerConversion,
  getConversionStatusMessage,
  cancelConversion,
  monitorConversionProgress,
};
