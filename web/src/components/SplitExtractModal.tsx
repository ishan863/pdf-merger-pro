import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import UploadZone from './UploadZone';
import { useEditorStore } from '@/context/editorContext';
import { extractPages, parsePageRange, validatePageNumbers, downloadBlob, getPDFPageCount, splitPDF } from '@/utils/pdfOperations';
import toast from 'react-hot-toast';
import { FaInfo, FaCheck } from 'react-icons/fa';

interface SplitExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPages?: number;
}

const SplitExtractModal: React.FC<SplitExtractModalProps> = ({
  isOpen,
  onClose,
  totalPages: propTotalPages,
}) => {
  const { currentFile } = useEditorStore();
  const [mode, setMode] = useState<'extract' | 'split'>('extract');
  const [rangeInput, setRangeInput] = useState('');
  const [fileName, setFileName] = useState('extracted.pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalPages = propTotalPages || pageCount;
  const workingBlob = uploadedBlob || currentFile?.blob || selectedFile?.blob;

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;
    
    const file = uploadedFiles[0]; // Only take first file
    const blob = new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
    const count = await getPDFPageCount(blob);
    
    setUploadedBlob(blob);
    setPageCount(count);
    setFileName(file.name.replace('.pdf', '') + '-extracted.pdf');
    toast.success(`✓ ${file.name} loaded (${count} pages)`);
  };

  const parsedPages = useMemo(() => {
    if (!rangeInput.trim()) return [];
    try {
      return parsePageRange(rangeInput, totalPages);
    } catch {
      return [];
    }
  }, [rangeInput, totalPages]);

  const isValidRange = parsedPages.length > 0 && validatePageNumbers(parsedPages, totalPages);

  const handleExtract = async () => {
    if (!isValidRange || !workingBlob) {
      toast.error('Invalid page range or file not found');
      return;
    }

    setIsLoading(true);
    try {
      const extractedBlob = await extractPages(workingBlob, parsedPages);
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      downloadBlob(extractedBlob, finalFileName);
      
      toast.success(`✓ Extracted ${parsedPages.length} pages`);
      setShowSuccess(true);
      
      // Reset after download
      setTimeout(() => {
        setRangeInput('');
        setUploadedBlob(null);
        setPageCount(0);
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Extract error:', error);
      toast.error(`Failed to extract pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplit = async () => {
    if (!isValidRange || !workingBlob) {
      toast.error('Invalid split points');
      return;
    }

    setIsLoading(true);
    try {
      // Use parsed pages as split points (where to split the PDF)
      const splitBlobs = await splitPDF(workingBlob, parsedPages);
      
      // Download each part
      splitBlobs.forEach((blob, index) => {
        const partName = fileName.replace('.pdf', '') + `_part${index + 1}.pdf`;
        downloadBlob(blob, partName);
      });

      toast.success(`✓ PDF split into ${splitBlobs.length} parts!`);
      
      // Reset and show success
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setUploadedBlob(null);
        setSelectedFile(null);
        setPageCount(0);
        setRangeInput('');
        setFileName('split.pdf');
      }, 2000);
    } catch (error) {
      console.error('Split error:', error);
      toast.error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          title={
            showSuccess 
              ? (mode === 'extract' ? 'Pages Extracted!' : 'PDF Split!')
              : !workingBlob
              ? `Upload PDF to ${mode === 'extract' ? 'Extract' : 'Split'}`
              : mode === 'extract' ? 'Extract Pages' : 'Split PDF'
          }
          isOpen={isOpen}
          onClose={onClose}
          size="md"
          actions={
            showSuccess
              ? [
                  {
                    label: mode === 'extract' ? 'Extract Another' : 'Split Another',
                    onClick: () => {
                      setShowSuccess(false);
                      setUploadedBlob(null);
                      setSelectedFile(null);
                      setPageCount(0);
                      setRangeInput('');
                      setFileName(mode === 'extract' ? 'extracted.pdf' : 'split.pdf');
                    },
                    variant: 'primary',
                  },
                ]
              : !workingBlob
              ? []
              : [
                  {
                    label: 'Cancel',
                    onClick: onClose,
                    variant: 'secondary',
                  },
                  {
                    label: mode === 'extract' ? 'Extract' : 'Split',
                    onClick: mode === 'extract' ? handleExtract : handleSplit,
                    variant: 'primary',
                    disabled: !isValidRange || isLoading,
                    loading: isLoading,
                  },
                ]
          }
        >
          <div className="space-y-6">
            {/* Upload Zone - Show if no file */}
            {!workingBlob && !showSuccess && (
              <div className="text-center py-6">
                <div className="text-5xl mb-3">📄</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Upload a PDF to {mode}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Upload a PDF file to extract or split pages
                </p>
                <UploadZone
                  onFilesSelected={handleFileUpload}
                  maxFileSize={100}
                  multiple={false}
                />
              </div>
            )}

            {/* Show controls only if file is loaded */}
            {workingBlob && !showSuccess && (
              <>
            {/* Mode selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setMode('extract')}
                className={`flex-1 px-4 py-2 rounded font-medium transition ${
                  mode === 'extract'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Extract Pages
              </button>
              <button
                onClick={() => setMode('split')}
                className={`flex-1 px-4 py-2 rounded font-medium transition ${
                  mode === 'split'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Split PDF
              </button>
            </div>

            {/* Page range input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'extract' ? 'Pages to extract' : 'Split at pages'}
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder={
                  mode === 'extract'
                    ? 'e.g., 1,3-5,7 or 1-3'
                    : 'e.g., 5,10 to split at page 5 and 10'
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Total pages: <strong>{totalPages}</strong>
              </p>
            </div>

            {/* Selected pages preview */}
            {isValidRange && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-50 border border-green-200 rounded"
              >
                <p className="text-sm text-green-900">
                  <strong>{parsedPages.length}</strong> page(s) selected:{' '}
                  <span className="font-mono text-xs">{parsedPages.join(', ')}</span>
                </p>
              </motion.div>
            )}

            {/* Invalid range */}
            {rangeInput && !isValidRange && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded"
              >
                <p className="text-sm text-red-900">
                  Invalid page range. Please check your input.
                </p>
              </motion.div>
            )}

            {/* Output filename */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output filename
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder={
                  mode === 'extract' ? 'extracted.pdf' : 'split_part.pdf'
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Help section */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex gap-2">
                <FaInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={14} />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">
                    {mode === 'extract' ? 'Format examples:' : 'Split points:'}
                  </p>
                  <ul className="space-y-1 text-xs">
                    {mode === 'extract' ? (
                      <>
                        <li>• <code className="bg-blue-100 px-1 rounded">1,2,3</code> - Individual pages</li>
                        <li>• <code className="bg-blue-100 px-1 rounded">1-5</code> - Page range</li>
                        <li>• <code className="bg-blue-100 px-1 rounded">1-3,5,7-10</code> - Mixed format</li>
                      </>
                    ) : (
                      <>
                        <li>• <code className="bg-blue-100 px-1 rounded">5</code> - Split after page 5</li>
                        <li>• <code className="bg-blue-100 px-1 rounded">5,10</code> - Split at pages 5 and 10</li>
                        <li>• <code className="bg-blue-100 px-1 rounded">3,6,9</code> - Multiple split points</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            </>
            )}

            {/* Success Screen */}
            {showSuccess && (
              <div className="text-center py-8">
                <div className="mb-4 text-green-600">
                  <FaCheck size={64} className="mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {mode === 'extract' ? 'Pages extracted!' : 'PDF split!'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Your file has been downloaded successfully
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default SplitExtractModal;
