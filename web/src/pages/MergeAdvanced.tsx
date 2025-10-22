/**
 * Advanced Merge PDF - Upload → Preview → Merge → Auto Download
 * Features: Multiple file upload, reorder, rotate pages, preview, auto download
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiTrash2,
  FiGitMerge,
  FiRotateCw,
  FiRotateCcw,
  FiChevronUp,
  FiChevronDown,
  FiArrowLeft,
} from 'react-icons/fi';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface MergeFile {
  id: string;
  file: File;
  pages: number;
  preview?: string;
  rotations: { [pageNum: number]: number }; // page number -> rotation in degrees
}

const MergeAdvanced: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);

  // Get PDF page count
  const getPdfPageCount = async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const pdf = await pdfjsLib.getDocument(e.target?.result as ArrayBuffer).promise;
          resolve(pdf.numPages);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  // Generate preview for first page
  const generatePreview = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const pdf = await pdfjsLib.getDocument(e.target?.result as ArrayBuffer).promise;
          const page = await pdf.getPage(1);
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const viewport = page.getViewport({ scale: 1 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context!, viewport }).promise;
          resolve(canvas.toDataURL());
        } catch (error) {
          reject(error);
        }
      };
      fileReader.readAsArrayBuffer(file);
    });
  };

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: MergeFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF`);
        continue;
      }

      try {
        const pageCount = await getPdfPageCount(file);
        const preview = await generatePreview(file);

        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          pages: pageCount,
          preview,
          rotations: {},
        });
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setFiles([...files, ...newFiles]);
    if (newFiles.length > 0 && !selectedFileId) {
      setSelectedFileId(newFiles[0].id);
    }
  };

  // Reorder files (move up)
  const moveFileUp = (index: number) => {
    if (index > 0) {
      const newFiles = [...files];
      [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      setFiles(newFiles);
    }
  };

  // Reorder files (move down)
  const moveFileDown = (index: number) => {
    if (index < files.length - 1) {
      const newFiles = [...files];
      [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      setFiles(newFiles);
    }
  };

  // Remove file
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (selectedFileId === files[index].id) {
      setSelectedFileId(newFiles[0]?.id || null);
    }
  };

  // Rotate page
  const rotatePage = (fileIndex: number, pageNum: number, direction: 'cw' | 'ccw') => {
    const newFiles = [...files];
    const currentRotation = newFiles[fileIndex].rotations[pageNum] || 0;
    newFiles[fileIndex].rotations[pageNum] = direction === 'cw' ? currentRotation + 90 : currentRotation - 90;
    setFiles(newFiles);
  };

  // Merge all PDFs
  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please upload at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    setMergeProgress(0);

    try {
      const mergedPdf = await PDFDocument.create();
      let currentProgress = 0;
      const totalFiles = files.length;

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const mergeFile = files[fileIndex];
        const fileArrayBuffer = await mergeFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page, pageIndex) => {
          // Apply rotation if set
          const rotation = mergeFile.rotations[pageIndex + 1] || 0;
          if (rotation !== 0) {
            page.setRotation(degrees(rotation));
          }
          mergedPdf.addPage(page);
        });

        currentProgress = ((fileIndex + 1) / totalFiles) * 100;
        setMergeProgress(currentProgress);
      }

      // Save and download
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDFs merged and downloaded successfully!');
      setMergeProgress(0);
      setFiles([]);
      setSelectedFileId(null);
    } catch (error: any) {
      console.error('Merge error:', error);
      toast.error(`Failed to merge PDFs: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
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
                    Merge PDFs
                  </h1>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Combine multiple PDFs into one with advanced options
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* File List & Upload */}
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
                  PDF Files ({files.length})
                </h2>

                {/* Upload Area */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mb-4 p-4 border-2 border-dashed rounded-xl transition-colors"
                  style={{
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.3)',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(59,130,246,0.05)',
                  }}
                >
                  <FiUpload size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to upload PDFs</p>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf"
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
                            ? 'bg-blue-500/30 border border-blue-500'
                            : 'bg-blue-500/20 border border-blue-500'
                          : isDarkMode
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-white/30 hover:bg-white/50'
                      }`}
                      onClick={() => setSelectedFileId(file.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {file.file.name}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {file.pages} pages
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveFileUp(index);
                          }}
                          disabled={index === 0}
                          className="flex-1 p-1 text-xs rounded bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 text-green-400"
                        >
                          <FiChevronUp size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveFileDown(index);
                          }}
                          disabled={index === files.length - 1}
                          className="flex-1 p-1 text-xs rounded bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 text-green-400"
                        >
                          <FiChevronDown size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="flex-1 p-1 text-xs rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        >
                          <FiTrash2 size={14} className="mx-auto" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Preview & Options */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`lg:col-span-2 rounded-2xl border backdrop-blur-xl p-6 ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/40 border-white/50'
                }`}
              >
                {selectedFile ? (
                  <div>
                    <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedFile.file.name}
                    </h2>

                    {/* Preview Image */}
                    {selectedFile.preview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 p-4 bg-black/40 rounded-xl overflow-auto max-h-96"
                      >
                        <img
                          src={selectedFile.preview}
                          alt="PDF Preview"
                          className="w-full rounded-lg"
                          style={{
                            transform: `rotate(${selectedFile.rotations[1] || 0}deg)`,
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Rotation Options */}
                    <div className="mb-6">
                      <h3 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Rotation Options
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => rotatePage(files.indexOf(selectedFile), 1, 'ccw')}
                          className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <FiRotateCcw size={18} />
                          Rotate Left
                        </button>
                        <button
                          onClick={() => rotatePage(files.indexOf(selectedFile), 1, 'cw')}
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
                        <strong>Pages:</strong> {selectedFile.pages}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Size:</strong> {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96">
                    <FiUpload size={48} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                    <p className={`mt-4 text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Upload PDFs to get started
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Merge Button */}
            {files.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={mergePDFs}
                  disabled={isProcessing}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  <FiGitMerge size={24} />
                  {isProcessing ? `Merging... ${Math.round(mergeProgress)}%` : 'Merge & Download'}
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
                      animate={{ width: `${mergeProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className={`text-center text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.round(mergeProgress)}% Complete
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

export default MergeAdvanced;
