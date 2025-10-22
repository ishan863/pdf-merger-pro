/**
 * Advanced Split PDF - Upload → Preview → Configure → Auto Download
 * Features: Page preview, extract range, rotate pages, split modes, auto download
 */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUpload,
  FiScissors,
  FiRotateCw,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface SplitConfig {
  mode: 'extract' | 'split-every';
  extractPages: string; // e.g., "1,3,5-10"
  splitEvery: number;
  rotations: { [pageNum: number]: number };
}

const SplitAdvanced: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitProgress, setSplitProgress] = useState(0);

  const [config, setConfig] = useState<SplitConfig>({
    mode: 'extract',
    extractPages: '1',
    splitEvery: 5,
    rotations: {},
  });

  // Get PDF page count and generate preview
  const loadPdf = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      setPageCount(pdf.numPages);
      setCurrentPage(1);
      await generatePagePreview(pdf, 1);
    } catch (error) {
      toast.error('Failed to load PDF');
    }
  };

  // Generate page preview
  const generatePagePreview = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context!, viewport }).promise;
      setPagePreviewUrl(canvas.toDataURL());
    } catch (error) {
      console.error('Failed to generate preview', error);
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
    await loadPdf(selectedFile);
  };

  // Navigate pages
  const goToPreviousPage = async () => {
    if (currentPage > 1 && file) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      await generatePagePreview(pdf, newPage);
    }
  };

  const goToNextPage = async () => {
    if (currentPage < pageCount && file) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      await generatePagePreview(pdf, newPage);
    }
  };

  // Rotate page
  const rotatePage = (direction: 'cw' | 'ccw') => {
    const currentRotation = config.rotations[currentPage] || 0;
    setConfig({
      ...config,
      rotations: {
        ...config.rotations,
        [currentPage]: direction === 'cw' ? currentRotation + 90 : currentRotation - 90,
      },
    });
  };

  // Parse page range (e.g., "1,3,5-10" -> [1,3,5,6,7,8,9,10])
  const parsePageRange = (rangeStr: string): number[] => {
    const pages: number[] = [];
    const parts = rangeStr.split(',');

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(p => parseInt(p.trim()));
        for (let i = start; i <= end && i <= pageCount; i++) {
          pages.push(i);
        }
      } else {
        const page = parseInt(part.trim());
        if (page <= pageCount) pages.push(page);
      }
    }

    return [...new Set(pages)].sort((a, b) => a - b);
  };

  // Split PDF
  const splitPDF = async () => {
    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    setIsProcessing(true);
    setSplitProgress(0);

    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(fileArrayBuffer);
      let pagesToExtract: number[] = [];

      if (config.mode === 'extract') {
        pagesToExtract = parsePageRange(config.extractPages);
      } else {
        for (let i = 1; i <= pageCount; i += config.splitEvery) {
          pagesToExtract.push(i);
        }
      }

      if (pagesToExtract.length === 0) {
        toast.error('No valid pages selected');
        setIsProcessing(false);
        return;
      }

      // Create PDFs for each group
      let currentIndex = 0;
      const totalGroups = config.mode === 'extract' ? 1 : Math.ceil(pageCount / config.splitEvery);

      for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
        const newPdf = await PDFDocument.create();

        // Determine page range for this group
        let startPage: number;
        let endPage: number;

        if (config.mode === 'extract') {
          startPage = pagesToExtract[0];
          endPage = pagesToExtract[pagesToExtract.length - 1];
        } else {
          startPage = groupIndex * config.splitEvery + 1;
          endPage = Math.min((groupIndex + 1) * config.splitEvery, pageCount);
        }

        const indicesToCopy: number[] = [];
        for (let i = startPage; i <= endPage; i++) {
          indicesToCopy.push(i - 1); // PDF indices are 0-based
        }

        const copiedPages = await newPdf.copyPages(sourcePdf, indicesToCopy);

        copiedPages.forEach((page, idx) => {
          const pageNum = indicesToCopy[idx] + 1;
          const rotation = config.rotations[pageNum] || 0;
          if (rotation !== 0) {
            page.setRotation(degrees(rotation));
          }
          newPdf.addPage(page);
        });

        // Download this PDF
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `split_${groupIndex + 1}_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        currentIndex++;
        setSplitProgress((currentIndex / totalGroups) * 100);
      }

      toast.success(`Successfully split PDF into ${totalGroups} file(s)!`);
      setSplitProgress(0);
      setFile(null);
      setPageCount(0);
    } catch (error: any) {
      console.error('Split error:', error);
      toast.error(`Failed to split PDF: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
                    Extract pages or split PDF with advanced options
                  </p>
                </div>
              </div>
            </motion.div>

            {!file ? (
              /* Upload Area */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all ${
                  isDarkMode
                    ? 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUpload size={48} className="mx-auto mb-4" />
                <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload PDF to Split
                </h2>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Click to select a PDF file
                </p>
              </motion.div>
            ) : (
              /* Preview & Config */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Preview */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`lg:col-span-2 rounded-2xl border backdrop-blur-xl p-6 ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/40 border-white/50'
                  }`}
                >
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Preview
                  </h2>

                  {pagePreviewUrl && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-6 p-4 bg-black/40 rounded-xl overflow-auto max-h-96"
                    >
                      <img
                        src={pagePreviewUrl}
                        alt={`Page ${currentPage}`}
                        className="w-full rounded-lg"
                        style={{
                          transform: `rotate(${config.rotations[currentPage] || 0}deg)`,
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Page Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400"
                    >
                      <FiChevronLeft size={24} />
                    </button>

                    <div className={`text-center font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Page {currentPage} of {pageCount}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage >= pageCount}
                      className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 text-blue-400"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </div>

                  {/* Rotation Options */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => rotatePage('ccw')}
                      className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <FiRotateCcw size={18} />
                      Rotate Left
                    </button>
                    <button
                      onClick={() => rotatePage('cw')}
                      className="flex-1 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <FiRotateCw size={18} />
                      Rotate Right
                    </button>
                  </div>
                </motion.div>

                {/* Configuration */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-2xl border backdrop-blur-xl p-6 ${
                    isDarkMode
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/40 border-white/50'
                  }`}
                >
                  <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Split Configuration
                  </h2>

                  {/* Mode Selection */}
                  <div className="mb-6">
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Split Mode
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value="extract"
                          checked={config.mode === 'extract'}
                          onChange={(e) =>
                            setConfig({ ...config, mode: e.target.value as 'extract' | 'split-every' })
                          }
                          className="w-4 h-4"
                        />
                        <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Extract Pages</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value="split-every"
                          checked={config.mode === 'split-every'}
                          onChange={(e) =>
                            setConfig({ ...config, mode: e.target.value as 'extract' | 'split-every' })
                          }
                          className="w-4 h-4"
                        />
                        <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Split Every N Pages</span>
                      </label>
                    </div>
                  </div>

                  {/* Mode-specific input */}
                  {config.mode === 'extract' ? (
                    <div className="mb-6">
                      <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Pages to Extract
                      </label>
                      <input
                        type="text"
                        value={config.extractPages}
                        onChange={(e) => setConfig({ ...config, extractPages: e.target.value })}
                        placeholder="1,3,5-10"
                        className={`w-full px-3 py-2 rounded-lg border ${
                          isDarkMode
                            ? 'bg-white/10 border-white/20 text-white'
                            : 'bg-white/40 border-white/50 text-slate-900'
                        }`}
                      />
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Format: 1,3,5-10 (comma separated, ranges with hyphen)
                      </p>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Pages Per Split
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setConfig({
                              ...config,
                              splitEvery: Math.max(1, config.splitEvery - 1),
                            })
                          }
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        >
                          <FiMinus size={18} />
                        </button>
                        <input
                          type="number"
                          value={config.splitEvery}
                          onChange={(e) =>
                            setConfig({ ...config, splitEvery: Math.max(1, parseInt(e.target.value) || 1) })
                          }
                          className={`flex-1 px-3 py-2 rounded-lg border text-center ${
                            isDarkMode
                              ? 'bg-white/10 border-white/20 text-white'
                              : 'bg-white/40 border-white/50 text-slate-900'
                          }`}
                        />
                        <button
                          onClick={() =>
                            setConfig({
                              ...config,
                              splitEvery: config.splitEvery + 1,
                            })
                          }
                          className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400"
                        >
                          <FiPlus size={18} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* File Info */}
                  <div className={`p-3 rounded-lg mb-6 ${isDarkMode ? 'bg-white/5' : 'bg-white/30'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Pages:</strong> {pageCount}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Split Button */}
                  <button
                    onClick={splitPDF}
                    disabled={isProcessing}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiScissors size={20} />
                    {isProcessing ? `Splitting... ${Math.round(splitProgress)}%` : 'Split & Download'}
                  </button>

                  {/* Change File */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/30 hover:bg-white/50 text-slate-900'
                    }`}
                  >
                    Choose Different File
                  </button>
                </motion.div>
              </div>
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default SplitAdvanced;
