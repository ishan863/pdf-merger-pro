// File management context

import { create } from 'zustand';
import { PDFFile, UploadProgress } from '@/types';

interface FileState {
  files: PDFFile[];
  uploads: Map<string, UploadProgress>;
  setFiles: (files: PDFFile[]) => void;
  addFile: (file: PDFFile) => void;
  updateFile: (fileId: string, updates: Partial<PDFFile>) => void;
  removeFile: (fileId: string) => void;
  setUploadProgress: (fileId: string, progress: UploadProgress) => void;
  removeUpload: (fileId: string) => void;
}

export const useFileStore = create<FileState>((set) => ({
  files: [],
  uploads: new Map(),
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFile: (fileId, updates) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === fileId ? { ...f, ...updates } : f)),
    })),
  removeFile: (fileId) =>
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
    })),
  setUploadProgress: (fileId, progress) =>
    set((state) => {
      const uploads = new Map(state.uploads);
      uploads.set(fileId, progress);
      return { uploads };
    }),
  removeUpload: (fileId) =>
    set((state) => {
      const uploads = new Map(state.uploads);
      uploads.delete(fileId);
      return { uploads };
    }),
}));
