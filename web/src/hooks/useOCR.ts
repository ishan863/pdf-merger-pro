/**
 * OCR System Hook
 * Integrates Tesseract.js for optical character recognition on PDFs
 * Lazy loads Tesseract to minimize bundle size
 */

import { useCallback, useRef, useState } from 'react';

interface OCRResult {
  pageNumber: number;
  text: string;
  confidence: number;
  timestamp: number;
}

interface OCRProgress {
  status: string;
  progress: number;
}

let TesseractWorker: any = null;

/**
 * Lazy load Tesseract.js
 */
async function loadTesseract() {
  if (TesseractWorker) return TesseractWorker;

  const Tesseract = await import('tesseract.js');
  TesseractWorker = Tesseract;
  return Tesseract;
}

export const useOCR = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OCRProgress | null>(null);
  const [results, setResults] = useState<Map<number, OCRResult>>(new Map());
  const workerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize OCR worker
   */
  const initializeWorker = useCallback(async () => {
    if (workerRef.current) return workerRef.current;

    try {
      const Tesseract = await loadTesseract();
      workerRef.current = Tesseract.createWorker({
        langPath: 'https://tessdata.projectnaptha.com/4.0_best_lang_data',
        errorHandler: (error: any) => {
          console.error('Tesseract error:', error);
          setError(error.message || 'OCR Error');
        },
      });

      await workerRef.current.load();
      await workerRef.current.initialize('eng');

      return workerRef.current;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize OCR';
      setError(message);
      throw err;
    }
  }, []);

  /**
   * Process single image for OCR
   */
  const processImage = useCallback(
    async (imageData: string | ImageData | HTMLImageElement, pageNumber: number) => {
      try {
        setIsProcessing(true);
        setError(null);

        const worker = await initializeWorker();

        setProgress({ status: 'Recognizing text...', progress: 0 });

        const result = await worker.recognize(imageData, undefined, {
          'preserve_interword_spaces': true,
        });

        const ocrResult: OCRResult = {
          pageNumber,
          text: result.data.text,
          confidence: result.data.confidence,
          timestamp: Date.now(),
        };

        setResults(prev => {
          const next = new Map(prev);
          next.set(pageNumber, ocrResult);
          return next;
        });

        setProgress({ status: 'Complete', progress: 100 });

        return ocrResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'OCR failed';
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [initializeWorker]
  );

  /**
   * Process multiple pages/images
   */
  const processPages = useCallback(
    async (images: Array<string | ImageData | HTMLImageElement>) => {
      try {
        setIsProcessing(true);
        setError(null);

        const worker = await initializeWorker();
        const processedResults: OCRResult[] = [];

        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          setProgress({
            status: `Processing page ${i + 1} of ${images.length}...`,
            progress: (i / images.length) * 100,
          });

          const result = await worker.recognize(image, undefined, {
            'preserve_interword_spaces': true,
          });

          const ocrResult: OCRResult = {
            pageNumber: i + 1,
            text: result.data.text,
            confidence: result.data.confidence,
            timestamp: Date.now(),
          };

          processedResults.push(ocrResult);

          setResults(prev => {
            const next = new Map(prev);
            next.set(i + 1, ocrResult);
            return next;
          });
        }

        setProgress({ status: 'Complete', progress: 100 });
        return processedResults;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Batch OCR failed';
        setError(message);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [initializeWorker]
  );

  /**
   * Extract all recognized text
   */
  const extractText = useCallback((): string => {
    const sortedResults = Array.from(results.values()).sort(
      (a, b) => a.pageNumber - b.pageNumber
    );

    return sortedResults
      .map(result => `--- Page ${result.pageNumber} (${(result.confidence * 100).toFixed(1)}%) ---\n${result.text}`)
      .join('\n\n');
  }, [results]);

  /**
   * Export results as JSON
   */
  const exportAsJSON = useCallback((): string => {
    const data = Array.from(results.values());
    return JSON.stringify(data, null, 2);
  }, [results]);

  /**
   * Export results as searchable PDF (mock implementation)
   */
  const exportAsSearchablePDF = useCallback(async (originalPDFBlob: Blob): Promise<Blob> => {
    // This would require additional PDF processing library
    // For now, returning original blob with metadata
    return new Blob([originalPDFBlob], { type: 'application/pdf' });
  }, [results]);

  /**
   * Get OCR result for specific page
   */
  const getPageText = useCallback(
    (pageNumber: number): string | undefined => {
      return results.get(pageNumber)?.text;
    },
    [results]
  );

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setResults(new Map());
    setError(null);
    setProgress(null);
  }, []);

  /**
   * Terminate worker and cleanup
   */
  const terminate = useCallback(async () => {
    if (workerRef.current) {
      try {
        await workerRef.current.terminate();
        workerRef.current = null;
      } catch (err) {
        console.error('Failed to terminate OCR worker:', err);
      }
    }
  }, []);

  return {
    isProcessing,
    progress,
    results,
    error,
    processImage,
    processPages,
    extractText,
    exportAsJSON,
    exportAsSearchablePDF,
    getPageText,
    clearResults,
    terminate,
  };
};

export default useOCR;
