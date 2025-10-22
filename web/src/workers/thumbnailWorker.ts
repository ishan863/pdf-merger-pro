/**
 * Thumbnail Worker
 * Generates PDF page thumbnails using OffscreenCanvas in a Web Worker
 * Runs asynchronously to prevent UI blocking
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ThumbnailRequest {
  id: string;
  pdfBlob: Blob;
  pageNumber: number;
  width?: number;
  height?: number;
  quality?: number;
}

interface ThumbnailResponse {
  id: string;
  pageNumber: number;
  thumbnail?: ImageData;
  canvas?: OffscreenCanvas;
  error?: string;
  cached?: boolean;
}

// In-memory cache for recently generated thumbnails
const thumbnailCache = new Map<string, ImageData>();
const CACHE_SIZE = 50; // Keep last 50 thumbnails in memory

/**
 * Generate thumbnail for a PDF page using OffscreenCanvas
 */
async function generateThumbnail(request: ThumbnailRequest): Promise<ThumbnailResponse> {
  const { id, pdfBlob, pageNumber, width = 200, height = 280 } = request;

  try {
    // Check cache first
    const cacheKey = `${id}-page-${pageNumber}`;
    if (thumbnailCache.has(cacheKey)) {
      return {
        id,
        pageNumber,
        thumbnail: thumbnailCache.get(cacheKey),
        cached: true,
      };
    }

    // Load PDF document
    const arrayBuffer = await blobToArrayBuffer(pdfBlob);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Get specific page
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });

    // Calculate scale to fit width/height
    const scaleX = width / viewport.width;
    const scaleY = height / viewport.height;
    const scale = Math.min(scaleX, scaleY, 1); // Don't upscale

    const scaledViewport = page.getViewport({ scale });

    // Create OffscreenCanvas for rendering
    const canvas = new OffscreenCanvas(scaledViewport.width, scaledViewport.height);
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    // Render page to canvas
    const renderContext = {
      canvasContext: context as any,
      viewport: scaledViewport,
    };

    await page.render(renderContext).promise;

    // Get image data from canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Cache the thumbnail
    if (thumbnailCache.size >= CACHE_SIZE) {
      const firstKey = thumbnailCache.keys().next().value;
      if (firstKey) thumbnailCache.delete(firstKey);
    }
    thumbnailCache.set(cacheKey, imageData);

    return {
      id,
      pageNumber,
      thumbnail: imageData,
      cached: false,
    };
  } catch (error) {
    return {
      id,
      pageNumber,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate multiple thumbnails for a range of pages
 */
async function generateThumbnailBatch(
  pdfBlob: Blob,
  startPage: number,
  endPage: number,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<ThumbnailResponse[]> {
  const results: ThumbnailResponse[] = [];

  try {
    const arrayBuffer = await blobToArrayBuffer(pdfBlob);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    // Clamp page range
    const start = Math.max(1, startPage);
    const end = Math.min(totalPages, endPage);

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const result = await generateThumbnail({
        id: `batch-${Date.now()}`,
        pdfBlob,
        pageNumber: pageNum,
        ...options,
      });
      results.push(result);
    }
  } catch (error) {
    return [
      {
        id: `batch-${Date.now()}`,
        pageNumber: startPage,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    ];
  }

  return results;
}

/**
 * Convert Blob to ArrayBuffer
 */
function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

/**
 * Clear cache
 */
function clearCache(): void {
  thumbnailCache.clear();
}

/**
 * Get cache statistics
 */
function getCacheStats(): { size: number; capacity: number; items: number } {
  return {
    size: thumbnailCache.size,
    capacity: CACHE_SIZE,
    items: thumbnailCache.size,
  };
}

// Message handler
self.onmessage = async (event: MessageEvent<any>) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'generate_thumbnail':
      {
        const result = await generateThumbnail(payload);
        self.postMessage({ type: 'thumbnail_ready', result });
      }
      break;

    case 'generate_batch':
      {
        const { pdfBlob, startPage, endPage, options } = payload;
        const results = await generateThumbnailBatch(pdfBlob, startPage, endPage, options);
        self.postMessage({ type: 'batch_ready', results });
      }
      break;

    case 'clear_cache':
      {
        clearCache();
        self.postMessage({ type: 'cache_cleared' });
      }
      break;

    case 'get_stats':
      {
        const stats = getCacheStats();
        self.postMessage({ type: 'stats', stats });
      }
      break;

    default:
      self.postMessage({ type: 'error', error: 'Unknown message type' });
  }
};

// Export for TypeScript type checking
export type { ThumbnailRequest, ThumbnailResponse };
