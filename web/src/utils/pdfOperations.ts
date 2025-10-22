// PDF operation utilities

import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Load PDF from blob
 */
export async function loadPDF(blob: Blob): Promise<PDFDocument> {
  const arrayBuffer = await blob.arrayBuffer();
  return PDFDocument.load(arrayBuffer);
}

/**
 * Merge multiple PDFs in given order
 */
export async function mergePDFs(fileBlobs: Blob[]): Promise<Blob> {
  const merged = await PDFDocument.create();

  for (const blob of fileBlobs) {
    const doc = await loadPDF(blob);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const mergedBytes = await merged.save();
  return new Blob([mergedBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Extract specific pages from PDF
 */
export async function extractPages(blob: Blob, pageNumbers: number[]): Promise<Blob> {
  const doc = await loadPDF(blob);
  const extracted = await PDFDocument.create();

  // Validate page numbers
  const validPages = pageNumbers.filter(
    (p) => p >= 1 && p <= doc.getPageCount()
  );

  if (validPages.length === 0) {
    throw new Error('No valid page numbers provided');
  }

  // Copy pages (adjust for 0-based indexing)
  const pagesToCopy = await extracted.copyPages(doc, validPages.map((p) => p - 1));
  pagesToCopy.forEach((page) => extracted.addPage(page));

  const extractedBytes = await extracted.save();
  return new Blob([extractedBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Split PDF at specific page numbers
 */
export async function splitPDF(blob: Blob, splitPoints: number[]): Promise<Blob[]> {
  const doc = await loadPDF(blob);
  const totalPages = doc.getPageCount();
  const results: Blob[] = [];

  // Add 0 at start and end if not present
  const points = [0, ...splitPoints.filter((p) => p > 0 && p < totalPages), totalPages];
  const unique = Array.from(new Set(points)).sort((a, b) => a - b);

  for (let i = 0; i < unique.length - 1; i++) {
    const start = unique[i];
    const end = unique[i + 1];
    const pageIndices = Array.from({ length: end - start }, (_, idx) => start + idx);

    const part = await PDFDocument.create();
    const copiedPages = await part.copyPages(doc, pageIndices);
    copiedPages.forEach((page) => part.addPage(page));

    const bytes = await part.save();
    results.push(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  }

  return results;
}

/**
 * Rotate pages
 */
export async function rotatePages(
  blob: Blob,
  pageNumbers: number[],
  degrees: number
): Promise<Blob> {
  const doc = await loadPDF(blob);
  const validPages = pageNumbers.filter(
    (p) => p >= 1 && p <= doc.getPageCount()
  );

  for (const pageNum of validPages) {
    const page = doc.getPage(pageNum - 1);
    const currentRotation = page.getRotation().angle;
    page.setRotation({ angle: (currentRotation + degrees) % 360, type: 'degrees' } as any);
  }

  const rotatedBytes = await doc.save();
  return new Blob([rotatedBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Reorder pages
 */
export async function reorderPages(blob: Blob, newOrder: number[]): Promise<Blob> {
  const doc = await loadPDF(blob);
  const totalPages = doc.getPageCount();

  // Validate new order
  if (newOrder.length !== totalPages || !newOrder.every((p) => p >= 1 && p <= totalPages)) {
    throw new Error('Invalid page order');
  }

  // Create new document with reordered pages
  const reordered = await PDFDocument.create();
  const pageIndices = newOrder.map((p) => p - 1);
  const copiedPages = await reordered.copyPages(doc, pageIndices);
  copiedPages.forEach((page) => reordered.addPage(page));

  const reorderedBytes = await reordered.save();
  return new Blob([reorderedBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Delete pages
 */
export async function deletePages(blob: Blob, pageNumbers: number[]): Promise<Blob> {
  const doc = await loadPDF(blob);
  const totalPages = doc.getPageCount();

  // Sort in descending order to delete from end first
  const pagesToDelete = pageNumbers
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => b - a);

  for (const pageNum of pagesToDelete) {
    doc.removePage(pageNum - 1);
  }

  const deletedBytes = await doc.save();
  return new Blob([deletedBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Add watermark text to PDF
 */
export async function addWatermark(
  blob: Blob,
  text: string,
  options: {
    opacity?: number;
    rotation?: number;
    fontSize?: number;
    color?: [number, number, number];
  } = {}
): Promise<Blob> {
  const doc = await loadPDF(blob);
  const { opacity = 0.3, rotation = -45, fontSize = 60, color = [200, 200, 200] } = options;

  const pages = doc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();

    page.drawText(text, {
      x: width / 2 - text.length * 3,
      y: height / 2,
      size: fontSize,
      color: rgb(...color),
      opacity,
      rotate: rotation as any,
    });
  }

  const watermarkedBytes = await doc.save();
  return new Blob([watermarkedBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Get PDF page count
 */
export async function getPDFPageCount(blob: Blob): Promise<number> {
  const doc = await loadPDF(blob);
  return doc.getPageCount();
}

/**
 * Parse page range string (e.g., "1,3-5,7")
 */
export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  const pages = new Set<number>();

  const parts = rangeStr.split(',').map((p) => p.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map((p) => parseInt(p.trim()));
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(part);
      if (!Number.isNaN(page) && page >= 1 && page <= maxPages) {
        pages.add(page);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Validate page numbers
 */
export function validatePageNumbers(pages: number[], maxPages: number): boolean {
  return pages.every((p) => Number.isInteger(p) && p >= 1 && p <= maxPages);
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
