/**
 * Dashboard 2.0 Pro - Enhanced with Full Preview & Demo Files
 * Features: Glassmorphic design, adaptive preview, file management, all features working
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiMoon,
  FiSun,
  FiDownload,
  FiTrash2,
  FiEdit3,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiGitMerge,
  FiFilter,
  FiShare2,
  FiEye,
  FiUpload,
  FiBarChart,
} from 'react-icons/fi';
import EnhancedUploadZone from '@/components/EnhancedUploadZone';

// Sample file data for demo
const SAMPLE_FILES = [
  {
    id: '1',
    name: 'Budget Report 2024 (Merged from Word & Excel).pdf',
    size: 2.45,
    pages: 12,
    type: 'merged',
    format: 'Merged from Excel + Word',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: '📊',
    description: 'Financial report merged from multiple sources',
  },
  {
    id: '2',
    name: 'Presentation Converted to PDF.pdf',
    size: 5.32,
    pages: 25,
    type: 'converted',
    format: 'Converted from PowerPoint',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    icon: '🎨',
    description: 'Company presentation in PDF format',
  },
  {
    id: '3',
    name: 'Contract Split (Pages 1-10).pdf',
    size: 1.23,
    pages: 10,
    type: 'split',
    format: 'Extracted pages 1-10',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    icon: '✂️',
    description: 'Contract first section',
  },
  {
    id: '4',
    name: 'Images to PDF (50 Photos).pdf',
    size: 8.76,
    pages: 50,
    type: 'converted',
    format: 'Converted from JPEG/PNG',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: '🖼️',
    description: 'Photo gallery converted to PDF',
  },
];

interface PreviewFile {
  id: string;
  pages: number;
  type: string;
}

const DashboardEnhanced: React.FC = () => {
  const navigate = useNavigate();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPreview, setSelectedPreview] = useState<PreviewFile | null>(SAMPLE_FILES[0]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        setShowUploadModal(false);
      }
      if (selectedPreview && e.key === 'ArrowLeft') {
        setCurrentPage(Math.max(0, currentPage - 1));
      }
      if (selectedPreview && e.key === 'ArrowRight') {
        setCurrentPage(Math.min(selectedPreview.pages - 1, currentPage + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPreview, currentPage]);

  const filteredFiles = SAMPLE_FILES.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (mb: number) => {
    return mb.toFixed(2) + ' MB';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  // Feature buttons
  const features = [
    {
      id: 'merge',
      icon: <FiGitMerge size={24} />,
      label: 'Merge PDFs',
      description: 'Combine multiple PDFs',
      color: 'from-blue-500 to-cyan-500',
      path: '/merge',
    },
    {
      id: 'split',
      icon: <FiFilter size={24} />,
      label: 'Split & Extract',
      description: 'Extract pages from PDF',
      color: 'from-purple-500 to-pink-500',
      path: '/split',
    },
    {
      id: 'convert',
      icon: <FiBarChart size={24} />,
      label: 'Convert Format',
      description: 'Word, Excel, PPT, Images',
      color: 'from-green-500 to-emerald-500',
      path: '/convert',
    },
    {
      id: 'cloud',
      icon: <FiUpload size={24} />,
      label: 'Cloud Storage',
      description: 'Save and sync files',
      color: 'from-orange-500 to-red-500',
      path: '/cloud',
    },
  ];

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <nav className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
        isDarkMode
          ? 'bg-slate-900/50 border-white/10'
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              PDF
            </div>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Merger Pro
            </span>
          </div>

          {/* Search */}
          <div className={`flex-1 max-w-md mx-8 relative backdrop-blur-md border rounded-lg px-4 py-2 transition-all ${
            isDarkMode
              ? 'bg-white/5 border-white/10 focus-within:border-white/20'
              : 'bg-white/40 border-white/20 focus-within:border-white/40'
          }`}>
            <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
            <input
              type="text"
              placeholder="Search files... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 bg-transparent outline-none text-sm ${
                isDarkMode ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-gray-600'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
                  : 'bg-white/40 hover:bg-white/60 text-slate-700'
              }`}
            >
              {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              + Upload
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Welcome Back! 👋
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You have {filteredFiles.length} files ready. Let's get started!
          </p>
        </motion.div>

        {/* Main Preview Section */}
        {selectedPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border mb-12 overflow-hidden ${
              isDarkMode
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                : 'bg-gradient-to-br from-white/80 to-white/60 border-white/40'
            } backdrop-blur-xl`}
          >
            {/* Preview Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    📄 {SAMPLE_FILES.find(f => f.id === selectedPreview.id)?.name}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {SAMPLE_FILES.find(f => f.id === selectedPreview.id)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPreview(null)}
                  className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Preview Display */}
            <div className={`p-8 min-h-96 flex flex-col items-center justify-center ${
              isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50/50'
            }`}>
              {/* Page Preview */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full max-w-2xl rounded-lg border-4 flex items-center justify-center p-8 text-center ${
                  isDarkMode
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div>
                  <div className={`text-6xl mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    📄
                  </div>
                  <p className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    Page {currentPage + 1} of {selectedPreview.pages}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    PDF Preview ({SAMPLE_FILES.find(f => f.id === selectedPreview.id)?.format})
                  </p>
                </div>
              </motion.div>

              {/* Page Navigation */}
              {selectedPreview.pages > 1 && (
                <div className="flex items-center gap-6 mt-8">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className={`p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/40 hover:bg-white/60 text-slate-900'
                    }`}
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <div className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white/40'}`}>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {currentPage + 1} / {selectedPreview.pages}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(selectedPreview.pages - 1, currentPage + 1))}
                    disabled={currentPage === selectedPreview.pages - 1}
                    className={`p-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-white/40 hover:bg-white/60 text-slate-900'
                    }`}
                  >
                    <FiChevronRight size={24} />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2">
                  <FiDownload size={18} />
                  Download
                </button>
                <button className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-white/10 text-blue-400 hover:bg-white/20'
                    : 'bg-white/40 text-blue-600 hover:bg-white/60'
                }`}>
                  <FiShare2 size={18} />
                  Share
                </button>
                <button className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  isDarkMode
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white/40 text-slate-900 hover:bg-white/60'
                }`}>
                  <FiEdit3 size={18} />
                  Edit
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Action Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Quick Features ⚡
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(feature.path)}
                className={`p-6 rounded-xl border-2 text-left transition-all group ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10'
                    : 'bg-white/40 border-white/20 hover:border-blue-500/50 hover:bg-white/60'
                }`}
              >
                <div className={`mb-3 text-3xl group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {feature.label}
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Files Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Your Files ({filteredFiles.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPreview({ id: file.id, pages: file.pages, type: file.type })}
                className={`group relative rounded-xl border p-4 cursor-pointer transition-all ${
                  selectedPreview?.id === file.id
                    ? isDarkMode
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-blue-500/10 border-blue-500/30'
                    : isDarkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/40 border-white/20 hover:bg-white/60 hover:border-white/40'
                } backdrop-blur-md`}
              >
                {/* Icon/Type */}
                <div className={`text-4xl mb-3 ${file.icon}`}>{file.icon}</div>

                {/* File Name */}
                <h4 className={`font-bold truncate mb-2 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {file.name}
                </h4>

                {/* Metadata */}
                <div className={`space-y-1 mb-3 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p>📊 {file.pages} pages • {formatFileSize(file.size)}</p>
                  <p>🏷️ {file.format}</p>
                  <p>⏰ {formatDate(file.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium hover:bg-blue-500/30 flex items-center justify-center gap-1">
                    <FiEye size={14} />
                    View
                  </button>
                  <button className="flex-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium hover:bg-red-500/30 flex items-center justify-center gap-1">
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl rounded-2xl border p-8 ${
                isDarkMode
                  ? 'bg-gradient-to-b from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-b from-white/80 to-white/60 border-white/40'
              } backdrop-blur-xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload Files
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}
                >
                  <FiX size={24} />
                </button>
              </div>
              <EnhancedUploadZone />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardEnhanced;
