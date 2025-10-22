import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { pdfjsLib } from '@/utils/pdfWorkerConfig';
import { useEditorStore } from '../context/editorContext';
import EnhancedLoadingScreen from './EnhancedLoadingScreen';
import toast from 'react-hot-toast';
import {
  FaChevronLeft,
  FaChevronRight,
  FaMagnifyingGlassPlus,
  FaMagnifyingGlassMinus,
  FaExpand,
} from 'react-icons/fa6';

interface PDFViewerProps {
  fileBlob: Blob;
  onPageCountChange?: (count: number) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileBlob, onPageCountChange }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  const { setPages } = useEditorStore();

  // Load PDF with optimized settings
  useEffect(() => {
    let isMounted = true;
    
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        const arrayBuffer = await fileBlob.arrayBuffer();
        
        if (!isMounted) return;
        
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          enableXfa: true,
          verbosity: 0, // Reduce console logging
        });
        
        const pdfDoc = await loadingTask.promise;

        if (!isMounted) return;

        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        onPageCountChange?.(pdfDoc.numPages);

        // Initialize pages in editor store
        const pages = Array.from({ length: pdfDoc.numPages }, (_, i) => ({
          pageNumber: i + 1,
          isSelected: false,
          rotationDegrees: 0,
          isDeleted: false,
        } as any));
        setPages(pages);
        
        // Small delay to allow UI to update before rendering
        setTimeout(() => {
          if (isMounted) setLoading(false);
        }, 100);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to load PDF';
        setError(message);
        toast.error(`PDF Error: ${message}`);
        setLoading(false);
      }
    };

    loadPDF();
    
    return () => {
      isMounted = false;
    };
  }, [fileBlob, onPageCountChange, setPages]);

  // Render current page with cancellation support
  useEffect(() => {
    if (!pdf || !canvasRef.current || currentPage < 1 || currentPage > totalPages) {
      return;
    }

    const renderPage = async () => {
      // Cancel previous render task if it exists
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        setRendering(true);
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: zoom / 100 });

        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport: viewport,
        });

        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        setRendering(false);
      } catch (err: any) {
        if (err?.name === 'RenderingCancelledException') {
          console.log('Rendering cancelled');
        } else {
          console.error('Error rendering page:', err);
          toast.error('Failed to render page');
        }
        setRendering(false);
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdf, currentPage, zoom, totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      } else if (e.key === '+' || e.key === '=') {
        setZoom(prev => Math.min(200, prev + 10));
      } else if (e.key === '-') {
        setZoom(prev => Math.max(50, prev - 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(200, prev + 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(50, prev - 10));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  if (loading) {
    return <EnhancedLoadingScreen message="Loading PDF" subMessage="Rendering your document..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">❌ Error Loading PDF</p>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-gray-50 rounded-lg overflow-hidden border border-gray-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      }`}
    >
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Previous page (←)"
            aria-label="Previous page"
          >
            <FaChevronLeft size={20} />
          </button>

          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value) || 1;
              setCurrentPage(Math.min(Math.max(page, 1), totalPages));
            }}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
            title="Current page"
            aria-label="Current page"
          />

          <span className="text-sm text-gray-600">/ {totalPages}</span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Next page (→)"
            aria-label="Next page"
          >
            <FaChevronRight size={20} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom === 50}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <FaMagnifyingGlassMinus size={20} />
          </button>

          <span className="w-12 text-center text-sm font-medium">{zoom}%</span>

          <button
            onClick={handleZoomIn}
            disabled={zoom === 200}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <FaMagnifyingGlassPlus size={20} />
          </button>

          <div className="w-px h-6 bg-gray-200" />

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded transition"
            title="Fullscreen (F)"
            aria-label="Toggle fullscreen"
          >
            <FaExpand size={20} />
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white shadow-lg rounded relative"
        >
          <canvas
            ref={canvasRef}
            className="block max-w-full h-auto"
            style={{
              maxHeight: 'calc(100vh - 200px)',
            }}
          />
          {rendering && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-primary-300 border-t-primary-600 rounded-full"
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-xs text-gray-600 flex justify-between">
        <span>Page {currentPage} of {totalPages}</span>
        <span>Zoom: {zoom}% | Use arrow keys to navigate</span>
      </div>
    </div>
  );
};

export default PDFViewer;
