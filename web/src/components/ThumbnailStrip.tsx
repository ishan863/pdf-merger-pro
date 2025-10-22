import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { pdfjsLib } from '@/utils/pdfWorkerConfig';
import { useEditorStore } from '../context/editorContext';
import { FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { reorderPages as reorderPDF } from '../utils/pdfOperations';
import toast from 'react-hot-toast';

interface ThumbnailStripProps {
  pdfBlob: Blob;
  onPageSelect?: (pageNumber: number) => void;
  className?: string;
}

const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  pdfBlob,
  onPageSelect,
  className = '',
}) => {
  const [pdf, setPdf] = useState<any>(null);
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  const pages = useEditorStore((s) => s.pages || []);
  const selectedPages = useEditorStore((s) => s.selectedPages || new Set());
  const selectPage = useEditorStore((s) => s.selectPage);
  const deselectPage = useEditorStore((s) => s.deselectPage);
  const currentFile = useEditorStore((s) => s.currentFile);
  const setCurrentFile = useEditorStore((s) => s.setCurrentFile);
  const reorderPagesStore = useEditorStore((s) => s.reorderPages);

  // Load PDF and generate initial thumbnails
  useEffect(() => {
    if (!pdfBlob) {
      setLoading(false);
      return;
    }

    const loadPDF = async () => {
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdf(pdfDoc);
        setThumbnails(Array(pdfDoc.numPages).fill(null));
      } catch (error) {
        console.error('Error loading PDF for thumbnails:', error);
        toast.error('Failed to load PDF thumbnails');
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfBlob]);

  // Generate thumbnails with intersection observer (lazy loading)
  useEffect(() => {
    if (!pdf) return;

    const renderThumbnail = async (pageIndex: number) => {
      try {
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 0.15 }); // Even smaller for faster loading

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); // More compression
        setThumbnails(prev => {
          const updated = [...prev];
          updated[pageIndex] = dataUrl;
          return updated;
        });
      } catch (error) {
        console.error(`Error rendering thumbnail for page ${pageIndex + 1}:`, error);
      }
    };

    // Render first 3 thumbnails immediately (reduced from 5)
    const immediatePages = Math.min(3, pdf.numPages);
    for (let i = 0; i < immediatePages; i++) {
      renderThumbnail(i);
    }

    // Create intersection observer for lazy loading remaining pages
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.getAttribute('data-page-index') || '0');
            if (thumbnails[pageIndex] === null && pageIndex >= immediatePages) {
              renderThumbnail(pageIndex);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe thumbnail elements
    const thumbnailElements = document.querySelectorAll('[data-page-index]');
    thumbnailElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [pdf, thumbnails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">Loading thumbnails...</p>
      </div>
    );
  }

  if (!pdf || pages.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">No pages to display</p>
      </div>
    );
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const currentScroll = scrollContainerRef.current.scrollLeft;

    scrollContainerRef.current.scrollTo({
      left: currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount),
      behavior: 'smooth',
    });
  };

  const handlePageClick = (pageNumber: number) => {
    if (selectedPages.has(pageNumber)) {
      deselectPage(pageNumber);
    } else {
      selectPage(pageNumber);
    }
    onPageSelect?.(pageNumber);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;

    if (!currentFile?.blob) {
      toast.error('No file loaded');
      return;
    }

    const current = [...pages];
    const [moved] = current.splice(fromIdx, 1);
    current.splice(toIdx, 0, moved);

    // New order as page numbers (original page numbers before reorder)
    const newOrder = current.map((p) => p.pageNumber);
    
    try {
      // Perform actual PDF reordering
      const reorderedBlob = await reorderPDF(currentFile.blob, newOrder);
      
      // Update the current file blob
      setCurrentFile({
        ...currentFile,
        blob: reorderedBlob,
      });

      // Update state with renumbered pages
      reorderPagesStore(newOrder);
      toast.success('✓ Pages reordered');
    } catch (error) {
      toast.error('Failed to reorder pages');
      console.error(error);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Pages ({pages.length})</h3>
        {selectedPages.size > 0 && (
          <p className="text-xs text-primary-600 mt-1">
            {selectedPages.size} page{selectedPages.size !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Thumbnails Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-md rounded-r-lg transition"
          aria-label="Scroll left"
        >
          <FaChevronLeft size={16} />
        </button>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white shadow-md rounded-l-lg transition"
          aria-label="Scroll right"
        >
          <FaChevronRight size={16} />
        </button>

        {/* Thumbnail List with Drag & Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="thumbnails" direction="horizontal">
            {(provided) => (
              <div
                ref={(el) => {
                  provided.innerRef(el);
                  scrollContainerRef.current = el;
                }}
                {...provided.droppableProps}
                data-thumbnails-scroll
                className="flex gap-2 overflow-x-auto scroll-smooth p-3"
                style={{ scrollBehavior: 'smooth' }}
              >
                {pages.map((page, index) => (
                  <Draggable key={page.pageNumber} draggableId={`page-${page.pageNumber}`} index={index}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...(dragProvided.draggableProps as any)}
                        {...(dragProvided.dragHandleProps as any)}
                        onClick={() => handlePageClick(page.pageNumber)}
                        style={{ width: '100px', height: '140px' }}
                      >
                        <motion.div
                          data-page-index={page.pageNumber - 1}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            selectedPages.has(page.pageNumber)
                              ? 'border-primary-500 ring-2 ring-primary-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Thumbnail Image */}
                          {thumbnails[page.pageNumber - 1] ? (
                            <img
                              src={thumbnails[page.pageNumber - 1]!}
                              alt={`Page ${page.pageNumber}`}
                              className="w-full h-full object-cover bg-gray-100"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse flex items-center justify-center">
                              <span className="text-xs text-gray-400">{page.pageNumber}</span>
                            </div>
                          )}

                          {/* Rotation Indicator */}
                          {(page as any).rotation !== 0 && (
                            <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                              {(page as any).rotation}°
                            </div>
                          )}

                          {/* Selection Indicator */}
                          {selectedPages.has(page.pageNumber) && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 left-1 bg-primary-500 text-white rounded-full p-1">
                              <FaCheck size={12} />
                            </motion.div>
                          )}

                          {/* Page Number */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-medium py-1 px-1 text-center">
                            {page.pageNumber}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Stats Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between">
        <span>Total: {pages.length} pages</span>
        <span>Selected: {selectedPages.size}</span>
      </div>
    </div>
  );
};

export default ThumbnailStrip;
