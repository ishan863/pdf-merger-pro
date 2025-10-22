import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import UploadZone from './UploadZone';
import { useFileStore } from '@/context/fileContext';
import { useEditorStore } from '@/context/editorContext';
import { mergePDFs, downloadBlob, getPDFPageCount } from '@/utils/pdfOperations';
import toast from 'react-hot-toast';
import { FaCheck, FaTrash, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFileIds?: string[];
}

const MergeModal: React.FC<MergeModalProps> = ({
  isOpen,
  onClose,
  selectedFileIds = [],
}) => {
  const navigate = useNavigate();
  const { files, addFile } = useFileStore();
  const { setCurrentFile } = useEditorStore();
  const [selectedFiles, setSelectedFiles] = useState<string[]>(
    selectedFileIds.length > 0 ? selectedFileIds : []
  );
  const [mergeOrder, setMergeOrder] = useState<string[]>(selectedFileIds);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('merged.pdf');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUpload, setShowUpload] = useState(files.length === 0);

  // Available files to add
  const availableFiles = useMemo(() => {
    return files.filter((f) => !selectedFiles.includes(f.id));
  }, [files, selectedFiles]);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    // Process uploaded files and add to store
    for (const file of uploadedFiles) {
      const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
      const pageCount = await getPDFPageCount(blob);
      
      const newFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        blob,
        uploadedAt: new Date(),
        pages: pageCount,
        status: 'uploaded' as const,
      };
      
      addFile(newFile);
      // Auto-add to merge list
      setSelectedFiles(prev => [...prev, newFile.id]);
      setMergeOrder(prev => [...prev, newFile.id]);
    }
    
    setShowUpload(false);
    toast.success(`✓ ${uploadedFiles.length} file(s) added to merge list`);
  };

  const handleAddFile = (fileId: string) => {
    setSelectedFiles([...selectedFiles, fileId]);
    setMergeOrder([...mergeOrder, fileId]);
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    setMergeOrder(mergeOrder.filter((id) => id !== fileId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...mergeOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setMergeOrder(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === mergeOrder.length - 1) return;
    const newOrder = [...mergeOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setMergeOrder(newOrder);
  };

  const handleMerge = async () => {
    if (mergeOrder.length < 2) {
      toast.error('Select at least 2 files to merge');
      return;
    }

    if (!fileName.trim()) {
      toast.error('Enter a filename');
      return;
    }

    setIsLoading(true);
    try {
      const fileBlobs = await Promise.all(
        mergeOrder.map(async (fileId) => {
          const file = files.find((f) => f.id === fileId);
          if (!file?.blob) throw new Error(`File ${file?.name} not found`);
          return file.blob;
        })
      );

      const merged = await mergePDFs(fileBlobs);
      setMergedBlob(merged);
      setShowPreview(true);
      
      toast.success(`✓ Files merged! Preview or download below.`);
    } catch (error) {
      console.error('Merge error:', error);
      toast.error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!mergedBlob) {
      toast.error('No merged file to download');
      return;
    }
    
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    downloadBlob(mergedBlob, finalFileName);
    toast.success(`✓ ${finalFileName} downloaded`);
    
    // Reset state for next merge
    setTimeout(() => {
      setMergedBlob(null);
      setShowPreview(false);
      setSelectedFiles([]);
      setMergeOrder([]);
      setFileName('merged.pdf');
      setShowUpload(files.length === 0);
    }, 500);
  };

  const handlePreview = () => {
    if (!mergedBlob) {
      toast.error('No merged file to preview');
      return;
    }

    // Navigate to editor with merged file
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    const mergedFile = {
      id: `merged-${Date.now()}`,
      name: finalFileName,
      size: mergedBlob.size,
      blob: mergedBlob,
      uploadedAt: new Date(),
      pages: 0, // Will be calculated when loaded
      status: 'uploaded' as const,
    };

    // Add to file store so it appears in the dashboard
    addFile(mergedFile);
    
    // Set as current file for editor
    setCurrentFile(mergedFile);
    
    // Navigate to editor
    navigate(`/editor/${mergedFile.id}`);
    
    toast.success(`✓ Opening preview in editor...`);
    
    // Reset for next use
    setMergedBlob(null);
    setShowPreview(false);
    setSelectedFiles([]);
    setMergeOrder([]);
    setFileName('merged.pdf');
    setShowUpload(files.length === 0);
    onClose();
  };

  const handleMergeAnother = () => {
    setMergedBlob(null);
    setShowPreview(false);
    setSelectedFiles([]);
    setMergeOrder([]);
    setFileName('merged.pdf');
    setShowUpload(files.length === 0);
    toast('Ready to merge more PDFs');
  };

  const selectedFileDetails = mergeOrder.map((id) =>
    files.find((f) => f.id === id)
  ).filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          title={
            showPreview 
              ? "Merge Complete! 🎉" 
              : files.length === 0
                ? "Upload PDFs to Merge"
                : "Merge PDFs"
          }
          isOpen={isOpen}
          onClose={onClose}
          size="lg"
          actions={
            files.length === 0 && !showPreview
              ? [
                  {
                    label: 'Close',
                    onClick: onClose,
                    variant: 'secondary',
                  },
                ]
              : showPreview
              ? [
                  {
                    label: 'Merge Another',
                    onClick: handleMergeAnother,
                    variant: 'secondary',
                  },
                  {
                    label: 'Preview in Editor',
                    onClick: handlePreview,
                    variant: 'secondary',
                  },
                  {
                    label: 'Download PDF',
                    onClick: handleDownload,
                    variant: 'primary',
                  },
                ]
              : [
                  {
                    label: 'Cancel',
                    onClick: onClose,
                    variant: 'secondary',
                  },
                  {
                    label: 'Merge Files',
                    onClick: handleMerge,
                    variant: 'primary',
                    disabled: mergeOrder.length < 2 || isLoading,
                    loading: isLoading,
                  },
                ]
          }
        >
          <div className="space-y-6">
            {/* Upload Zone - Show if no files */}
            {files.length === 0 && !showPreview && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No PDFs uploaded yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload at least 2 PDF files to merge them
                </p>
                <UploadZone
                  onFilesSelected={handleFileUpload}
                  maxFileSize={100}
                  multiple={true}
                />
              </div>
            )}

            {/* Show upload button even if files exist */}
            {files.length > 0 && !showPreview && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {mergeOrder.length} file(s) selected for merging
                </p>
                <button
                  onClick={() => setShowUpload(!showUpload)}
                  className="flex items-center gap-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition text-sm font-medium"
                >
                  <FaPlus size={14} />
                  Add More Files
                </button>
              </div>
            )}

            {/* Upload Zone toggle */}
            {showUpload && files.length > 0 && !showPreview && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UploadZone
                  onFilesSelected={handleFileUpload}
                  maxFileSize={100}
                  multiple={true}
                />
              </motion.div>
            )}

            {/* Success Message after merge */}
            {showPreview && mergedBlob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-gradient-to-r from-success-50 to-success-100 border-2 border-success-300 rounded-xl text-center"
              >
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-success-900 mb-2">
                  PDFs Merged Successfully!
                </h3>
                <p className="text-success-700 mb-4">
                  {mergeOrder.length} files combined into <strong>{fileName}</strong>
                </p>
                <p className="text-sm text-success-600">
                  Size: {(mergedBlob.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <button
                    onClick={handlePreview}
                    className="px-4 py-2 bg-white text-success-700 rounded-lg font-medium hover:bg-success-50 transition"
                  >
                    👁️ Preview in Editor
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-success-600 text-white rounded-lg font-medium hover:bg-success-700 transition"
                  >
                    💾 Download PDF
                  </button>
                </div>
              </motion.div>
            )}

            {/* File selection UI - hide after merge or if no files */}
            {!showPreview && files.length > 0 && !showUpload && (
              <>
            {/* File name input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output filename
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., document.pdf"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Files to merge section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">
                Files to merge ({mergeOrder.length})
              </h3>

              {mergeOrder.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  Select files from the list below to add them to the merge order
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedFileDetails.map((file, index) => (
                    <motion.div
                      key={file?.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-600 text-white rounded-full text-xs font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file?.pages} pages • {(file?.size ? file.size / (1024 * 1024) : 0).toFixed(2)}MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || isLoading}
                          className="p-2 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                          title="Move up"
                          aria-label="Move up"
                        >
                          <FaArrowUp size={14} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === mergeOrder.length - 1 || isLoading}
                          className="p-2 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                          title="Move down"
                          aria-label="Move down"
                        >
                          <FaArrowDown size={14} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleRemoveFile(file?.id || '')}
                          disabled={isLoading}
                          className="p-2 hover:bg-red-100 rounded transition text-red-600"
                          title="Remove"
                          aria-label="Remove"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Available files section */}
            {availableFiles.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Available files ({availableFiles.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {file.pages} pages • {(file.size / (1024 * 1024)).toFixed(2)}MB
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddFile(file.id)}
                        disabled={isLoading}
                        className="p-2 hover:bg-primary-100 rounded transition text-primary-600 disabled:opacity-50"
                        title="Add to merge"
                        aria-label="Add to merge"
                      >
                        <FaCheck size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Info box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                📌 <strong>Tip:</strong> Drag files from available to merge list, or use up/down arrows to reorder. The order shown is how pages will be arranged in the output.
              </p>
            </div>
            </>
            )}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default MergeModal;
