/**
 * Advanced Converter - Image/Document to PDF
 * Features: File upload, preview, rotate, convert to PDF, auto download
 * Supports: Image to PDF, Word to PDF, Excel to PDF, PowerPoint to PDF
 */

import React, { useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiRotateCw,
  FiRotateCcw,
  FiTrash2,
  FiArrowLeft,
  FiImage,
  FiDownload,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { PDFDocument, degrees } from 'pdf-lib';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';
import { logConvertAction } from '@/utils/actionLogger';
import { useAuthStore } from '@/context/authContext';
import { convertWordToPDF, convertExcelToPDF } from '@/utils/officeConverter';

interface ConvertFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'document';
  rotation: number;
}

interface ConversionType {
  id: string;
  title: string;
  description: string;
  supportedFormats: string[];
  mimeTypes: string[];
  icon: string;
  color: string;
}

const ConvertAdvanced: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [files, setFiles] = useState<ConvertFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertProgress, setConvertProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Determine conversion type from URL
  const conversionType = useMemo<ConversionType>(() => {
    const path = location.pathname;
    
    if (path.includes('/word')) {
      return {
        id: 'word',
        title: 'Word to PDF',
        description: 'Convert Word documents (.docx) to PDF',
        supportedFormats: ['DOCX'],
        mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        icon: '📄',
        color: 'from-blue-600 to-blue-400',
      };
    } else if (path.includes('/excel')) {
      return {
        id: 'excel',
        title: 'Excel to PDF',
        description: 'Convert Excel spreadsheets (.xlsx) to PDF',
        supportedFormats: ['XLSX'],
        mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        icon: '📊',
        color: 'from-green-600 to-green-400',
      };
    } else if (path.includes('/ppt')) {
      return {
        id: 'ppt',
        title: 'PowerPoint to PDF',
        description: 'Convert PowerPoint presentations (.pptx) to PDF',
        supportedFormats: ['PPTX'],
        mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        icon: '🎯',
        color: 'from-red-600 to-red-400',
      };
    } else {
      // Default: Image to PDF
      return {
        id: 'image',
        title: 'Image to PDF',
        description: 'Convert images (JPEG, PNG, GIF, WebP) to PDF',
        supportedFormats: ['JPEG', 'PNG', 'GIF', 'WebP'],
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        icon: '🖼️',
        color: 'from-orange-500 to-red-500',
      };
    }
  }, [location.pathname]);

  // Generate image preview
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: ConvertFile[] = [];
    const supportedMimeTypes = conversionType.mimeTypes;
    const errorMessage = conversionType.id === 'image' 
      ? `Use ${conversionType.supportedFormats.join(', ')} format`
      : `Use ${conversionType.supportedFormats.join(', ')} file`;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      
      if (!supportedMimeTypes.includes(file.type)) {
        toast.error(`${file.name} format not supported. ${errorMessage}`);
        continue;
      }

      try {
        const preview = await generatePreview(file);
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          preview,
          type: conversionType.id === 'image' ? 'image' : 'document',
          rotation: 0,
        });
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setFiles([...files, ...newFiles]);
    if (newFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(newFiles[0].id);
      setCurrentImageIndex(0);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  // Rotate image
  const rotateImage = (rotation: 'cw' | 'ccw') => {
    setFiles(
      files.map((f) => {
        if (f.id === selectedFileId) {
          return {
            ...f,
            rotation: rotation === 'cw' ? f.rotation + 90 : f.rotation - 90,
          };
        }
        return f;
      })
    );
  };

  // Remove file
  const removeFile = (id: string) => {
    const newFiles = files.filter((f) => f.id !== id);
    setFiles(newFiles);
    if (selectedFileId === id) {
      setSelectedFileId(newFiles[0]?.id || null);
    }
  };

  // Convert files to PDF (supports images and Office documents)
  const convertToPDF = async () => {
    if (files.length === 0) {
      toast.error('Please upload at least one file');
      return;
    }

    setIsProcessing(true);
    setConvertProgress(0);
    const startTime = Date.now();

    try {
      // Check if we have mixed file types or single Office document
      const hasImages = files.some(f => f.file.type.startsWith('image/'));
      const hasOfficeFiles = files.some(f => 
        f.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        f.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        f.file.type === 'application/msword' ||
        f.file.type === 'application/vnd.ms-excel'
      );

      const inputSize = files.reduce((sum, f) => sum + f.file.size, 0);
      let conversionType = 'Mixed';

      // Handle single Office file conversion
      if (files.length === 1 && hasOfficeFiles && !hasImages) {
        const file = files[0];
        const mimeType = file.file.type;
        let pdfBlob: Blob;

        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimeType === 'application/msword') {
          conversionType = 'Word to PDF';
          pdfBlob = await convertWordToPDF(file.file);
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   mimeType === 'application/vnd.ms-excel') {
          conversionType = 'Excel to PDF';
          pdfBlob = await convertExcelToPDF(file.file);
        } else {
          throw new Error('Unsupported Office document type');
        }

        const outputSize = pdfBlob.size;
        const duration = Date.now() - startTime;

        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `converted_${file.file.name.replace(/\.[^/.]+$/, '')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Log action to Firestore
        await logConvertAction(
          user?.uid,
          conversionType,
          inputSize,
          outputSize,
          duration,
          'success'
        );

        toast.success(`${conversionType} completed successfully!`);
        setConvertProgress(0);
        setFiles([]);
        setSelectedFileId(null);
        return;
      }

      // Handle images or mixed files - merge into single PDF
      const pdfDoc = await PDFDocument.create();
      let currentProgress = 0;
      const totalFiles = files.length;
      conversionType = hasImages ? 'Image to PDF' : 'File to PDF';

      for (let index = 0; index < files.length; index++) {
        const convertFile = files[index];
        const mimeType = convertFile.file.type;

        // Handle Office documents by converting them first
        if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
            mimeType === 'application/msword') {
          const wordPdfBlob = await convertWordToPDF(convertFile.file);
          const wordPdfBytes = await wordPdfBlob.arrayBuffer();
          const wordPdfDoc = await PDFDocument.load(wordPdfBytes);
          const wordPages = await pdfDoc.copyPages(wordPdfDoc, wordPdfDoc.getPageIndices());
          wordPages.forEach(page => pdfDoc.addPage(page));
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   mimeType === 'application/vnd.ms-excel') {
          const excelPdfBlob = await convertExcelToPDF(convertFile.file);
          const excelPdfBytes = await excelPdfBlob.arrayBuffer();
          const excelPdfDoc = await PDFDocument.load(excelPdfBytes);
          const excelPages = await pdfDoc.copyPages(excelPdfDoc, excelPdfDoc.getPageIndices());
          excelPages.forEach(page => pdfDoc.addPage(page));
        } else if (mimeType.startsWith('image/')) {
          // Handle images
          const arrayBuffer = await convertFile.file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);

          let image;
          if (mimeType === 'image/jpeg') {
            image = await pdfDoc.embedJpg(bytes);
          } else if (mimeType === 'image/png') {
            image = await pdfDoc.embedPng(bytes);
          } else if (mimeType === 'image/gif') {
            image = await pdfDoc.embedPng(bytes);
          } else if (mimeType === 'image/webp') {
            image = await pdfDoc.embedPng(bytes);
          }

          if (image) {
            const { width, height } = image.scale(1);
            const page = pdfDoc.addPage([width, height]);

            // Apply rotation
            const rotation = files[index].rotation;
            if (rotation !== 0) {
              page.setRotation(degrees(rotation));
            }

            page.drawImage(image, {
              x: 0,
              y: 0,
              width,
              height,
            });
          }
        }

        currentProgress = ((index + 1) / totalFiles) * 100;
        setConvertProgress(currentProgress);
      }

      // Save and download merged PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const outputSize = blob.size;
      const duration = Date.now() - startTime;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log action to Firestore
      await logConvertAction(
        user?.uid,
        conversionType,
        inputSize,
        outputSize,
        duration,
        'success'
      );

      toast.success('Files converted to PDF and downloaded successfully!');
      setConvertProgress(0);
      setFiles([]);
      setSelectedFileId(null);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Convert error:', error);
      
      // Log error to Firestore
      await logConvertAction(
        user?.uid,
        'File Conversion',
        files.reduce((sum, f) => sum + f.file.size, 0),
        0,
        duration,
        'error',
        error.message
      );
      
      toast.error(`Failed to convert: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-green-50 to-emerald-50'
    }`}>
      {/* Sidebar */}
      <Sidebar isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`p-2 rounded-lg hover:bg-white/20 transition-colors ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <FiArrowLeft size={24} />
                </button>
                <div>
                  <h1 className={`text-4xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    {conversionType.icon} {conversionType.title}
                  </h1>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {conversionType.description}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File List */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`lg:col-span-1 rounded-2xl border backdrop-blur-xl p-6 ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/40 border-white/50'
                }`}
              >
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Images ({files.length})
                </h2>

                {/* Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full mb-4 p-4 border-2 border-dashed rounded-xl transition-all ${
                    isDragging ? 'scale-105' : ''
                  }`}
                  style={{
                    borderColor: isDragging 
                      ? 'rgba(34,197,94,0.8)' 
                      : isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.3)',
                    backgroundColor: isDragging
                      ? 'rgba(34,197,94,0.2)'
                      : isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(34,197,94,0.05)',
                  }}
                >
                  <FiUpload size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">
                    {isDragging 
                      ? `Drop ${conversionType.id === 'image' ? 'images' : 'files'} here` 
                      : `Drag & drop or click to upload ${conversionType.id === 'image' ? 'images' : 'files'}`}
                  </p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={conversionType.mimeTypes.join(',')}
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />

                {/* File List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {files.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedFileId === file.id
                          ? isDarkMode
                            ? 'bg-green-500/30 border border-green-500'
                            : 'bg-green-500/20 border border-green-500'
                          : isDarkMode
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-white/30 hover:bg-white/50'
                      }`}
                      onClick={() => {
                        setSelectedFileId(file.id);
                        setCurrentImageIndex(index);
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {file.file.name}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {(file.file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Preview & Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 20 }}
                className={`lg:col-span-2 rounded-2xl border backdrop-blur-xl p-6 ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/40 border-white/50'
                }`}
              >
                {selectedFile ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Image {currentImageIndex + 1} of {files.length}
                      </h2>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedFile.file.name}
                      </span>
                    </div>

                    {/* Preview Image */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6 p-4 bg-black/40 rounded-xl overflow-auto max-h-96 flex items-center justify-center"
                    >
                      <img
                        src={selectedFile.preview}
                        alt="Preview"
                        className="max-w-full max-h-96 rounded-lg"
                        style={{
                          transform: `rotate(${selectedFile.rotation}deg)`,
                          transition: 'transform 0.3s ease',
                        }}
                      />
                    </motion.div>

                    {/* Navigation */}
                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => {
                          if (currentImageIndex > 0) {
                            setCurrentImageIndex(currentImageIndex - 1);
                            setSelectedFileId(files[currentImageIndex - 1].id);
                          }
                        }}
                        disabled={currentImageIndex === 0}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        <FiChevronLeft size={18} />
                        Previous
                      </button>
                      <div className={`flex-1 px-4 py-2 rounded-lg text-center font-medium ${
                        isDarkMode ? 'bg-white/10 text-white' : 'bg-white/30 text-slate-900'
                      }`}>
                        {currentImageIndex + 1} / {files.length}
                      </div>
                      <button
                        onClick={() => {
                          if (currentImageIndex < files.length - 1) {
                            setCurrentImageIndex(currentImageIndex + 1);
                            setSelectedFileId(files[currentImageIndex + 1].id);
                          }
                        }}
                        disabled={currentImageIndex === files.length - 1}
                        className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400 rounded-lg font-medium flex items-center justify-center gap-2"
                      >
                        Next
                        <FiChevronRight size={18} />
                      </button>
                    </div>

                    {/* Rotation Options */}
                    <div className="mb-6">
                      <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Rotation Options
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => rotateImage('ccw')}
                          className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <FiRotateCcw size={18} />
                          Rotate Left
                        </button>
                        <button
                          onClick={() => rotateImage('cw')}
                          className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <FiRotateCw size={18} />
                          Rotate Right
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-white/5' : 'bg-white/30'}`}>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Current Rotation:</strong> {selectedFile.rotation}°
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Size:</strong> {(selectedFile.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96">
                    <FiImage size={48} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                    <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Upload images to get started
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Convert Button */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={convertToPDF}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  <FiDownload size={24} />
                  {isProcessing ? `Converting... ${Math.round(convertProgress)}%` : 'Convert & Download'}
                </button>
              </motion.div>
            )}

            {/* Progress Bar */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 w-full max-w-md mx-auto"
                >
                  <div className={`h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/10' : 'bg-white/30'}`}>
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${convertProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className={`text-center text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.round(convertProgress)}% Complete
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvertAdvanced;
