/**
 * Page Editor Modal Component
 * Features: Thumbnail grid, multi-select, bulk actions (rotate, delete, reorder)
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFPage } from '@/types';
import {
  FiX,
  FiRotateCw,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
  FiFile,
} from 'react-icons/fi';
import Toast from './Toast';

interface PageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: PDFPage[];
  onPagesUpdate: (pages: PDFPage[]) => void;
  onPagesDelete: (pageNumbers: number[]) => void;
  onPagesRotate: (pageNumbers: number[], degrees: 90 | 180 | 270) => void;
  onPagesDuplicate: (pageNumbers: number[]) => void;
}

interface PageGridItem extends PDFPage {
  thumbnail?: string;
}

export const PageEditorModal: React.FC<PageEditorModalProps> = ({
  isOpen,
  onClose,
  pages,
  onPagesUpdate,
  onPagesDelete,
  onPagesRotate,
  onPagesDuplicate,
}) => {
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [pageGridItems, setPageGridItems] = useState<PageGridItem[]>(pages);
  const [draggedPage, setDraggedPage] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Update grid when pages change
  React.useEffect(() => {
    setPageGridItems(pages);
  }, [pages]);

  // Toggle page selection
  const togglePageSelection = useCallback(
    (pageNumber: number, isMultiSelect: boolean) => {
      setSelectedPages(prev => {
        const newSet = new Set(prev);
        if (isMultiSelect && prev.size > 0) {
          // Range select if Shift held
          const minPage = Math.min(...prev);
          const maxPage = Math.max(...prev);
          const min = Math.min(minPage, pageNumber);
          const max = Math.max(maxPage, pageNumber);
          newSet.clear();
          for (let i = min; i <= max; i++) {
            newSet.add(i);
          }
        } else if (newSet.has(pageNumber)) {
          newSet.delete(pageNumber);
        } else {
          if (!isMultiSelect) {
            newSet.clear();
          }
          newSet.add(pageNumber);
        }
        return newSet;
      });
    },
    []
  );

  // Select all pages
  const selectAllPages = useCallback(() => {
    setSelectedPages(new Set(pageGridItems.map(p => p.pageNumber)));
  }, [pageGridItems]);

  // Deselect all pages
  const deselectAllPages = useCallback(() => {
    setSelectedPages(new Set());
  }, []);

  // Delete selected pages
  const handleDeletePages = useCallback(() => {
    if (selectedPages.size === 0) {
      setToast({ message: 'No pages selected', type: 'error' });
      return;
    }

    const pageNumbersArray = Array.from(selectedPages).sort((a, b) => b - a);
    onPagesDelete(pageNumbersArray);
    setSelectedPages(new Set());
    setToast({
      message: `Deleted ${pageNumbersArray.length} page(s)`,
      type: 'success',
    });
  }, [selectedPages, onPagesDelete]);

  // Rotate selected pages
  const handleRotatePages = useCallback(
    (degrees: 90 | 180 | 270) => {
      if (selectedPages.size === 0) {
        setToast({ message: 'No pages selected', type: 'error' });
        return;
      }

      const pageNumbersArray = Array.from(selectedPages);
      onPagesRotate(pageNumbersArray, degrees);
      setToast({
        message: `Rotated ${pageNumbersArray.length} page(s) by ${degrees}°`,
        type: 'success',
      });
    },
    [selectedPages, onPagesRotate]
  );

  // Duplicate selected pages
  const handleDuplicatePages = useCallback(() => {
    if (selectedPages.size === 0) {
      setToast({ message: 'No pages selected', type: 'error' });
      return;
    }

    const pageNumbersArray = Array.from(selectedPages);
    onPagesDuplicate(pageNumbersArray);
    setToast({
      message: `Duplicated ${pageNumbersArray.length} page(s)`,
      type: 'success',
    });
  }, [selectedPages, onPagesDuplicate]);

  // Drag handlers
  const handleDragStart = (pageNumber: number) => {
    setDraggedPage(pageNumber);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetPageNumber: number) => {
    if (draggedPage === null || draggedPage === targetPageNumber) return;

    const newPages = [...pageGridItems];
    const draggedIndex = newPages.findIndex(p => p.pageNumber === draggedPage);
    const targetIndex = newPages.findIndex(p => p.pageNumber === targetPageNumber);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      [newPages[draggedIndex], newPages[targetIndex]] = [
        newPages[targetIndex],
        newPages[draggedIndex],
      ];

      setPageGridItems(newPages);
      onPagesUpdate(newPages);
      setToast({
        message: `Moved page ${draggedPage} to position ${targetPageNumber + 1}`,
        type: 'success',
      });
    }

    setDraggedPage(null);
  };

  // Move page up/down
  const movePage = (pageNumber: number, direction: 'up' | 'down') => {
    const currentIndex = pageGridItems.findIndex(p => p.pageNumber === pageNumber);
    if (currentIndex === -1) return;

    const newPages = [...pageGridItems];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= newPages.length) {
      setToast({
        message: `Cannot move page ${direction}`,
        type: 'error',
      });
      return;
    }

    [newPages[currentIndex], newPages[targetIndex]] = [
      newPages[targetIndex],
      newPages[currentIndex],
    ];

    setPageGridItems(newPages);
    onPagesUpdate(newPages);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full h-full max-w-6xl max-h-screen bg-white rounded-xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Pages</h2>
            <p className="text-sm text-gray-600 mt-1">
              {pageGridItems.length} page{pageGridItems.length !== 1 ? 's' : ''} in document
            </p>
          </div>

          {/* Selection Count */}
          {selectedPages.size > 0 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
            >
              {selectedPages.size} selected
            </motion.div>
          )}

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2 overflow-x-auto">
          {/* Selection Controls */}
          <button
            onClick={selectAllPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Select All
          </button>
          <button
            onClick={deselectAllPages}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Deselect
          </button>

          <div className="border-l border-gray-300 h-6" />

          {/* Edit Actions */}
          {selectedPages.size > 0 && (
            <>
              <button
                onClick={() => handleRotatePages(90)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                title="Rotate 90°"
              >
                <FiRotateCw className="h-4 w-4" />
                <span className="hidden sm:inline">Rotate 90°</span>
              </button>

              <button
                onClick={handleDuplicatePages}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                title="Duplicate"
              >
                <FiCopy className="h-4 w-4" />
                <span className="hidden sm:inline">Duplicate</span>
              </button>

              <button
                onClick={handleDeletePages}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition"
                title="Delete"
              >
                <FiTrash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}
        </div>

        {/* Page Grid */}
        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence>
              {pageGridItems.map(page => (
                <motion.div
                  key={page.pageNumber}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={() => handleDragStart(page.pageNumber)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(page.pageNumber)}
                  className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                    selectedPages.has(page.pageNumber)
                      ? 'border-blue-500 bg-blue-50'
                      : draggedPage === page.pageNumber
                      ? 'border-blue-400 opacity-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={e => togglePageSelection(page.pageNumber, e.ctrlKey || e.metaKey)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                      <span className="text-2xl font-bold">
                        {String(page.pageNumber).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Page Number */}
                  <div className="absolute top-1 right-1 bg-gray-900 text-white text-xs font-bold rounded px-1.5 py-0.5">
                    {page.pageNumber}
                  </div>

                  {/* Selection Indicator */}
                  {selectedPages.has(page.pageNumber) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 left-1 bg-blue-500 text-white rounded-full p-1"
                    >
                      <FiCheck className="h-3 w-3" />
                    </motion.div>
                  )}

                  {/* Rotation Indicator */}
                  {page.rotationDegrees !== 0 && (
                    <div className="absolute bottom-1 left-1 bg-orange-500 text-white text-xs font-bold rounded px-1.5 py-0.5">
                      {page.rotationDegrees}°
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-md transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => {
                        e.stopPropagation();
                        movePage(page.pageNumber, 'up');
                      }}
                      className="p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                      title="Move up"
                    >
                      <FiChevronUp className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={e => {
                        e.stopPropagation();
                        movePage(page.pageNumber, 'down');
                      }}
                      className="p-1 bg-white rounded-full shadow-lg hover:bg-gray-100"
                      title="Move down"
                    >
                      <FiChevronDown className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {pageGridItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiFile className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-lg font-medium">No pages</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FiDownload className="h-4 w-4" />
            Done
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      {toast && (
        <Toast
          id={`toast-${Date.now()}`}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
        />
      )}
    </motion.div>
  );
};

export default PageEditorModal;
