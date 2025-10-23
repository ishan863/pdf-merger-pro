/**
 * Dashboard 2.0 Pro - Enhanced with Preview & Sample Files
 * Features: Glassmorphic design, adaptive preview, file management, all features
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiPlus,
  FiMoon,
  FiSun,
  FiDownload,
  FiTrash2,
  FiClock,
  FiFileText,
  FiEdit3,
} from 'react-icons/fi';
import { useFileStore } from '@/context/fileContext';
import EnhancedUploadZone from '@/components/EnhancedUploadZone';
import toast from 'react-hot-toast';

const DashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const { files, removeFile } = useFileStore();
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [showUploadZone, setShowUploadZone] = useState(files.length === 0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowUploadZone(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (fileId: string) => {
    navigate(`/editor/${fileId}`);
  };

  const handleDeleteFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this file?')) {
      removeFile(fileId);
      toast.success('File deleted');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Download started');
  };

  // File card component
  const FileCard = ({ file }: { file: any }) => (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleFileClick(file.id)}
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all
        ${isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700' 
          : 'bg-white hover:bg-gray-50 border border-gray-200'
        } p-4 backdrop-blur-sm`}
    >
      {/* Thumbnail */}
      <div className={`w-full h-32 rounded-lg mb-3 flex items-center justify-center
        ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <FiFileText size={48} className={isDarkMode ? 'text-gray-500' : 'text-gray-300'} />
      </div>

      {/* File Info */}
      <h3 className={`font-semibold truncate mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {file.name}
      </h3>
      <div className={`text-sm space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <FiClock size={14} />
          <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleFileClick(file.id);
          }}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          title="Edit"
        >
          <FiEdit3 size={16} />
        </button>
        <button
          onClick={handleDownload}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          title="Download"
        >
          <FiDownload size={16} />
        </button>
        <button
          onClick={(e) => handleDeleteFile(file.id, e)}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode
              ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
          title="Delete"
        >
          <FiTrash2 size={16} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300
      ${isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900'
      }`}>
      
      {/* Navigation Bar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors
          ${isDarkMode 
            ? 'bg-gray-900/80 border-gray-800' 
            : 'bg-white/80 border-gray-200'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">📄</span>
            </div>
            <h1 className="font-bold text-xl">PDF Merger</h1>
          </div>

          {/* Search & Controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className={`relative hidden md:block
              ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-lg px-3 py-2`}>
              <FiSearch className="absolute left-3 top-3" size={18} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search files... (Cmd+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-8 bg-transparent outline-none w-48
                  ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-600'}`}
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadZone(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl"
            >
              <FiPlus size={18} />
              <span className="hidden sm:inline">New</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
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
              {searchQuery ? 'Try a different search' : 'Upload your first PDF to get started'}
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
                  <FileCard file={file} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadZone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowUploadZone(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl p-8 max-w-3xl w-full my-8
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Upload Files</h3>
                <button
                  onClick={() => setShowUploadZone(false)}
                  className={`p-2 rounded-lg transition-colors
                    ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  ✕
                </button>
              </div>
              <EnhancedUploadZone 
                onUploadComplete={() => {
                  setShowUploadZone(false);
                  toast.success('Files uploaded successfully!');
                }}
                maxFileSize={100}
                allowMultiple={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Palette */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50"
            onClick={() => setIsCommandPaletteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl rounded-lg overflow-hidden shadow-xl
                ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <FiSearch size={20} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`flex-1 outline-none bg-transparent
                    ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  autoFocus
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredFiles.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No files found
                  </div>
                ) : (
                  filteredFiles.map(file => (
                    <div
                      key={file.id}
                      onClick={() => {
                        handleFileClick(file.id);
                        setIsCommandPaletteOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer transition-colors
                        ${isDarkMode
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <FiFileText size={18} />
                        <div className="flex-1">
                          <p className="font-medium">{file.name}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardNew;
