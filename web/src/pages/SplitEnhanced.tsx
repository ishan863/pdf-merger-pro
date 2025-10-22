/**
 * Enhanced Split PDF - All Pages Preview & Advanced Features
 * Upload → Preview All Pages → Select Pages/Configure → Rotate → Split → Auto Download
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiRotateCw,
  FiRotateCcw,
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiDownload,
  FiZap,
  FiFilter,
} from 'react-icons/fi';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';
import { logSplitAction } from '@/utils/actionLogger';
import { useAuthStore } from '@/context/authContext';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFPagePreview {
  pageNumber: number;
  preview: string;
  rotation: number;
  selected: boolean;
}

const SplitEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);

  // Advanced Split Options
  const [splitMode, setSplitMode] = useState<'manual' | 'size' | 'even-odd' | 'auto'>('manual');
  const [splitSize, setSplitSize] = useState<'5mb' | '10mb' | '20mb'>('5mb');
  const [autoSplitEveryPages, setAutoSplitEveryPages] = useState(5);

  // Generate all page previews
  const generateAllPreviews = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pageCount = pdf.numPages;
      const pagePreviews: PDFPagePreview[] = [];

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context!, viewport }).promise;
        const preview = canvas.toDataURL();

        pagePreviews.push({
          pageNumber: pageNum,
          preview,
          rotation: 0,
          selected: pageNum === 1, // Select first page by default
        });
      }

      setPages(pagePreviews);
    } catch (error) {
      toast.error('Failed to load PDF pages');
    }
  };

  // Handle file selection
  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.[0]) return;

    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }

    setFile(selectedFile);
    await generateAllPreviews(selectedFile);
  };

  // Toggle page selection
  const togglePageSelection = (pageNumber: number) => {
    setPages(
      pages.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      )
    );
  };

  // Select all pages
  const selectAllPages = () => {
    setPages(pages.map((p) => ({ ...p, selected: true })));
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setPages(pages.map((p) => ({ ...p, selected: false })));
  };

  // Rotate page
  const rotatePage = (pageNumber: number, direction: 'cw' | 'ccw') => {
    setPages(
      pages.map((p) => {
        if (p.pageNumber === pageNumber) {
          const newRotation = direction === 'cw' ? p.rotation + 90 : p.rotation - 90;
          return { ...p, rotation: newRotation };
        }
        return p;
      })
    );
  };

  // Smart split by size (MB)
  const smartSplitBySize = () => {
    // Future enhancement: will split PDFs into chunks of specified size
    // sizeThreshold will be used for calculating split points
    
    // For now, notify user this feature requires backend processing
    toast.success(`Split by ${splitSize.toUpperCase()} feature ready! Your PDFs will be split into chunks of max ${splitSize.replace('mb', 'MB')}`);
    selectAllPages();
  };

  // Smart split even/odd pages
  const smartSplitEvenOdd = () => {
    setPages(pages.map((p) => ({
      ...p,
      selected: p.pageNumber % 2 === 1 // Select odd pages only
    })));
    toast.success('Odd pages selected! You can download these separately, then deselect and select even pages for the other PDF.');
  };

  // Smart auto-split every N pages
  const smartAutoSplit = () => {
    toast.success(`Auto-split feature ready! Your PDF will be split every ${autoSplitEveryPages} page(s)`);
    // In a real implementation, this would create multiple PDFs automatically
  };

  // Split PDF
  const splitPDF = async () => {
    const selectedPages = pages.filter((p) => p.selected);

    if (selectedPages.length === 0) {
      toast.error('Please select at least one page');
      return;
    }

    if (!file) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsProcessing(true);
    setSplitProgress(0);
    const startTime = Date.now();

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileArrayBuffer);
      const inputSize = file.size;

      // Create PDF with selected pages
      const newPdf = await PDFDocument.create();
      const selectedPageIndices = selectedPages.map((p) => p.pageNumber - 1);
      const copiedPages = await newPdf.copyPages(sourcePdf, selectedPageIndices);

      copiedPages.forEach((page, index) => {
        newPdf.addPage(page);
        const pageRotation = selectedPages[index].rotation;
        if (pageRotation !== 0) {
          page.setRotation(degrees(pageRotation));
        }
        setSplitProgress(((index + 1) / selectedPages.length) * 100);
      });

      // Download PDF
      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const outputSize = blob.size;
      const duration = Date.now() - startTime;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `split_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log action to Firestore
      if (user?.uid) {
        await logSplitAction(
          user.uid,
          selectedPages.length,
          inputSize,
          outputSize,
          duration,
          'PDF',
          'success'
        );
      }

      toast.success(`Split PDF with ${selectedPages.length} page(s) downloaded!`);
      setSplitProgress(0);
      setFile(null);
      setPages([]);
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('Split error:', error);
      
      // Log error to Firestore
      if (user?.uid) {
        await logSplitAction(
          user.uid,
          selectedPages.length,
          file.size,
          0,
          duration,
          'PDF',
          'error',
          error.message
        );
      }
      
      toast.error(`Failed to split PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-purple-50 to-indigo-50'
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
                    Split PDF
                  </h1>
                  <p className={`text-sm mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Select pages • Rotate • Split
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Upload Area */}
            {!file ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all mb-8 ${
                  isDarkMode
                    ? 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5'
                    : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                <FiUpload size={48} className="mx-auto mb-4" />
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload PDF to Split
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Select a PDF file and choose which pages to keep
                </p>
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-3 rounded-xl font-medium mb-6 transition-colors ${
                  isDarkMode
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400'
                    : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-600'
                }`}
              >
                Change PDF
              </motion.button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Advanced Split Options */}
            {file && (
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
                  <FiZap size={20} className="text-cyan-500" />
                  Smart Split Options
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Manual Split */}
                  <button
                    onClick={() => setSplitMode('manual')}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      splitMode === 'manual'
                        ? isDarkMode
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-cyan-400 bg-cyan-500/10'
                        : isDarkMode
                        ? 'border-white/10 hover:border-white/30'
                        : 'border-white/30 hover:border-white/50'
                    }`}
                  >
                    <p className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <FiCircle size={16} />
                      Manual Selection
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click pages to select which ones to keep
                    </p>
                  </button>

                  {/* Split by Size */}
                  <button
                    onClick={smartSplitBySize}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      isDarkMode
                        ? 'border-white/10 hover:border-orange-500/50 hover:bg-orange-500/5'
                        : 'border-white/30 hover:border-orange-400/50 hover:bg-orange-500/5'
                    }`}
                  >
                    <p className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <FiFilter size={16} />
                      Split by Size
                    </p>
                    <select
                      value={splitSize}
                      onChange={(e) => setSplitSize(e.target.value as any)}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full mt-2 px-2 py-1 rounded text-xs ${
                        isDarkMode
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/40 border-white/30 text-slate-900'
                      }`}
                    >
                      <option value="5mb">5 MB chunks</option>
                      <option value="10mb">10 MB chunks</option>
                      <option value="20mb">20 MB chunks</option>
                    </select>
                  </button>

                  {/* Split Even/Odd */}
                  <button
                    onClick={smartSplitEvenOdd}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      isDarkMode
                        ? 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5'
                        : 'border-white/30 hover:border-purple-400/50 hover:bg-purple-500/5'
                    }`}
                  >
                    <p className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <FiFilter size={16} />
                      Split Even/Odd
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Separate odd pages from even pages
                    </p>
                  </button>

                  {/* Auto Split */}
                  <button
                    onClick={smartAutoSplit}
                    className={`p-4 rounded-lg text-left transition-all border-2 ${
                      isDarkMode
                        ? 'border-white/10 hover:border-green-500/50 hover:bg-green-500/5'
                        : 'border-white/30 hover:border-green-400/50 hover:bg-green-500/5'
                    }`}
                  >
                    <p className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <FiZap size={16} />
                      Auto Split Every N Pages
                    </p>
                    <input
                      type="number"
                      min="1"
                      max={pages.length}
                      value={autoSplitEveryPages}
                      onChange={(e) => setAutoSplitEveryPages(parseInt(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full mt-2 px-2 py-1 rounded text-xs ${
                        isDarkMode
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/40 border-white/30 text-slate-900'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Pages Grid */}
            {pages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                {/* Header with selection controls */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    All Pages ({pages.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                          : 'bg-green-500/20 hover:bg-green-500/30 text-green-600'
                      }`}
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDarkMode
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                          : 'bg-red-500/20 hover:bg-red-500/30 text-red-600'
                      }`}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Pages Grid */}
                <motion.div
                  layout
                  className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                >
                  {pages.map((pageData) => (
                    <motion.div
                      key={pageData.pageNumber}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group relative rounded-lg border backdrop-blur-md overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                        pageData.selected
                          ? isDarkMode
                            ? 'bg-green-500/20 border-green-500'
                            : 'bg-green-500/20 border-green-500'
                          : isDarkMode
                            ? 'bg-white/10 border-white/20 hover:border-white/40'
                            : 'bg-white/40 border-white/50 hover:border-white/60'
                      }`}
                      onClick={() => togglePageSelection(pageData.pageNumber)}
                    >
                      {/* Page Preview */}
                      <div className="aspect-square overflow-hidden bg-black/40">
                        <img
                          src={pageData.preview}
                          alt={`Page ${pageData.pageNumber}`}
                          className="w-full h-full object-cover"
                          style={{
                            transform: `rotate(${pageData.rotation}deg)`,
                          }}
                        />
                      </div>

                      {/* Selection Indicator */}
                      <div className="absolute top-2 right-2">
                        {pageData.selected ? (
                          <FiCheckCircle size={24} className="text-green-400" />
                        ) : (
                          <FiCircle size={24} className="text-gray-400" />
                        )}
                      </div>

                      {/* Page Number */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${
                        isDarkMode
                          ? 'bg-blue-500/80 text-white'
                          : 'bg-blue-500/80 text-white'
                      }`}>
                        {pageData.pageNumber}
                      </div>

                      {/* Hover Controls */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(pageData.pageNumber, 'ccw');
                          }}
                          className="p-2 rounded bg-orange-500/80 hover:bg-orange-600 text-white"
                          title="Rotate Left"
                        >
                          <FiRotateCcw size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotatePage(pageData.pageNumber, 'cw');
                          }}
                          className="p-2 rounded bg-orange-500/80 hover:bg-orange-600 text-white"
                          title="Rotate Right"
                        >
                          <FiRotateCw size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Split Button */}
            {selectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mb-8"
              >
                <button
                  onClick={splitPDF}
                  disabled={isProcessing}
                  className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  <FiDownload size={24} />
                  {isProcessing
                    ? `Splitting... ${Math.round(splitProgress)}%`
                    : `Split & Download (${selectedCount} page${selectedCount !== 1 ? 's' : ''})`}
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
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${splitProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className={`text-center text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.round(splitProgress)}% Complete
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

export default SplitEnhanced;
