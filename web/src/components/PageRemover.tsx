/**
 * Page Remover Component
 * Allows users to select and delete specific pages from PDFs
 * Features: thumbnail preview, multi-select, range select, visual feedback
 * Used in: Merge, Split, and Convert operations
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiChevronDown, FiX } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageRemoverProps {
  pdfBlob: Blob;
  fileName: string;
  onPagesSelected: (selectedPages: number[]) => void;
  onPagesRemoved?: (removedPages: number[]) => void;
  isDarkMode?: boolean;
  maxHeight?: string;
}

interface PageThumbnail {
  pageNum: number;
  canvas?: string;
}

export const PageRemover: React.FC<PageRemoverProps> = ({
  pdfBlob,
  fileName,
  onPagesSelected,
  onPagesRemoved,
  isDarkMode = false,
  maxHeight = 'max-h-96',
}) => {
  const [pages, setPages] = useState<PageThumbnail[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load PDF and generate thumbnails
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setTotalPages(pdf.numPages);

        const pageArray: PageThumbnail[] = [];
        
        // Generate thumbnails for all pages
        for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
          // Limit to 50 pages for performance
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context!,
            viewport: viewport,
          }).promise;

          pageArray.push({
            pageNum: i,
            canvas: canvas.toDataURL('image/png'),
          });
        }

        setPages(pageArray);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfBlob]);

  const togglePage = (pageNum: number) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageNum)) {
      newSelected.delete(pageNum);
    } else {
      newSelected.add(pageNum);
    }
    setSelectedPages(newSelected);
    onPagesSelected(Array.from(newSelected).sort((a, b) => a - b));
  };

  const selectAll = () => {
    const allPages = new Set(pages.map(p => p.pageNum));
    setSelectedPages(allPages);
    onPagesSelected(Array.from(allPages));
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
    onPagesSelected([]);
  };

  // Range selection feature - available for future use
  // const selectRange = (startPage: number, endPage: number) => {
  //   const newSelected = new Set(selectedPages);
  //   const min = Math.min(startPage, endPage);
  //   const max = Math.max(startPage, endPage);
  //   for (let i = min; i <= max; i++) {
  //     newSelected.add(i);
  //   }
  //   setSelectedPages(newSelected);
  //   onPagesSelected(Array.from(newSelected).sort((a, b) => a - b));
  // };

  const removeSelectedPages = () => {
    const removedPages = Array.from(selectedPages).sort((a, b) => a - b);
    onPagesRemoved?.(removedPages);
    deselectAll();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl border ${
        isDarkMode
          ? 'bg-white/5 border-white/10 hover:border-white/20'
          : 'bg-white/30 border-white/40 hover:border-white/60'
      } transition-all`}
    >
      {/* Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 transition-colors rounded-t-xl ${
          isDarkMode
            ? 'hover:bg-white/5'
            : 'hover:bg-white/40'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <div className={`w-2 h-2 rounded-full ${
            selectedPages.size > 0 ? 'bg-red-500' : 'bg-green-500'
          }`} />
          <div>
            <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {fileName}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalPages} pages • {selectedPages.size} selected for removal
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown size={20} />
        </motion.div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t ${isDarkMode ? 'border-white/10' : 'border-white/40'} overflow-hidden`}
          >
            {/* Controls */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-white/10 bg-white/2' : 'border-white/40 bg-white/20'} flex gap-2 flex-wrap`}>
              <button
                onClick={selectAll}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-blue-500/30 hover:bg-blue-500/50 text-blue-300'
                    : 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-700'
                }`}
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-gray-500/30 hover:bg-gray-500/50 text-gray-300'
                    : 'bg-gray-500/20 hover:bg-gray-500/40 text-gray-700'
                }`}
              >
                Deselect All
              </button>
              {selectedPages.size > 0 && (
                <button
                  onClick={removeSelectedPages}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                    isDarkMode
                      ? 'bg-red-500/30 hover:bg-red-500/50 text-red-300'
                      : 'bg-red-500/20 hover:bg-red-500/40 text-red-700'
                  }`}
                >
                  <FiTrash2 size={14} />
                  Remove {selectedPages.size}
                </button>
              )}
            </div>

            {/* Page Thumbnails */}
            {loading ? (
              <div className={`p-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading pages...
              </div>
            ) : (
              <div className={`p-4 ${maxHeight} overflow-y-auto grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2`}>
                {pages.map((page) => (
                  <motion.button
                    key={page.pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePage(page.pageNum)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPages.has(page.pageNum)
                        ? isDarkMode
                          ? 'border-red-500 bg-red-500/20'
                          : 'border-red-400 bg-red-500/20'
                        : isDarkMode
                        ? 'border-white/10 hover:border-white/30'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img
                      src={page.canvas}
                      alt={`Page ${page.pageNum}`}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      selectedPages.has(page.pageNum)
                        ? isDarkMode
                          ? 'bg-red-500/30'
                          : 'bg-red-500/20'
                        : 'bg-transparent group-hover:bg-black/10'
                    }`}>
                      <span className={`text-xs font-bold ${
                        selectedPages.has(page.pageNum)
                          ? 'text-red-300 drop-shadow'
                          : isDarkMode
                          ? 'text-white/70'
                          : 'text-white/50'
                      }`}>
                        {page.pageNum}
                      </span>
                    </div>
                    {selectedPages.has(page.pageNum) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                      >
                        <FiX size={12} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PageRemover;
