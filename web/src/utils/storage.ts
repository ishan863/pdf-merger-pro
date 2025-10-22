// Storage utilities for Cloud Storage operations

import {
  ref,
  deleteObject,
  getBytes,
  getMetadata,
  uploadBytesResumable,
  UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload file to Cloud Storage
 */
export async function uploadFile(
  userId: string,
  fileId: string,
  blob: Blob,
  metadata?: Record<string, string>
) {
  const storageRef = ref(storage, `users/${userId}/files/${fileId}`);

  const uploadTask = uploadBytesResumable(storageRef, blob, {
    customMetadata: metadata,
  });

  return uploadTask;
}

/**
 * Download file from Cloud Storage
 */
export async function downloadFile(userId: string, fileId: string): Promise<Blob> {
  const storageRef = ref(storage, `users/${userId}/files/${fileId}`);
  const bytes = await getBytes(storageRef);
  return new Blob([bytes], { type: 'application/pdf' });
}

/**
 * Delete file from Cloud Storage
 */
export async function deleteFile(userId: string, fileId: string): Promise<void> {
  const storageRef = ref(storage, `users/${userId}/files/${fileId}`);
  await deleteObject(storageRef);
}

/**
 * Get file metadata from Cloud Storage
 */
export async function getFileMetadata(userId: string, fileId: string) {
  const storageRef = ref(storage, `users/${userId}/files/${fileId}`);
  return getMetadata(storageRef);
}

/**
 * Listen to upload progress
 */
export function listenToUploadProgress(
  uploadTask: UploadTask,
  onProgress: (progress: number) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  return uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress);
    },
    (error) => {
      onError(error);
    },
    () => {
      onComplete();
    }
  );
}
