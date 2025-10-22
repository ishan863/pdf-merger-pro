import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEditorStore } from '../context/editorContext';
import { rotatePages, deletePages } from '../utils/pdfOperations';
import toast from 'react-hot-toast';
import {
  FaSyncAlt,
  FaTrash,
  FaDownload,
  FaUndoAlt,
  FaRedoAlt,
  FaLayerGroup,
  FaColumns,
} from 'react-icons/fa';

interface ToolbarProps {
  onDownload?: () => void;
  onMerge?: () => void;
  onSplit?: () => void;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({ onDownload, onMerge, onSplit, className = '' }) => {
  const {
    pages,
    selectedPages,
    setPages,
    currentFile,
    setCurrentFile,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useEditorStore();

  const [isProcessing, setIsProcessing] = useState(false);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;
  const hasSelection = selectedPages.size > 0;

  const handleRotate = async () => {
    if (!hasSelection) {
      toast.error('Please select pages to rotate');
      return;
    }

    if (!currentFile?.blob) {
      toast.error('No file loaded');
      return;
    }

    setIsProcessing(true);
    try {
      const selectedPageNumbers = Array.from(selectedPages);
      
      // Perform actual PDF rotation
      const rotatedBlob = await rotatePages(currentFile.blob, selectedPageNumbers, 90);
      
      // Update the current file blob
      setCurrentFile({
        ...currentFile,
        blob: rotatedBlob,
      });

      // Update page rotation in state for UI
      const rotatedPagesState = pages.map((page) =>
        selectedPageNumbers.includes(page.pageNumber)
          ? { ...page, rotation: (((page as any).rotation || 0) + 90) % 360 }
          : page
      );
      setPages(rotatedPagesState);

      toast.success(`✓ Rotated ${selectedPageNumbers.length} page(s)`);
    } catch (error) {
      toast.error('Failed to rotate pages');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!hasSelection) {
      toast.error('Please select pages to delete');
      return;
    }

    if (!currentFile?.blob) {
      toast.error('No file loaded');
      return;
    }

    // Confirm deletion
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedPages.size} page(s)? This cannot be undone.`
      )
    ) {
      setIsProcessing(true);
      try {
        const selectedPageNumbers = Array.from(selectedPages).sort((a, b) => a - b);
        
        // Perform actual PDF page deletion
        const deletedBlob = await deletePages(currentFile.blob, selectedPageNumbers);
        
        // Update the current file blob
        const newPageCount = pages.length - selectedPageNumbers.length;
        setCurrentFile({
          ...currentFile,
          blob: deletedBlob,
          pages: newPageCount,
        });

        // Update pages state
        let updatedPages = pages.filter((p) => !selectedPageNumbers.includes(p.pageNumber));
        
        // Renumber pages
        updatedPages = updatedPages.map((p, i) => ({
          ...p,
          pageNumber: i + 1,
        }));

        setPages(updatedPages);
        toast.success(`✓ Deleted ${selectedPageNumbers.length} page(s)`);
      } catch (error) {
        toast.error('Failed to delete pages');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleUndo = () => {
    if (canUndo) {
      undo();
      toast.success('✓ Undo');
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
      toast.success('✓ Redo');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border-2 border-gray-200 rounded-xl shadow-md p-4 ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-200">
          <div className="text-sm md:text-base font-semibold text-gray-800">
            {hasSelection
              ? `${selectedPages.size} page${selectedPages.size !== 1 ? 's' : ''} selected`
              : 'Click thumbnails to select pages'}
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-300" />

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Merge Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onMerge) onMerge();
              else toast('Open Merge modal', { icon: '🔀' });
            }}
            disabled={isProcessing}
            title="Merge PDFs (M)"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
            }`}
          >
            <FaLayerGroup size={18} />
            <span className="hidden sm:inline">Merge</span>
          </motion.button>

          {/* Split Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onSplit) onSplit();
              else toast('Open Split/Extract modal', { icon: '✂️' });
            }}
            disabled={isProcessing}
            title="Split/Extract (S)"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-700 shadow-md hover:shadow-lg'
            }`}
          >
            <FaColumns size={18} />
            <span className="hidden sm:inline">Split</span>
          </motion.button>

          {/* Rotate Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRotate}
            disabled={!hasSelection || isProcessing}
            title="Rotate 90° (R)"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              !hasSelection || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg'
            }`}
          >
            <FaSyncAlt size={18} />
            <span className="hidden sm:inline">Rotate</span>
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={!hasSelection || isProcessing}
            title="Delete selected pages (D)"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              !hasSelection || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg'
            }`}
          >
            <FaTrash size={18} />
            <span className="hidden sm:inline">Delete</span>
          </motion.button>
        </div>

        <div className="hidden md:block w-px h-10 bg-gray-300" />

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Undo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUndo}
            disabled={!canUndo || isProcessing}
            title="Undo (Ctrl+Z)"
            className={`p-2.5 rounded-lg transition-all ${
              !canUndo || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaUndoAlt size={18} />
          </motion.button>

          {/* Redo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRedo}
            disabled={!canRedo || isProcessing}
            title="Redo (Ctrl+Shift+Z)"
            className={`p-2.5 rounded-lg transition-all ${
              !canRedo || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            <FaRedoAlt size={18} />
          </motion.button>

          <div className="w-px h-8 bg-gray-300" />

          {/* Download */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            disabled={pages.length === 0 || isProcessing}
            title="Download PDF"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              pages.length === 0 || isProcessing
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-md hover:shadow-lg'
            }`}
          >
            <FaDownload size={18} />
            <span className="hidden sm:inline">Download</span>
          </motion.button>
        </div>

        {/* Status */}
        {isProcessing && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-primary-600"
          >
            <div className="w-5 h-5 border-3 border-primary-300 border-t-primary-600 rounded-full" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Toolbar;
