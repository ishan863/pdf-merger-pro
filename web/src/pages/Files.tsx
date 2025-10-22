import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiTrash2, FiDownload, FiShare2, FiClock, FiSearch } from 'react-icons/fi';
import { useFileStore } from '@/context/fileContext';
import EnhancedUploadZone from '@/components/EnhancedUploadZone';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const Files: React.FC = () => {
  const { files } = useFileStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Use demo files if no actual files exist
  const displayFiles = files;

  const filteredFiles = displayFiles.filter((file: any) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const handleDeleteSelected = () => {
    // Delete implementation would go here
    setSelectedFiles(new Set());
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          {/* Header with search and actions */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className={`text-4xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              My Files
            </h1>

            {/* Search bar and actions */}
            <div className="flex gap-4 mb-6">
              <div className={`flex-1 relative backdrop-blur-md border rounded-xl px-4 py-3 ${
                isDarkMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-white/40'
              }`}>
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-8 bg-transparent outline-none ${
                    isDarkMode ? 'text-white placeholder-gray-400' : 'text-slate-900 placeholder-gray-600'
                  }`}
                />
              </div>

              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
              >
                <FiUpload size={20} />
                Upload Files
              </button>

              {selectedFiles.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-6 py-3 bg-red-500/20 text-red-500 rounded-xl font-medium hover:bg-red-500/30 transition-all flex items-center gap-2"
                >
                  <FiTrash2 size={20} />
                  Delete ({selectedFiles.size})
                </button>
              )}
            </div>
          </motion.div>

          {/* Upload zone modal */}
          {isUploadOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setIsUploadOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-2xl rounded-2xl border ${
                  isDarkMode
                    ? 'bg-gradient-to-b from-white/10 to-white/5 border-white/20'
                    : 'bg-gradient-to-b from-white/80 to-white/60 border-white/40'
                } backdrop-blur-xl p-8`}
              >
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Upload Files
                </h2>
                <EnhancedUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
              </motion.div>
            </motion.div>
          )}

          {/* Files grid */}
          {filteredFiles.length > 0 ? (
            <motion.div
              layout
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                    selectedFiles.has(file.id)
                      ? isDarkMode
                        ? 'bg-blue-500/20 border-blue-500/50'
                        : 'bg-blue-500/10 border-blue-500/30'
                      : isDarkMode
                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-white/40 border-white/20 hover:bg-white/60 hover:border-white/40'
                  } backdrop-blur-md`}
                  onClick={() => toggleFileSelection(file.id)}
                >
                  {/* Checkbox */}
                  <div className="absolute top-4 right-4 w-5 h-5 rounded border-2 flex items-center justify-center"
                    style={{
                      borderColor: selectedFiles.has(file.id) ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: selectedFiles.has(file.id) ? '#3b82f6' : 'transparent',
                    }}
                  >
                    {selectedFiles.has(file.id) && <span className="text-white text-sm">✓</span>}
                  </div>

                  {/* Thumbnail */}
                  <div className={`w-full h-40 rounded-lg mb-4 flex items-center justify-center font-bold text-2xl ${
                    isDarkMode ? 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                  }`}>
                    PDF
                  </div>

                  {/* File info */}
                  <h3 className={`font-semibold truncate mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {file.name}
                  </h3>

                  <div className={`text-sm mb-3 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <p>{formatFileSize(file.size)}</p>
                    <p className="flex items-center gap-2">
                      <FiClock size={14} />
                      {formatDate(file.uploadedAt)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-all flex items-center justify-center gap-1">
                      <FiDownload size={16} />
                      Download
                    </button>
                    <button className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all flex items-center justify-center gap-1">
                      <FiShare2 size={16} />
                      Share
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex flex-col items-center justify-center h-96 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <div className="text-6xl mb-4">📂</div>
              <p className="text-xl font-medium mb-2">No files found</p>
              <p className="text-sm">Upload your first PDF to get started</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Files;
