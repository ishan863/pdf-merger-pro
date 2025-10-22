import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload } from 'react-icons/fi';
import { useFileStore } from '@/context/fileContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

const Merge: React.FC = () => {
  const { files } = useFileStore();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const moveFileUp = (index: number) => {
    if (index > 0) {
      const newList = [...selectedFiles];
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
      setSelectedFiles(newList);
    }
  };

  const moveFileDown = (index: number) => {
    if (index < selectedFiles.length - 1) {
      const newList = [...selectedFiles];
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
      setSelectedFiles(newList);
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles((prev) => prev.filter((id) => id !== fileId));
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      toast.error('Select at least 2 files to merge');
      return;
    }

    setIsMerging(true);
    try {
      // Simulate merge operation
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('Files merged successfully!');
      setSelectedFiles([]);
    } catch (error) {
      toast.error('Failed to merge files');
    } finally {
      setIsMerging(false);
    }
  };

  const selectedFilesList = selectedFiles
    .map((id) => files.find((f) => f.id === id))
    .filter(Boolean);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Merge PDFs
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Combine multiple PDF files into one seamless document
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File selection area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl border p-8 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
              } backdrop-blur-xl`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Available Files
              </h2>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.length > 0 ? (
                  files.map((file) => (
                    <motion.button
                      key={file.id}
                      onClick={() => toggleFileSelection(file.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedFiles.includes(file.id)
                          ? isDarkMode
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-blue-500/10 border-blue-500/30'
                          : isDarkMode
                            ? 'bg-white/5 border-white/10 hover:border-white/20'
                            : 'bg-white/40 border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded border-2 flex items-center justify-center"
                          style={{
                            borderColor: selectedFiles.includes(file.id) ? '#3b82f6' : '#e5e7eb',
                            backgroundColor: selectedFiles.includes(file.id) ? '#3b82f6' : 'transparent',
                          }}
                        >
                          {selectedFiles.includes(file.id) && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {file.name}
                        </span>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>No files uploaded yet</p>
                    <p className="text-sm">Upload PDFs to get started</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Merge preview area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl border p-8 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
              } backdrop-blur-xl flex flex-col`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Merge Order ({selectedFiles.length})
              </h2>

              <div className="flex-1 space-y-2 overflow-y-auto mb-6">
                {selectedFilesList.length > 0 ? (
                  selectedFilesList.map((file, index) => (
                    <motion.div
                      key={file?.id}
                      drag="y"
                      dragConstraints={{ top: 0, bottom: 0 }}
                      className={`p-4 rounded-lg border-2 flex items-center justify-between group ${
                        isDarkMode
                          ? 'bg-white/10 border-white/20'
                          : 'bg-white/40 border-white/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className={`font-bold px-3 py-1 rounded ${
                          isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/20 text-blue-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className={`truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {file?.name}
                        </span>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveFileUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1 text-sm rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveFileDown(index)}
                          disabled={index === selectedFilesList.length - 1}
                          className="px-2 py-1 text-sm rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => removeFile(file?.id!)}
                          className="px-2 py-1 text-sm rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className={`flex items-center justify-center h-32 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    <p>Select files to preview merge order</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleMerge}
                disabled={selectedFiles.length < 2 || isMerging}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isMerging ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <FiDownload size={20} />
                    Merge & Download
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Merge;
