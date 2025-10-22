/**
 * Firestore Utilities
 * Helper functions for common Firestore operations
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * User Profile Operations
 */
export const UserService = {
  /**
   * Create user profile
   */
  async createProfile(
    uid: string,
    userData: {
      email: string;
      displayName: string;
      photoURL?: string;
    }
  ) {
    const userRef = doc(collection(db, 'users'), uid);
    await setDoc(userRef, {
      uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      subscription: 'free',
      settings: {
        theme: 'light',
        language: 'en',
        notifications: true,
      },
    });
  },

  /**
   * Get user profile
   */
  async getProfile(uid: string) {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    return snapshot.data();
  },

  /**
   * Update user profile
   */
  async updateProfile(uid: string, updates: any) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Update user settings
   */
  async updateSettings(uid: string, settings: any) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      settings: {
        ...(await this.getProfile(uid))?.settings,
        ...settings,
      },
      updatedAt: Timestamp.now(),
    });
  },
};

/**
 * File Operations
 */
export const FileService = {
  /**
   * Create file metadata
   */
  async createFile(fileData: {
    fileId: string;
    name: string;
    owner: string;
    size: number;
    pages: number;
    mimeType?: string;
    tags?: string[];
  }) {
    const fileRef = doc(collection(db, 'files'), fileData.fileId);
    await setDoc(fileRef, {
      ...fileData,
      mimeType: fileData.mimeType || 'application/pdf',
      tags: fileData.tags || [],
      isPublic: false,
      uploadedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Get file metadata
   */
  async getFile(fileId: string) {
    const fileRef = doc(db, 'files', fileId);
    const snapshot = await getDoc(fileRef);
    return snapshot.data();
  },

  /**
   * List user files
   */
  async listUserFiles(uid: string, maxResults = 50) {
    const q = query(
      collection(db, 'files'),
      where('owner', '==', uid),
      orderBy('updatedAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  },

  /**
   * Update file metadata
   */
  async updateFile(fileId: string, updates: any) {
    const fileRef = doc(db, 'files', fileId);
    await updateDoc(fileRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete file metadata
   */
  async deleteFile(fileId: string) {
    const fileRef = doc(db, 'files', fileId);
    await deleteDoc(fileRef);
  },

  /**
   * Search files by tag
   */
  async searchByTag(uid: string, tag: string) {
    const q = query(
      collection(db, 'files'),
      where('owner', '==', uid),
      where('tags', 'array-contains', tag)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  },
};

/**
 * Conversion Operations
 */
export const ConversionService = {
  /**
   * Create conversion request
   */
  async createConversion(conversionData: {
    conversionId: string;
    userId: string;
    inputFileName: string;
    inputMime: string;
    inputSize: number;
    consentGiven: boolean;
  }) {
    const convRef = doc(collection(db, 'conversions'), conversionData.conversionId);
    await setDoc(convRef, {
      ...conversionData,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
  },

  /**
   * Update conversion status
   */
  async updateStatus(
    conversionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    data?: any
  ) {
    const convRef = doc(db, 'conversions', conversionId);
    const updates: any = {
      status,
      updatedAt: Timestamp.now(),
    };

    if (status === 'completed') {
      updates.completedAt = Timestamp.now();
    }

    if (data) {
      Object.assign(updates, data);
    }

    await updateDoc(convRef, updates);
  },

  /**
   * Get user's conversion history
   */
  async getUserConversions(uid: string, maxResults = 50) {
    const q = query(
      collection(db, 'conversions'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  },

  /**
   * Get pending conversions for processing
   */
  async getPendingConversions(maxResults = 10) {
    const q = query(
      collection(db, 'conversions'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};

/**
 * Session Operations
 */
export const SessionService = {
  /**
   * Create user session
   */
  async createSession(
    uid: string,
    sessionData: {
      sessionId: string;
      fileId: string;
      fileName: string;
    }
  ) {
    const sessionRef = doc(
      collection(db, 'users', uid, 'sessions'),
      sessionData.sessionId
    );

    await setDoc(sessionRef, {
      ...sessionData,
      createdAt: Timestamp.now(),
      lastSaved: Timestamp.now(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      operations: [],
      autoSave: true,
    });
  },

  /**
   * Save session state
   */
  async saveSession(
    uid: string,
    sessionId: string,
    operations: any[]
  ) {
    const sessionRef = doc(
      db,
      'users',
      uid,
      'sessions',
      sessionId
    );

    await updateDoc(sessionRef, {
      operations,
      lastSaved: Timestamp.now(),
    });
  },

  /**
   * Get session
   */
  async getSession(uid: string, sessionId: string) {
    const sessionRef = doc(
      db,
      'users',
      uid,
      'sessions',
      sessionId
    );
    const snapshot = await getDoc(sessionRef);
    return snapshot.data();
  },

  /**
   * List user sessions
   */
  async listSessions(uid: string) {
    const q = query(
      collection(db, 'users', uid, 'sessions'),
      orderBy('lastSaved', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Delete session
   */
  async deleteSession(uid: string, sessionId: string) {
    const sessionRef = doc(
      db,
      'users',
      uid,
      'sessions',
      sessionId
    );
    await deleteDoc(sessionRef);
  },
};

/**
 * Batch Operations
 */
export const BatchService = {
  /**
   * Batch update files
   */
  async batchUpdateFiles(updates: Array<{ fileId: string; data: any }>) {
    const batch = writeBatch(db);

    updates.forEach(({ fileId, data }) => {
      const fileRef = doc(db, 'files', fileId);
      batch.update(fileRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  },

  /**
   * Batch delete files
   */
  async batchDeleteFiles(fileIds: string[]) {
    const batch = writeBatch(db);

    fileIds.forEach(fileId => {
      const fileRef = doc(db, 'files', fileId);
      batch.delete(fileRef);
    });

    await batch.commit();
  },

  /**
   * Batch archive conversions
   */
  async batchArchiveConversions(conversionIds: string[]) {
    const batch = writeBatch(db);

    conversionIds.forEach(convId => {
      const convRef = doc(db, 'conversions', convId);
      batch.update(convRef, {
        archived: true,
        archivedAt: Timestamp.now(),
      });
    });

    await batch.commit();
  },
};

/**
 * Audit Logging
 */
export const AuditService = {
  /**
   * Log user action
   */
  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    changes?: any
  ) {
    await setDoc(doc(collection(db, 'audit_logs')), {
      userId,
      action,
      resource,
      resourceId,
      changes: changes || {},
      timestamp: Timestamp.now(),
      status: 'success',
    });
  },

  /**
   * Log error
   */
  async logError(
    userId: string,
    action: string,
    error: Error
  ) {
    await setDoc(doc(collection(db, 'audit_logs')), {
      userId,
      action,
      error: error.message,
      timestamp: Timestamp.now(),
      status: 'failed',
    });
  },

  /**
   * Get user activity
   */
  async getUserActivity(uid: string, days = 7) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const q = query(
      collection(db, 'audit_logs'),
      where('userId', '==', uid),
      where('timestamp', '>=', Timestamp.fromDate(cutoffDate)),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  },
};

export default {
  UserService,
  FileService,
  ConversionService,
  SessionService,
  BatchService,
  AuditService,
};
