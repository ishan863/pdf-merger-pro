/**
 * Action Logger - Firestore Integration
 * Logs user PDF operations with metadata only (no file contents)
 * Data Logged: Session ID, Action, Timestamp, File Stats, Duration
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Generate anonymous session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('pdf_session_id');
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pdf_session_id', sessionId);
  }
  return sessionId;
};

export interface ActionLog {
  userId: string; // Now stores sessionId for anonymous users
  action: 'merge' | 'split' | 'convert' | 'download' | 'page_remove';
  timestamp: any; // Firestore serverTimestamp
  status: 'success' | 'error';
  pages?: number;
  inputSize?: number; // bytes
  outputSize?: number; // bytes
  duration?: number; // milliseconds
  format?: string; // for convert action
  fileCount?: number; // for merge action
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Log action to Firestore
 * @param userId - Current user ID (optional, will use session ID if not provided)
 * @param action - Type of action performed
 * @param data - Action metadata
 */
export const logAction = async (
  userId: string | null | undefined,
  action: ActionLog['action'],
  data: Omit<ActionLog, 'userId' | 'action' | 'timestamp'>
): Promise<void> => {
  try {
    const sessionId = userId || getSessionId();
    
    const logEntry: ActionLog = {
      userId: sessionId,
      action,
      timestamp: serverTimestamp(),
      ...data,
    };

    // Add to Firestore audit_logs collection
    await addDoc(collection(db, 'audit_logs'), logEntry);
    console.log(`✓ Action logged: ${action} for session ${sessionId}`);
  } catch (error) {
    console.error('Failed to log action:', error);
    // Don't throw - logging should not break the app
  }
};

/**
 * Log merge operation
 */
export const logMergeAction = async (
  userId: string | null | undefined,
  fileCount: number,
  totalPages: number,
  inputSize: number,
  outputSize: number,
  duration: number,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> => {
  await logAction(userId, 'merge', {
    status,
    fileCount,
    pages: totalPages,
    inputSize,
    outputSize,
    duration,
    errorMessage,
  });
};

/**
 * Log split operation
 */
export const logSplitAction = async (
  userId: string | null | undefined,
  pages: number,
  inputSize: number,
  outputSize: number,
  duration: number,
  format: string = 'PDF',
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> => {
  await logAction(userId, 'split', {
    status,
    pages,
    inputSize,
    outputSize,
    duration,
    format,
    errorMessage,
  });
};

/**
 * Log convert operation
 */
export const logConvertAction = async (
  userId: string | null | undefined,
  format: string,
  inputSize: number,
  outputSize: number,
  duration: number,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> => {
  await logAction(userId, 'convert', {
    status,
    format,
    inputSize,
    outputSize,
    duration,
    errorMessage,
  });
};

/**
 * Log download operation
 */
export const logDownloadAction = async (
  userId: string | null | undefined,
  format: string,
  fileSize: number,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> => {
  await logAction(userId, 'download', {
    status,
    format,
    outputSize: fileSize,
    errorMessage,
  });
};

/**
 * Log page remove operation
 */
export const logPageRemoveAction = async (
  userId: string,
  originalPages: number,
  removedPages: number,
  outputSize: number,
  duration: number,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> => {
  await logAction(userId, 'page_remove', {
    status,
    pages: originalPages - removedPages,
    inputSize: 0, // Not tracked for page remove
    outputSize,
    duration,
    metadata: {
      originalPages,
      removedPages,
    },
    errorMessage,
  });
};
