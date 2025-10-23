/**
 * Dashboard 2.0 Component
 * Modern, glassmorphic dashboard with file cards, search, and dark mode
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiMoon,
  FiSun,
  FiMoreVertical,
  FiDownload,
  FiTrash2,
  FiShare2,
  FiEye,
  FiClock,
  FiFileText,
} from 'react-icons/fi';

interface FileCard {
  id: string;
  name: string;
  size: number;
  pages: number;
  createdAt: Date;
  lastModified: Date;
  thumbnail?: string;
}

interface DashboardProps {
  files: FileCard[];
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload: (fileId: string) => void;
  onNewFile: () => void;
  onFileShare: (fileId: string) => void;
}

const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  files: FileCard[];
  onFileSelect: (fileId: string) => void;
}> = ({ isOpen, onClose, onSearch, files, onFileSelect }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredFiles = query
    ? files.filter(f =>
      f.name.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
    }
    if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
    if (e.key === 'Enter' && filteredFiles[selectedIndex]) {
      onFileSelect(filteredFiles[selectedIndex].id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <FiSearch className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search files... (⌘K)"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                  onSearch(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="flex-grow bg-transparent outline-none text-gray-900 placeholder-gray-500"
              />
              <kbd className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {filteredFiles.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  {query ? 'No files found' : 'Start typing to search...'}
                </div>
              ) : (
                filteredFiles.map((file, index) => (
                  <motion.button
                    key={file.id}
                    onClick={() => {
                      onFileSelect(file.id);
                      onClose();
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                      index === selectedIndex
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <FiFileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-grow text-left">
                      <p className="font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.pages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {index === selectedIndex && '⏎'}
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FileCardComponent: React.FC<{
  file: FileCard;
  onSelect: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onShare: () => void;
}> = ({ file, onSelect, onDelete, onDownload, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white/70 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
    >
      {/* Thumbnail */}
      <div
        onClick={onSelect}
        className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center cursor-pointer relative overflow-hidden group"
      >
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-white text-center">
            <FiFileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <span className="text-sm font-medium">{file.pages} pages</span>
          </div>
        )}

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={e => {
              e.stopPropagation();
              onSelect();
            }}
            className="bg-white text-blue-600 rounded-full p-4 font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <FiEye className="h-5 w-5" />
            <span>View</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 truncate mb-2 text-sm">
          {file.name}
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <FiFileText className="h-3 w-3" />
            <span>{file.pages} pages</span>
          </div>
          <div className="flex items-center gap-1">
            <FiClock className="h-3 w-3" />
            <span>{formatDate(file.lastModified)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDownload}
            className="flex-1 px-2 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-xs font-medium flex items-center justify-center gap-1"
          >
            <FiDownload className="h-3 w-3" />
            <span>Download</span>
          </motion.button>

          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
              className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <FiMoreVertical className="h-4 w-4 text-gray-600" />
            </motion.button>

            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-40"
              >
                <button
                  onClick={() => {
                    onShare();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <FiShare2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FiTrash2 className="h-4 w-4" />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  onNewFile,
  onFileShare,
}) => {
    const navigate = useNavigate();
  const location = useLocation();
  const { files } = useFileStore();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === '?') {
        // Show keyboard shortcuts help
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredFiles = searchQuery
    ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors ${
        isDarkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900'
      }`}>
        {/* Glassmorphic Navbar */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`sticky top-0 z-40 backdrop-blur-xl ${
            isDarkMode
              ? 'bg-gray-900/80 border-b border-gray-700/50'
              : 'bg-white/70 border-b border-white/20'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                📄
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PDFMerger Pro
              </h1>
            </div>

            {/* Search Bar */}
            <div
              onClick={() => setIsCommandPaletteOpen(true)}
              className={`flex-1 max-w-md mx-8 px-4 py-2 rounded-lg cursor-pointer transition ${
                isDarkMode
                  ? 'bg-gray-800/50 border border-gray-700/50'
                  : 'bg-white/50 border border-white/20'
              } hover:bg-white/70 hover:border-white/40`}
            >
              <div className="flex items-center gap-2 text-gray-500">
                <FiSearch className="h-4 w-4" />
                <span className="text-sm">Press ⌘K to search...</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewFile}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
              >
                <FiPlus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </motion.button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition ${
                  isDarkMode
                    ? 'bg-gray-800 text-yellow-400'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isDarkMode ? (
                  <FiSun className="h-5 w-5" />
                ) : (
                  <FiMoon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold mb-2">Your Documents</h2>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              {files.length} file{files.length !== 1 ? 's' : ''} • Manage, edit, and share your PDFs
            </p>
          </motion.div>

          {/* File Grid */}
          {filteredFiles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold mb-2">No files yet</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                {searchQuery ? 'Try a different search' : 'Create a new PDF to get started'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FileCardComponent
                      file={file}
                      onSelect={() => onFileSelect(file.id)}
                      onDelete={() => onFileDelete(file.id)}
                      onDownload={() => onFileDownload(file.id)}
                      onShare={() => onFileShare(file.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSearch={setSearchQuery}
        files={files}
        onFileSelect={onFileSelect}
      />
    </div>
  );
};

export default Dashboard;
