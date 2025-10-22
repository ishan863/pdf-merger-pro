import { useRef, useCallback } from 'react';

interface WorkerMessage {
  id: string;
  type: 'merge' | 'extract' | 'rotate' | 'reorder' | 'delete' | 'split';
  payload: any;
}

interface WorkerResponse {
  id: string;
  success: boolean;
  result?: Blob;
  error?: string;
  progress?: number;
}

interface UsePDFWorkerOptions {
  onProgress?: (progress: number) => void;
}

export const usePDFWorker = (options?: UsePDFWorkerOptions) => {
  const workerRef = useRef<Worker | null>(null);
  const pendingTasksRef = useRef<Map<string, { resolve: (blob: Blob) => void; reject: (error: Error) => void }>>(new Map());

  const initWorker = useCallback(() => {
    if (workerRef.current) return;

    try {
      // Create worker from worker file
      workerRef.current = new Worker(new URL('../workers/pdfWorker.ts', import.meta.url), {
        type: 'module',
      });

      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, success, result, error, progress } = event.data;

        // Handle progress updates
        if (progress !== undefined && options?.onProgress) {
          options.onProgress(progress);
          return;
        }

        // Handle task completion
        const task = pendingTasksRef.current.get(id);
        if (!task) return;

        if (success && result) {
          task.resolve(result);
        } else {
          task.reject(new Error(error || 'Unknown worker error'));
        }

        pendingTasksRef.current.delete(id);
      };

      workerRef.current.onerror = (error) => {
        console.error('PDF Worker error:', error);
        // Reject all pending tasks
        pendingTasksRef.current.forEach((task) => {
          task.reject(new Error('Worker crashed'));
        });
        pendingTasksRef.current.clear();
      };
    } catch (error) {
      console.error('Failed to initialize PDF worker:', error);
      // Worker not supported, operations will fall back to main thread
    }
  }, [options]);

  const executeTask = useCallback(
    async (type: WorkerMessage['type'], payload: any): Promise<Blob> => {
      initWorker();

      // If worker is not available, throw error (caller should handle fallback)
      if (!workerRef.current) {
        throw new Error('PDF Worker not available');
      }

      const id = `task_${Date.now()}_${Math.random()}`;

      return new Promise<Blob>((resolve, reject) => {
        pendingTasksRef.current.set(id, { resolve, reject });

        const message: WorkerMessage = { id, type, payload };
        workerRef.current!.postMessage(message);
      });
    },
    [initWorker]
  );

  const mergePDFs = useCallback(
    async (fileBlobs: Blob[]): Promise<Blob> => {
      const fileBuffers = await Promise.all(
        fileBlobs.map((blob) => blob.arrayBuffer())
      );
      return executeTask('merge', { fileBuffers });
    },
    [executeTask]
  );

  const extractPages = useCallback(
    async (blob: Blob, pageNumbers: number[]): Promise<Blob> => {
      const buffer = await blob.arrayBuffer();
      return executeTask('extract', { buffer, pageNumbers });
    },
    [executeTask]
  );

  const reorderPages = useCallback(
    async (blob: Blob, newOrder: number[]): Promise<Blob> => {
      const buffer = await blob.arrayBuffer();
      return executeTask('reorder', { buffer, newOrder });
    },
    [executeTask]
  );

  const deletePages = useCallback(
    async (blob: Blob, pageNumbers: number[]): Promise<Blob> => {
      const buffer = await blob.arrayBuffer();
      return executeTask('delete', { buffer, pageNumbers });
    },
    [executeTask]
  );

  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    pendingTasksRef.current.clear();
  }, []);

  return {
    mergePDFs,
    extractPages,
    reorderPages,
    deletePages,
    cleanup,
    isWorkerSupported: typeof Worker !== 'undefined',
  };
};
