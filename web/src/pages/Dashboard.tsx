import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import UploadZone from '@/components/UploadZone';
import MergeModal from '@/components/MergeModal';
import SplitExtractModal from '@/components/SplitExtractModal';
import { useFileStore } from '@/context/fileContext';
import { motion } from 'framer-motion';
import { 
  FaFile, 
  FaTrash, 
  FaEdit, 
  FaPlus, 
  FaClock, 
  FaObjectGroup, 
  FaCut, 
  FaFileExport, 
  FaSync, 
  FaSortAmountDown 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { files, removeFile } = useFileStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showExtractModal, setShowExtractModal] = useState(false);

  const handleFileSelect = (selectedFiles: File[]) => {
    setShowUpload(false);
    // File is already added to store by UploadZone
    if (selectedFiles.length > 0) {
      toast.success(`✓ Ready to edit ${selectedFiles[0].name}`);
      // Optionally navigate to editor immediately for first file
      if (files.length === 1) {
        navigate(`/editor/${files[0].id}`);
      }
    }
  };

  const handleEditFile = (fileId: string) => {
    navigate(`/editor/${fileId}`);
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      removeFile(fileId);
      toast.success('✓ File deleted');
    }
  };

  const recentFiles = [...files].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container-max px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white shadow-xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Dashboard
            </h1>
            <p className="text-lg text-primary-50">
              {files.length === 0
                ? '🚀 Upload your first PDF to get started with powerful editing tools'
                : `📄 You have ${files.length} PDF${files.length !== 1 ? 's' : ''} ready to edit`}
            </p>
          </motion.div>
        </div>

        {/* Upload Zone */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <UploadZone
              onFilesSelected={handleFileSelect}
              maxFileSize={100}
              multiple={true}
            />
          </motion.div>
        )}

        {/* Quick Actions - ALWAYS VISIBLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Merge PDFs */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white shadow-lg cursor-pointer"
              onClick={() => setShowMergeModal(true)}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaObjectGroup size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Merge PDFs</h3>
                  <p className="text-sm text-primary-100">
                    Combine multiple PDF files into one
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Split PDF */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl p-6 text-white shadow-lg cursor-pointer"
              onClick={() => setShowSplitModal(true)}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaCut size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Split PDF</h3>
                  <p className="text-sm text-accent-100">
                    Separate pages into multiple files
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Extract Pages */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-success-500 to-success-600 rounded-xl p-6 text-white shadow-lg cursor-pointer"
              onClick={() => setShowExtractModal(true)}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaFileExport size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Extract Pages</h3>
                  <p className="text-sm text-success-100">
                    Get specific pages from your PDF
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Rotate Pages */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl p-6 text-white shadow-lg cursor-pointer"
              onClick={() => {
                if (files.length === 0) {
                  toast('Please upload a PDF first');
                  setShowUpload(true);
                } else {
                  toast.success('Select a PDF to edit, then use the Rotate button or press R');
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaSync size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Rotate Pages</h3>
                  <p className="text-sm text-warning-100">
                    Adjust page orientation easily
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Reorder Pages */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg cursor-pointer"
              onClick={() => {
                if (files.length === 0) {
                  toast('Please upload a PDF first');
                  setShowUpload(true);
                } else {
                  toast.success('Select a PDF to edit, then drag thumbnails to reorder');
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaSortAmountDown size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Reorder Pages</h3>
                  <p className="text-sm text-purple-100">
                    Drag and drop to rearrange pages
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Delete Pages */}
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl p-6 text-white shadow-lg cursor-pointer"
              onClick={() => {
                if (files.length === 0) {
                  toast('Please upload a PDF first');
                  setShowUpload(true);
                } else {
                  toast.success('Select a PDF to edit, then use the Delete button or press D');
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaTrash size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">Delete Pages</h3>
                  <p className="text-sm text-danger-100">
                    Remove unwanted pages easily
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {files.length > 0 && (
          <div className="flex gap-3 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary flex items-center gap-2"
            >
              <FaPlus size={16} />
              Upload More PDFs
            </motion.button>
          </div>
        )}

        {/* Files Grid */}
        {files.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Files</h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
            {recentFiles.map((file) => (
              <motion.div
                key={file.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-primary-50 to-accent-50 p-4 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <FaClock size={12} />
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <FaFile size={24} className="text-red-500 flex-shrink-0" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3">
                  {/* File Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Size</p>
                      <p className="font-semibold text-gray-900">
                        {(file.size / (1024 * 1024)).toFixed(1)}MB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pages</p>
                      <p className="font-semibold text-gray-900">{file.pages}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {file.status === 'uploaded' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        ✓ Ready
                      </span>
                    )}
                    {file.status === 'error' && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Error
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditFile(file.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded transition text-sm font-medium"
                    >
                      <FaEdit size={14} />
                      Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded transition text-sm font-medium"
                    >
                      <FaTrash size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          </>
        )}

        {/* Empty State */}
        {files.length === 0 && !showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4 opacity-50">📄</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No PDFs yet
            </h2>
            <p className="text-gray-600 mb-6">
              Upload a PDF to start editing
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(true)}
              className="btn-primary"
            >
              Upload Your First PDF
            </motion.button>
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <MergeModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
      />
      <SplitExtractModal
        isOpen={showSplitModal || showExtractModal}
        onClose={() => {
          setShowSplitModal(false);
          setShowExtractModal(false);
        }}
        totalPages={0}
      />
    </div>
  );
};

export default DashboardPage;
