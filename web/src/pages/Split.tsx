/**
 * Split PDF Component - Comprehensive Split Features
 * Modes: Range (Custom/Fixed), Pages, Size
 * Features: Custom ranges, fixed intervals, page extraction, size-based splitting
 * Version: 2.0.0 - Full iLovePDF-like functionality with PDF previews
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiScissors, FiPlus, FiTrash2, FiUpload, FiFile, FiCheckCircle, FiCircle } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { logSplitAction } from '@/utils/actionLogger';
import { useAuthStore } from '@/context/authContext';

// Setup PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type SplitMode = 'range' | 'pages' | 'size';
type RangeMode = 'custom' | 'fixed';

interface CustomRange {
  id: string;
  from: number;
  to: number;
}

interface PDFPagePreview {
  pageNumber: number;
  preview: string;
  selected: boolean;
}

const Split: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [pagePreviews, setPagePreviews] = useState<PDFPagePreview[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('range');
  const [rangeMode, setRangeMode] = useState<RangeMode>('custom');
  const [customRanges, setCustomRanges] = useState<CustomRange[]>([
    { id: '1', from: 1, to: 2 },
  ]);
  const [fixedInterval, setFixedInterval] = useState<number>(2);
  const [mergeRanges, setMergeRanges] = useState<boolean>(false);
  const [extractEveryNPages, setExtractEveryNPages] = useState<number>(1);
  const [splitBySize, setSplitBySize] = useState<number>(5); // MB
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);

  // Load PDF and get page count + previews
  useEffect(() => {
    if (selectedFile) {
      loadPdfPageCount(selectedFile);
      generateAllPreviews(selectedFile);
    }
  }, [selectedFile]);

  const loadPdfPageCount = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfPageCount(pdfDoc.getPageCount());
    } catch (error) {
      console.error('Failed to load PDF:', error);
      toast.error('Failed to load PDF file');
    }
  };

  // Generate all page previews
  const generateAllPreviews = async (file: File) => {
    setIsLoadingPreviews(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pageCount = pdf.numPages;
      const previews: PDFPagePreview[] = [];

      toast.loading(`Generating previews for ${pageCount} pages...`, { id: 'preview-loading' });

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: 1.0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context!, viewport }).promise;
        const preview = canvas.toDataURL();

        previews.push({
          pageNumber: pageNum,
          preview,
          selected: false,
        });

        // Update progress
        if (pageNum % 5 === 0 || pageNum === pageCount) {
          toast.loading(`Generated ${pageNum} of ${pageCount} previews...`, { id: 'preview-loading' });
        }
      }

      setPagePreviews(previews);
      toast.success(`${pageCount} page previews loaded!`, { id: 'preview-loading' });
    } catch (error) {
      console.error('Failed to generate previews:', error);
      toast.error('Failed to generate page previews', { id: 'preview-loading' });
    } finally {
      setIsLoadingPreviews(false);
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setPagePreviews(
      pagePreviews.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const selectAllPages = () => {
    setPagePreviews(pagePreviews.map((p) => ({ ...p, selected: true })));
  };

  const deselectAllPages = () => {
    setPagePreviews(pagePreviews.map((p) => ({ ...p, selected: false })));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setPagePreviews([]); // Clear previous previews
      toast.success(`Loaded: ${file.name}`);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const addCustomRange = () => {
    const newId = (customRanges.length + 1).toString();
    setCustomRanges([...customRanges, { id: newId, from: 1, to: 2 }]);
  };

  const removeCustomRange = (id: string) => {
    if (customRanges.length > 1) {
      setCustomRanges(customRanges.filter((range) => range.id !== id));
    }
  };

  const updateCustomRange = (id: string, field: 'from' | 'to', value: number) => {
    setCustomRanges(
      customRanges.map((range) =>
        range.id === id ? { ...range, [field]: Math.max(1, value) } : range
      )
    );
  };

  const generateRangesFromMode = (): { from: number; to: number }[] => {
    if (pdfPageCount === 0) return [];

    switch (splitMode) {
      case 'range':
        if (rangeMode === 'custom') {
          return customRanges.map((r) => ({ from: r.from, to: r.to }));
        } else {
          // Fixed interval ranges
          const ranges: { from: number; to: number }[] = [];
          for (let i = 1; i <= pdfPageCount; i += fixedInterval) {
            ranges.push({
              from: i,
              to: Math.min(i + fixedInterval - 1, pdfPageCount),
            });
          }
          return ranges;
        }

      case 'pages':
        // Extract every N pages
        const pageRanges: { from: number; to: number }[] = [];
        for (let i = extractEveryNPages; i <= pdfPageCount; i += extractEveryNPages) {
          pageRanges.push({ from: i, to: i });
        }
        return pageRanges;

      case 'size':
        // For size-based splitting, we'll approximate based on page count
        // Assuming roughly equal page sizes
        const pagesPerSplit = Math.ceil(pdfPageCount / Math.ceil(pdfPageCount / (splitBySize * 2)));
        const sizeRanges: { from: number; to: number }[] = [];
        for (let i = 1; i <= pdfPageCount; i += pagesPerSplit) {
          sizeRanges.push({
            from: i,
            to: Math.min(i + pagesPerSplit - 1, pdfPageCount),
          });
        }
        return sizeRanges;

      default:
        return [];
    }
  };

  const handleSplit = async () => {
    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    if (pdfPageCount === 0) {
      toast.error('Invalid PDF file');
      return;
    }

    setIsSplitting(true);
    const startTime = Date.now();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);

      // Check if user manually selected pages
      const selectedPages = pagePreviews.filter((p) => p.selected);
      const hasManualSelection = selectedPages.length > 0;

      if (hasManualSelection) {
        // Manual selection mode - extract selected pages only
        const selectedPdf = await PDFDocument.create();
        const selectedPageIndices = selectedPages.map((p) => p.pageNumber - 1);
        const copiedPages = await selectedPdf.copyPages(originalPdf, selectedPageIndices);
        copiedPages.forEach((page) => selectedPdf.addPage(page));

        const pdfBytes = await selectedPdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });

        // Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedFile.name.replace('.pdf', '')}_selected_pages.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        // Log action
        await logSplitAction(
          user?.uid,
          selectedPages.length,
          selectedFile.size,
          blob.size,
          Date.now() - startTime,
          'PDF',
          'success'
        );

        toast.success(`Extracted ${selectedPages.length} selected pages!`);
        return;
      }

      // Otherwise, use the configured split mode
      const ranges = generateRangesFromMode();

      if (ranges.length === 0) {
        toast.error('No valid ranges to split');
        setIsSplitting(false);
        return;
      }

      // Validate ranges
      for (const range of ranges) {
        if (range.from > pdfPageCount || range.to > pdfPageCount) {
          toast.error(`Invalid range: ${range.from}-${range.to}. PDF has only ${pdfPageCount} pages.`);
          setIsSplitting(false);
          return;
        }
      }

      if (mergeRanges && splitMode === 'range') {
        // Merge all ranges into one PDF
        const mergedPdf = await PDFDocument.create();
        
        for (const range of ranges) {
          const pages = await mergedPdf.copyPages(
            originalPdf,
            Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from - 1 + i)
          );
          pages.forEach((page) => mergedPdf.addPage(page));
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
        
        // Download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedFile.name.replace('.pdf', '')}_merged.pdf`;
        link.click();
        URL.revokeObjectURL(url);

        // Log action (pages, inputSize, outputSize, duration, format, status, errorMessage)
        await logSplitAction(
          user?.uid,
          pdfPageCount,
          selectedFile.size,
          blob.size,
          Date.now() - startTime,
          'PDF',
          'success'
        );

        toast.success('Merged PDF downloaded successfully!');
      } else {
        // Split into separate PDFs
        let totalOutputSize = 0;

        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          const splitPdf = await PDFDocument.create();

          const pageIndices = Array.from(
            { length: range.to - range.from + 1 },
            (_, idx) => range.from - 1 + idx
          );

          const pages = await splitPdf.copyPages(originalPdf, pageIndices);
          pages.forEach((page) => splitPdf.addPage(page));

          const pdfBytes = await splitPdf.save();
          const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
          totalOutputSize += blob.size;

          // Download each split
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedFile.name.replace('.pdf', '')}_part_${i + 1}_pages_${range.from}-${range.to}.pdf`;
          link.click();
          URL.revokeObjectURL(url);

          // Small delay between downloads
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        // Log action (pages, inputSize, outputSize, duration, format, status, errorMessage)
        await logSplitAction(
          user?.uid,
          pdfPageCount,
          selectedFile.size,
          totalOutputSize,
          Date.now() - startTime,
          'PDF',
          'success'
        );

        toast.success(`Split into ${ranges.length} PDF files!`);
      }
    } catch (error: any) {
      console.error('Split error:', error);
      
      // Log error (pages, inputSize, outputSize, duration, format, status, errorMessage)
      await logSplitAction(
        user?.uid,
        pdfPageCount,
        selectedFile.size,
        0,
        Date.now() - startTime,
        'PDF',
        'error',
        error.message
      );
      
      toast.error(`Failed to split: ${error.message}`);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
    }`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-4xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Split
              </h1>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Separate PDF pages into multiple documents
              </p>
            </div>

            {/* File Upload Section */}
            {!selectedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border-2 border-dashed p-12 text-center ${
                  isDarkMode
                    ? 'bg-white/5 border-white/20 hover:border-blue-500/50'
                    : 'bg-white/60 border-gray-300 hover:border-blue-500'
                } transition-all duration-300 backdrop-blur-xl`}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <FiUpload
                    className={`mx-auto mb-4 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-500'
                    }`}
                    size={64}
                  />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Select PDF file
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Click to browse or drag and drop
                  </p>
                </label>
              </motion.div>
            ) : (
              <>
                {/* Selected File Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 mb-6 flex items-center justify-between ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/60 border-gray-200'
                  } backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <FiFile className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={24} />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {selectedFile.name}
                      </h4>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {pdfPageCount} pages • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPdfPageCount(0);
                    }}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      isDarkMode
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    Remove
                  </button>
                </motion.div>

                {/* Split Mode Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200/20 pb-2">
                  <button
                    onClick={() => setSplitMode('range')}
                    className={`flex-1 py-3 px-4 rounded-t-lg font-medium transition-all ${
                      splitMode === 'range'
                        ? isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                          : 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      Range
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode('pages')}
                    className={`flex-1 py-3 px-4 rounded-t-lg font-medium transition-all ${
                      splitMode === 'pages'
                        ? isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                          : 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Pages
                    </div>
                  </button>
                  <button
                    onClick={() => setSplitMode('size')}
                    className={`flex-1 py-3 px-4 rounded-t-lg font-medium transition-all ${
                      splitMode === 'size'
                        ? isDarkMode
                          ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                          : 'bg-blue-100 text-blue-600 border-b-2 border-blue-600'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-300'
                          : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                      Size
                    </div>
                  </button>
                </div>

                {/* Split Configuration Panel */}
                <motion.div
                  key={splitMode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border p-6 mb-6 ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/60 border-gray-200'
                  } backdrop-blur-xl`}
                >
                  <AnimatePresence mode="wait">
                    {/* RANGE MODE */}
                    {splitMode === 'range' && (
                      <motion.div
                        key="range"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <h3 className={`text-lg font-semibold mb-4 ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          Range mode:
                        </h3>

                        {/* Range Mode Selection */}
                        <div className="flex gap-3 mb-6">
                          <button
                            onClick={() => setRangeMode('custom')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                              rangeMode === 'custom'
                                ? isDarkMode
                                  ? 'bg-red-500/20 text-red-400 border-2 border-red-500'
                                  : 'bg-red-100 text-red-600 border-2 border-red-500'
                                : isDarkMode
                                  ? 'bg-white/5 text-gray-400 border-2 border-transparent hover:border-white/20'
                                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                            }`}
                          >
                            Custom ranges
                          </button>
                          <button
                            onClick={() => setRangeMode('fixed')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all ${
                              rangeMode === 'fixed'
                                ? isDarkMode
                                  ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                                  : 'bg-blue-100 text-blue-600 border-2 border-blue-500'
                                : isDarkMode
                                  ? 'bg-white/5 text-gray-400 border-2 border-transparent hover:border-white/20'
                                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-gray-300'
                            }`}
                          >
                            Fixed ranges
                          </button>
                        </div>

                        {rangeMode === 'custom' ? (
                          <div className="space-y-4">
                            {customRanges.map((range, index) => (
                              <motion.div
                                key={range.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3"
                              >
                                <div className={`px-3 py-2 rounded-lg font-medium ${
                                  isDarkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  Range {index + 1}
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                  <label className={`text-sm ${
                                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    from page
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={pdfPageCount}
                                    value={range.from}
                                    onChange={(e) =>
                                      updateCustomRange(range.id, 'from', parseInt(e.target.value) || 1)
                                    }
                                    className={`w-20 px-3 py-2 rounded-lg text-center font-medium ${
                                      isDarkMode
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'bg-white border border-gray-300 text-slate-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  />
                                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    to
                                  </span>
                                  <input
                                    type="number"
                                    min="1"
                                    max={pdfPageCount}
                                    value={range.to}
                                    onChange={(e) =>
                                      updateCustomRange(range.id, 'to', parseInt(e.target.value) || 1)
                                    }
                                    className={`w-20 px-3 py-2 rounded-lg text-center font-medium ${
                                      isDarkMode
                                        ? 'bg-white/10 text-white border border-white/20'
                                        : 'bg-white border border-gray-300 text-slate-900'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                  />
                                </div>
                                {customRanges.length > 1 && (
                                  <button
                                    onClick={() => removeCustomRange(range.id)}
                                    className={`p-2 rounded-lg transition-all ${
                                      isDarkMode
                                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                    }`}
                                  >
                                    <FiTrash2 size={18} />
                                  </button>
                                )}
                              </motion.div>
                            ))}

                            <button
                              onClick={addCustomRange}
                              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                                isDarkMode
                                  ? 'bg-white/5 text-blue-400 border-2 border-dashed border-white/20 hover:border-blue-400'
                                  : 'bg-white border-2 border-dashed border-gray-300 text-blue-600 hover:border-blue-500'
                              }`}
                            >
                              <FiPlus size={20} />
                              Add Range
                            </button>

                            {/* Merge Option */}
                            <div className={`flex items-center gap-3 p-4 rounded-lg ${
                              isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                            }`}>
                              <input
                                type="checkbox"
                                id="merge-ranges"
                                checked={mergeRanges}
                                onChange={(e) => setMergeRanges(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label
                                htmlFor="merge-ranges"
                                className={`text-sm cursor-pointer ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                Merge all ranges in one PDF file.
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <label className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                Extract every
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={pdfPageCount}
                                value={fixedInterval}
                                onChange={(e) => setFixedInterval(parseInt(e.target.value) || 1)}
                                className={`w-20 px-3 py-2 rounded-lg text-center font-medium ${
                                  isDarkMode
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'bg-white border border-gray-300 text-slate-900'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              />
                              <label className={`text-sm font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                pages into a separate document
                              </label>
                            </div>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              This will create {Math.ceil(pdfPageCount / fixedInterval)} PDF files
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* PAGES MODE */}
                    {splitMode === 'pages' && (
                      <motion.div
                        key="pages"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <h3 className={`text-lg font-semibold mb-4 ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          Extract specific pages:
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <label className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Extract page
                            </label>
                            <input
                              type="number"
                              min="1"
                              max={pdfPageCount}
                              value={extractEveryNPages}
                              onChange={(e) => setExtractEveryNPages(parseInt(e.target.value) || 1)}
                              className={`w-20 px-3 py-2 rounded-lg text-center font-medium ${
                                isDarkMode
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : 'bg-white border border-gray-300 text-slate-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <label className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              and every {extractEveryNPages} pages after
                            </label>
                          </div>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            This will extract approximately {Math.floor(pdfPageCount / extractEveryNPages)} pages
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* SIZE MODE */}
                    {splitMode === 'size' && (
                      <motion.div
                        key="size"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <h3 className={`text-lg font-semibold mb-4 ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}>
                          Split by file size:
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <label className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Maximum size per file:
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={splitBySize}
                              onChange={(e) => setSplitBySize(parseInt(e.target.value) || 5)}
                              className={`w-20 px-3 py-2 rounded-lg text-center font-medium ${
                                isDarkMode
                                  ? 'bg-white/10 text-white border border-white/20'
                                  : 'bg-white border border-gray-300 text-slate-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            <label className={`text-sm font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              MB
                            </label>
                          </div>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            The PDF will be split into files of approximately {splitBySize} MB each
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Loading Previews Indicator */}
                {isLoadingPreviews && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`rounded-2xl border p-8 mb-6 text-center ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                    } backdrop-blur-xl`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <p className={`text-lg font-medium ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Generating page previews...
                      </p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        This may take a moment for large PDFs
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Page Previews Grid */}
                {pagePreviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-6 mb-6 ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/60 border-gray-200'
                    } backdrop-blur-xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        All Pages ({pagePreviews.length})
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllPages}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          Select All
                        </button>
                        <button
                          onClick={deselectAllPages}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                      {pagePreviews.map((pageData) => (
                        <motion.div
                          key={pageData.pageNumber}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                            pageData.selected
                              ? isDarkMode
                                ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500'
                                : 'bg-blue-100 border-blue-500 ring-2 ring-blue-500'
                              : isDarkMode
                                ? 'bg-white/5 border-white/20 hover:border-white/40'
                                : 'bg-white/80 border-gray-200 hover:border-gray-400'
                          }`}
                          onClick={() => togglePageSelection(pageData.pageNumber)}
                        >
                          {/* Page Preview */}
                          <div className="aspect-[3/4] overflow-hidden bg-gray-900">
                            <img
                              src={pageData.preview}
                              alt={`Page ${pageData.pageNumber}`}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Selection Indicator */}
                          <div className="absolute top-1.5 right-1.5">
                            {pageData.selected ? (
                              <FiCheckCircle size={20} className="text-blue-400 drop-shadow-lg" />
                            ) : (
                              <FiCircle size={20} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>

                          {/* Page Number */}
                          <div className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-xs font-bold ${
                            isDarkMode
                              ? 'bg-slate-900/80 text-white'
                              : 'bg-white/90 text-slate-900'
                          }`}>
                            {pageData.pageNumber}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <p className={`text-sm mt-4 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      💡 Click on pages to select/deselect them for manual selection mode
                    </p>
                  </motion.div>
                )}

                {/* Split Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleSplit}
                  disabled={isSplitting || pdfPageCount === 0}
                  className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                    isSplitting || pdfPageCount === 0
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/50 transform hover:scale-[1.02]'
                  }`}
                >
                  {isSplitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Splitting PDF...
                    </>
                  ) : (
                    <>
                      <FiScissors size={24} />
                      Split & Download
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Split;
