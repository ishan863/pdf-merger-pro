// PDF Worker for offloading heavy PDF operations
import { PDFDocument } from 'pdf-lib';

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

// Helper to load PDF from array buffer
async function loadPDF(arrayBuffer: ArrayBuffer): Promise<PDFDocument> {
  return PDFDocument.load(arrayBuffer);
}

// Merge multiple PDFs
async function mergePDFs(fileBuffers: ArrayBuffer[]): Promise<Blob> {
  const merged = await PDFDocument.create();

  for (let i = 0; i < fileBuffers.length; i++) {
    const doc = await loadPDF(fileBuffers[i]);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));

    // Send progress update
    self.postMessage({
      type: 'progress',
      progress: ((i + 1) / fileBuffers.length) * 100,
    });
  }

  const mergedBytes = await merged.save();
  return new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
}

// Extract specific pages
async function extractPages(buffer: ArrayBuffer, pageNumbers: number[]): Promise<Blob> {
  const doc = await loadPDF(buffer);
  const extracted = await PDFDocument.create();

  const validPages = pageNumbers.filter((p) => p >= 1 && p <= doc.getPageCount());
  const pagesToCopy = await extracted.copyPages(doc, validPages.map((p) => p - 1));
  pagesToCopy.forEach((page) => extracted.addPage(page));

  const extractedBytes = await extracted.save();
  return new Blob([extractedBytes as BlobPart], { type: 'application/pdf' });
}

// Reorder pages
async function reorderPages(buffer: ArrayBuffer, newOrder: number[]): Promise<Blob> {
  const doc = await loadPDF(buffer);
  const reordered = await PDFDocument.create();

  const pageIndices = newOrder.map((p) => p - 1);
  const copiedPages = await reordered.copyPages(doc, pageIndices);
  copiedPages.forEach((page) => reordered.addPage(page));

  const reorderedBytes = await reordered.save();
  return new Blob([reorderedBytes as BlobPart], { type: 'application/pdf' });
}

// Delete pages
async function deletePages(buffer: ArrayBuffer, pageNumbers: number[]): Promise<Blob> {
  const doc = await loadPDF(buffer);
  const totalPages = doc.getPageCount();

  const pagesToDelete = pageNumbers
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => b - a);

  for (const pageNum of pagesToDelete) {
    doc.removePage(pageNum - 1);
  }

  const deletedBytes = await doc.save();
  return new Blob([deletedBytes as BlobPart], { type: 'application/pdf' });
}

// Main message handler
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    let result: Blob | undefined;

    switch (type) {
      case 'merge':
        result = await mergePDFs(payload.fileBuffers);
        break;
      case 'extract':
        result = await extractPages(payload.buffer, payload.pageNumbers);
        break;
      case 'reorder':
        result = await reorderPages(payload.buffer, payload.newOrder);
        break;
      case 'delete':
        result = await deletePages(payload.buffer, payload.pageNumbers);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    const response: WorkerResponse = {
      id,
      success: true,
      result,
    };

    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    self.postMessage(response);
  }
});

export {};
