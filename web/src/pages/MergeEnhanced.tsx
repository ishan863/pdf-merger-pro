/**
 * Enhanced Merge PDF - All Pages Preview & Advanced Features
 * Upload → Preview All Pages → Reorder/Remove Pages → Rotate → Merge → Auto Download
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
  FiZap,
} from 'react-icons/fi';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import PageRemover from '@/components/PageRemover';
import toast from 'react-hot-toast';
import { logMergeAction } from '@/utils/actionLogger';
import { useAuthStore } from '@/context/authContext';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFPage {
  id: string;
  fileId: string;
  fileName: string;
  pageNumber: number;
  totalPages: number;
  preview: string;
  rotation: number;
}

interface MergeFile {
  id: string;
  file: File;
  pages: number;
  preview?: string;
  removedPages?: Set<number>;
  compressed?: boolean;
}

const MergeEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [allPages, setAllPages] = useState<PDFPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [filePageRemovers, setFilePageRemovers] = useState<{ [key: string]: number[] }>({});
  const [isDragging, setIsDragging] = useState(false);

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

  // Generate preview for all pages
  const generateAllPagePreviews = async (file: File, fileId: string, fileName: string) => {
    const pages: PDFPage[] = [];
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pageCount = pdf.numPages;

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context!, viewport }).promise;
        const preview = canvas.toDataURL();

        pages.push({
          id: `${fileId}-page-${pageNum}`,
          fileId,
          fileName,
          pageNumber: pageNum,
          totalPages: pageCount,
          preview,
          rotation: 0,
        });
      }

      return pages;
    } catch (error) {
      console.error('Failed to generate previews', error);
      return [];
    }
  };

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: MergeFile[] = [];
    const newPages: PDFPage[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF`);
        continue;
      }

      try {
        const pageCount = await getPdfPageCount(file);
        const fileId = `${Date.now()}-${i}`;

        newFiles.push({
          id: fileId,
          file,
          pages: pageCount,
        });

        // Generate previews for all pages
        const pagesPreviews = await generateAllPagePreviews(file, fileId, file.name);
        newPages.push(...pagesPreviews);
      } catch (error) {
        toast.error(`Failed to process ${file.name}`);
      }
    }

    setFiles([...files, ...newFiles]);
    setAllPages([...allPages, ...newPages]);
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

  // Handle pages removed from page remover
  const handlePagesRemoved = (fileId: string, removedPages: number[]) => {
    setFilePageRemovers({
      ...filePageRemovers,
      [fileId]: removedPages,
    });
    
    // Remove pages from allPages
    const newAllPages = allPages.filter(
      (p) => !(p.fileId === fileId && removedPages.includes(p.pageNumber))
    );
    setAllPages(newAllPages);
    
    if (removedPages.length > 0) {
      toast.success(`Removed ${removedPages.length} page(s) from ${files.find(f => f.id === fileId)?.file.name}`);
    }
  };

  // Rotate page
  const rotatePage = (pageId: string, direction: 'cw' | 'ccw') => {
    setAllPages(
      allPages.map((p) => {
        if (p.id === pageId) {
          const newRotation = direction === 'cw' ? p.rotation + 90 : p.rotation - 90;
          return { ...p, rotation: newRotation };
        }
        return p;
      })
    );
  };

  // Remove page
  const removePage = (pageId: string) => {
    setAllPages(allPages.filter((p) => p.id !== pageId));

    // If file has no pages left, remove file
    const fileIdToCheck = allPages.find((p) => p.id === pageId)?.fileId;
    if (fileIdToCheck) {
      const fileHasPages = allPages.some(
        (p) => p.fileId === fileIdToCheck && p.id !== pageId
      );
      if (!fileHasPages) {
        setFiles(files.filter((f) => f.id !== fileIdToCheck));
      }
    }
  };

  // Reorder pages (move up/down)
  const movePageUp = (index: number) => {
    if (index > 0) {
      const newPages = [...allPages];
      [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
      setAllPages(newPages);
    }
  };

  const movePageDown = (index: number) => {
    if (index < allPages.length - 1) {
      const newPages = [...allPages];
      [newPages[index + 1], newPages[index]] = [newPages[index], newPages[index + 1]];
      setAllPages(newPages);
    }
  };

  // Merge all PDFs
  const mergePDFs = async () => {
    if (allPages.length < 2) {
      toast.error('Please upload at least 2 PDFs or keep at least 2 pages');
      return;
    }

    setIsProcessing(true);
    setMergeProgress(0);
    const startTime = Date.now();

    try {
      const mergedPdf = await PDFDocument.create();
      const totalPages = allPages.length;

      // Calculate input size
      const inputSize = files.reduce((sum, f) => sum + f.file.size, 0);

      for (let pageIndex = 0; pageIndex < allPages.length; pageIndex++) {
        const pageData = allPages[pageIndex];
        const file = files.find((f) => f.id === pageData.fileId);

        if (!file) continue;

        const fileArrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(fileArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, [pageData.pageNumber - 1]);

        const page = copiedPages[0];

        // Apply rotation
        if (pageData.rotation !== 0) {
          page.setRotation(degrees(pageData.rotation));
        }

        mergedPdf.addPage(page);

        const currentProgress = ((pageIndex + 1) / totalPages) * 100;
        setMergeProgress(currentProgress);
      }

      // Save and download
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const outputSize = blob.size;
      const duration = Date.now() - startTime;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log action to Firestore (works for both authenticated and anonymous users)
      await logMergeAction(
        user?.uid,
        files.length,
        totalPages,
        inputSize,
        outputSize,
        duration,
        'success'
      );

      toast.success('PDFs merged and downloaded successfully!');
      setMergeProgress(0);
      setFiles([]);
      setAllPages([]);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Merge error:', error);
      
      // Log error to Firestore (works for both authenticated and anonymous users)
      await logMergeAction(
        user?.uid,
        files.length,
        allPages.length,
        files.reduce((sum, f) => sum + f.file.size, 0),
        0,
        duration,
        'error',
        error.message
      );
      
      toast.error(`Failed to merge PDFs: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
                    View all pages • Reorder • Remove • Rotate • Merge
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Upload Area */}
            {files.length === 0 ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all mb-8 ${
                  isDragging
                    ? isDarkMode
                      ? 'border-blue-500 bg-blue-500/20 scale-105'
                      : 'border-blue-500 bg-blue-100 scale-105'
                    : isDarkMode
                    ? 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5'
                    : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <FiUpload size={48} className="mx-auto mb-4" />
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {isDragging ? 'Drop PDFs Here' : 'Upload PDFs to Merge'}
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {isDragging ? 'Release to upload' : 'Drag & drop or click to select 1 or more PDF files'}
                </p>
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full p-3 rounded-xl font-medium mb-6 transition-colors ${
                  isDragging
                    ? isDarkMode
                      ? 'bg-blue-500/40 text-blue-300'
                      : 'bg-blue-500/40 text-blue-700'
                    : isDarkMode
                    ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-600'
                }`}
              >
                {isDragging ? '+ Drop PDFs Here' : '+ Add More PDFs'}
              </motion.button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Page Removal Section */}
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 rounded-2xl backdrop-blur-xl border"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)',
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
                }}
              >
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <FiZap size={20} className="text-yellow-500" />
                  Smart Page Removal (Optional)
                </h3>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remove unwanted pages from each PDF before merging. Click on pages to select them for deletion.
                </p>
                <div className="space-y-4">
                  {files.map((file) => (
                    <PageRemover
                      key={file.id}
                      pdfBlob={file.file}
                      fileName={file.file.name}
                      isDarkMode={isDarkMode}
                      onPagesSelected={() => {}}
                      onPagesRemoved={(removedPages) => handlePagesRemoved(file.id, removedPages)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* All Pages Grid */}
            {allPages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    All Pages ({allPages.length})
                  </h2>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    From {files.length} PDF{files.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <motion.div
                  layout
                  className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  {allPages.map((pageData, index) => (
                    <motion.div
                      key={pageData.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`group relative rounded-lg border backdrop-blur-md overflow-hidden transition-all hover:scale-105 ${
                        isDarkMode
                          ? 'bg-white/10 border-white/20 hover:border-white/40'
                          : 'bg-white/40 border-white/50 hover:border-white/60'
                      }`}
                    >
                      {/* Page Preview */}
                      <div className="aspect-square overflow-hidden bg-black/40">
                        <img
                          src={pageData.preview}
                          alt={`${pageData.fileName} - Page ${pageData.pageNumber}`}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${pageData.rotation}deg)`,
                          }}
                        />
                      </div>

                      {/* Page Number Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                        isDarkMode
                          ? 'bg-blue-500/80 text-white'
                          : 'bg-blue-500/80 text-white'
                      }`}>
                        P{pageData.pageNumber}
                      </div>

                      {/* Position Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                        isDarkMode
                          ? 'bg-purple-500/80 text-white'
                          : 'bg-purple-500/80 text-white'
                      }`}>
                        #{index + 1}
                      </div>

                      {/* Hover Controls */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {/* Rotation Buttons */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => rotatePage(pageData.id, 'ccw')}
                            className="p-2 rounded bg-orange-500/80 hover:bg-orange-600 text-white"
                            title="Rotate Left"
                          >
                            <FiRotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => rotatePage(pageData.id, 'cw')}
                            className="p-2 rounded bg-orange-500/80 hover:bg-orange-600 text-white"
                            title="Rotate Right"
                          >
                            <FiRotateCw size={16} />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removePage(pageData.id)}
                          className="p-2 rounded bg-red-500/80 hover:bg-red-600 text-white w-10"
                          title="Remove Page"
                        >
                          <FiTrash2 size={16} className="mx-auto" />
                        </button>
                      </div>

                      {/* Order Controls (Bottom) */}
                      <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => movePageUp(index)}
                          disabled={index === 0}
                          className="flex-1 p-1 rounded bg-green-500/80 hover:bg-green-600 disabled:opacity-30 text-white text-xs"
                          title="Move Up"
                        >
                          <FiChevronUp size={14} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => movePageDown(index)}
                          disabled={index === allPages.length - 1}
                          className="flex-1 p-1 rounded bg-green-500/80 hover:bg-green-600 disabled:opacity-30 text-white text-xs"
                          title="Move Down"
                        >
                          <FiChevronDown size={14} className="mx-auto" />
                        </button>
                      </div>

                      {/* File Name */}
                      <div className={`p-2 text-xs truncate ${
                        isDarkMode ? 'bg-black/40 text-gray-200' : 'bg-black/30 text-gray-100'
                      }`}>
                        {pageData.fileName}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Merge Button */}
            {allPages.length >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <button
                  onClick={mergePDFs}
                  disabled={isProcessing}
                  className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  <FiGitMerge size={24} />
                  {isProcessing ? `Processing... ${Math.round(mergeProgress)}%` : allPages.length === 1 ? 'Process & Download PDF' : 'Merge All Pages & Download'}
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
                  className="w-full max-w-md mx-auto"
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

export default MergeEnhanced;
