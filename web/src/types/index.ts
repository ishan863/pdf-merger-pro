// Type definitions for the PDF Merger application

export type UserRole = 'free' | 'pro' | 'enterprise' | 'admin';

export type FileStatus = 'uploaded' | 'processing' | 'ready' | 'error';

export type OperationType = 'merge' | 'split' | 'extract' | 'rotate' | 'compress' | 'ocr' | 'watermark' | 'redact';

export interface User {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role?: UserRole;
  plan?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PDFFile {
  id: string;
  name: string; // User-facing filename
  blob?: Blob; // In-memory blob for client-side processing
  size: number;
  type?: string;
  pages?: number; // Page count
  uploadedAt: Date;
  status: FileStatus;
  url?: string;
  processedUrl?: string;
  error?: string;
}

export interface FileOperation {
  opId: string;
  type: OperationType;
  params: Record<string, unknown>;
  startedAt: Date;
  finishedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    fileId: string;
    url: string;
  };
  error?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  bytesUploaded: number;
  bytesTotal: number;
  percentComplete: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface PageRange {
  pages: number[];
}

export interface PDFPage {
  pageNumber: number;
  thumbnailUrl?: string;
  rotationDegrees: number;
  isDeleted: boolean;
  isSelected: boolean;
}

export interface ExtractParams {
  fileId: string;
  pages: number[];
  fileName: string;
}

export interface MergeParams {
  fileIds: string[];
  order: number[];
  fileName: string;
}

export interface SplitParams {
  fileId: string;
  splitPoints: number[];
  fileNameTemplate: string;
}

export interface RotateParams {
  fileId: string;
  pages: number[];
  degrees: 90 | 180 | 270 | -90 | -180 | -270;
}

export interface CompressParams {
  fileId: string;
  quality: 'low' | 'medium' | 'high';
  imageQuality: number;
}

export interface OCRParams {
  fileId: string;
  pages?: number[];
  language: string;
  serverSide: boolean;
}

export interface WatermarkParams {
  fileId: string;
  text?: string;
  imageUrl?: string;
  opacity: number;
  rotation: number;
  scale: number;
  position: 'center' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
}

export interface RedactionParams {
  fileId: string;
  redactions: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface FirestoreUser extends User {
  email: string;
}

export interface FirestoreFile extends PDFFile {
  createdAt: any;
  updatedAt: any;
}

export interface AppState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface EditorState {
  currentFile: PDFFile | null;
  pages: PDFPage[];
  selectedPages: Set<number>;
  undoStack: PDFPage[][];
  redoStack: PDFPage[][];
  loading: boolean;
  error: string | null;
}
