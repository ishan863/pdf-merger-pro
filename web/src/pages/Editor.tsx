import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import PDFViewer from '@/components/PDFViewer';
import ThumbnailStrip from '@/components/ThumbnailStrip';
import EnhancedToolbar from '@/components/EnhancedToolbar';
import KeyboardShortcutsHelp from '@/components/KeyboardShortcutsHelp';
import MergeModal from '@/components/MergeModal';
import SplitExtractModal from '@/components/SplitExtractModal';
import EnhancedLoadingScreen from '@/components/EnhancedLoadingScreen';
import { useEditorStore } from '@/context/editorContext';
import { useFileStore } from '@/context/fileContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaDownload } from 'react-icons/fa';

const EditorPage: React.FC = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const { currentFile, setCurrentFile, pages } = useEditorStore();
  const { files } = useFileStore();
  const [layout, setLayout] = useState<'vertical' | 'horizontal'>('vertical');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setLayout('vertical');
        setShowThumbnails(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Find file by ID
    const file = files.find((f) => f.id === fileId);
    if (!file) {
      toast.error('File not found');
      navigate('/dashboard');
      return;
    }
    setCurrentFile(file);
  }, [fileId, files, navigate, setCurrentFile]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRotate: () => {
      toast('Rotate selected pages (R pressed)', { icon: '↻' });
    },
    onDelete: () => {
      toast('Delete selected pages (D pressed)', { icon: '🗑️' });
    },
    onMerge: () => {
      setShowMergeModal(true);
      toast('Open merge modal (M pressed)');
    },
    onSplit: () => {
      setShowSplitModal(true);
      toast('Open split modal (S pressed)');
    },
    onHelp: () => {
      setShowKeyboardHelp(true);
    },
  });

  const handleDownload = async () => {
    if (!currentFile?.blob || pages.length === 0) {
      toast.error('No pages to download');
      return;
    }

    try {
      // Create download link
      const url = URL.createObjectURL(currentFile.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentFile.name.replace('.pdf', '')}-edited.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('✓ PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
      console.error(error);
    }
  };

  if (!currentFile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)] p-4">
          <EnhancedLoadingScreen 
            message="Loading PDF Editor" 
            subMessage="Preparing your document for editing..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Editor Container */}
      <div className="flex-1 overflow-auto p-4">
        <div className="container-max">
          {/* Header */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {currentFile.name}
              </h1>
              <p className="text-sm text-gray-600">
                {pages.length} pages • {(currentFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            {/* Layout Toggle & Thumbnail Toggle */}
            <div className="flex gap-2 flex-wrap">
              {isMobile && (
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="px-4 py-2 rounded transition bg-primary-600 text-white hover:bg-primary-700"
                >
                  {showThumbnails ? 'Hide' : 'Show'} Thumbnails
                </button>
              )}
              {!isMobile && (
                <>
                  <button
                    onClick={() => setLayout('vertical')}
                    className={`px-4 py-2 rounded transition ${
                      layout === 'vertical'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => setLayout('horizontal')}
                    className={`px-4 py-2 rounded transition ${
                      layout === 'horizontal'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Horizontal
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <EnhancedToolbar 
            onRotate={() => toast('Rotate page')}
            onDelete={() => toast('Delete page')}
            onDuplicate={() => toast('Duplicate page')}
            onMerge={() => setShowMergeModal(true)}
            onSplit={() => setShowSplitModal(true)}
            onCrop={() => toast('Crop page')}
            onAnnotate={() => toast('Annotate page')}
            onDownload={handleDownload}
            onZoom={() => {}}
            onConvert={() => {}}
          />

          {/* Main Editor Area */}
          <div
            className={`grid gap-4 mb-4 ${
              layout === 'vertical' || isMobile ? 'grid-cols-1' : 'grid-cols-3'
            }`}
          >
            {/* PDF Viewer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={layout === 'vertical' || isMobile ? 'col-span-1' : 'col-span-2'}
              style={{ minHeight: isMobile ? '400px' : '600px' }}
            >
              {currentFile.blob && (
                <PDFViewer
                  fileBlob={currentFile.blob}
                  onPageCountChange={() => {
                    // Page count is already set from PDF loading
                  }}
                />
              )}
            </motion.div>

            {/* Thumbnail Strip - conditionally show on mobile */}
            {(!isMobile || showThumbnails) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={
                  layout === 'vertical' || isMobile
                    ? 'col-span-1 max-h-96'
                    : 'col-span-1 max-h-[700px]'
                }
              >
                {currentFile.blob && (
                  <ThumbnailStrip
                    pdfBlob={currentFile.blob}
                    className="h-full"
                  />
                )}
              </motion.div>
            )}
          </div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-xl md:text-2xl font-bold text-primary-600">{pages.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">File Size</p>
                <p className="text-xl md:text-2xl font-bold text-primary-600">
                  {(currentFile.size / (1024 * 1024)).toFixed(1)}MB
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Uploaded</p>
                <p className="text-xs md:text-sm font-medium text-gray-700">
                  {new Date(currentFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 mx-auto text-sm md:text-base px-3 md:px-4 py-2"
                >
                  <FaDownload size={16} />
                  <span className="hidden md:inline">Download</span>
                  <span className="md:hidden">Save</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
      <MergeModal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
      />
      <SplitExtractModal
        isOpen={showSplitModal}
        onClose={() => setShowSplitModal(false)}
        totalPages={pages.length}
      />
    </div>
  );
};

export default EditorPage;
