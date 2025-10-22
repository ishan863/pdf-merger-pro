/**
 * Enhanced UploadZone Component
 * Features: Drag-drop, file type detection, multi-file upload, conversion preview
 * Supports: PDF, Images, Text, CSV, Excel, Word, PowerPoint
 */

'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileStore } from '@/context/fileContext';
import { convertToPDF, canConvertClientSide, needsConversion } from '@/utils/conversion';
import Toast from './Toast';
import ConversionConsentModal from './ConversionConsentModal';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
  status: 'pending' | 'converting' | 'success' | 'error';
  error?: string;
  converted?: boolean;
}

interface UploadZoneProps {
  onUploadComplete?: (files: File[]) => void;
  maxFileSize?: number; // in MB
  allowMultiple?: boolean;
  acceptedFileTypes?: string[];
}

export const EnhancedUploadZone: React.FC<UploadZoneProps> = ({
  onUploadComplete,
  maxFileSize = 100,
  allowMultiple = true,
  acceptedFileTypes = [
    '.pdf',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.txt',
    '.md',
    '.csv',
    '.xls',
    '.xlsx',
    '.doc',
    '.docx',
    '.ppt',
    '.pptx',
  ],
}) => {
  const { addFile } = useFileStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<FileWithPreview[]>([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<FileWithPreview | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get MIME type from file extension
  const getMimeType = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      txt: 'text/plain',
      md: 'text/markdown',
      csv: 'text/csv',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };
    return mimeMap[ext] || 'application/octet-stream';
  };

  // Validate file
  const isValidFile = (file: File): boolean => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setToast({ message: `File exceeds ${maxFileSize}MB limit`, type: 'error' });
      return false;
    }

    const mimeType = getMimeType(file.name);
    if (!needsConversion(mimeType) && mimeType !== 'application/pdf') {
      setToast({ message: `File type not supported: ${file.type}`, type: 'error' });
      return false;
    }

    return true;
  };

  // Convert file if needed
  const handleFileConversion = async (fileWithPreview: FileWithPreview): Promise<void> => {
    const file = fileWithPreview.file;
    const mimeType = getMimeType(file.name);

    try {
      // Update status
      setUploadQueue(prev =>
        prev.map(f => (f.id === fileWithPreview.id ? { ...f, status: 'converting' } : f))
      );

      // Skip conversion for PDF
      if (mimeType === 'application/pdf') {
        const pdfFile: any = {
          id: fileWithPreview.id,
          name: file.name,
          blob: file,
          size: file.size,
          type: mimeType,
          uploadedAt: new Date(),
          status: 'ready',
        };
        addFile(pdfFile);
        setUploadQueue(prev =>
          prev.map(f => (f.id === fileWithPreview.id ? { ...f, status: 'success', converted: false } : f))
        );
        setToast({ message: `${file.name} uploaded successfully`, type: 'success' });
        return;
      }

      // Check if conversion is needed
      if (!needsConversion(mimeType)) {
        setToast({ message: `Cannot convert file type: ${mimeType}`, type: 'error' });
        setUploadQueue(prev =>
          prev.map(f =>
            f.id === fileWithPreview.id
              ? { ...f, status: 'error', error: 'Unsupported file type' }
              : f
          )
        );
        return;
      }

      // Check if client-side conversion is possible
      if (canConvertClientSide(mimeType)) {
        // Client-side conversion
        const pdfBlob = await convertToPDF(file, file.name, mimeType);
        const pdfFileName = file.name.replace(/\.[^/.]+$/, '.pdf');
        const pdfFile: any = {
          id: fileWithPreview.id,
          name: pdfFileName,
          blob: pdfBlob,
          size: pdfBlob.size,
          type: 'application/pdf',
          uploadedAt: new Date(),
          status: 'ready',
        };

        addFile(pdfFile);
        setUploadQueue(prev =>
          prev.map(f => (f.id === fileWithPreview.id ? { ...f, status: 'success', converted: true } : f))
        );
        setToast({
          message: `${file.name} converted and uploaded successfully`,
          type: 'success',
        });
      } else {
        // Server-side conversion - show consent modal
        setPendingFile(fileWithPreview);
        setShowConsentModal(true);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setUploadQueue(prev =>
        prev.map(f =>
          f.id === fileWithPreview.id
            ? {
                ...f,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              }
            : f
        )
      );
      setToast({ message: `Conversion failed: ${error}`, type: 'error' });
    }
  };

  // Handle consent modal response
  const handleConsentResponse = async (accepted: boolean): Promise<void> => {
    if (!pendingFile) return;

    setShowConsentModal(false);

    if (accepted) {
      // TODO: Implement server-side conversion
      setToast({
        message: 'Server conversion requested (placeholder)',
        type: 'info',
      });
    } else {
      setToast({
        message: 'Conversion cancelled',
        type: 'info',
      });
      setUploadQueue(prev => prev.filter(f => f.id !== pendingFile.id));
    }

    setPendingFile(null);
  };

  // Handle file selection
  const processFiles = async (files: FileList | null): Promise<void> => {
    if (!files) return;

    const newFiles: FileWithPreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (isValidFile(file)) {
        const fileWithPreview: FileWithPreview = {
          file,
          id: `${file.name}-${Date.now()}-${i}`,
          status: 'pending',
        };

        // Generate image preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setUploadQueue(prev =>
              prev.map(f => (f.id === fileWithPreview.id ? { ...f, preview: e.target?.result as string } : f))
            );
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(fileWithPreview);
      }
    }

    setUploadQueue(prev => [...prev, ...newFiles]);

    // Process files
    for (const file of newFiles) {
      await handleFileConversion(file);
    }

    if (onUploadComplete) {
      onUploadComplete(newFiles.map(f => f.file));
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setUploadQueue(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setUploadQueue([]);
  };

  const acceptTypes = acceptedFileTypes.join(',');

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4">
        {/* Upload Zone */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-lg p-8 cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          whileHover={{ scale: isDragging ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={allowMultiple}
            accept={acceptTypes}
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-700 mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Supports PDF, Images, Text, CSV, Excel, Word, PowerPoint
            </p>
            <p className="text-xs text-gray-400">
              Max file size: {maxFileSize}MB
            </p>
          </div>
        </motion.div>

        {/* Upload Queue */}
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                Upload Queue ({uploadQueue.length})
              </h3>
              {uploadQueue.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-500 hover:text-red-700 transition"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {uploadQueue.map(fileWithPreview => (
                  <motion.div
                    key={fileWithPreview.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* File Preview or Icon */}
                    <div className="flex-shrink-0">
                      {fileWithPreview.preview ? (
                        <img
                          src={fileWithPreview.preview}
                          alt={fileWithPreview.file.name}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <FiFile className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-grow min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {fileWithPreview.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(fileWithPreview.file.size / 1024).toFixed(1)} KB
                      </p>
                      {fileWithPreview.converted && (
                        <p className="text-xs text-green-600">
                          ✓ Converted to PDF
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {fileWithPreview.status === 'pending' && (
                        <div className="animate-spin h-5 w-5 text-blue-500">
                          <FiUpload className="h-5 w-5" />
                        </div>
                      )}
                      {fileWithPreview.status === 'converting' && (
                        <div className="animate-spin h-5 w-5 text-blue-500">
                          <FiUpload className="h-5 w-5" />
                        </div>
                      )}
                      {fileWithPreview.status === 'success' && (
                        <FiCheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {fileWithPreview.status === 'error' && (
                        <FiAlertCircle className="h-5 w-5 text-red-500" />
                      )}

                      <button
                        onClick={() => removeFile(fileWithPreview.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>

      {/* Consent Modal */}
      {showConsentModal && pendingFile && (
        <ConversionConsentModal
          isOpen={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          onConsent={handleConsentResponse}
          fileName={pendingFile.file.name}
          fileType={getMimeType(pendingFile.file.name)}
          fileSize={pendingFile.file.size}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          id={`toast-${Date.now()}`}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={4000}
        />
      )}
    </>
  );
};

export default EnhancedUploadZone;
