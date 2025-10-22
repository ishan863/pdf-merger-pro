import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFileStore } from '../context/fileContext';
import toast from 'react-hot-toast';
import { FaCloud, FaFileArrowUp, FaCircleExclamation } from 'react-icons/fa6';

interface UploadZoneProps {
  onFilesSelected?: (files: File[]) => void;
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  maxFileSize = 100,
  multiple = true,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFile } = useFileStore();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type || !file.type.includes('pdf')) {
      toast.error(`${file.name} is not a PDF file`);
      return false;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxFileSize) {
      toast.error(`${file.name} exceeds ${maxFileSize}MB limit`);
      return false;
    }

    return true;
  };

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const validFiles = Array.from(files).filter(validateFile);

      if (validFiles.length === 0) {
        return;
      }

      setIsLoading(true);

      try {
        // Process each file
        for (const file of validFiles) {
          const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2)}`;

          // Add file to store
          addFile({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            status: 'uploaded',
            pages: 0,
            blob: file,
          });

          toast.success(`✅ ${file.name} uploaded successfully`);
        }

        onFilesSelected?.(validFiles);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Upload error: ${message}`);
        console.error('Upload error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [addFile, onFilesSelected, maxFileSize]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
    },
    [processFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
        isDragActive
          ? 'border-primary-500 bg-primary-50 scale-105'
          : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept=".pdf"
        onChange={handleInputChange}
        className="hidden"
        disabled={isLoading}
        aria-label="Upload PDF files"
      />

      <div className="flex flex-col items-center justify-center gap-4">
        {/* Icon Animation */}
        <motion.div
          animate={{
            y: isDragActive ? -10 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center"
            >
              <FaFileArrowUp size={32} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              animate={{
                y: isDragActive ? 0 : [0, -8, 0],
              }}
              transition={{
                duration: isDragActive ? 0.3 : 2,
                repeat: isDragActive ? 0 : Infinity,
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-200 to-accent-200 flex items-center justify-center"
            >
              <FaCloud size={32} className="text-primary-600" />
            </motion.div>
          )}
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {isLoading ? 'Processing Files...' : 'Drop your PDFs here'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            or click to browse
            {multiple && ' (multiple files supported)'}
          </p>

          {/* Size Limit Info */}
          <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
            <FaCircleExclamation size={14} />
            <span>Max file size: {maxFileSize}MB</span>
          </div>
        </div>

        {/* Upload Button (visible when not dragging) */}
        {!isDragActive && !isLoading && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary mt-2"
            disabled={isLoading}
          >
            Select PDF Files
          </motion.button>
        )}

        {/* Drag State Indicator */}
        {isDragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary-600 font-medium"
          >
            ✓ Drop to upload
          </motion.div>
        )}
      </div>

      {/* Decorative elements */}
      <motion.div
        animate={{
          scale: isDragActive ? 1 : 0.8,
          opacity: isDragActive ? 0.3 : 0.1,
        }}
        className="absolute top-4 right-4 w-24 h-24 bg-primary-400 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: isDragActive ? 1 : 0.8,
          opacity: isDragActive ? 0.3 : 0.1,
        }}
        className="absolute bottom-4 left-4 w-32 h-32 bg-accent-400 rounded-full blur-3xl pointer-events-none"
      />
    </motion.div>
  );
};

export default UploadZone;
