/**
 * useThumbnailWorker Hook
 * React hook for generating PDF thumbnails using the worker
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseThumbnailWorkerOptions {
  width?: number;
  height?: number;
}

interface ThumbnailData {
  pageNumber: number;
  imageData?: ImageData;
  error?: string;
  cached?: boolean;
}

export const useThumbnailWorker = (options: UseThumbnailWorkerOptions = {}) => {
  const workerRef = useRef<Worker | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<number, ThumbnailData>>(new Map());
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  // Initialize worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('../workers/thumbnailWorker.ts', import.meta.url),
        { type: 'module' }
      );

      const handleMessage = (event: MessageEvent) => {
        const { type, result, results } = event.data;

        if (type === 'thumbnail_ready' && result) {
          setThumbnails(prev => {
            const next = new Map(prev);
            next.set(result.pageNumber, {
              pageNumber: result.pageNumber,
              imageData: result.thumbnail,
              error: result.error,
              cached: result.cached,
            });
            return next;
          });
        } else if (type === 'batch_ready' && results) {
          setThumbnails(prev => {
            const next = new Map(prev);
            results.forEach((result: any) => {
              next.set(result.pageNumber, {
                pageNumber: result.pageNumber,
                imageData: result.thumbnail,
                error: result.error,
                cached: result.cached,
              });
            });
            return next;
          });
        }
      };

      const handleError = (error: ErrorEvent) => {
        console.error('Worker error:', error);
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.addEventListener('error', handleError);
      setIsWorkerReady(true);

      return () => {
        if (workerRef.current) {
          workerRef.current.removeEventListener('message', handleMessage);
          workerRef.current.removeEventListener('error', handleError);
          workerRef.current.terminate();
        }
      };
    } catch (error) {
      console.error('Failed to initialize thumbnail worker:', error);
    }
  }, []);

  // Generate single thumbnail
  const generateThumbnail = useCallback(
    (pdfBlob: Blob, pageNumber: number) => {
      if (!workerRef.current || !isWorkerReady) {
        console.warn('Worker not ready');
        return;
      }

      workerRef.current.postMessage({
        type: 'generate_thumbnail',
        payload: {
          id: `thumb-${Date.now()}-${pageNumber}`,
          pdfBlob,
          pageNumber,
          width: options.width || 200,
          height: options.height || 280,
        },
      });
    },
    [isWorkerReady, options]
  );

  // Generate batch of thumbnails
  const generateBatch = useCallback(
    (pdfBlob: Blob, startPage: number, endPage: number) => {
      if (!workerRef.current || !isWorkerReady) {
        console.warn('Worker not ready');
        return;
      }

      workerRef.current.postMessage({
        type: 'generate_batch',
        payload: {
          pdfBlob,
          startPage,
          endPage,
          options: {
            width: options.width || 200,
            height: options.height || 280,
          },
        },
      });
    },
    [isWorkerReady, options]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'clear_cache' });
      setThumbnails(new Map());
    }
  }, []);

  // Get specific thumbnail
  const getThumbnail = useCallback(
    (pageNumber: number): ThumbnailData | undefined => {
      return thumbnails.get(pageNumber);
    },
    [thumbnails]
  );

  return {
    generateThumbnail,
    generateBatch,
    getThumbnail,
    thumbnails,
    clearCache,
    isWorkerReady,
  };
};

export default useThumbnailWorker;
